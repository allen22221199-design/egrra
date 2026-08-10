/* =========================================================================
   煌盛興業 EGRRA — 後台「圖片上傳」（Cloudflare Pages Function）
   端點路徑：/api/upload
   ---------------------------------------------------------------------------
   為什麼需要這支（沿用 Vercel 版的理由）：
     後台原本把照片壓縮後以 base64 data URL 直接存在資料裡。一張 1400px 的
     JPEG 約 300KB，轉成 base64 會膨脹約 1.37 倍變成 400KB 的「文字」。這份
     資料同時要放進 localStorage（瀏覽器硬上限約 5MB）與整包 POST 給
     /api/save，所以大約十張照片就滿了。改成把照片當成「真的檔案」存起來、
     資料裡只留一段網址，容量上限就消失了。

   ★ 與 Vercel 版的兩個差異 ★

   1. 收二進位，不收 base64
      Cloudflare 免費方案每次呼叫只有 10 ms CPU。base64 解碼 400KB 的字串
      是實打實的 CPU 工作，加上 JSON.parse 一個 400KB 的字串，很容易踩線。
      改成瀏覽器直接送二進位（fetch 的 body 直接放 Blob），這裡只做
      request.arrayBuffer() 原封不動塞進 KV —— 解碼成本歸零。
      舊的 base64 路徑仍保留，讓後台可以分批改、不必一次到位。

   2. KV 沒有公開網址
      Vercel Blob 的 put() 會回一個可直接放進 <img src> 的公開網址。
      KV 沒有，所以回傳的是 /f/uploads/xxx.jpg，由 functions/f/[[path]].js
      去 KV 取位元組吐回來。

   介面：
     POST  binary  ?name=原檔名        標頭 X-Admin-Password、Content-Type: image/*
     POST  JSON    { password, dataUrl, name? }        （相容舊後台）
     POST  JSON    { password, action:"del", urls:[] }
   ========================================================================= */

import { hasStore, put, del, json, checkPw } from "../_lib/store.js";

const DIR = "uploads/";
const MAX_BYTES = 8 * 1024 * 1024;
const EXT = {
  "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png",
  "image/webp": "webp", "image/gif": "gif", "image/avif": "avif",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
};

/* 檔名只留安全字元，並保留原名讓日後在後台好辨認 */
function slug(name) {
  return String(name || "photo")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^\w一-鿿-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "photo";
}

/* 同名照片不能互相覆蓋 —— 對應 Blob 版的 addRandomSuffix */
function suffix() {
  return crypto.randomUUID().slice(0, 8);
}

async function store(env, bytes, mime, name) {
  const ext = EXT[mime];
  if (!ext) return json({ error: "bad_type", detail: "不支援的圖片格式：" + mime }, { status: 400, headers: CORS });
  if (!bytes || !bytes.byteLength) return json({ error: "bad_data", detail: "圖片內容是空的" }, { status: 400, headers: CORS });
  if (bytes.byteLength > MAX_BYTES)
    return json({ error: "too_large", detail: "單張圖片超過 " + (MAX_BYTES / 1048576) + "MB" }, { status: 413, headers: CORS });

  const key = DIR + slug(name) + "-" + suffix() + "." + ext;
  await put(env, key, bytes, { contentType: mime, name: String(name || "") });
  /* 回相對路徑，不是絕對網址 —— 這樣同一份資料在 pages.dev 預覽站和
     正式網域上都能用，日後換網域也不必再改一次資料。 */
  return json({ ok: true, url: "/f/" + key }, { headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !hasStore(env)) {
    return json({ error: "server_not_configured", detail: "缺 ADMIN_PASSWORD 或 KV 尚未綁定（EGRRA_KV）" },
      { status: 500, headers: CORS });
  }

  try {
    const ct = (request.headers.get("Content-Type") || "").toLowerCase();

    /* ---- 路徑一：二進位直傳（首選，CPU 幾乎為零）---- */
    if (ct.startsWith("image/")) {
      if (!checkPw(env, request.headers.get("X-Admin-Password"))) {
        return json({ error: "bad_password" }, { status: 401, headers: CORS });
      }
      const url = new URL(request.url);
      const bytes = await request.arrayBuffer();
      return await store(env, bytes, ct.split(";")[0].trim(), url.searchParams.get("name"));
    }

    /* ---- 路徑二：JSON（刪除，以及相容舊後台的 base64）---- */
    const body = await request.json().catch(() => ({}));
    if (!checkPw(env, body.password)) {
      return json({ error: "bad_password" }, { status: 401, headers: CORS });
    }

    /* 刪除：案例或相簿裡移除照片時順手清掉雲端檔案，不留孤兒 */
    if (body.action === "del") {
      const urls = (Array.isArray(body.urls) ? body.urls : [])
        .filter((u) => typeof u === "string" && u.includes("/" + DIR));
      for (const u of urls) {
        /* 網址是 /f/uploads/xxx.jpg，KV 的 key 是 uploads/xxx.jpg */
        const i = u.indexOf("/" + DIR);
        await del(env, u.slice(i + 1));
      }
      return json({ ok: true, deleted: urls.length }, { headers: CORS });
    }

    const m = /^data:([\w/+.-]+);base64,(.+)$/s.exec(String(body.dataUrl || ""));
    if (!m) return json({ error: "bad_data", detail: "需要 base64 的 data URL 或二進位上傳" }, { status: 400, headers: CORS });

    /* base64 解碼。這條路徑是為了相容舊後台而留的，CPU 成本比二進位高，
       後台全面改用二進位之後可以整段拿掉。 */
    const bin = atob(m[2]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return await store(env, bytes.buffer, m[1].toLowerCase(), body.name);
  } catch (e) {
    return json({ error: "server_error", detail: String((e && e.message) || e) }, { status: 500, headers: CORS });
  }
}
