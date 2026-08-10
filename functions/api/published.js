/* =========================================================================
   煌盛興業 EGRRA — 讀取「已發布內容」（Cloudflare Pages Function）
   端點路徑：/api/published
   ---------------------------------------------------------------------------
   對應 Vercel 版的 api/published.js，行為完全一致。差異只在儲存層：
   Vercel Blob 的 list() + fetch(url) 兩趟，換成 KV 一趟直接讀值。

   官網頁面在 <script src="site-data.js">（靜態預設值）之後載入
   <script src="/api/published">，由本端點把已發布內容覆蓋上去。

   ★ 版本保護（跟 Vercel 版同一套，別動）：
     比對快照的 dataVersion 與線上 site-data.js 的 dataVersion。
     快照較舊 → 視為過期，輸出 no-op，官網沿用程式端新內容。
     這是為了避免「後台舊快照把後來在程式端更新的內容整個蓋掉」。

   任何失敗都輸出註解（no-op），沿用靜態預設值 —— 這支掛掉官網也不能壞。
   ========================================================================= */

import { hasStore, getText } from "../_lib/store.js";

const KEY = "site-data.json";
/* U+2028 / U+2029：JSON 合法但舊版 JS 視為換行，輸出前需轉義
   （用 fromCharCode 讓原始碼保持純 ASCII） */
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

const JS_HEADERS = {
  "Content-Type": "application/javascript; charset=utf-8",
  /* s-maxage 讓 Cloudflare 邊緣快取 60 秒 —— 這支每次載入頁面都會被打，
     不快取的話 KV 讀取額度會被瀏覽量直接吃掉。 */
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

function note(msg) {
  return new Response("/* EGRRA: " + String(msg).replace(/\*\//g, "* /") + " */", {
    headers: JS_HEADERS,
  });
}

export async function onRequestGet({ request, env }) {
  try {
    if (!hasStore(env)) return note("KV 未設定，使用預設內容");

    const json = String((await getText(env, KEY)) || "").trim();
    if (!json) return note("尚無已發布內容，使用預設內容");
    if (json[0] !== "{") return note("已發布內容格式異常，使用預設內容");

    /* ?raw=1：原封不動吐出快照本體，供診斷「後台與官網對不上」時比對。
       內容與官網本來就會輸出的相同，不額外洩漏任何東西。 */
    const url = new URL(request.url);
    if (url.searchParams.get("raw")) {
      return new Response(json, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    /* ---- 版本比對：抓線上 site-data.js 的 dataVersion ---- */
    let staticVer = "";
    try {
      const sd = await fetch(new URL("/site-data.js", url.origin).toString(), {
        cf: { cacheTtl: 300, cacheEverything: true },
      });
      if (sd.ok) {
        const m = (await sd.text()).match(/dataVersion\s*:\s*["']([^"']+)["']/);
        if (m) staticVer = m[1];
      }
    } catch (e) { /* 抓不到就不擋，維持原本行為 */ }

    let blobVer = "";
    const bm = json.match(/"dataVersion"\s*:\s*"([^"]+)"/);
    if (bm) blobVer = bm[1];

    if (staticVer && blobVer < staticVer) {
      return note(
        "已發布快照版本較舊(" + (blobVer || "無版本") + " < " + staticVer +
        ")，已忽略，使用程式端最新內容。要改用後台內容請重新按一次「發布上線」。"
      );
    }

    /* ---- 逐區合併，不整份取代 ----
       快照裡有的區塊以快照為準；快照沒有的區塊（例如日後在程式端新增的
       compare）沿用程式端。整份取代的話，程式端多一個新區塊該區塊就會憑空消失。
       info 再往下合一層，避免程式端新增的欄位在舊快照上遺失。

       sectionVersions：程式端宣告「某一區是我在什麼時候更新的」，
       比快照新就以程式端為準。用來處理「使用者只改了案例，但程式端大幅
       更新了產品」這種情況。合併在瀏覽器端做，後端不必解析 site-data.js。 */
    const safe = json.split(LS).join("\\u2028").split(PS).join("\\u2029");
    return new Response(
      "window.EGRRA_PUBLISHED=true;(function(){var d=window.EGRRA_DEFAULT_DATA||{},b=" + safe + ";" +
      "b.info=Object.assign({},d.info||{},b.info||{});" +
      "var m=Object.assign({},d,b),sv=d.sectionVersions||{},bv=String(b.dataVersion||'');" +
      "Object.keys(sv).forEach(function(k){if(String(sv[k])>bv&&d[k]!==undefined)m[k]=d[k];});" +
      "window.EGRRA_DEFAULT_DATA=m;})();",
      { headers: JS_HEADERS }
    );
  } catch (e) {
    return note("讀取發生例外，使用預設內容：" + ((e && e.message) || e));
  }
}
