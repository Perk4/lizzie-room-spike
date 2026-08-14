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

function flat(color) {
  return new THREE.MeshBasicMaterial({ color: color });
}

function addMesh(parent, geo, color, x, y, z, opts) {
  opts = opts || {};
  const mat = opts.mat ? Object.assign(flat(color), opts.mat) : flat(color);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  if (opts.sx) mesh.scale.set(opts.sx, opts.sy || opts.sx, opts.sz || opts.sx);
  if (opts.rx) mesh.rotation.x = opts.rx;
  if (opts.ry) mesh.rotation.y = opts.ry;
  if (opts.rz) mesh.rotation.z = opts.rz;
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
scene.background = new THREE.Color(0xE8E0D4);

const camera = new THREE.PerspectiveCamera(14, 9 / 16, 0.1, 100);
camera.position.set(9, 10, 14);
camera.lookAt(0, 0.8, 0);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const ambientLight = new THREE.AmbientLight(0xFFF8F0, 0.7);
scene.add(ambientLight);
const keyLight = new THREE.DirectionalLight(0xFFFAF0, 0.6);
keyLight.position.set(5, 10, 8);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xF0F4FF, 0.25);
fillLight.position.set(-4, 6, 4);
scene.add(fillLight);

const room = new THREE.Group();
scene.add(room);

const WOOD = 0xBE945A;
const WOOD_DK = 0xA67D48;
const WOOD_LT = 0xD4A86A;
const CREAM = 0xF5ECD8;
const WALL = 0xF5ECD8;
const SAGE = 0x8A9E7A;
const SAGE_LT = 0xB5C4A8;
const TERR = 0xC66B4A;
const TERR_LT = 0xD88A6A;
const TERR_DK = 0xA85A3E;
const OLIVE = 0x7A8A5A;
const SKY = 0x9EC8E8;
const LEAF = 0x5A8A4A;
const LEAF_DK = 0x4A7A3A;
const PAPER = 0xFAF6EC;
const CORK = 0xC4A070;
const TWIG = 0x8A6A48;

const ROOM_W = 3.2;
const ROOM_D = 2.6;
const ROOM_H = 2.4;

const floor = new THREE.Group();
room.add(floor);
for (let i = 0; i < 5; i++) {
  const z = -ROOM_D / 2 + 0.26 + i * 0.52;
  box(floor, ROOM_W, 0.08, 0.46, i % 2 ? WOOD : WOOD_DK, 0, 0.04, z);
}

box(room, 0.08, ROOM_H, ROOM_D, WALL, -ROOM_W / 2, ROOM_H / 2, 0);
box(room, ROOM_W + 0.08, ROOM_H, 0.08, WALL, 0, ROOM_H / 2, -ROOM_D / 2);
box(room, 0.08, ROOM_H, ROOM_D, WALL, ROOM_W / 2, ROOM_H / 2, 0);

const winW = 0.9;
const winH = 0.8;
const winY = 1.5;
const windowGroup = new THREE.Group();
windowGroup.position.set(0.5, 0, -ROOM_D / 2 + 0.05);
windowGroup.userData.hotspot = "window";
room.add(windowGroup);
box(windowGroup, winW + 0.14, 0.07, 0.1, WOOD, 0, winY - winH / 2 - 0.035, 0, { hotspot: "window" });
box(windowGroup, winW + 0.14, 0.07, 0.1, WOOD, 0, winY + winH / 2 + 0.035, 0, { hotspot: "window" });
box(windowGroup, 0.07, winH + 0.14, 0.1, WOOD, -winW / 2 - 0.035, winY, 0, { hotspot: "window" });
box(windowGroup, 0.07, winH + 0.14, 0.1, WOOD, winW / 2 + 0.035, winY, 0, { hotspot: "window" });
box(windowGroup, 0.04, winH, 0.06, WOOD, 0, winY, 0.02, { hotspot: "window" });
box(windowGroup, winW, 0.04, 0.06, WOOD, 0, winY, 0.02, { hotspot: "window" });
const sky = box(windowGroup, winW - 0.02, winH - 0.02, 0.02, SKY, 0, winY, -0.03, { hotspot: "window" });
sph(windowGroup, 0.14, 0xF0F4F8, -0.15, winY + 0.12, -0.04, { sx: 1.2, sy: 0.5, sz: 0.3, hotspot: "window" });
sph(windowGroup, 0.11, 0xF4F8FC, 0.16, winY + 0.04, -0.04, { sx: 1.3, sy: 0.45, sz: 0.3, hotspot: "window" });

const desk = new THREE.Group();
desk.position.set(0, 0, -0.2);
desk.userData.hotspot = "desk";
room.add(desk);
box(desk, 1.2, 0.08, 0.65, WOOD, 0, 0.7, 0, { hotspot: "desk" });
box(desk, 0.08, 0.65, 0.55, WOOD_DK, -0.5, 0.35, 0, { hotspot: "desk" });
box(desk, 0.08, 0.65, 0.55, WOOD_DK, 0.5, 0.35, 0, { hotspot: "desk" });
box(desk, 0.36, 0.14, 0.42, WOOD_LT, 0.32, 0.56, 0.06, { hotspot: "desk" });
box(desk, 0.3, 0.04, 0.05, 0x8A7A5A, 0.32, 0.46, 0.24, { hotspot: "desk" });

box(desk, 0.48, 0.012, 0.34, SAGE, -0.08, 0.75, 0.04, { hotspot: "desk" });
const notebook = new THREE.Group();
notebook.position.set(-0.06, 0.77, 0.04);
desk.add(notebook);
box(notebook, 0.32, 0.016, 0.24, PAPER, 0, 0, 0, { hotspot: "desk" });
box(notebook, 0.32, 0.016, 0.24, 0xF0E8DC, 0, -0.01, 0, { hotspot: "desk" });
for (let i = 0; i < 4; i++) {
  cyl(notebook, 0.008, 0.008, 0.025, 0x888888, 0, 0.01, -0.09 + i * 0.045, { rx: Math.PI / 2 });
}
for (let i = 0; i < 5; i++) {
  box(notebook, 0.22, 0.002, 0.005, 0xCCC8C0, 0.02, 0.01, -0.07 + i * 0.028);
}

const lamp = new THREE.Group();
lamp.position.set(-0.42, 0.74, -0.18);
desk.add(lamp);
cyl(lamp, 0.06, 0.08, 0.04, SAGE, 0, 0.02, 0);
cyl(lamp, 0.016, 0.016, 0.14, SAGE, 0, 0.11, 0);
cyl(lamp, 0.09, 0.05, 0.1, 0xFAF6E8, 0, 0.21, 0);
const lampGlow = sph(lamp, 0.04, 0xFFF8E0, 0, 0.17, 0);

const mug = new THREE.Group();
mug.position.set(0.38, 0.74, 0.1);
desk.add(mug);
cyl(mug, 0.05, 0.042, 0.09, SAGE, 0, 0.045, 0);
cyl(mug, 0.04, 0.036, 0.08, 0x8A6A4A, 0, 0.05, 0);
const handle = new THREE.TorusGeometry(0.026, 0.008, 8, 12, Math.PI);
const handleMesh = new THREE.Mesh(handle, flat(SAGE));
handleMesh.position.set(0.058, 0.045, 0);
handleMesh.rotation.z = Math.PI / 2;
handleMesh.rotation.y = Math.PI / 2;
mug.add(handleMesh);

const glow = box(desk, 0.34, 0.006, 0.26, 0xFFF8D0, -0.08, 0.76, 0.04);
glow.visible = false;
glow.name = "glow";

const chair = new THREE.Group();
chair.position.set(0, 0, 0.42);
room.add(chair);
box(chair, 0.4, 0.06, 0.36, SAGE_LT, 0, 0.48, 0);
box(chair, 0.36, 0.36, 0.05, SAGE_LT, 0, 0.7, -0.155);
cyl(chair, 0.024, 0.024, 0.44, WOOD, -0.15, 0.24, -0.14);
cyl(chair, 0.024, 0.024, 0.44, WOOD, 0.15, 0.24, -0.14);
cyl(chair, 0.024, 0.024, 0.44, WOOD, -0.15, 0.24, 0.14);
cyl(chair, 0.024, 0.024, 0.44, WOOD, 0.15, 0.24, 0.14);

const picture = new THREE.Group();
picture.position.set(-ROOM_W / 2 + 0.05, 1.5, 0.55);
room.add(picture);
box(picture, 0.05, 0.38, 0.32, WOOD, 0, 0, 0);
box(picture, 0.02, 0.32, 0.26, 0xF8F0E8, 0.025, 0, 0);
sph(picture, 0.05, 0xE8A090, 0.035, 0.05, 0.03, { sy: 0.55 });
sph(picture, 0.04, 0xE8A090, 0.035, 0.03, -0.04, { sy: 0.45 });
box(picture, 0.01, 0.08, 0.02, LEAF, 0.035, -0.05, 0.01);
box(picture, 0.01, 0.06, 0.02, LEAF, 0.035, -0.03, -0.04);

const board = new THREE.Group();
board.position.set(-ROOM_W / 2 + 0.05, 1.4, -0.35);
board.userData.hotspot = "board";
room.add(board);
box(board, 0.05, 0.55, 0.42, WOOD, 0, 0, 0, { hotspot: "board" });
box(board, 0.02, 0.48, 0.36, CORK, 0.025, 0, 0, { hotspot: "board" });
box(board, 0.01, 0.11, 0.09, 0xE8D0C0, 0.038, 0.1, -0.06, { hotspot: "board" });
box(board, 0.01, 0.1, 0.07, 0xD4E8C0, 0.038, -0.04, 0.09, { hotspot: "board" });
box(board, 0.01, 0.07, 0.09, 0xF8E8D0, 0.038, 0.14, 0.1, { hotspot: "board" });
box(board, 0.01, 0.08, 0.06, 0xF0D8D8, 0.038, -0.13, -0.04, { hotspot: "board" });
const boardGlow = box(board, 0.01, 0.48, 0.36, 0xFFF8D0, 0.035, 0, 0, { mat: { transparent: true, opacity: 0.4 } });
boardGlow.visible = false;
boardGlow.name = "boardGlow";

const plant = new THREE.Group();
plant.position.set(ROOM_W / 2 - 0.4, 0, 0.4);
plant.userData.hotspot = "plant";
room.add(plant);
cyl(plant, 0.22, 0.18, 0.36, SAGE, 0, 0.18, 0, { hotspot: "plant" });
cyl(plant, 0.2, 0.2, 0.05, 0x6A5A4A, 0, 0.34, 0, { hotspot: "plant" });

function monsteraLeaf(g, x, y, z, ry, scale) {
  const leaf = new THREE.Group();
  leaf.position.set(x, y, z);
  leaf.rotation.y = ry;
  leaf.scale.setScalar(scale || 1);
  g.add(leaf);
  cyl(leaf, 0.01, 0.013, 0.26, LEAF_DK, 0, 0.13, 0, { rx: -0.3 });
  sph(leaf, 0.14, LEAF, 0, 0.34, 0.05, { sy: 0.32, sz: 0.85, rx: -0.4 });
  sph(leaf, 0.11, LEAF_DK, -0.05, 0.3, 0.08, { sy: 0.28, sz: 0.65, rx: -0.35 });
}
monsteraLeaf(plant, 0.06, 0.36, 0.1, 0.3, 1.0);
monsteraLeaf(plant, -0.1, 0.36, 0.06, -0.5, 0.9);
monsteraLeaf(plant, 0.03, 0.36, -0.08, 2.8, 0.85);
monsteraLeaf(plant, -0.06, 0.38, -0.04, -2.2, 0.75);
monsteraLeaf(plant, 0.11, 0.34, 0, 1.2, 0.8);

const cairn = new THREE.Group();
cairn.position.set(0, 0.52, 0.42);
cairn.rotation.y = Math.PI;
cairn.userData.hotspot = "cairn";
room.add(cairn);

sph(cairn, 0.2, TERR, 0, 0.08, 0, { sy: 0.55, sx: 1.0, sz: 0.95, hotspot: "cairn" });
sph(cairn, 0.17, TERR_LT, 0, 0.26, 0, { sy: 0.55, sx: 0.95, sz: 0.9, hotspot: "cairn" });
sph(cairn, 0.15, TERR, 0, 0.42, 0, { sy: 0.52, sx: 0.92, sz: 0.88, hotspot: "cairn" });
sph(cairn, 0.13, TERR_LT, 0, 0.55, 0, { sy: 0.5, sx: 0.9, sz: 0.85, hotspot: "cairn" });
const cap = cyl(cairn, 0.15, 0.17, 0.06, OLIVE, 0, 0.68, 0, { hotspot: "cairn" });
cap.rotation.x = 0.1;
cap.rotation.z = -0.06;

sph(cairn, 0.026, 0x2A2420, -0.052, 0.54, 0.11, { hotspot: "cairn" });
sph(cairn, 0.026, 0x2A2420, 0.052, 0.54, 0.11, { hotspot: "cairn" });

const leftArm = cyl(cairn, 0.02, 0.015, 0.28, TWIG, -0.12, 0.3, 0.18, { rz: 0.4, rx: -0.6, hotspot: "cairn" });
const rightArm = cyl(cairn, 0.02, 0.015, 0.28, TWIG, 0.1, 0.3, 0.18, { rz: -0.3, rx: -0.6, hotspot: "cairn" });
const pencil = cyl(cairn, 0.012, 0.012, 0.15, 0xE8C85A, 0.06, 0.15, 0.42, { rx: -1.2, rz: 0.15 });
cyl(cairn, 0.013, 0.008, 0.028, 0xF8E8D8, 0.055, 0.12, 0.48, { rx: -1.2, rz: 0.15 });

cairn.userData.baseY = 0.52;
cairn.userData.sitting = true;

const objectGoals = {
  desk: { name: "Desk", goal: "Start a focus session", canAdd: true },
  board: { name: "Pin Board", goal: "Plan a local ceramics class", canAdd: true },
  plant: { name: "Plant", goal: "Unassigned", canAdd: false },
  window: { name: "Window", goal: "Mood & natural light", canAdd: false },
  cairn: { name: "Cairn", goal: "Your guide", canAdd: false }
};

const addedItems = {
  desk: [],
  board: []
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
  if (name === "plant" || name === "window") {
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
  const bob = state.working ? Math.sin(t * 6.2) * 0.035 : Math.sin(t * 1.6) * 0.008;
  const pulse = state.working ? 1 + Math.sin(t * 6.2) * 0.025 : 1;
  cairn.position.y = cairn.userData.baseY + bob;
  cairn.scale.set(pulse, pulse, pulse);
  renderer.render(scene, camera);
}

renderNeeds();
animate();
