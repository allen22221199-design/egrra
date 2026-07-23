/* =========================================================================
   煌盛興業 EGRRA — 官網讀取「已發布內容」的端點 (Vercel Serverless Function)
   端點路徑：/api/published
   ---------------------------------------------------------------------------
   官網頁面在 <script src="site-data.js">（靜態預設值）之後，再載入
   <script src="/api/published">，由本端點把 Blob 裡「已發布」的內容覆蓋上去。

   ★ 版本保護（重要）：
     比對 Blob 快照的 dataVersion 與線上 site-data.js 的 dataVersion。
     若快照較舊（或沒有版本欄位）→ 視為過期，輸出 no-op，官網沿用程式端新內容。
     這可避免「後台舊快照把後來在程式端更新的內容整個蓋掉」。

   ・有較新發布資料 → 輸出 window.EGRRA_DEFAULT_DATA = {...};（覆蓋預設）
   ・沒有 / 過期 / 未設定 / 發生錯誤 → 輸出註解（no-op），沿用靜態預設值，絕不壞。
   ========================================================================= */

import { list } from "@vercel/blob";

const BLOB_PATH = "site-data.json";
/* U+2028 / U+2029：JSON 合法但舊版 JS 視為換行，輸出前需轉義（用 fromCharCode 保持原始碼純 ASCII） */
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 4000);
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(200).send("/* EGRRA: blob 未設定，使用預設內容 */");
    }
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1, abortSignal: ac.signal });
    const b = blobs && blobs[0];
    if (!b || !b.url) {
      return res.status(200).send("/* EGRRA: 尚無已發布內容，使用預設內容 */");
    }
    const r = await fetch(b.url, { cache: "no-store", signal: ac.signal });
    if (!r.ok) {
      return res.status(200).send("/* EGRRA: 讀取已發布內容失敗，使用預設內容 */");
    }
    const json = (await r.text()).trim();
    if (!json || json[0] !== "{") {
      return res.status(200).send("/* EGRRA: 已發布內容格式異常，使用預設內容 */");
    }

    /* ---- 版本比對：抓線上 site-data.js 的 dataVersion ---- */
    let staticVer = "";
    try {
      const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const sd = await fetch(proto + "://" + host + "/site-data.js", { signal: ac.signal });
      if (sd.ok) {
        const m = (await sd.text()).match(/dataVersion\s*:\s*["']([^"']+)["']/);
        if (m) staticVer = m[1];
      }
    } catch (e) { /* 抓不到就不擋，維持原本行為 */ }

    let blobVer = "";
    const bm = json.match(/"dataVersion"\s*:\s*"([^"]+)"/);
    if (bm) blobVer = bm[1];

    if (staticVer && blobVer < staticVer) {
      return res.status(200).send(
        "/* EGRRA: 已發布快照版本較舊(" + (blobVer || "無版本") + " < " + staticVer +
        ")，已忽略，使用程式端最新內容。要改用後台內容請重新按一次「發布上線」。 */");
    }

    const safe = json.split(LS).join("\\u2028").split(PS).join("\\u2029");
    return res.status(200).send("window.EGRRA_PUBLISHED=true;window.EGRRA_DEFAULT_DATA = " + safe + ";");
  } catch (e) {
    const msg = String((e && e.message) || e).replace(/\*\//g, "* /");
    return res.status(200).send("/* EGRRA: 讀取發生例外，使用預設內容：" + msg + " */");
  } finally {
    clearTimeout(timer);
  }
}
