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
      "nav.media": "Media",
    "nav.compare": "Comparison", "nav.news": "News", "nav.contact": "Contact",
    "foot.home": "Home"
  };
  var SEL = [
    [".nav-links a[href='/#about']", "nav.about"],
    [".nav-links a[href='/#tech']", "nav.tech"],
    [".nav-links a[href='/#products']", "nav.products"],
    [".nav-links a[href='/compare']", "nav.compare"],
    [".nav-links a[href='/products']", "nav.library"],
    [".nav-links a[href='/cases']", "nav.portfolio"],
    [".nav-links a[href='/media']", "nav.media"],
    [".nav-links a[href='/news']", "nav.news"],
    [".nav-links a[href='/certifications']", "nav.certs"],
    [".nav-links a[href='/#contact']", "nav.contact"],
    [".foot a[href='/']", "foot.home"]
  ];

  /* ---- 動態字串對照 ----
     ★ 字典在 i18n-dict.js（全站共用），不要在這裡再開一份 ★
       以前 index.html 與本檔各存一份，然後就漂移了：2026-08 新增 178 款
       花色時只加進本檔，首頁那份還停在 30 條。詳見 i18n-dict.js 開頭。 */
  var D = window.EGRRA_DICT || { STR: {}, CITY: {}, PNAME: {} };
  var STR = D.STR, CITY = D.CITY, PNAME = D.PNAME;

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

/* =========================================================================
   手機版導覽選單
   -------------------------------------------------------------------------
   ★ 原本這是壞的，而且壞得很安靜 ★
     lib.css 在窄螢幕下把 .nav-links 藏起來、把漢堡鈕顯示出來，但
     (1) 沒有任何 .nav-links.open 的樣式，(2) 花色庫／實績案例／認證
     三頁連處理程式都沒有。結果是手機上按了漢堡鈕完全沒反應，
     使用者無法從任何內頁導覽到別的主題頁 —— 桌機版完全看不出問題。

   放在這裡是因為五個子頁都會載入本檔（首頁有自己一整套，不走這裡）。
   compare.html 與 news.html 原本各自寫了一份，已經移除 ——
   兩份同時綁在同一顆按鈕上會 toggle 兩次互相抵消。
   ========================================================================= */
(function () {
  var burger = document.querySelector(".burger");
  var links = document.querySelector(".nav-links");
  if (!burger || !links) return;

  function setOpen(on) {
    links.classList.toggle("open", on);
    burger.classList.toggle("on", on);
    burger.setAttribute("aria-expanded", on ? "true" : "false");
  }
  burger.setAttribute("aria-expanded", "false");
  burger.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(!links.classList.contains("open"));
  });

  /* 點了選單裡的連結就收起來。同頁錨點（/#contact 之類）不會換頁，
     不收的話面板會一直蓋在內容上。 */
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setOpen(false);
  });

  /* 點面板以外的地方、或按 Esc，也收起來 */
  document.addEventListener("click", function (e) {
    if (links.classList.contains("open") && !links.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });

  /* 轉成橫向或放大視窗後，面板的 fixed 定位會殘留在畫面上，要收掉。
     ★ 這個數字要跟 lib.css 的斷點一致（900px）★
       導覽列變 10 項後斷點從 600 改成 900，這裡沒跟著改的話，
       601～900px 之間會出現「漢堡鈕還在、面板卻被判定成該收起」的錯亂。 */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) setOpen(false);
  });
})();
