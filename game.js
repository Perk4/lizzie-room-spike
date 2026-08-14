import * as THREE from "three";

const phone = document.getElementById("phone");
const canvas = document.getElementById("view");
const statusEl = document.getElementById("status");
const sessionBtn = document.getElementById("btn-session");
const overlay = document.getElementById("overlay");
const needsBody = document.getElementById("needs-body");
const sessionLog = document.getElementById("session-log");

const sheets = {
  approval: document.getElementById("sheet-approval"),
  artifact: document.getElementById("sheet-artifact"),
  needs: document.getElementById("sheet-needs"),
  goal: document.getElementById("sheet-goal")
};

const ticks = [
  "Opening a session.",
  "Looking up local ceramics studios.",
  "Comparing class times and prices.",
  "Reading beginner reviews.",
  "Drafting a shortlist for you."
];

const state = {
  phase: "idle",
  waiting: [],
  artifact: false,
  log: "",
  working: false
};

function makeToonRamp() {
  const data = new Uint8Array([
    118, 88, 62, 255,
    168, 130, 96, 255,
    220, 188, 148, 255,
    255, 240, 214, 255
  ]);
  const tex = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

const ramp = makeToonRamp();

function toon(color, extra) {
  const mat = new THREE.MeshToonMaterial({ color: color, gradientMap: ramp });
  if (extra) Object.assign(mat, extra);
  return mat;
}

function addMesh(parent, geo, color, x, y, z, opts) {
  opts = opts || {};
  const mesh = new THREE.Mesh(geo, toon(color, opts.mat));
  mesh.position.set(x, y, z);
  if (opts.sx) mesh.scale.set(opts.sx, opts.sy || opts.sx, opts.sz || opts.sx);
  if (opts.rx) mesh.rotation.x = opts.rx;
  if (opts.ry) mesh.rotation.y = opts.ry;
  if (opts.rz) mesh.rotation.z = opts.rz;
  mesh.castShadow = opts.cast !== false;
  mesh.receiveShadow = opts.recv !== false;
  if (opts.hotspot) mesh.userData.hotspot = opts.hotspot;
  parent.add(mesh);
  return mesh;
}

function box(parent, w, h, d, color, x, y, z, opts) {
  return addMesh(parent, new THREE.BoxGeometry(w, h, d), color, x, y, z, opts);
}

function sph(parent, r, color, x, y, z, opts) {
  return addMesh(parent, new THREE.SphereGeometry(r, 18, 14), color, x, y, z, opts);
}

function cyl(parent, rt, rb, h, color, x, y, z, opts) {
  return addMesh(parent, new THREE.CylinderGeometry(rt, rb, h, 18), color, x, y, z, opts);
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xE8D4B0);
scene.fog = new THREE.Fog(0xE8D4B0, 16, 28);

const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.1, 60);
camera.position.set(4.5, 5.8, 6.8);
camera.lookAt(0, 0.8, -0.5);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const hemi = new THREE.HemisphereLight(0xC8D8E8, 0xE8D2A8, 0.72);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xFFE6B8, 1.28);
sun.position.set(0.15, 3.85, -5.4);
sun.target.position.set(0.3, 0.15, 0.9);
scene.add(sun);
scene.add(sun.target);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.radius = 5;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 18;
sun.shadow.camera.left = -7;
sun.shadow.camera.right = 7;
sun.shadow.camera.top = 7;
sun.shadow.camera.bottom = -7;

const fill = new THREE.DirectionalLight(0xFFD8B0, 0.22);
fill.position.set(5.2, 5.4, 3.4);
scene.add(fill);

const room = new THREE.Group();
scene.add(room);

const WOOD = 0xC9A06A;
const WOOD_DK = 0xB08958;
const CREAM = 0xF3E6C8;
const WALL = 0xF0E4C4;
const SAGE = 0x8FA87A;
const SAGE_LT = 0xC5D2B0;
const TERR = 0xC46A48;
const PINK = 0xD9A08C;
const DUST = 0xE2B7A4;
const SKY = 0xA9C8E2;
const LEAF = 0x6F9A62;
const PAPER = 0xF6EDD8;
const NOTE = 0xE8C85A;
const SLATE = 0x6A6460;

for (let i = 0; i < 12; i += 1) {
  const z = -3.85 + i * 0.66;
  box(room, 8.1, 0.08, 0.6, i % 2 ? WOOD : WOOD_DK, 0, 0.04, z, { cast: false });
}

box(room, 8.2, 0.12, 8.2, 0xB88850, 0, -0.02, 0, { cast: false });

const WALL_H = 4.15;
box(room, 0.16, WALL_H, 8.2, WALL, -4.08, WALL_H / 2, 0, { cast: false });
box(room, 0.16, WALL_H, 8.2, WALL, 4.08, WALL_H / 2, 0, { cast: false });

const winW = 2.25;
const winH = 2.05;
const winY = 2.2;
const leftW = (8.2 - winW) / 2;
box(room, leftW, WALL_H, 0.16, WALL, -4.1 + leftW / 2, WALL_H / 2, -4.08, { cast: false });
box(room, leftW, WALL_H, 0.16, WALL, 4.1 - leftW / 2, WALL_H / 2, -4.08, { cast: false });
const sillTop = WALL_H - (winY + winH / 2);
const sillBot = winY - winH / 2;
box(room, winW, sillBot, 0.16, WALL, 0, sillBot / 2, -4.08, { cast: false });
box(room, winW, sillTop, 0.16, WALL, 0, winY + winH / 2 + sillTop / 2, -4.08, { cast: false });

box(room, winW + 0.28, 0.12, 0.22, WOOD, 0, winY - winH / 2, -3.96);
box(room, winW + 0.28, 0.12, 0.22, WOOD, 0, winY + winH / 2, -3.96);
box(room, 0.12, winH + 0.12, 0.22, WOOD, -winW / 2, winY, -3.96);
box(room, 0.12, winH + 0.12, 0.22, WOOD, winW / 2, winY, -3.96);
box(room, 0.08, winH, 0.1, WOOD, 0, winY, -3.94);
box(room, winW, 0.08, 0.1, WOOD, 0, winY, -3.94);

const windowGroup = new THREE.Group();
windowGroup.userData.hotspot = "window";
room.add(windowGroup);
const sky = box(windowGroup, winW - 0.08, winH - 0.08, 0.04, SKY, 0, winY, -4.22, { cast: false, recv: false, hotspot: "window" });
sky.material = new THREE.MeshBasicMaterial({ color: SKY });
sph(windowGroup, 0.42, 0xEEF4F8, -0.55, winY + 0.35, -4.28, { sx: 1.4, sy: 0.55, sz: 0.4, cast: false, hotspot: "window" });
sph(windowGroup, 0.34, 0xF4F7FA, 0.5, winY + 0.15, -4.3, { sx: 1.5, sy: 0.5, sz: 0.35, cast: false, hotspot: "window" });

cyl(room, 0.045, 0.045, 3.1, WOOD, 0, winY + winH / 2 + 0.22, -3.88, { rz: Math.PI / 2, cast: false });
sph(room, 0.09, WOOD, -1.55, winY + winH / 2 + 0.22, -3.88);
sph(room, 0.09, WOOD, 1.55, winY + winH / 2 + 0.22, -3.88);
box(room, 0.72, 2.35, 0.06, CREAM, -1.18, 1.55, -3.86, { mat: { transparent: true, opacity: 0.82 } });
box(room, 0.72, 2.35, 0.06, CREAM, 1.18, 1.55, -3.86, { mat: { transparent: true, opacity: 0.82 } });

cyl(room, 1.55, 1.55, 0.05, SAGE, 0.05, 0.09, 0.35, { cast: false });
cyl(room, 1.18, 1.18, 0.05, SAGE_LT, 0.05, 0.11, 0.35, { cast: false });
cyl(room, 0.72, 0.72, 0.05, CREAM, 0.05, 0.13, 0.35, { cast: false });

const desk = new THREE.Group();
desk.position.set(0, 0, 0);
desk.userData.hotspot = "desk";
room.add(desk);
box(desk, 2.15, 0.16, 1.15, WOOD, 0, 1.18, 0, { hotspot: "desk" });
cyl(desk, 0.42, 0.48, 1.1, WOOD_DK, 0.15, 0.55, 0.05, { hotspot: "desk" });
box(desk, 0.72, 0.04, 0.5, SAGE, 0, 1.29, 0.15, { hotspot: "desk" });
const papers = box(desk, 0.42, 0.02, 0.34, PAPER, 0, 1.31, 0.15, { hotspot: "desk" });
papers.name = "papers";
cyl(desk, 0.14, 0.16, 0.22, SAGE, 0.72, 1.39, 0.08);
cyl(desk, 0.12, 0.12, 0.16, 0xC9A880, 0.72, 1.36, 0.08);
const lamp = new THREE.Group();
lamp.position.set(-0.78, 1.26, -0.15);
desk.add(lamp);
cyl(lamp, 0.12, 0.14, 0.08, SAGE, 0, 0.04, 0);
cyl(lamp, 0.03, 0.03, 0.28, SAGE, 0, 0.22, 0);
cyl(lamp, 0.16, 0.08, 0.18, CREAM, 0, 0.42, 0);
box(desk, 0.08, 0.12, 0.08, TERR, 0.78, 1.34, -0.32);
box(desk, 0.08, 0.12, 0.08, SAGE, 0.66, 1.34, -0.32);

const glow = box(desk, 0.46, 0.015, 0.38, 0xF7F0C4, 0.18, 1.285, -0.28, { cast: false });
glow.material = new THREE.MeshBasicMaterial({ color: 0xFFF6C2 });
glow.visible = false;
glow.name = "glow";

const chair = new THREE.Group();
chair.position.set(0, 0, 1.15);
room.add(chair);
box(chair, 0.65, 0.52, 0.58, SAGE_LT, 0, 0.72, 0.05);
box(chair, 0.58, 0.48, 0.08, SAGE_LT, 0, 1.02, -0.22);
cyl(chair, 0.04, 0.04, 0.46, WOOD, -0.26, 0.23, -0.22);
cyl(chair, 0.04, 0.04, 0.46, WOOD, 0.26, 0.23, -0.22);
cyl(chair, 0.04, 0.04, 0.46, WOOD, -0.26, 0.23, 0.22);
cyl(chair, 0.04, 0.04, 0.46, WOOD, 0.26, 0.23, 0.22);

const shelf = new THREE.Group();
shelf.position.set(2.45, 0, -1.55);
shelf.userData.hotspot = "shelf";
room.add(shelf);
box(shelf, 1.35, 1.55, 0.42, WOOD, 0, 0.9, 0, { hotspot: "shelf" });
box(shelf, 1.22, 0.08, 0.38, WOOD_DK, 0, 0.55, 0.02, { hotspot: "shelf" });
box(shelf, 1.22, 0.08, 0.38, WOOD_DK, 0, 1.05, 0.02, { hotspot: "shelf" });
box(shelf, 0.12, 0.28, 0.22, 0xC9897A, -0.42, 1.28, 0.04, { hotspot: "shelf" });
box(shelf, 0.12, 0.32, 0.22, 0x8AA3B5, -0.28, 1.3, 0.04, { hotspot: "shelf" });
box(shelf, 0.12, 0.26, 0.22, CREAM, -0.14, 1.27, 0.04, { hotspot: "shelf" });
box(shelf, 0.12, 0.3, 0.22, SAGE, 0, 1.29, 0.04, { hotspot: "shelf" });
box(shelf, 0.12, 0.24, 0.22, DUST, 0.14, 1.26, 0.04, { hotspot: "shelf" });
cyl(shelf, 0.16, 0.16, 0.14, TERR, 0.4, 1.22, 0.02);
sph(shelf, 0.16, LEAF, 0.4, 1.4, 0.02, { sy: 0.7 });
cyl(shelf, 0.18, 0.2, 0.16, 0xC4A06A, -0.32, 0.72, 0.02);
cyl(shelf, 0.16, 0.18, 0.14, SAGE, 0.28, 0.7, 0.02);

const board = new THREE.Group();
board.position.set(-3.86, 2.15, -1.55);
board.userData.hotspot = "board";
room.add(board);
box(board, 0.08, 1.15, 1.35, 0xC9A06A, 0, 0, 0, { hotspot: "board" });
box(board, 0.03, 1.02, 1.2, 0xD7C4A0, 0.05, 0, 0, { hotspot: "board" });
box(board, 0.02, 0.22, 0.18, PINK, 0.07, 0.22, -0.28, { hotspot: "board" });
box(board, 0.02, 0.18, 0.22, SAGE_LT, 0.07, -0.12, 0.18, { hotspot: "board" });
box(board, 0.02, 0.16, 0.16, NOTE, 0.07, 0.28, 0.32, { hotspot: "board" });
const boardGlow = box(board, 0.02, 1.02, 1.2, 0xFFF4C0, 0.07, 0, 0, { cast: false });
boardGlow.material = new THREE.MeshBasicMaterial({ color: 0xFFF3B0, transparent: true, opacity: 0.55 });
boardGlow.visible = false;
boardGlow.name = "boardGlow";

const basket = new THREE.Group();
basket.position.set(-0.85, 0, 1.75);
basket.userData.hotspot = "basket";
room.add(basket);
cyl(basket, 0.32, 0.26, 0.22, 0xC4A06A, 0, 0.2, 0, { hotspot: "basket" });
cyl(basket, 0.3, 0.3, 0.04, 0xD2B48A, 0, 0.32, 0, { hotspot: "basket" });
box(basket, 0.16, 0.02, 0.2, PAPER, 0.02, 0.35, 0.02, { hotspot: "basket" });
box(basket, 0.14, 0.02, 0.16, NOTE, -0.04, 0.37, -0.04, { hotspot: "basket" });

function potPlant(x, z, pot, leaf, scale, hotspot) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(scale || 1);
  if (hotspot) g.userData.hotspot = hotspot;
  room.add(g);
  cyl(g, 0.22, 0.26, 0.28, pot, 0, 0.2, 0, { hotspot: hotspot });
  cyl(g, 0.03, 0.03, 0.38, 0x8A6A48, 0, 0.5, 0, { hotspot: hotspot });
  sph(g, 0.22, leaf, 0.12, 0.72, 0.04, { sy: 0.55, hotspot: hotspot });
  sph(g, 0.2, leaf, -0.14, 0.68, -0.06, { sy: 0.5, hotspot: hotspot });
  sph(g, 0.18, 0x7EAA6C, 0.02, 0.82, -0.1, { sy: 0.48, hotspot: hotspot });
  return g;
}
potPlant(3.2, -1.2, SAGE, LEAF, 1.4, "plant");
potPlant(-3.15, -2.85, TERR, 0x7EAA6C, 0.65, "plant");

sph(room, 0.55, PINK, 2.35, 0.28, 2.15, { sy: 0.42, sx: 1.15, sz: 1.05 });
cyl(room, 0.28, 0.32, 0.55, TERR, -3.15, 0.35, 2.25);
cyl(room, 0.08, 0.08, 0.42, PAPER, -3.15, 0.78, 2.25);
cyl(room, 0.08, 0.08, 0.34, PAPER, -3.02, 0.74, 2.18);

box(room, 0.06, 0.7, 0.7, WOOD, -3.95, 2.55, 1.15);
box(room, 0.02, 0.55, 0.55, 0xE8D4C4, -3.91, 2.55, 1.15);
sph(room, 0.12, PINK, -3.88, 2.62, 1.05, { sy: 0.7 });
sph(room, 0.1, SAGE, -3.88, 2.48, 1.22, { sy: 0.6 });

box(room, 0.7, 0.7, 0.06, WOOD, 3.15, 2.55, -3.95);
box(room, 0.55, 0.55, 0.02, 0xE8D4C4, 3.15, 2.55, -3.91);
sph(room, 0.12, SAGE, 3.05, 2.62, -3.89, { sy: 0.7 });
sph(room, 0.1, TERR, 3.25, 2.48, -3.89, { sy: 0.6 });

const cairn = new THREE.Group();
cairn.position.set(0, 0.72, 1.15);
cairn.userData.hotspot = "cairn";
room.add(cairn);
const base = sph(cairn, 0.38, TERR, 0, 0.32, 0, { sy: 0.72, sx: 1.08, sz: 1.05, hotspot: "cairn" });
const mid = sph(cairn, 0.3, DUST, 0, 0.72, 0, { sy: 0.78, sx: 1.02, hotspot: "cairn" });
const top = sph(cairn, 0.24, TERR, 0, 1.02, 0, { sy: 0.62, sx: 1.08, sz: 1.05, hotspot: "cairn" });
const cap = cyl(cairn, 0.28, 0.32, 0.12, 0x7A8A6A, 0, 1.28, 0, { hotspot: "cairn" });
cap.rotation.x = 0.15;
sph(cairn, 0.045, 0x3A2E22, -0.1, 1.0, 0.2, { hotspot: "cairn" });
sph(cairn, 0.045, 0x3A2E22, 0.1, 1.0, 0.2, { hotspot: "cairn" });
const leftArm = cyl(cairn, 0.035, 0.025, 0.5, 0x8A6A48, -0.38, 0.55, -0.15, { rz: 0.6, ry: 0.3, hotspot: "cairn" });
const rightArm = cyl(cairn, 0.035, 0.025, 0.5, 0x8A6A48, 0.38, 0.55, -0.15, { rz: -0.6, ry: -0.3, hotspot: "cairn" });
const pencil = cyl(cairn, 0.02, 0.02, 0.25, 0xE8C85A, 0.22, 0.32, -0.42, { rx: 1.2, rz: -0.3 });
cairn.rotation.y = Math.PI;
cairn.userData.baseY = 0.72;
cairn.userData.sitting = true;

const objectGoals = {
  desk: { name: "Desk", goal: "Start a focus session", canAdd: true },
  board: { name: "Pin Board", goal: "Plan a local ceramics class", canAdd: true },
  basket: { name: "Basket & Books", goal: "Reference materials", canAdd: true },
  plant: { name: "Plant", goal: "Unassigned", canAdd: false },
  window: { name: "Window", goal: "Mood & natural light", canAdd: false },
  shelf: { name: "Bookshelf", goal: "Reference materials", canAdd: true },
  cairn: { name: "Cairn", goal: "Your guide", canAdd: false }
};

const addedItems = {
  desk: [],
  board: [],
  basket: [],
  shelf: []
};

function setStatus(text) {
  statusEl.textContent = text;
}

function closeSheets() {
  overlay.classList.remove("open");
  Object.keys(sheets).forEach(function (k) {
    sheets[k].classList.remove("open");
  });
}

function openSheet(name) {
  closeSheets();
  overlay.classList.add("open");
  sheets[name].classList.add("open");
}

function renderNeeds() {
  const n = state.waiting.length;
  if (n === 0) {
    needsBody.innerHTML = '<p class="empty">Nothing waiting.</p>';
  } else {
    needsBody.innerHTML = state.waiting.map(function (item) {
      return '<button class="need" data-open="approval">' + item.title + "</button>";
    }).join("");
  }
  sessionLog.textContent = state.log;
}

function setArtifactLit(on) {
  glow.visible = on;
  boardGlow.visible = on;
  papers.material.emissive = new THREE.Color(on ? 0x665522 : 0x000000);
  papers.material.emissiveIntensity = on ? 0.35 : 0;
}

function startSession() {
  if (state.phase === "working") return;
  closeSheets();
  state.phase = "working";
  state.working = true;
  state.artifact = false;
  setArtifactLit(false);
  sessionBtn.disabled = true;
  let i = 0;
  setStatus(ticks[0]);
  const started = Date.now();
  const timer = setInterval(function () {
    i += 1;
    setStatus(ticks[Math.min(i, ticks.length - 1)]);
    if (Date.now() - started >= 8000) {
      clearInterval(timer);
      finishResearch();
    }
  }, 1600);
}

function finishResearch() {
  state.phase = "waiting";
  state.working = false;
  sessionBtn.disabled = false;
  setStatus("Needs your approval.");
  state.waiting = [{ id: "ceramics-approval", title: "Ceramics class research" }];
  renderNeeds();
  openSheet("approval");
}

function hotspotOf(obj) {
  let cur = obj;
  while (cur) {
    if (cur.userData && cur.userData.hotspot) return cur.userData.hotspot;
    cur = cur.parent;
  }
  return null;
}

function showGoalSheet(name) {
  const info = objectGoals[name];
  if (!info) return;
  
  const items = addedItems[name] || [];
  let itemsHtml = "";
  if (items.length > 0) {
    itemsHtml = '<div class="items-list">' + items.map(function(i) {
      return '<span class="item-chip">' + i + '</span>';
    }).join("") + '</div>';
  }
  
  let addBtn = "";
  if (info.canAdd) {
    addBtn = '<button class="cta add-item-btn" data-target="' + name + '">Add item</button>';
  }
  
  document.getElementById("goal-sheet-content").innerHTML = 
    '<div class="sheet-grabber"></div>' +
    '<p class="goal-label">Goal</p>' +
    '<h2>' + info.name + '</h2>' +
    '<p>' + info.goal + '</p>' +
    itemsHtml +
    addBtn +
    '<button class="ghost cta" id="btn-goal-close">Close</button>';
  
  document.getElementById("btn-goal-close").addEventListener("click", closeSheets);
  
  const addItemBtn = document.querySelector(".add-item-btn");
  if (addItemBtn) {
    addItemBtn.addEventListener("click", function() {
      const target = this.getAttribute("data-target");
      const itemName = "Note " + (addedItems[target].length + 1);
      addedItems[target].push(itemName);
      showGoalSheet(target);
    });
  }
  
  openSheet("goal");
}

function onHotspot(name) {
  if (name === "desk") {
    startSession();
    return;
  }
  if (name === "board") {
    if (state.artifact) {
      openSheet("artifact");
    } else {
      showGoalSheet("board");
    }
    return;
  }
  if (name === "basket" || name === "plant" || name === "window" || name === "shelf") {
    showGoalSheet(name);
    return;
  }
  if (name === "cairn") {
    setStatus(state.phase === "waiting" ? "Needs your approval." : "Hi. Tap the desk to start.");
  }
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function pointerFromEvent(ev) {
  const rect = canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) / rect.width;
  const y = (ev.clientY - rect.top) / rect.height;
  pointer.set(x * 2 - 1, -(y * 2 - 1));
}

function onPointer(ev) {
  if (overlay.classList.contains("open")) return;
  pointerFromEvent(ev);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(room.children, true);
  if (!hits.length) return;
  const name = hotspotOf(hits[0].object);
  if (name) onHotspot(name);
}

canvas.addEventListener("pointerdown", onPointer);

document.getElementById("btn-session").addEventListener("click", startSession);
document.getElementById("btn-needs").addEventListener("click", function () {
  renderNeeds();
  openSheet("needs");
});
document.getElementById("btn-approve").addEventListener("click", function () {
  state.waiting = [];
  state.artifact = true;
  state.phase = "idle";
  state.log = "Session approved. Artifact is on the desk and board.";
  setArtifactLit(true);
  setStatus("Shortlist is on the desk.");
  renderNeeds();
  openSheet("artifact");
});
document.getElementById("btn-reject").addEventListener("click", function () {
  state.waiting = [];
  state.artifact = false;
  state.phase = "idle";
  state.log = "Session rejected. No artifact.";
  setArtifactLit(false);
  setStatus("Ready when you are.");
  renderNeeds();
  closeSheets();
});
document.getElementById("btn-artifact-close").addEventListener("click", closeSheets);
document.getElementById("btn-needs-close").addEventListener("click", closeSheets);
overlay.addEventListener("click", closeSheets);
needsBody.addEventListener("click", function (event) {
  const btn = event.target.closest("[data-open]");
  if (!btn) return;
  openSheet(btn.getAttribute("data-open"));
});

function resize() {
  const w = phone.clientWidth || 390;
  const h = phone.clientHeight || 844;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const bob = state.working ? Math.sin(t * 6.2) * 0.045 : Math.sin(t * 1.6) * 0.012;
  const pulse = state.working ? 1 + Math.sin(t * 6.2) * 0.035 : 1;
  cairn.position.y = cairn.userData.baseY + bob;
  cairn.scale.set(pulse, pulse, pulse);
  mid.rotation.y = Math.sin(t * 0.7) * 0.04;
  renderer.render(scene, camera);
}

renderNeeds();
animate();
