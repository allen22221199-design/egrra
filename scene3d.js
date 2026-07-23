/* =========================================================================
   煌盛興業 EGRRA — 3D 場景模擬（Three.js / PBR 物理渲染）
   ・依健身房實照建模：12m × 5.2m × 2.9m，左牆拱門、右牆雙窗、端牆玻璃門、
     黑燈帶天花、崁燈、方塊地毯
   ・UV 依真實板材尺寸計算：repeat = 牆面實際尺寸 ÷ 板材尺寸（板縫=真實分割）
   ・物理因素：窗光(方向光+面光源)、崁燈洗牆、軟陰影、ACES tone mapping、
     環境反射(PMREM RoomEnvironment)、基材=PBR 粗糙度/金屬度/清漆
   ========================================================================= */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

const T = window.EGRRA_TEX;
const holder = document.getElementById("scene3d");
if (T && holder) init();

function init() {
  /* ---------- 房間實際尺寸（公尺） ---------- */
  const L = 12, W = 5.2, H = 2.9;          // 長(z)、寬(x)、高(y)；左牆 x=0

  /* ---------- 狀態 ---------- */
  /* 紋理清單＝舊站真實板材照（site-data products 內有 img 的全部花色） */
  const DATA = window.EGRRA_DEFAULT_DATA || {};
  const PRODS = (DATA.products || []).filter(p => p.img);
  const SUBS = [["al","鋁"],["glass","玻璃"],["metal","金屬"],["wood","木質"]];
  const PANELS = [["4×8尺",1.212,2.424],["4×10尺",1.212,3.03],["5×10尺",1.515,3.03]];
  const st = { prod: PRODS[0] || { id:"gen", name:"卡拉拉", stone:"carrara", img:"" }, sub:"al", subZh:"鋁", panel:2 };
  const w3 = { L:true, R:true, E:true };

  /* ---------- 渲染器 ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  holder.appendChild(renderer.domElement);
  RectAreaLightUniformsLib.init();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0c0b);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  /* ---------- 相機（比照實照視角） ---------- */
  const cam = new THREE.PerspectiveCamera(52, 16/7, 0.1, 60);
  cam.position.set(2.4, 1.5, L - 1.6);   /* 鏡頭拉近(適中) */
  cam.lookAt(2.7, 1.3, 0);

  /* ---------- 材質 ---------- */
  const SUBP = { /* 基材 → PBR 參數 */
    al:    { roughness:.42, metalness:.12, clearcoat:.15, ccr:.5 },
    glass: { roughness:.10, metalness:.05, clearcoat:1.0, ccr:.06 },
    metal: { roughness:.30, metalness:.85, clearcoat:0,   ccr:.5 },
    wood:  { roughness:.62, metalness:0,   clearcoat:.06, ccr:.6 }
  };
  function stoneMat() {
    return new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:.42, metalness:.1 });
  }
  const paintMat = new THREE.MeshPhysicalMaterial({ color:0xd8d4cd, roughness:.85, metalness:0 });
  const matL = stoneMat(), matR = stoneMat(), matE = stoneMat();

  /* 紋理：真實板材照（舊站高解析原圖）→ canvas 滿版裁切 + 板縫烙進磚邊
     （照片為同源本站託管 → canvas 不會 taint；無照片時退回程式生成紋理） */
  const texCache = {};
  function makeTexture(prod, cb) {
    const key = prod.id;
    if (texCache[key]) return cb(texCache[key]);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = 512; c.height = 1024;
      const g = c.getContext("2d");
      /* cover 裁切：照片等比放大鋪滿 512×1024（單片板材比例） */
      const s = Math.max(512 / img.width, 1024 / img.height);
      const dw = img.width * s, dh = img.height * s;
      g.drawImage(img, (512 - dw) / 2, (1024 - dh) / 2, dw, dh);
      /* 板縫：右緣+下緣 倒角縫(深-亮-深)＝拼板時的真實分割 */
      g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(508, 0, 4, 1024); g.fillRect(0, 1020, 512, 4);
      g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(505, 0, 2, 1024); g.fillRect(0, 1017, 512, 2);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texCache[key] = t; cb(t);
    };
    img.onerror = () => { /* 照片載入失敗 → 程式生成紋理備援 */
      const fallback = new Image();
      fallback.onload = () => {
        const c = document.createElement("canvas"); c.width = 512; c.height = 1024;
        c.getContext("2d").drawImage(fallback, 0, 0, 512, 1024);
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
        texCache[key] = t; cb(t);
      };
      fallback.src = T.tex(prod.stone).slice(5, -2);
    };
    img.src = prod.img || T.tex(prod.stone).slice(5, -2);
  }

  /* UV：每面牆依「實際尺寸 ÷ 板材尺寸」計算重複（ShapeGeometry 的 UV=公尺座標） */
  function applyStone() {
    const cur = st.prod;
    makeTexture(cur, base => {
      if (cur.id !== st.prod.id) return; /* 使用者已換色，略過過期回呼 */
      const p = PANELS[st.panel];                       // [名, 寬m, 高m]
      const sp = SUBP[st.sub];
      [[matL, w3.L], [matR, w3.R], [matE, w3.E]].forEach(([m, on]) => {
        const t = base.clone(); t.needsUpdate = true;
        t.repeat.set(1 / p[1], 1 / p[2]);               // ShapeGeometry UV 單位=公尺
        m.map = on ? t : null;
        m.color.set(on ? 0xffffff : 0xd8d4cd);
        m.roughness = on ? sp.roughness : .85;
        m.metalness = on ? sp.metalness : 0;
        m.clearcoat = on ? sp.clearcoat : 0;
        m.clearcoatRoughness = sp.ccr;
        m.needsUpdate = true;
      });
      cap();
    });
  }

  /* ---------- 幾何：牆（含開口）用 Shape+holes，UV=公尺 ---------- */
  function wallShape(w, h, holes) {
    const s = new THREE.Shape();
    s.moveTo(0,0); s.lineTo(w,0); s.lineTo(w,h); s.lineTo(0,h); s.closePath();
    (holes||[]).forEach(hl => s.holes.push(hl));
    return new THREE.ShapeGeometry(s, 24);
  }
  function archHole(zc, w, hSide, hTop) { /* 圓拱：直邊+半橢圓頂 */
    const p = new THREE.Path();
    p.moveTo(zc - w/2, 0); p.lineTo(zc - w/2, hSide);
    p.absellipse(zc, hSide, w/2, hTop - hSide, Math.PI, 0, true);
    p.lineTo(zc + w/2, 0); p.closePath();
    return p;
  }
  function rectHole(x0, y0, w, h) {
    const p = new THREE.Path();
    p.moveTo(x0,y0); p.lineTo(x0+w,y0); p.lineTo(x0+w,y0+h); p.lineTo(x0,y0+h); p.closePath();
    return p;
  }

  /* 左牆 x=0（面向 +x），拱門在 z≈6.4，寬1.1m 高2.15m */
  const ARCH = { z:6.4, w:1.1, hs:1.75, ht:2.15 };
  const wallL = new THREE.Mesh(wallShape(L, H, [archHole(ARCH.z, ARCH.w, ARCH.hs, ARCH.ht)]), matL);
  wallL.rotation.y = Math.PI/2; wallL.position.set(0, 0, L);  /* shape x→ -z */
  wallL.receiveShadow = true; scene.add(wallL);

  /* 右牆 x=W（面向 -x），兩窗 */
  const WIN1 = { z0:1.2, w:2.6, y0:.9, h:1.35 }, WIN2 = { z0:5.6, w:1.9, y0:.9, h:1.35 };
  const wallR = new THREE.Mesh(
    wallShape(L, H, [rectHole(WIN1.z0, WIN1.y0, WIN1.w, WIN1.h), rectHole(WIN2.z0, WIN2.y0, WIN2.w, WIN2.h)]), matR);
  wallR.rotation.y = -Math.PI/2; wallR.position.set(W, 0, 0);
  wallR.receiveShadow = true; scene.add(wallR);

  /* 端牆 z=0（面向 +z），玻璃門洞 */
  const DOOR = { x0:2.05, w:1.3, h:2.15 };
  const wallE = new THREE.Mesh(wallShape(W, H, [rectHole(DOOR.x0, 0, DOOR.w, DOOR.h)]), matE);
  wallE.position.set(0, 0, 0);
  wallE.receiveShadow = true; scene.add(wallE);

  /* 相機後方牆（反光用，看不到） */
  const wallB = new THREE.Mesh(new THREE.PlaneGeometry(W, H), paintMat);
  wallB.rotation.y = Math.PI; wallB.position.set(W/2, H/2, L); scene.add(wallB);

  /* ---------- 天花板：白 + 黑燈帶 ---------- */
  const ceilMat = new THREE.MeshStandardMaterial({ color:0xeceae6, roughness:.9 });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, L), ceilMat);
  ceil.rotation.x = Math.PI/2; ceil.position.set(W/2, H, L/2); ceil.receiveShadow = true; scene.add(ceil);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(.42, .06, L),
    new THREE.MeshStandardMaterial({ color:0x121110, roughness:.65 }));
  strip.position.set(1.72, H - .03, L/2); scene.add(strip);

  /* ---------- 地板：方塊地毯（UV=0.5m 磚） ---------- */
  const cc = document.createElement("canvas"); cc.width = cc.height = 256;
  const cg = cc.getContext("2d");
  cg.fillStyle = "#55534f"; cg.fillRect(0,0,256,256);
  for (let i=0;i<2600;i++){ cg.fillStyle = Math.random()>.5?"rgba(255,255,255,.05)":"rgba(0,0,0,.08)";
    cg.fillRect(Math.random()*256, Math.random()*256, 2, 1+Math.random()*3); }
  cg.fillStyle="rgba(0,0,0,.25)"; cg.fillRect(0,0,256,2); cg.fillRect(0,0,2,256);
  const carpet = new THREE.CanvasTexture(cc);
  carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping; carpet.repeat.set(W/.5, L/.5);
  carpet.colorSpace = THREE.SRGBColorSpace; carpet.anisotropy = 8;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L),
    new THREE.MeshStandardMaterial({ map:carpet, roughness:.96 }));
  floor.rotation.x = -Math.PI/2; floor.position.set(W/2, 0, L/2);
  floor.receiveShadow = true; scene.add(floor);

  /* ---------- 開口內容 ---------- */
  /* 拱門內：暗龕 + 暖光 */
  const nook = new THREE.Mesh(new THREE.BoxGeometry(1.2, ARCH.ht + .2, ARCH.w + .3),
    new THREE.MeshStandardMaterial({ color:0x241f1a, roughness:.9, side:THREE.BackSide }));
  nook.position.set(-.6, (ARCH.ht + .2)/2, ARCH.z); scene.add(nook);
  /* 註：拱門已加門扇，原本的暖光 PointLight 因不投射陰影會「穿透牆面」
     在左牆與天花板造成暖色光斑（各面牆亮度/色溫不一致的元凶），故移除。 */

  /* ---- 圓拱門：拱形門扇（深色木質 + 把手 + 門框收邊） ---- */
  function archShape(zc, w, hs, ht) {
    const s = new THREE.Shape();
    s.moveTo(zc - w/2, 0); s.lineTo(zc - w/2, hs);
    s.absellipse(zc, hs, w/2, ht - hs, Math.PI, 0, true);
    s.lineTo(zc + w/2, 0); s.closePath();
    return s;
  }
  const archGroup = new THREE.Group();
  archGroup.rotation.y = Math.PI/2; archGroup.position.set(0, 0, L);
  /* 門框收邊（略大於門洞） */
  const archFrame = new THREE.Mesh(
    new THREE.ShapeGeometry(archShape(ARCH.z, ARCH.w + .09, ARCH.hs + .04, ARCH.ht + .045), 28),
    new THREE.MeshStandardMaterial({ color:0x14110f, roughness:.5, metalness:.35 }));
  archFrame.position.set(0, 0, 0.024); archGroup.add(archFrame);
  /* 門扇（內縮 1cm，深色木質 PBR） */
  const archDoor = new THREE.Mesh(
    new THREE.ShapeGeometry(archShape(ARCH.z, ARCH.w - .02, ARCH.hs - .01, ARCH.ht - .012), 28),
    new THREE.MeshPhysicalMaterial({ color:0x4a382a, roughness:.55, metalness:.05, clearcoat:.25, clearcoatRoughness:.4 }));
  archDoor.position.set(0, 0, 0.03); archGroup.add(archDoor);
  /* 門把（直立長把手） */
  const archHandle = new THREE.Mesh(new THREE.CylinderGeometry(.017, .017, .42, 12),
    new THREE.MeshStandardMaterial({ color:0x9b9182, roughness:.28, metalness:.9 }));
  archHandle.position.set(ARCH.z + ARCH.w/2 - .16, 1.0, .06); archGroup.add(archHandle);
  archGroup.traverse(o => { if (o.isMesh) o.castShadow = false; });
  scene.add(archGroup);

  /* 窗：天空面 + 面光源；玻璃門：深色玻璃 */
  function addWindow(win) {
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(win.w, win.h),
      new THREE.MeshBasicMaterial({ color:0xe9f0f5 }));
    sky.rotation.y = -Math.PI/2; sky.position.set(W + .12, win.y0 + win.h/2, win.z0 + win.w/2);
    scene.add(sky);
    const ra = new THREE.RectAreaLight(0xeef1f2, 5.5, win.w, win.h); /* 窗光近中性、降強度（減少右側偏色） */
    ra.position.set(W - .02, win.y0 + win.h/2, win.z0 + win.w/2);
    ra.lookAt(0, win.y0 + win.h/2, win.z0 + win.w/2);
    scene.add(ra);
    /* 窗框 */
    const fm = new THREE.MeshStandardMaterial({ color:0x14110f, roughness:.5, metalness:.4 });
    const fw = .05;
    [[win.w + .1, fw, win.y0], [win.w + .1, fw, win.y0 + win.h]].forEach(([w_, t_, y_]) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(.06, t_ + .06, w_), fm);
      bar.position.set(W - .01, y_, win.z0 + win.w/2); scene.add(bar);
    });
    const mid = new THREE.Mesh(new THREE.BoxGeometry(.06, win.h, .05), fm);
    mid.position.set(W - .01, win.y0 + win.h/2, win.z0 + win.w/2); scene.add(mid);
  }
  addWindow(WIN1); addWindow(WIN2);

  /* ---- 端牆：玻璃門（門框 + 玻璃 + 直立把手 + 橫檔） ---- */
  const frameMat = new THREE.MeshStandardMaterial({ color:0x171513, roughness:.42, metalness:.55 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color:0x1b2226, roughness:.06, metalness:.25, clearcoat:1, clearcoatRoughness:.04,
    transparent:true, opacity:.92
  });
  const gGroup = new THREE.Group();
  gGroup.position.set(DOOR.x0 + DOOR.w/2, 0, -.05);
  /* 玻璃（雙開，中間留分割） */
  [-1, 1].forEach(side => {
    const leafW = DOOR.w/2 - .012;
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(leafW, DOOR.h - .06), glassMat);
    leaf.position.set(side * (DOOR.w/4), (DOOR.h - .06)/2, 0);
    gGroup.add(leaf);
    /* 直立把手 */
    const hd = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .55, 12),
      new THREE.MeshStandardMaterial({ color:0x8d8578, roughness:.3, metalness:.85 }));
    hd.position.set(side * .075, 1.05, .045);
    gGroup.add(hd);
  });
  /* 門框：左右柱 + 上檻 + 中挺 */
  const jamb = (x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.05, DOOR.h, .09), frameMat);
    m.position.set(x, DOOR.h/2, 0); gGroup.add(m); };
  jamb(-DOOR.w/2); jamb(DOOR.w/2); jamb(0);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(DOOR.w + .1, .06, .09), frameMat);
  lintel.position.set(0, DOOR.h, 0); gGroup.add(lintel);
  scene.add(gGroup);
  const doorGlow = new THREE.RectAreaLight(0xbfd0da, 1.6, DOOR.w, DOOR.h);
  doorGlow.position.set(DOOR.x0 + DOOR.w/2, DOOR.h/2, .02);
  doorGlow.lookAt(DOOR.x0 + DOOR.w/2, DOOR.h/2, L); scene.add(doorGlow);

  /* ---------- 燈光 ---------- */
  scene.add(new THREE.HemisphereLight(0xd9dad8, 0x3d3a36, .5)); /* 中性環境光（統一色調） */
  const sun = new THREE.DirectionalLight(0xfff8ee, 1.7);   /* 窗外日光斜射（近中性） */
  sun.position.set(W + 6, 4.6, 5.4); sun.target.position.set(1.2, 0, 6.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
  sun.shadow.bias = -0.0004;
  scene.add(sun); scene.add(sun.target);

  /* 崁燈：沿左牆洗牆（光斑=寫實關鍵），交錯陰影 */
  const dlZ = [1.6, 3.4, 5.2, 7.0, 8.8, 10.6];
  const DLCOL = 0xfff0dc; /* 統一崁燈色溫（微暖，兩側相同 → 無色差） */
  dlZ.forEach((z, i) => {
    /* 左牆洗牆（參數與右牆完全一致 → 兩側亮度/色溫統一） */
    const sp = new THREE.SpotLight(DLCOL, 12, 7.5, .62, .5, 2);
    sp.position.set(.55, H - .04, z); sp.target.position.set(.12, 0, z);
    sp.castShadow = (i % 2 === 0);
    sp.shadow.mapSize.set(512, 512); sp.shadow.bias = -0.0005;
    scene.add(sp); scene.add(sp.target);
    /* 右牆洗牆（補齊 → 左右亮度/色調一致） */
    const sp2 = new THREE.SpotLight(DLCOL, 12, 7.5, .62, .5, 2);
    sp2.position.set(W - .55, H - .04, z); sp2.target.position.set(W - .12, 0, z);
    scene.add(sp2); scene.add(sp2.target);
    /* 燈具 */
    const fixture = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .02, 16),
      new THREE.MeshStandardMaterial({ color:0x0d0c0a, roughness:.4 }));
    fixture.position.set(.55, H - .012, z); scene.add(fixture);
    const fx2 = fixture.clone(); fx2.position.x = 3.4; scene.add(fx2);
    const fx3 = fixture.clone(); fx3.position.x = W - .55; scene.add(fx3);
  });
  /* 端牆補光（與側牆同色溫，避免端牆偏暗造成色差感） */
  const endWash = new THREE.RectAreaLight(DLCOL, 1.8, W - .6, 1.2);
  endWash.position.set(W/2, H - .35, 1.2); endWash.lookAt(W/2, 0, 0);
  scene.add(endWash);

  /* ---------- 控制列 ---------- */
  const subsEl = document.getElementById("mat-subs"),
        pickEl = document.getElementById("mat-picker"),
        wallsEl = document.getElementById("mat-walls"),
        panelEl = document.getElementById("mat-panel"),
        capEl = document.getElementById("mat-cap");
  function chip(host, label, on, fn, bgTex) {
    const b = document.createElement("button");
    if (bgTex) { b.style.backgroundImage = bgTex; b.title = label; } else b.textContent = label;
    if (on) b.className = "on";
    b.addEventListener("click", () => fn(b)); host.appendChild(b); return b;
  }
  function solo(host, b) { [].forEach.call(host.children, c => c.classList.remove("on")); b.classList.add("on"); }
  [["L","左牆"],["R","右牆"],["E","端牆"]].forEach(w =>
    chip(wallsEl, w[1], w3[w[0]], b => { w3[w[0]] = !w3[w[0]]; b.classList.toggle("on", w3[w[0]]); applyStone(); }));
  SUBS.forEach(s =>
    chip(subsEl, s[1], s[0]===st.sub, b => { st.sub = s[0]; st.subZh = s[1]; solo(subsEl, b); applyStone(); }));
  PANELS.forEach((p, i) =>
    chip(panelEl, p[0], i===st.panel, b => { st.panel = i; solo(panelEl, b); applyStone(); }));
  PRODS.forEach(p =>
    chip(pickEl, p.name, p.id===st.prod.id, b => { st.prod = p; solo(pickEl, b); applyStone(); },
      'url("' + p.img + '")'));
  function cap() {
    capEl.innerHTML = "PrinTex™　<b>" + st.prod.name + "</b>（" + (st.prod.series || "") + "）　·　" +
      st.subZh + "基材　·　板材 " + PANELS[st.panel][0] + "　·　3D 物理渲染";
  }

  /* ---------- 尺寸/渲染循環 ---------- */
  function resize() {
    const r = holder.getBoundingClientRect();
    if (!r.width) return;
    renderer.setSize(r.width, r.height, false);
    renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%";
    cam.aspect = r.width / r.height; cam.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();
  let needsRender = 60; /* 靜態場景：互動後渲染數幀即停，省電 */
  const tick = () => { requestAnimationFrame(tick); if (needsRender > 0) { needsRender--; renderer.render(scene, cam); } };
  const _apply = applyStone;
  applyStone = function(){ _apply(); needsRender = 60; };
  applyStone();
  tick();
}
