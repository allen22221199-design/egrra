/* =========================================================================
   煌盛興業 EGRRA — 數據追蹤收集端
   ---------------------------------------------------------------------------
   前端 tracker.js 於離開頁面時送出該次工作階段(session)的摘要，這裡寫入 Blob。

   儲存路徑：stats/<台灣日期>/<sid>_<page>.json
   ★ 每個 session＋頁面各自擁有一個檔案，只會覆寫自己那份 →
     多人同時瀏覽也不會互相覆蓋（Blob 沒有原子累加，共用計數檔必然掉資料）。

   不儲存 IP、不寫 cookie、不含任何個資。
   ========================================================================= */

import { put } from "@vercel/blob";

const MAX_BODY = 8000;               /* 單筆上限，避免灌爆 */
const OK_DEVICE = ["mobile", "tablet", "desktop"];

/* 以台灣時間分日，後台看到的「今天」才符合直覺 */
function twDate(d = new Date()) {
  const tw = new Date(d.getTime() + 8 * 3600 * 1000);
  return tw.toISOString().slice(0, 10);
}
function clean(s, max = 60) {
  return String(s == null ? "" : s).replace(/[^\w一-鿿./#@ -]/g, "").slice(0, max);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(200).json({ ok: false });

  try {
    let body = req.body;
    if (typeof body === "string") {
      if (body.length > MAX_BODY) return res.status(200).json({ ok: false });
      body = JSON.parse(body || "{}");
    }
    if (!body || typeof body !== "object") return res.status(200).json({ ok: false });

    const sid = clean(body.sid, 40);
    if (!sid) return res.status(200).json({ ok: false });

    /* 只保留白名單內、且經過清理的欄位 */
    const evIn = body.events && typeof body.events === "object" ? body.events : {};
    const events = {};
    Object.keys(evIn).slice(0, 40).forEach((k) => {
      const n = parseInt(evIn[k], 10);
      if (n > 0) events[clean(k, 32)] = Math.min(n, 999);
    });

    const rec = {
      sid,
      page: clean(body.page, 80) || "/",
      sec: Math.max(0, Math.min(parseInt(body.sec, 10) || 0, 3600)),
      scroll: Math.max(0, Math.min(parseInt(body.scroll, 10) || 0, 100)),
      device: OK_DEVICE.includes(body.device) ? body.device : "desktop",
      source: clean(body.source, 40) || "direct",
      lang: body.lang === "en" ? "en" : "zh",
      events,
      sections: Array.isArray(body.sections) ? body.sections.slice(0, 20).map((s) => clean(s, 24)) : [],
      ts: Date.now(),
    };

    const day = twDate();
    const safePage = rec.page.replace(/[^\w]/g, "_").slice(0, 40) || "root";
    await put(`stats/${day}/${sid}_${safePage}.json`, JSON.stringify(rec), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,          /* 同一 session 同一頁：更新自己那份 */
      contentType: "application/json; charset=utf-8",
      cacheControlMaxAge: 60,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    /* 追蹤失敗絕不影響網站；一律回 200 */
    return res.status(200).json({ ok: false });
  }
}
