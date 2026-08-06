/* =========================================================================
   煌盛興業 EGRRA — 產業新聞：官網讀取 ＋ 後台審核（Vercel Serverless Function）
   ---------------------------------------------------------------------------
   GET  /api/news                 → 官網用：只回傳「已發布」的項目
   GET  /api/news?all=1&key=密碼   → 後台用：回傳全部（含待審、已略過）
   POST /api/news  { password, action, ... }
        action="publish" { ids }        待審 → 已發布
        action="reject"  { ids }        待審 → 已略過（不刪，避免下次又抓回來）
        action="update"  { id, angle }  修改關聯文字
        action="delete"  { ids }        真的移除
   ========================================================================= */

import { put, list } from "@vercel/blob";

const BLOB_PATH = "news/queue.json";
const CONFIG_PATH = "news/config.json";

/* 追蹤主題設定。與 news-fetch.js 共用同一份預設值，
   使用者在後台調整後存成 news/config.json，蒐集時以那份為準。 */
const DEFAULT_TOPICS = [
  { key: "土方與工期", on: true, qs: ["土方之亂", "營建剩餘土石方 去化", "土資場 棄土", "營建 缺工 缺料 工期"] },
  { key: "防火法規", on: true, qs: ["防火門 法規", "防火門 消防 安檢", "防火區劃 建築技術規則", "消防安全設備 檢修"] },
  { key: "耐燃安全", on: true, qs: ["耐燃 建材", "建材 防火 認證", "耐燃一級", "外牆 建材 火災"] },
  { key: "綠建材低碳", on: true, qs: ["綠建材標章", "低碳建材", "建材 減碳 淨零", "循環建材 再生"] },
  { key: "室內設計", on: true, qs: ["室內設計 趨勢", "空間設計 材質", "商空 裝修 設計", "飯店 翻新 設計"] },
  { key: "公設與都更", on: true, qs: ["社區 公設 修繕", "危老 都更 外牆", "老屋 翻新 公寓", "物業管理 公共空間"] },
  { key: "健康建材", on: true, qs: ["甲醛 建材 檢測", "抗菌 建材 醫療", "室內空氣品質 裝修", "長照 空間 建材"] },
];

async function loadTopics() {
  try {
    const { blobs } = await list({ prefix: CONFIG_PATH, limit: 1 });
    if (blobs?.[0]?.url) {
      const r = await fetch(blobs[0].url + "?t=" + Date.now(), { cache: "no-store" });
      if (r.ok) {
        const c = await r.json();
        if (Array.isArray(c.topics) && c.topics.length) return c.topics;
      }
    }
  } catch (e) { /* 沒有設定檔就用預設 */ }
  return DEFAULT_TOPICS;
}

async function load() {
  const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
  if (!blobs?.[0]?.url) return { updated: "", items: [] };
  /* 加上時間戳打掉 CDN 快取。先前寫入時設了 cacheControlMaxAge 60，
     刪除後一分鐘內重新讀取會拿到舊版本，項目又跑出來，
     看起來就像「刪不掉」—— 其實是讀到了舊快照。 */
  const r = await fetch(blobs[0].url + "?t=" + Date.now(), { cache: "no-store" });
  if (!r.ok) return { updated: "", items: [] };
  const d = await r.json();
  return { updated: d.updated || "", items: Array.isArray(d.items) ? d.items : [] };
}

async function save(data) {
  await put(BLOB_PATH, JSON.stringify(data), {
    access: "public", addRandomSuffix: false, allowOverwrite: true,
    /* 後台審核資料改動頻繁且只有少數人讀取，不要讓 CDN 快取 */
    contentType: "application/json; charset=utf-8", cacheControlMaxAge: 0,
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    /* 尚未設定也不要讓官網壞掉，回空清單即可 */
    return res.status(200).json({ items: [], updated: "" });
  }

  try {
    if (req.method === "GET") {
      const data = await load();
      if (req.query && req.query.config) {
        if ((req.query.key || "") !== process.env.ADMIN_PASSWORD)
          return res.status(401).json({ error: "bad_password" });
        return res.status(200).json({ topics: await loadTopics() });
      }
      const wantAll = req.query && req.query.all;
      if (wantAll) {
        if ((req.query.key || "") !== process.env.ADMIN_PASSWORD)
          return res.status(401).json({ error: "bad_password" });
        return res.status(200).json(data);
      }
      /* 官網：只給已發布，且不外流內部欄位 */
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return res.status(200).json({
        updated: data.updated,
        items: data.items
          .filter(x => x.status === "published")
          .sort((a, b) => String(b.publishedAt || b.addedAt || "").localeCompare(
                          String(a.publishedAt || a.addedAt || "")))
          .map(({ id, title, body, topic, sources, publishedAt }) =>
               ({ id, title, body, topic, publishedAt,
                  sources: (sources || []).map(({ title, source, url, date }) =>
                                              ({ title, source, url, date })) })),
      });
    }

    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if ((body.password || "") !== process.env.ADMIN_PASSWORD)
      return res.status(401).json({ error: "bad_password" });

    const data = await load();
    const ids = new Set(Array.isArray(body.ids) ? body.ids : (body.id ? [body.id] : []));
    const now = new Date().toISOString();
    let n = 0;

    if (body.action === "publish") {
      data.items.forEach(x => {
        if (ids.has(x.id)) { x.status = "published"; x.publishedAt = now; n++; }
      });
    } else if (body.action === "reject") {
      /* 標記而非刪除：刪掉的話下次抓取會因為 id 不在佇列裡而重新收進來 */
      data.items.forEach(x => { if (ids.has(x.id)) { x.status = "rejected"; n++; } });
    } else if (body.action === "update") {
      data.items.forEach(x => {
        if (ids.has(x.id)) {
          if (typeof body.body === "string") x.body = body.body.slice(0, 4000);
          if (typeof body.title === "string" && body.title.trim()) x.title = body.title.slice(0, 200);
          x.editedAt = now;
          n++;
        }
      });
    } else if (body.action === "delete") {
      const before = data.items.length;
      data.items = data.items.filter(x => !ids.has(x.id));
      n = before - data.items.length;
    } else if (body.action === "topics") {
      const ts = (Array.isArray(body.topics) ? body.topics : [])
        .map(t => ({
          key: String(t.key || "").slice(0, 20),
          on: t.on !== false,
          qs: (Array.isArray(t.qs) ? t.qs : [])
            .map(q => String(q || "").trim()).filter(Boolean).slice(0, 8),
        }))
        .filter(t => t.key && t.qs.length);
      if (!ts.length) return res.status(400).json({ error: "no_topics", detail: "至少要留一個主題" });
      await put(CONFIG_PATH, JSON.stringify({ topics: ts, updated: now }), {
        access: "public", addRandomSuffix: false, allowOverwrite: true,
        contentType: "application/json; charset=utf-8", cacheControlMaxAge: 0,
      });
      return res.status(200).json({ ok: true, changed: ts.length });
    } else {
      return res.status(400).json({ error: "unknown_action" });
    }

    await save(data);
    return res.status(200).json({ ok: true, changed: n });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
