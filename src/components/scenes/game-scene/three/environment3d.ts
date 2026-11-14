/**
 * 遊戲 3D 視圖 · 環境氛圍模組
 *  - 路徑流光：沿 waypoints 循環移動的發光點，指示敵人進攻方向
 *  - 地圖邊界發光框：地圖外緣雙層霓虹細線
 *  - 星空塵埃：外圍空中緩慢漂浮的光點（Points 單 draw call）
 *  - 信標光環：出怪口 / 基地底部的旋轉雙環地標
 */

import * as THREE from 'three';

interface EnvironmentOptions {
  cols: number;
  rows: number;
  toWorld: (col: number, row: number) => [number, number];
  /** 各路徑段 waypoints（多段地圖逐段傳入） */
  pathSegments: { col: number; row: number }[][];
  /** 出怪口與基地格 */
  beaconTiles: { kind: 'start' | 'end'; col: number; row: number }[];
}

interface Environment3D {
  update: (nowMs: number, dtSec: number) => void;
  setPathFlowVisible: (visible: boolean) => void;
  dispose: () => void;
}

const FLOW_PER_SEGMENT = 5;
const DUST_COUNT = 220;

export function createEnvironment3D(scene: THREE.Scene, opts: EnvironmentOptions): Environment3D {
  const group = new THREE.Group();
  scene.add(group);
  const disposables: { dispose: () => void }[] = [];

  // ===== 1) 地圖邊界發光框 =====
  const halfW = opts.cols / 2 + 0.35;
  const halfH = opts.rows / 2 + 0.35;
  const borderPts = [
    new THREE.Vector3(-halfW, 0.03, -halfH),
    new THREE.Vector3(halfW, 0.03, -halfH),
    new THREE.Vector3(halfW, 0.03, halfH),
    new THREE.Vector3(-halfW, 0.03, halfH),
    new THREE.Vector3(-halfW, 0.03, -halfH),
  ];
  const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPts);
  const borderMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
  const borderGlowMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.12 });
  const borderLine = new THREE.Line(borderGeo, borderMat);
  const borderGlow = new THREE.Line(borderGeo, borderGlowMat);
  borderGlow.scale.set(1.012, 1, 1.018);
  group.add(borderLine, borderGlow);
  disposables.push(borderGeo, borderMat, borderGlowMat);

  // 四角立柱光點（強化邊界感）
  const cornerGeo = new THREE.SphereGeometry(0.06, 8, 6);
  const cornerMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.8 });
  disposables.push(cornerGeo, cornerMat);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
    const dot = new THREE.Mesh(cornerGeo, cornerMat);
    dot.position.set(sx * halfW, 0.05, sz * halfH);
    group.add(dot);
  }

  // ===== 2) 路徑流光（沿 waypoints 循環移動） =====
  interface FlowDot {
    mesh: THREE.Mesh;
    /** 所屬路徑折線（世界座標點列） */
    line: THREE.Vector3[];
    /** 累計長度表 */
    lens: number[];
    total: number;
    /** 目前里程（0~total） */
    t: number;
    speed: number;
  }
  const flowDots: FlowDot[] = [];
  const flowGeo = new THREE.SphereGeometry(0.07, 8, 6);
  const flowMat = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  disposables.push(flowGeo, flowMat);

  for (const seg of opts.pathSegments) {
    if (!seg || seg.length < 2) continue;
    const line = seg.map((w) => {
      const [wx, wz] = opts.toWorld(w.col, w.row);
      return new THREE.Vector3(wx, 0.14, wz);
    });
    // 折線累計長度
    const lens: number[] = [0];
    for (let i = 1; i < line.length; i++) {
      lens.push(lens[i - 1] + line[i].distanceTo(line[i - 1]));
    }
    const total = lens[lens.length - 1];
    if (total <= 0) continue;

    for (let i = 0; i < FLOW_PER_SEGMENT; i++) {
      const mesh = new THREE.Mesh(flowGeo, flowMat);
      group.add(mesh);
      flowDots.push({
        mesh,
        line,
        lens,
        total,
        t: (i / FLOW_PER_SEGMENT) * total,
        speed: 1.6,
      });
    }
  }

  /** 依里程取折線上的點（寫入 mesh.position） */
  const sampleAt = (d: FlowDot) => {
    const { line, lens, total } = d;
    const t = d.t % total;
    let i = 1;
    while (i < lens.length && lens[i] < t) i++;
    const segStart = line[i - 1];
    const segEnd = line[Math.min(i, line.length - 1)];
    const segLen = lens[Math.min(i, lens.length - 1)] - lens[i - 1] || 1;
    const k = (t - lens[i - 1]) / segLen;
    d.mesh.position.lerpVectors(segStart, segEnd, Math.min(1, Math.max(0, k)));
  };

  // ===== 3) 星空塵埃（外圍漂浮光點） =====
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustPhases = new Float32Array(DUST_COUNT);
  const ringInner = Math.max(halfW, halfH) + 1.5;
  for (let i = 0; i < DUST_COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = ringInner + Math.random() * 14;
    dustPositions[i * 3] = Math.cos(a) * r;
    dustPositions[i * 3 + 1] = 0.4 + Math.random() * 6.5;
    dustPositions[i * 3 + 2] = Math.sin(a) * r;
    dustPhases[i] = Math.random() * Math.PI * 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x93b4d8,
    size: 0.07,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  group.add(dust);
  disposables.push(dustGeo, dustMat);

  // ===== 4) 信標旋轉光環（出怪口綠 / 基地紅，雙環反向旋轉） =====
  const ringGeoA = new THREE.TorusGeometry(0.42, 0.018, 8, 36);
  const ringGeoB = new THREE.TorusGeometry(0.3, 0.014, 8, 30);
  disposables.push(ringGeoA, ringGeoB);
  const beaconRings: { mesh: THREE.Mesh; dir: number }[] = [];
  for (const b of opts.beaconTiles) {
    const color = b.kind === 'start' ? 0x34d399 : 0xef4444;
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(mat);
    const [wx, wz] = opts.toWorld(b.col, b.row);
    const ringA = new THREE.Mesh(ringGeoA, mat);
    ringA.rotation.x = Math.PI / 2;
    ringA.position.set(wx, 0.15, wz);
    const ringB = new THREE.Mesh(ringGeoB, mat);
    ringB.rotation.x = Math.PI / 2;
    ringB.position.set(wx, 0.22, wz);
    group.add(ringA, ringB);
    beaconRings.push({ mesh: ringA, dir: 1 }, { mesh: ringB, dir: -1 });
  }

  // ===== 更新 =====
  const update = (nowMs: number, dtSec: number) => {
    // 路徑流光前進 + 尾端淡入淡出
    for (const d of flowDots) {
      d.t += d.speed * dtSec;
      sampleAt(d);
      const cycle = (d.t % d.total) / d.total;
      const fade = cycle < 0.06 ? cycle / 0.06 : cycle > 0.94 ? (1 - cycle) / 0.06 : 1;
      d.mesh.scale.setScalar(0.7 + fade * 0.5);
    }
    // 塵埃整體緩轉 + 呼吸
    dust.rotation.y = nowMs * 0.000012;
    (dust.material as THREE.PointsMaterial).opacity = 0.38 + Math.sin(nowMs * 0.0008) * 0.12;
    // 信標環旋轉
    for (const r of beaconRings) {
      r.mesh.rotation.z += r.dir * dtSec * 0.9;
    }
    // 邊界框呼吸
    borderMat.opacity = 0.32 + Math.sin(nowMs * 0.0015) * 0.1;
  };

  const setPathFlowVisible = (visible: boolean) => {
    for (const d of flowDots) d.mesh.visible = visible;
  };

  const dispose = () => {
    scene.remove(group);
    for (const d of disposables) d.dispose();
  };

  return { update, setPathFlowVisible, dispose };
}
