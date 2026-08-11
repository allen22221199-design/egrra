/* =========================================================================
   煌盛興業 EGRRA — 右下角智能客服小幫手（規則型）
   ・自帶樣式與 DOM，放進任何頁面：<script src="chatbot.js"></script>
   ・自動讀取 site-data.js / 後台 localStorage 的內容，回答保持同步
   ・要升級成真 AI 對答，把 answer() 換成呼叫你的後端即可（見底部說明）
   ========================================================================= */
(function(){

/* ---- 中英切換 ----
   這兩支小工具原本完全沒有 i18n，切成英文後右下角還是「LINE 諮詢」「煌盛小幫手」。
   語言狀態由 <html data-lang> 決定（i18n 切換時會寫上去），
   初次載入還沒切換前 fallback 讀 localStorage —— 兩者都看才不會有一瞬間的中文閃動。 */
function ecLang(){
  var d=document.documentElement.getAttribute("data-lang");
  if(d)return d;
  try{ return localStorage.getItem("egrra_lang")||"zh"; }catch(e){ return "zh"; }
}
function L(zh,en){ return ecLang()==="en"?en:zh; }
  "use strict";

  /* =========================================================================
     ★ 真 AI 設定（預設關閉＝純規則型；填入後端網址即啟用 AI 對答）
     - AI_ENDPOINT：你部署好的後端網址。已設 "/api/chat"（部署到 Vercel 後同源直通）。
       ・在 Vercel（含後端）上 = 真 AI（Gemini）作答。
       ・在 GitHub Pages（純靜態、無後端）上會自動退回規則式，不會出錯。
       後端程式在 api/chat.js（用 GEMINI_API_KEY 呼叫 Gemini；金鑰放後端，不可放前端）。
     - AI_MODE："fallback" = 只有規則答不出時才問 AI（省錢，建議）；"always" = 每題都問 AI
     ========================================================================= */
  var AI_ENDPOINT = "/api/chat";
  var AI_MODE     = "fallback";

  /* ---------- 讀取網站資料（與官網同源）---------- */
  function loadData(){
    try{var s=localStorage.getItem("egrra_data");if(s){var d=JSON.parse(s);if(d&&d.products)return d;}}catch(e){}
    return window.EGRRA_DEFAULT_DATA||{products:[],cases:[],info:{}};
  }
  var DATA=loadData(), INFO=DATA.info||{}, PRODUCTS=DATA.products||[], CASES=DATA.cases||[];
  var PHONE=INFO.phone||"02 . 2222 . 1199", FAX=INFO.fax||"02 . 2228 . 6799",
      FBURL=INFO.fb||"https://www.facebook.com/PrinTex22221199", PHONERAW=INFO.phoneRaw||"0222221199";

  function seriesNames(sname){
    return PRODUCTS.filter(function(p){return p.series===sname;}).map(function(p){return p.name;});
  }
  /* 花色名英譯：沿用全站共用字典，不要在這裡再開一份對照表 */
  function TRN(x){
    var D=window.EGRRA_DICT;
    return (ecLang()==="en"&&D&&D.PNAME&&D.PNAME[x])?D.PNAME[x]:x;
  }
  function sample(arr,n){return arr.slice(0,n).join("、");}

  /* ---------- 知識庫 / 意圖 ---------- */
  var MENU=["產品花色","怎麼計價","如何保養","防火安全","客製化","實績案例","聯絡我們"];

  var INTENTS=[
    { id:"greet", keys:["你好","妳好","您好","哈囉","哈嘍","嗨","hi","hello","在嗎","有人在","你是誰","誰"],
      reply:function(){return {text:L("您好！我是煌盛興業的線上小幫手 🙂 可以為您介紹藝格板的產品、計價、保養、防火與客製等資訊。請問想了解什麼呢？","Hello! I'm the EGRRA assistant 🙂 I can help with our panels — products, pricing, care, fire rating and customisation. What would you like to know?"),chips:MENU};} },

    { id:"products", keys:["產品","花色","系列","顏色","款式","色卡","有哪些","有什麼","商品","種類","大理石","石材","選擇","product","products","colour","color","finish","finishes","range","series","catalogue","catalog","marble","stone"],
      reply:function(){
        var stone=seriesNames("石紋系列");
        var t=L("我們的藝格板主要分三大系列：<b>石紋系列</b>（仿大理石、板岩）、<b>鏽蝕系列</b>（金屬鏽蝕質感）、<b>木紋系列</b>（溫潤木質）。","Our panels come in three main series: <b>Stone</b> (marble and slate looks), <b>Rust</b> (weathered-metal texture) and <b>Wood</b> (warm timber grain).");
        if(stone.length)t+=L("<br><br>石紋系列目前有 "+stone.length+" 款花色，例如："+sample(stone,6)+" …","<br><br>The Stone series currently has "+stone.length+" finishes, for example: "+sample(stone,6)+" …");
        t+=L("<br><br>另外也有<b>消防箱</b>與<b>防火門</b>的美化應用。想看哪個系列，或直接跟我說花色名稱？","<br><br>We also refinish <b>hydrant boxes</b> and <b>fire doors</b>. Which series would you like to see — or just tell me a finish name?");
        return {text:t,chips:["石紋系列","鏽蝕系列","木紋系列","消防箱／防火門","怎麼計價"]};
      } },

    { id:"series-stone", keys:["石紋","stone series","marble series"],
      reply:function(){var n=seriesNames("石紋系列");
        return {text:L("<b>石紋系列</b>重現天然大理石與板岩的紋理，"+(n.length?"包含 "+n.length+" 款：<br>"+n.join("、")+"。":"款式眾多。")+"<br><br>想知道某一款的尺寸或表面處理，直接跟我說名稱即可！","The <b>Stone series</b> recreates natural marble and slate. "+(n.length?"It includes "+n.length+" finishes:<br>"+n.map(TRN).join(", ")+".":"Many finishes available.")+"<br><br>Tell me a name and I'll give you its sizes and surface options."),chips:["尺寸規格","怎麼計價","聯絡我們"]};} },
    { id:"series-rust", keys:["鏽蝕","鏽蝕","鏽","金屬感","工業風","工業","rust","rusted","industrial","patina","metal look"],
      reply:function(){var n=seriesNames("鏽蝕系列");
        return {text:L("<b>鏽蝕系列</b>呈現金屬鏽蝕、歲月斑駁的工業美學，冷冽而深邃。"+(n.length?"目前花色："+n.join("、")+"。":"歡迎來電洽詢完整花色。"),"The <b>Rust series</b> captures weathered metal and the patina of age — cool, deep, industrial. "+(n.length?"Current finishes: "+n.map(TRN).join(", ")+".":"Call us for the full range.")),chips:["其他系列","聯絡我們"]};} },
    { id:"series-wood", keys:["木紋","木質","木頭","原木","wood","timber","woodgrain","wood grain"],
      reply:function(){var n=seriesNames("木紋系列");
        return {text:L("<b>木紋系列</b>是溫潤自然的木質紋理，為空間注入柔和暖意。"+(n.length?"目前花色："+n.join("、")+"。":"歡迎來電洽詢完整花色。"),"The <b>Wood series</b> brings warm, natural timber grain into a space. "+(n.length?"Current finishes: "+n.map(TRN).join(", ")+".":"Call us for the full range.")),chips:["其他系列","聯絡我們"]};} },

    { id:"price", keys:["計價","報價","價格","價錢","多少錢","單價","費用","估價","預算","貴","便宜","price","pricing","cost","quote","quotation","how much","budget","cheap","expensive"],
      reply:function(){return {text:L("藝格板以「<b>才</b>」計價。由於數量從數十才到數萬才落差很大，建議由您或設計師提供實際需求數量，我們業務會為您精準報價。<br><br>📞 歡迎來電 <b>"+PHONE+"</b> 或私訊 FB 洽詢。","Panels are priced per <b>cai</b> (a Taiwanese unit, 30×30 cm). Quantities range from tens to tens of thousands, so please tell us — or have your designer tell us — the quantity you need, and our sales team will quote precisely.<br><br>📞 Call <b>"+PHONE+"</b> or message us on Facebook."),chips:["聯絡我們","有哪些花色"]};} },

    { id:"maintain", keys:["保養","清潔","清洗","擦拭","壞","損壞","刮傷","維護","清理","保固","耐用","maintain","maintenance","clean","cleaning","care","scratch","damage","durable","warranty"],
      reply:function(){return {text:L("藝格板是鋁烤漆製品，耐用度高，少數損壞多屬人為破壞且幾乎都可修復。<br><br>保養很簡單，<b>一般擦拭即可</b>；但請勿使用強酸強鹼、或會溶解樹脂的溶劑（例如松香水、除膠劑）。","The panels are baked-enamel aluminium and hold up well; the rare damage we see is impact damage, and it can almost always be repaired.<br><br>Care is simple — <b>just wipe them down</b>. Avoid strong acids or alkalis, and solvents that dissolve resin (turpentine, adhesive remover)."),chips:["防火安全","客製化"]};} },

    { id:"fire", keys:["防火","耐燃","耐火","防焰","燃燒","阻燃","fire","fireproof","fire rating","flame","non-combustible","class 1"],
      reply:function(){return {text:L("藝格板通過台灣消防規範中<b>最高等級的「耐燃一級」</b>測試，防火安全性高，並可應用於<b>防火門、消防箱</b>的美化，兼顧安全與設計感。","The panels pass <b>Class 1</b> — the highest fire-resistance grade in Taiwan's fire code. They can be used to refinish <b>fire doors and hydrant boxes</b>, so safety and design don't have to trade off."),chips:["消防箱／防火門","SGS 抗菌","聯絡我們"]};} },

    { id:"firebox", keys:["消防箱","防火門","消防設備","滅火器箱","檢修門","hydrant","hydrant box","fire door","fire equipment","access panel","extinguisher"],
      reply:function(){return {text:L("我們提供<b>消防箱</b>與<b>防火門</b>的美化 —— 用藝格板把原本冰冷的消防設備融入整體空間美學，同時保有防火機能。全台已有多件實績。","We refinish <b>hydrant boxes</b> and <b>fire doors</b> — the panels let cold-looking fire equipment blend into the space while keeping its fire performance. We have completed many of these across Taiwan."),chips:["實績案例","防火安全"]};} },

    { id:"custom", keys:["客製","訂做","訂製","客制","專屬","量身","開發","自己的圖","圖案","指定","custom","customise","customize","bespoke","own design","own pattern","made to order"],
      reply:function(){return {text:L("當然可以客製！透過 <b>PrinTex™</b> 技術，您可提供 <b>600×600mm</b> 的紋理樣本，或由我們協助開發專屬圖紋，並選擇<b>鋁、玻璃、金屬、木</b>等基材製作，量身打造專屬花色與尺寸。","Yes — customisation is what <b>PrinTex™</b> is for. Send us a <b>600×600 mm</b> texture sample, or let us develop an original pattern with you. Choose your substrate — <b>aluminium, glass, metal or wood</b> — and we build the finish and size around your project."),chips:["核心技術","基材選擇","聯絡我們"]};} },

    { id:"substrate", keys:["基材","鋁","玻璃","金屬","底材","貼在","做在","材料","substrate","aluminium","aluminum","glass","metal","base material","backing"],
      reply:function(){return {text:L("PrinTex™ 能把<b>同一種紋理</b>做在多種基材上：<b>鋁、玻璃、金屬、木質</b>都可以，方便對應不同場域與工法需求。","PrinTex™ can put <b>the same texture</b> on several substrates — <b>aluminium, glass, metal, wood</b> — so one design can follow you across different sites and installation methods."),chips:["核心技術","尺寸規格"]};} },

    { id:"tech", keys:["printex","技術","原理","怎麼做","製程","專利","數位紋理","怎麼製作"],
      reply:function(){return {text:L("<b>PrinTex™</b> 是我們的專利數位紋理技術，能高精度還原天然石材的色澤與脈絡，印製於金屬、玻璃、陶瓷等基材上，呈現立體浮雕層次；並具備<b>專利無縫對花</b>，大面積拼接紋理也能連續不中斷。","<b>PrinTex™</b> is our patented digital-texture process. It reproduces the colour and veining of natural stone at high fidelity, prints onto metal, glass or ceramic substrates, and builds up an embossed, three-dimensional surface. Its <b>patented seamless pattern matching</b> means the veining runs continuously across large spans."),chips:["客製化","有哪些花色"]};} },

    { id:"weight", keys:["重量","多重","幾公斤","很輕","輕量","重不重","weight","heavy","how heavy","light","lightweight","kg"],
      reply:function(){return {text:L("藝格板重量約為<b>天然石材的 1/30</b>，大幅減輕結構負擔，施工也更方便。","The panels weigh about <b>1/30 of natural stone</b> — far less load on the structure, and much easier to install."),chips:["尺寸規格","防火安全"]};} },

    { id:"size", keys:["尺寸","大小","規格","幾尺","多大","表面處理","霧光","平光","消光","厚度","size","sizes","dimension","dimensions","spec","thickness","surface","matte","satin","gloss"],
      reply:function(){return {text:L("標準尺寸有 <b>4×4、4×8、4×10、5×10 尺</b>（約 120×240 / 120×300 / 150×300 cm），並可依現場需求客製裁切。<br><br>表面處理可選：<b>立體紋路、霧光、平光、消光</b>。","Standard sizes are <b>4×4, 4×8, 4×10 and 5×10 ft</b> (roughly 120×240 / 120×300 / 150×300 cm), and we cut to site requirements.<br><br>Surface options: <b>embossed, matte, satin, flat</b>."),chips:["怎麼計價","客製化"]};} },

    { id:"sgs", keys:["抗菌","sgs","衛生","細菌","病菌","乾淨","antibacterial","anti-bacterial","sgs","hygiene","bacteria","clean surface"],
      reply:function(){return {text:L("藝格板可提供 <b>SGS 抗菌認證</b>，抑制細菌孳生、維持空間潔淨，適合注重衛生的場域（如飯店、醫療、公共空間）。","We can supply the panels with <b>SGS antibacterial certification</b> — it suppresses bacterial growth and keeps surfaces clean, which matters in hotels, healthcare and public spaces."),chips:["防火安全","實績案例"]};} },

    { id:"cases", keys:["案例","實績","做過","工程","案場","作品","完工","業績","經驗","口碑","case","cases","project","projects","portfolio","reference","past work","experience"],
      reply:function(){
        var eg=CASES.slice(0,4).map(function(c){return c.region+"-"+c.title;});
        return {text:L("我們累積了 <b>"+CASES.length+" 件以上</b>實績，遍布全台，涵蓋全棟廊道、大廳牆面、防火門／消防箱美化、豪宅客製等。"+(eg.length?"<br><br>例如："+eg.join("、")+" …":"")+"<br><br>想了解特定地區或類型的案例，可以告訴我！","We have completed <b>"+CASES.length+"+ projects</b> across Taiwan — full-building corridors, lobby feature walls, fire-door and hydrant-box refinishing, and bespoke work for private residences."+(eg.length?"<br><br>For example: "+eg.join(", ")+" …":"")+"<br><br>Tell me a region or a project type and I'll narrow it down."),chips:["消防箱／防火門","聯絡我們"]};
      } },

    { id:"about", keys:["關於","公司","煌盛","egrra","多久","幾年","歷史","介紹","你們是","王子彩色","品牌","about","company","who are you","history","years","brand","background"],
      reply:function(){return {text:L("煌盛興業（EGRRA）源自「王子彩色」四十餘年的彩色印刷經驗，已累積<b>超過 46 年</b>，轉型專注於數位紋理建材，是專為建築與設計市場打造的品牌，提供從紋理開發到成品的全方位解決方案。","EGRRA grew out of Prince Color, a colour-printing house with four decades behind it — <b>over 46 years</b> in total. We moved that craft into building materials, and today we build digital-texture products for the architecture and design market, from developing the texture through to the finished panel."),chips:["核心技術","有哪些花色"]};} },

    { id:"contact", keys:["聯絡","連絡","電話","怎麼找","地址","在哪","傳真","fb","facebook","臉書","line","客服","怎麼買","購買","哪裡買","門市","據點","contact","phone","call","address","where","fax","facebook","line","buy","purchase","showroom","store"],
      reply:function(){return {text:L("歡迎與我們聯繫：","Get in touch:")+"<br>📞 電話：<a href='tel:"+PHONERAW+"'><b>"+PHONE+"</b></a><br>📠 傳真："+FAX+"<br>💬 Facebook：<a href='"+FBURL+"' target='_blank' rel='noopener'>大理石魔術師呂哥</a><br><br>"+L("也可以在網站下方的<b>洽詢表單</b>留下需求，我們會盡快回覆您！","You can also leave your requirements in the <b>enquiry form</b> at the bottom of this page and we'll get back to you shortly.")+",chips:["怎麼計價","實績案例"]};} },

    { id:"thanks", keys:["謝謝","感謝","感恩","thank","3q","感激","thanks","thank you","cheers","appreciate"],
      reply:function(){return {text:L("不客氣，很高興為您服務 🙂 還有任何問題都可以再問我！","You're very welcome 🙂 Ask me anything else any time!"),chips:MENU};} }
  ];

  /* 快速鍵的英文標籤。★ 只換顯示文字，送出去比對的仍是中文原值 ★
     若把 chips 的值本身改成英文，CHIP2Q 與所有 keys 都要跟著改一遍，
     而且中英兩套比對表會各自漂移 —— 顯示與資料分開才不會有這個問題。 */
  var CHIP_EN={
    "產品花色":"Products","怎麼計價":"Pricing","如何保養":"Care","防火安全":"Fire safety",
    "客製化":"Customisation","實績案例":"Projects","聯絡我們":"Contact",
    "石紋系列":"Stone series","鏽蝕系列":"Rust series","木紋系列":"Wood series",
    "消防箱／防火門":"Hydrant box / fire door","其他系列":"Other series",
    "尺寸規格":"Sizes","核心技術":"Technology","基材選擇":"Substrates",
    "SGS 抗菌":"SGS antibacterial","有哪些花色":"What finishes?"
  };

  /* 快捷詞 → 對應查詢字 */
  var CHIP2Q={"產品花色":"有哪些花色","消防箱／防火門":"消防箱 防火門","其他系列":"有哪些花色","尺寸規格":"尺寸","核心技術":"printex 技術","基材選擇":"基材","SGS 抗菌":"抗菌"};

  function answer(raw){
    var q=(raw||"").toLowerCase().replace(/\s+/g,"");
    if(!q)return {text:L("請輸入您的問題，或點下方的常見選項 🙂","Type a question, or pick one below 🙂"),chips:MENU};

    /* 1) 直接命中花色名稱 */
    for(var i=0;i<PRODUCTS.length;i++){
      var p=PRODUCTS[i];
      if(p.name&&p.name.length>=2&&q.indexOf(p.name.toLowerCase())>=0){
        return {text:"<b>"+p.name+"</b>（"+(p.series||"藝格板")+"）<br>尺寸："+(p.sizes||"多種尺寸")+"<br>表面處理："+(p.finish||"立體紋路・霧光・平光・消光")+(p.desc?"<br>"+p.desc:"")+"<br><br>想要報價或看實品，歡迎來電 "+PHONE+"。",chips:["怎麼計價","有哪些花色","聯絡我們"]};
      }
    }
    /* 2) 意圖評分（依關鍵字長度加權，越具體越優先）*/
    var best=null,bestScore=0;
    for(var j=0;j<INTENTS.length;j++){
      var it=INTENTS[j],score=0;
      for(var k=0;k<it.keys.length;k++){var key=it.keys[k].toLowerCase();if(q.indexOf(key)>=0)score+=key.length;}
      if(score>bestScore){bestScore=score;best=it;}
    }
    if(best&&bestScore>0)return best.reply();

    /* 3) 聽不懂（weak：若有接 AI，會轉給 AI 回答）*/
    return {weak:true,text:L("不好意思，這個問題我可能需要請專人為您服務 🙏 您可以換個方式問，或直接來電 <b>"+PHONE+"</b>、私訊 FB。以下是常見問題：","Sorry — this one is better handled by a person 🙏 Try rephrasing, or call <b>"+PHONE+"</b> / message us on Facebook. Here are some common questions:"),chips:MENU};
  }

  /* ---------- 樣式 ---------- */
  var css=
  "#egrra-chat{--g:#b08d57;--gd:#8f6f3f;--gl:#c9a878;--dk:#16130f;font-family:'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif}"+
  "#egrra-chat *{box-sizing:border-box}"+
  ".ec-fab{position:fixed;right:22px;bottom:22px;width:62px;height:62px;border-radius:50%;border:none;cursor:pointer;z-index:9998;"+
    "background:linear-gradient(145deg,var(--gl),var(--gd));box-shadow:0 12px 30px -8px rgba(143,111,63,.65);color:#fff;"+
    "display:grid;place-items:center;transition:transform .3s cubic-bezier(.22,.61,.36,1)}"+
  ".ec-fab:hover{transform:scale(1.07)}"+
  ".ec-fab svg{width:28px;height:28px;stroke:#fff;fill:none;stroke-width:1.8}"+
  ".ec-fab .ec-dot{position:absolute;top:2px;right:2px;width:15px;height:15px;background:#e5484d;border:2px solid #fff;border-radius:50%;"+
    "font-size:9px;color:#fff;display:grid;place-items:center;font-weight:700}"+
  ".ec-fab.hide{transform:scale(0);pointer-events:none}"+
  ".ec-tip{position:fixed;right:96px;bottom:34px;background:#fff;color:#20242b;padding:11px 15px;border-radius:14px 14px 4px 14px;"+
    "box-shadow:0 12px 30px -12px rgba(20,20,30,.3);font-size:13.5px;z-index:9997;max-width:210px;opacity:0;transform:translateY(8px);"+
    "transition:.4s;pointer-events:none;border:1px solid #eee}"+
  ".ec-tip.show{opacity:1;transform:none;pointer-events:auto}"+
  ".ec-tip b{color:var(--gd)}"+
  ".ec-panel{position:fixed;right:22px;bottom:22px;width:372px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 44px);"+
    "background:#fff;border-radius:20px;box-shadow:0 30px 70px -18px rgba(20,15,8,.5);z-index:9999;display:flex;flex-direction:column;"+
    "overflow:hidden;opacity:0;transform:translateY(20px) scale(.96);pointer-events:none;transition:.32s cubic-bezier(.22,.61,.36,1);transform-origin:bottom right}"+
  ".ec-panel.open{opacity:1;transform:none;pointer-events:auto}"+
  ".ec-head{background:linear-gradient(135deg,#211c16,var(--dk));color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px}"+
  ".ec-ava{width:42px;height:42px;border-radius:50%;background:linear-gradient(145deg,var(--gl),var(--gd));display:grid;place-items:center;"+
    "font-weight:900;font-size:18px;flex:0 0 auto;font-family:'Noto Serif TC',serif}"+
  ".ec-head .ht b{font-size:15.5px;display:block;letter-spacing:.02em}"+
  ".ec-head .ht span{font-size:11.5px;color:var(--gl);display:flex;align-items:center;gap:6px}"+
  ".ec-head .ht span::before{content:'';width:7px;height:7px;border-radius:50%;background:#37d67a;display:inline-block}"+
  ".ec-close{margin-left:auto;background:rgba(255,255,255,.1);border:none;color:#fff;width:30px;height:30px;border-radius:8px;font-size:20px;cursor:pointer;line-height:1}"+
  ".ec-close:hover{background:rgba(255,255,255,.2)}"+
  ".ec-body{flex:1;overflow-y:auto;padding:18px 16px 8px;background:#f6f5f3;display:flex;flex-direction:column;gap:12px}"+
  ".ec-row{display:flex;gap:9px;align-items:flex-end;max-width:86%}"+
  ".ec-row.bot{align-self:flex-start}"+
  ".ec-row.user{align-self:flex-end;flex-direction:row-reverse}"+
  ".ec-bava{width:28px;height:28px;border-radius:50%;background:linear-gradient(145deg,var(--gl),var(--gd));color:#fff;flex:0 0 auto;"+
    "display:grid;place-items:center;font-size:12px;font-weight:800;font-family:'Noto Serif TC',serif}"+
  ".ec-bub{padding:11px 14px;border-radius:15px;font-size:14px;line-height:1.65;word-break:break-word}"+
  ".ec-row.bot .ec-bub{background:#fff;color:#20242b;border:1px solid #ececec;border-bottom-left-radius:5px}"+
  ".ec-row.user .ec-bub{background:linear-gradient(135deg,var(--g),var(--gd));color:#fff;border-bottom-right-radius:5px}"+
  ".ec-bub a{color:inherit;text-decoration:underline}"+
  ".ec-row.bot .ec-bub a{color:var(--gd)}"+
  ".ec-typing{display:flex;gap:4px;padding:13px 15px}"+
  ".ec-typing i{width:7px;height:7px;background:#c3c0bb;border-radius:50%;animation:ecb 1s infinite}"+
  ".ec-typing i:nth-child(2){animation-delay:.15s}.ec-typing i:nth-child(3){animation-delay:.3s}"+
  "@keyframes ecb{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}"+
  ".ec-chips{display:flex;flex-wrap:wrap;gap:7px;padding:8px 14px;background:#f6f5f3}"+
  ".ec-chip{background:#fff;border:1px solid var(--gl);color:var(--gd);padding:7px 13px;border-radius:20px;font-size:12.5px;cursor:pointer;"+
    "transition:.2s;font-family:inherit}"+
  ".ec-chip:hover{background:var(--g);color:#fff;border-color:var(--g)}"+
  ".ec-input{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #eee;background:#fff}"+
  ".ec-input input{flex:1;border:1px solid #e2ddd5;border-radius:22px;padding:11px 16px;font-size:14px;font-family:inherit;outline:none;transition:.2s}"+
  ".ec-input input:focus{border-color:var(--g);box-shadow:0 0 0 3px rgba(176,141,87,.13)}"+
  ".ec-input button{background:var(--g);border:none;color:#fff;width:42px;height:42px;border-radius:50%;cursor:pointer;flex:0 0 auto;display:grid;place-items:center;transition:.2s}"+
  ".ec-input button:hover{background:var(--gd)}"+
  ".ec-input button svg{width:19px;height:19px;stroke:#fff;fill:none;stroke-width:2}"+
  ".ec-foot{text-align:center;font-size:10.5px;color:#b3aea6;padding:7px;background:#fff;letter-spacing:.05em}"+
  "@media(max-width:520px){.ec-panel{right:12px;bottom:12px;width:calc(100vw - 24px);height:calc(100vh - 90px)}.ec-fab{right:16px;bottom:16px}.ec-tip{display:none}}";

  /* ---------- 建立 DOM ---------- */
  function el(html){var d=document.createElement("div");d.innerHTML=html.trim();return d.firstChild;}
  function init(){
    var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
    var root=document.createElement("div");root.id="egrra-chat";document.body.appendChild(root);

    var fab=el("<button class='ec-fab' aria-label='"+L("開啟線上客服","Open live chat")+"'><span class='ec-dot'>1</span>"+
      "<svg viewBox='0 0 24 24'><path d='M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z'/></svg></button>");
    var tip=el("<div class='ec-tip'>"+L("您好！有<b>藝格板</b>的問題嗎？點我問問看 👋","Questions about <b>EGRRA Panel</b>? Tap to ask 👋")+"</div>");
    var panel=el("<div class='ec-panel' role='dialog' aria-label='線上客服'>"+
      "<div class='ec-head'><div class='ec-ava'>"+L("煌","E")+"</div><div class='ht'><b>"+L("煌盛小幫手","EGRRA Assistant")+"</b><span>"+L("線上為您服務","Here to help")+"</span></div>"+
      "<button class='ec-close' aria-label='"+L("關閉","Close")+"'>&times;</button></div>"+
      "<div class='ec-body' id='ec-body'></div>"+
      "<div class='ec-chips' id='ec-chips'></div>"+
      "<div class='ec-input'><input id='ec-in' placeholder='"+L("輸入您的問題…","Type your question…")+"' autocomplete='off' aria-label='"+L("輸入問題","Your question")+"'/>"+
      "<button id='ec-send' aria-label='"+L("送出","Send")+"'><svg viewBox='0 0 24 24'><path d='M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z'/></svg></button></div>"+
      "<div class='ec-foot'>"+L("由煌盛興業 EGRRA 提供　·　智能客服","Powered by EGRRA · AI assistant")+"</div></div>");
    root.appendChild(fab);root.appendChild(tip);root.appendChild(panel);

    var body=panel.querySelector("#ec-body"),chips=panel.querySelector("#ec-chips"),
        input=panel.querySelector("#ec-in");
    var opened=false,greeted=false;

    function scrollDown(){body.scrollTop=body.scrollHeight;}
    function addBot(html){
      var r=el("<div class='ec-row bot'><div class='ec-bava'>煌</div><div class='ec-bub'></div></div>");
      r.querySelector(".ec-bub").innerHTML=html;body.appendChild(r);scrollDown();
    }
    function addUser(text){
      var r=el("<div class='ec-row user'><div class='ec-bub'></div></div>");
      r.querySelector(".ec-bub").textContent=text;body.appendChild(r);scrollDown();
    }
    function typing(on){
      var ex=body.querySelector(".ec-typing-row");
      if(on){if(ex)return;var r=el("<div class='ec-row bot ec-typing-row'><div class='ec-bava'>"+L("煌","E")+"</div><div class='ec-bub' style='padding:0'><div class='ec-typing'><i></i><i></i><i></i></div></div></div>");body.appendChild(r);scrollDown();}
      else if(ex)ex.remove();
    }
    function setChips(list){
      chips.innerHTML="";
      (list||[]).forEach(function(c){
        var b=el("<button class='ec-chip'></button>");
        /* 只換顯示文字，送出去比對的仍是中文原值 —— 見 CHIP_EN 的說明 */
        var lbl=(ecLang()==="en"&&CHIP_EN[c])?CHIP_EN[c]:c;
        b.textContent=lbl;
        b.addEventListener("click",function(){handle(CHIP2Q[c]||c,lbl);});
        chips.appendChild(b);
      });
    }
    function handle(query,display){
      addUser(display||query);setChips([]);typing(true);
      var res=answer(query);
      var useAI=AI_ENDPOINT&&(AI_MODE==="always"||res.weak);
      if(useAI){
        askAI(query).then(function(reply){
          typing(false);addBot(reply||res.text);setChips(MENU);
        });
      }else{
        setTimeout(function(){
          typing(false);addBot(res.text);
          setChips(res.chips&&res.chips.length?res.chips:MENU);
        },420+Math.random()*320);
      }
    }
    function askAI(q){
      return fetch(AI_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},
        /* 把當前語言帶給後端 —— 不帶的話 AI 一律用繁體中文回答，
           訪客把網站切成英文卻收到中文，比沒有英文版更奇怪。 */
        body:JSON.stringify({q:q,lang:ecLang(),context:{
          products:PRODUCTS.map(function(p){return {name:p.name,series:p.series,sizes:p.sizes,finish:p.finish};}),
          info:INFO
        }})})
        .then(function(r){return r.json();})
        .then(function(d){return d&&d.reply?d.reply:null;})
        .catch(function(){return null;});
    }
    function open(){
      opened=true;panel.classList.add("open");fab.classList.add("hide");tip.classList.remove("show");
      if(!greeted){greeted=true;typing(true);setTimeout(function(){typing(false);
        addBot(L("您好！我是煌盛興業的線上小幫手 🙂 可以為您介紹藝格板的<b>產品、計價、保養、防火、客製</b>等資訊。請問想了解什麼呢？","Hello! I'm the EGRRA assistant 🙂 I can help with our panels — <b>products, pricing, care, fire rating, customisation</b>. What would you like to know?"));
        setChips(MENU);setTimeout(function(){input.focus();},50);
      },500);}
      else setTimeout(function(){input.focus();},50);
    }
    function close(){opened=false;panel.classList.remove("open");fab.classList.remove("hide");}

    fab.addEventListener("click",open);
    panel.querySelector(".ec-close").addEventListener("click",close);
    tip.addEventListener("click",open);
    panel.querySelector("#ec-send").addEventListener("click",function(){var v=input.value.trim();if(v){handle(v);input.value="";}});
    input.addEventListener("keydown",function(e){if(e.key==="Enter"){var v=input.value.trim();if(v){handle(v);input.value="";}}});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"&&opened)close();});

    /* 幾秒後彈提示氣泡吸引點擊（只彈一次）*/
    setTimeout(function(){if(!opened)tip.classList.add("show");},3500);
    setTimeout(function(){tip.classList.remove("show");},11000);

    /* 供截圖/測試用：網址加 ?chat=1 會自動打開 */
    if(/[?&]chat=1/.test(location.search))setTimeout(open,300);
  }

  window.EGRRA_CHATBOT_ANSWER=answer; /* 供測試/除錯 */
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();

  /* -------------------------------------------------------------------------
     ★ 升級成「真 AI 對答」：把上面的 answer(raw) 改成呼叫你的後端，例如：
        async function answer(raw){
          const r = await fetch("https://<你的雲端函式>/chat",{method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({q:raw, context:{products:PRODUCTS, info:INFO}})});
          const d = await r.json();  return {text:d.reply, chips:MENU};
        }
     後端（Vercel / Google Cloud Function）再用 API 金鑰呼叫 Claude 或 Gemini，
     金鑰放後端、不可放前端。handle() 已相容 Promise（可自行加 await）。
     ------------------------------------------------------------------------- */
})();
