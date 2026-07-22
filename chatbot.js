/* =========================================================================
   煌盛興業 EGRRA — 右下角智能客服小幫手（規則型）
   ・自帶樣式與 DOM，放進任何頁面：<script src="chatbot.js"></script>
   ・自動讀取 site-data.js / 後台 localStorage 的內容，回答保持同步
   ・要升級成真 AI 對答，把 answer() 換成呼叫你的後端即可（見底部說明）
   ========================================================================= */
(function(){
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
      FBURL=INFO.fb||"https://www.facebook.com/Egrra.Lu", PHONERAW=INFO.phoneRaw||"0222221199";

  function seriesNames(sname){
    return PRODUCTS.filter(function(p){return p.series===sname;}).map(function(p){return p.name;});
  }
  function sample(arr,n){return arr.slice(0,n).join("、");}

  /* ---------- 知識庫 / 意圖 ---------- */
  var MENU=["產品花色","怎麼計價","如何保養","防火安全","客製化","實績案例","聯絡我們"];

  var INTENTS=[
    { id:"greet", keys:["你好","妳好","您好","哈囉","哈嘍","嗨","hi","hello","在嗎","有人在","你是誰","誰"],
      reply:function(){return {text:"您好！我是煌盛興業的線上小幫手 🙂 可以為您介紹藝格板的產品、計價、保養、防火與客製等資訊。請問想了解什麼呢？",chips:MENU};} },

    { id:"products", keys:["產品","花色","系列","顏色","款式","色卡","有哪些","有什麼","商品","種類","大理石","石材","選擇"],
      reply:function(){
        var stone=seriesNames("石紋系列");
        var t="我們的藝格板主要分三大系列：<b>石紋系列</b>（仿大理石、板岩）、<b>繡蝕系列</b>（金屬繡蝕質感）、<b>木紋系列</b>（溫潤木質）。";
        if(stone.length)t+="<br><br>石紋系列目前有 "+stone.length+" 款花色，例如："+sample(stone,6)+" …";
        t+="<br><br>另外也有<b>消防箱</b>與<b>防火門</b>的美化應用。想看哪個系列，或直接跟我說花色名稱？";
        return {text:t,chips:["石紋系列","繡蝕系列","木紋系列","消防箱／防火門","怎麼計價"]};
      } },

    { id:"series-stone", keys:["石紋"],
      reply:function(){var n=seriesNames("石紋系列");
        return {text:"<b>石紋系列</b>重現天然大理石與板岩的紋理，"+(n.length?"包含 "+n.length+" 款：<br>"+n.join("、")+"。":"款式眾多。")+"<br><br>想知道某一款的尺寸或表面處理，直接跟我說名稱即可！",chips:["尺寸規格","怎麼計價","聯絡我們"]};} },
    { id:"series-rust", keys:["繡蝕","鏽蝕","鏽","金屬感","工業風","工業"],
      reply:function(){var n=seriesNames("繡蝕系列");
        return {text:"<b>繡蝕系列</b>呈現金屬繡蝕、歲月斑駁的工業美學，冷冽而深邃。"+(n.length?"目前花色："+n.join("、")+"。":"歡迎來電洽詢完整花色。")+"",chips:["其他系列","聯絡我們"]};} },
    { id:"series-wood", keys:["木紋","木質","木頭","原木"],
      reply:function(){var n=seriesNames("木紋系列");
        return {text:"<b>木紋系列</b>是溫潤自然的木質紋理，為空間注入柔和暖意。"+(n.length?"目前花色："+n.join("、")+"。":"歡迎來電洽詢完整花色。")+"",chips:["其他系列","聯絡我們"]};} },

    { id:"price", keys:["計價","報價","價格","價錢","多少錢","單價","費用","估價","預算","貴","便宜"],
      reply:function(){return {text:"藝格板以「<b>才</b>」計價。由於數量從數十才到數萬才落差很大，建議由您或設計師提供實際需求數量，我們業務會為您精準報價。<br><br>📞 歡迎來電 <b>"+PHONE+"</b> 或私訊 FB 洽詢。",chips:["聯絡我們","有哪些花色"]};} },

    { id:"maintain", keys:["保養","清潔","清洗","擦拭","壞","損壞","刮傷","維護","清理","保固","耐用"],
      reply:function(){return {text:"藝格板是鋁烤漆製品，耐用度高，少數損壞多屬人為破壞且幾乎都可修復。<br><br>保養很簡單，<b>一般擦拭即可</b>；但請勿使用強酸強鹼、或會溶解樹脂的溶劑（例如松香水、除膠劑）。",chips:["防火安全","客製化"]};} },

    { id:"fire", keys:["防火","耐燃","耐火","防焰","燃燒","阻燃"],
      reply:function(){return {text:"藝格板通過台灣消防規範中<b>最高等級的「耐燃一級」</b>測試，防火安全性高，並可應用於<b>防火門、消防箱</b>的美化，兼顧安全與設計感。",chips:["消防箱／防火門","SGS 抗菌","聯絡我們"]};} },

    { id:"firebox", keys:["消防箱","防火門","消防設備","滅火器箱","檢修門"],
      reply:function(){return {text:"我們提供<b>消防箱</b>與<b>防火門</b>的美化 —— 用藝格板把原本冰冷的消防設備融入整體空間美學，同時保有防火機能。全台已有多件實績。",chips:["實績案例","防火安全"]};} },

    { id:"custom", keys:["客製","訂做","訂製","客制","專屬","量身","開發","自己的圖","圖案","指定"],
      reply:function(){return {text:"當然可以客製！透過 <b>PrinTex™</b> 技術，您可提供 <b>600×600mm</b> 的紋理樣本，或由我們協助開發專屬圖紋，並選擇<b>鋁、玻璃、金屬、木</b>等基材製作，量身打造專屬花色與尺寸。",chips:["核心技術","基材選擇","聯絡我們"]};} },

    { id:"substrate", keys:["基材","鋁","玻璃","金屬","底材","貼在","做在","材料"],
      reply:function(){return {text:"PrinTex™ 能把<b>同一種紋理</b>做在多種基材上：<b>鋁、玻璃、金屬、木質</b>都可以，方便對應不同場域與工法需求。",chips:["核心技術","尺寸規格"]};} },

    { id:"tech", keys:["printex","技術","原理","怎麼做","製程","專利","數位紋理","怎麼製作"],
      reply:function(){return {text:"<b>PrinTex™</b> 是我們的專利數位紋理技術，能高精度還原天然石材的色澤與脈絡，印製於金屬、玻璃、陶瓷等基材上，呈現立體浮雕層次；並具備<b>專利無縫對花</b>，大面積拼接紋理也能連續不中斷。",chips:["客製化","有哪些花色"]};} },

    { id:"weight", keys:["重量","多重","幾公斤","很輕","輕量","重不重"],
      reply:function(){return {text:"藝格板重量約為<b>天然石材的 1/30</b>，大幅減輕結構負擔，施工也更方便。",chips:["尺寸規格","防火安全"]};} },

    { id:"size", keys:["尺寸","大小","規格","幾尺","多大","表面處理","霧光","平光","消光","厚度"],
      reply:function(){return {text:"標準尺寸有 <b>4×4、4×8、4×10、5×10 尺</b>（約 120×240 / 120×300 / 150×300 cm），並可依現場需求客製裁切。<br><br>表面處理可選：<b>立體紋路、霧光、平光、消光</b>。",chips:["怎麼計價","客製化"]};} },

    { id:"sgs", keys:["抗菌","sgs","衛生","細菌","病菌","乾淨"],
      reply:function(){return {text:"藝格板可提供 <b>SGS 抗菌認證</b>，抑制細菌孳生、維持空間潔淨，適合注重衛生的場域（如飯店、醫療、公共空間）。",chips:["防火安全","實績案例"]};} },

    { id:"cases", keys:["案例","實績","做過","工程","案場","作品","完工","業績","經驗","口碑"],
      reply:function(){
        var eg=CASES.slice(0,4).map(function(c){return c.region+"-"+c.title;});
        return {text:"我們累積了 <b>"+CASES.length+" 件以上</b>實績，遍布全台，涵蓋全棟廊道、大廳牆面、防火門／消防箱美化、豪宅客製等。"+(eg.length?"<br><br>例如："+eg.join("、")+" …":"")+"<br><br>想了解特定地區或類型的案例，可以告訴我！",chips:["消防箱／防火門","聯絡我們"]};
      } },

    { id:"about", keys:["關於","公司","煌盛","egrra","多久","幾年","歷史","介紹","你們是","王子彩色","品牌"],
      reply:function(){return {text:"煌盛興業（EGRRA）源自「王子彩色」四十餘年的彩色印刷經驗，已累積<b>超過 46 年</b>，轉型專注於數位紋理建材，是專為建築與設計市場打造的品牌，提供從紋理開發到成品的全方位解決方案。",chips:["核心技術","有哪些花色"]};} },

    { id:"contact", keys:["聯絡","連絡","電話","怎麼找","地址","在哪","傳真","fb","facebook","臉書","line","客服","怎麼買","購買","哪裡買","門市","據點"],
      reply:function(){return {text:"歡迎與我們聯繫：<br>📞 電話：<a href='tel:"+PHONERAW+"'><b>"+PHONE+"</b></a><br>📠 傳真："+FAX+"<br>💬 Facebook：<a href='"+FBURL+"' target='_blank' rel='noopener'>@Egrra.Lu</a><br><br>也可以在網站下方的<b>洽詢表單</b>留下需求，我們會盡快回覆您！",chips:["怎麼計價","實績案例"]};} },

    { id:"thanks", keys:["謝謝","感謝","感恩","thank","3q","感激"],
      reply:function(){return {text:"不客氣，很高興為您服務 🙂 還有任何問題都可以再問我！",chips:MENU};} }
  ];

  /* 快捷詞 → 對應查詢字 */
  var CHIP2Q={"產品花色":"有哪些花色","消防箱／防火門":"消防箱 防火門","其他系列":"有哪些花色","尺寸規格":"尺寸","核心技術":"printex 技術","基材選擇":"基材","SGS 抗菌":"抗菌"};

  function answer(raw){
    var q=(raw||"").toLowerCase().replace(/\s+/g,"");
    if(!q)return {text:"請輸入您的問題，或點下方的常見選項 🙂",chips:MENU};

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
    return {weak:true,text:"不好意思，這個問題我可能需要請專人為您服務 🙏 您可以換個方式問，或直接來電 <b>"+PHONE+"</b>、私訊 FB。以下是常見問題：",chips:MENU};
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

    var fab=el("<button class='ec-fab' aria-label='開啟線上客服'><span class='ec-dot'>1</span>"+
      "<svg viewBox='0 0 24 24'><path d='M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z'/></svg></button>");
    var tip=el("<div class='ec-tip'>您好！有<b>藝格板</b>的問題嗎？點我問問看 👋</div>");
    var panel=el("<div class='ec-panel' role='dialog' aria-label='線上客服'>"+
      "<div class='ec-head'><div class='ec-ava'>煌</div><div class='ht'><b>煌盛小幫手</b><span>線上為您服務</span></div>"+
      "<button class='ec-close' aria-label='關閉'>&times;</button></div>"+
      "<div class='ec-body' id='ec-body'></div>"+
      "<div class='ec-chips' id='ec-chips'></div>"+
      "<div class='ec-input'><input id='ec-in' placeholder='輸入您的問題…' autocomplete='off' aria-label='輸入問題'/>"+
      "<button id='ec-send' aria-label='送出'><svg viewBox='0 0 24 24'><path d='M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z'/></svg></button></div>"+
      "<div class='ec-foot'>由煌盛興業 EGRRA 提供　·　智能客服</div></div>");
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
      if(on){if(ex)return;var r=el("<div class='ec-row bot ec-typing-row'><div class='ec-bava'>煌</div><div class='ec-bub' style='padding:0'><div class='ec-typing'><i></i><i></i><i></i></div></div></div>");body.appendChild(r);scrollDown();}
      else if(ex)ex.remove();
    }
    function setChips(list){
      chips.innerHTML="";
      (list||[]).forEach(function(c){
        var b=el("<button class='ec-chip'></button>");b.textContent=c;
        b.addEventListener("click",function(){handle(CHIP2Q[c]||c,c);});
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
        body:JSON.stringify({q:q,context:{
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
        addBot("您好！我是煌盛興業的線上小幫手 🙂 可以為您介紹藝格板的<b>產品、計價、保養、防火、客製</b>等資訊。請問想了解什麼呢？");
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
