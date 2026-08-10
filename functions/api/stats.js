/* =========================================================================
   煌盛興業 EGRRA — 數據統計彙整（Cloudflare Pages Function / D1，後台用需密碼）
   端點路徑：/api/stats
   ---------------------------------------------------------------------------
   用法：POST { password, days }   days = 追溯天數（預設 14，上限 90）
         POST { password, reset:true }   清除所有統計資料

   ★ 這支是搬家最大的簡化 ★
     Vercel Blob 版必須讀 stats/<日期>/ 底下上百個小檔、在 JS 裡逐筆加總，
     還得額外做一套「已結束的日期壓縮成 stats/daily/<日期>.json、壓縮成功
     後刪除原始檔」的機制，否則每位訪客每頁留一個小檔會無限累積。

     那整套機制在 Cloudflare 免費方案下根本不可行 —— 每次呼叫只有 10 ms
     CPU，光是解析幾百份 JSON 就爆了。改成 D1 之後彙總在資料庫裡做，
     Worker 只負責把結果轉成回應格式，壓縮與清檔的機制整個可以拿掉。

   events 與 sections 存的是 JSON 字串，用 SQLite 的 json_each() 展開後
   一樣在資料庫裡 GROUP BY —— 不要拉回 Worker 用 JS 解析，那是 CPU 殺手。
   ========================================================================= */

import { json, checkPw } from "../_lib/store.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/* 以台灣時間分日，後台看到的「今天」才符合直覺 */
function twDate(ms) {
  return new Date((ms || Date.now()) + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

/* D1 回傳的 results 統一轉成 [{name,count}] */
function rows(r) {
  return ((r && r.results) || []).map((x) => ({ name: String(x.name), count: Number(x.count) || 0 }));
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.EGRRA_DB) {
    return json({ error: "server_not_configured", detail: "缺 ADMIN_PASSWORD 或 D1 尚未綁定（EGRRA_DB）" },
      { status: 500, headers: CORS });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (!checkPw(env, body.password)) return json({ error: "bad_password" }, { status: 401, headers: CORS });

    const db = env.EGRRA_DB;

    /* ---- 清除所有統計資料（測試期間的數據不留） ---- */
    if (body.reset === true) {
      const r = await db.prepare("DELETE FROM sessions").run();
      return json({ ok: true, reset: true, removed: (r.meta && r.meta.changes) || 0 }, { headers: CORS });
    }

    const days = Math.max(1, Math.min(parseInt(body.days, 10) || 14, 90));
    const today = twDate();
    const from = twDate(Date.now() - (days - 1) * 86400000);

    /* 一次 batch 送出，省往返；彙總全部在 D1 裡完成 */
    const [sum, series, pages, devices, sources, langs, events, sections] = await db.batch([
      db.prepare(
        `SELECT COUNT(DISTINCT sid) AS sessions, COUNT(*) AS views,
                COALESCE(SUM(sec),0) AS secs, COALESCE(SUM(scroll),0) AS scrolls
         FROM sessions WHERE day >= ?1`).bind(from),
      db.prepare(
        `SELECT day AS date, COUNT(DISTINCT sid) AS sessions, COUNT(*) AS views
         FROM sessions WHERE day >= ?1 GROUP BY day ORDER BY day`).bind(from),
      db.prepare(
        `SELECT page AS name, COUNT(*) AS count FROM sessions WHERE day >= ?1
         GROUP BY page ORDER BY count DESC LIMIT 12`).bind(from),
      db.prepare(
        `SELECT device AS name, COUNT(*) AS count FROM sessions WHERE day >= ?1
         GROUP BY device ORDER BY count DESC LIMIT 5`).bind(from),
      db.prepare(
        `SELECT source AS name, COUNT(*) AS count FROM sessions WHERE day >= ?1
         GROUP BY source ORDER BY count DESC LIMIT 10`).bind(from),
      db.prepare(
        `SELECT lang AS name, COUNT(*) AS count FROM sessions WHERE day >= ?1
         GROUP BY lang ORDER BY count DESC LIMIT 3`).bind(from),
      /* events 是 {"名稱":次數} 的 JSON，展開後把次數加總 */
      db.prepare(
        `SELECT je.key AS name, SUM(CAST(je.value AS INTEGER)) AS count
         FROM sessions, json_each(sessions.events) AS je
         WHERE sessions.day >= ?1 GROUP BY je.key ORDER BY count DESC LIMIT 20`).bind(from),
      /* sections 是 ["名稱",...] 的 JSON，展開後數出現次數 */
      db.prepare(
        `SELECT je.value AS name, COUNT(*) AS count
         FROM sessions, json_each(sessions.sections) AS je
         WHERE sessions.day >= ?1 GROUP BY je.value ORDER BY count DESC LIMIT 12`).bind(from),
    ]);

    const s = (sum.results && sum.results[0]) || { sessions: 0, views: 0, secs: 0, scrolls: 0 };
    const views = Number(s.views) || 0;

    /* 沒有資料的日子 D1 不會回，這裡補零，前端畫折線才不會斷掉 */
    const byDay = {};
    ((series.results) || []).forEach((r) => { byDay[r.date] = r; });
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = twDate(Date.now() - i * 86400000);
      const r = byDay[d];
      out.push({ date: d, sessions: Number(r && r.sessions) || 0, views: Number(r && r.views) || 0 });
    }

    return json({
      ok: true,
      range: { days, from, to: today },
      summary: {
        sessions: Number(s.sessions) || 0,
        views,
        avgSec: views ? Math.round(Number(s.secs) / views) : 0,
        avgScroll: views ? Math.round(Number(s.scrolls) / views) : 0,
      },
      series: out,
      pages: rows(pages),
      events: rows(events),
      sections: rows(sections),
      devices: rows(devices),
      sources: rows(sources),
      langs: rows(langs),
    }, { headers: CORS });
  } catch (e) {
    return json({ error: "server_error", detail: String((e && e.message) || e) }, { status: 500, headers: CORS });
  }
}
