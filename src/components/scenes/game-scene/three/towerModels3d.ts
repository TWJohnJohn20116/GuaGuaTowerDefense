/**
 * 遊戲 3D 視圖 · 塔模型工廠（精細版）
 * 依塔種組合差異化幾何外形（幾何體共享單例，材質按塔生成）：
 *  - 四層材質：metal 機身 / trim 暗色金屬件 / accent 主色 / glow 強發光件
 *  - 通用細節：底座裙邊 + 接地發光環 + 鉚釘環、頸環、天線警示燈；小裝飾件不投影控制陰影開銷
 *  - 等級進化：等級差異呈現在模型本體（武器件 / 核心件漸進強化，各塔 Lv2-Lv5 形態不同）
 *  - userData.spinParts（另留 spinPart 相容）：持續旋轉部件（風塔葉片、雷射懸浮環、自訂塔多個自轉件）
 *  - userData.floatPart：浮動部件（冰晶、立幣等），Model3DPreview 預覽時上下漂浮
 *
 * 邊界約束：地塊視覺尺寸 0.94×0.94（半寬 0.47）。所有部件（含旋轉掃過範圍與
 * 浮動行程）的 XZ 半徑必須 ≤ 0.47，確保模型不超出自家地塊、相鄰塔不穿模。
 * 連接約束：所有部件必須與塔身相接（嵌入或貼合）；漂浮件需有連接結構（能量柱等）。
 */

import * as THREE from 'three';
import type { Custom3DModel, Custom3DPart } from '@/types/game';

// ===== 共享幾何體（模組級單例，全塔共用；dispose 時不銷毀） =====
// 段數取高細分（圓柱 44~48、球 36x26、環管 16x56 級別）消除低面數稜角感；
// 幾何全域共享單例，提高細分對記憶體與 draw call 數無影響
const G = {
  // 底座
  base: new THREE.CylinderGeometry(0.34, 0.42, 0.5, 44),
  baseWide: new THREE.CylinderGeometry(0.38, 0.44, 0.4, 44),
  baseTall: new THREE.CylinderGeometry(0.24, 0.34, 0.8, 36),
  baseHex: new THREE.CylinderGeometry(0.34, 0.4, 0.5, 6),
  skirt: new THREE.CylinderGeometry(0.38, 0.44, 0.12, 48),
  skirtHex: new THREE.CylinderGeometry(0.36, 0.42, 0.12, 6),
  collar: new THREE.CylinderGeometry(0.19, 0.25, 0.14, 32),
  bolt: new THREE.SphereGeometry(0.034, 12, 10),
  leg: new THREE.BoxGeometry(0.07, 0.4, 0.12),
  plate: new THREE.BoxGeometry(0.05, 0.22, 0.3),
  // 砲塔
  turret: new THREE.SphereGeometry(0.22, 36, 26),
  turretBig: new THREE.SphereGeometry(0.3, 40, 30),
  dome: new THREE.SphereGeometry(0.155, 34, 22, 0, Math.PI * 2, 0, Math.PI / 2),
  // 砲管與武器件
  barrel: new THREE.BoxGeometry(0.44, 0.13, 0.13),
  barrelLong: new THREE.BoxGeometry(0.56, 0.09, 0.09),
  barrelFat: new THREE.BoxGeometry(0.42, 0.22, 0.22),
  barrelShort: new THREE.BoxGeometry(0.3, 0.09, 0.09),
  muzzle: new THREE.CylinderGeometry(0.07, 0.07, 0.1, 24),
  muzzleWide: new THREE.CylinderGeometry(0.15, 0.17, 0.14, 32),
  brake: new THREE.BoxGeometry(0.1, 0.15, 0.15),
  shroud: new THREE.CylinderGeometry(0.08, 0.08, 0.3, 24),
  fin: new THREE.BoxGeometry(0.2, 0.14, 0.018),
  scope: new THREE.CylinderGeometry(0.045, 0.045, 0.2, 18),
  ammoBox: new THREE.BoxGeometry(0.18, 0.15, 0.24),
  shield: new THREE.BoxGeometry(0.04, 0.24, 0.42),
  // 能量 / 法術件
  pole: new THREE.CylinderGeometry(0.05, 0.07, 0.9, 22),
  orb: new THREE.SphereGeometry(0.16, 34, 26),
  orbSmall: new THREE.SphereGeometry(0.055, 20, 16),
  crystal: new THREE.OctahedronGeometry(0.22),
  crystalSmall: new THREE.OctahedronGeometry(0.08),
  cone: new THREE.ConeGeometry(0.2, 0.4, 32),
  spike: new THREE.ConeGeometry(0.045, 0.22, 16),
  nozzle: new THREE.ConeGeometry(0.18, 0.32, 32, 1, true),
  lens: new THREE.CylinderGeometry(0.11, 0.15, 0.12, 32),
  coil: new THREE.TorusGeometry(0.11, 0.032, 16, 36),
  ringThin: new THREE.TorusGeometry(0.2, 0.024, 16, 44),
  bandRing: new THREE.TorusGeometry(0.305, 0.02, 16, 52),
  halo: new THREE.TorusGeometry(0.33, 0.02, 16, 56),
  groundRing: new THREE.TorusGeometry(0.42, 0.012, 14, 64),
  pipe: new THREE.CylinderGeometry(0.028, 0.028, 0.34, 16),
  tank: new THREE.CapsuleGeometry(0.1, 0.2, 12, 24),
  valve: new THREE.CylinderGeometry(0.07, 0.07, 0.06, 20),
  blade: new THREE.BoxGeometry(0.4, 0.028, 0.12),
  tailFin: new THREE.BoxGeometry(0.05, 0.18, 0.14),
  nacelle: new THREE.CapsuleGeometry(0.09, 0.22, 12, 22),
  coin: new THREE.CylinderGeometry(0.26, 0.26, 0.065, 44),
  coinSmall: new THREE.CylinderGeometry(0.11, 0.11, 0.04, 28),
  torus: new THREE.TorusGeometry(0.3, 0.07, 20, 52),
  antenna: new THREE.CylinderGeometry(0.012, 0.02, 0.28, 10),
  energyBeam: new THREE.CylinderGeometry(0.05, 0.075, 0.32, 22),
};

/** 自訂 3D 模型編輯器可用的部件幾何（key 與 G 對齊，供 shape 欄位引用） */
export const TOWER_PART_SHAPES: Record<string, THREE.BufferGeometry> = G;

// ===== 材質工廠（每塔實例化，dispose 時銷毀） =====
/**
 * 標記「本模型擁有」的材質：disposeTowerModel 只釋放帶此標記的材質。
 * 這些工廠每次呼叫都新建一份（僅在同一模型內共用），跨模型共享的單例材質不帶標記，不會被誤放。
 */
const owned = <T extends THREE.Material>(m: T): T => {
  m.userData.owned = true;
  return m;
};

const metalMat = () =>
  owned(new THREE.MeshStandardMaterial({ color: 0x232936, roughness: 0.55, metalness: 0.5 }));

const trimMat = () =>
  owned(new THREE.MeshStandardMaterial({ color: 0x141821, roughness: 0.35, metalness: 0.8 }));

const accentMat = (color: number) =>
  owned(
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.38,
      metalness: 0.35,
      emissive: color,
      emissiveIntensity: 0.3,
    }),
  );

const glowMat = (color: number) =>
  owned(
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.25,
      metalness: 0.1,
      emissive: color,
      emissiveIntensity: 1.0,
    }),
  );

const goldMat = () =>
  owned(
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.35,
      metalness: 0.6,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.3,
    }),
  );

// ===== 建構輔助 =====
type Ctx = {
  g: THREE.Group;
  metal: THREE.Material;
  trim: THREE.Material;
  accent: THREE.Material;
  glow: THREE.Material;
};

type AddOpts = {
  rx?: number;
  ry?: number;
  rz?: number;
  name?: string;
  /** 小裝飾件傳 false 關閉投影，控制陰影 draw call */
  shadow?: boolean;
  parent?: THREE.Object3D;
};

function add(
  ctx: Ctx,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  o: AddOpts = {},
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx;
  if (o.ry) m.rotation.y = o.ry;
  if (o.rz) m.rotation.z = o.rz;
  if (o.name) m.name = o.name;
  m.castShadow = o.shadow !== false;
  (o.parent ?? ctx.g).add(m);
  return m;
}

/** 鉚釘環：沿半徑 r 等距放置 count 顆鉚釘（不投影） */
function addBoltRing(ctx: Ctx, r: number, y: number, count: number): void {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    add(ctx, G.bolt, ctx.trim, Math.cos(a) * r, y, Math.sin(a) * r, { shadow: false });
  }
}

/** 通用底座裙邊 + 接地發光環 + 鉚釘環 */
function addSkirt(ctx: Ctx, bolts = 6): void {
  add(ctx, G.skirt, ctx.trim, 0, 0.06);
  add(ctx, G.groundRing, ctx.glow, 0, 0.02, 0, { rx: Math.PI / 2, shadow: false });
  if (bolts > 0) addBoltRing(ctx, 0.4, 0.13, bolts);
}

/** 警示天線：細杆 + 頂端發光小球（不投影） */
function addAntenna(ctx: Ctx, x: number, y: number, z = 0): void {
  add(ctx, G.antenna, ctx.metal, x, y, z, { shadow: false });
  add(ctx, G.orbSmall, ctx.glow, x, y + 0.17, z, { shadow: false });
}

// ===== 各塔種建構器 =====

/** basic 與未知塔種：經典砲塔（裙邊 + 頸環 + 球塔 + 砲管組）
 *  等級進化：Lv2 瞄具 → Lv3 雙管 → Lv4 側裝甲 → Lv5 發光穹頂 + 雙天線 */
function buildBasic(ctx: Ctx, level: number): void {
  addSkirt(ctx, 6);
  add(ctx, G.base, ctx.metal, 0, 0.36);
  add(ctx, G.collar, ctx.trim, 0, 0.64);
  add(ctx, G.turret, ctx.accent, 0, 0.8);
  add(ctx, G.dome, level >= 5 ? ctx.glow : ctx.trim, 0, 0.9);
  const holder = new THREE.Group();
  holder.name = 'barrel';
  holder.position.y = 0.8;
  ctx.g.add(holder);
  for (const dz of level >= 3 ? [-0.08, 0.08] : [0]) {
    add(ctx, G.barrel, ctx.accent, 0.22, 0, dz, { parent: holder });
    add(ctx, G.muzzle, ctx.trim, 0.41, 0, dz, { rz: Math.PI / 2, shadow: false, parent: holder });
  }
  if (level >= 2) {
    add(ctx, G.scope, ctx.trim, 0.14, 0.13, 0, { rz: Math.PI / 2, shadow: false, parent: holder });
    add(ctx, G.orbSmall, ctx.glow, 0.24, 0.13, 0, { shadow: false, parent: holder });
  }
  if (level >= 4) {
    add(ctx, G.plate, ctx.trim, 0, 0.8, 0.24, { shadow: false });
    add(ctx, G.plate, ctx.trim, 0, 0.8, -0.24, { shadow: false });
  }
  addAntenna(ctx, -0.16, 1.0);
  if (level >= 5) addAntenna(ctx, 0.16, 1.0, -0.1);
}

/** sniper：細高塔 + 套筒長管 + 瞄準鏡 + 三斜撐
 *  等級進化：Lv2 雙節測距鏡 → Lv3 槍管散熱片 → Lv4 加速環 → Lv5 槍口能量燈 */
function buildSniper(ctx: Ctx, level: number): void {
  addSkirt(ctx, 4);
  // 三斜撐腿環繞塔身（pivot 轉向 + 腿頂向塔心傾斜）
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const pivot = new THREE.Group();
    pivot.rotation.y = -a;
    ctx.g.add(pivot);
    add(ctx, G.leg, ctx.metal, 0.32, 0.3, 0, { rz: 0.4, shadow: false, parent: pivot });
  }
  add(ctx, G.baseTall, ctx.metal, 0, 0.5);
  add(ctx, G.collar, ctx.trim, 0, 0.96);
  add(ctx, G.turret, ctx.accent, 0, 1.1);
  const holder = new THREE.Group();
  holder.name = 'barrel';
  holder.position.y = 1.1;
  ctx.g.add(holder);
  add(ctx, G.barrelLong, ctx.accent, 0.18, 0, 0, { parent: holder });
  add(ctx, G.shroud, ctx.trim, 0.16, 0, 0, { rz: Math.PI / 2, shadow: false, parent: holder });
  add(ctx, G.brake, ctx.trim, 0.41, 0, 0, { shadow: false, parent: holder });
  add(ctx, G.scope, ctx.trim, 0.16, 0.12, 0, { rz: Math.PI / 2, shadow: false, parent: holder });
  add(ctx, G.orbSmall, ctx.glow, 0.26, 0.12, 0, { shadow: false, parent: holder });
  if (level >= 2) {
    add(ctx, G.scope, ctx.trim, -0.02, 0.12, 0, { rz: Math.PI / 2, shadow: false, parent: holder });
    add(ctx, G.orbSmall, ctx.glow, -0.12, 0.12, 0, { shadow: false, parent: holder });
  }
  if (level >= 3) {
    add(ctx, G.fin, ctx.trim, 0.06, -0.08, 0, { shadow: false, parent: holder });
    add(ctx, G.fin, ctx.trim, 0.16, -0.08, 0, { shadow: false, parent: holder });
  }
  if (level >= 4) {
    add(ctx, G.ringThin, ctx.glow, 0.3, 0, 0, { ry: Math.PI / 2, shadow: false, parent: holder });
  }
  if (level >= 5) {
    add(ctx, G.orbSmall, ctx.glow, 0.4, 0.06, 0, { shadow: false, parent: holder });
    add(ctx, G.orbSmall, ctx.glow, 0.4, -0.06, 0, { shadow: false, parent: holder });
  }
}

/** cannon：寬重底座 + 側裝甲 + 粗管寬口 + 後部排氣
 *  等級進化：Lv2 第三排氣管 → Lv3 發光穹頂 → Lv4 雙側彈藥箱 → Lv5 炮口能量環 */
function buildCannon(ctx: Ctx, level: number): void {
  addSkirt(ctx, 8);
  add(ctx, G.baseWide, ctx.metal, 0, 0.3);
  add(ctx, G.plate, ctx.trim, 0, 0.42, 0.31, { shadow: false });
  add(ctx, G.plate, ctx.trim, 0, 0.42, -0.31, { shadow: false });
  add(ctx, G.turretBig, ctx.accent, 0, 0.66);
  add(ctx, G.dome, level >= 3 ? ctx.glow : ctx.trim, 0, 0.82);
  const holder = new THREE.Group();
  holder.name = 'barrel';
  holder.position.y = 0.66;
  ctx.g.add(holder);
  add(ctx, G.barrelFat, ctx.accent, 0.24, 0, 0, { parent: holder });
  add(ctx, G.muzzleWide, ctx.trim, 0.39, 0, 0, { rz: Math.PI / 2, parent: holder });
  add(ctx, G.brake, ctx.metal, -0.04, 0, 0, { shadow: false, parent: holder });
  // 後部雙排氣管
  add(ctx, G.pipe, ctx.trim, -0.3, 0.62, 0.12, { rz: 0.5, shadow: false });
  add(ctx, G.pipe, ctx.trim, -0.3, 0.62, -0.12, { rz: 0.5, shadow: false });
  if (level >= 2) add(ctx, G.pipe, ctx.trim, -0.32, 0.66, 0, { rz: 0.5, shadow: false });
  if (level >= 4) {
    add(ctx, G.ammoBox, ctx.metal, -0.12, 0.52, 0.28, { shadow: false });
    add(ctx, G.ammoBox, ctx.metal, -0.12, 0.52, -0.28, { shadow: false });
  }
  if (level >= 5) {
    add(ctx, G.ringThin, ctx.glow, 0.42, 0, 0, { ry: Math.PI / 2, shadow: false, parent: holder });
  }
}

/** machine：雙管機槍 + 套筒散熱片 + 側掛彈藥箱
 *  等級進化：Lv2 供彈鏈管 → Lv3 雙側彈藥箱 → Lv4 四管陣列 → Lv5 管口曳光燈 */
function buildMachine(ctx: Ctx, level: number): void {
  addSkirt(ctx, 6);
  add(ctx, G.base, ctx.metal, 0, 0.36);
  add(ctx, G.collar, ctx.trim, 0, 0.64);
  add(ctx, G.turret, ctx.accent, 0, 0.78);
  const holder = new THREE.Group();
  holder.name = 'barrel';
  holder.position.y = 0.78;
  ctx.g.add(holder);
  const lanes = level >= 4 ? [-0.105, -0.035, 0.035, 0.105] : [-0.07, 0.07];
  for (const dz of lanes) {
    add(ctx, G.barrelShort, ctx.accent, 0.28, 0, dz, { parent: holder });
    add(ctx, G.muzzle, ctx.trim, 0.4, 0, dz, { rz: Math.PI / 2, shadow: false, parent: holder });
    if (level >= 5) add(ctx, G.orbSmall, ctx.glow, 0.4, 0, dz, { shadow: false, parent: holder });
  }
  // 管間散熱片
  for (let i = 0; i < 3; i++) {
    add(ctx, G.fin, ctx.trim, 0.18 + i * 0.09, 0.07, 0, { shadow: false, parent: holder });
  }
  // 側掛彈藥箱與供彈口
  add(ctx, G.ammoBox, ctx.metal, -0.08, 0.74, 0.26, { shadow: false });
  add(ctx, G.bolt, ctx.glow, -0.08, 0.83, 0.34, { shadow: false });
  if (level >= 2) add(ctx, G.pipe, ctx.trim, -0.02, 0.78, 0.2, { rx: 1.1, shadow: false });
  if (level >= 3) {
    add(ctx, G.ammoBox, ctx.metal, -0.08, 0.74, -0.26, { shadow: false });
    add(ctx, G.bolt, ctx.glow, -0.08, 0.83, -0.34, { shadow: false });
  }
  addAntenna(ctx, -0.2, 0.98);
}

/** shotgun：三短管扇形 + 前護盾 + 後彈倉
 *  等級進化：Lv2 雙層護盾 → Lv3 五管扇形 → Lv4 雙彈倉 → Lv5 管口曳光燈 */
function buildShotgun(ctx: Ctx, level: number): void {
  addSkirt(ctx, 6);
  add(ctx, G.base, ctx.metal, 0, 0.36);
  add(ctx, G.collar, ctx.trim, 0, 0.64);
  add(ctx, G.turret, ctx.accent, 0, 0.78);
  const holder = new THREE.Group();
  holder.name = 'barrel';
  holder.position.y = 0.78;
  ctx.g.add(holder);
  const spread = level >= 3 ? [-2, -1, 0, 1, 2] : [-1, 0, 1];
  for (const i of spread) {
    const pivot = new THREE.Group();
    pivot.rotation.y = i * (level >= 3 ? 0.25 : 0.3);
    holder.add(pivot);
    add(ctx, G.barrelShort, ctx.accent, 0.27, 0, 0, { parent: pivot });
    add(ctx, G.muzzle, ctx.trim, 0.4, 0, 0, { rz: Math.PI / 2, shadow: false, parent: pivot });
    if (level >= 5) add(ctx, G.orbSmall, ctx.glow, 0.4, 0, 0, { shadow: false, parent: pivot });
  }
  // 前護盾板（直立橫置）+ 後部彈倉
  add(ctx, G.shield, ctx.trim, 0.14, -0.04, 0, { shadow: false, parent: holder });
  if (level >= 2) add(ctx, G.shield, ctx.trim, 0.18, 0.06, 0, { shadow: false, parent: holder });
  if (level >= 4) {
    add(ctx, G.ammoBox, ctx.metal, -0.2, 0.7, 0.13, { shadow: false });
    add(ctx, G.ammoBox, ctx.metal, -0.2, 0.7, -0.13, { shadow: false });
  } else {
    add(ctx, G.ammoBox, ctx.metal, -0.2, 0.7, 0, { shadow: false });
  }
  addAntenna(ctx, -0.14, 0.98, 0.14);
}

/** frost：六稜座 + 冰柱皇冠 + 主冰晶與衛星晶（旋轉 + 浮動）
 *  等級進化：Lv2 衛星晶 +1 → Lv3 第二圈冰柱 → Lv4 冰晶增大 → Lv5 頂部副晶 */
function buildFrost(ctx: Ctx, level: number): void {
  add(ctx, G.skirtHex, ctx.trim, 0, 0.06);
  add(ctx, G.halo, ctx.glow, 0, 0.1, 0, { rx: Math.PI / 2, shadow: false });
  add(ctx, G.baseHex, ctx.metal, 0, 0.36);
  // 六稜冰柱皇冠
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    add(ctx, G.spike, ctx.accent, Math.cos(a) * 0.3, 0.68, Math.sin(a) * 0.3, { shadow: false });
  }
  // Lv3+ 第二圈內層冰柱（更高）
  if (level >= 3) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      add(ctx, G.spike, ctx.glow, Math.cos(a) * 0.2, 0.76, Math.sin(a) * 0.2, { shadow: false });
    }
  }
  add(ctx, G.collar, ctx.trim, 0, 0.64);
  // 能量連接柱：貫穿頸環與冰晶，確保漂浮時仍與塔身相連
  add(ctx, G.energyBeam, ctx.glow, 0, 0.82, 0, { shadow: false });
  // 主冰晶 + 衛星小晶組成旋轉組（Lv4+ 整組增大）
  const spinGroup = new THREE.Group();
  spinGroup.position.y = level >= 4 ? 0.99 : 0.95;
  ctx.g.add(spinGroup);
  add(ctx, G.crystal, ctx.accent, 0, 0, 0, { parent: spinGroup });
  add(ctx, G.crystalSmall, ctx.glow, 0.3, 0.06, 0, { shadow: false, parent: spinGroup });
  add(ctx, G.crystalSmall, ctx.glow, -0.3, -0.04, 0, { shadow: false, parent: spinGroup });
  if (level >= 2) add(ctx, G.crystalSmall, ctx.glow, 0, 0.02, 0.3, { shadow: false, parent: spinGroup });
  if (level >= 5) add(ctx, G.crystalSmall, ctx.glow, 0, 0.3, 0, { shadow: false, parent: spinGroup });
  if (level >= 4) spinGroup.scale.setScalar(1.15);
  spinGroup.userData.spin = 0.8;
  ctx.g.userData.spinPart = spinGroup;
  ctx.g.userData.floatPart = spinGroup;
}

/** poison：毒罐 + 腰部警示環 + 輸液管 + 氣泡
 *  等級進化：Lv2 氣泡增生 → Lv3 第三輸液管 → Lv4 雙警示環 → Lv5 發光滴頭 */
function buildPoison(ctx: Ctx, level: number): void {
  addSkirt(ctx, 6);
  add(ctx, G.baseWide, ctx.metal, 0, 0.3);
  add(ctx, G.turretBig, ctx.accent, 0, 0.66);
  add(ctx, G.bandRing, ctx.glow, 0, 0.66, 0, { rx: Math.PI / 2, shadow: false });
  if (level >= 4) add(ctx, G.bandRing, ctx.glow, 0, 0.54, 0, { rx: Math.PI / 2, shadow: false });
  add(ctx, G.valve, ctx.trim, 0, 0.98);
  add(ctx, G.cone, ctx.accent, 0, 1.12);
  if (level >= 5) {
    add(ctx, G.valve, ctx.trim, 0, 1.3);
    add(ctx, G.orbSmall, ctx.glow, 0, 1.38, 0, { shadow: false });
  }
  // 側面輸液管（斜貼罐身，管身半嵌入罐面確保相連）
  add(ctx, G.pipe, ctx.trim, 0.22, 0.5, 0.13, { rx: 0.4, rz: -0.5, shadow: false });
  add(ctx, G.pipe, ctx.trim, -0.22, 0.5, -0.13, { rx: -0.4, rz: 0.5, shadow: false });
  if (level >= 3) add(ctx, G.pipe, ctx.trim, -0.13, 0.5, 0.22, { rx: 0.5, rz: 0.4, shadow: false });
  // 罐面氣泡
  add(ctx, G.orbSmall, ctx.glow, 0.2, 0.78, 0.18, { shadow: false });
  add(ctx, G.orbSmall, ctx.glow, -0.24, 0.6, 0.14, { shadow: false });
  add(ctx, G.orbSmall, ctx.glow, 0.06, 0.52, -0.27, { shadow: false });
  if (level >= 2) {
    add(ctx, G.orbSmall, ctx.glow, -0.12, 0.8, -0.2, { shadow: false });
    add(ctx, G.orbSmall, ctx.glow, 0.26, 0.62, -0.1, { shadow: false });
  }
}

/** laser：方尖碑 + 聚焦透鏡 + 懸浮水晶環（旋轉 + 浮動） + 頂部聚能點
 *  等級進化：Lv2 環緣水晶 +1 → Lv3 第二懸浮環 → Lv4 聚能球增大 → Lv5 頂部光矛 */
function buildLaser(ctx: Ctx, level: number): void {
  addSkirt(ctx, 4);
  add(ctx, G.baseTall, ctx.metal, 0, 0.5);
  add(ctx, G.lens, ctx.trim, 0, 0.96);
  add(ctx, G.cone, ctx.accent, 0, 1.18);
  if (level >= 4) add(ctx, G.orb, ctx.glow, 0, 1.46, 0, { shadow: false });
  else add(ctx, G.orbSmall, ctx.glow, 0, 1.44, 0, { shadow: false });
  if (level >= 5) add(ctx, G.spike, ctx.glow, 0, 1.7, 0, { shadow: false });
  // 懸浮環 + 環緣小水晶（整組旋轉；Lv2+ 增晶，Lv3+ 雙環）
  const ringGroup = new THREE.Group();
  ringGroup.position.y = 0.68;
  ctx.g.add(ringGroup);
  add(ctx, G.torus, ctx.accent, 0, 0, 0, { rx: Math.PI / 2, parent: ringGroup });
  if (level >= 3) add(ctx, G.ringThin, ctx.glow, 0, 0.16, 0, { rx: Math.PI / 2, shadow: false, parent: ringGroup });
  const crystals = level >= 2 ? 4 : 3;
  for (let i = 0; i < crystals; i++) {
    const a = (i / crystals) * Math.PI * 2;
    add(ctx, G.crystalSmall, ctx.glow, Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3, {
      shadow: false,
      parent: ringGroup,
    });
  }
  ringGroup.userData.spin = 1.6;
  ctx.g.userData.spinPart = ringGroup;
  ctx.g.userData.floatPart = ringGroup;
}

/** lightning：特斯拉線圈（三層線圈 + 頂部電球 + 環繞電極 + 避雷尖）
 *  等級進化：Lv2 第四層線圈 → Lv3 電極 +2 → Lv4 雙避雷尖 → Lv5 電球增大 */
function buildLightning(ctx: Ctx, level: number): void {
  addSkirt(ctx, 6);
  add(ctx, G.base, ctx.metal, 0, 0.36);
  add(ctx, G.pole, ctx.metal, 0, 0.95);
  // 沿杆線圈（Lv2+ 第四層）
  const coils = level >= 2 ? 4 : 3;
  for (let i = 0; i < coils; i++) {
    add(ctx, G.coil, ctx.trim, 0, 0.74 + i * 0.16, 0, { rx: Math.PI / 2, shadow: false });
  }
  const orb = add(ctx, G.orb, ctx.accent, 0, 1.46);
  if (level >= 5) orb.scale.setScalar(1.25);
  add(ctx, G.spike, ctx.trim, 0, level >= 5 ? 1.72 : 1.68, 0, { shadow: false });
  if (level >= 4) {
    add(ctx, G.spike, ctx.trim, 0.1, 1.6, 0, { rz: -0.4, shadow: false });
    add(ctx, G.spike, ctx.trim, -0.1, 1.6, 0, { rz: 0.4, shadow: false });
  }
  // 環繞電極（緩轉；Lv3+ 增至 6 顆）
  const electrodes = new THREE.Group();
  electrodes.position.y = 1.46;
  ctx.g.add(electrodes);
  const count = level >= 3 ? 6 : 4;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    add(ctx, G.orbSmall, ctx.glow, Math.cos(a) * 0.25, 0, Math.sin(a) * 0.25, {
      shadow: false,
      parent: electrodes,
    });
  }
  electrodes.userData.spin = 0.6;
  ctx.g.userData.spinPart = electrodes;
}

/** flame：燃料罐 + 側掛副罐與管線 + 壓力閥 + 點火噴嘴組
 *  等級進化：Lv2 後方第三副罐 → Lv3 噴嘴點火器 → Lv4 罐身警示環 → Lv5 噴口火焰環 */
function buildFlame(ctx: Ctx, level: number): void {
  addSkirt(ctx, 6);
  add(ctx, G.baseWide, ctx.metal, 0, 0.3);
  add(ctx, G.turretBig, ctx.accent, 0, 0.62);
  // 側掛副罐 + 連接管線（Lv2+ 後方第三罐）
  add(ctx, G.tank, ctx.metal, 0, 0.52, 0.34, { shadow: false });
  add(ctx, G.tank, ctx.metal, 0, 0.52, -0.34, { shadow: false });
  add(ctx, G.pipe, ctx.trim, 0, 0.78, 0.22, { rx: 0.9, shadow: false });
  add(ctx, G.pipe, ctx.trim, 0, 0.78, -0.22, { rx: -0.9, shadow: false });
  if (level >= 2) {
    add(ctx, G.tank, ctx.metal, -0.28, 0.52, 0, { shadow: false });
    add(ctx, G.pipe, ctx.trim, -0.2, 0.78, 0, { rz: 0.9, shadow: false });
  }
  // 頂部壓力閥與指示燈
  add(ctx, G.valve, ctx.trim, 0, 0.95);
  add(ctx, G.orbSmall, ctx.glow, 0.12, 1.0, 0, { shadow: false });
  if (level >= 4) add(ctx, G.bandRing, ctx.glow, 0, 0.5, 0, { rx: Math.PI / 2, shadow: false });
  // 點火噴嘴組
  const holder = new THREE.Group();
  holder.name = 'barrel';
  holder.position.y = 0.62;
  ctx.g.add(holder);
  add(ctx, G.nozzle, ctx.accent, 0.3, 0, 0, { rz: -Math.PI / 2, parent: holder });
  add(ctx, G.muzzle, ctx.trim, 0.4, 0, 0, { rz: Math.PI / 2, shadow: false, parent: holder });
  add(ctx, G.orbSmall, ctx.glow, 0.41, 0, 0, { shadow: false, parent: holder });
  if (level >= 3) add(ctx, G.orbSmall, ctx.glow, 0.3, 0.12, 0, { shadow: false, parent: holder });
  if (level >= 5) add(ctx, G.ringThin, ctx.glow, 0.43, 0, 0, { ry: Math.PI / 2, shadow: false, parent: holder });
}

/** wind：風機（機艙 + 尾舵 + 葉片葉尖燈，持續旋轉）
 *  等級進化：Lv2 五葉片 → Lv3 雙尾舵 → Lv4 六葉片 → Lv5 桅頂警示燈 + 輪轂發光 */
function buildWind(ctx: Ctx, level: number): void {
  addSkirt(ctx, 4);
  add(ctx, G.baseTall, ctx.metal, 0, 0.5);
  add(ctx, G.collar, ctx.trim, 0, 0.96);
  add(ctx, G.nacelle, ctx.metal, 0, 1.1, 0, { rz: Math.PI / 2 });
  add(ctx, G.tailFin, ctx.trim, -0.22, 1.12, 0, { shadow: false });
  if (level >= 3) add(ctx, G.tailFin, ctx.trim, -0.22, 1.04, 0, { shadow: false });
  // 葉片 + 葉尖燈（Lv2+ 五葉、Lv4+ 六葉）
  const hub = new THREE.Group();
  hub.position.y = 1.1;
  ctx.g.add(hub);
  add(ctx, G.valve, ctx.trim, 0, 0, 0, { shadow: false, parent: hub });
  if (level >= 5) add(ctx, G.orbSmall, ctx.glow, 0, 0.06, 0, { shadow: false, parent: hub });
  const blades = level >= 4 ? 6 : level >= 2 ? 5 : 4;
  for (let i = 0; i < blades; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / blades) * Math.PI * 2;
    hub.add(pivot);
    add(ctx, G.blade, ctx.accent, 0.22, 0, 0, { parent: pivot });
    add(ctx, G.orbSmall, ctx.glow, 0.41, 0, 0, { shadow: false, parent: pivot });
  }
  if (level >= 5) addAntenna(ctx, 0.14, 1.24);
  hub.userData.spin = 3;
  ctx.g.userData.spinPart = hub;
}

/** money：金幣堆疊 + 頂部旋轉立幣（浮動） + 散落小幣
 *  等級進化：Lv2 幣堆 +1 層 → Lv3 散幣增生 → Lv4 幣堆 +2 層 → Lv5 雙立幣交叉 */
function buildMoney(ctx: Ctx, gold: THREE.Material, level: number): void {
  addSkirt(ctx, 6);
  add(ctx, G.baseWide, ctx.metal, 0, 0.3);
  // 主金幣堆（錯位旋轉更自然，底層貼合塔基頂面；高等級堆更高）
  const stack = 4 + (level >= 2 ? 1 : 0) + (level >= 4 ? 1 : 0);
  const offsets = [0, 0.05, -0.04, 0.02, -0.03, 0.04];
  for (let i = 0; i < stack; i++) {
    add(ctx, G.coin, gold, offsets[i], 0.53 + i * 0.07, offsets[(i + 3) % 6] * 0.8, { ry: i * 0.8 + 0.3 });
  }
  const stackTop = 0.53 + (stack - 1) * 0.07;
  // 散落小幣（貼合塔基頂面）
  add(ctx, G.coinSmall, gold, 0.3, 0.52, 0.2, { ry: 0.5, shadow: false });
  add(ctx, G.coinSmall, gold, -0.28, 0.52, -0.18, { ry: 1.4, shadow: false });
  if (level >= 3) {
    add(ctx, G.coinSmall, gold, 0.26, 0.52, -0.24, { ry: 0.9, shadow: false });
    add(ctx, G.coinSmall, gold, -0.22, 0.52, 0.26, { ry: 2.2, shadow: false });
  }
  // 頂部旋轉立幣（下緣嵌入幣堆頂，漂浮行程內保持相連；Lv5 雙幣交叉）
  const standCoin = new THREE.Group();
  standCoin.position.y = stackTop + 0.23;
  ctx.g.add(standCoin);
  add(ctx, G.coin, gold, 0, 0, 0, { rx: Math.PI / 2, parent: standCoin });
  if (level >= 5) add(ctx, G.coin, gold, 0, 0, 0, { rx: Math.PI / 2, ry: Math.PI / 2, parent: standCoin });
  standCoin.userData.spin = 1.4;
  ctx.g.userData.spinPart = standCoin;
  ctx.g.userData.floatPart = standCoin;
}

/** pulse：能量核心 + 陀螺儀斜環組（旋轉） + 四向天線
 *  等級進化：Lv2 第三斜環 → Lv3 核心增大 → Lv4 六向天線 → Lv5 頂部衛星球 */
function buildPulse(ctx: Ctx, level: number): void {
  addSkirt(ctx, 6);
  add(ctx, G.base, ctx.metal, 0, 0.36);
  add(ctx, G.collar, ctx.trim, 0, 0.64);
  const core = add(ctx, G.orb, ctx.glow, 0, 0.82);
  if (level >= 3) core.scale.setScalar(1.2);
  // 陀螺儀環組：主平環 + 斜環（Lv2+ 第三斜環）
  const gyro = new THREE.Group();
  gyro.position.y = 0.82;
  ctx.g.add(gyro);
  add(ctx, G.torus, ctx.accent, 0, 0, 0, { rx: Math.PI / 2, parent: gyro });
  add(ctx, G.ringThin, ctx.accent, 0, 0, 0, { rx: Math.PI / 2 - 0.6, shadow: false, parent: gyro });
  add(ctx, G.ringThin, ctx.accent, 0, 0, 0, { rx: Math.PI / 2 + 0.6, shadow: false, parent: gyro });
  if (level >= 2) add(ctx, G.ringThin, ctx.glow, 0, 0, 0, { rx: Math.PI / 2, ry: 0.6, shadow: false, parent: gyro });
  if (level >= 5) {
    add(ctx, G.orbSmall, ctx.glow, 0.16, 0.11, 0, { shadow: false, parent: gyro });
    add(ctx, G.orbSmall, ctx.glow, -0.16, 0.11, 0, { shadow: false, parent: gyro });
  }
  gyro.userData.spin = 1.4;
  ctx.g.userData.spinPart = gyro;
  // 警示天線（Lv4+ 六向）
  const antennas = level >= 4 ? 6 : 4;
  for (let i = 0; i < antennas; i++) {
    const a = (i / antennas) * Math.PI * 2 + Math.PI / 4;
    addAntenna(ctx, Math.cos(a) * 0.34, 0.42, Math.sin(a) * 0.34);
  }
}

/** Mod 塔 3D 模型自訂選項（模組編輯器可調） */
export interface TowerModelOptions {
  /** 覆蓋基礎模型種類（mod 塔指定外形用；預設取 type 本身） */
  modelType?: string;
  /** 整體縮放 0.5~2：Y 全幅生效，XZ 夾限 ≤1 確保不超出地塊 */
  modelScale?: number;
  /** 砲管長度倍率 0.5~1：僅縮放 name='barrel' 武器組（上限標準長度，避免砲口出界） */
  barrelLength?: number;
  /** 發光件覆蓋色（未提供時用塔主色） */
  glowColor?: number;
  /** 發光強度 0~1（映射 emissiveIntensity 0.2~1.8；未提供時用預設 1.0） */
  glowIntensity?: number;
  /** 自訂部件模型（3D 模型編輯器產生；存在且非空時優先於 modelType） */
  custom3d?: Custom3DModel;
}

// ===== 自訂部件模型（3D 模型編輯器產生）=====
/** 部件節點索引：partId → 部件節點（hidden 部件是空 Group），編輯器 gizmo 定位／選取框用 */
type PartNodeMap = Record<string, THREE.Object3D>;
type PartMats = Record<Custom3DPart['material'], THREE.MeshStandardMaterial>;

/** 解析 CSS 色字串；解析失敗（含未知色名）回傳 null，由呼叫端回退材質預設色 */
function parsePartColor(input: string | undefined): THREE.Color | null {
  const raw = input?.trim();
  if (!raw) return null;
  const v = raw.toLowerCase();
  const ok = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(v)
    || /^(?:rgb|rgba|hsl|hsla)\([^()]*\)$/.test(v)
    || Object.prototype.hasOwnProperty.call(THREE.Color.NAMES, v);
  if (!ok) return null;
  try {
    return new THREE.Color(raw);
  } catch {
    return null;
  }
}

/** 材質：先取 material 角色材質；有 color／emissive／opacity 覆蓋時建立並快取專屬材質 */
function partMaterial(p: Custom3DPart, mats: PartMats, cache: Map<string, THREE.MeshStandardMaterial>): THREE.MeshStandardMaterial {
  const base = mats[p.material] ?? mats.accent;
  const color = parsePartColor(p.color);
  const emissive = typeof p.emissive === 'number' && Number.isFinite(p.emissive) ? Math.max(0, Math.min(3, p.emissive)) : undefined;
  const opacity = typeof p.opacity === 'number' && Number.isFinite(p.opacity) ? Math.max(0, Math.min(1, p.opacity)) : 1;
  if (!color && emissive === undefined && opacity >= 1) return base;
  // 相同覆蓋組合共用一份材質，避免每部件一份造成材質爆炸
  const key = [p.material, p.color ?? '', p.emissive ?? '', p.opacity ?? ''].join('|');
  const cached = cache.get(key);
  if (cached) return cached;
  const mat = base.clone();
  if (color) {
    mat.color.copy(color);
    mat.emissive.copy(color);
  }
  if (emissive !== undefined) mat.emissiveIntensity = emissive;
  if (opacity < 1) {
    mat.transparent = true;
    mat.opacity = opacity;
    mat.depthWrite = false;
  }
  mat.userData.owned = true;
  cache.set(key, mat);
  return mat;
}

/** 每軸縮放夾限 0.2~3；sx／sy／sz 缺省時回退舊欄位 scale */
function partAxisScale(v: number | undefined, fallback: number): number {
  return Math.max(0.2, Math.min(3, typeof v === 'number' && Number.isFinite(v) ? v : fallback));
}

/**
 * 依自訂部件資料組裝塔模型（3D 模型編輯器同款管線）：部件依 parentId 成樹（父件不存在／指向
 * 自己／循環 → 根層），hidden 只建空群組，變換取 sx/sy/sz（缺省回退 scale），材質可覆蓋並
 * 快取，自轉部件各自包一層 Group 收進 userData.spinParts；XZ 超出地塊半寬 0.47 時整體收縮。
 */
export function buildCustomTowerModel(
  model: Custom3DModel,
  color: number,
  opts: Pick<TowerModelOptions, 'glowColor' | 'glowIntensity'> = {},
): THREE.Group {
  const g = new THREE.Group();
  const glow = glowMat(opts.glowColor ?? color);
  if (opts.glowIntensity !== undefined) {
    glow.emissiveIntensity = 0.2 + Math.max(0, Math.min(1, opts.glowIntensity)) * 1.6;
  }
  const mats: PartMats = { metal: metalMat(), trim: trimMat(), accent: accentMat(color), glow, gold: goldMat() };
  const overrides = new Map<string, THREE.MeshStandardMaterial>();

  // 1) 節點：每個部件一個（hidden 也建，只是用空 Group），id 重複者只取第一個
  const nodes: PartNodeMap = {};
  const byId = new Map<string, Custom3DPart>();
  for (const p of model.parts) {
    if (!p || typeof p.id !== 'string' || p.id === '' || byId.has(p.id)) continue;
    byId.set(p.id, p);
    const geo = G[p.shape as keyof typeof G];
    const node: THREE.Object3D = !p.hidden && geo
      ? new THREE.Mesh(geo, partMaterial(p, mats, overrides))
      : new THREE.Group();
    if (node instanceof THREE.Mesh) node.castShadow = true;
    node.userData.partId = p.id;
    const base = p.scale || 1;
    node.position.set(p.x, p.y, p.z);
    node.rotation.set(p.rx, p.ry, p.rz);
    node.scale.set(partAxisScale(p.sx, base), partAxisScale(p.sy, base), partAxisScale(p.sz, base));
    nodes[p.id] = node;
  }

  // 2) 父件：不存在／指向自己／形成循環 → 當根層（沿父鏈上溯偵測，最多走部件數步）
  const parentOf = new Map<string, string>();
  for (const [id, p] of byId) {
    const pid = typeof p.parentId === 'string' ? p.parentId : '';
    if (!pid || pid === id || !byId.has(pid)) continue;
    let cur = pid;
    let cyclic = false;
    for (let step = 0; step <= byId.size; step++) {
      if (cur === id) { cyclic = true; break; }
      const up = byId.get(cur);
      const next = up && typeof up.parentId === 'string' ? up.parentId : '';
      if (!next || next === cur || !byId.has(next)) break;
      cur = next;
    }
    if (!cyclic) parentOf.set(id, pid);
  }

  // 3) 掛載：父件先存在即可（順序無關）；spin 部件多包一層自轉 Group
  const spinParts: THREE.Object3D[] = [];
  for (const [id, p] of byId) {
    const node = nodes[id];
    const pid = parentOf.get(id);
    const holder = pid ? nodes[pid] : g;
    if (p.spin) {
      const spin = new THREE.Group();
      spin.userData.partId = id;
      spin.userData.spin = 1.2;
      spin.add(node);
      holder.add(spin);
      spinParts.push(spin);
    } else {
      holder.add(node);
    }
  }
  if (spinParts.length > 0) {
    g.userData.spinParts = spinParts;
    g.userData.spinPart = spinParts[0];
  }
  g.userData.partNodes = nodes;

  // 越界保護：XZ 半徑超過地塊半寬時整體收縮（全 hidden／空模型時 Box3 為空，跳過）
  const box = new THREE.Box3().setFromObject(g);
  if (!box.isEmpty()) {
    const r = Math.max(Math.abs(box.min.x), Math.abs(box.max.x), Math.abs(box.min.z), Math.abs(box.max.z));
    if (r > 0.47) {
      const shrink = 0.47 / r;
      g.scale.setScalar(shrink);
      // 讓編輯器知道「這個模型被自動縮小了」（1 = 沒有縮），不要用估算值猜
      g.userData.shrink = shrink;
      const outer = new THREE.Group();
      outer.add(g);
      outer.userData.spinPart = g.userData.spinPart;
      outer.userData.spinParts = g.userData.spinParts;
      outer.userData.partNodes = nodes;
      outer.userData.shrink = shrink;
      return outer;
    }
  }

  return g;
}

/**
 * 建立指定塔種的 3D 模型；barrel 部件 name='barrel'（指向目標），spinPart 由迴圈旋轉。
 * 等級差異呈現在模型本體（武器件 / 核心件隨等級漸進強化），不使用底座裝飾環。
 * opts 為 mod 塔自訂外觀；回傳結構為 outer(回傳值) > inner(縮放層) > 模型件。
 */
export function buildTowerModel(
  type: string,
  color: number,
  level: number,
  opts: TowerModelOptions = {},
): THREE.Group {
  // 自訂部件模型優先（3D 模型編輯器產生）
  if (opts.custom3d && opts.custom3d.parts.length > 0) {
    const custom = buildCustomTowerModel(opts.custom3d, color, opts);
    custom.userData.level = level;
    return custom;
  }
  const g = new THREE.Group();
  const glowColor = opts.glowColor ?? color;
  const glow = glowMat(glowColor);
  if (opts.glowIntensity !== undefined) {
    glow.emissiveIntensity = 0.2 + Math.max(0, Math.min(1, opts.glowIntensity)) * 1.6;
  }
  const ctx: Ctx = {
    g,
    metal: metalMat(),
    trim: trimMat(),
    accent: accentMat(color),
    glow,
  };
  const lv = Math.max(1, level);
  const buildType = opts.modelType || type;

  switch (buildType) {
    case 'sniper':
      buildSniper(ctx, lv);
      break;
    case 'cannon':
      buildCannon(ctx, lv);
      break;
    case 'machine':
      buildMachine(ctx, lv);
      break;
    case 'shotgun':
      buildShotgun(ctx, lv);
      break;
    case 'ballista':
      // 弩炮以長管狙擊外型呈現（細高塔 + 長軌），與其直線貫穿定位呼應
      buildSniper(ctx, lv);
      break;
    case 'frost':
      buildFrost(ctx, lv);
      break;
    case 'poison':
      buildPoison(ctx, lv);
      break;
    case 'laser':
      buildLaser(ctx, lv);
      break;
    case 'lightning':
      buildLightning(ctx, lv);
      break;
    case 'flame':
      buildFlame(ctx, lv);
      break;
    case 'wind':
      buildWind(ctx, lv);
      break;
    case 'money':
      buildMoney(ctx, goldMat(), lv);
      break;
    case 'pulse':
      buildPulse(ctx, lv);
      break;
    default:
      buildBasic(ctx, lv);
      break;
  }

  // 砲管長度倍率：只縮放武器組 X 向（夾限 ≤1，砲口不出地塊）
  if (opts.barrelLength !== undefined && opts.barrelLength !== 1) {
    const holder = g.getObjectByName('barrel');
    if (holder) holder.scale.x = Math.max(0.5, Math.min(1, opts.barrelLength));
  }

  // 整體縮放：Y 全幅，XZ 夾限 ≤1（包一層 outer，避免被遊戲端 scale 覆蓋）
  const s = opts.modelScale ?? 1;
  if (s !== 1) {
    const clamped = Math.max(0.5, Math.min(2, s));
    const outer = new THREE.Group();
    g.scale.set(Math.min(clamped, 1), clamped, Math.min(clamped, 1));
    outer.add(g);
    outer.userData.spinPart = g.userData.spinPart;
    outer.userData.floatPart = g.userData.floatPart;
    outer.userData.level = level;
    return outer;
  }

  g.userData.level = level;

  return g;
}

/** 銷毀塔模型自己建立的材質（userData.owned）；共享幾何體與跨模型單例材質不動，同一材質只放一次 */
export function disposeTowerModel(group: THREE.Group): void {
  const seen = new Set<THREE.Material>();
  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const m = obj.material as THREE.Material | THREE.Material[];
    const list = Array.isArray(m) ? m : [m];
    for (const mat of list) {
      if (!mat || seen.has(mat)) continue;
      seen.add(mat);
      if (mat.userData.owned === true) mat.dispose();
    }
  });
}
