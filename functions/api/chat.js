/* =========================================================================
   煌盛興業 EGRRA — 智能客服「真 AI」後端（Cloudflare Pages Function / Gemini）
   端點路徑：/api/chat
   ---------------------------------------------------------------------------
   對應 Vercel 版的 api/chat.js。這支沒有用到儲存，移植只是把 handler(req,res)
   換成 onRequestPost({request, env})、process.env 換成 env。

   啟用方式：
     Pages 專案 → Settings → Environment variables 新增
       GEMINI_API_KEY   在 https://aistudio.google.com/apikey 取得
       GEMINI_MODEL     選填，預設 gemini-2.5-flash

   CPU 用量沒問題：組 prompt 與解析回應都很輕，等 Gemini 回覆的時間不計入
   CPU（免費方案每次呼叫 10 ms CPU，只算實際運算）。
   ========================================================================= */

import { json } from "../_lib/store.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  const KEY = env.GEMINI_API_KEY;
  const MODEL = env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!KEY) {
    return json({ error: "missing_api_key", detail: "請在 Pages 的環境變數設定 GEMINI_API_KEY" },
      { status: 500, headers: CORS });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const q = (body.q || "").toString().slice(0, 500);
    if (!q) return json({ error: "empty_question" }, { status: 400, headers: CORS });

    const ctx = body.context || {};
    const products = (ctx.products || []).map((p) => `${p.name}（${p.series || "藝格板"}）`).join("、");
    const info = ctx.info || {};

    const system =
`你是「煌盛興業 EGRRA」的線上客服。用「繁體中文、親切、簡潔」回答訪客關於藝格板的問題。直接給答案，不要輸出思考或分析過程，回答控制在 2–4 句。

【公司】煌盛興業 EGRRA，源自王子彩色四十餘年彩色印刷，累積超過 46 年，專為建築與設計市場打造的數位紋理品牌。
【核心技術】PrinTex™ 專利數位紋理：高仿真還原天然石材紋理，可製作於鋁／玻璃／金屬／木等基材，具立體浮雕與專利無縫對花。
【產品】藝格板分三系列：石紋、鏽蝕、木紋；另有消防箱、防火門美化。目前花色：${products || "多款"}。
【特色】通過台灣最高等級「耐燃一級」防火測試；抗 UV 不褪色；可提供 SGS 抗菌認證；重量約天然石材的 1/30；可全面客製。
【規格】尺寸 4×4、4×8、4×10、5×10 尺；表面處理：立體紋路、霧光、平光、消光。
【計價】以「才」計價；因數量落差大，需由設計師或客戶提供需求數量報價 —— 絕對不要自行報出任何價格數字。
【保養】鋁烤漆製品耐用，一般擦拭即可；勿用強酸強鹼，或松香水、除膠劑等會溶解樹脂的溶劑。
【聯絡】電話 ${info.phone || "02-2222-1199"}；傳真 ${info.fax || "02-2228-6799"}；Facebook 大理石魔術師呂哥 ${info.fb || "https://www.facebook.com/PrinTex22221199"}。

規則：只回答與煌盛興業／藝格板相關的問題。不知道、超出範圍、或牽涉報價時，禮貌引導對方來電或私訊 FB，不要編造任何資訊或數字。`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(KEY)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: q }] }],
        generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return json({ error: "gemini_error", status: r.status, detail: t.slice(0, 300) },
        { status: 502, headers: CORS });
    }

    const data = await r.json();
    const reply = ((data.candidates && data.candidates[0] && data.candidates[0].content &&
      data.candidates[0].content.parts) || [])
      .map((p) => p.text || "").join("").trim();

    return json({ reply: reply || "不好意思，這題我再幫您確認，也歡迎直接來電洽詢 🙂" }, { headers: CORS });
  } catch (e) {
    return json({ error: "server_error", detail: String((e && e.message) || e) },
      { status: 500, headers: CORS });
  }
}
