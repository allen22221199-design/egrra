/* =========================================================================
   煌盛興業 EGRRA — 共用浮動 LINE 按鈕（在右下角聊天鈕的正上方）
   讀 site-data.js 的 info.line 網址。放進任何頁面：<script src="line-widget.js"></script>
   ★ 換成你們的 LINE 官方帳號：改 site-data.js 的 info.line / info.lineId
   ========================================================================= */
(function(){
  function data(){
    try{var s=localStorage.getItem("egrra_data");if(s){var d=JSON.parse(s);if(d&&d.info)return d.info;}}catch(e){}
    return (window.EGRRA_DEFAULT_DATA&&window.EGRRA_DEFAULT_DATA.info)||{};
  }
  var info=data();
  var url=info.line||"https://line.me/R/ti/p/@egrra";

  var css=
  "#egrra-line{position:fixed;right:23px;bottom:94px;z-index:9990;width:58px;height:58px;border-radius:50%;"+
    "background:#06C755;box-shadow:0 10px 26px -6px rgba(6,199,85,.6);display:grid;place-items:center;text-decoration:none;"+
    "transition:transform .3s cubic-bezier(.22,.61,.36,1)}"+
  "#egrra-line:hover{transform:scale(1.08)}"+
  "#egrra-line svg{width:32px;height:32px;fill:#fff}"+
  "#egrra-line .tip{position:absolute;right:70px;top:50%;transform:translateY(-50%) translateX(6px);opacity:0;pointer-events:none;"+
    "background:#fff;color:#20242b;padding:8px 13px;border-radius:10px;font-size:13px;font-weight:600;white-space:nowrap;"+
    "box-shadow:0 8px 22px -8px rgba(0,0,0,.35);transition:.3s;font-family:'Noto Sans TC','Microsoft JhengHei',sans-serif}"+
  "#egrra-line .tip::after{content:'';position:absolute;right:-5px;top:50%;transform:translateY(-50%) rotate(45deg);width:10px;height:10px;background:#fff}"+
  "#egrra-line:hover .tip{opacity:1;transform:translateY(-50%) translateX(0)}"+
  "@media(max-width:520px){#egrra-line{right:16px;bottom:86px;width:52px;height:52px}#egrra-line svg{width:28px;height:28px}}";

  function init(){
    var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
    var a=document.createElement("a");
    a.id="egrra-line";a.href=url;a.target="_blank";a.rel="noopener";
    a.setAttribute("aria-label","LINE 線上諮詢");
    a.innerHTML='<span class="tip">LINE 諮詢</span>'+
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 5.6 2 10.1c0 4 3.6 7.4 8.4 8 .3.07.8.22.9.5.09.26.06.65.03.9l-.14.9c-.04.26-.2 1.03.9.56s5.96-3.5 8.13-6C21.5 12.6 22 11.4 22 10.1 22 5.6 17.5 2 12 2zM8 12.6H6.4c-.24 0-.43-.19-.43-.43V9c0-.24.19-.43.43-.43s.43.19.43.43v2.74H8c.24 0 .43.19.43.43s-.19.43-.43.43zm1.7-.43c0 .24-.19.43-.43.43s-.43-.19-.43-.43V9c0-.24.19-.43.43-.43s.43.19.43.43v3.17zm3.9 0c0 .18-.12.35-.3.41a.44.44 0 0 1-.48-.15l-1.6-2.18v1.92c0 .24-.19.43-.43.43s-.43-.19-.43-.43V9c0-.18.12-.35.3-.41a.44.44 0 0 1 .48.15l1.6 2.18V9c0-.24.19-.43.43-.43s.43.19.43.43v3.17zm2.66-1.16c.24 0 .43.19.43.43s-.19.43-.43.43h-1.17v.73h1.17c.24 0 .43.19.43.43s-.19.43-.43.43h-1.6c-.24 0-.43-.19-.43-.43V9c0-.24.19-.43.43-.43h1.6c.24 0 .43.19.43.43s-.19.43-.43.43h-1.17v.73h1.17z"/></svg>';
    document.body.appendChild(a);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
