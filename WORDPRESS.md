# WordPress 相容性與移植評估

> 目標：把本專案做的內容，之後套用到**現有的 WordPress 官網（egrra.com）**。
> 本文件先評估相容性與風險，等業主通知再動工。

## 一、現有網站技術現況
- 平台：**WordPress**
- 佈景主題：**Maison**（Edge Themes / **Qode** 框架）
- 電商：**WooCommerce**（已有商品／product category）
- 既有結構：portfolio 自訂文章類型（實績案例）、Qode 元件
- 頁面編輯器：Qode 系列主題通常搭 **WPBakery（Visual Composer）**

## 二、逐元件相容性
| 元件 | 能套進 WP？ | 怎麼套 | 風險 / 注意 |
|---|---|---|---|
| 視覺設計（版面/CSS） | ⭕ 可，但非複製貼上 | 兩條路：①用頁面編輯器依設計重排＋自訂CSS ②做子主題自訂頁面模板 | 用 WPBakery 要 1:1 還原自訂設計較費工；漸層/材質特效需自訂 CSS/HTML |
| Google 字體 | ⭕ | 主題 enqueue 或外掛 | GDPR 可改自架字體 |
| 捲動動畫（JS） | ⭕ | enqueue 一支 JS | 幾乎零風險 |
| 材質示意圖（SVG） | ⭕（多會被真照片取代） | 有照片就用照片欄位 | 低 |
| **資料結構**（products/cases/info） | ⭕ 對應良好 | products→**WooCommerce 商品**（現站已有）；cases→**portfolio CPT**（現站已有）；info→佈景選項/ACF 選項頁 | 結構天生相容，好消息 |
| **後台 `admin.html`** | ❌ 不需移植 | **wp-admin 本身就是後台** | 被 WordPress 取代 |
| `localStorage`/`site-data.js` 機制 | ❌ 不需移植 | 內容改存 WP 資料庫 | 被 WordPress 取代 |
| **智能客服 `chatbot.js`** | ⭕ | 用「Custom HTML/JS」外掛或小外掛嵌入；資料來源由 `site-data.js` 改讀 **WP REST API**（`/wp-json/...`）或 `wp_localize_script` | 需改資料來源；快取外掛可能給舊資料 |
| **維護頁 `maintenance.html`** | ⭕ | 維護模式外掛貼 HTML，或改成 `maintenance.php` | 幾乎零風險 |

## 三、關鍵結論（很重要）
1. **「自助維護／後台編輯」在 WordPress 是原生功能** —— 不用另外做後台。
   你們用 **wp-admin** 就能改：WooCommerce 商品（花色）、portfolio（實績）、佈景選項（電話等）。
   我做的 `admin.html` 是給「純靜態站」用的，套 WordPress 時**用不到**（WP 更強：真資料庫、真登入、媒體庫）。
   → 若你要「自己改內容不求人」，做法是**把 WordPress 的內容結構設定好**（自訂欄位/關聯），而不是做新後台。
2. **設計是可移植的資產**：`index.html` 的 HTML/CSS 乾淨、與主題無關，可當「設計規格」交付施作。
3. **chatbot 幾乎照搬**：只要把資料來源換成 WP REST API 即可同步商品/案例。
4. **維護頁照搬**：任何 WordPress 都能用。

## 四、相容性風險清單（先想好）
- 現站是 **Qode/Maison + WPBakery**：要 100% 還原自訂設計，用頁面編輯器較吃力；較乾淨的是「**子主題 + 自訂頁面模板**」直接放我的 HTML/CSS。此決定影響工時。
- **WooCommerce 商品已存在**：花色建議**沿用 WooCommerce**（現站就是），不要另做 CPT 以免資料重複。
- **實績沿用現有 portfolio CPT**。
- 「每個案例反連到所用花色」現站缺 → 用 **ACF 關聯欄位**補（導購關鍵）。
- **快取外掛**若有，會影響 chatbot 即時資料 → 走 REST + 適當快取標頭。
- 中文字型、SEO（每個花色/案例獨立網址）WordPress 原生支援，反而比靜態站好。

## 五、建議移植路線（等通知動工）
- **路線 A（省時）**：沿用 Maison 主題，用 WPBakery 依新設計重排＋自訂 CSS；商品/案例沿用現有 WooCommerce/portfolio；chatbot 用外掛嵌入。
  → 快、成本低，但設計還原度受頁面編輯器限制。
- **路線 B（高質感）**：做 Maison **子主題 + 自訂頁面模板**，直接用本專案的 HTML/CSS/JS；內容仍走 wp-admin。
  → 設計 1:1 還原，工時較多。

**建議**：以你要的高質感，傾向 **路線 B**；也可先 A 快速上線、再逐步升級。

## 六、目前這批檔案在 WordPress 上的定位
| 檔案 | WordPress 上的角色 |
|---|---|
| `index.html` + CSS | 設計規格 / 子主題模板來源 |
| `site-data.js` | 內容範本（實際內容改由 wp-admin 管理） |
| `admin.html` | 靜態站用；WP 版由 wp-admin 取代（不移植） |
| `chatbot.js` | 幾乎照搬，資料來源改 REST API |
| `maintenance.html` | 維護模式頁，直接套用 |
