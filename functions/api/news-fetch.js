/* =========================================================================
   煌盛興業 EGRRA — 產業新聞蒐集（Cloudflare Pages Function）
   端點路徑：/api/news-fetch?key=後台密碼
   ---------------------------------------------------------------------------
   抓取與產品線相關的新聞，過濾雜訊後寫進待審佇列。
   ★ 抓進來的一律是「待審」，不會自動上線。★

   關於內容的重要限制（沿用 Vercel 版的判斷，不要改）：
     Google News 的 RSS 只提供標題、來源、日期、連結，沒有內文片段。
     因此這裡不轉述任何一篇報導，而是從同議題的多則標題交叉確認事實，
     再由煌盛的角度寫成原創短文。摘要一篇沒讀過的文章就是編造，
     所以 prompt 明確禁止補充標題沒說的內容。

     著作權法保護的是「表達」不是「事實」，單純傳達事實的新聞報導本身
     也不受保護；但把某篇報導改寫成另一篇屬於「改作」，是著作權人的專有
     權利 —— 改寫不會讓它變成自己的東西。所以一定要是原創觀點加來源連結。

   ★★ 搬到 Cloudflare 後的三個必要改動 ★★

   1. 沒有 cron 可用
      Cloudflare Pages 不支援 Cron Triggers（那是 Workers 專屬功能），
      wrangler.toml 裡寫 [triggers] 會被忽略。改成由 /api/news 在被瀏覽時
      檢查「距離上次抓取是否超過 STALE_HOURS」，是就用 waitUntil 在背景
      觸發這支 —— 零額外基礎設施，訪客也不會多等。

   2. 一次只抓一個主題（輪流）
      原本一次抓 7 個主題共二十幾組關鍵字、70 則丟給 AI。免費方案每次
      呼叫只有 10 ms CPU，光解析那些 RSS 就爆了。改成依日期輪一個主題，
      七天走完一輪。反正一天只產一篇，抓再多也是浪費。

   3. 去重的 O(n²) 要修
      原本 dedupe() 把 new Set(k) 寫在內層迴圈裡，每比對一個既有鍵就重建
      一次集合；再乘上佇列裡所有項目的所有來源（300 篇 × 6 則），
      單次呼叫就是幾百萬次字元搜尋。現在：集合只建一次、只跟最近的項目
      比對、而且先用 id 做 O(1) 的精確比對擋掉大多數。
   ========================================================================= */

import { hasStore, json, checkPw } from "../_lib/store.js";
import { loadConfig, loadQueue, saveQueue } from "../_lib/news-store.js";

const MAX_KEEP = 120;          /* 佇列上限。原本 300，調小是為了壓低 JSON.stringify
                                  的 CPU —— 每次寫回都要序列化整份佇列。 */
const PER_QUERY = 12;          /* 每個關鍵字最多看幾則 */
const MAX_TO_AI = 24;          /* 一次最多丟給 AI 幾則。只抓一個主題，用不到 70 則 */
const RECENT_KEYS = 40;        /* 去重只跟最近這幾篇的來源比對 */
const DEFAULT_ARTICLES = 1;    /* 一次只產出一篇。一次丟十幾篇待審，人不會真的
                                  一篇篇看，最後不是全發就是全放著。 */

/* ---- 每兩天一篇的節流 ----
   觸發來源有三個（這邊由訪客瀏覽驅動、Vercel 那邊還有 Cron、加上手動網址），
   節流因此放在 runFetch 自己，而不是放在任何一個觸發端 —— 只要兩個平台同時
   活著，光靠觸發端的間隔設定就會一天冒兩篇。 */
const MIN_HOURS = 40;          /* 有產出 → 至少隔 40 小時 */
const RETRY_HOURS = 6;         /* 空手而回 → 6 小時後可再試，不必空等兩天 */

function tooSoon(data) {
  const last = Date.parse(data.lastRunAt || "") || 0;
  if (!last) return 0;
  const need = (data.lastRunAdded > 0 ? MIN_HOURS : RETRY_HOURS) * 3600e3;
  const left = last + need - Date.now();
  return left > 0 ? left : 0;
}

const RSS = (q) =>
  "https://news.google.com/rss/search?q=" + encodeURIComponent(q) +
  "&hl=zh-TW&gl=TW&ceid=TW:zh-Hant";

const dec = (s) => String(s || "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/<[^>]+>/g, "").trim();

function parseRss(xml) {
  const out = [];
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const it of items) {
    const g = (re) => { const m = it.match(re); return m ? dec(m[1]) : ""; };
    const title = g(/<title>([\s\S]*?)<\/title>/);
    if (!title) continue;
    const srcM = it.match(/<source[^>]*url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/);
    out.push({
      /* Google News 的標題結尾會帶「 - 媒體名」，來源另有欄位，重複所以去掉 */
      title: title.replace(/\s+-\s+[^-]{2,20}$/, "").trim(),
      url: g(/<link>([\s\S]*?)<\/link>/),
      date: g(/<pubDate>([\s\S]*?)<\/pubDate>/),
      source: srcM ? dec(srcM[2]) : "",
      id: (g(/<guid[^>]*>([\s\S]*?)<\/guid>/) || g(/<link>([\s\S]*?)<\/link>/)).slice(-40),
    });
  }
  return out;
}

/* 同一則新聞常有七八家媒體轉載，標題只差幾個字。
   取標題中的中文字做特徵，重疊過高就視為同一則。 */
function keyOf(t) {
  return (String(t || "").match(/[一-鿿]/g) || []).join("").slice(0, 24);
}

function dedupe(items, seenSets) {
  const out = [];
  for (const it of items) {
    const k = keyOf(it.title);
    if (!k || k.length < 6) continue;
    /* ★ 集合只建一次。原本這行在內層迴圈裡，是整支最大的 CPU 熱點。 */
    const ks = new Set(k);
    let dup = false;
    for (const s of seenSets) {
      let hit = 0;
      for (const ch of ks) if (s.has(ch)) hit++;
      if (hit / ks.size > 0.72) { dup = true; break; }
    }
    if (dup) continue;
    seenSets.push(ks);
    out.push(it);
  }
  return out;
}

async function gemini(env, prompt) {
  const key = env.GEMINI_API_KEY;
  if (!key) throw new Error("缺 GEMINI_API_KEY");
  const model = env.GEMINI_MODEL || "gemini-2.5-flash";
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
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
  const txt = (((j.candidates || [])[0] || {}).content || {}).parts;
  try { return JSON.parse((txt && txt[0] && txt[0].text) || "[]"); } catch (e) { return []; }
}

const PROMPT = (list, TOPIC_KEYS) => `你是台灣建材公司「煌盛興業」的內容編輯。

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
 "topic": 從這幾個擇一：${TOPIC_KEYS},
 "title": "煌盛自己的標題，不要照抄新聞標題，20字以內",
 "body": "三段短文，段落之間用 \\n\\n 分隔，總長 250-400 字"}

不相關的就不要出現在陣列裡。

標題清單：
${list.map((x, i) => `${i}. ${x.title}（${x.source}）`).join("\n")}`;

/* 這支同時給 HTTP 手動觸發與 /api/news 的背景自動觸發用，
   所以主要邏輯抽出來，兩邊都呼叫這個。 */
export async function runFetch(env, want, force) {
  const data = await loadQueue(env);

  /* 兩天一篇的閘門。?force=1（需帶 key）可略過，供補一篇或測試 */
  const wait = force ? 0 : tooSoon(data);
  if (wait > 0) {
    return { ok: true, skipped: "too_soon", lastRunAt: data.lastRunAt,
             lastRunAdded: data.lastRunAdded || 0,
             nextAt: new Date(Date.now() + wait).toISOString(),
             hoursLeft: Math.round(wait / 3600e3 * 10) / 10 };
  }
  const stamp = (added) => { data.lastRunAt = new Date().toISOString(); data.lastRunAdded = added; };

  /* 已收錄過的原始報導：一篇解讀對應多則報導，所以要把 sources 全部展開，
     否則同一則新聞下次會被別的關鍵字再抓一次。 */
  const seenIds = new Set();
  const seenSets = [];
  data.items.slice(0, RECENT_KEYS).forEach((x) => {
    (x.ids || [x.id]).forEach((i) => i && seenIds.add(i));
    (x.sources || []).forEach((s) => { const k = keyOf(s.title); if (k) seenSets.push(new Set(k)); });
    if (!x.sources && x.title) { const k = keyOf(x.title); if (k) seenSets.push(new Set(k)); }
  });
  /* id 的精確比對很便宜，整份佇列都要看 —— 這是擋重複最有效的一道 */
  data.items.forEach((x) => (x.ids || [x.id]).forEach((i) => i && seenIds.add(i)));

  const CFG = await loadConfig(env);
  const TOPICS = CFG.topics.filter((t) => t.on !== false && Array.isArray(t.qs) && t.qs.length);
  if (!TOPICS.length) return { ok: true, fetched: 0, kept: 0, note: "沒有啟用的主題" };

  /* ★ 一次只抓一個主題，依「第幾天」輪流，七天走完一輪。
       一次抓七個主題二十幾組關鍵字，光解析 RSS 就會超過 10 ms CPU。 */
  const dayNo = Math.floor((Date.now() + 8 * 3600 * 1000) / 86400000);
  const topic = TOPICS[dayNo % TOPICS.length];

  const jobs = topic.qs.slice(0, 4).map((q) =>
    fetch(RSS(q), { headers: { "User-Agent": "Mozilla/5.0 (compatible; EGRRA-news/1.0)" } })
      .then((r) => (r.ok ? r.text() : ""))
      .then((xml) => parseRss(xml).slice(0, PER_QUERY)
        .filter((x) => !seenIds.has(x.id))
        .map((x) => ({ ...x, topic: topic.key })))
      .catch(() => []));

  const results = await Promise.allSettled(jobs);
  let fresh = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  fresh = dedupe(fresh, seenSets).slice(0, MAX_TO_AI);

  if (!fresh.length) {
    stamp(0);
    await saveQueue(env, data);
    return { ok: true, topic: topic.key, fetched: 0, kept: 0, note: "沒有新項目" };
  }

  let picked = [];
  let aiOk = true;
  try {
    picked = await gemini(env, PROMPT(fresh, TOPICS.map((t) => `"${t.key}"`).join("、")));
  } catch (e) {
    /* AI 掛掉不該讓整批消失：原樣收進來，內文留空由人工處理 */
    aiOk = false;
    picked = fresh.map((_, i) => ({ idx: [i], topic: fresh[i].topic, title: "", body: "" }));
  }

  const now = new Date().toISOString();
  const added = [];
  for (const p of Array.isArray(picked) ? picked : []) {
    const idxs = (Array.isArray(p.idx) ? p.idx : [p.idx]).map(Number).filter((i) => fresh[i]);
    if (!idxs.length) continue;
    /* 同一議題常有二三十家媒體轉載，全列出來版面會被來源淹沒。
       只留幾則有代表性的（不同媒體優先），總數另外記著。 */
    const seenSrc = new Set();
    const srcs = [];
    for (const i of idxs) {
      const f = fresh[i];
      const k = f.source || f.url;
      if (seenSrc.has(k)) continue;
      seenSrc.add(k);
      srcs.push({ title: f.title, source: f.source, url: f.url, date: f.date });
      if (srcs.length >= 6) break;
    }
    added.push({
      /* 一篇解讀可能對應多則報導，id 取第一則的，避免下次重複收錄 */
      id: fresh[idxs[0]].id,
      ids: idxs.map((i) => fresh[i].id),
      topic: String(p.topic || fresh[idxs[0]].topic || "").slice(0, 20),
      title: String(p.title || fresh[idxs[0]].title || "").slice(0, 60),
      body: String(p.body || "").slice(0, 1600),
      sources: srcs,
      srcCount: idxs.length,
      aiOk,
      /* AI 掛掉時內文是空的，那種一律留待審，不要讓空白文章上線 */
      status: (CFG.autoPublish && aiOk) ? "published" : "pending",
      ...((CFG.autoPublish && aiOk) ? { publishedAt: now, autoPublished: true } : {}),
      addedAt: now,
    });
  }

  /* 同一批裡若有多組共用同一則來源，只留第一組，避免重複文章 */
  const usedIds = new Set();
  let uniq = [];
  for (const a of added) {
    if (a.ids.some((x) => usedIds.has(x))) continue;
    a.ids.forEach((x) => usedIds.add(x));
    uniq.push(a);
  }
  /* 只留最值得看的幾篇：被越多家媒體報導的，通常就是越重要的事件 */
  const n = Math.max(1, Math.min(10, parseInt(want, 10) || DEFAULT_ARTICLES));
  uniq.sort((a, b) => (b.sources || []).length - (a.sources || []).length);
  const dropped = Math.max(0, uniq.length - n);
  uniq = uniq.slice(0, n);
  data.items = uniq.concat(data.items);

  /* 超量時只淘汰已處理過的舊項目，待審的一律保留 */
  if (data.items.length > MAX_KEEP) {
    const pending = data.items.filter((x) => x.status === "pending");
    const rest = data.items.filter((x) => x.status !== "pending")
      .slice(0, Math.max(0, MAX_KEEP - pending.length));
    data.items = pending.concat(rest);
  }
  data.updated = now;
  stamp(uniq.length);
  await saveQueue(env, data);

  return {
    ok: true, topic: topic.key, fetched: fresh.length, kept: uniq.length, dropped,
    total: data.items.length,
    autoPublish: CFG.autoPublish,
    publishedNow: uniq.filter((x) => x.status === "published").length,
    pending: data.items.filter((x) => x.status === "pending").length,
    nextAt: new Date(Date.now() + (uniq.length ? MIN_HOURS : RETRY_HOURS) * 3600e3).toISOString(),
  };
}

export async function onRequestGet({ request, env }) {
  /* 這支會花 Gemini 費用，一定要帶密碼 */
  const q = new URL(request.url).searchParams;
  if (!checkPw(env, q.get("key"))) return json({ error: "unauthorized" }, { status: 401 });
  if (!hasStore(env)) return json({ error: "kv_not_configured" }, { status: 500 });

  try {
    return json(await runFetch(env, q.get("n"), q.get("force") === "1"));
  } catch (e) {
    return json({ error: "server_error", detail: String((e && e.message) || e) }, { status: 500 });
  }
}
