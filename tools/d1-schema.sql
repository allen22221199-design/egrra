-- =========================================================================
-- 煌盛興業 EGRRA — 流量統計資料表（Cloudflare D1）
-- ---------------------------------------------------------------------------
-- 原本 Vercel 版是「每個 session＋頁面各存一個 Blob 檔案」，因為 Blob 沒有
-- 原子更新，共用一個計數檔必然掉資料。D1 是 SQLite，有交易保證，用
-- INSERT ... ON CONFLICT 就能安全地「只更新自己那筆」，不必再靠檔案切割。
--
-- 為什麼統計不放 KV：track 是每個 session 每頁寫一筆，KV 免費方案每天只有
-- 1000 次寫入，會被瀏覽量直接吃掉。D1 免費是每天 10 萬次寫入、500 萬次讀取。
--
-- 建立方式：
--   Workers & Pages → D1 → Create database（名稱 egrra-stats）
--   → Console 貼上這份 SQL 執行
-- =========================================================================

CREATE TABLE IF NOT EXISTS sessions (
  sid      TEXT    NOT NULL,              -- 前端產生的工作階段代碼，非個資
  page     TEXT    NOT NULL,              -- 路徑，例如 /cases.html
  day      TEXT    NOT NULL,              -- 台灣日期 YYYY-MM-DD，後台看到的「今天」才符合直覺
  sec      INTEGER NOT NULL DEFAULT 0,    -- 停留秒數
  scroll   INTEGER NOT NULL DEFAULT 0,    -- 捲動百分比
  device   TEXT    NOT NULL DEFAULT 'desktop',
  source   TEXT    NOT NULL DEFAULT 'direct',
  lang     TEXT    NOT NULL DEFAULT 'zh',
  events   TEXT    NOT NULL DEFAULT '{}', -- JSON 字串
  sections TEXT    NOT NULL DEFAULT '[]', -- JSON 字串
  ts       INTEGER NOT NULL,
  PRIMARY KEY (sid, page)
);

-- 後台統計幾乎都是「查某一天」或「查最近 N 天」，沒有這個索引會全表掃描
CREATE INDEX IF NOT EXISTS idx_sessions_day ON sessions(day);

-- 不儲存 IP、不寫 cookie、不含任何個資。
