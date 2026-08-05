/* =========================================================================
   煌盛興業 EGRRA — 後台「圖片上傳」後端 (Vercel Serverless Function / Blob)
   ---------------------------------------------------------------------------
   為什麼需要這支：
     後台原本把照片壓縮後以 base64 data URL 直接存在資料裡。一張 1400px
     的 JPEG 約 300KB，轉成 base64 會膨脹約 1.37 倍變成 400KB 的「文字」。
     這份資料同時要放進 localStorage（瀏覽器硬上限約 5MB）與整包 POST 給
     /api/save（Vercel 請求上限約 4.5MB），所以大約十張照片就滿了。

     改成把照片當成「真的檔案」丟到 Blob，資料裡只留一段網址（約 90 字），
     容量上限就消失了，圖片也改由 CDN 直送，官網載入更快。

   介面：
     POST { password, dataUrl, name? }        → { ok:true, url }
     POST { password, action:"del", urls:[] } → { ok:true, deleted:n }
   ========================================================================= */

import { put, del } from "@vercel/blob";

const DIR = "uploads/";
const MAX_BYTES = 8 * 1024 * 1024; // 解碼後的圖片上限；比 Vercel 的請求上限寬鬆即可
const EXT = {
  "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png",
  "image/webp": "webp", "image/gif": "gif", "image/avif": "avif",
};

/* 檔名只留安全字元，並保留原名讓日後在 Blob 後台好辨認 */
function slug(name) {
  return String(name || "photo")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^\w一-鿿-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "photo";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const ADMIN = process.env.ADMIN_PASSWORD;
  const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
  if (!ADMIN || !TOKEN)
    return res.status(500).json({ error: "server_not_configured", detail: "缺 ADMIN_PASSWORD 或 Blob 尚未建立（BLOB_READ_WRITE_TOKEN）" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if ((body.password || "") !== ADMIN) return res.status(401).json({ error: "bad_password" });

    /* 刪除：案例或相簿裡移除照片時，順手把雲端檔案清掉，不留孤兒 */
    if (body.action === "del") {
      const urls = (Array.isArray(body.urls) ? body.urls : [])
        .filter((u) => typeof u === "string" && u.includes("/" + DIR));
      if (urls.length) await del(urls);
      return res.status(200).json({ ok: true, deleted: urls.length });
    }

    const dataUrl = String(body.dataUrl || "");
    const m = /^data:([\w/+.-]+);base64,(.+)$/s.exec(dataUrl);
    if (!m) return res.status(400).json({ error: "bad_data", detail: "需要 base64 的 data URL" });

    const mime = m[1].toLowerCase();
    const ext = EXT[mime];
    if (!ext) return res.status(400).json({ error: "bad_type", detail: "不支援的圖片格式：" + mime });

    const buf = Buffer.from(m[2], "base64");
    if (!buf.length) return res.status(400).json({ error: "bad_data", detail: "圖片內容是空的" });
    if (buf.length > MAX_BYTES)
      return res.status(413).json({ error: "too_large", detail: "單張圖片超過 " + (MAX_BYTES / 1048576) + "MB" });

    const blob = await put(DIR + slug(body.name) + "." + ext, buf, {
      access: "public",
      addRandomSuffix: true, // 同名照片不會互相覆蓋
      contentType: mime,
      cacheControlMaxAge: 31536000, // 圖片內容不會變，讓 CDN 快取一年
    });

    return res.status(200).json({ ok: true, url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) });
  }
}
