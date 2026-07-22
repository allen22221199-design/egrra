/* =========================================================================
   煌盛興業 EGRRA — 智能客服「真 AI」後端（Vercel Serverless Function / Gemini 版）
   ---------------------------------------------------------------------------
   啟用方式：
   1. 把這個 repo 用 Vercel 部署（Vercel 會自動把 /api/chat 變成一個 API）。
   2. 在 Vercel 專案 → Settings → Environment Variables 新增：
        GEMINI_API_KEY = 你的 Google Gemini 金鑰
        （在 Google AI Studio https://aistudio.google.com/apikey 取得）
   3. chatbot.js 最上方的 AI_ENDPOINT 已設 "/api/chat"（與此後端同網域即可）。
   4. 重新部署即可。之後客服「答不出的問題」會轉給真 AI（Gemini）回答。

   ★ 費用：走 Gemini 計費（gemini-2.0-flash 便宜且快，適合大量客服問答）。
     想換模型改下方 MODEL 即可（例如 "gemini-2.5-flash"）。
   ★ 不需任何 npm 套件：直接用 Node 內建 fetch 呼叫 Gemini REST API。
   ========================================================================= */

const MODEL = "gemini-2.0-flash"; // 快又省；可改 "gemini-2.5-flash" 等
const ALLOW_ORIGIN = "*";         // 部署後可改成你的網域，例如 "https://egrra.com"

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(500).json({ error: "missing_api_key", detail: "請在 Vercel 設定 GEMINI_API_KEY 環境變數" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const q = (body.q || "").toString().slice(0, 500);
    if (!q) return res.status(400).json({ error: "empty_question" });

    const ctx = body.context || {};
    const products = (ctx.products || []).map((p) => `${p.name}（${p.series || "藝格板"}）`).join("、");
    const info = ctx.info || {};

    const system =
`你是「煌盛興業 EGRRA」的線上客服。用「繁體中文、親切、簡潔」回答訪客關於藝格板的問題。直接給答案，不要輸出思考或分析過程，回答控制在 2–4 句。

【公司】煌盛興業 EGRRA，源自王子彩色四十餘年彩色印刷，累積超過 46 年，專為建築與設計市場打造的數位紋理品牌。
【核心技術】PrinTex™ 專利數位紋理：高仿真還原天然石材紋理，可製作於鋁／玻璃／金屬／木等基材，具立體浮雕與專利無縫對花。
【產品】藝格板分三系列：石紋、繡蝕、木紋；另有消防箱、防火門美化。目前花色：${products || "多款"}。
【特色】通過台灣最高等級「耐燃一級」防火測試；抗 UV 不褪色；可提供 SGS 抗菌認證；重量約天然石材的 1/30；可全面客製。
【規格】尺寸 4×4、4×8、4×10、5×10 尺；表面處理：立體紋路、霧光、平光、消光。
【計價】以「才」計價；因數量落差大，需由設計師或客戶提供需求數量報價 —— 絕對不要自行報出任何價格數字。
【保養】鋁烤漆製品耐用，一般擦拭即可；勿用強酸強鹼，或松香水、除膠劑等會溶解樹脂的溶劑。
【聯絡】電話 ${info.phone || "02-2222-1199"}；傳真 ${info.fax || "02-2228-6799"}；Facebook ${info.fb || "@Egrra.Lu"}。

規則：只回答與煌盛興業／藝格板相關的問題。不知道、超出範圍、或牽涉報價時，禮貌引導對方來電或私訊 FB，不要編造任何資訊或數字。`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(KEY)}`;
    const payload = {
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: q }] }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ error: "gemini_error", status: r.status, detail: t.slice(0, 300) });
    }

    const data = await r.json();
    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();

    return res.status(200).json({ reply: reply || "不好意思，這題我再幫您確認，也歡迎直接來電洽詢 🙂" });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) });
  }
}
