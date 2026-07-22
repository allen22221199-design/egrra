/* =========================================================================
   煌盛興業 EGRRA — 官網讀取「已發布內容」的端點 (Vercel Serverless Function)
   端點路徑：/api/published
   ---------------------------------------------------------------------------
   官網頁面在 <script src="site-data.js">（靜態預設值）之後，再載入
   <script src="/api/published">，由本端點把 Blob 裡「已發布」的內容覆蓋上去。
   ・有發布資料 → 輸出 window.EGRRA_DEFAULT_DATA = {...};（覆蓋預設）
   ・沒有 / 未設定 / 發生錯誤 → 輸出一段註解（no-op），官網沿用靜態預設值，絕不壞。
   ========================================================================= */

import { list } from "@vercel/blob";

const BLOB_PATH = "site-data.json";
// U+2028 / U+2029：JSON 合法但舊版 JS 視為換行，輸出前需轉義（用 fromCharCode 產生，保持原始碼純 ASCII）
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  // 邊緣快取 60 秒，發布後約 1 分鐘全站更新；背景再驗證避免延遲
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

  // 逾時保護：最多等 3 秒，避免函式卡住拖住整頁渲染（阻塞式 script）
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 3000);
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
    // 簡單驗證是 JSON 物件，避免注入非法內容
    if (!json || json[0] !== "{") {
      return res.status(200).send("/* EGRRA: 已發布內容格式異常，使用預設內容 */");
    }
    const safe = json.split(LS).join("\\u2028").split(PS).join("\\u2029");
    // EGRRA_PUBLISHED 旗標：讓官網知道「這是已發布內容」，據以套用 info 文字到 DOM
    return res.status(200).send("window.EGRRA_PUBLISHED=true;window.EGRRA_DEFAULT_DATA = " + safe + ";");
  } catch (e) {
    const msg = String((e && e.message) || e).replace(/\*\//g, "* /");
    return res.status(200).send("/* EGRRA: 讀取發生例外，使用預設內容：" + msg + " */");
  } finally {
    clearTimeout(timer);
  }
}
