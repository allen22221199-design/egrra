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
  dataVersion: "2026-08-05T08:30:00Z",

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
          { label: "技術原理",
            us: { v: "紋理複刻技術" },
            cells: [ { v: "表面貼膜" }, { v: "模板噴塗／仿石噴漆" }, { v: "自然開採、切割加工" } ] },
          { label: "紋理真實度",
            us: { v: "極高", note: "可達真石材視覺 ＋ 立體觸感", flag: "win" },
            cells: [ { v: "中低" }, { v: "中" }, { v: "極高" } ] },
          { label: "紋理立體層次",
            us: { v: "可控制浮雕高度／層次", flag: "win" },
            cells: [ { v: "幾乎無" }, { v: "輕微立體感" }, { v: "礦物層次、具光影變化" } ] },
          { label: "圖紋檔案管理",
            us: { v: "數位檔案留存", note: "可編修、可客製衍伸", flag: "win" },
            cells: [ { v: "無檔案，單次貼附" }, { v: "多依模板手工" }, { v: "不可控、無法備份" } ] },
          { label: "客製設計彈性",
            us: { v: "高", note: "少量多樣、任意設計", flag: "win" },
            cells: [ { v: "低", note: "多固定花色" }, { v: "中", note: "部分客製" }, { v: "低", note: "依礦脈決定" } ] },
          { label: "適用基材",
            us: { v: "金屬、玻璃、木板、複合板", note: "多種基材皆可", flag: "win" },
            cells: [ { v: "平面板材" }, { v: "金屬、部分塑材" }, { v: "僅限天然石材本身" } ] },
          { label: "耐候性／耐久性",
            us: { v: "極佳", note: "戶外級保護層", flag: "win" },
            cells: [ { v: "易脫落、耐候差", flag: "limit" }, { v: "良好", note: "視塗裝工藝" }, { v: "易褪色、需定期保養", flag: "limit" } ] },
          { label: "防火／耐燃性",
            us: { v: "極佳", note: "鋁板不燃基材 ＋ 耐高溫", flag: "win" },
            cells: [ { v: "多依基材而定" }, { v: "良好", note: "搭配金屬基材" }, { v: "佳" } ] },
          { label: "成本結構",
            us: { v: "中", note: "技術投入較高" },
            cells: [ { v: "低～中" }, { v: "中" }, { v: "中～高", note: "採礦＋加工＋運輸" } ] },
          { label: "適用項目",
            us: { v: "牆面、天花板、門板（單開／雙開）", note: "公共空間、室內裝修、藝術專案、公設箱體等" },
            cells: [ { v: "室內牆、傢俱面" }, { v: "建築外牆、室內包柱" }, { v: "地坪、檯面、建築牆面" } ] },
          { label: "主要優勢",
            us: { v: "高仿真立體、數位化、跨材質", note: "客製彈性最高", flag: "win" },
            cells: [ { v: "成本低、量產快" }, { v: "色彩自然、施工普及" }, { v: "供應穩定", note: "但紋理、色澤不可控" } ] },
          { label: "主要侷限",
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
          { label: "尺寸・厚度",
            us: { v: "最大 150 × 300 cm", note: "厚度 0.1–9.5 cm｜工業鋁板，板幅與厚度範圍皆最廣", flag: "win" },
            cells: [ { v: "4′×8′ × 1.0mm", note: "彎板 0.7mm，須貼覆基材" },
                     { v: "3mm 單一厚度", note: "常備 935×1,855／935×2,455mm；訂製最大 1,235×3,070mm" } ] },
          { label: "使用場域",
            us: { v: "牆面・天花板・防火門・弱電箱・消防箱・公設", note: "單／雙開門、辦公室隔間、會議廳、電視牆、包柱", flag: "win" },
            cells: [ { v: "僅室內", note: "傢俱、櫥櫃、檯面、壁面", flag: "limit" },
                     { v: "僅室內", note: "廚衛、店鋪、餐飲、醫院、車站", flag: "limit" } ] },
          { label: "防水性",
            us: { v: "鋁基材不吸水、不氧化", note: "三塗三烤塗層封閉表面", flag: "win" },
            cells: [ { v: "板材僅 1.0mm，須貼基材", note: "黏貼縫隙、基材受潮易脫層剝離", dim: "官方測試含耐沸水性，無獨立防水／吸水率數據", flag: "limit" },
                     { v: "3mm 可直貼濕區牆面，耐濕", dim: "查無吸水率數據" } ] },
          { label: "耐候性",
            us: { v: "耐紫外線・不褪色・不氧化", note: "三塗三烤製程；室內可長期保持色澤與質感，無需保養", flag: "win" },
            cells: [ { v: "不建議戶外", note: "長期日曬濕氣易劣化", dim: "依官方使用說明定位為室內用途", flag: "limit" },
                     { v: "定位室內", dim: "查無戶外耐候數據", flag: "limit" } ] },
          { label: "清潔・抗污性",
            us: { v: "通過 SGS 抗菌認證", note: "中塗層含抗刮 ＋ UV", dim: "型錄標示特色含防污（抗菌塗層為選配）" },
            cells: [ { v: "抑制 7 種細菌及 5 種黴菌", note: "減少表面微生物達 99%", dim: "官方保養說明：忌研磨性及酸鹼性清潔劑，會造成不可回復的永久傷害" },
                     { v: "表面無毛細孔，清水可擦", note: "SIAA 抗菌認證，抑菌約 99%" } ] },
          { label: "單位面積重量",
            us: { v: "4尺×8尺 一片 8 kg", note: "約 2.78 kg/㎡，僅天然石材的約 1/30；不需加強原結構或更換重型鉸鏈，可快速施工", dim: "屬完成面重量；富美家為面材重量，須另加基材合計", flag: "win" },
            cells: [ { v: "面材 1.58 kg/㎡（1.1mm）", note: "1.23 kg/㎡（0.9mm）／0.88 kg/㎡（0.7mm）", dim: "僅面材，未含基材" },
                     { v: "約 5 kg/㎡", note: "3×8 板 11.6 kg／枚" } ] },
          { label: "強度",
            us: { v: "工業鋁板，本身即具結構剛性", note: "厚度可達 9.5cm，可依載重選配；無須依附基材", flag: "win" },
            cells: [ { v: "板材僅 1.0mm", note: "須黏貼基材才能使用", dim: "官方僅列「符合」，未公開數值", flag: "limit" },
                     { v: "具耐衝擊性（SGS）", dim: "公開數據有限" } ] },
          { label: "成本",
            us: { v: "國泰中正大樓省下 1/2 費用・2/3 時間", note: "防火門美化 20 層樓 × 4 扇門，全棟省約 300 萬（傳統大理石工法一扇約 NT$45,000）", flag: "win" },
            cells: [ { v: "每片約 NT$1,785–2,420", dim: "官方 2024 未稅" },
                     { v: "連工帶料估價", dim: "查無官方公開單價" } ] },
          { label: "表面耐磨硬度",
            us: { v: "3H", note: "中塗層含抗刮 ＋ UV 處理；面塗三塗三烤" },
            cells: [ { v: "ANSI／NEMA LD3 耐磨轉數 ≥ 400 轉", dim: "未以鉛筆硬度標示" },
                     { v: "9H", note: "鉛筆硬度（JIS K5600-5-4）", flag: "win" } ] },
          { label: "防火等級",
            us: { v: "耐燃一級", note: "通過台灣消防規範最高等級；鋁板不燃基材＋耐高溫，非燃性、無濃煙", flag: "win" },
            cells: [ { v: "防焰性 CNS 7614／物理性質 CNS 11367", dim: "非耐燃一級，須另選「火立克＋」系列", flag: "limit" },
                     { v: "台灣耐燃一級", note: "日本不燃認定 NM-2183", flag: "win" } ] },
          { label: "紋理客製",
            us: { v: "專利無縫對花技術", note: "消除拼接斷點｜數位檔案留存、可編修、可客製衍伸；立體紋理最大 1mm，可控制浮雕高度；客戶提供紋理即可複刻（600×600mm 打樣）", flag: "top" },
            cells: [ { v: "上百種固定花色" },
                     { v: "石紋／木紋／金屬／單色", note: "固定花色" } ] }
        ],
        srcs: "藝格板資料來源：煌盛興業《煌盛》簡報型錄（2026 年）。競品資料來源：Formica 官方 HPL 技術資料、AICA 工業官方仕様一覧（2026 年 4 月改定）。查詢日期：2026／07／16。競品規格以各該公司公開資料為準，並可能隨其改版而異動。"
      }
    ]
  },
  products: [
    { id:"p1",  name:"卡拉拉",   series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS002.jpg", desc:"" },
    { id:"p2",  name:"雅仕白",   series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS001.jpg", desc:"" },
    { id:"p3",  name:"白玉蘭",   series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS006.jpg", desc:"" },
    { id:"p4",  name:"雪白細紋", series:"石紋系列", stone:"silver",   sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS005.jpg", desc:"" },
    { id:"p5",  name:"帝寶米黃", series:"石紋系列", stone:"beige",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS018.jpg", desc:"" },
    { id:"p6",  name:"加里奧金", series:"石紋系列", stone:"gold",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS023.jpg", desc:"" },
    { id:"p7",  name:"琥珀",     series:"石紋系列", stone:"amber",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS024.jpg", desc:"" },
    { id:"p8",  name:"聖羅蘭黑", series:"石紋系列", stone:"black",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS037.jpg", desc:"" },
    { id:"p9",  name:"紫丁黑",   series:"石紋系列", stone:"purple",   sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS036.jpg", desc:"" },
    { id:"p10", name:"深灰石紋", series:"石紋系列", stone:"darkgrey", sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS032.jpg", desc:"" },
    { id:"p11", name:"安格拉",   series:"石紋系列", stone:"grey",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS031.jpg", desc:"" },
    { id:"p12", name:"克里特灰", series:"石紋系列", stone:"grey",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS030.jpg", desc:"" },
    { id:"p13", name:"黑網石",   series:"石紋系列", stone:"black",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS035.jpg", desc:"" },
    { id:"p14", name:"銀狐",     series:"石紋系列", stone:"silver",   sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS004.jpg", desc:"" },
    { id:"p15", name:"雕刻白",     series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS007.jpg", desc:"" },
    { id:"p16", name:"黃金雕刻白", series:"石紋系列", stone:"gold",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS008.jpg", desc:"" },
    { id:"p17", name:"帝諾",       series:"石紋系列", stone:"grey",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS017.jpg", desc:"" },
    { id:"p18", name:"琥珀金紋",   series:"石紋系列", stone:"amber",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS025.jpg", desc:"" },
    { id:"p19", name:"抽象紋理",   series:"石紋系列", stone:"darkgrey", sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS044.jpg", desc:"" },
    { id:"p20", name:"鏽蝕 01",    series:"繡蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS038.jpg", desc:"" },
    { id:"p21", name:"鏽蝕 02",    series:"繡蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS039.jpg", desc:"" },
    { id:"p22", name:"鏽蝕 03",    series:"繡蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS040.jpg", desc:"" },
    { id:"p23", name:"鏽蝕 04",    series:"繡蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS041.jpg", desc:"" },
    { id:"p24", name:"鏽蝕 05",    series:"繡蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS042.jpg", desc:"" },
    { id:"p25", name:"鏽蝕 06",    series:"繡蝕系列", stone:"rust",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS043.jpg", desc:"" },
    { id:"p26", name:"木紋經典",   series:"木紋系列", stone:"wood",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS052.jpg", desc:"" },
    { id:"p27", name:"木紋 EN521", series:"木紋系列", stone:"wood",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS053.jpg", desc:"" },
    { id:"p28", name:"木紋 GEH1215",series:"木紋系列", stone:"wood",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS054.jpg", desc:"" },
    { id:"p29", name:"木紋 UE106C",series:"木紋系列", stone:"wood",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS055.jpg", desc:"" },
    { id:"p30", name:"木紋 EN628", series:"木紋系列", stone:"wood",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"img/tex/SCS056.jpg", desc:"" }
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
    { id:"c1", region:"台北市大同區", title:"三豐第一匯", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"carrara", img:"img/cases/c1.jpg", imgs:["img/cases/c1.jpg","img/cases/c1/2.jpg","img/cases/c1/4.jpg","img/cases/c1/7.jpg","img/cases/c1/9.jpg"], year:"" },
    { id:"c2", region:"", title:"三輝", category:"防火門", cats:["防火門","消防箱・檢修門"], stone:"beige", img:"img/cases/c2.jpg", imgs:["img/cases/c2.jpg","img/cases/c2/2.jpg","img/cases/c2/3.jpg","img/cases/c2/4.jpg","img/cases/c2/5.jpg","img/cases/c2/6.jpg","img/cases/c2/7.jpg","img/cases/c2/9.jpg","img/cases/c2/10.jpg","img/cases/c2/11.jpg","img/cases/c2/12.jpg","img/cases/c2/13.jpg","img/cases/c2/14.jpg","img/cases/c2/15.jpg","img/cases/c2/16.jpg","img/cases/c2/17.jpg"], year:"" },
    { id:"c3", region:"台北市中山區", title:"中山TED", category:"防火門", cats:["防火門","消防箱・檢修門"], stone:"grey", img:"img/cases/c3.jpg", imgs:["img/cases/c3.jpg","img/cases/c3/2.jpg","img/cases/c3/3.jpg","img/cases/c3/4.jpg","img/cases/c3/5.jpg","img/cases/c3/6.jpg","img/cases/c3/7.jpg","img/cases/c3/8.jpg"], year:"" },
    { id:"c4", region:"新北市林口區", title:"京懋", category:"防火門", cats:["防火門"], stone:"gold", img:"img/cases/c4.jpg", imgs:["img/cases/c4.jpg","img/cases/c4/2.jpg","img/cases/c4/6.jpg","img/cases/c4/7.jpg","img/cases/c4/9.jpg"], year:"" },
    { id:"c5", region:"台北市大安區", title:"冠德羅斯福", category:"防火門", cats:["防火門"], stone:"darkgrey", img:"img/cases/c5.jpg", imgs:["img/cases/c5.jpg","img/cases/c5/2.jpg","img/cases/c5/3.jpg","img/cases/c5/5.jpg","img/cases/c5/6.jpg"], year:"" },
    { id:"c6", region:"新北市新莊區", title:"友座臻美", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"silver", img:"img/cases/c6.jpg", imgs:["img/cases/c6.jpg","img/cases/c6/2.jpg","img/cases/c6/3.jpg","img/cases/c6/4.jpg","img/cases/c6/5.jpg","img/cases/c6/7.jpg","img/cases/c6/8.jpg","img/cases/c6/10.jpg","img/cases/c6/13.jpg","img/cases/c6/14.jpg","img/cases/c6/15.jpg","img/cases/c6/16.jpg","img/cases/c6/17.jpg","img/cases/c6/18.jpg","img/cases/c6/19.jpg"], year:"" },
    { id:"c7", region:"高雄市新興區", title:"國壽中正大樓", category:"牆面・天花", cats:["牆面・天花"], stone:"amber", img:"img/cases/c7.jpg", imgs:["img/cases/c7.jpg","img/cases/c7/2.jpg","img/cases/c7/3.jpg","img/cases/c7/5.jpg","img/cases/c7/6.jpg","img/cases/c7/7.jpg","img/cases/c7/8.jpg","img/cases/c7/9.jpg","img/cases/c7/10.jpg","img/cases/c7/11.jpg","img/cases/c7/12.jpg","img/cases/c7/13.jpg","img/cases/c7/14.jpg","img/cases/c7/15.jpg","img/cases/c7/16.jpg","img/cases/c7/18.jpg","img/cases/c7/19.jpg","img/cases/c7/20.jpg","img/cases/c7/21.jpg","img/cases/c7/22.jpg","img/cases/c7/24.jpg","img/cases/c7/25.jpg","img/cases/c7/26.jpg","img/cases/c7/27.jpg"], year:"" },
    { id:"c8", region:"新北市土城區", title:"土城日月光", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"wood", img:"img/cases/c8.jpg", imgs:["img/cases/c8.jpg","img/cases/c8/2.jpg","img/cases/c8/4.jpg","img/cases/c8/5.jpg","img/cases/c8/6.jpg","img/cases/c8/7.jpg","img/cases/c8/8.jpg","img/cases/c8/9.jpg","img/cases/c8/10.jpg","img/cases/c8/11.jpg","img/cases/c8/12.jpg","img/cases/c8/13.jpg","img/cases/c8/14.jpg","img/cases/c8/15.jpg","img/cases/c8/16.jpg","img/cases/c8/17.jpg"], year:"" },
    { id:"c9", region:"新北市新莊區", title:"宏普AMAX", category:"防火門", cats:["防火門","消防箱・檢修門"], stone:"black", img:"img/cases/c9.jpg", imgs:["img/cases/c9.jpg","img/cases/c9/2.jpg","img/cases/c9/3.jpg","img/cases/c9/4.jpg","img/cases/c9/5.jpg","img/cases/c9/6.jpg","img/cases/c9/7.jpg","img/cases/c9/8.jpg"], year:"" },
    { id:"c10", region:"台北市大安區", title:"宏普川PARK", category:"防火門", cats:["防火門","消防箱・檢修門"], stone:"purple", img:"img/cases/c10.jpg", imgs:["img/cases/c10.jpg","img/cases/c10/2.jpg","img/cases/c10/4.jpg","img/cases/c10/5.jpg"], year:"" },
    { id:"c11", region:"台北市中正區", title:"宏璟延平南路案", category:"防火門", cats:["防火門"], stone:"carrara", img:"img/cases/c11.jpg", imgs:["img/cases/c11.jpg","img/cases/c11/2.jpg","img/cases/c11/4.jpg","img/cases/c11/6.jpg","img/cases/c11/9.jpg","img/cases/c11/12.jpg","img/cases/c11/14.jpg","img/cases/c11/15.jpg","img/cases/c11/17.jpg","img/cases/c11/18.jpg","img/cases/c11/19.jpg","img/cases/c11/21.jpg","img/cases/c11/22.jpg","img/cases/c11/24.jpg","img/cases/c11/25.jpg","img/cases/c11/26.jpg","img/cases/c11/27.jpg","img/cases/c11/28.jpg","img/cases/c11/31.jpg","img/cases/c11/33.jpg","img/cases/c11/34.jpg","img/cases/c11/36.jpg","img/cases/c11/38.jpg","img/cases/c11/39.jpg","img/cases/c11/40.jpg","img/cases/c11/44.jpg","img/cases/c11/45.jpg","img/cases/c11/46.jpg","img/cases/c11/47.jpg"], year:"" },
    { id:"c12", region:"台北市松山區", title:"山發富饒", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"beige", img:"img/cases/c12.jpg", imgs:["img/cases/c12.jpg","img/cases/c12/2.jpg","img/cases/c12/3.jpg","img/cases/c12/4.jpg","img/cases/c12/5.jpg","img/cases/c12/6.jpg","img/cases/c12/7.jpg","img/cases/c12/11.jpg","img/cases/c12/12.jpg","img/cases/c12/13.jpg","img/cases/c12/14.jpg","img/cases/c12/15.jpg","img/cases/c12/16.jpg"], year:"" },
    { id:"c13", region:"新北市中和區", title:"德林MIT", category:"防火門", cats:["防火門"], stone:"grey", img:"img/cases/c13.jpg", imgs:["img/cases/c13.jpg","img/cases/c13/2.jpg","img/cases/c13/3.jpg","img/cases/c13/4.jpg","img/cases/c13/5.jpg","img/cases/c13/7.jpg","img/cases/c13/11.jpg"], year:"" },
    { id:"c14", region:"台中市南屯區", title:"惠宇", category:"牆面・天花", cats:["牆面・天花"], stone:"gold", img:"img/cases/c14.jpg", imgs:["img/cases/c14.jpg","img/cases/c14/2.jpg"], year:"" },
    { id:"c15", region:"台北市松山區", title:"揚昇君悅", category:"防火門", cats:["防火門"], stone:"darkgrey", img:"img/cases/c15.jpg", imgs:["img/cases/c15.jpg","img/cases/c15/2.jpg","img/cases/c15/3.jpg","img/cases/c15/4.jpg"], year:"" },
    { id:"c16", region:"台北市內湖區", title:"新北國貿", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"silver", img:"img/cases/c16.jpg", imgs:["img/cases/c16.jpg","img/cases/c16/3.jpg","img/cases/c16/4.jpg","img/cases/c16/5.jpg","img/cases/c16/6.jpg","img/cases/c16/7.jpg","img/cases/c16/8.jpg","img/cases/c16/9.jpg","img/cases/c16/11.jpg","img/cases/c16/12.jpg","img/cases/c16/13.jpg","img/cases/c16/14.jpg","img/cases/c16/16.jpg","img/cases/c16/18.jpg","img/cases/c16/19.jpg","img/cases/c16/20.jpg","img/cases/c16/21.jpg","img/cases/c16/22.jpg","img/cases/c16/23.jpg","img/cases/c16/25.jpg","img/cases/c16/26.jpg","img/cases/c16/27.jpg","img/cases/c16/28.jpg","img/cases/c16/30.jpg","img/cases/c16/31.jpg","img/cases/c16/34.jpg","img/cases/c16/35.jpg","img/cases/c16/37.jpg","img/cases/c16/38.jpg","img/cases/c16/39.jpg","img/cases/c16/41.jpg","img/cases/c16/42.jpg","img/cases/c16/43.jpg","img/cases/c16/44.jpg","img/cases/c16/45.jpg","img/cases/c16/46.jpg","img/cases/c16/47.jpg","img/cases/c16/50.jpg","img/cases/c16/51.jpg","img/cases/c16/52.jpg","img/cases/c16/53.jpg","img/cases/c16/54.jpg","img/cases/c16/55.jpg","img/cases/c16/58.jpg","img/cases/c16/61.jpg"], year:"" },
    { id:"c17", region:"台北市中山區", title:"昇陽", category:"防火門", cats:["防火門"], stone:"amber", img:"img/cases/c17/2.jpg", imgs:["img/cases/c17/2.jpg","img/cases/c17/3.jpg"], year:"" },
    { id:"c18", region:"台北市大安區", title:"正隆天第", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"wood", img:"img/cases/c18.jpg", imgs:["img/cases/c18.jpg","img/cases/c18/2.jpg","img/cases/c18/4.jpg","img/cases/c18/6.jpg","img/cases/c18/7.jpg"], year:"" },
    { id:"c19", region:"桃園市", title:"璟都", category:"防火門", cats:["防火門"], stone:"black", img:"img/cases/c19.jpg", imgs:["img/cases/c19.jpg","img/cases/c19/2.jpg"], year:"" },
    { id:"c20", region:"新北市新店區", title:"碧波白", category:"防火門", cats:["防火門"], stone:"purple", img:"img/cases/c20/2.jpg", imgs:["img/cases/c20/2.jpg","img/cases/c20/3.jpg","img/cases/c20/4.jpg","img/cases/c20/5.jpg","img/cases/c20/7.jpg","img/cases/c20/8.jpg","img/cases/c20/9.jpg","img/cases/c20/10.jpg","img/cases/c20/12.jpg","img/cases/c20/13.jpg","img/cases/c20/14.jpg","img/cases/c20/15.jpg","img/cases/c20/16.jpg"], year:"" },
    { id:"c21", region:"台北市大安區", title:"華山33", category:"消防箱・檢修門", cats:["消防箱・檢修門"], stone:"carrara", img:"img/cases/c21/2.jpg", imgs:["img/cases/c21/2.jpg","img/cases/c21/3.jpg","img/cases/c21/5.jpg","img/cases/c21/6.jpg","img/cases/c21/7.jpg","img/cases/c21/8.jpg","img/cases/c21/9.jpg","img/cases/c21/10.jpg"], year:"" },
    { id:"c22", region:"新北市新莊區", title:"賓陽", category:"牆面・天花", cats:["牆面・天花"], stone:"beige", img:"img/cases/c22.jpg", imgs:["img/cases/c22.jpg","img/cases/c22/2.jpg","img/cases/c22/3.jpg"], year:"" },
    { id:"c23", region:"苗栗縣竹南鎮", title:"遠雄", category:"牆面・天花", cats:["牆面・天花"], stone:"grey", img:"img/cases/c23.jpg", imgs:["img/cases/c23.jpg","img/cases/c23/2.jpg","img/cases/c23/3.jpg","img/cases/c23/4.jpg","img/cases/c23/5.jpg","img/cases/c23/6.jpg","img/cases/c23/7.jpg","img/cases/c23/8.jpg","img/cases/c23/9.jpg","img/cases/c23/10.jpg","img/cases/c23/11.jpg"], year:"" },
    { id:"c24", region:"台北市大同區", title:"隆大郡望", category:"防火門", cats:["防火門","消防箱・檢修門"], stone:"gold", img:"img/cases/c24.jpg", imgs:["img/cases/c24.jpg","img/cases/c24/2.jpg","img/cases/c24/3.jpg","img/cases/c24/4.jpg","img/cases/c24/5.jpg","img/cases/c24/6.jpg","img/cases/c24/7.jpg","img/cases/c24/8.jpg","img/cases/c24/9.jpg","img/cases/c24/10.jpg","img/cases/c24/11.jpg","img/cases/c24/12.jpg","img/cases/c24/13.jpg","img/cases/c24/14.jpg","img/cases/c24/15.jpg","img/cases/c24/16.jpg","img/cases/c24/17.jpg","img/cases/c24/18.jpg","img/cases/c24/19.jpg","img/cases/c24/20.jpg"], year:"" },
    { id:"c25", region:"", title:"電視牆", category:"牆面・天花", cats:["牆面・天花"], stone:"darkgrey", img:"img/cases/c25.jpg", imgs:["img/cases/c25.jpg","img/cases/c25/2.jpg","img/cases/c25/3.jpg","img/cases/c25/4.jpg"], year:"" },
    { id:"c26", region:"新北市淡水區", title:"馥人灣", category:"防火門", cats:["防火門","消防箱・檢修門"], stone:"silver", img:"img/cases/c26.jpg", imgs:["img/cases/c26.jpg","img/cases/c26/3.jpg","img/cases/c26/5.jpg","img/cases/c26/6.jpg","img/cases/c26/7.jpg","img/cases/c26/9.jpg","img/cases/c26/10.jpg","img/cases/c26/11.jpg","img/cases/c26/12.jpg","img/cases/c26/14.jpg","img/cases/c26/15.jpg","img/cases/c26/16.jpg","img/cases/c26/17.jpg","img/cases/c26/18.jpg","img/cases/c26/19.jpg","img/cases/c26/20.jpg"], year:"" },
    { id:"c27", region:"宜蘭縣礁溪鄉", title:"鼎石PARK ONE", category:"防火門", cats:["防火門","消防箱・檢修門"], stone:"amber", img:"img/cases/c27.jpg", imgs:["img/cases/c27.jpg","img/cases/c27/2.jpg","img/cases/c27/3.jpg","img/cases/c27/4.jpg","img/cases/c27/5.jpg","img/cases/c27/7.jpg","img/cases/c27/8.jpg","img/cases/c27/9.jpg","img/cases/c27/10.jpg","img/cases/c27/11.jpg"], year:"" },
  ]
};

/* 本機草稿版本守門：後台 admin 會把編輯內容暫存在這台瀏覽器的 localStorage('egrra_data')，
   作為「發布上線」前的本機預覽。但舊草稿會一直蓋掉之後更新的正式內容，造成看到過期資料。
   因此僅在草稿的 dataVersion 不比程式端(或已發布 blob)舊時才採用，邏輯與 api/published 一致。 */
window.EGRRA_LOCAL=function(){
  try{
    var s=localStorage.getItem('egrra_data'); if(!s) return null;
    var d=JSON.parse(s); if(!d||typeof d!=='object') return null;
    var sv=String((window.EGRRA_DEFAULT_DATA||{}).dataVersion||"");
    var lv=String(d.dataVersion||"");
    if(sv && (!lv || lv < sv)) return null;   /* 草稿較舊或無版本 → 忽略 */
    return d;
  }catch(e){ return null; }
};
