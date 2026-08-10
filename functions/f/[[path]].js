/* =========================================================================
   煌盛興業 EGRRA — 後台上傳圖片的輸出端點（Cloudflare Pages Function）
   端點路徑：/f/<KV 的 key>，例如 /f/uploads/中山TED-3f2a91c4.jpg
   ---------------------------------------------------------------------------
   Vercel Blob 的 put() 會回一個可以直接放進 <img src> 的公開網址，KV 沒有
   這種東西 —— 值只能透過程式讀出來。所以開這支把位元組吐回去。

   ★ 只開放 uploads/ 底下 ★
     路徑是使用者可控的。不設限的話，任何人打 /f/site-data.json 就能把整份
     後台資料（含尚未公開的案例）抓走。白名單比黑名單安全，日後要多開目錄
     就往 ALLOW 加，不要改成「擋掉某些前綴」。

   圖片內容永遠不變（檔名帶隨機碼，改圖等於換檔名），所以放心快取一年。
   ========================================================================= */

import { hasStore, KV_BINDING } from "../_lib/store.js";

const ALLOW = ["uploads/"];

export async function onRequestGet({ params, env }) {
  if (!hasStore(env)) return new Response("not configured", { status: 503 });

  /* [[path]] 會把 /f/a/b/c.jpg 拆成 ["a","b","c.jpg"] */
  const parts = Array.isArray(params.path) ? params.path : [params.path];
  const key = parts.filter(Boolean).join("/");

  if (!key || key.includes("..") || !ALLOW.some((p) => key.startsWith(p))) {
    return new Response("not found", { status: 404 });
  }

  const r = await env[KV_BINDING].getWithMetadata(key, { type: "arrayBuffer" });
  if (!r || !r.value) return new Response("not found", { status: 404 });

  const meta = r.metadata || {};
  return new Response(r.value, {
    headers: {
      "Content-Type": meta.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      /* 避免有人上傳看起來像圖片、實際是 HTML 的檔案來夾帶腳本 */
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
