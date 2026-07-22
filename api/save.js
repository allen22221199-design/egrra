/* =========================================================================
   煌盛興業 EGRRA — 後台「發布上線」後端 (Vercel Serverless Function)
   ---------------------------------------------------------------------------
   後台按「發布上線」→ 帶密碼 POST 到這裡 → 驗證密碼 → 把內容寫回 GitHub 的
   site-data.js → Vercel 自動重建 → 約 1 分鐘後全站生效。

   需在 Vercel → Settings → Environment Variables 設兩個：
     ADMIN_PASSWORD = 你自訂的發布密碼
     GITHUB_TOKEN   = 具「Contents 讀寫」權限、限 egrra repo 的 GitHub 權杖
   ========================================================================= */

const OWNER  = "allen22221199-design";
const REPO   = "egrra";
const FILE   = "site-data.js";
const BRANCH = "main";
const ALLOW_ORIGIN = "*";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const ADMIN = process.env.ADMIN_PASSWORD;
  const TOKEN = process.env.GITHUB_TOKEN;
  if (!ADMIN || !TOKEN)
    return res.status(500).json({ error: "server_not_configured", detail: "缺 ADMIN_PASSWORD 或 GITHUB_TOKEN 環境變數" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if ((body.password || "") !== ADMIN) return res.status(401).json({ error: "bad_password" });

    const data = body.data;
    if (!data || !data.info || !Array.isArray(data.products) || !Array.isArray(data.cases))
      return res.status(400).json({ error: "bad_data", detail: "資料格式不正確（需含 info / products / cases）" });

    const header = "/* 煌盛興業 EGRRA — 網站內容資料。由後台「發布上線」自動產生。 */\n";
    const content = header + "window.EGRRA_DEFAULT_DATA = " + JSON.stringify(data, null, 2) + ";\n";

    const api = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/" + encodeURIComponent(FILE);
    const headers = {
      "Authorization": "token " + TOKEN,
      "Accept": "application/vnd.github+json",
      "User-Agent": "egrra-admin",
    };

    // 取得目前檔案 SHA（更新既有檔案需要）
    let sha;
    const cur = await fetch(api + "?ref=" + BRANCH, { headers });
    if (cur.ok) { const j = await cur.json(); sha = j.sha; }

    const b64 = Buffer.from(content, "utf-8").toString("base64");
    const put = await fetch(api, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "後台發布：更新網站內容 site-data.js",
        content: b64,
        sha: sha,
        branch: BRANCH,
      }),
    });

    if (!put.ok) {
      const t = await put.text();
      return res.status(502).json({ error: "github_error", status: put.status, detail: t.slice(0, 300) });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) });
  }
}
