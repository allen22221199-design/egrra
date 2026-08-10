/* =========================================================================
   煌盛興業 EGRRA — 網站內容資料 (預設值)
   這個檔案是「官網 index.html」與「後台 admin.html」共用的內容來源。
   後台修改後會存進瀏覽器 localStorage('egrra_data')，官網優先讀 localStorage，
   沒有才用這裡的預設值。要讓「所有訪客」都看到新內容，需在後台「匯出 data」，
   再把匯出的內容更新到這個檔案並重新部署（或改用有後台的 CMS，見 README）。
   ========================================================================= */
window.EGRRA_DEFAULT_DATA = {

  /* dataVersion：程式端內容版本。後台「發布上線」的快照若版本較舊，
     官網會自動忽略它、沿用這裡的新內容（避免舊快照蓋掉新資料）。

     ★★ 一定要填「真實的 UTC 時間」，絕對不可以填未來時間 ★★
     api/save.js 在發布當下蓋的是真實 UTC 時間。這裡若填了還沒到的時間，
     使用者不管什麼時候按「發布上線」，快照都會被判定成過期而整份被忽略，
     後台改了半天官網卻沒動 —— 而且沒有任何錯誤訊息，極難察覺。
     （2026-08-05 就是這樣：這裡填了 14:00:00Z，使用者 09:10:42Z 發布的
       37 件案例與相簿因此被丟掉。）
     在程式端改內容時，改成「當下」的 UTC 時間即可；若不確定現在幾點，
     寧可填早一點 —— 頂多是這次改的內容要請對方重按一次發布，
     不會把對方已經發布的東西弄不見。 */
  dataVersion: "2026-08-05T09:30:00Z",

  /* ★★ sectionVersions —— 在這個檔案裡直接新增實績案例或產品花色時，一定要更新 ★★

     宣告「這一區是程式端在什麼時候更新的」。比對象新就以程式端的那一區為準，
     其餘維持原本的優先順序。三個地方都會讀它：
       api/published.js  已發布快照 vs 程式端 → 決定官網看到哪一份
       admin.html        後台草稿   vs 程式端 → 把新內容同步進後台，其餘編輯保留
       EGRRA_LOCAL()     官網預覽草稿 vs 程式端 → 同上

     沒有這個機制的話，兩邊只能二選一：整份以快照為準，程式端新增的花色會被蓋掉；
     整份以程式端為準，使用者在後台發布的案例與相簿會整批消失。

     ── 在程式端新增內容後要做的事 ──
       1. 把對應區塊的時間改成「當下的真實 UTC 時間」（cases 或 products）
       2. 主 dataVersion 不要動 —— 調高會讓整份已發布快照被判過期，
          使用者發布的內容會全部消失
       3. 時間絕不可填未來，理由同上面 dataVersion 的說明 */
  sectionVersions: {
    products: "2026-08-06T10:30:00Z",   /* 鏽蝕錯字修正；單色系列補上色系標籤 */
    cases:    "2026-08-10T03:15:00Z"   /* 同步後台 37 件並補全地區 */
  },

  /* ---- 網站資訊（可在後台「網站資訊」分頁修改）---- */
  info: {
    phone: "02 . 2222 . 1199",
    phoneRaw: "0222221199",
    fax: "02 . 2228 . 6799",
    fb: "https://www.facebook.com/PrinTex22221199",
    fbName: "大理石魔術師呂哥",
    tiktok: "https://www.tiktok.com/@marblemetal",
    tiktok2: "https://www.tiktok.com/@lulu_11995",
    line: "https://line.me/R/ti/p/@egrra",
    lineId: "@egrra",
    heroSub: "煌盛興業 — 專為建築與設計市場打造的數位紋理品牌。從紋理開發到成品，提供全方位的裝修建材解決方案。",
    aboutP1: "",
    aboutP2: "煌盛興業是專為建築、設計市場打造的數位紋理品牌，已累積超過 46 年以上經驗，擅長色彩控管、圖紋製作等設計，提供從紋理開發到成品的全方位解決方案。",
    mission: "「提供最優質的裝修建材，傳承過去、延續現今、開創未來，站穩業界的領導品牌；並為減少石材開採、保護大自然，盡一份棉薄之力。」"
  },

  /* ---- 產品花色（後台「產品花色」分頁可增刪改）----
     stone = 紋理底色代號，官網沒放實際照片時用它程式生成材質圖。
     可選：carrara(白/大理石) beige(米黃) amber(琥珀棕) gold(金) black(黑)
           purple(紫黑) darkgrey(深灰) grey(灰) silver(銀/淺) rust(鏽蝕) wood(木紋)
     img = 產品照(可留空，後台上傳後會是一段 data 圖檔字串) */

  /* ================= 競品比較 =================
     每個 cell：v=主要內容、note=補充說明、dim=灰字（資料來源／限制說明）、
     flag="win"(該項優勝) / "limit"(競品限制) / "top"(壓倒性優勝)。
     public:false 的表格不會顯示在官網（可留著給業務簡報用）。
     ※ 競品數值一律附出處與查詢日期；查不到公開數據的就寫「查無公開數據」，不臆測。 */
  compare: {
    title: "競品比較",
    lead: "同樣要做一面石紋牆，選擇不只一種。以下把常見工法與同類板材的規格逐項攤開，數據皆註明出處。",
    tables: [
      {
        id: "method", public: true,
        name: "工法・材料比較",
        sub: "同樣要一面石紋牆，四種常見做法的差異",
        us: { name: "藝格板 PrinTex™", sub: "紋理複刻技術" },
        cols: [
          { name: "轉印膜／貼皮", sub: "表面貼膜" },
          { name: "手繪／仿石漆", sub: "模板噴塗" },
          { name: "天然石材", sub: "開採切割" }
        ],
        rows: [
          { label: "技術原理", group: "紋理表現",
            us: { v: "紋理複刻技術" },
            cells: [ { v: "表面貼膜" }, { v: "模板噴塗／仿石噴漆" }, { v: "自然開採、切割加工" } ] },
          { label: "紋理真實度", group: "紋理表現",
            us: { big: "極高", v: "可達真石材視覺 ＋ 立體觸感", flag: "win" },
            cells: [ { v: "中低" }, { v: "中" }, { v: "極高", note: "本身即為真石材", flag: "win" } ] },
          { label: "紋理立體層次", group: "紋理表現",
            us: { v: "可控制浮雕高度／層次", flag: "win" },
            cells: [ { v: "幾乎無" }, { v: "輕微立體感" }, { v: "礦物層次、具光影變化", note: "天然礦脈形成，無可複製", flag: "win" } ] },
          { label: "圖紋檔案管理", group: "設計與客製",
            us: { v: "數位檔案留存", note: "可編修、可客製衍伸", flag: "win" },
            cells: [ { v: "無檔案，單次貼附" }, { v: "多依模板手工" }, { v: "不可控、無法備份" } ] },
          { label: "客製設計彈性", group: "設計與客製",
            us: { v: "高", note: "少量多樣、任意設計", flag: "win" },
            cells: [ { v: "低", note: "多固定花色" }, { v: "中", note: "部分客製" }, { v: "低", note: "依礦脈決定" } ] },
          { label: "適用基材", group: "設計與客製",
            us: { v: "金屬、玻璃、木板、複合板", note: "多種基材皆可", flag: "win" },
            cells: [ { v: "平面板材" }, { v: "金屬、部分塑材" }, { v: "僅限天然石材本身" } ] },
          { label: "耐候性／耐久性", group: "耐用與安全",
            us: { v: "極佳", note: "戶外級保護層", flag: "win" },
            cells: [ { v: "易脫落、耐候差", flag: "limit" }, { v: "良好", note: "視塗裝工藝" }, { v: "易褪色、需定期保養", flag: "limit" } ] },
          { label: "防火／耐燃性", group: "耐用與安全",
            us: { v: "極佳", note: "鋁板不燃基材 ＋ 耐高溫", flag: "win" },
            cells: [ { v: "多依基材而定" }, { v: "良好", note: "搭配金屬基材" }, { v: "佳", note: "石材本身不燃", flag: "win" } ] },
          { label: "成本結構", group: "成本與總結",
            us: { v: "中", note: "技術投入較高" },
            cells: [ { v: "低～中", note: "四者中最低", flag: "win" }, { v: "中" }, { v: "中～高", note: "採礦＋加工＋運輸" } ] },
          { label: "適用項目", group: "成本與總結",
            us: { v: "牆面、天花板、門板（單開／雙開）", note: "公共空間、室內裝修、藝術專案、公設箱體等" },
            cells: [ { v: "室內牆、傢俱面" }, { v: "建築外牆、室內包柱" }, { v: "地坪、檯面、建築牆面", note: "可用於地坪與檯面，藝格板不適用", flag: "win" } ] },
          { label: "主要優勢", group: "成本與總結",
            us: { v: "高仿真立體、數位化、跨材質", note: "客製彈性最高", flag: "win" },
            cells: [ { v: "成本低、量產快" }, { v: "色彩自然、施工普及" }, { v: "供應穩定", note: "但紋理、色澤不可控" } ] },
          { label: "主要侷限", group: "成本與總結",
            us: { v: "需專業設備及技術整合" },
            cells: [ { v: "耐久性差、無立體感" }, { v: "圖紋有限、立體感低、人為品質不可控" }, { v: "紋理不可控、重量過重、加工困難、高成本、設計受限" } ] }
        ],
        srcs: "資料來源：煌盛興業《煌盛》簡報型錄（2026 年）"
      },
      {
        id: "panel", public: true,
        name: "同類板材規格比較",
        sub: "與市面常見裝飾板材的規格逐項比對",
        us: { name: "藝格板 PrinTex™", sub: "煌盛興業" },
        cols: [
          { name: "富美家玻利板", sub: "Formica HPL" },
          { name: "AICA 愛克板", sub: "CERARL" }
        ],
        rows: [
          { label: "尺寸・厚度", group: "規格與應用",
            us: { big: "150×300", unit: "cm（最大板幅）", v: "厚度 0.1–9.5 cm", note: "工業鋁板，板幅與厚度範圍皆最廣", flag: "win" },
            cells: [ { v: "4′×8′ × 1.0mm", note: "彎板 0.7mm，須貼覆基材" },
                     { v: "3mm 單一厚度", note: "常備 935×1,855／935×2,455mm；訂製最大 1,235×3,070mm" } ] },
          { label: "使用場域", group: "規格與應用",
            us: { v: "牆面・天花板・防火門・弱電箱・消防箱・公設", note: "單／雙開門、辦公室隔間、會議廳、電視牆、包柱", flag: "win" },
            cells: [ { v: "僅室內", note: "傢俱、櫥櫃、檯面、壁面", flag: "limit" },
                     { v: "僅室內", note: "廚衛、店鋪、餐飲、醫院、車站", flag: "limit" } ] },
          { label: "防水性", group: "耐用性能",
            us: { v: "鋁基材不吸水、不氧化", note: "三塗三烤塗層封閉表面", flag: "win" },
            cells: [ { v: "板材僅 1.0mm，須貼基材", note: "黏貼縫隙、基材受潮易脫層剝離", dim: "官方測試含耐沸水性，無獨立防水／吸水率數據", flag: "limit" },
                     { v: "3mm 可直貼濕區牆面，耐濕", dim: "查無吸水率數據", flag: "win" } ] },
          { label: "耐候性", group: "耐用性能",
            us: { v: "耐紫外線・不褪色・不氧化", note: "三塗三烤製程；室內可長期保持色澤與質感，無需保養", flag: "win" },
            cells: [ { v: "不建議戶外", note: "長期日曬濕氣易劣化", dim: "依官方使用說明定位為室內用途", flag: "limit" },
                     { v: "定位室內", dim: "查無戶外耐候數據", flag: "limit" } ] },
          { label: "清潔・抗污性", group: "耐用性能",
            us: { v: "通過 SGS 抗菌認證", note: "中塗層含抗刮 ＋ UV", dim: "型錄標示特色含防污（抗菌塗層為選配）" },
            cells: [ { v: "抑制 7 種細菌及 5 種黴菌", note: "減少表面微生物達 99%", dim: "官方保養說明：忌研磨性及酸鹼性清潔劑，會造成不可回復的永久傷害" },
                     { v: "表面無毛細孔，清水可擦", note: "SIAA 抗菌認證為標配，抑菌約 99%", flag: "win" } ] },
          { label: "單位面積重量", group: "結構・重量・成本",
            us: { big: "1/30", unit: "天然石材的重量", v: "4尺×8尺 一片 8 kg／約 2.78 kg/㎡", note: "不需加強原結構或更換重型鉸鏈，可快速施工", dim: "屬完成面重量；富美家為面材重量，須另加基材合計", flag: "win" },
            cells: [ { v: "面材 1.58 kg/㎡（1.1mm）", note: "1.23 kg/㎡（0.9mm）／0.88 kg/㎡（0.7mm）", dim: "僅面材，未含基材" },
                     { v: "約 5 kg/㎡", note: "3×8 板 11.6 kg／枚" } ] },
          { label: "強度", group: "結構・重量・成本",
            us: { v: "工業鋁板，本身即具結構剛性", note: "厚度可達 9.5cm，可依載重選配；無須依附基材", flag: "win" },
            cells: [ { v: "板材僅 1.0mm", note: "須黏貼基材才能使用", dim: "官方僅列「符合」，未公開數值", flag: "limit" },
                     { v: "具耐衝擊性（SGS）", dim: "公開數據有限" } ] },
          { label: "成本", group: "結構・重量・成本",
            us: { big: "省 300 萬", unit: "國泰中正大樓實例", v: "費用省 1/2、工期省 2/3", note: "防火門美化 20 層樓 × 4 扇門；傳統大理石工法一扇約 NT$45,000", flag: "win" },
            cells: [ { v: "每片約 NT$1,785–2,420", note: "材料單價最低，且有公開牌價", dim: "官方 2024 未稅", flag: "win" },
                     { v: "連工帶料估價", dim: "查無官方公開單價" } ] },
          { label: "表面耐磨硬度", group: "安全與客製",
            us: { v: "3H", note: "中塗層含抗刮 ＋ UV 處理；面塗三塗三烤" },
            cells: [ { v: "ANSI／NEMA LD3 耐磨轉數 ≥ 400 轉", dim: "未以鉛筆硬度標示" },
                     { v: "9H", note: "鉛筆硬度（JIS K5600-5-4）", flag: "win" } ] },
          { label: "防火等級", group: "安全與客製",
            us: { big: "耐燃一級", unit: "台灣消防規範最高等級", v: "鋁板不燃基材＋耐高溫", note: "非燃性、無濃煙", flag: "win" },
            cells: [ { v: "防焰性 CNS 7614／物理性質 CNS 11367", dim: "非耐燃一級，須另選「火立克＋」系列", flag: "limit" },
                     { v: "台灣耐燃一級", note: "日本不燃認定 NM-2183", flag: "win" } ] },
          { label: "紋理客製", group: "安全與客製",
            us: { v: "專利無縫對花技術", note: "消除拼接斷點｜數位檔案留存、可編修、可客製衍伸；立體紋理最大 1mm，可控制浮雕高度；客戶提供紋理即可複刻（600×600mm 打樣）", flag: "top" },
            cells: [ { v: "上百種固定花色" },
                     { v: "石紋／木紋／金屬／單色", note: "固定花色" } ] }
        ],
        srcs: "藝格板資料來源：煌盛興業《煌盛》簡報型錄（2026 年）。競品資料來源：Formica 官方 HPL 技術資料、AICA 工業官方仕様一覧（2026 年 4 月改定）。查詢日期：2026／07／16。競品規格以各該公司公開資料為準，並可能隨其改版而異動。"
      }
    ]
  },
  products: [
    { id:"p1",  code:"PT-M901", name:"卡拉拉",   series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS002.jpg", desc:"" },
{ id:"p2",  code:"PT-M902", name:"雅仕白",   series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS001.jpg", desc:"" },
{ id:"p3",  code:"PT-M903", name:"白玉蘭",   series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS006.jpg", desc:"" },
{ id:"p4",  code:"PT-M904", name:"雪白細紋", series:"石紋系列", stone:"silver",   sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS005.jpg", desc:"" },
{ id:"p5",  code:"PT-M905", name:"帝寶米黃", series:"石紋系列", stone:"beige",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS018.jpg", desc:"" },
{ id:"p6",  code:"PT-M906", name:"加里奧金", series:"石紋系列", stone:"gold",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS023.jpg", desc:"" },
{ id:"p7",  code:"PT-M907", name:"琥珀",     series:"石紋系列", stone:"amber",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS024.jpg", desc:"" },
{ id:"p8",  code:"PT-M908", name:"聖羅蘭黑", series:"石紋系列", stone:"black",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS037.jpg", desc:"" },
{ id:"p9",  code:"PT-M909", name:"紫丁黑",   series:"石紋系列", stone:"purple",   sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS036.jpg", desc:"" },
{ id:"p10", code:"PT-M910", name:"深灰石紋", series:"石紋系列", stone:"darkgrey", sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS032.jpg", desc:"" },
{ id:"p11", code:"PT-M911", name:"安格拉",   series:"石紋系列", stone:"grey",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS031.jpg", desc:"" },
{ id:"p12", code:"PT-M912", name:"克里特灰", series:"石紋系列", stone:"grey",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS030.jpg", desc:"" },
{ id:"p13", code:"PT-M913", name:"黑網石",   series:"石紋系列", stone:"black",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS035.jpg", desc:"" },
{ id:"p14", code:"PT-M914", name:"銀狐",     series:"石紋系列", stone:"silver",   sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS004.jpg", desc:"" },
{ id:"p15", code:"PT-M915", name:"雕刻白",     series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS007.jpg", desc:"" },
{ id:"p16", code:"PT-M916", name:"黃金雕刻白", series:"石紋系列", stone:"gold",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS008.jpg", desc:"" },
{ id:"p17", code:"PT-M917", name:"帝諾",       series:"石紋系列", stone:"grey",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS017.jpg", desc:"" },
{ id:"p18", code:"PT-M918", name:"琥珀金紋",   series:"石紋系列", stone:"amber",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS025.jpg", desc:"" },
{ id:"p19", code:"PT-M919", name:"抽象紋理",   series:"石紋系列", stone:"darkgrey", sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS044.jpg", desc:"" },
{ id:"p20", code:"PT-R001", name:"鏽蝕 01",    series:"鏽蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS038.jpg", desc:"" },
{ id:"p21", code:"PT-R002", name:"鏽蝕 02",    series:"鏽蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS039.jpg", desc:"" },
{ id:"p22", code:"PT-R003", name:"鏽蝕 03",    series:"鏽蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS040.jpg", desc:"" },
{ id:"p23", code:"PT-R004", name:"鏽蝕 04",    series:"鏽蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS041.jpg", desc:"" },
{ id:"p24", code:"PT-R005", name:"鏽蝕 05",    series:"鏽蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS042.jpg", desc:"" },
{ id:"p25", code:"PT-R006", name:"鏽蝕 06",    series:"鏽蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS043.jpg", desc:"" },
{ id:"p26", code:"PT-W901", name:"木紋經典",   series:"木紋系列", stone:"wood",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS052.jpg", desc:"" },
{ id:"p27", code:"PT-W902", name:"木紋 EN521", series:"木紋系列", stone:"wood",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS053.jpg", desc:"" },
{ id:"p28", code:"PT-W903", name:"木紋 GEH1215",series:"木紋系列", stone:"wood",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS054.jpg", desc:"" },
{ id:"p29", code:"PT-W904", name:"木紋 UE106C",series:"木紋系列", stone:"wood",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS055.jpg", desc:"" },
{ id:"p30", code:"PT-W905", name:"木紋 EN628", series:"木紋系列", stone:"wood",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS056.jpg", desc:"" },


    /* ---- 以下 120 款為 2026-08 自石材圖庫新增 ----
       編碼 PT-<系列><三碼>，段內連號；已排除浮水印預覽圖，
       並以「成品裁切後」的圖互比，確保彼此不相似 ---- */
    /* 花崗石系列・白系 */
    { id:"pt001", code:"PT-G001", name:"金麻", series:"花崗石系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTG001.jpg" },
    { id:"pt002", code:"PT-G002", name:"霸王花", series:"花崗石系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTG002.jpg" },
    /* 花崗石系列・灰系 */
    { id:"pt003", code:"PT-G101", name:"印度紅", series:"花崗石系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTG101.jpg" },
    { id:"pt004", code:"PT-G102", name:"喬治亞灰", series:"花崗石系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTG102.jpg" },
    { id:"pt005", code:"PT-G103", name:"桃木珍珠", series:"花崗石系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTG103.jpg" },
    { id:"pt006", code:"PT-G104", name:"灰鑽", series:"花崗石系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTG104.jpg" },
    /* 石紋系列・白系 */
    { id:"pt007", code:"PT-M001", name:"凝脂白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM001.jpg" },
    { id:"pt008", code:"PT-M002", name:"凝霜", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM002.jpg" },
    { id:"pt009", code:"PT-M003", name:"初雪白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM003.jpg" },
    { id:"pt010", code:"PT-M004", name:"晴雪", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM004.jpg" },
    { id:"pt011", code:"PT-M005", name:"月光白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM005.jpg" },
    { id:"pt012", code:"PT-M006", name:"月華白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM006.jpg" },
    { id:"pt013", code:"PT-M007", name:"灰韻", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM007.jpg" },
    { id:"pt014", code:"PT-M008", name:"玉璧白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM008.jpg" },
    { id:"pt015", code:"PT-M009", name:"玉瓷", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM009.jpg" },
    { id:"pt016", code:"PT-M010", name:"玉霜", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM010.jpg" },
    { id:"pt017", code:"PT-M011", name:"瑩光白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM011.jpg" },
    { id:"pt018", code:"PT-M012", name:"瓷光白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM012.jpg" },
    { id:"pt019", code:"PT-M013", name:"白玉棠", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM013.jpg" },
    { id:"pt020", code:"PT-M014", name:"白練", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM014.jpg" },
    { id:"pt021", code:"PT-M015", name:"白鶴石", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM015.jpg" },
    { id:"pt022", code:"PT-M016", name:"皎白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM016.jpg" },
    { id:"pt023", code:"PT-M017", name:"皓月白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM017.jpg" },
    { id:"pt024", code:"PT-M018", name:"皓雪", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM018.jpg" },
    { id:"pt025", code:"PT-M019", name:"素心白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM019.jpg" },
    { id:"pt026", code:"PT-M020", name:"素璧", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM020.jpg" },
    { id:"pt027", code:"PT-M021", name:"素紈", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM021.jpg" },
    { id:"pt028", code:"PT-M022", name:"素雪", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM022.jpg" },
    { id:"pt029", code:"PT-M023", name:"素雲白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM023.jpg" },
    { id:"pt030", code:"PT-M024", name:"縞白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM024.jpg" },
    { id:"pt031", code:"PT-M025", name:"羽紗白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM025.jpg" },
    { id:"pt032", code:"PT-M026", name:"銀雪", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM026.jpg" },
    { id:"pt033", code:"PT-M027", name:"雪痕", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM027.jpg" },
    { id:"pt034", code:"PT-M028", name:"雪羽白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM028.jpg" },
    { id:"pt035", code:"PT-M029", name:"雪脈白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM029.jpg" },
    { id:"pt036", code:"PT-M030", name:"雲白石", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM030.jpg" },
    { id:"pt037", code:"PT-M031", name:"雲鏡白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM031.jpg" },
    { id:"pt038", code:"PT-M032", name:"霜羽", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM032.jpg" },
    { id:"pt039", code:"PT-M033", name:"霜華白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM033.jpg" },
    { id:"pt040", code:"PT-M034", name:"霧凇白", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM034.jpg" },
    { id:"pt041", code:"PT-M035", name:"霧鎖灰", series:"石紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM035.jpg" },
    /* 石紋系列・灰系 */
    { id:"pt042", code:"PT-M101", name:"克羅蒂灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM101.jpg" },
    { id:"pt043", code:"PT-M102", name:"冷杉灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM102.jpg" },
    { id:"pt044", code:"PT-M103", name:"咖啡絨", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM103.jpg" },
    { id:"pt045", code:"PT-M104", name:"墨痕", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM104.jpg" },
    { id:"pt046", code:"PT-M105", name:"墨雲灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM105.jpg" },
    { id:"pt047", code:"PT-M106", name:"夏木樹石", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM106.jpg" },
    { id:"pt048", code:"PT-M107", name:"寒灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM107.jpg" },
    { id:"pt049", code:"PT-M108", name:"岩心灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM108.jpg" },
    { id:"pt050", code:"PT-M109", name:"暮靄灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM109.jpg" },
    { id:"pt051", code:"PT-M110", name:"朦灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM110.jpg" },
    { id:"pt052", code:"PT-M111", name:"水墨灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM111.jpg" },
    { id:"pt053", code:"PT-M112", name:"灰嵐", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM112.jpg" },
    { id:"pt054", code:"PT-M113", name:"灰玉", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM113.jpg" },
    { id:"pt055", code:"PT-M114", name:"灰痕", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM114.jpg" },
    { id:"pt056", code:"PT-M115", name:"灰羽", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM115.jpg" },
    { id:"pt057", code:"PT-M116", name:"煙嵐灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM116.jpg" },
    { id:"pt058", code:"PT-M117", name:"疊嶂灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM117.jpg" },
    { id:"pt059", code:"PT-M118", name:"石墨灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM118.jpg" },
    { id:"pt060", code:"PT-M119", name:"砂灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM119.jpg" },
    { id:"pt061", code:"PT-M120", name:"素岩", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM120.jpg" },
    { id:"pt062", code:"PT-M121", name:"蒼岩灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM121.jpg" },
    { id:"pt063", code:"PT-M122", name:"遠山灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM122.jpg" },
    { id:"pt064", code:"PT-M123", name:"鉛華灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM123.jpg" },
    { id:"pt065", code:"PT-M124", name:"雲煙灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM124.jpg" },
    { id:"pt066", code:"PT-M125", name:"霧影灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM125.jpg" },
    { id:"pt067", code:"PT-M126", name:"青岩灰", series:"石紋系列", stone:"grey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM126.jpg" },
    /* 石紋系列・冷灰系 */
    { id:"pt068", code:"PT-M401", name:"寒玉", series:"石紋系列", stone:"silver", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM401.jpg" },
    { id:"pt069", code:"PT-M402", name:"青玉", series:"石紋系列", stone:"silver", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM402.jpg" },
    /* 石紋系列・金系 */
    { id:"pt070", code:"PT-M201", name:"新米黃", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM201.jpg" },
    { id:"pt071", code:"PT-M202", name:"暖沙金", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM202.jpg" },
    { id:"pt072", code:"PT-M203", name:"暮金", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM203.jpg" },
    { id:"pt073", code:"PT-M204", name:"木紋石", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM204.jpg" },
    { id:"pt074", code:"PT-M205", name:"琥珀砂", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM205.jpg" },
    { id:"pt075", code:"PT-M206", name:"秋穗金", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM206.jpg" },
    { id:"pt076", code:"PT-M207", name:"蜜蠟金", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM207.jpg" },
    { id:"pt077", code:"PT-M208", name:"西班牙紅", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM208.jpg" },
    { id:"pt078", code:"PT-M209", name:"赤金紋", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM209.jpg" },
    { id:"pt079", code:"PT-M210", name:"金峰", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM210.jpg" },
    { id:"pt080", code:"PT-M211", name:"金絲玉", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM211.jpg" },
    { id:"pt081", code:"PT-M212", name:"金縷", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM212.jpg" },
    { id:"pt082", code:"PT-M213", name:"鎏金石", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM213.jpg" },
    { id:"pt083", code:"PT-M214", name:"香檳金", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM214.jpg" },
    { id:"pt084", code:"PT-M215", name:"麥浪金", series:"石紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM215.jpg" },
    /* 石紋系列・棕系 */
    { id:"pt085", code:"PT-M403", name:"胡桃棕", series:"石紋系列", stone:"amber", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM403.jpg" },
    { id:"pt086", code:"PT-M404", name:"翡翠石", series:"石紋系列", stone:"darkgrey", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM404.jpg" },
    /* 石紋系列・黑系 */
    { id:"pt087", code:"PT-M301", name:"墨淵", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM301.jpg" },
    { id:"pt088", code:"PT-M302", name:"墨潮", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM302.jpg" },
    { id:"pt089", code:"PT-M303", name:"墨玉", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM303.jpg" },
    { id:"pt090", code:"PT-M304", name:"夜岩", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM304.jpg" },
    { id:"pt091", code:"PT-M305", name:"夜幕", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM305.jpg" },
    { id:"pt092", code:"PT-M306", name:"夜曜", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM306.jpg" },
    { id:"pt093", code:"PT-M307", name:"子夜", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM307.jpg" },
    { id:"pt094", code:"PT-M308", name:"暗夜金", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM308.jpg" },
    { id:"pt095", code:"PT-M309", name:"深淵黑", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM309.jpg" },
    { id:"pt096", code:"PT-M310", name:"烏金石", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM310.jpg" },
    { id:"pt097", code:"PT-M311", name:"玄墨", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM311.jpg" },
    { id:"pt098", code:"PT-M312", name:"玄武岩", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM312.jpg" },
    { id:"pt099", code:"PT-M313", name:"玄璧", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM313.jpg" },
    { id:"pt100", code:"PT-M314", name:"鐵黑", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM314.jpg" },
    { id:"pt101", code:"PT-M315", name:"黑曜", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM315.jpg" },
    { id:"pt102", code:"PT-M316", name:"黑曜金", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM316.jpg" },
    { id:"pt103", code:"PT-M317", name:"黑檀石", series:"石紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTM317.jpg" },
    /* 木紋系列・白系 */
    { id:"pt104", code:"PT-W001", name:"淺橡", series:"木紋系列", stone:"carrara", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW001.jpg" },
    /* 木紋系列・金系 */
    { id:"pt105", code:"PT-W201", name:"柚木", series:"木紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW201.jpg" },
    { id:"pt106", code:"PT-W202", name:"楓木", series:"木紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW202.jpg" },
    { id:"pt107", code:"PT-W203", name:"樺木", series:"木紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW203.jpg" },
    { id:"pt108", code:"PT-W204", name:"灰橡", series:"木紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW204.jpg" },
    { id:"pt109", code:"PT-W205", name:"煙燻橡", series:"木紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW205.jpg" },
    { id:"pt110", code:"PT-W206", name:"白楊", series:"木紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW206.jpg" },
    { id:"pt111", code:"PT-W207", name:"白橡", series:"木紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW207.jpg" },
    { id:"pt112", code:"PT-W208", name:"赤楊", series:"木紋系列", stone:"gold", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW208.jpg" },
    /* 木紋系列・棕系 */
    { id:"pt113", code:"PT-W401", name:"栗木", series:"木紋系列", stone:"amber", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW401.jpg" },
    { id:"pt114", code:"PT-W402", name:"楓香", series:"木紋系列", stone:"amber", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW402.jpg" },
    { id:"pt115", code:"PT-W403", name:"橄欖木", series:"木紋系列", stone:"amber", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW403.jpg" },
    { id:"pt116", code:"PT-W404", name:"深胡桃", series:"木紋系列", stone:"amber", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW404.jpg" },
    { id:"pt117", code:"PT-W405", name:"胡桃木", series:"木紋系列", stone:"amber", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW405.jpg" },
    { id:"pt118", code:"PT-W406", name:"花梨木", series:"木紋系列", stone:"amber", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW406.jpg" },
    { id:"pt119", code:"PT-W407", name:"雪松", series:"木紋系列", stone:"amber", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW407.jpg" },
    /* 木紋系列・黑系 */
    { id:"pt120", code:"PT-W301", name:"非洲柚", series:"木紋系列", stone:"black", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTW301.jpg" },


    /* ---- 單色系列：烤漆鋁板實色板 ---- */
    /* 白系 */
    /* 灰系 */
    /* 金系 */
    /* 黑系 */
    /* 棕系 */


    /* ---- 單色系列：烤漆鋁板實色板（純色塊，無紋理）----
       色盤參考 2026 室內裝修流行色：暖中性、大地色、煙燻橄欖、
       霧藍與孔雀藍、灰粉與藕紫，含 Glidden 2026 年度色 Warm Mahogany。
       編碼 0xx白 1xx灰 2xx米金大地 3xx深色 4xx棕紅 5xx綠 6xx藍 7xx粉紫 ---- */
    /* 白・米白 */
    { id:"ps001", code:"PT-S001", name:"純白", series:"單色系列", stone:"carrara", hex:"#F6F5F2", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS001.jpg" },
    { id:"ps002", code:"PT-S002", name:"象牙白", series:"單色系列", stone:"carrara", hex:"#EFE9DC", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS002.jpg" },
    { id:"ps003", code:"PT-S003", name:"奶油白", series:"單色系列", stone:"carrara", hex:"#F2EAD8", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS003.jpg" },
    { id:"ps004", code:"PT-S004", name:"亞麻白", series:"單色系列", stone:"carrara", hex:"#EAE3D6", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS004.jpg" },
    { id:"ps005", code:"PT-S005", name:"米白", series:"單色系列", stone:"carrara", hex:"#E9E1D3", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS005.jpg" },
    { id:"ps006", code:"PT-S006", name:"陶土白", series:"單色系列", stone:"carrara", hex:"#E5DCD0", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS006.jpg" },
    { id:"ps007", code:"PT-S007", name:"燕麥", series:"單色系列", stone:"carrara", hex:"#E3DACA", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS007.jpg" },
    { id:"ps008", code:"PT-S008", name:"珍珠灰", series:"單色系列", stone:"silver", hex:"#D9D6D1", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS008.jpg" },
    /* 灰 */
    { id:"ps009", code:"PT-S101", name:"灰米", series:"單色系列", stone:"silver", hex:"#CFC7BA", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS101.jpg" },
    { id:"ps010", code:"PT-S102", name:"淺灰", series:"單色系列", stone:"silver", hex:"#C0BEB9", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS102.jpg" },
    { id:"ps011", code:"PT-S103", name:"蘑菇灰", series:"單色系列", stone:"silver", hex:"#BDB2A5", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS103.jpg" },
    { id:"ps012", code:"PT-S104", name:"銀灰", series:"單色系列", stone:"grey", hex:"#A9AAAC", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS104.jpg" },
    { id:"ps013", code:"PT-S105", name:"暖灰", series:"單色系列", stone:"grey", hex:"#9C948B", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS105.jpg" },
    { id:"ps014", code:"PT-S106", name:"中灰", series:"單色系列", stone:"grey", hex:"#8D8D8D", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS106.jpg" },
    { id:"ps015", code:"PT-S107", name:"鐵灰", series:"單色系列", stone:"grey", hex:"#6F7174", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS107.jpg" },
    { id:"ps016", code:"PT-S108", name:"深灰", series:"單色系列", stone:"darkgrey", hex:"#4B4D4F", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS108.jpg" },
    /* 米金・大地 */
    { id:"ps017", code:"PT-S201", name:"奶油黃", series:"單色系列", stone:"gold", hex:"#EFD9A0", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS201.jpg" },
    { id:"ps018", code:"PT-S202", name:"小麥", series:"單色系列", stone:"gold", hex:"#D8C49A", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS202.jpg" },
    { id:"ps019", code:"PT-S203", name:"香檳金", series:"單色系列", stone:"gold", hex:"#CAB89B", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS203.jpg" },
    { id:"ps020", code:"PT-S204", name:"沙丘", series:"單色系列", stone:"gold", hex:"#C8B291", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS204.jpg" },
    { id:"ps021", code:"PT-S205", name:"鈦金", series:"單色系列", stone:"gold", hex:"#B59C6D", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS205.jpg" },
    { id:"ps022", code:"PT-S206", name:"卡其", series:"單色系列", stone:"gold", hex:"#A89471", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS206.jpg" },
    { id:"ps023", code:"PT-S207", name:"芥末黃", series:"單色系列", stone:"gold", hex:"#C8912E", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS207.jpg" },
    { id:"ps024", code:"PT-S208", name:"赭黃", series:"單色系列", stone:"gold", hex:"#B8873C", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS208.jpg" },
    { id:"ps025", code:"PT-S209", name:"焦糖", series:"單色系列", stone:"amber", hex:"#A9743F", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS209.jpg" },
    /* 深色・黑 */
    { id:"ps026", code:"PT-S301", name:"石墨黑", series:"單色系列", stone:"black", hex:"#34363B", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS301.jpg" },
    { id:"ps027", code:"PT-S302", name:"墨棕", series:"單色系列", stone:"black", hex:"#2B2320", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS302.jpg" },
    { id:"ps028", code:"PT-S303", name:"曜石黑", series:"單色系列", stone:"black", hex:"#1F2023", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS303.jpg" },
    { id:"ps029", code:"PT-S304", name:"碳黑", series:"單色系列", stone:"black", hex:"#131417", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS304.jpg" },
    /* 棕紅 */
    { id:"ps030", code:"PT-S401", name:"摩卡", series:"單色系列", stone:"amber", hex:"#9B7B67", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS401.jpg" },
    { id:"ps031", code:"PT-S402", name:"古銅", series:"單色系列", stone:"amber", hex:"#8B6B46", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS402.jpg" },
    { id:"ps032", code:"PT-S403", name:"焦赭", series:"單色系列", stone:"amber", hex:"#7A4A32", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS403.jpg" },
    { id:"ps033", code:"PT-S404", name:"可可", series:"單色系列", stone:"amber", hex:"#6B4E3D", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS404.jpg" },
    { id:"ps034", code:"PT-S405", name:"咖啡棕", series:"單色系列", stone:"amber", hex:"#5C4737", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS405.jpg" },
    { id:"ps035", code:"PT-S406", name:"赤陶", series:"單色系列", stone:"amber", hex:"#B25F42", tone:"red", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS406.jpg" },
    { id:"ps036", code:"PT-S407", name:"灼橘", series:"單色系列", stone:"amber", hex:"#A85328", tone:"red", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS407.jpg" },
    { id:"ps037", code:"PT-S408", name:"磚紅", series:"單色系列", stone:"amber", hex:"#A54530", tone:"red", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS408.jpg" },
    { id:"ps038", code:"PT-S409", name:"暖桃花心", series:"單色系列", stone:"amber", hex:"#8C3B2E", tone:"red", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS409.jpg" },
    { id:"ps039", code:"PT-S410", name:"中國紅", series:"單色系列", stone:"amber", hex:"#9C2D25", tone:"red", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS410.jpg" },
    { id:"ps040", code:"PT-S411", name:"牛血紅", series:"單色系列", stone:"amber", hex:"#6E2B24", tone:"red", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS411.jpg" },
    { id:"ps041", code:"PT-S412", name:"酒紅", series:"單色系列", stone:"amber", hex:"#6F2834", tone:"red", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS412.jpg" },
    /* 綠 */
    { id:"ps042", code:"PT-S501", name:"青瓷綠", series:"單色系列", stone:"silver", hex:"#B7C7B4", tone:"green", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS501.jpg" },
    { id:"ps043", code:"PT-S502", name:"鼠尾草綠", series:"單色系列", stone:"silver", hex:"#A8B29B", tone:"green", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS502.jpg" },
    { id:"ps044", code:"PT-S503", name:"煙燻橄欖", series:"單色系列", stone:"darkgrey", hex:"#7A7A56", tone:"green", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS503.jpg" },
    { id:"ps045", code:"PT-S504", name:"苔綠", series:"單色系列", stone:"darkgrey", hex:"#6F7A55", tone:"green", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS504.jpg" },
    { id:"ps046", code:"PT-S505", name:"橄欖綠", series:"單色系列", stone:"darkgrey", hex:"#6C7451", tone:"green", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS505.jpg" },
    { id:"ps047", code:"PT-S506", name:"森林綠", series:"單色系列", stone:"darkgrey", hex:"#3E5641", tone:"green", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS506.jpg" },
    { id:"ps048", code:"PT-S507", name:"墨綠", series:"單色系列", stone:"darkgrey", hex:"#304B3D", tone:"green", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS507.jpg" },
    /* 藍 */
    { id:"ps049", code:"PT-S601", name:"霧藍", series:"單色系列", stone:"silver", hex:"#9FB2C1", tone:"blue", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS601.jpg" },
    { id:"ps050", code:"PT-S602", name:"灰藍", series:"單色系列", stone:"grey", hex:"#7089A0", tone:"blue", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS602.jpg" },
    { id:"ps051", code:"PT-S603", name:"天空藍", series:"單色系列", stone:"grey", hex:"#5B80A7", tone:"blue", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS603.jpg" },
    { id:"ps052", code:"PT-S604", name:"孔雀藍", series:"單色系列", stone:"darkgrey", hex:"#2E5D63", tone:"blue", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS604.jpg" },
    { id:"ps053", code:"PT-S605", name:"靛藍", series:"單色系列", stone:"darkgrey", hex:"#33456B", tone:"blue", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS605.jpg" },
    { id:"ps054", code:"PT-S606", name:"藏青", series:"單色系列", stone:"darkgrey", hex:"#2D3B56", tone:"blue", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS606.jpg" },
    /* 粉紫 */
    { id:"ps055", code:"PT-S701", name:"灰粉", series:"單色系列", stone:"silver", hex:"#D9B8AE", tone:"pink", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS701.jpg" },
    { id:"ps056", code:"PT-S702", name:"玫瑰灰", series:"單色系列", stone:"silver", hex:"#C4A49B", tone:"pink", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS702.jpg" },
    { id:"ps057", code:"PT-S703", name:"丁香紫", series:"單色系列", stone:"silver", hex:"#B3A5C4", tone:"pink", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS703.jpg" },
    { id:"ps058", code:"PT-S704", name:"藕紫", series:"單色系列", stone:"purple", hex:"#A88A93", tone:"pink", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS704.jpg" },
    { id:"ps059", code:"PT-S705", name:"梅果紫", series:"單色系列", stone:"purple", hex:"#6B4560", tone:"pink", sizes:"120×240 / 120×300 / 150×300 cm", finish:"立體紋路・霧光・平光・消光", desc:"", img:"img/tex/PTS705.jpg" },
  ],

  /* ---- 合作客戶（首頁實績區展示；整理自業務專案總表）----
     name = 公司名稱 */
  clients: [
    { name:"長虹建設" },
    { name:"宏普建設" },
    { name:"惠宇建設" },
    { name:"國泰室裝" },
    { name:"隆大建設" },
    { name:"璞園建築" },
    { name:"皇普建設" },
    { name:"茂德建設" },
    { name:"全坤建設" },
    { name:"頤昌建設" },
    { name:"龍霖建設" },
    { name:"大賞建設" },
    { name:"合銘建設" },
    { name:"新業建設" },
    { name:"得墾建設" },
    { name:"裕盛發建設" },
    { name:"宏碁建設" },
    { name:"萬企大業" },
    { name:"新家坡建設" },
    { name:"永豐泰建設" },
    { name:"慶山建設" },
    { name:"大亮建設" },
    { name:"鴻信建設" },
    { name:"陽明營造" },
    { name:"璞承營造" },
    { name:"久年營造" },
    { name:"承優營造" },
    { name:"辰豐營造" },
    { name:"盤鈺營建" },
    { name:"長興茂室" },
    { name:"順緯建泰" },
    { name:"得呈工程" },
    { name:"聖輝工程" },
    { name:"旭宣系統" },
    { name:"雅富室內" },
    { name:"詰律室裝" },
    { name:"珩美室設" },
    { name:"李林設計" },
    { name:"瀚鼎設計" },
    { name:"奇研所" }
  ],

  /* ---- 實績案例（後台「實績案例」分頁可增刪改）----
     category 可選：全棟廊道 / 防火消防美化 / 防火門 / 消防箱 / 牆面 / 天花板 / 豪宅客製 / 其他 */
  cases: [
    /* 2026-08-10：與後台已發布的內容同步（37 件，含後台新增的 10 件與雲端照片），
       並補上四個截斷的地區。日後若在程式端改這一區，記得更新 sectionVersions.cases，
       否則會被已發布的快照蓋掉。 */
    { id:"c1", region:"台北市大同區", title:"三豐第一匯", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"carrara", img:"img/cases/c1.jpg", imgs:["img/cases/c1.jpg", "img/cases/c1/2.jpg", "img/cases/c1/4.jpg", "img/cases/c1/7.jpg", "img/cases/c1/9.jpg"], year:"" },
    { id:"c3", region:"台北市中山區", title:"中山TED", category:"防火門", cats:["防火門", "消防箱・檢修門"], stone:"grey", img:"img/cases/c3.jpg", imgs:["img/cases/c3.jpg", "img/cases/c3/2.jpg", "img/cases/c3/3.jpg", "img/cases/c3/4.jpg", "img/cases/c3/5.jpg", "img/cases/c3/6.jpg", "img/cases/c3/7.jpg", "img/cases/c3/8.jpg"], year:"" },
    { id:"c4", region:"新北市林口區", title:"京懋", category:"防火門", cats:["防火門"], stone:"gold", img:"img/cases/c4/9.jpg", imgs:["img/cases/c4/9.jpg", "img/cases/c4/2.jpg", "img/cases/c4/7.jpg", "img/cases/c4/6.jpg"], year:"" },
    { id:"c5", region:"台北市大安區", title:"冠德羅斯福", category:"防火門", cats:["防火門"], stone:"darkgrey", img:"img/cases/c5.jpg", imgs:["img/cases/c5.jpg", "img/cases/c5/2.jpg", "img/cases/c5/3.jpg", "img/cases/c5/5.jpg", "img/cases/c5/6.jpg"], year:"" },
    { id:"c2", region:"", title:"三輝", category:"防火門", cats:["防火門", "消防箱・檢修門"], stone:"beige", img:"img/cases/c2.jpg", imgs:["img/cases/c2.jpg", "img/cases/c2/2.jpg", "img/cases/c2/3.jpg", "img/cases/c2/4.jpg", "img/cases/c2/5.jpg", "img/cases/c2/6.jpg", "img/cases/c2/7.jpg", "img/cases/c2/9.jpg", "img/cases/c2/10.jpg", "img/cases/c2/11.jpg", "img/cases/c2/12.jpg", "img/cases/c2/13.jpg", "img/cases/c2/14.jpg", "img/cases/c2/15.jpg", "img/cases/c2/16.jpg", "img/cases/c2/17.jpg"], year:"" },
    { id:"c6", region:"新北市新莊區", title:"友座臻美", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"silver", img:"img/cases/c6/7.jpg", imgs:["img/cases/c6/7.jpg", "img/cases/c6/5.jpg", "img/cases/c6/8.jpg", "img/cases/c6/10.jpg", "img/cases/c6/13.jpg", "img/cases/c6/14.jpg", "img/cases/c6/15.jpg", "img/cases/c6/16.jpg", "img/cases/c6/17.jpg", "img/cases/c6/18.jpg", "img/cases/c6/19.jpg"], year:"" },
    { id:"c7", region:"高雄市新興區", title:"中正大樓", category:"牆面・天花", cats:["牆面・天花", "全棟廊道"], stone:"amber", img:"img/cases/c7/2.jpg", imgs:["img/cases/c7/2.jpg", "img/cases/c7/5.jpg", "img/cases/c7/6.jpg", "img/cases/c7/7.jpg", "img/cases/c7/8.jpg", "img/cases/c7/9.jpg", "img/cases/c7/10.jpg", "img/cases/c7/11.jpg", "img/cases/c7/13.jpg", "img/cases/c7/14.jpg", "img/cases/c7/16.jpg", "img/cases/c7.jpg", "img/cases/c7/19.jpg", "img/cases/c7/20.jpg", "img/cases/c7/21.jpg", "img/cases/c7/22.jpg", "img/cases/c7/24.jpg", "img/cases/c7/25.jpg", "img/cases/c7/26.jpg", "img/cases/c7/27.jpg"], year:"" },
    { id:"c8", region:"新北市土城區", title:"土城日月光", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"wood", img:"img/cases/c8/16.jpg", imgs:["img/cases/c8/16.jpg", "img/cases/c8/7.jpg", "img/cases/c8/8.jpg", "img/cases/c8/9.jpg", "img/cases/c8/10.jpg", "img/cases/c8/11.jpg", "img/cases/c8/12.jpg", "img/cases/c8/13.jpg", "img/cases/c8/14.jpg", "img/cases/c8/15.jpg", "img/cases/c8.jpg", "img/cases/c8/17.jpg"], year:"" },
    { id:"c9", region:"新北市新莊區", title:"AMAX", category:"防火門", cats:["防火門", "消防箱・檢修門"], stone:"black", img:"img/cases/c9.jpg", imgs:["img/cases/c9.jpg", "img/cases/c9/2.jpg", "img/cases/c9/3.jpg", "img/cases/c9/4.jpg", "img/cases/c9/5.jpg", "img/cases/c9/6.jpg", "img/cases/c9/7.jpg", "img/cases/c9/8.jpg"], year:"" },
    { id:"c10", region:"台北市大安區", title:"川PARK", category:"防火門", cats:["防火門", "消防箱・檢修門"], stone:"purple", img:"img/cases/c10.jpg", imgs:["img/cases/c10.jpg", "img/cases/c10/2.jpg", "img/cases/c10/4.jpg", "img/cases/c10/5.jpg"], year:"" },
    { id:"c11", region:"台北市中正區", title:"宏璟延平南路案", category:"防火門", cats:["防火門"], stone:"carrara", img:"img/cases/c11/36.jpg", imgs:["img/cases/c11/36.jpg", "img/cases/c11/2.jpg", "img/cases/c11/4.jpg", "img/cases/c11/6.jpg", "img/cases/c11/9.jpg", "img/cases/c11/12.jpg", "img/cases/c11/14.jpg", "img/cases/c11/15.jpg", "img/cases/c11/17.jpg", "img/cases/c11/18.jpg", "img/cases/c11/19.jpg", "img/cases/c11/21.jpg", "img/cases/c11/22.jpg", "img/cases/c11/24.jpg", "img/cases/c11/25.jpg", "img/cases/c11/26.jpg", "img/cases/c11/27.jpg", "img/cases/c11/28.jpg", "img/cases/c11/31.jpg", "img/cases/c11/33.jpg", "img/cases/c11/34.jpg", "img/cases/c11.jpg", "img/cases/c11/38.jpg", "img/cases/c11/39.jpg", "img/cases/c11/40.jpg", "img/cases/c11/44.jpg", "img/cases/c11/45.jpg", "img/cases/c11/46.jpg", "img/cases/c11/47.jpg"], year:"" },
    { id:"c12", region:"台北市松山區", title:"山發富饒", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"beige", img:"img/cases/c12.jpg", imgs:["img/cases/c12.jpg", "img/cases/c12/2.jpg", "img/cases/c12/3.jpg", "img/cases/c12/4.jpg", "img/cases/c12/5.jpg", "img/cases/c12/6.jpg", "img/cases/c12/7.jpg", "img/cases/c12/11.jpg", "img/cases/c12/12.jpg", "img/cases/c12/13.jpg", "img/cases/c12/14.jpg", "img/cases/c12/15.jpg", "img/cases/c12/16.jpg"], year:"" },
    { id:"c13", region:"新北市中和區", title:"德林MIT", category:"防火門", cats:["防火門"], stone:"grey", img:"img/cases/c13/5.jpg", imgs:["img/cases/c13/5.jpg", "img/cases/c13/2.jpg", "img/cases/c13/3.jpg", "img/cases/c13/11.jpg", "img/cases/c13/7.jpg"], year:"" },
    { id:"c14", region:"台中市南屯區", title:"台中市南屯區", category:"牆面・天花", cats:["牆面・天花"], stone:"gold", img:"img/cases/c14.jpg", imgs:["img/cases/c14.jpg", "img/cases/c14/2.jpg"], year:"" },
    { id:"c15", region:"台北市松山區", title:"揚昇君悅", category:"防火門", cats:["防火門"], stone:"darkgrey", img:"img/cases/c15.jpg", imgs:["img/cases/c15.jpg", "img/cases/c15/2.jpg", "img/cases/c15/3.jpg", "img/cases/c15/4.jpg"], year:"" },
    { id:"c16", region:"台北市內湖區", title:"新北國貿", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"silver", img:"img/cases/c16/38.jpg", imgs:["img/cases/c16/38.jpg", "img/cases/c16/8.jpg", "img/cases/c16/9.jpg", "img/cases/c16/11.jpg", "img/cases/c16/12.jpg", "img/cases/c16/13.jpg", "img/cases/c16/14.jpg", "img/cases/c16/16.jpg", "img/cases/c16/18.jpg", "img/cases/c16/19.jpg", "img/cases/c16/20.jpg", "img/cases/c16/21.jpg", "img/cases/c16/22.jpg", "img/cases/c16/23.jpg", "img/cases/c16/25.jpg", "img/cases/c16/26.jpg", "img/cases/c16/27.jpg", "img/cases/c16/28.jpg", "img/cases/c16/30.jpg", "img/cases/c16/31.jpg", "img/cases/c16/34.jpg", "img/cases/c16/35.jpg", "img/cases/c16/37.jpg", "img/cases/c16.jpg", "img/cases/c16/39.jpg", "img/cases/c16/41.jpg", "img/cases/c16/42.jpg", "img/cases/c16/43.jpg", "img/cases/c16/44.jpg", "img/cases/c16/45.jpg", "img/cases/c16/46.jpg", "img/cases/c16/47.jpg", "img/cases/c16/50.jpg", "img/cases/c16/51.jpg", "img/cases/c16/52.jpg", "img/cases/c16/53.jpg", "img/cases/c16/54.jpg", "img/cases/c16/55.jpg", "img/cases/c16/58.jpg", "img/cases/c16/61.jpg"], year:"" },
    { id:"c17", region:"台北市中山區", title:"昇陽", category:"防火門", cats:["防火門"], stone:"amber", img:"img/cases/c17/2.jpg", imgs:["img/cases/c17/2.jpg", "img/cases/c17/3.jpg"], year:"" },
    { id:"c18", region:"台北市大安區", title:"正隆天第", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"wood", img:"img/cases/c18.jpg", imgs:["img/cases/c18.jpg", "img/cases/c18/2.jpg", "img/cases/c18/4.jpg", "img/cases/c18/6.jpg", "img/cases/c18/7.jpg"], year:"" },
    { id:"c19", region:"桃園市", title:"璟都", category:"防火門", cats:["防火門"], stone:"black", img:"img/cases/c19.jpg", imgs:["img/cases/c19.jpg", "img/cases/c19/2.jpg"], year:"" },
    { id:"c20", region:"新北市新店區", title:"碧波白", category:"防火門", cats:["防火門"], stone:"purple", img:"img/cases/c20/10.jpg", imgs:["img/cases/c20/10.jpg", "img/cases/c20/3.jpg", "img/cases/c20/4.jpg", "img/cases/c20/5.jpg", "img/cases/c20/7.jpg", "img/cases/c20/8.jpg", "img/cases/c20/9.jpg", "img/cases/c20/2.jpg", "img/cases/c20/12.jpg", "img/cases/c20/13.jpg", "img/cases/c20/14.jpg", "img/cases/c20/15.jpg", "img/cases/c20/16.jpg"], year:"" },
    { id:"c21", region:"台北市大安區", title:"華山33", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"carrara", img:"img/cases/c21/2.jpg", imgs:["img/cases/c21/2.jpg", "img/cases/c21/3.jpg", "img/cases/c21/5.jpg", "img/cases/c21/6.jpg", "img/cases/c21/7.jpg", "img/cases/c21/8.jpg", "img/cases/c21/9.jpg", "img/cases/c21/10.jpg"], year:"" },
    { id:"c22", region:"新北市新莊區", title:"賓陽", category:"牆面・天花", cats:["牆面・天花"], stone:"beige", img:"img/cases/c22/2.jpg", imgs:["img/cases/c22/2.jpg", "img/cases/c22.jpg", "img/cases/c22/3.jpg"], year:"" },
    { id:"c23", region:"苗栗縣竹南鎮", title:"苗栗縣竹南鎮", category:"牆面・天花", cats:["牆面・天花"], stone:"grey", img:"img/cases/c23.jpg", imgs:["img/cases/c23.jpg", "img/cases/c23/2.jpg", "img/cases/c23/3.jpg", "img/cases/c23/4.jpg", "img/cases/c23/5.jpg", "img/cases/c23/6.jpg", "img/cases/c23/7.jpg", "img/cases/c23/8.jpg", "img/cases/c23/9.jpg", "img/cases/c23/10.jpg", "img/cases/c23/11.jpg"], year:"" },
    { id:"c24", region:"台北市大同區", title:"隆大郡望", category:"防火門", cats:["防火門", "消防箱・檢修門"], stone:"gold", img:"img/cases/c24.jpg", imgs:["img/cases/c24.jpg", "img/cases/c24/2.jpg", "img/cases/c24/3.jpg", "img/cases/c24/4.jpg", "img/cases/c24/5.jpg", "img/cases/c24/6.jpg", "img/cases/c24/7.jpg", "img/cases/c24/8.jpg", "img/cases/c24/9.jpg", "img/cases/c24/10.jpg", "img/cases/c24/11.jpg", "img/cases/c24/12.jpg", "img/cases/c24/13.jpg", "img/cases/c24/14.jpg", "img/cases/c24/15.jpg", "img/cases/c24/16.jpg", "img/cases/c24/17.jpg", "img/cases/c24/18.jpg", "img/cases/c24/19.jpg", "img/cases/c24/20.jpg"], year:"" },
    { id:"c25", region:"", title:"電視牆", category:"牆面・天花", cats:["牆面・天花"], stone:"darkgrey", img:"img/cases/c25.jpg", imgs:["img/cases/c25.jpg", "img/cases/c25/2.jpg", "img/cases/c25/3.jpg", "img/cases/c25/4.jpg"], year:"" },
    { id:"c26", region:"新北市淡水區", title:"馥人灣", category:"防火門", cats:["防火門", "消防箱・檢修門"], stone:"silver", img:"img/cases/c26.jpg", imgs:["img/cases/c26.jpg", "img/cases/c26/3.jpg", "img/cases/c26/5.jpg", "img/cases/c26/6.jpg", "img/cases/c26/7.jpg", "img/cases/c26/9.jpg", "img/cases/c26/10.jpg", "img/cases/c26/11.jpg", "img/cases/c26/12.jpg", "img/cases/c26/14.jpg", "img/cases/c26/15.jpg", "img/cases/c26/16.jpg", "img/cases/c26/17.jpg", "img/cases/c26/18.jpg", "img/cases/c26/19.jpg", "img/cases/c26/20.jpg"], year:"" },
    { id:"c27", region:"宜蘭縣礁溪鄉", title:"鼎石PARK ONE", category:"防火門", cats:["防火門", "消防箱・檢修門"], stone:"amber", img:"img/cases/c27.jpg", imgs:["img/cases/c27.jpg", "img/cases/c27/2.jpg", "img/cases/c27/3.jpg", "img/cases/c27/4.jpg", "img/cases/c27/5.jpg", "img/cases/c27/7.jpg", "img/cases/c27/8.jpg", "img/cases/c27/9.jpg", "img/cases/c27/10.jpg", "img/cases/c27/11.jpg"], year:"" },
    { id:"c1785901599255", region:"新北市新店區", title:"中央公園一期", category:"消防箱・檢修門", cats:["消防箱・檢修門", "防火門", "全棟廊道"], stone:"carrara", img:"https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-sF7Qf3ZreqqFToXz1YCyP8XTmi4rKi.jpg", imgs:["https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-sF7Qf3ZreqqFToXz1YCyP8XTmi4rKi.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-GPrd1xxTCKCU4Pc7Wvw2Fo4b1hFz3w.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-4XsQ1OURxnmUhdXv1dyy09OERfu7Lb.jpg"], year:"" },
    { id:"c1785901869101", region:"新北市新店區", title:"中央公園二期", category:"消防箱・檢修門", cats:["消防箱・檢修門", "防火門"], stone:"carrara", img:"https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-d4XQabFDBdwPesM8MXSNJi6acldfY5.jpg", imgs:["https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-d4XQabFDBdwPesM8MXSNJi6acldfY5.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-oGBaSyOTEa55fwah9nx7x7HR5zigMX.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-ANSZevwKNBYO5WjYEUlJTdJTBB2cPx.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-SwpCXsHFTiNO2ZthVS7eEVFacWFDBr.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-SwpCXsHFTiNO2ZthVS7eEVFacWFDBr.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-oGBaSyOTEa55fwah9nx7x7HR5zigMX.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-d4XQabFDBdwPesM8MXSNJi6acldfY5.jpg"], year:"2026" },
    { id:"c1785902056469", region:"", title:"北大", category:"防火門", cats:["防火門", "牆面・天花"], stone:"wood", img:"https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-3jQ0T2cUlcxeugcixxZ7G085F67P6F.jpg", imgs:["https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-3jQ0T2cUlcxeugcixxZ7G085F67P6F.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-JNwr8wcgXFUrqkUlWiqnSb0neeZKql.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-Ayyr3uEh61JTG74IvGz1Y4iXKwAiMn.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-rc0JDJNbBjXW9zPrFIMIAVRHhyb7k9.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-Pcy94BhgwBjl649hx9Iju9tRsRUJM4.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-Jq2ZfdiIFUuR62O6Uo1YRhBw0U8m1V.jpg"], year:"2025" },
    { id:"c1785902322324", region:"高雄", title:"燕巢", category:"消防箱・檢修門", cats:["消防箱・檢修門", "防火門"], stone:"carrara", img:"https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-SlLRSyQzv4fbeyngOdRcC0U3kYQxUN.jpg", imgs:["https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-SlLRSyQzv4fbeyngOdRcC0U3kYQxUN.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-alpbxfuL23VHQX1t1vWNO2ufwXHILs.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-AdJmQzuhYYYclFrBpfqxEgmGMeelP9.jpg"], year:"2025" },
    { id:"c1785902419195", region:"", title:"藍玉", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"carrara", img:"https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-WN3soj1hZQSgr1V5intEnjjHFtbDLn.jpg", imgs:["https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-WN3soj1hZQSgr1V5intEnjjHFtbDLn.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/case-photo-B4EYvXpWz2O6mf9bPtQLLrf6iKDDpj.jpg"], year:"2026" },
    { id:"c1785919054409", region:"新北市三重區", title:"龍山林", category:"消防箱・檢修門", cats:["消防箱・檢修門", "防火門"], stone:"silver", img:"https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260323095126-mgf7AVJ5F5JfNuTzu8FFQQ5Y8tzzWj.jpg", imgs:["https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260323095126-mgf7AVJ5F5JfNuTzu8FFQQ5Y8tzzWj.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260306155404-yBymmbV2nJlHNjqJgmzRerqHN50S4S.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260306155440-qbngnZMIj0lin5yje1taYX2asHvrCe.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260323103052-AiHypZzix0BrFSm0UYpoNpnDOuOPtT.jpg"], year:"2026" },
    { id:"c1785919148746", region:"新北市林口區", title:"中央大樓", category:"牆面・天花", cats:["牆面・天花"], stone:"amber", img:"https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20251030155711-z3MMt1F8yrFMhsNkEa0y2si8aPQSs9.jpg", imgs:["https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20251030155711-z3MMt1F8yrFMhsNkEa0y2si8aPQSs9.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20251030155916-4q7GugltvHkkB3BJEPFIhRMxIg3c7Y.jpg"], year:"2026" },
    { id:"c1785919559078", region:"新北市林口區", title:"頤昌", category:"防火門", cats:["防火門"], stone:"carrara", img:"https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260713172332-nWFeXhFmUfXd3qruHHdc2dtjMfHDRI.jpg", imgs:["https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260713172332-nWFeXhFmUfXd3qruHHdc2dtjMfHDRI.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260713172138-UfRvcexh8xRfHv2uRAeM0RsN9JgWVg.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260709171049-byqMaDOHsDXhIIKuLnN45NWJlivwfv.jpg"], year:"2026" },
    { id:"c1785919663496", region:"新竹", title:"謙恆", category:"防火門", cats:["防火門"], stone:"carrara", img:"https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260713145305-PWfFZPTsBqLIYURy2uOuSmV9D0BqlI.jpg", imgs:["https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260713145305-PWfFZPTsBqLIYURy2uOuSmV9D0BqlI.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260713145311-VVMevK9h4opbbkv8IeUw14K0v8gr0s.jpg"], year:"2026" },
    { id:"c1785919789686", region:"台中市北屯區", title:"覞山", category:"消防箱・檢修門", cats:["消防箱・檢修門", "防火門"], stone:"carrara", img:"https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260718145041-FiFqf6XitNbt99YpjOxrdXb8jPaIib.jpg", imgs:["https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260718145041-FiFqf6XitNbt99YpjOxrdXb8jPaIib.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260718144629_BURST000_COVER-rUGyuKJIgOhJSQmR1W6tkBP7S41wia.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260718144427-1OQAspdEGQ5lVdkfu5N42CxvsrhMJR.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260718144808-h54RL1BbWApeOV2TJT3Kl2iTQ7iED1.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260718145228-jrFZMKzyYM8CUXBDLt5pajPlcMbHmK.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260718144917-e4vY9wVGutel1aLbz3F6rpSuAReo7v.jpg", "https://bnwscm8jz43cfekv.public.blob.vercel-storage.com/uploads/IMG20260718144938-aOCQrkltplUYCfeClrYXW43UO1awiE.jpg"], year:"2026" },
  ]
};

/* 本機草稿版本守門：後台 admin 會把編輯內容暫存在這台瀏覽器的 localStorage('egrra_data')，
   作為「發布上線」前的本機預覽。但舊草稿會一直蓋掉之後更新的正式內容，造成看到過期資料。
   因此僅在草稿的 dataVersion 不比程式端(或已發布 blob)舊時才採用，邏輯與 api/published 一致。 */
window.EGRRA_LOCAL=function(){
  try{
    var s=localStorage.getItem('egrra_data'); if(!s) return null;
    var d=JSON.parse(s); if(!d||typeof d!=='object') return null;
    var def=window.EGRRA_DEFAULT_DATA||{};
    var sv=String(def.dataVersion||"");
    var lv=String(d.dataVersion||"");
    if(sv && (!lv || lv < sv)) return null;   /* 草稿較舊或無版本 → 忽略 */
    /* 分區同步：程式端若整批更新了某一區（如新增 100 款花色），
       草稿裡不會有，直接用草稿預覽會看不到新內容。
       只換掉那一區，草稿其餘未發布的修改照舊保留。
       這裡不寫回 localStorage —— 官網只是預覽，寫回是後台的職責。 */
    var secs=def.sectionVersions||{}, out=null;
    Object.keys(secs).forEach(function(k){
      if(String(secs[k]||"")>lv && def[k]!==undefined){
        if(!out){ out={}; for(var q in d) out[q]=d[q]; }
        out[k]=def[k];
      }
    });
    return out||d;
  }catch(e){ return null; }
};
