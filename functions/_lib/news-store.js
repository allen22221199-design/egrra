/* =========================================================================
   煌盛興業 EGRRA — 產業新聞的共用資料存取
   ---------------------------------------------------------------------------
   news.js（讀取／後台審核）與 news-fetch.js（蒐集）都要用這些。
   抽出來是為了避免兩支互相 import 形成循環 —— 而且 /api/news 被瀏覽時
   會在背景觸發 news-fetch，那個方向的相依一定要是單向的。
   ========================================================================= */

import { getText, put } from "./store.js";

export const QUEUE_KEY = "news/queue.json";
export const CONFIG_KEY = "news/config.json";

/* 預設追蹤主題。實際使用哪些、關鍵字寫什麼，都可以在後台「追蹤主題」調整，
   設定存在 news/config.json；沒有設定檔時就用這一份。

   關鍵字刻意寫得具體 —— 只打「建材」兩個字會抓回一堆上市公司財報與開幕
   新聞稿；具體的詞才問得出有用的東西。抓回來之後還有 AI 過濾與人工審核。 */
export const DEFAULT_TOPICS = [
  { key: "土方與工期", on: true, qs: ["土方之亂", "營建剩餘土石方 去化", "土資場 棄土", "營建 缺工 缺料 工期"] },
  { key: "防火法規", on: true, qs: ["防火門 法規", "防火門 消防 安檢", "防火區劃 建築技術規則", "消防安全設備 檢修"] },
  { key: "耐燃安全", on: true, qs: ["耐燃 建材", "建材 防火 認證", "耐燃一級", "外牆 建材 火災"] },
  { key: "綠建材低碳", on: true, qs: ["綠建材標章", "低碳建材", "建材 減碳 淨零", "循環建材 再生"] },
  { key: "室內設計", on: true, qs: ["室內設計 趨勢", "空間設計 材質", "商空 裝修 設計", "飯店 翻新 設計"] },
  { key: "公設與都更", on: true, qs: ["社區 公設 修繕", "危老 都更 外牆", "老屋 翻新 公寓", "物業管理 公共空間"] },
  { key: "健康建材", on: true, qs: ["甲醛 建材 檢測", "抗菌 建材 醫療", "室內空氣品質 裝修", "長照 空間 建材"] },
];

export async function loadTopics(env) {
  try {
    const t = await getText(env, CONFIG_KEY);
    if (t) {
      const c = JSON.parse(t);
      if (Array.isArray(c.topics) && c.topics.length) return c.topics;
    }
  } catch (e) { /* 沒有設定檔或格式壞掉就用預設，不要讓蒐集停擺 */ }
  return DEFAULT_TOPICS;
}

export async function loadQueue(env) {
  try {
    const t = await getText(env, QUEUE_KEY);
    if (!t) return { updated: "", items: [] };
    const d = JSON.parse(t);
    return { updated: d.updated || "", items: Array.isArray(d.items) ? d.items : [] };
  } catch (e) {
    return { updated: "", items: [] };
  }
}

export async function saveQueue(env, data) {
  await put(env, QUEUE_KEY, JSON.stringify(data));
}
