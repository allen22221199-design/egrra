/* =========================================================================
   煌盛興業 EGRRA — 儲存層轉接（Cloudflare 版）
   ---------------------------------------------------------------------------
   原本 8 支 API 都直接用 @vercel/blob 的 put / list / del。搬到 Cloudflare
   之後底層換成 KV，但把介面保持成一樣的形狀，移植就變成機械工作，
   不用每支都重想一遍邏輯 —— 邏輯重寫一次就多一次出錯的機會。

   為什麼是 KV 不是 R2：
     R2 要跑一次 checkout 流程開通，文件沒寫清楚會不會要求留卡號。
     實測用量後發現根本不需要 R2 —— repo 裡 61 MB 圖片是靜態檔案，
     由 Pages 直接服務（流量無上限、不佔儲存），後台真正上傳到雲端的
     只有 49 張約 15 MB，KV 的 1 GB 免費額度綽綽有餘（單筆上限 25 MB）。
     繞開 R2 就繞開了「要不要綁卡」這個問號。

   ★ 與 Vercel Blob 的三個差異，移植時要注意 ★

   1. 沒有公開網址
      Blob 的 put() 會回一個 https://...blob.vercel-storage.com/... 的公開網址，
      可以直接塞進 <img src>。KV 沒有這種東西，要自己開一支端點吐位元組
      （functions/f/[[path]].js），網址變成 /f/uploads/xxx.jpg。
      → 舊資料裡那 49 張圖存的是絕對的 Blob 網址，搬家時要一併改寫，
        否則 Vercel 那邊一停，圖就全黑了。

   2. list() 的成本與上限
      Blob 的 list 很便宜。KV 的 list 一次最多 1000 筆且會消耗額度，
      stats/ 那種逐筆寫入的資料量級不適合走 KV → 改用 D1。

   3. 寫入是最終一致
      KV 寫完後最長約 60 秒全球才看得到（同一個 colo 通常即時）。
      後台「發布上線」後立刻重整可能還看到舊的。寫入時一併更新
      metadata 的 ts，前端要判斷新舊就看那個。
   ========================================================================= */

/* KV binding 名稱，對應 wrangler.toml 裡的設定 */
export const KV_BINDING = "EGRRA_KV";

export function kv(env) {
  const b = env && env[KV_BINDING];
  if (!b) throw new Error("KV 未綁定：請確認 wrangler.toml 的 " + KV_BINDING);
  return b;
}

/* 有沒有設定好儲存 —— 對應原本的 process.env.BLOB_READ_WRITE_TOKEN 檢查。
   沒設定時各端點要安靜地退回預設行為，不能讓官網壞掉。 */
export function hasStore(env) {
  return !!(env && env[KV_BINDING]);
}

/* 讀文字。找不到回 null（不是丟例外）—— 呼叫端多半只想知道「有沒有」。 */
export async function getText(env, key) {
  return await kv(env).get(key, { type: "text" });
}

/* 讀位元組，給圖片用 */
export async function getBytes(env, key) {
  return await kv(env).get(key, { type: "arrayBuffer" });
}

/* 讀 metadata（含 contentType / ts），不取值本體，成本低 */
export async function getMeta(env, key) {
  const r = await kv(env).getWithMetadata(key, { type: "stream" });
  return r ? r.metadata || {} : null;
}

/* 寫入。value 可以是字串或 ArrayBuffer。
   ts 一律由這裡蓋，避免各端點各寫各的、格式不一致。 */
export async function put(env, key, value, opts) {
  const o = opts || {};
  await kv(env).put(key, value, {
    metadata: {
      contentType: o.contentType || "application/json; charset=utf-8",
      ts: Date.now(),
      name: o.name || "",
    },
  });
  return { key };
}

export async function del(env, key) {
  await kv(env).delete(key);
}

/* 列出某個前綴底下的 key。
   ★ KV 一次最多回 1000 筆，超過要靠 cursor 翻頁。這裡最多翻到 limit 為止，
     不是無上限迴圈 —— 免費方案每次呼叫只有 10 ms CPU，翻太多頁會直接爆掉。 */
export async function list(env, prefix, limit) {
  const cap = limit || 1000;
  const out = [];
  let cursor;
  do {
    const r = await kv(env).list({ prefix, limit: Math.min(1000, cap - out.length), cursor });
    for (const k of r.keys) out.push({ key: k.name, meta: k.metadata || {} });
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor && out.length < cap);
  return out;
}

/* ---- 共用的小工具，原本散在各端點裡 ---- */

export function json(data, init) {
  return new Response(JSON.stringify(data), {
    status: (init && init.status) || 200,
    headers: Object.assign(
      { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
      (init && init.headers) || {}
    ),
  });
}

/* 後台密碼驗證。時間安全比較：字串長度不同直接回 false，
   長度相同時逐字元 XOR 累加，避免用比較時間反推密碼。 */
export function checkPw(env, given) {
  const want = String((env && env.ADMIN_PASSWORD) || "");
  const got = String(given || "");
  if (!want || want.length !== got.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}
