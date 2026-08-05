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
     ※ 每次在程式端改內容請往上調整這個日期時間。 */
  dataVersion: "2026-08-04T20:00:00Z",

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
    { id:"c1", region:"", title:"三豐第一匯", category:"消防箱・檢修門", stone:"carrara", img:"img/cases/c1.jpg", imgs:["img/cases/c1.jpg","img/cases/c1/2.jpg","img/cases/c1/4.jpg","img/cases/c1/7.jpg","img/cases/c1/9.jpg"], year:"" },
    { id:"c2", region:"", title:"三輝", category:"防火門", stone:"beige", img:"img/cases/c2.jpg", imgs:["img/cases/c2.jpg","img/cases/c2/2.jpg","img/cases/c2/3.jpg","img/cases/c2/4.jpg","img/cases/c2/5.jpg","img/cases/c2/6.jpg","img/cases/c2/7.jpg","img/cases/c2/9.jpg","img/cases/c2/10.jpg","img/cases/c2/11.jpg","img/cases/c2/12.jpg","img/cases/c2/13.jpg","img/cases/c2/14.jpg","img/cases/c2/15.jpg","img/cases/c2/16.jpg","img/cases/c2/17.jpg"], year:"" },
    { id:"c3", region:"", title:"中山TED", category:"防火門", stone:"grey", img:"img/cases/c3.jpg", imgs:["img/cases/c3.jpg","img/cases/c3/2.jpg","img/cases/c3/3.jpg","img/cases/c3/4.jpg","img/cases/c3/5.jpg","img/cases/c3/6.jpg","img/cases/c3/7.jpg","img/cases/c3/8.jpg"], year:"" },
    { id:"c4", region:"", title:"京懋", category:"防火門", stone:"gold", img:"img/cases/c4.jpg", imgs:["img/cases/c4.jpg","img/cases/c4/2.jpg","img/cases/c4/6.jpg","img/cases/c4/7.jpg","img/cases/c4/9.jpg"], year:"" },
    { id:"c5", region:"", title:"冠德羅斯福", category:"防火門", stone:"darkgrey", img:"img/cases/c5.jpg", imgs:["img/cases/c5.jpg","img/cases/c5/2.jpg","img/cases/c5/3.jpg","img/cases/c5/5.jpg","img/cases/c5/6.jpg"], year:"" },
    { id:"c6", region:"", title:"友座臻美", category:"消防箱・檢修門", stone:"silver", img:"img/cases/c6.jpg", imgs:["img/cases/c6.jpg","img/cases/c6/2.jpg","img/cases/c6/3.jpg","img/cases/c6/4.jpg","img/cases/c6/5.jpg","img/cases/c6/7.jpg","img/cases/c6/8.jpg","img/cases/c6/10.jpg","img/cases/c6/13.jpg","img/cases/c6/14.jpg","img/cases/c6/15.jpg","img/cases/c6/16.jpg","img/cases/c6/17.jpg","img/cases/c6/18.jpg","img/cases/c6/19.jpg"], year:"" },
    { id:"c7", region:"", title:"國壽中正大樓", category:"牆面・天花", stone:"amber", img:"img/cases/c7.jpg", imgs:["img/cases/c7.jpg","img/cases/c7/2.jpg","img/cases/c7/3.jpg","img/cases/c7/5.jpg","img/cases/c7/6.jpg","img/cases/c7/7.jpg","img/cases/c7/8.jpg","img/cases/c7/9.jpg","img/cases/c7/10.jpg","img/cases/c7/11.jpg","img/cases/c7/12.jpg","img/cases/c7/13.jpg","img/cases/c7/14.jpg","img/cases/c7/15.jpg","img/cases/c7/16.jpg","img/cases/c7/18.jpg","img/cases/c7/19.jpg","img/cases/c7/20.jpg","img/cases/c7/21.jpg","img/cases/c7/22.jpg","img/cases/c7/24.jpg","img/cases/c7/25.jpg","img/cases/c7/26.jpg","img/cases/c7/27.jpg"], year:"" },
    { id:"c8", region:"", title:"土城日月光", category:"消防箱・檢修門", stone:"wood", img:"img/cases/c8.jpg", imgs:["img/cases/c8.jpg","img/cases/c8/2.jpg","img/cases/c8/4.jpg","img/cases/c8/5.jpg","img/cases/c8/6.jpg","img/cases/c8/7.jpg","img/cases/c8/8.jpg","img/cases/c8/9.jpg","img/cases/c8/10.jpg","img/cases/c8/11.jpg","img/cases/c8/12.jpg","img/cases/c8/13.jpg","img/cases/c8/14.jpg","img/cases/c8/15.jpg","img/cases/c8/16.jpg","img/cases/c8/17.jpg"], year:"" },
    { id:"c9", region:"", title:"宏普AMAX", category:"防火門", stone:"black", img:"img/cases/c9.jpg", imgs:["img/cases/c9.jpg","img/cases/c9/2.jpg","img/cases/c9/3.jpg","img/cases/c9/4.jpg","img/cases/c9/5.jpg","img/cases/c9/6.jpg","img/cases/c9/7.jpg","img/cases/c9/8.jpg"], year:"" },
    { id:"c10", region:"", title:"宏普川PARK", category:"防火門", stone:"purple", img:"img/cases/c10.jpg", imgs:["img/cases/c10.jpg","img/cases/c10/2.jpg","img/cases/c10/4.jpg","img/cases/c10/5.jpg"], year:"" },
    { id:"c11", region:"", title:"宏璟延平南路案", category:"防火門", stone:"carrara", img:"img/cases/c11.jpg", imgs:["img/cases/c11.jpg","img/cases/c11/2.jpg","img/cases/c11/4.jpg","img/cases/c11/6.jpg","img/cases/c11/9.jpg","img/cases/c11/12.jpg","img/cases/c11/14.jpg","img/cases/c11/15.jpg","img/cases/c11/17.jpg","img/cases/c11/18.jpg","img/cases/c11/19.jpg","img/cases/c11/21.jpg","img/cases/c11/22.jpg","img/cases/c11/24.jpg","img/cases/c11/25.jpg","img/cases/c11/26.jpg","img/cases/c11/27.jpg","img/cases/c11/28.jpg","img/cases/c11/31.jpg","img/cases/c11/33.jpg","img/cases/c11/34.jpg","img/cases/c11/36.jpg","img/cases/c11/38.jpg","img/cases/c11/39.jpg","img/cases/c11/40.jpg","img/cases/c11/44.jpg","img/cases/c11/45.jpg","img/cases/c11/46.jpg","img/cases/c11/47.jpg"], year:"" },
    { id:"c12", region:"", title:"山發富饒", category:"消防箱・檢修門", stone:"beige", img:"img/cases/c12.jpg", imgs:["img/cases/c12.jpg","img/cases/c12/2.jpg","img/cases/c12/3.jpg","img/cases/c12/4.jpg","img/cases/c12/5.jpg","img/cases/c12/6.jpg","img/cases/c12/7.jpg","img/cases/c12/11.jpg","img/cases/c12/12.jpg","img/cases/c12/13.jpg","img/cases/c12/14.jpg","img/cases/c12/15.jpg","img/cases/c12/16.jpg"], year:"" },
    { id:"c13", region:"", title:"德林MIT", category:"防火門", stone:"grey", img:"img/cases/c13.jpg", imgs:["img/cases/c13.jpg","img/cases/c13/2.jpg","img/cases/c13/3.jpg","img/cases/c13/4.jpg","img/cases/c13/5.jpg","img/cases/c13/7.jpg","img/cases/c13/11.jpg"], year:"" },
    { id:"c14", region:"", title:"惠宇", category:"牆面・天花", stone:"gold", img:"img/cases/c14.jpg", imgs:["img/cases/c14.jpg","img/cases/c14/2.jpg"], year:"" },
    { id:"c15", region:"", title:"揚昇君悅", category:"防火門", stone:"darkgrey", img:"img/cases/c15.jpg", imgs:["img/cases/c15.jpg","img/cases/c15/2.jpg","img/cases/c15/3.jpg","img/cases/c15/4.jpg"], year:"" },
    { id:"c16", region:"", title:"新北國貿", category:"消防箱・檢修門", stone:"silver", img:"img/cases/c16.jpg", imgs:["img/cases/c16.jpg","img/cases/c16/3.jpg","img/cases/c16/4.jpg","img/cases/c16/5.jpg","img/cases/c16/6.jpg","img/cases/c16/7.jpg","img/cases/c16/8.jpg","img/cases/c16/9.jpg","img/cases/c16/11.jpg","img/cases/c16/12.jpg","img/cases/c16/13.jpg","img/cases/c16/14.jpg","img/cases/c16/16.jpg","img/cases/c16/18.jpg","img/cases/c16/19.jpg","img/cases/c16/20.jpg","img/cases/c16/21.jpg","img/cases/c16/22.jpg","img/cases/c16/23.jpg","img/cases/c16/25.jpg","img/cases/c16/26.jpg","img/cases/c16/27.jpg","img/cases/c16/28.jpg","img/cases/c16/30.jpg","img/cases/c16/31.jpg","img/cases/c16/34.jpg","img/cases/c16/35.jpg","img/cases/c16/37.jpg","img/cases/c16/38.jpg","img/cases/c16/39.jpg","img/cases/c16/41.jpg","img/cases/c16/42.jpg","img/cases/c16/43.jpg","img/cases/c16/44.jpg","img/cases/c16/45.jpg","img/cases/c16/46.jpg","img/cases/c16/47.jpg","img/cases/c16/50.jpg","img/cases/c16/51.jpg","img/cases/c16/52.jpg","img/cases/c16/53.jpg","img/cases/c16/54.jpg","img/cases/c16/55.jpg","img/cases/c16/58.jpg","img/cases/c16/61.jpg"], year:"" },
    { id:"c17", region:"", title:"昇陽", category:"防火門", stone:"amber", img:"img/cases/c17/2.jpg", imgs:["img/cases/c17/2.jpg","img/cases/c17/3.jpg"], year:"" },
    { id:"c18", region:"", title:"正隆天第", category:"消防箱・檢修門", stone:"wood", img:"img/cases/c18.jpg", imgs:["img/cases/c18.jpg","img/cases/c18/2.jpg","img/cases/c18/4.jpg","img/cases/c18/6.jpg","img/cases/c18/7.jpg"], year:"" },
    { id:"c19", region:"", title:"璟都", category:"防火門", stone:"black", img:"img/cases/c19.jpg", imgs:["img/cases/c19.jpg","img/cases/c19/2.jpg"], year:"" },
    { id:"c20", region:"", title:"碧波白", category:"防火門", stone:"purple", img:"img/cases/c20/2.jpg", imgs:["img/cases/c20/2.jpg","img/cases/c20/3.jpg","img/cases/c20/4.jpg","img/cases/c20/5.jpg","img/cases/c20/7.jpg","img/cases/c20/8.jpg","img/cases/c20/9.jpg","img/cases/c20/10.jpg","img/cases/c20/12.jpg","img/cases/c20/13.jpg","img/cases/c20/14.jpg","img/cases/c20/15.jpg","img/cases/c20/16.jpg"], year:"" },
    { id:"c21", region:"", title:"華山33", category:"消防箱・檢修門", stone:"carrara", img:"img/cases/c21/2.jpg", imgs:["img/cases/c21/2.jpg","img/cases/c21/3.jpg","img/cases/c21/5.jpg","img/cases/c21/6.jpg","img/cases/c21/7.jpg","img/cases/c21/8.jpg","img/cases/c21/9.jpg","img/cases/c21/10.jpg"], year:"" },
    { id:"c22", region:"", title:"賓陽", category:"牆面・天花", stone:"beige", img:"img/cases/c22.jpg", imgs:["img/cases/c22.jpg","img/cases/c22/2.jpg","img/cases/c22/3.jpg"], year:"" },
    { id:"c23", region:"", title:"遠雄", category:"牆面・天花", stone:"grey", img:"img/cases/c23.jpg", imgs:["img/cases/c23.jpg","img/cases/c23/2.jpg","img/cases/c23/3.jpg","img/cases/c23/4.jpg","img/cases/c23/5.jpg","img/cases/c23/6.jpg","img/cases/c23/7.jpg","img/cases/c23/8.jpg","img/cases/c23/9.jpg","img/cases/c23/10.jpg","img/cases/c23/11.jpg"], year:"" },
    { id:"c24", region:"", title:"隆大郡望", category:"防火門", stone:"gold", img:"img/cases/c24.jpg", imgs:["img/cases/c24.jpg","img/cases/c24/2.jpg","img/cases/c24/3.jpg","img/cases/c24/4.jpg","img/cases/c24/5.jpg","img/cases/c24/6.jpg","img/cases/c24/7.jpg","img/cases/c24/8.jpg","img/cases/c24/9.jpg","img/cases/c24/10.jpg","img/cases/c24/11.jpg","img/cases/c24/12.jpg","img/cases/c24/13.jpg","img/cases/c24/14.jpg","img/cases/c24/15.jpg","img/cases/c24/16.jpg","img/cases/c24/17.jpg","img/cases/c24/18.jpg","img/cases/c24/19.jpg","img/cases/c24/20.jpg"], year:"" },
    { id:"c25", region:"", title:"電視牆", category:"牆面・天花", stone:"darkgrey", img:"img/cases/c25.jpg", imgs:["img/cases/c25.jpg","img/cases/c25/2.jpg","img/cases/c25/3.jpg","img/cases/c25/4.jpg"], year:"" },
    { id:"c26", region:"", title:"馥人灣", category:"防火門", stone:"silver", img:"img/cases/c26.jpg", imgs:["img/cases/c26.jpg","img/cases/c26/3.jpg","img/cases/c26/5.jpg","img/cases/c26/6.jpg","img/cases/c26/7.jpg","img/cases/c26/9.jpg","img/cases/c26/10.jpg","img/cases/c26/11.jpg","img/cases/c26/12.jpg","img/cases/c26/14.jpg","img/cases/c26/15.jpg","img/cases/c26/16.jpg","img/cases/c26/17.jpg","img/cases/c26/18.jpg","img/cases/c26/19.jpg","img/cases/c26/20.jpg"], year:"" },
    { id:"c27", region:"", title:"鼎石PARK ONE", category:"防火門", stone:"amber", img:"img/cases/c27.jpg", imgs:["img/cases/c27.jpg","img/cases/c27/2.jpg","img/cases/c27/3.jpg","img/cases/c27/4.jpg","img/cases/c27/5.jpg","img/cases/c27/7.jpg","img/cases/c27/8.jpg","img/cases/c27/9.jpg","img/cases/c27/10.jpg","img/cases/c27/11.jpg"], year:"" },
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
