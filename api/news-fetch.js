/* =========================================================================
   煌盛興業 EGRRA — 產業新聞蒐集（Vercel Cron / Serverless Function）
   ---------------------------------------------------------------------------
   每天抓取與產品線相關的六類新聞（防火法規、耐燃安全、綠建材低碳、
   室內設計、公設與都更、健康建材），過濾雜訊後寫進 Blob 的待審佇列。
   ★ 抓進來的一律是「待審」，不會自動上線。★

   關於內容的重要限制：
     Google News 的 RSS 只提供標題、來源、日期、連結，沒有內文片段
     （實測各家媒體自有 RSS 也多半是空的）。因此這裡不轉述任何一篇報導，
     而是從同議題的多則標題交叉確認事實，再由煌盛的角度寫成原創短文。
     摘要一篇沒讀過的文章就是編造，所以 prompt 明確禁止補充標題沒說的內容。

   需在 Vercel 設定：
     GEMINI_API_KEY（已有）、BLOB_READ_WRITE_TOKEN（已有）、ADMIN_PASSWORD（已有）
   ========================================================================= */

import { put, list } from "@vercel/blob";

const BLOB_PATH = "news/queue.json";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_KEEP = 300;          // 佇列上限，超過就淘汰最舊的已處理項目
const PER_QUERY = 12;          // 每個關鍵字最多看幾則
const MAX_TO_AI = 70;          // 一次最多丟給 AI 幾則 —— 太多會超出回應長度也更容易出錯

/* 追蹤主題，涵蓋產品線會碰到的各個面向。
   關鍵字刻意寫得具體 —— 只打「建材」兩個字會抓回一堆上市公司財報與
   開幕新聞稿，對建築師與建商沒有價值；具體的詞才問得出有用的東西。
   抓回來之後還有 AI 過濾與人工審核兩道關卡。 */
const TOPICS = [
  { key: "防火法規", qs: [
      "防火門 法規", "防火門 消防 安檢", "防火區劃 建築技術規則", "消防安全設備 檢修"] },
  { key: "耐燃安全", qs: [
      "耐燃 建材", "建材 防火 認證", "耐燃一級", "外牆 建材 火災"] },
  { key: "綠建材低碳", qs: [
      "綠建材標章", "低碳建材", "建材 減碳 淨零", "循環建材 再生"] },
  { key: "室內設計", qs: [
      "室內設計 趨勢", "空間設計 材質", "商空 裝修 設計", "飯店 翻新 設計"] },
  { key: "公設與都更", qs: [
      "社區 公設 修繕", "危老 都更 外牆", "老屋 翻新 公寓", "物業管理 公共空間"] },
  { key: "健康建材", qs: [
      "甲醛 建材 檢測", "抗菌 建材 醫療", "室內空氣品質 裝修", "長照 空間 建材"] },
];

const RSS = q =>
  "https://news.google.com/rss/search?q=" + encodeURIComponent(q) +
  "&hl=zh-TW&gl=TW&ceid=TW:zh-Hant";

const dec = s => String(s || "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/<[^>]+>/g, "").trim();

function parseRss(xml) {
  const out = [];
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const it of items) {
    const g = re => { const m = it.match(re); return m ? dec(m[1]) : ""; };
    const title = g(/<title>([\s\S]*?)<\/title>/);
    if (!title) continue;
    const srcM = it.match(/<source[^>]*url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/);
    out.push({
      /* Google News 的標題結尾會帶「 - 媒體名」，來源另有欄位，重複所以去掉 */
      title: title.replace(/\s+-\s+[^-]{2,20}$/, "").trim(),
      url: g(/<link>([\s\S]*?)<\/link>/),
      date: g(/<pubDate>([\s\S]*?)<\/pubDate>/),
      source: srcM ? dec(srcM[2]) : "",
      sourceUrl: srcM ? srcM[1] : "",
      id: (g(/<guid[^>]*>([\s\S]*?)<\/guid>/) || g(/<link>([\s\S]*?)<\/link>/)).slice(-40),
    });
  }
  return out;
}

/* 同一則新聞常有七八家媒體轉載，標題只差幾個字。
   取標題中的中文字做特徵，重疊過高就視為同一則。 */
function keyOf(t) {
  return (t.match(/[一-鿿]/g) || []).join("").slice(0, 24);
}
function dedupe(items, seenKeys) {
  const out = [];
  for (const it of items) {
    const k = keyOf(it.title);
    if (!k || k.length < 6) continue;
    let dup = false;
    for (const s of seenKeys) {
      let hit = 0;
      for (const ch of new Set(k)) if (s.includes(ch)) hit++;
      if (hit / new Set(k).size > 0.72) { dup = true; break; }
    }
    if (dup) continue;
    seenKeys.add(k);
    out.push(it);
  }
  return out;
}

async function gemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("缺 GEMINI_API_KEY");
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    });
  if (!r.ok) throw new Error("Gemini " + r.status + " " + (await r.text()).slice(0, 200));
  const j = await r.json();
  const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  try { return JSON.parse(txt); } catch { return []; }
}

/* 產生「煌盛解讀」原創短文。

   為什麼是自己寫而不是改寫報導：
     著作權法保護的是「表達」不是「事實」，單純傳達事實的新聞報導本身
     也不受保護；但把某篇報導改寫成另一篇屬於「改作」，是著作權人的專有權利，
     改寫並不會讓它變成自己的東西。
   所以這裡的做法是：從多則報導的標題交叉確認「發生了什麼事」，
   再由煌盛的專業角度寫一篇原創短文 —— 重點放在「這對你的案子意味什麼」，
   那本來就是原文沒有的內容，底部再列出所有參考來源。 */
const PROMPT = (list) => `你是台灣建材公司「煌盛興業」的內容編輯。

公司產品「藝格板」：以 PrinTex™ 數位紋理技術製作的裝飾板材，通過耐燃一級，
鋁基材、重量約天然石材的 1/30，有 SGS 抗菌與無甲醛檢測。
主要用於防火門、消防箱、檢修門、弱電箱的「表面美化」（不更換整扇門），
以及牆面、天花板、電視牆、公設空間。
客戶：建商、營造廠、建築師、室內設計師、社區物管與管委會。

以下是近期新聞「標題」清單。★ 你只看得到標題，沒有內文。★

請做三件事：

一、篩掉不相關的。一律排除：房價房市、個股財報法說會、單一公司的宣傳稿與
    開幕活動、與建材及防火安全無關的社會新聞。

二、把講同一件事的標題歸成一組（不同媒體常報導同一事件）。

三、每一組寫成一篇繁體中文短文，結構固定為三段：
    第一段「發生什麼事」：只陳述這組標題共同指向的事實。
    第二段「對你的工程意味什麼」：對上述客戶群的實務影響。
    第三段「實務上怎麼處理」：可行的處理方向。
      只有在議題本身就與防火門、消防箱、檢修門、公設美化相關時，
      才可以提到「表面美化」與「整扇更換」是兩種選項。
      其他主題（設計趨勢、綠建材、健康建材等）就純粹談該主題，
      不要硬把話題拉回自家產品 —— 硬推銷會讓整頁失去可信度。
      任何情況下都不要保證規格或效果。

★★ 絕對禁止 ★★
  · 不可以補充標題沒有說的事實、數字、金額、日期、法條條號、機關名稱。
  · 不可以改寫或轉述任何一篇報導的內文（你也看不到內文）。
  · 不確定的地方就寫「依各報導指出」「實際規定以主管機關公告為準」。
  · 不要宣稱藝格板符合任何未在上文列出的規格。

輸出 JSON 陣列，每個元素：
{"idx": [這一組的原索引數字],
 "topic": 從這幾個擇一："防火法規"、"耐燃安全"、"綠建材低碳"、"室內設計"、"公設與都更"、"健康建材",
 "title": "煌盛自己的標題，不要照抄新聞標題，20字以內",
 "body": "三段短文，段落之間用 \\n\\n 分隔，總長 250-400 字"}

不相關的就不要出現在陣列裡。

標題清單：
${list.map((x, i) => `${i}. ${x.title}（${x.source}）`).join("\n")}`;

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  /* 只允許 Vercel Cron 或帶正確密碼的手動觸發 —— 這支會花 Gemini 費用 */
  const isCron = !!req.headers["x-vercel-cron"];
  const key = (req.query && req.query.key) || "";
  if (!isCron && key !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "unauthorized" });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "blob_not_configured" });
  }

  try {
    /* ---- 讀取現有佇列 ---- */
    let data = { updated: "", items: [] };
    try {
      const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
      if (blobs?.[0]?.url) {
        const r = await fetch(blobs[0].url + "?t=" + Date.now(), { cache: "no-store" });
        if (r.ok) data = await r.json();
      }
    } catch (e) { /* 第一次執行時還沒有這個檔案，屬正常 */ }
    if (!Array.isArray(data.items)) data.items = [];

    /* 已收錄過的原始報導：一篇解讀對應多則報導，所以要把 sources 全部展開，
       否則同一則新聞下次會被別的關鍵字再抓一次。 */
    const seen = new Set();
    const seenIds = new Set();
    for (const x of data.items) {
      (x.ids || [x.id]).forEach(i => i && seenIds.add(i));
      (x.sources || []).forEach(s => { const k = keyOf(s.title); if (k) seen.add(k); });
      if (!x.sources && x.title) { const k = keyOf(x.title); if (k) seen.add(k); }
    }

    /* ---- 抓取 ----
       六類主題共二十幾組關鍵字，逐一序列抓會超過 Serverless 的執行時限，
       因此並行發出；單一來源失敗不影響其他（allSettled）。 */
    const jobs = [];
    for (const t of TOPICS)
      for (const q of t.qs)
        jobs.push(
          fetch(RSS(q), { headers: { "User-Agent": "Mozilla/5.0 (compatible; EGRRA-news/1.0)" } })
            .then(r => (r.ok ? r.text() : ""))
            .then(xml => parseRss(xml).slice(0, PER_QUERY)
              .filter(x => !seenIds.has(x.id))
              .map(x => ({ ...x, topic: t.key })))
            .catch(() => []));
    const results = await Promise.allSettled(jobs);
    let fresh = results.flatMap(r => (r.status === "fulfilled" ? r.value : []));

    /* 各主題輪流取，避免某一類新聞特別多就把其他類擠掉 */
    const byTopic = new Map();
    for (const x of fresh) {
      if (!byTopic.has(x.topic)) byTopic.set(x.topic, []);
      byTopic.get(x.topic).push(x);
    }
    const rr = [];
    for (let i = 0; ; i++) {
      let any = false;
      for (const arr of byTopic.values()) if (arr[i]) { rr.push(arr[i]); any = true; }
      if (!any) break;
    }
    fresh = dedupe(rr, seen).slice(0, MAX_TO_AI);

    if (!fresh.length) {
      return res.status(200).json({ ok: true, fetched: 0, kept: 0, note: "沒有新項目" });
    }

    /* ---- 交給 Gemini 歸組並寫成原創短文 ---- */
    let picked = [];
    let aiOk = true;
    try {
      picked = await gemini(PROMPT(fresh));
    } catch (e) {
      /* AI 掛掉不該讓整批消失：原樣收進來，內文留空由人工處理 */
      aiOk = false;
      picked = fresh.map((_, i) => ({ idx: [i], topic: fresh[i].topic, title: "", body: "" }));
    }

    const now = new Date().toISOString();
    const added = [];
    for (const p of Array.isArray(picked) ? picked : []) {
      const idxs = (Array.isArray(p.idx) ? p.idx : [p.idx])
        .map(Number).filter(i => fresh[i]);
      if (!idxs.length) continue;
      const srcs = idxs.map(i => ({
        title: fresh[i].title, source: fresh[i].source,
        url: fresh[i].url, date: fresh[i].date,
      }));
      added.push({
        /* 一篇解讀可能對應多則報導，id 取第一則的，避免下次重複收錄 */
        id: fresh[idxs[0]].id,
        ids: idxs.map(i => fresh[i].id),
        topic: String(p.topic || fresh[idxs[0]].topic || "").slice(0, 20),
        title: String(p.title || fresh[idxs[0]].title || "").slice(0, 60),
        body: String(p.body || "").slice(0, 1600),
        sources: srcs,
        aiOk,
        status: "pending",
        addedAt: now,
      });
    }
    /* 同一批裡若有多組共用同一則來源，只留第一組，避免重複文章 */
    const usedIds = new Set();
    const uniq = [];
    for (const a of added) {
      if (a.ids.some(x => usedIds.has(x))) continue;
      a.ids.forEach(x => usedIds.add(x));
      uniq.push(a);
    }
    data.items = uniq.concat(data.items);

    /* 超量時只淘汰已處理過的舊項目，待審的一律保留 */
    if (data.items.length > MAX_KEEP) {
      const pending = data.items.filter(x => x.status === "pending");
      const rest = data.items.filter(x => x.status !== "pending")
        .slice(0, Math.max(0, MAX_KEEP - pending.length));
      data.items = pending.concat(rest);
    }
    data.updated = now;

    await put(BLOB_PATH, JSON.stringify(data), {
      access: "public", addRandomSuffix: false, allowOverwrite: true,
      contentType: "application/json; charset=utf-8", cacheControlMaxAge: 0,
    });

    return res.status(200).json({
      ok: true, fetched: fresh.length, kept: added.length,
      total: data.items.length,
      pending: data.items.filter(x => x.status === "pending").length,
    });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
