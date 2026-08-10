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
    "nav.compare": "Comparison", "nav.news": "News", "nav.contact": "Contact",
    "foot.home": "Home"
  };
  var SEL = [
    [".nav-links a[href='/#about']", "nav.about"],
    [".nav-links a[href='/#tech']", "nav.tech"],
    [".nav-links a[href='/#products']", "nav.products"],
    [".nav-links a[href='/products']", "nav.library"],
    [".nav-links a[href='/cases']", "nav.portfolio"],
    [".nav-links a[href='/compare']", "nav.compare"],
    [".nav-links a[href='/news']", "nav.news"],
    [".nav-links a[href='/certifications']", "nav.certs"],
    [".nav-links a[href='/#contact']", "nav.contact"],
    [".foot a[href='/']", "foot.home"]
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
    "石紋系列": "Stone Series", "鏽蝕系列": "Rust Series", "木紋系列": "Wood Series",
    "花崗石系列": "Granite Series",
    "單色系列": "Solid Colour Series",
    "120×240 / 120×300 / 150×300 cm": "120×240 / 120×300 / 150×300 cm",
    "三塗三烤": "Triple-coat, triple-bake",
    "花色編碼": "Colour code",
    "淺白": "Light", "米金": "Beige", "暖棕": "Warm", "灰階": "Grey", "深黑": "Dark",
    "紅磚": "Red", "綠": "Green", "藍": "Blue", "粉紫": "Pink",
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
    "木紋 UE106C": "Wood UE106C", "木紋 EN628": "Wood EN628",
    /* 2026-08 新增（自石材圖庫，共 120 款）*/
    "金麻": "Golden Sesame",
    "霸王花": "Royal Bloom",
    "印度紅": "Indian Red",
    "喬治亞灰": "Georgia Grey",
    "桃木珍珠": "Peach Pearl",
    "灰鑽": "Grey Diamond",
    "凝脂白": "Alabaster",
    "凝霜": "Frozen Frost",
    "初雪白": "First Snow",
    "晴雪": "Clear Snow",
    "月光白": "Moonlight White",
    "月華白": "Moonglow",
    "灰韻": "Grey Rhythm",
    "玉璧白": "Jade Disc",
    "玉瓷": "Jade Porcelain",
    "玉霜": "Jade Frost",
    "瑩光白": "Lucent White",
    "瓷光白": "Porcelain",
    "白玉棠": "Jade Crabapple",
    "白練": "White Silk",
    "白鶴石": "White Crane",
    "皎白": "Pearl White",
    "皓月白": "Bright Moon",
    "皓雪": "Bright Snow",
    "素心白": "Pure Heart",
    "素璧": "Plain Jade",
    "素紈": "Plain Silk",
    "素雪": "Plain Snow",
    "素雲白": "Plain Cloud",
    "縞白": "Striped White",
    "羽紗白": "Gauze White",
    "銀雪": "Silver Snow",
    "雪痕": "Snow Trace",
    "雪羽白": "Snow Plume",
    "雪脈白": "Snow Vein",
    "雲白石": "Cloud White",
    "雲鏡白": "Cloud Mirror",
    "霜羽": "Frost Feather",
    "霜華白": "Frost Bloom",
    "霧凇白": "Rime White",
    "霧鎖灰": "Fog Lock",
    "克羅蒂灰": "Crodi Grey",
    "冷杉灰": "Fir Grey",
    "咖啡絨": "Coffee Velvet",
    "墨痕": "Ink Trace",
    "墨雲灰": "Ink Cloud",
    "夏木樹石": "Summerwood",
    "寒灰": "Cold Grey",
    "岩心灰": "Rock Core",
    "暮靄灰": "Dusk Haze",
    "朦灰": "Dim Grey",
    "水墨灰": "Ink Wash",
    "灰嵐": "Grey Mist",
    "灰玉": "Grey Jade",
    "灰痕": "Grey Trace",
    "灰羽": "Grey Feather",
    "煙嵐灰": "Misty Haze",
    "疊嶂灰": "Layered Ridge",
    "石墨灰": "Graphite",
    "砂灰": "Sand Grey",
    "素岩": "Plain Rock",
    "蒼岩灰": "Ashen Rock",
    "遠山灰": "Distant Hills",
    "鉛華灰": "Leaden Grey",
    "雲煙灰": "Cloud Smoke",
    "霧影灰": "Fog Shadow",
    "青岩灰": "Blue Rock",
    "寒玉": "Cold Jade",
    "青玉": "Blue Jade",
    "新米黃": "Fresh Beige",
    "暖沙金": "Warm Sand",
    "暮金": "Dusk Gold",
    "木紋石": "Woodgrain Stone",
    "琥珀砂": "Amber Sand",
    "秋穗金": "Autumn Ear",
    "蜜蠟金": "Beeswax Gold",
    "西班牙紅": "Spanish Red",
    "赤金紋": "Crimson Gold",
    "金峰": "Golden Peak",
    "金絲玉": "Gold Silk Jade",
    "金縷": "Gold Thread",
    "鎏金石": "Gilded Stone",
    "麥浪金": "Wheat Wave",
    "胡桃棕": "Walnut Brown",
    "翡翠石": "Emerald Stone",
    "墨淵": "Ink Abyss",
    "墨潮": "Ink Tide",
    "墨玉": "Ink Jade",
    "夜岩": "Night Rock",
    "夜幕": "Nightfall",
    "夜曜": "Night Glow",
    "子夜": "Midnight",
    "暗夜金": "Midnight Gold",
    "深淵黑": "Abyss Black",
    "烏金石": "Black Gold",
    "玄墨": "Obsidian Ink",
    "玄武岩": "Basalt",
    "玄璧": "Dark Jade",
    "鐵黑": "Iron Black",
    "黑曜": "Obsidian",
    "黑曜金": "Obsidian Gold",
    "黑檀石": "Ebony Stone",
    "淺橡": "Light Oak",
    "柚木": "Teak",
    "楓木": "Maple",
    "樺木": "Birch",
    "灰橡": "Grey Oak",
    "煙燻橡": "Smoked Oak",
    "白楊": "Poplar",
    "白橡": "White Oak",
    "赤楊": "Alder",
    "栗木": "Chestnut Wood",
    "楓香": "Sweetgum",
    "橄欖木": "Olive Wood",
    "深胡桃": "Dark Walnut",
    "胡桃木": "Walnut",
    "花梨木": "Rosewood",
    "雪松": "Cedar",
    "非洲柚": "African Teak",
    /* 單色系列 */
    "純白": "Pure White",
    "象牙白": "Ivory",
    "奶油白": "Cream",
    "亞麻白": "Linen",
    "米白": "Off White",
    "陶土白": "Clay White",
    "燕麥": "Oat",
    "珍珠灰": "Pearl Grey",
    "灰米": "Greige",
    "淺灰": "Light Grey",
    "蘑菇灰": "Mushroom",
    "銀灰": "Silver Grey",
    "暖灰": "Warm Grey",
    "中灰": "Mid Grey",
    "鐵灰": "Iron Grey",
    "深灰": "Charcoal Grey",
    "奶油黃": "Butter Yellow",
    "小麥": "Wheat",
    "香檳金": "Champagne Gold",
    "沙丘": "Dune",
    "鈦金": "Titanium Gold",
    "卡其": "Khaki",
    "芥末黃": "Mustard",
    "赭黃": "Ochre",
    "焦糖": "Caramel",
    "石墨黑": "Graphite Black",
    "墨棕": "Espresso",
    "曜石黑": "Obsidian Black",
    "碳黑": "Carbon Black",
    "摩卡": "Mocha",
    "古銅": "Antique Bronze",
    "焦赭": "Burnt Umber",
    "可可": "Cocoa",
    "咖啡棕": "Coffee Brown",
    "赤陶": "Terracotta",
    "灼橘": "Burnt Orange",
    "磚紅": "Brick Red",
    "暖桃花心": "Warm Mahogany",
    "中國紅": "Chinese Red",
    "牛血紅": "Oxblood",
    "酒紅": "Wine Red",
    "青瓷綠": "Celadon",
    "鼠尾草綠": "Sage Green",
    "煙燻橄欖": "Smoky Olive",
    "苔綠": "Moss Green",
    "橄欖綠": "Olive Green",
    "森林綠": "Forest Green",
    "墨綠": "Ink Green",
    "霧藍": "Dusty Blue",
    "灰藍": "Slate Blue",
    "天空藍": "Sky Blue",
    "孔雀藍": "Deep Teal",
    "靛藍": "Indigo",
    "藏青": "Navy",
    "灰粉": "Dusty Pink",
    "玫瑰灰": "Rose Grey",
    "丁香紫": "Lilac",
    "藕紫": "Mauve",
    "梅果紫": "Plum"
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
    if (++n >= 5) { n = 0; location.href = "/admin"; }
  });
})();
