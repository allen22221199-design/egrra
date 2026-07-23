/* =========================================================================
   煌盛興業 EGRRA — 共用材質產生器（石紋 SVG 示意圖）
   官網、花色庫、案例牆共用。用法：EGRRA_TEX.tex("carrara")
   ========================================================================= */
window.EGRRA_TEX = (function(){
  function stoneSVG(o){
    var w=320,h=280,f=o.freq||"0.012 0.03",oct=Math.min(o.oct||3,4),seed=o.seed||8;
    var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+
      '<defs><filter id="v"><feTurbulence type="fractalNoise" baseFrequency="'+f+'" numOctaves="'+oct+'" seed="'+seed+'"/>'+
      '<feColorMatrix type="saturate" values="0"/></filter></defs>'+
      '<rect width="100%" height="100%" fill="'+o.base+'"/>'+
      '<rect width="100%" height="100%" fill="'+o.mid+'" opacity="'+(o.midOp||.5)+'"/>'+
      '<rect width="100%" height="100%" filter="url(#v)" fill="'+o.vein+'" opacity="'+(o.veinOp||.55)+'" style="mix-blend-mode:'+(o.blend||"soft-light")+'"/></svg>';
    return "url('data:image/svg+xml,"+encodeURIComponent(svg)+"')";
  }
  var STONES={
    carrara:{base:"#f2efe9",mid:"#dedad2",vein:"#9a958c",freq:"0.008 0.04",veinOp:.5,seed:12},
    beige:{base:"#e8dcc3",mid:"#d8c8a6",vein:"#8f7a52",freq:"0.01 0.03",veinOp:.45,seed:5},
    amber:{base:"#c48a4a",mid:"#a86f34",vein:"#5f3c19",freq:"0.012 0.028",veinOp:.55,seed:9},
    gold:{base:"#cbae74",mid:"#b18f4f",vein:"#6e5225",freq:"0.01 0.03",veinOp:.5,seed:3},
    black:{base:"#1f1c19",mid:"#2b2723",vein:"#6a5f4c",freq:"0.011 0.03",veinOp:.6,blend:"screen",seed:14},
    purple:{base:"#241f27",mid:"#312838",vein:"#6b5a72",freq:"0.012 0.03",veinOp:.5,blend:"screen",seed:7},
    darkgrey:{base:"#454440",mid:"#4a4741",vein:"#8c887f",freq:"0.01 0.03",veinOp:.5,seed:20},
    grey:{base:"#8a8880",mid:"#9d9b93",vein:"#5c5a54",freq:"0.009 0.03",veinOp:.45,seed:17},
    silver:{base:"#b7b5b0",mid:"#c6c4bf",vein:"#7d7b75",freq:"0.008 0.035",veinOp:.4,seed:22},
    rust:{base:"#8a5638",mid:"#6d3f26",vein:"#c98a4a",freq:"0.02 0.02",oct:4,veinOp:.6,blend:"overlay",seed:31},
    wood:{base:"#9a6b3f",mid:"#845a30",vein:"#4d3218",freq:"0.003 0.06",oct:4,veinOp:.55,seed:41}
  };
  var TEX={};for(var k in STONES){TEX[k]=stoneSVG(STONES[k]);}
  /* 色系分組（花色庫篩選用）*/
  var TONES=[
    {key:"light", label:"淺白", stones:["carrara","silver"]},
    {key:"beige", label:"米金", stones:["beige","gold"]},
    {key:"warm",  label:"暖棕", stones:["amber","rust","wood"]},
    {key:"grey",  label:"灰階", stones:["grey","darkgrey"]},
    {key:"dark",  label:"深黑", stones:["black","purple"]}
  ];
  function toneOf(stone){for(var i=0;i<TONES.length;i++){if(TONES[i].stones.indexOf(stone)>=0)return TONES[i].key;}return "other";}
  return {
    tex:function(key){return TEX[key]||TEX.carrara;},
    STONES:STONES, TONES:TONES, toneOf:toneOf, svg:stoneSVG
  };
})();
