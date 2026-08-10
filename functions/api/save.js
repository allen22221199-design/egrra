/* =========================================================================
   煌盛興業 EGRRA — 後台「發布上線」（Cloudflare Pages Function）
   端點路徑：/api/save
   ---------------------------------------------------------------------------
   對應 Vercel 版的 api/save.js。後台按「發布上線」→ 帶密碼 POST 到這裡 →
   驗證密碼 → 寫進 KV（site-data.json）→ 官網透過 /api/published 讀取。

   Cloudflare 需設定：
     1) Workers & Pages → KV → 建一個 namespace，binding 名稱 EGRRA_KV
     2) Pages 專案 → Settings → Environment variables → ADMIN_PASSWORD
   ========================================================================= */

import { hasStore, put, json, checkPw } from "../_lib/store.js";

const KEY = "site-data.json";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !hasStore(env)) {
    return json(
      { error: "server_not_configured", detail: "缺 ADMIN_PASSWORD 或 KV 尚未綁定（EGRRA_KV）" },
      { status: 500, headers: CORS }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (!checkPw(env, body.password)) {
      return json({ error: "bad_password" }, { status: 401, headers: CORS });
    }

    const data = body.data;
    if (!data || !data.info || !Array.isArray(data.products) || !Array.isArray(data.cases)) {
      return json(
        { error: "bad_data", detail: "資料格式不正確（需含 info / products / cases）" },
        { status: 400, headers: CORS }
      );
    }

    /* ★★ 版本戳章：一律以「發布當下的真實時間」覆寫 dataVersion ★★
       後台送來的版本是它載入時程式端的版本；若沿用，日後只要程式端更新
       並提高 dataVersion，/api/published 的版本守門就會判定此快照較舊而
       整份忽略 —— 使用者發布的內容會無聲消失。

       （2026-08-05 就出過這個事：site-data.js 裡填了還沒到的時間，
         使用者發布的 37 件案例與相簿因此被整份丟掉。
         所以程式端的 dataVersion 絕對不可以填未來時間。） */
    data.dataVersion = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

    await put(env, KEY, JSON.stringify(data));

    return json({ ok: true }, { headers: CORS });
  } catch (e) {
    return json(
      { error: "server_error", detail: String((e && e.message) || e) },
      { status: 500, headers: CORS }
    );
  }
}
