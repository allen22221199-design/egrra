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
    } else {
      return res.status(400).json({ error: "unknown_action" });
    }

    await save(data);
    return res.status(200).json({ ok: true, changed: n });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
