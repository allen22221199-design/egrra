/* =========================================================================
   煌盛興業 EGRRA — 數據統計彙整（後台用，需密碼）
   ---------------------------------------------------------------------------
   讀取 stats/<日期>/ 下各 session 的記錄並彙總。
   為避免每次都讀上百個小檔，已結束的日期會壓縮成單一 stats/daily/<日期>.json，
   之後直接讀那份；「今天」仍即時彙整（因為還在變動）。

   用法：POST { password, days }   days = 追溯天數（預設 14，上限 90）
   ========================================================================= */

import { list, put } from "@vercel/blob";

function twDate(d = new Date()) {
  const tw = new Date(d.getTime() + 8 * 3600 * 1000);
  return tw.toISOString().slice(0, 10);
}
function emptyDay(date) {
  return { date, sessions: 0, views: 0, secs: 0, scrollSum: 0,
           pages: {}, events: {}, devices: {}, sources: {}, langs: {}, sections: {} };
}
function addTo(agg, r) {
  agg.views += 1;
  agg.secs += r.sec || 0;
  agg.scrollSum += r.scroll || 0;
  agg.pages[r.page] = (agg.pages[r.page] || 0) + 1;
  agg.devices[r.device] = (agg.devices[r.device] || 0) + 1;
  agg.sources[r.source] = (agg.sources[r.source] || 0) + 1;
  agg.langs[r.lang] = (agg.langs[r.lang] || 0) + 1;
  Object.keys(r.events || {}).forEach((k) => { agg.events[k] = (agg.events[k] || 0) + r.events[k]; });
  (r.sections || []).forEach((s) => { agg.sections[s] = (agg.sections[s] || 0) + 1; });
}
function mergeInto(t, d) {
  t.sessions += d.sessions; t.views += d.views; t.secs += d.secs; t.scrollSum += d.scrollSum;
  ["pages", "events", "devices", "sources", "langs", "sections"].forEach((k) => {
    Object.keys(d[k] || {}).forEach((n) => { t[k][n] = (t[k][n] || 0) + d[k][n]; });
  });
}
async function aggregateDay(date) {
  const agg = emptyDay(date);
  const seen = new Set();
  let cursor;
  do {
    const out = await list({ prefix: `stats/${date}/`, limit: 1000, cursor });
    for (const b of out.blobs) {
      try {
        const r = await (await fetch(b.url)).json();
        if (!r || !r.sid) continue;
        addTo(agg, r);
        seen.add(r.sid);
      } catch (e) { /* 單筆壞掉不影響整體 */ }
    }
    cursor = out.hasMore ? out.cursor : null;
  } while (cursor);
  agg.sessions = seen.size;
  return agg;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const ADMIN = process.env.ADMIN_PASSWORD;
  if (!ADMIN || !process.env.BLOB_READ_WRITE_TOKEN)
    return res.status(500).json({ error: "server_not_configured" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if ((body.password || "") !== ADMIN) return res.status(401).json({ error: "bad_password" });

    const days = Math.max(1, Math.min(parseInt(body.days, 10) || 14, 90));
    const today = twDate();

    /* 先把已壓縮的日檔載入索引，避免重複彙整 */
    const cached = {};
    try {
      const c = await list({ prefix: "stats/daily/", limit: 1000 });
      await Promise.all(c.blobs.map(async (b) => {
        const d = b.pathname.replace("stats/daily/", "").replace(".json", "");
        try { cached[d] = await (await fetch(b.url)).json(); } catch (e) {}
      }));
    } catch (e) {}

    const total = emptyDay("total");
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = twDate(new Date(Date.now() - i * 86400000));
      let day;
      if (d !== today && cached[d]) {
        day = cached[d];                       /* 已壓縮：直接用 */
      } else {
        day = await aggregateDay(d);
        if (d !== today && day.views > 0) {    /* 過完的日子壓縮存檔，之後免重算 */
          try {
            await put(`stats/daily/${d}.json`, JSON.stringify(day), {
              access: "public", addRandomSuffix: false, allowOverwrite: true,
              contentType: "application/json; charset=utf-8", cacheControlMaxAge: 3600,
            });
          } catch (e) {}
        }
      }
      series.push({ date: d, sessions: day.sessions, views: day.views });
      mergeInto(total, day);
    }

    const top = (o, n = 12) => Object.entries(o || {}).sort((a, b) => b[1] - a[1]).slice(0, n)
      .map(([name, count]) => ({ name, count }));

    return res.status(200).json({
      ok: true,
      range: { days, from: series[0] && series[0].date, to: today },
      summary: {
        sessions: total.sessions,
        views: total.views,
        avgSec: total.views ? Math.round(total.secs / total.views) : 0,
        avgScroll: total.views ? Math.round(total.scrollSum / total.views) : 0,
      },
      series,
      pages: top(total.pages),
      events: top(total.events, 20),
      sections: top(total.sections),
      devices: top(total.devices, 5),
      sources: top(total.sources, 10),
      langs: top(total.langs, 3),
    });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) });
  }
}
