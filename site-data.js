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
  dataVersion: "2026-07-23T15:00:00Z",

  /* ---- 網站資訊（可在後台「網站資訊」分頁修改）---- */
  info: {
    phone: "02 . 2222 . 1199",
    phoneRaw: "0222221199",
    fax: "02 . 2228 . 6799",
    fb: "https://www.facebook.com/Egrra.Lu",
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

  /* ---- 實績案例（後台「實績案例」分頁可增刪改）----
     category 可選：全棟廊道 / 防火消防美化 / 防火門 / 消防箱 / 牆面 / 天花板 / 豪宅客製 / 其他 */
  cases: [
    { id:"c1", region:"高雄新興", title:"國泰中正大樓・全棟牆面", category:"牆面", stone:"carrara", img:"img/cases/c1.jpg", year:"" },
    { id:"c2", region:"新北新莊", title:"防火門", category:"防火門", stone:"beige", img:"img/cases/c2.jpg", year:"" },
    { id:"c3", region:"台北大同", title:"全棟廊道", category:"全棟廊道", stone:"black", img:"img/cases/c3.jpg", year:"" },
    { id:"c4", region:"新竹竹南", title:"藝格板", category:"其他", stone:"grey", img:"img/cases/c4.jpg", year:"" },
    { id:"c5", region:"台中南屯", title:"天花板", category:"天花板", stone:"gold", img:"img/cases/c5.jpg", year:"" },
    { id:"c6", region:"宜蘭礁溪", title:"防火消防美化", category:"防火消防美化", stone:"darkgrey", img:"img/cases/c6.jpg", year:"" },
    { id:"c7", region:"台北南港", title:"全棟廊道美化", category:"全棟廊道", stone:"silver", img:"img/cases/c7.jpg", year:"" },
    { id:"c8", region:"新北新莊", title:"全棟廊道美化", category:"全棟廊道", stone:"amber", img:"img/cases/c8.jpg", year:"" },
    { id:"c9", region:"新北永和", title:"防火消防美化", category:"防火消防美化", stone:"purple", img:"img/cases/c9.jpg", year:"" },
    { id:"c10", region:"新北板橋", title:"防火消防美化", category:"防火消防美化", stone:"wood", img:"img/cases/c10.jpg", year:"" },
    { id:"c11", region:"新北林口", title:"防火門美化", category:"防火門", stone:"carrara", img:"img/cases/c11.jpg", year:"" },
    { id:"c12", region:"新北新莊", title:"防火消防美化", category:"防火消防美化", stone:"beige", img:"img/cases/c12.jpg", year:"" },
    { id:"c13", region:"台北士林", title:"防火消防美化", category:"防火消防美化", stone:"black", img:"img/cases/c13.jpg", year:"" },
    { id:"c14", region:"台北大安", title:"全棟廊道美化", category:"全棟廊道", stone:"grey", img:"img/cases/c14.jpg", year:"" },
    { id:"c15", region:"新北中和", title:"防火門美化", category:"防火門", stone:"gold", img:"img/cases/c15.jpg", year:"" },
    { id:"c16", region:"台北內湖", title:"全棟防火美化", category:"防火消防美化", stone:"darkgrey", img:"img/cases/c16.jpg", year:"" },
    { id:"c17", region:"新北土城商場", title:"包柱美化", category:"牆面", stone:"silver", img:"img/cases/c17.jpg", year:"" },
    { id:"c18", region:"新北土城", title:"廊道消防美化", category:"全棟廊道", stone:"amber", img:"img/cases/c18.jpg", year:"" },
    { id:"c19", region:"台北松山", title:"全棟廊道美化", category:"全棟廊道", stone:"purple", img:"img/cases/c19.jpg", year:"" },
    { id:"c20", region:"台北中正", title:"防火門美化", category:"防火門", stone:"wood", img:"img/cases/c20.jpg", year:"" },
    { id:"c21", region:"新北新店", title:"防火門美化", category:"防火門", stone:"carrara", img:"img/cases/c21.jpg", year:"" },
    { id:"c22", region:"台北大直", title:"全棟防火美化", category:"防火消防美化", stone:"beige", img:"img/cases/c22.jpg", year:"" },
    { id:"c23", region:"台中西區", title:"廊道消防美化", category:"全棟廊道", stone:"black", img:"img/cases/c23.jpg", year:"" },
    { id:"c24", region:"新北新店", title:"防火門美化", category:"防火門", stone:"grey", img:"img/cases/c24.jpg", year:"" },
    { id:"c25", region:"新北汐止", title:"防火消防美化", category:"防火消防美化", stone:"gold", img:"img/cases/c25.jpg", year:"" },
    { id:"c26", region:"桃園市區", title:"防火消防美化", category:"防火消防美化", stone:"darkgrey", img:"img/cases/c26.jpg", year:"" },
    { id:"c27", region:"新北淡水", title:"全棟廊道美化", category:"全棟廊道", stone:"silver", img:"img/cases/c27.jpg", year:"" },
    { id:"c28", region:"台北中山", title:"防火消防美化", category:"防火消防美化", stone:"amber", img:"img/cases/c28.jpg", year:"" },
    { id:"c29", region:"台北大同", title:"消防箱美化", category:"消防箱", stone:"purple", img:"img/cases/c29.jpg", year:"" },
    { id:"c30", region:"新北中和", title:"防火門美化", category:"防火門", stone:"wood", img:"img/cases/c30.jpg", year:"" },
    { id:"c31", region:"台北大安", title:"廊道美化", category:"全棟廊道", stone:"carrara", img:"img/cases/c31.jpg", year:"" },
    { id:"c32", region:"台北大安", title:"消防箱", category:"消防箱", stone:"beige", img:"img/cases/c32.jpg", year:"" },
    { id:"c33", region:"台北松山", title:"消防門", category:"防火門", stone:"black", img:"img/cases/c33.jpg", year:"" },
    { id:"c34", region:"新北私宅", title:"電視牆", category:"牆面", stone:"grey", img:"img/cases/c34.jpg", year:"" },
    { id:"c35", region:"台北大安", title:"全棟廊道", category:"全棟廊道", stone:"gold", img:"img/cases/c35.jpg", year:"" },
    { id:"c36", region:"新北新莊", title:"消防箱美化", category:"消防箱", stone:"darkgrey", img:"img/cases/c36.jpg", year:"" },
    { id:"c37", region:"台北中山", title:"檢修門美化", category:"其他", stone:"silver", img:"img/cases/c37.jpg", year:"" },
    { id:"c38", region:"台北文山", title:"消防箱美化", category:"消防箱", stone:"amber", img:"img/cases/c38.jpg", year:"" },
    { id:"c39", region:"台北中山", title:"防火門美化", category:"防火門", stone:"purple", img:"img/cases/c39.jpg", year:"" },
    { id:"c40", region:"台北大安", title:"全棟廊道美化", category:"全棟廊道", stone:"wood", img:"img/cases/c40.jpg", year:"" },
    { id:"c41", region:"新北永和", title:"牆面美化", category:"牆面", stone:"carrara", img:"img/cases/c41.jpg", year:"" },
    { id:"c42", region:"台北士林", title:"消防箱", category:"消防箱", stone:"beige", img:"img/cases/c42.jpg", year:"" },
    { id:"c43", region:"台北中山", title:"消防箱", category:"消防箱", stone:"black", img:"img/cases/c43.jpg", year:"" },
    { id:"c44", region:"新北三重", title:"消防箱", category:"消防箱", stone:"grey", img:"img/cases/c44.jpg", year:"" },
    { id:"c45", region:"新北汐止", title:"全棟廊道", category:"全棟廊道", stone:"gold", img:"img/cases/c45.jpg", year:"" },
    { id:"c46", region:"台北大安", title:"消防箱", category:"消防箱", stone:"darkgrey", img:"img/cases/c46.jpg", year:"" },
    { id:"c47", region:"台北北投", title:"消防箱", category:"消防箱", stone:"silver", img:"img/cases/c47.jpg", year:"" },
    { id:"c48", region:"新北板橋", title:"防火門", category:"防火門", stone:"amber", img:"img/cases/c48.jpg", year:"" },
    { id:"c49", region:"台北中正", title:"大廳牆面", category:"牆面", stone:"purple", img:"img/cases/c49.jpg", year:"" },
    { id:"c50", region:"新竹東區", title:"全棟廊道", category:"全棟廊道", stone:"wood", img:"img/cases/c50.jpg", year:"" },
    { id:"c51", region:"新北汐止", title:"防火門", category:"防火門", stone:"carrara", img:"img/cases/c51.jpg", year:"" },
    { id:"c52", region:"新北五股", title:"大廳美化", category:"牆面", stone:"beige", img:"img/cases/c52.jpg", year:"" },
    { id:"c53", region:"新北板橋", title:"消防箱", category:"消防箱", stone:"black", img:"img/cases/c53.jpg", year:"" },
    { id:"c54", region:"新北永和", title:"防火門", category:"防火門", stone:"grey", img:"img/cases/c54.jpg", year:"" },
    { id:"c55", region:"台北中山", title:"消防箱", category:"消防箱", stone:"gold", img:"img/cases/c55.jpg", year:"" },
    { id:"c56", region:"台北北投", title:"豪宅客製", category:"豪宅客製", stone:"darkgrey", img:"img/cases/c56.jpg", year:"" },
    { id:"c57", region:"新北板橋", title:"消防箱", category:"消防箱", stone:"silver", img:"img/cases/c57.jpg", year:"" },
    { id:"c58", region:"宜蘭", title:"牆面美化", category:"牆面", stone:"amber", img:"img/cases/c58.jpg", year:"" },
    { id:"c59", region:"高雄橋頭", title:"防火門", category:"防火門", stone:"purple", img:"img/cases/c59.jpg", year:"" }
  ]
};
