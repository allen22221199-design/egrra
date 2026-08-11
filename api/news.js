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
      /* 主題設定不需要讀佇列，先處理掉，省一次 Blob 讀取 */
      if (req.query && req.query.config) {
        if ((req.query.key || "") !== process.env.ADMIN_PASSWORD)
          return res.status(401).json({ error: "bad_password" });
        {
          let auto = true;
          try {
            const { blobs } = await list({ prefix: CONFIG_PATH, limit: 1 });
            if (blobs?.[0]?.url) {
              const r = await fetch(blobs[0].url + "?t=" + Date.now(), { cache: "no-store" });
              if (r.ok) { const c = await r.json(); if (typeof c.autoPublish === "boolean") auto = c.autoPublish; }
            }
          } catch (e) {}
          return res.status(200).json({ topics: await loadTopics(), autoPublish: auto });
        }
      }
      const data = await load();
      const wantAll = req.query && req.query.all;
      if (wantAll) {
        if ((req.query.key || "") !== process.env.ADMIN_PASSWORD)
          return res.status(401).json({ error: "bad_password" });
        return res.status(200).json(data);
      }
      /* 診斷用的彙總：只有數量，不含任何內容，不需要密碼。
         「發布了但官網沒出現」時，靠這個就能分辨是沒寫進去、
         還是寫進去但被快取擋住。 */
      const counts = { pending: 0, published: 0, rejected: 0, other: 0, emptyBody: 0, aiFailed: 0 };
      for (const x of data.items) {
        (counts[x.status] !== undefined ? counts[x.status]++ : counts.other++);
        if (!x.body || !String(x.body).trim()) counts.emptyBody++;
        if (x.aiOk === false) counts.aiFailed++;
      }
      if (req.query && req.query.stat) {
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({
          updated: data.updated, total: data.items.length, counts,
          /* id 是 Google News 的不透明識別碼，不含個資，列出來方便比對 */
          ids: data.items.slice(0, 10).map(x => ({ id: x.id, status: x.status, hasBody: !!(x.body||'').trim() })),
        });
      }

      /* 官網：只給已發布，且不外流內部欄位。
         快取時間壓短 —— 發布後要等好幾分鐘才看得到，會讓人以為沒發布成功。 */
      res.setHeader("Cache-Control", "public, s-maxage=20, stale-while-revalidate=40");
      return res.status(200).json({
        updated: data.updated, counts,
        items: data.items
          .filter(x => x.status === "published")
          .sort((a, b) => String(b.publishedAt || b.addedAt || "").localeCompare(
                          String(a.publishedAt || a.addedAt || "")))
          .map(({ id, title, body, topic, sources, srcCount, publishedAt }) =>
               ({ id, title, body, topic, publishedAt,
                  srcCount: srcCount || (sources || []).length,
                  /* 舊資料可能存了二三十則，這裡再擋一次 */
                  sources: (sources || []).slice(0, 6).map(({ title, source, url, date }) =>
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
    } else if (body.action === "save") {
      /* 內容與狀態一次改完。
         先前發布要送兩個請求（先 update 再 publish），每個都是
         「讀取 → 修改 → 整份寫回」；兩次寫入之間 Blob 若還沒同步，
         後一次會讀到舊資料而把前一次蓋掉，發布就這樣消失。
         合併成一次就沒有這個競態，往返也少一趟。 */
      const st = body.status;
      data.items.forEach(x => {
        if (!ids.has(x.id)) return;
        if (typeof body.body === "string") x.body = body.body.slice(0, 4000);
        if (typeof body.title === "string" && body.title.trim()) x.title = body.title.slice(0, 200);
        if (st === "published" || st === "rejected" || st === "pending") {
          x.status = st;
          if (st === "published") x.publishedAt = now;
        }
        x.editedAt = now;
        n++;
      });
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
      /* autoPublish 與主題共用同一個設定檔。沒帶這個欄位就沿用原值 ——
         直接寫死 true/false 會讓「只改主題」的動作順手把自動上線的設定改掉。 */
      let auto = true;
      try {
        const { blobs } = await list({ prefix: CONFIG_PATH, limit: 1 });
        if (blobs?.[0]?.url) {
          const r = await fetch(blobs[0].url + "?t=" + Date.now(), { cache: "no-store" });
          if (r.ok) { const c = await r.json(); if (typeof c.autoPublish === "boolean") auto = c.autoPublish; }
        }
      } catch (e) { /* 讀不到就用預設 */ }
      if (typeof body.autoPublish === "boolean") auto = body.autoPublish;
      await put(CONFIG_PATH, JSON.stringify({ topics: ts, autoPublish: auto, updated: now }), {
        access: "public", addRandomSuffix: false, allowOverwrite: true,
        contentType: "application/json; charset=utf-8", cacheControlMaxAge: 0,
      });
      return res.status(200).json({ ok: true, changed: ts.length, autoPublish: auto });
    } else {
      return res.status(400).json({ error: "unknown_action" });
    }

    await save(data);
    /* 回報收到什麼、比對到什麼 —— 「按了沒反應」時要能立刻分辨
       是請求沒送到、id 對不上、還是真的沒有符合的項目。 */
    return res.status(200).json({
      ok: true, changed: n,
      received: [...ids],
      known: data.items.slice(0, 50).map(x => x.id),
    });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
