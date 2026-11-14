/**
 * 遊戲 3D 視圖 · 漫步小人模組
 * 點按鈕生成 Q 版程式化小人（大頭 + 短身 + 四肢），從出怪口沿敵人路徑
 * 走到基地：四肢前後擺動、身體上下輕晃、面朝行進方向，抵達終點縮小消失。
 * 純觀賞互動，與遊戲邏輯無關；幾何共享單例、材質按小人實例化。
 */

import * as THREE from 'three';

export interface WalkerOptions {
  toWorld: (col: number, row: number) => [number, number];
  /** 各路徑段 waypoints（生成時隨機挑一段走） */
  pathSegments: { col: number; row: number }[][];
  /** 地面高度（小人腳底貼地） */
  groundY: number;
  /** 同時存在上限（防爆） */
  maxCount?: number;
}

export interface Walkers3D {
  /** 生成一個小人；達上限時回傳 false */
  spawn: () => boolean;
  /** 目前存活數 */
  count: () => number;
  update: (nowMs: number, dtSec: number) => void;
  dispose: () => void;
}

// ===== 共享幾何（模組級單例；高細分消除稜角感） =====
const WG = {
  head: new THREE.SphereGeometry(0.085, 26, 20),
  body: new THREE.BoxGeometry(0.13, 0.16, 0.085),
  limb: new THREE.BoxGeometry(0.038, 0.14, 0.038),
  hat: new THREE.ConeGeometry(0.075, 0.1, 22),
  eye: new THREE.SphereGeometry(0.013, 10, 8),
};

// 衣服備選色（隨機挑）
const OUTFIT_COLORS = [0xef4444, 0x3b82f6, 0x22c55e, 0xf59e0b, 0xa855f7, 0x06b6d4, 0xf472b6, 0x84cc16];
const SKIN_COLOR = 0xf5c89d;

interface WalkerBody {
  group: THREE.Group;
  bodyParts: THREE.Group;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  mats: THREE.Material[];
}

/** 組裝一個 Q 版小人（高約 0.46；pivot 在腳底中心；正面朝 +x） */
function buildWalkerBody(outfit: number): WalkerBody {
  const group = new THREE.Group();
  const mats: THREE.Material[] = [];
  const mk = (color: number) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05 });
    mats.push(m);
    return m;
  };
  const outfitMat = mk(outfit);
  const skinMat = mk(SKIN_COLOR);
  const darkMat = mk(0x1f2430);

  const bodyParts = new THREE.Group();
  group.add(bodyParts);

  // 身體
  const body = new THREE.Mesh(WG.body, outfitMat);
  body.position.y = 0.22;
  body.castShadow = true;
  bodyParts.add(body);

  // 頭 + 帽子 + 雙眼（眼睛朝行進方向 +x）
  const head = new THREE.Mesh(WG.head, skinMat);
  head.position.y = 0.38;
  head.castShadow = true;
  bodyParts.add(head);
  const hat = new THREE.Mesh(WG.hat, outfitMat);
  hat.position.y = 0.47;
  bodyParts.add(hat);
  for (const dz of [-0.032, 0.032]) {
    const eye = new THREE.Mesh(WG.eye, darkMat);
    eye.position.set(0.072, 0.39, dz);
    bodyParts.add(eye);
  }

  // 四肢（pivot 在肩 / 髖，繞 Z 前後擺）
  const makeLimb = (mat: THREE.Material, x: number, y: number, z: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    const mesh = new THREE.Mesh(WG.limb, mat);
    mesh.position.y = -0.065;
    mesh.castShadow = true;
    pivot.add(mesh);
    bodyParts.add(pivot);
    return pivot;
  };
  const armL = makeLimb(skinMat, 0, 0.295, -0.085);
  const armR = makeLimb(skinMat, 0, 0.295, 0.085);
  const legL = makeLimb(darkMat, 0, 0.145, -0.04);
  const legR = makeLimb(darkMat, 0, 0.145, 0.04);

  return { group, bodyParts, armL, armR, legL, legR, mats };
}

/** 行走擺動：四肢反相前後擺 + 身體上下輕晃；intensity 0~1（站立時收回） */
function applyWalkSwing(b: WalkerBody, phaseT: number, intensity: number): void {
  const swing = Math.sin(phaseT) * intensity;
  b.legL.rotation.z = swing * 0.65;
  b.legR.rotation.z = -swing * 0.65;
  b.armL.rotation.z = -swing * 0.5;
  b.armR.rotation.z = swing * 0.5;
  b.bodyParts.position.y = Math.abs(Math.cos(phaseT)) * 0.022 * intensity;
}

interface Walker {
  body: WalkerBody;
  /** 折線（世界座標）與累計長度表 */
  line: THREE.Vector3[];
  lens: number[];
  total: number;
  /** 里程 */
  t: number;
  speed: number;
  /** 擺動相位（隨機錯開） */
  phase: number;
  /** 抵達終點後的消失進度（0=行走中） */
  vanish: number;
}

export function createWalkers3D(scene: THREE.Scene, opts: WalkerOptions): Walkers3D {
  const walkers: Walker[] = [];
  const maxCount = opts.maxCount ?? 12;
  const tmpDir = new THREE.Vector3();
  const tmpPos = new THREE.Vector3();

  /** 把一段 waypoints 轉為世界座標折線與長度表 */
  const buildLine = (seg: { col: number; row: number }[]) => {
    const line = seg.map((w) => {
      const [wx, wz] = opts.toWorld(w.col, w.row);
      return new THREE.Vector3(wx, opts.groundY, wz);
    });
    const lens: number[] = [0];
    for (let i = 1; i < line.length; i++) {
      lens.push(lens[i - 1] + line[i].distanceTo(line[i - 1]));
    }
    return { line, lens, total: lens[lens.length - 1] };
  };

  const spawn = (): boolean => {
    if (walkers.length >= maxCount) return false;
    const segs = opts.pathSegments.filter((s) => s && s.length >= 2);
    if (segs.length === 0) return false;
    const seg = segs[Math.floor(Math.random() * segs.length)];
    const { line, lens, total } = buildLine(seg);
    if (total <= 0) return false;

    const outfit = OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)];
    const body = buildWalkerBody(outfit);
    body.group.position.copy(line[0]);
    // 出生彈出動畫起點
    body.group.scale.setScalar(0.01);
    scene.add(body.group);

    walkers.push({
      body,
      line, lens, total,
      t: 0,
      speed: 1.05 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      vanish: 0,
    });
    return true;
  };

  /** 取里程 t 的位置寫入 out；回傳目前線段方向 */
  const sampleAt = (w: Walker, t: number, out: THREE.Vector3): THREE.Vector3 => {
    const { line, lens } = w;
    let i = 1;
    while (i < lens.length && lens[i] < t) i++;
    const i1 = Math.min(i, line.length - 1);
    const segLen = lens[Math.min(i, lens.length - 1)] - lens[i - 1] || 1;
    const k = Math.min(1, Math.max(0, (t - lens[i - 1]) / segLen));
    out.lerpVectors(line[i - 1], line[i1], k);
    return tmpDir.subVectors(line[i1], line[i - 1]);
  };

  const removeWalker = (w: Walker) => {
    scene.remove(w.body.group);
    for (const m of w.body.mats) m.dispose();
  };

  const update = (nowMs: number, dtSec: number) => {
    for (let i = walkers.length - 1; i >= 0; i--) {
      const w = walkers[i];
      const g = w.body.group;

      // 抵達終點 → 縮小旋轉消失
      if (w.vanish > 0) {
        w.vanish += dtSec * 2.2;
        const s = Math.max(0.01, 1 - w.vanish);
        g.scale.setScalar(s);
        g.rotation.y += dtSec * 9;
        if (w.vanish >= 1) {
          removeWalker(w);
          walkers.splice(i, 1);
        }
        continue;
      }

      w.t += w.speed * dtSec;
      if (w.t >= w.total) {
        w.vanish = 0.001;
        continue;
      }

      // 出生彈出（前 0.35s 長大）
      if (g.scale.x < 1) {
        g.scale.setScalar(Math.min(1, g.scale.x + dtSec * 3.5));
      }

      const dir = sampleAt(w, w.t, tmpPos);
      g.position.copy(tmpPos);

      // 面朝行進方向（模型正面為 +x → 旋轉 Y 對齊 dir）
      if (dir.lengthSq() > 1e-6) {
        g.rotation.y = Math.atan2(-dir.z, dir.x);
      }

      applyWalkSwing(w.body, nowMs * 0.012 * w.speed + w.phase, 1);
    }
  };

  const dispose = () => {
    for (const w of walkers) removeWalker(w);
    walkers.length = 0;
  };

  return { spawn, count: () => walkers.length, update, dispose };
}

// ============================================================
// 玩家可操控小人（自由方向移動 + 平滑轉身 + 跳躍；相機跟隨由呼叫端處理）
// ============================================================

export interface PlayerWalkerOptions {
  /** 出生點（世界座標） */
  spawnAt: { x: number; y: number; z: number };
  /** 可行走範圍（地圖邊界） */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export interface PlayerWalker {
  /** 設定移動方向（世界座標 XZ 平面向量；零向量 = 靜止） */
  setMoveVector: (mx: number, mz: number) => void;
  /** 跳躍（在地面時生效） */
  jump: () => void;
  /** 目前位置（世界座標，唯讀引用） */
  readonly position: THREE.Vector3;
  update: (nowMs: number, dtSec: number) => void;
  dispose: () => void;
}

const PLAYER_SPEED = 2.6;
const TURN_LERP = 12;
const JUMP_VELOCITY = 4.2;
const GRAVITY = -11;

/** 最短角差（-π~π） */
const angleDelta = (a: number, b: number): number => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

export function createPlayerWalker(scene: THREE.Scene, opts: PlayerWalkerOptions): PlayerWalker {
  // 玩家小人固定亮青色帽衣，與漫步小人區隔
  const body = buildWalkerBody(0x22d3ee);
  body.group.position.set(opts.spawnAt.x, opts.spawnAt.y, opts.spawnAt.z);
  body.group.scale.setScalar(0.01);
  scene.add(body.group);

  // 腳下玩家光環（標識 + 落點提示）
  const ringGeo = new THREE.TorusGeometry(0.26, 0.02, 8, 26);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(opts.spawnAt.x, opts.spawnAt.y + 0.015, opts.spawnAt.z);
  scene.add(ring);

  const groundY = opts.spawnAt.y;
  let heading = 0;
  let moveX = 0;
  let moveZ = 0;
  let walkPhase = 0;
  let vy = 0;
  let airborne = false;

  const setMoveVector = (mx: number, mz: number) => {
    const len = Math.hypot(mx, mz);
    if (len > 1e-6) {
      moveX = mx / len;
      moveZ = mz / len;
    } else {
      moveX = 0;
      moveZ = 0;
    }
  };

  const jump = () => {
    if (airborne) return;
    airborne = true;
    vy = JUMP_VELOCITY;
  };

  const update = (nowMs: number, dtSec: number) => {
    const g = body.group;
    // 出生彈出
    if (g.scale.x < 1) {
      g.scale.setScalar(Math.min(1, g.scale.x + dtSec * 3.5));
    }

    const moving = moveX !== 0 || moveZ !== 0;

    // 水平移動 + 邊界夾限
    if (moving) {
      g.position.x = Math.max(opts.bounds.minX, Math.min(opts.bounds.maxX, g.position.x + moveX * PLAYER_SPEED * dtSec));
      g.position.z = Math.max(opts.bounds.minZ, Math.min(opts.bounds.maxZ, g.position.z + moveZ * PLAYER_SPEED * dtSec));
      // 朝移動方向平滑轉身（最短角插值）
      const target = Math.atan2(-moveZ, moveX);
      heading += angleDelta(heading, target) * Math.min(1, TURN_LERP * dtSec);
    }
    g.rotation.y = heading;

    // 跳躍物理
    if (airborne) {
      vy += GRAVITY * dtSec;
      g.position.y += vy * dtSec;
      if (g.position.y <= groundY) {
        g.position.y = groundY;
        vy = 0;
        airborne = false;
      }
    }

    // 行走擺動（空中減弱、靜止收回）
    if (moving) walkPhase += dtSec * 11.5;
    applyWalkSwing(body, walkPhase, airborne ? 0.35 : moving ? 1 : 0);

    // 光環跟隨（停留地面高度）+ 呼吸
    ring.position.x = g.position.x;
    ring.position.z = g.position.z;
    ringMat.opacity = 0.4 + Math.sin(nowMs * 0.005) * 0.18;
    const ringScale = airborne ? 1.25 : 1;
    ring.scale.setScalar(ringScale);
  };

  const dispose = () => {
    scene.remove(body.group);
    scene.remove(ring);
    ringGeo.dispose();
    ringMat.dispose();
    for (const m of body.mats) m.dispose();
  };

  return {
    setMoveVector,
    jump,
    position: body.group.position,
    update,
    dispose,
  };
}
