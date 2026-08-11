/* =========================================================================
   煌盛興業 EGRRA — 舊站網址轉址（Cloudflare Pages Function）
   ---------------------------------------------------------------------------
   ★ 為什麼不能只用 _redirects ★
     實測（2026-08-10，egrra-official.pages.dev）：
       /portfolio-item/%E8%8F%AF%E5%B1%B133  → 301 /cases?case=c21   ✓
       /portfolio-item/%e8%8f%af%e5%b1%b133  → 沒對到                 ✗
     Cloudflare 會把 _redirects 的「規則來源」正規化成大寫百分比編碼，再拿
     請求原文逐字比對。舊站 Yoast 的 sitemap 用的正是小寫，等於真實流量
     全部落空 —— 而且狀態碼還是 301（掉進萬用規則），只看數字看不出來，
     要逐條比對 Location 才會發現 ?case=cN 已經丟了。
     （Vercel 剛好相反：它逐字比對，所以那邊大小寫兩份都要放。）

     _redirects 沒有正規表示式也沒有大小寫不敏感選項，解不了這件事。
     這裡自己 decodeURIComponent 再查表，編碼大小寫與結尾斜線就都不重要了。

   ★ 未知路徑的 404 不歸這裡管 ★
     Pages 找不到檔案時預設會把 index.html 當單頁應用進入點回 200，
     那會讓舊站 116 個佈景主題樣板網址變成「內容與首頁相同」的重複頁。
     解法是專案根目錄放一個 404.html —— Pages 有這個檔就會改回正確的
     404 狀態。不需要在這裡攔，攔了反而多一層 Worker 成本。

   ★ 成本 ★
     這支會被每個「非靜態資源」的請求叫到。_routes.json 已排除 /img/*
     與各種副檔名，圖片、CSS、JS 不會進來 —— 免費方案每天 10 萬次呼叫，
     實際只有頁面瀏覽會算到。
   ========================================================================= */

import { LEGACY, PREFIX } from "./_legacy-map.js";

function normalize(pathname) {
  let p = pathname;
  try { p = decodeURIComponent(p); } catch (e) { /* 壞掉的編碼就用原文比 */ }
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p.toLowerCase() || "/";
}

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const p = normalize(url.pathname);

  /* 1. 舊站的明確對應（含 20 件精準對到單一案例的 ?case=cN） */
  const hit = LEGACY[p];
  if (hit) return Response.redirect(new URL(hit, url.origin).toString(), 301);

  /* 2. 舊站的目錄前綴：沒有明確對應的，整個前綴導到對應的列表頁。
        舊站 60 件實績案例只有 20 件對得上新站，其餘走這裡。 */
  for (const [prefix, dest] of PREFIX) {
    if (p === prefix || p.startsWith(prefix + "/")) {
      return Response.redirect(new URL(dest, url.origin).toString(), 301);
    }
  }

  return next();
}
