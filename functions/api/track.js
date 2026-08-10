/* =========================================================================
   煌盛興業 EGRRA — 數據追蹤收集端（Cloudflare Pages Function / D1）
   端點路徑：/api/track
   ---------------------------------------------------------------------------
   前端 tracker.js 於離開頁面時送出該次工作階段(session)的摘要。

   ★ 與 Vercel 版的差異 ★
     Vercel 版是「每個 session＋頁面各存一個 Blob 檔案」，因為 Blob 沒有原子
     更新，共用一個計數檔必然掉資料。D1 是 SQLite，有交易保證，改成一張表加
     (sid, page) 主鍵 + ON CONFLICT，語意一樣但乾淨得多，也不會累積上萬個
     小檔案拖慢後台的列表查詢。

   為什麼不放 KV：這支是每個 session 每頁寫一筆，KV 免費方案每天只有 1000 次
   寫入，會被瀏覽量直接吃掉。D1 免費是每天 10 萬次寫入。

   不儲存 IP、不寫 cookie、不含任何個資。
   追蹤失敗絕不影響網站 —— 一律回 200。
   ========================================================================= */

import { json } from "../_lib/store.js";

const MAX_BODY = 8000;               /* 單筆上限，避免灌爆 */
const OK_DEVICE = ["mobile", "tablet", "desktop"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/* 以台灣時間分日，後台看到的「今天」才符合直覺 */
function twDate() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}
function clean(s, max) {
  return String(s == null ? "" : s).replace(/[^\w一-鿿./#@ -]/g, "").slice(0, max || 60);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.EGRRA_DB) return json({ ok: false }, { headers: CORS });

    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ ok: false }, { headers: CORS });
    const body = JSON.parse(raw || "{}");
    if (!body || typeof body !== "object") return json({ ok: false }, { headers: CORS });

    const sid = clean(body.sid, 40);
    if (!sid) return json({ ok: false }, { headers: CORS });

    /* 只保留白名單內、且經過清理的欄位 */
    const evIn = body.events && typeof body.events === "object" ? body.events : {};
    const events = {};
    Object.keys(evIn).slice(0, 40).forEach((k) => {
      const n = parseInt(evIn[k], 10);
      if (n > 0) events[clean(k, 32)] = Math.min(n, 999);
    });

    const page = clean(body.page, 80) || "/";
    const sections = Array.isArray(body.sections)
      ? body.sections.slice(0, 20).map((s) => clean(s, 24)) : [];

    await env.EGRRA_DB.prepare(
      `INSERT INTO sessions (sid, page, day, sec, scroll, device, source, lang, events, sections, ts)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
       ON CONFLICT(sid, page) DO UPDATE SET
         sec=excluded.sec, scroll=excluded.scroll, device=excluded.device,
         source=excluded.source, lang=excluded.lang, events=excluded.events,
         sections=excluded.sections, ts=excluded.ts`
    ).bind(
      sid,
      page,
      twDate(),
      Math.max(0, Math.min(parseInt(body.sec, 10) || 0, 3600)),
      Math.max(0, Math.min(parseInt(body.scroll, 10) || 0, 100)),
      OK_DEVICE.includes(body.device) ? body.device : "desktop",
      clean(body.source, 40) || "direct",
      body.lang === "en" ? "en" : "zh",
      JSON.stringify(events),
      JSON.stringify(sections),
      Date.now()
    ).run();

    return json({ ok: true }, { headers: CORS });
  } catch (e) {
    /* 追蹤失敗絕不影響網站；一律回 200 */
    return json({ ok: false }, { headers: CORS });
  }
}
