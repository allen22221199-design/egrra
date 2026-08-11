/* =========================================================================
   煌盛興業 EGRRA — 產業新聞：官網讀取 ＋ 後台審核（Cloudflare Pages Function）
   端點路徑：/api/news
   ---------------------------------------------------------------------------
   GET  /api/news                  官網用：只回傳「已發布」的項目
   GET  /api/news?stat=1           診斷用：只有數量不含內容，不需要密碼
   GET  /api/news?all=1&key=密碼    後台用：回傳全部（含待審、已略過）
   GET  /api/news?config=1&key=密碼 讀主題設定
   POST /api/news { password, action, ... }
        publish / reject / save / update / delete / topics

   ★ 搬到 KV 之後少了一整類 bug ★
     Vercel Blob 版必須在讀取網址後面加 ?t=時間戳來打掉 CDN 快取 —— 先前
     寫入時設了 cacheControlMaxAge 60，刪除後一分鐘內重新讀取會拿到舊版本，
     項目又跑出來，看起來就像「刪不掉」。KV 是直接讀值，沒有中間那層 CDN，
     這段繞路可以整個拿掉。

   ★ 保留 action="save" 的合併寫入 ★
     先前發布要送兩個請求（先 update 再 publish），每個都是「讀取 → 修改 →
     整份寫回」；兩次寫入之間若還沒同步，後一次會讀到舊資料把前一次蓋掉，
     發布就這樣消失。合併成一次就沒有這個競態。KV 同樣是最終一致，
     這個設計還是必要的，不要為了「比較好讀」又拆回兩支。
   ========================================================================= */

import { hasStore, put, json, checkPw } from "../_lib/store.js";
import { loadConfig, loadQueue, saveQueue, CONFIG_KEY } from "../_lib/news-store.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/* 距離上次蒐集超過這麼久，就在背景補抓一次。
   Cloudflare Pages 不支援 Cron Triggers（那是 Workers 專屬），
   所以改由「有人看產業快訊頁」來驅動 —— 用 waitUntil 丟到背景，
   訪客不會多等，也不必為了兩天一次的排程另外養一支 Worker。

   ★ 這裡的數字只是「多久之後值得去敲一次」，真正決定節奏的是 runFetch 自己的
     閘門（有產出隔 40 小時、空手 6 小時）。抓進來現在會直接上線，所以節流
     一定要在被呼叫的那一端把關，不能靠這裡 —— Vercel 的 Cron 也會敲同一份資料。 */
const STALE_HOURS = 44;

async function maybeRefresh(env, ctx, data) {
  if (!env.GEMINI_API_KEY || !ctx || !ctx.waitUntil) return;
  const last = Date.parse(data.lastRunAt || data.updated || "") || 0;
  if (Date.now() - last < STALE_HOURS * 3600 * 1000) return;
  /* 動態載入：news-fetch 會 import 這個檔案共用的資料層，
     靜態 import 回去會形成循環。 */
  ctx.waitUntil(
    import("./news-fetch.js")
      .then((m) => m.runFetch(env, 1))
      .catch(() => {})          /* 背景任務失敗絕不能影響這次回應 */
  );
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet(ctx) {
  const { request, env } = ctx;
  /* 尚未設定也不要讓官網壞掉，回空清單即可 */
  if (!hasStore(env)) return json({ items: [], updated: "" }, { headers: CORS });

  try {
    const q = new URL(request.url).searchParams;

    /* 主題設定不需要讀佇列，先處理掉，省一次讀取 */
    if (q.get("config")) {
      if (!checkPw(env, q.get("key"))) return json({ error: "bad_password" }, { status: 401, headers: CORS });
      return json(await loadConfig(env), { headers: CORS });
    }

    const data = await loadQueue(env);

    if (q.get("all")) {
      if (!checkPw(env, q.get("key"))) return json({ error: "bad_password" }, { status: 401, headers: CORS });
      return json(data, { headers: CORS });
    }

    /* 診斷用的彙總：只有數量，不含任何內容，不需要密碼。
       「發布了但官網沒出現」時，靠這個就能分辨是沒寫進去、還是寫進去但被擋住。 */
    const counts = { pending: 0, published: 0, rejected: 0, other: 0, emptyBody: 0, aiFailed: 0 };
    for (const x of data.items) {
      counts[x.status] !== undefined ? counts[x.status]++ : counts.other++;
      if (!x.body || !String(x.body).trim()) counts.emptyBody++;
      if (x.aiOk === false) counts.aiFailed++;
    }

    if (q.get("stat")) {
      return json({
        updated: data.updated, total: data.items.length, counts,
        /* id 是 Google News 的不透明識別碼，不含個資，列出來方便比對 */
        ids: data.items.slice(0, 10).map((x) => ({ id: x.id, status: x.status, hasBody: !!(x.body || "").trim() })),
      }, { headers: CORS });
    }

    /* 有人在看這一頁 —— 順手檢查要不要在背景補抓新聞 */
    await maybeRefresh(env, ctx, data);

    /* 官網：只給已發布，且不外流內部欄位。
       快取壓短 —— 發布後要等好幾分鐘才看得到，會讓人以為沒發布成功。 */
    return json({
      updated: data.updated, counts,
      items: data.items
        .filter((x) => x.status === "published")
        .sort((a, b) => String(b.publishedAt || b.addedAt || "").localeCompare(
                        String(a.publishedAt || a.addedAt || "")))
        .map(({ id, title, body, topic, sources, srcCount, publishedAt }) => ({
          id, title, body, topic, publishedAt,
          srcCount: srcCount || (sources || []).length,
          /* 舊資料可能存了二三十則，這裡再擋一次 */
          sources: (sources || []).slice(0, 6).map(({ title, source, url, date }) => ({ title, source, url, date })),
        })),
    }, { headers: Object.assign({}, CORS, { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" }) });
  } catch (e) {
    return json({ error: "server_error", detail: String((e && e.message) || e) }, { status: 500, headers: CORS });
  }
}

export async function onRequestPost({ request, env }) {
  if (!hasStore(env)) return json({ items: [], updated: "" }, { headers: CORS });

  try {
    const body = await request.json().catch(() => ({}));
    if (!checkPw(env, body.password)) return json({ error: "bad_password" }, { status: 401, headers: CORS });

    const now = new Date().toISOString();

    /* 主題設定不必讀佇列，先處理 */
    if (body.action === "topics") {
      const ts = (Array.isArray(body.topics) ? body.topics : [])
        .map((t) => ({
          key: String(t.key || "").slice(0, 20),
          on: t.on !== false,
          qs: (Array.isArray(t.qs) ? t.qs : []).map((x) => String(x || "").trim()).filter(Boolean).slice(0, 8),
        }))
        .filter((t) => t.key && t.qs.length);
      if (!ts.length) return json({ error: "no_topics", detail: "至少要留一個主題" }, { status: 400, headers: CORS });
      /* 沒帶 autoPublish 就沿用原值，避免只改主題卻順手改掉自動上線 */
      const cur = await loadConfig(env);
      const auto = typeof body.autoPublish === "boolean" ? body.autoPublish : cur.autoPublish;
      await put(env, CONFIG_KEY, JSON.stringify({ topics: ts, autoPublish: auto, updated: now }));
      return json({ ok: true, changed: ts.length }, { headers: CORS });
    }

    const data = await loadQueue(env);
    const ids = new Set(Array.isArray(body.ids) ? body.ids : (body.id ? [body.id] : []));
    let n = 0;

    if (body.action === "publish") {
      data.items.forEach((x) => { if (ids.has(x.id)) { x.status = "published"; x.publishedAt = now; n++; } });
    } else if (body.action === "reject") {
      /* 標記而非刪除：刪掉的話下次抓取會因為 id 不在佇列裡而重新收進來 */
      data.items.forEach((x) => { if (ids.has(x.id)) { x.status = "rejected"; n++; } });
    } else if (body.action === "save") {
      /* 內容與狀態一次改完 —— 拆成兩次寫入會有競態，見檔案開頭說明 */
      const st = body.status;
      data.items.forEach((x) => {
        if (!ids.has(x.id)) return;
        if (typeof body.body === "string") x.body = body.body.slice(0, 4000);
        if (typeof body.title === "string" && body.title.trim()) x.title = body.title.slice(0, 200);
        if (st === "published" || st === "rejected" || st === "pending") {
          x.status = st;
          if (st === "published") x.publishedAt = now;
        }
        x.editedAt = now;
        n++;
      });
    } else if (body.action === "update") {
      data.items.forEach((x) => {
        if (!ids.has(x.id)) return;
        if (typeof body.body === "string") x.body = body.body.slice(0, 4000);
        if (typeof body.title === "string" && body.title.trim()) x.title = body.title.slice(0, 200);
        x.editedAt = now;
        n++;
      });
    } else if (body.action === "delete") {
      const before = data.items.length;
      data.items = data.items.filter((x) => !ids.has(x.id));
      n = before - data.items.length;
    } else {
      return json({ error: "unknown_action" }, { status: 400, headers: CORS });
    }

    await saveQueue(env, data);
    /* 回報收到什麼、比對到什麼 —— 「按了沒反應」時要能立刻分辨
       是請求沒送到、id 對不上、還是真的沒有符合的項目。 */
    return json({
      ok: true, changed: n,
      received: [...ids],
      known: data.items.slice(0, 50).map((x) => x.id),
    }, { headers: CORS });
  } catch (e) {
    return json({ error: "server_error", detail: String((e && e.message) || e) }, { status: 500, headers: CORS });
  }
}
