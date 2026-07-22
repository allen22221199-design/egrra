/* =========================================================================
   煌盛興業 EGRRA — 後台「發布上線」後端 (Vercel Serverless Function / Blob 版)
   ---------------------------------------------------------------------------
   後台按「發布上線」→ 帶密碼 POST 到這裡 → 驗證密碼 → 把內容寫進 Vercel Blob
   （site-data.json）→ 官網頁面透過 /api/published 讀取 → 約 1 分鐘後全站生效。

   需在 Vercel 設定：
     1) Storage → Create Database → Blob（access 選 Public）→ 連到本專案
        （會自動注入 BLOB_READ_WRITE_TOKEN 環境變數）
     2) Settings → Environment Variables 新增 ADMIN_PASSWORD = 你自訂的發布密碼
   ========================================================================= */

import { put } from "@vercel/blob";

const BLOB_PATH = "site-data.json";
const ALLOW_ORIGIN = "*";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
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

    const data = body.data;
    if (!data || !data.info || !Array.isArray(data.products) || !Array.isArray(data.cases))
      return res.status(400).json({ error: "bad_data", detail: "資料格式不正確（需含 info / products / cases）" });

    const json = JSON.stringify(data);

    await put(BLOB_PATH, json, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json; charset=utf-8",
      cacheControlMaxAge: 60, // Blob 本身快取 60 秒（最低值）
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) });
  }
}
