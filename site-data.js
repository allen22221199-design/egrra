/* =========================================================================
   煌盛興業 EGRRA — 網站內容資料 (預設值)
   這個檔案是「官網 index.html」與「後台 admin.html」共用的內容來源。
   後台修改後會存進瀏覽器 localStorage('egrra_data')，官網優先讀 localStorage，
   沒有才用這裡的預設值。要讓「所有訪客」都看到新內容，需在後台「匯出 data」，
   再把匯出的內容更新到這個檔案並重新部署（或改用有後台的 CMS，見 README）。
   ========================================================================= */
window.EGRRA_DEFAULT_DATA = {

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
    { id:"p1",  name:"卡拉拉",   series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p2",  name:"雅仕白",   series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p3",  name:"白玉蘭",   series:"石紋系列", stone:"carrara",  sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p4",  name:"雪白細紋", series:"石紋系列", stone:"silver",   sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p5",  name:"帝寶米黃", series:"石紋系列", stone:"beige",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p6",  name:"加里奧金", series:"石紋系列", stone:"gold",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p7",  name:"琥珀",     series:"石紋系列", stone:"amber",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p8",  name:"聖羅蘭黑", series:"石紋系列", stone:"black",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p9",  name:"紫丁黑",   series:"石紋系列", stone:"purple",   sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p10", name:"深灰石紋", series:"石紋系列", stone:"darkgrey", sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p11", name:"安格拉",   series:"石紋系列", stone:"grey",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p12", name:"克里特灰", series:"石紋系列", stone:"grey",     sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p13", name:"黑網石",   series:"石紋系列", stone:"black",    sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" },
    { id:"p14", name:"銀狐",     series:"石紋系列", stone:"silver",   sizes:"4×4 / 4×8 / 4×10 / 5×10 尺", finish:"立體紋路・霧光・平光・消光", img:"", desc:"" }
  ],

  /* ---- 實績案例（後台「實績案例」分頁可增刪改）----
     category 可選：全棟廊道 / 防火消防美化 / 防火門 / 消防箱 / 牆面 / 天花板 / 豪宅客製 / 其他 */
  cases: [
    { id:"c1", region:"高雄新興", title:"國泰中正大樓・全棟牆面", category:"牆面", stone:"carrara", img:"https://egrra.com/wp-content/uploads/2022/01/20210101_藝格板大理石木紋烤漆_08.jpg", year:"" },
    { id:"c2", region:"新北新莊", title:"防火門", category:"防火門", stone:"beige", img:"https://egrra.com/wp-content/uploads/2022/01/20170810_宏普AMAX_03.jpg", year:"" },
    { id:"c3", region:"台北大同", title:"全棟廊道", category:"全棟廊道", stone:"black", img:"https://egrra.com/wp-content/uploads/2022/01/20191225_隆大郡望防火門_05.jpg", year:"" },
    { id:"c4", region:"新竹竹南", title:"藝格板", category:"其他", stone:"grey", img:"https://egrra.com/wp-content/uploads/2022/02/20190120_遠雄牆面_08.jpg", year:"" },
    { id:"c5", region:"台中南屯", title:"天花板", category:"天花板", stone:"gold", img:"https://egrra.com/wp-content/uploads/2022/02/惠宇大聚天花板-04_.jpg", year:"" },
    { id:"c6", region:"宜蘭礁溪", title:"防火消防美化", category:"防火消防美化", stone:"darkgrey", img:"https://egrra.com/wp-content/uploads/2022/02/20180625_鼎石PARK-ONE_10.jpg", year:"" },
    { id:"c7", region:"台北南港", title:"全棟廊道美化", category:"全棟廊道", stone:"silver", img:"https://egrra.com/wp-content/uploads/2022/02/昆陽園-002.jpg", year:"" },
    { id:"c8", region:"新北新莊", title:"全棟廊道美化", category:"全棟廊道", stone:"amber", img:"https://egrra.com/wp-content/uploads/2022/02/20170707-鞈-血捆-01.jpg", year:"" },
    { id:"c9", region:"新北永和", title:"防火消防美化", category:"防火消防美化", stone:"purple", img:"https://egrra.com/wp-content/uploads/2022/02/20180808_三輝防火門消防箱_05-1.jpg", year:"" },
    { id:"c10", region:"新北板橋", title:"防火消防美化", category:"防火消防美化", stone:"wood", img:"https://egrra.com/wp-content/uploads/2022/02/20180808_三輝防火門消防箱_04-1.jpg", year:"" },
    { id:"c11", region:"新北林口", title:"防火門美化", category:"防火門", stone:"carrara", img:"https://egrra.com/wp-content/uploads/2022/02/20180909_京懋防火門_02.jpg", year:"" },
    { id:"c12", region:"新北新莊", title:"防火消防美化", category:"防火消防美化", stone:"beige", img:"https://egrra.com/wp-content/uploads/2022/02/20190725_友座臻美_05.jpg", year:"" },
    { id:"c13", region:"台北士林", title:"防火消防美化", category:"防火消防美化", stone:"black", img:"https://egrra.com/wp-content/uploads/2022/02/宏普-世貿0-1.jpg", year:"" },
    { id:"c14", region:"台北大安", title:"全棟廊道美化", category:"全棟廊道", stone:"grey", img:"https://egrra.com/wp-content/uploads/2022/02/20180707_川普PARK_防火門消防箱_03.jpg", year:"" },
    { id:"c15", region:"新北中和", title:"防火門美化", category:"防火門", stone:"gold", img:"https://egrra.com/wp-content/uploads/2022/02/德林MIT防火門_06.jpg", year:"" },
    { id:"c16", region:"台北內湖", title:"全棟防火美化", category:"防火消防美化", stone:"darkgrey", img:"https://egrra.com/wp-content/uploads/2022/02/新北國貿防火檢修門面蓋_01a.jpg", year:"" },
    { id:"c17", region:"新北土城商場", title:"包柱美化", category:"牆面", stone:"silver", img:"https://egrra.com/wp-content/uploads/2022/02/宏璟-土城日月光-商場0-1.jpg", year:"" },
    { id:"c18", region:"新北土城", title:"廊道消防美化", category:"全棟廊道", stone:"amber", img:"https://egrra.com/wp-content/uploads/2022/02/土城日月光防火檢修門_08.jpg", year:"" },
    { id:"c19", region:"台北松山", title:"全棟廊道美化", category:"全棟廊道", stone:"purple", img:"https://egrra.com/wp-content/uploads/2022/02/20170808_山發富饒防火檢修門消防箱_10.jpg", year:"" },
    { id:"c20", region:"台北中正", title:"防火門美化", category:"防火門", stone:"wood", img:"https://egrra.com/wp-content/uploads/2022/02/20191120_宏璟延平南路案_17.jpg", year:"" },
    { id:"c21", region:"新北新店", title:"防火門美化", category:"防火門", stone:"carrara", img:"https://egrra.com/wp-content/uploads/2022/02/20190720_碧波白防火門_13.jpg", year:"" },
    { id:"c22", region:"台北大直", title:"全棟防火美化", category:"防火消防美化", stone:"beige", img:"https://egrra.com/wp-content/uploads/2022/02/吉田水綠清翫-12-1-1.jpg", year:"" },
    { id:"c23", region:"台中西區", title:"廊道消防美化", category:"全棟廊道", stone:"black", img:"https://egrra.com/wp-content/uploads/2022/02/台中創建特茲特牆面04a.jpg", year:"" },
    { id:"c24", region:"新北新店", title:"防火門美化", category:"防火門", stone:"grey", img:"https://egrra.com/wp-content/uploads/2022/02/襄澐昶明青山案_10a.jpg", year:"" },
    { id:"c25", region:"新北汐止", title:"防火消防美化", category:"防火消防美化", stone:"gold", img:"https://egrra.com/wp-content/uploads/2022/02/潗豐汐止閱泰然_02-1.jpg", year:"" },
    { id:"c26", region:"桃園市區", title:"防火消防美化", category:"防火消防美化", stone:"darkgrey", img:"https://egrra.com/wp-content/uploads/2022/02/20160505_璟都柏悅_01.jpg", year:"" },
    { id:"c27", region:"新北淡水", title:"全棟廊道美化", category:"全棟廊道", stone:"silver", img:"https://egrra.com/wp-content/uploads/2022/02/20181010_馥人灣_05.jpg", year:"" },
    { id:"c28", region:"台北中山", title:"防火消防美化", category:"防火消防美化", stone:"amber", img:"https://egrra.com/wp-content/uploads/2022/04/20180606_中山TED_01.jpg", year:"" },
    { id:"c29", region:"台北大同", title:"消防箱美化", category:"消防箱", stone:"purple", img:"https://egrra.com/wp-content/uploads/2022/02/20191113_三豐第一匯消防箱_01a.jpg", year:"" },
    { id:"c30", region:"新北中和", title:"防火門美化", category:"防火門", stone:"wood", img:"https://egrra.com/wp-content/uploads/2022/02/達永-沐夏0-1.jpg", year:"" },
    { id:"c31", region:"台北大安", title:"廊道美化", category:"全棟廊道", stone:"carrara", img:"https://egrra.com/wp-content/uploads/2022/04/正隆天第檢修門面蓋_18.jpg", year:"" },
    { id:"c32", region:"台北大安", title:"消防箱", category:"消防箱", stone:"beige", img:"https://egrra.com/wp-content/uploads/2022/04/20191120_華山33_06.jpg", year:"" },
    { id:"c33", region:"台北松山", title:"消防門", category:"防火門", stone:"black", img:"https://egrra.com/wp-content/uploads/2022/04/20210303_揚昇君悅_03.jpg", year:"" },
    { id:"c34", region:"新北私宅", title:"電視牆", category:"牆面", stone:"grey", img:"https://egrra.com/wp-content/uploads/2022/04/20210707_石紋電視牆_01.jpg", year:"" },
    { id:"c35", region:"台北大安", title:"全棟廊道", category:"全棟廊道", stone:"gold", img:"https://egrra.com/wp-content/uploads/2022/06/冠德羅斯福防火門-04.jpg", year:"" },
    { id:"c36", region:"新北新莊", title:"消防箱美化", category:"消防箱", stone:"darkgrey", img:"https://egrra.com/wp-content/uploads/2022/07/力麒PARK_03_.jpg", year:"" },
    { id:"c37", region:"台北中山", title:"檢修門美化", category:"其他", stone:"silver", img:"https://egrra.com/wp-content/uploads/2022/07/德運建設DSC_0403_.jpg", year:"" },
    { id:"c38", region:"台北文山", title:"消防箱美化", category:"消防箱", stone:"amber", img:"https://egrra.com/wp-content/uploads/2022/07/冠德微山丘-04_.jpg", year:"" },
    { id:"c39", region:"台北中山", title:"防火門美化", category:"防火門", stone:"purple", img:"https://egrra.com/wp-content/uploads/2022/07/昇陽_防火門02_.jpg", year:"" },
    { id:"c40", region:"台北大安", title:"全棟廊道美化", category:"全棟廊道", stone:"wood", img:"https://egrra.com/wp-content/uploads/2022/07/友座臻璽-01_.jpg", year:"" },
    { id:"c41", region:"新北永和", title:"牆面美化", category:"牆面", stone:"carrara", img:"https://egrra.com/wp-content/uploads/2022/07/大佳仁愛柏麗-01_.jpg", year:"" },
    { id:"c42", region:"台北士林", title:"消防箱", category:"消防箱", stone:"beige", img:"https://egrra.com/wp-content/uploads/2022/07/宏普蘭雅-04_.jpg", year:"" },
    { id:"c43", region:"台北中山", title:"消防箱", category:"消防箱", stone:"black", img:"https://egrra.com/wp-content/uploads/2022/07/泛亞長安-02_.jpg", year:"" },
    { id:"c44", region:"新北三重", title:"消防箱", category:"消防箱", stone:"grey", img:"https://egrra.com/wp-content/uploads/2022/07/長虹天馥-01_.jpg", year:"" },
    { id:"c45", region:"新北汐止", title:"全棟廊道", category:"全棟廊道", stone:"gold", img:"https://egrra.com/wp-content/uploads/2022/07/哲人德林-07_.jpg", year:"" },
    { id:"c46", region:"台北大安", title:"消防箱", category:"消防箱", stone:"darkgrey", img:"https://egrra.com/wp-content/uploads/2022/07/家格瑞安蓸-02_.jpg", year:"" },
    { id:"c47", region:"台北北投", title:"消防箱", category:"消防箱", stone:"silver", img:"https://egrra.com/wp-content/uploads/2022/07/國美山翫水-02_.jpg", year:"" },
    { id:"c48", region:"新北板橋", title:"防火門", category:"防火門", stone:"amber", img:"https://egrra.com/wp-content/uploads/2022/07/勝輝霏陽-02_.jpg", year:"" },
    { id:"c49", region:"台北中正", title:"大廳牆面", category:"牆面", stone:"purple", img:"https://egrra.com/wp-content/uploads/2022/07/森城大院_2_.jpg", year:"" },
    { id:"c50", region:"新竹東區", title:"全棟廊道", category:"全棟廊道", stone:"wood", img:"https://egrra.com/wp-content/uploads/2022/07/新竹磐龍2號-03_.jpg", year:"" },
    { id:"c51", region:"新北汐止", title:"防火門", category:"防火門", stone:"carrara", img:"https://egrra.com/wp-content/uploads/2022/07/達葳春田吉市-01_.jpg", year:"" },
    { id:"c52", region:"新北五股", title:"大廳美化", category:"牆面", stone:"beige", img:"https://egrra.com/wp-content/uploads/2022/07/漢特五股案-01_.jpg", year:"" },
    { id:"c53", region:"新北板橋", title:"消防箱", category:"消防箱", stone:"black", img:"https://egrra.com/wp-content/uploads/2022/07/德鄰雙盈-02_.jpg", year:"" },
    { id:"c54", region:"新北永和", title:"防火門", category:"防火門", stone:"grey", img:"https://egrra.com/wp-content/uploads/2022/07/億東朗廂-01_.jpg", year:"" },
    { id:"c55", region:"台北中山", title:"消防箱", category:"消防箱", stone:"gold", img:"https://egrra.com/wp-content/uploads/2022/07/樂揚然花苑-01_.jpg", year:"" },
    { id:"c56", region:"台北北投", title:"豪宅客製", category:"豪宅客製", stone:"darkgrey", img:"https://egrra.com/wp-content/uploads/2022/07/北投獨棟豪宅_05_.jpg", year:"" },
    { id:"c57", region:"新北板橋", title:"消防箱", category:"消防箱", stone:"silver", img:"https://egrra.com/wp-content/uploads/2022/07/永雄府中心_01_.jpg", year:"" },
    { id:"c58", region:"宜蘭", title:"牆面美化", category:"牆面", stone:"amber", img:"https://egrra.com/wp-content/uploads/2022/07/宜蘭頭城-聖方濟老人長照中心_09.jpg", year:"" },
    { id:"c59", region:"高雄橋頭", title:"防火門", category:"防火門", stone:"purple", img:"https://egrra.com/wp-content/uploads/2022/07/交響樂-02.jpg", year:"" }
  ]
};
