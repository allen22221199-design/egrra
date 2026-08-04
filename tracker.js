/* =========================================================================
   煌盛興業 EGRRA — 輕量網站數據追蹤
   ---------------------------------------------------------------------------
   ・不使用 cookie、不蒐集個資、不做跨站追蹤 → 依現行規範無須跳出同意橫幅
   ・尊重瀏覽器「Do Not Track」設定；後台頁面不追蹤
   ・每個工作階段(session)只寫自己的一份記錄 → 後端不會有併發覆蓋問題
   ・以 sendBeacon 在離開頁面時送出，不影響瀏覽體驗

   記錄內容：造訪的頁面與停留秒數、捲動深度、看過哪些區塊、以及互動事件
   （點花色/案例放大、產品卡、CTA、社群連結、表單送出、3D 場景操作…）
   ========================================================================= */
(function () {
  "use strict";
  var ENDPOINT = "/api/track";
  var KEY = "egrra_sid";
  var OPTOUT = "egrra_no_track";      /* 內部人員標記，存 localStorage → 永久有效 */

  /* ---------- 內部人員排除 ----------
     網址加 ?notrack=1 會在這台瀏覽器打上永久標記，之後所有瀏覽都不列入統計；
     ?notrack=0 可解除。開過後台的瀏覽器也會自動標記（自己人不會算進數據）。 */
  function optedOut() {
    try { return localStorage.getItem(OPTOUT) === "1"; } catch (e) { return false; }
  }
  try {
    var q = location.search;
    if (/[?&]notrack=1/.test(q)) { localStorage.setItem(OPTOUT, "1"); }
    else if (/[?&]notrack=0/.test(q)) { localStorage.removeItem(OPTOUT); }
  } catch (e) {}

  if (/admin\.html/i.test(location.pathname)) {
    /* 開過後台＝自己人：直接標記，之後逛官網也不計入 */
    try { localStorage.setItem(OPTOUT, "1"); } catch (e) {}
    return;
  }
  if (optedOut()) return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  var sid;
  try {
    sid = sessionStorage.getItem(KEY);
    if (!sid) { sid = uid(); sessionStorage.setItem(KEY, sid); }
  } catch (e) { sid = uid(); }

  /* ---------- 環境資訊（僅粗分類，不足以識別個人） ---------- */
  function device() {
    var w = window.innerWidth;
    return w < 700 ? "mobile" : (w < 1100 ? "tablet" : "desktop");
  }
  function source() {
    var r = document.referrer;
    if (!r) return "direct";
    try {
      var h = new URL(r).hostname.replace(/^www\./, "");
      if (h === location.hostname) return "internal";
      if (/google\./.test(h)) return "google";
      if (/bing\./.test(h)) return "bing";
      if (/facebook\.|fb\./.test(h)) return "facebook";
      if (/instagram\./.test(h)) return "instagram";
      if (/tiktok\./.test(h)) return "tiktok";
      if (/line\./.test(h)) return "line";
      if (/yahoo\./.test(h)) return "yahoo";
      return h;
    } catch (e) { return "other"; }
  }

  var page = location.pathname.replace(/\/index\.html$/, "/") || "/";
  var t0 = Date.now();
  var maxScroll = 0;
  var events = {};       /* 事件名 → 次數 */
  var sections = {};     /* 區塊 id → 看過 */
  var sent = false;

  function bump(name) {
    if (!name) return;
    events[name] = (events[name] || 0) + 1;
    schedule();
  }

  /* ---------- 捲動深度 ---------- */
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) return;
    var p = Math.round((window.scrollY / h) * 100);
    if (p > maxScroll) maxScroll = Math.min(p, 100);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 區塊曝光（首頁各段落） ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && e.target.id) {
          if (!sections[e.target.id]) { sections[e.target.id] = 1; schedule(); }
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------- 互動事件 ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a,button,[data-tk],.sw,.pf,.card,.cert-doc,.pcard");
    if (!el) return;

    /* 1) 明確標記優先 */
    var tk = el.getAttribute && el.getAttribute("data-tk");
    if (tk) { bump(tk); return; }

    /* 2) 對外連結／聯絡方式 */
    var href = el.getAttribute && el.getAttribute("href");
    if (href) {
      if (/^tel:/i.test(href)) return bump("contact_phone");
      if (/line\.me/i.test(href)) return bump("contact_line");
      if (/facebook\.com/i.test(href)) return bump("contact_facebook");
      if (/tiktok\.com/i.test(href)) return bump("contact_tiktok");
      if (/^mailto:/i.test(href)) return bump("contact_mail");
      if (/products\.html/i.test(href)) return bump("nav_colours");
      if (/cases\.html/i.test(href)) return bump("nav_projects");
      if (/certifications\.html/i.test(href)) return bump("nav_certs");
      if (/#contact/i.test(href)) return bump("cta_contact");
    }

    /* 3) 依元素類別推斷 */
    if (el.classList) {
      if (el.classList.contains("sw")) return bump("open_swatch");       /* 首頁精選花色放大 */
      if (el.classList.contains("pf")) return bump("open_case");         /* 首頁案例放大 */
      if (el.classList.contains("cert-doc")) return bump("open_cert");   /* 認證文件放大 */
      if (el.classList.contains("pcard")) return bump("click_product");  /* 產品線卡片 */
      if (el.classList.contains("card")) {
        return bump(/products\.html/.test(location.pathname) ? "open_colour" : "open_case_detail");
      }
    }
    if (el.id === "langbtn") return bump("switch_language");
  }, true);

  /* 3D 場景操作、表單送出 */
  document.addEventListener("click", function (e) {
    var c = e.target.closest && e.target.closest(".matctrl button, .tex-picker button");
    if (c) bump("use_3d_scene");
  }, true);
  document.addEventListener("submit", function (e) {
    if (e.target && e.target.id === "contactForm") bump("submit_form");
  }, true);

  /* ---------- 送出 ---------- */
  function payload() {
    return {
      sid: sid,
      page: page,
      sec: Math.min(Math.round((Date.now() - t0) / 1000), 3600),
      scroll: maxScroll,
      device: device(),
      source: source(),
      lang: document.documentElement.getAttribute("data-lang") || "zh",
      events: events,
      sections: Object.keys(sections)
    };
  }
  function send(useBeacon) {
    var body = JSON.stringify(payload());
    try {
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      } else {
        fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" },
                          body: body, keepalive: true }).catch(function () {});
      }
    } catch (e) {}
  }
  /* 節流：互動時最多每 15 秒補送一次，確保未關頁也有資料 */
  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; send(false); }, 15000);
  }

  /* 進站先送一次（確保跳出的訪客也被計入），之後在離開時送最終版 */
  setTimeout(function () { send(false); }, 1200);
  window.addEventListener("pagehide", function () { if (!sent) { sent = true; send(true); } });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") send(true);
  });
})();
