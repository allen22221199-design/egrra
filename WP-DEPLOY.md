# WordPress 部署指南（egrra.com）

> ⚠️ **前提**：部署需要 WordPress 後台（wp-admin）**管理員權限**。
> 我無法從遠端替你登入你們的站，所以這一步必須由**你 / 你的工程師 / 或你授權我**在有權限的環境操作。
> 若沒有帳密：向管理你們站的設計或主機廠商索取管理員帳號。

現有站：**Maison 主題（Qode 框架）+ WooCommerce + portfolio**。以下分兩種規模。

---

## 路線 A：快速上線包（建議先做，最快、不動主題）

把「智能客服、LINE 按鈕、認證頁、基材切換器」加到**現有站**，用免費外掛貼上即可。

### A-1　上傳檔案到 WordPress
把這些檔案上傳（媒體庫，或用 FTP 放到 `/wp-content/uploads/egrra/`）：
`site-data.js`、`chatbot.js`、`line-widget.js`、`textures.js`
上傳後記下每個檔案的**網址**（媒體庫點檔案會顯示 URL）。
> 若媒體庫擋 `.js`，改用 FTP，或用下方 A-2 的「直接貼原始碼」方式。

### A-2　全站加上「智能客服 + LINE 按鈕」
安裝免費外掛 **WPCode**（原 Insert Headers and Footers）或 **Code Snippets** →
到「**頁尾（Footer / Body）**」貼上：
```html
<script src="{site-data.js 的網址}"></script>
<script src="{chatbot.js 的網址}"></script>
<script src="{line-widget.js 的網址}"></script>
```
存檔 → 每一頁右下角就會出現**客服**與**LINE 按鈕**。
> 改 LINE 網址：編輯 `site-data.js` 裡的 `info.line` 再重新上傳即可。
> （我也可以把這三個合併成一支 `egrra-widgets.js`，只貼一行。）

### A-3　新增「認證與規範」頁
WordPress →「頁面」→ 新增頁面「認證與規範」→ 加一個「**自訂 HTML**」區塊 →
貼入我提供的 `wp-embed-certifications.html`（**自帶樣式、貼上即用**）。

### A-4　把「基材切換器」放到某頁
在你要的頁面（例如產品頁）加「**自訂 HTML**」區塊 →
貼入我提供的 `wp-embed-substrate.html`（**自帶樣式＋程式，貼上即用**）。

✅ 完成後，現有站就有：客服、LINE、認證頁、基材切換器。**不需改主題、不需工程師。**

---

## 路線 B：完整改版（設計 1:1 還原，維護無程式碼）

把**首頁 / 花色庫 / 案例牆**整套做成 WordPress 原生，之後在 wp-admin 填表單就能維護。

### 建置步驟（需工程作業，建議在**測試站**做）
1. **建 Maison 子主題**（不動原主題，升級不怕被蓋掉）。
2. **內容結構（ACF 自訂欄位）**
   - 花色 → 沿用 **WooCommerce 商品**，加欄位：系列、材質底色、尺寸、表面處理、產品照。
   - 實績 → 沿用 **portfolio**，加欄位：地區、類別、年份、現場照、**關聯到使用的花色**。
   - 網站資訊（電話/傳真/FB/LINE/首頁簡介/關於/理念）→ **ACF 選項頁**。
3. **自訂頁面模板**：把本專案 `index / products / cases / certifications` 的設計做成模板，自動讀上面欄位渲染；含花色庫/案例牆的篩選、基材切換器、客服、LINE。
4. **日常維護**：進 wp-admin →「商品」加花色 /「作品集」加案例 → 填欄位、傳圖、發布 → **全程無程式碼**。

### 動工需要
- WordPress **管理員存取**
- 建議先開一個 **staging 測試站**（不影響現有線上站）
- 工程時間

---

## 我現在可以幫你備好（都不需要你的帳密）
- ✅ `wp-embed-certifications.html`、`wp-embed-substrate.html`（貼上即用）
- `egrra-widgets.js`（客服＋LINE＋資料，合併一檔）
- 路線 B 的 **ACF 欄位清單** 與 **模板規格書**（交給工程師照做）

跟我說要走 **A** 還是 **B**（或兩者：先 A 上線、再 B 改版），我就把對應檔案生出來。
