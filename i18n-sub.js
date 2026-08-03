/* =========================================================================
   煌盛興業 EGRRA — 子頁共用中英切換（花色庫 / 案例牆 / 認證頁）
   index.html 有自己的內建版本（歷史較早），本檔僅供子頁使用。
   用法：頁面引入本檔後呼叫
     EGRRA_I18N.init({ dict:{...}, sel:[[選擇器,"key"],...] })
   dict key 以 "#html" 結尾代表以 innerHTML 置換（可含標籤）。
   動態渲染的字串用 EGRRA_I18N.t(str)（精確比對表）與 .pname(產品名) 翻譯，
   語言切換時會呼叫 window.__redraw() 讓頁面重繪。
   ========================================================================= */
window.EGRRA_I18N = (function () {
  /* ---- 共用字典：導覽 / 頁尾 ---- */
  var DICT = {
    "nav.about": "About", "nav.tech": "Technology", "nav.products": "Products",
    "nav.library": "Colours", "nav.portfolio": "Projects", "nav.certs": "Certifications",
    "nav.contact": "Contact",
    "foot.home": "Home"
  };
  var SEL = [
    [".nav-links a[href='index.html#about']", "nav.about"],
    [".nav-links a[href='index.html#tech']", "nav.tech"],
    [".nav-links a[href='index.html#products']", "nav.products"],
    [".nav-links a[href='products.html']", "nav.library"],
    [".nav-links a[href='cases.html']", "nav.portfolio"],
    [".nav-links a[href='certifications.html']", "nav.certs"],
    [".nav-links a[href='index.html#contact']", "nav.contact"],
    [".foot a[href='index.html']", "foot.home"]
  ];

  /* ---- 動態字串精確對照（分類 / 系列 / 色系 / 規格 / 彈窗欄位） ---- */
  var STR = {
    "全部": "All",
    /* 案例分類 */
    "空間美化": "Interior", "防火門": "Fire Door", "消防箱": "Hydrant Box",
    "檢修門": "Access Panel", "牆面美化": "Feature Wall", "天花板": "Ceiling",
    "電視牆": "TV Wall", "長照空間": "Care Facility",
    "牆面": "Wall", "全棟廊道": "Corridor", "防火消防美化": "Fire Equipment",
    "豪宅客製": "Luxury Custom", "其他": "Other", "實績案例": "Project",
    /* 產品系列 / 色系 */
    "石紋系列": "Stone Series", "繡蝕系列": "Rust Series", "木紋系列": "Wood Series",
    "淺白": "Light", "米金": "Beige", "暖棕": "Warm", "灰階": "Grey", "深黑": "Dark",
    /* 規格 */
    "立體紋路・霧光・平光・消光": "Embossed · Matte · Satin · Flat",
    "以才計價，依需求數量報價": "Priced per unit (30×30 cm); quoted by quantity",
    "尺寸": "Sizes", "表面處理": "Finish", "計價": "Pricing",
    "地區": "Region", "類別": "Category", "年份": "Year", "照片": "Photos",
    "同系列花色": "Same series", "藝格板": "EGRRA Panel",
    /* 認證文件標題（燈箱說明） */
    "SGS 耐燃一級試驗報告（CNS 14705-1）": "SGS Class-1 fire-resistance test report (CNS 14705-1)",
    "SGS 抗菌測試報告（JIS Z2801）": "SGS antibacterial test report (JIS Z2801)",
    "SGS 無甲醛試驗報告（甲醛釋出量未檢出）": "SGS formaldehyde test report (none detected)"
  };
  var CITY = { "台北": "Taipei", "新北": "New Taipei", "台中": "Taichung",
    "新竹": "Hsinchu", "宜蘭": "Yilan", "高雄": "Kaohsiung", "桃園": "Taoyuan", "台南": "Tainan" };
  var PNAME = {
    "卡拉拉": "Carrara", "雅仕白": "Elegant White", "白玉蘭": "White Magnolia",
    "雪白細紋": "Snow White Fine-Vein", "帝寶米黃": "Imperial Beige", "加里奧金": "Galio Gold",
    "琥珀": "Amber", "聖羅蘭黑": "Laurent Black", "紫丁黑": "Lilac Black",
    "深灰石紋": "Deep Grey Stone", "安格拉": "Angola Pearl", "克里特灰": "Crete Grey",
    "黑網石": "Black Web Stone", "銀狐": "Silver Fox", "雕刻白": "Statuario",
    "黃金雕刻白": "Golden Statuario", "帝諾": "Tino Grey", "琥珀金紋": "Amber Gold-Vein",
    "抽象紋理": "Abstract", "鏽蝕 01": "Rust 01", "鏽蝕 02": "Rust 02", "鏽蝕 03": "Rust 03",
    "鏽蝕 04": "Rust 04", "鏽蝕 05": "Rust 05", "鏽蝕 06": "Rust 06",
    "木紋經典": "Classic Wood", "木紋 EN521": "Wood EN521", "木紋 GEH1215": "Wood GEH1215",
    "木紋 UE106C": "Wood UE106C", "木紋 EN628": "Wood EN628"
  };

  function en() { return document.documentElement.getAttribute("data-lang") === "en"; }
  function t(s) {
    if (!en() || s == null || s === "") return s;
    if (STR[s] != null) return STR[s];
    var pre = String(s).slice(0, 2);
    if (CITY[pre] && /^[一-鿿]+$/.test(s)) return CITY[pre];   /* 台北中正 → Taipei */
    if (/^[\d×\/\s]+尺$/.test(s)) return s.replace("尺", "ft");        /* 4×8 / … 尺 → ft */
    return s;
  }
  function pname(s) { return (en() && PNAME[s]) ? PNAME[s] : s; }

  function assign(sel) {
    sel.forEach(function (pair) {
      var el = document.querySelector(pair[0]);
      if (!el) return;
      var key = pair[1];
      if (/#html$/.test(key)) el.setAttribute("data-i18n-html", key);
      else el.setAttribute("data-i18n", key);
    });
  }
  function apply(lang) {
    var isEn = lang === "en";
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", isEn ? "en" : "zh-Hant");
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (isEn) { if (!el.hasAttribute("data-zh")) el.setAttribute("data-zh", el.textContent); if (DICT[k] != null) el.textContent = DICT[k]; }
      else if (el.hasAttribute("data-zh")) el.textContent = el.getAttribute("data-zh");
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-html").replace(/#html$/, "");
      if (isEn) { if (!el.hasAttribute("data-zh-html")) el.setAttribute("data-zh-html", el.innerHTML); if (DICT[k] != null) el.innerHTML = DICT[k]; }
      else if (el.hasAttribute("data-zh-html")) el.innerHTML = el.getAttribute("data-zh-html");
    });
    var btn = document.getElementById("langbtn");
    if (btn) btn.textContent = isEn ? "中文" : "EN";
    try { localStorage.setItem("egrra_lang", lang); } catch (e) {}
    if (window.__redraw) window.__redraw();
    try { window.dispatchEvent(new CustomEvent("egrra:lang", { detail: { lang: lang } })); } catch (e) {}
  }
  function init(cfg) {
    cfg = cfg || {};
    if (cfg.dict) for (var k in cfg.dict) DICT[k] = cfg.dict[k];
    assign(SEL.concat(cfg.sel || []));
    var btn = document.getElementById("langbtn");
    if (btn) btn.addEventListener("click", function () {
      apply(en() ? "zh" : "en");
    });
    var saved = "zh"; try { saved = localStorage.getItem("egrra_lang") || "zh"; } catch (e) {}
    if (saved === "en") apply("en"); else document.documentElement.setAttribute("data-lang", "zh");
  }
  return { init: init, t: t, pname: pname, en: en, apply: apply };
})();

/* 隱藏後台入口：3 秒內連點頁尾品牌字「煌盛興業 EGRRA」5 下 → admin.html
   （與 index.html 頁尾版權行的暗門行為一致） */
(function () {
  var el = document.querySelector(".foot b");
  if (!el) return;
  var n = 0, t0 = 0;
  el.addEventListener("click", function () {
    var now = Date.now();
    if (now - t0 > 3000) n = 0;
    t0 = now;
    if (++n >= 5) { n = 0; location.href = "admin.html"; }
  });
})();
