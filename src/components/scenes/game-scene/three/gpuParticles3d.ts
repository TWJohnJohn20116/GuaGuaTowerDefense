/**
 * 遊戲 3D 視圖 · GPU 粒子系統
 *
 * 使用 InstancedMesh 實現高效粒子渲染：
 *  - 所有粒子共用一個 draw call（InstancedMesh）
 *  - 每幀在 JS 端更新 instance matrix（位置/大小）與 instance color
 *  - 支援多種預設效果：爆炸、火花、火焰、冰霜、雷電
 *
 * 粒子總上限依設定 particleDensity 決定（low=512, medium=1024, high=2048）
 */

import * as THREE from 'three';

// ===== 粒子預設 =====

type ParticlePreset =
  | 'deathBurst'     // 死亡爆炸：球形噴射 + 重力
  | 'hitSpark'       // 命中火花：小範圍噴射
  | 'flameBurst'     // 火焰塔命中：暖色擴散
  | 'iceShard'       // 冰凍塔命中：向上飛散
  | 'lightingSpark'  // 雷電塔命中：隨機跳動
  | 'meteorImpact'   // 隕石落地：大範圍火焰
  | 'upgradeSparkle'; // 升級：金色上升

interface PresetConfig {
  count: number;              // 每次噴發粒子數
  speed: number;              // 初速度
  speedVariance: number;      // 初速度隨機量
  life: number;               // 壽命 (秒)
  lifeVariance: number;       // 壽命隨機量
  gravity: number;            // 重力 (負=向上)
  size: number;               // 基礎大小
  sizeDecay: boolean;         // 是否隨壽命縮小
  spread: 'sphere' | 'cone'; // 噴射形狀
  coneAngle?: number;         // cone 半角 (rad)
}

const PRESETS: Record<ParticlePreset, PresetConfig> = {
  deathBurst: {
    count: 36, speed: 3.5, speedVariance: 1.5, life: 0.65, lifeVariance: 0.2,
    gravity: 6, size: 0.06, sizeDecay: true, spread: 'sphere',
  },
  hitSpark: {
    count: 10, speed: 2.5, speedVariance: 1.0, life: 0.3, lifeVariance: 0.1,
    gravity: 3, size: 0.04, sizeDecay: true, spread: 'sphere',
  },
  flameBurst: {
    count: 14, speed: 1.8, speedVariance: 0.8, life: 0.5, lifeVariance: 0.15,
    gravity: -0.5, size: 0.07, sizeDecay: true, spread: 'cone', coneAngle: Math.PI / 4,
  },
  iceShard: {
    count: 12, speed: 2.2, speedVariance: 0.8, life: 0.6, lifeVariance: 0.15,
    gravity: 4, size: 0.05, sizeDecay: false, spread: 'cone', coneAngle: Math.PI / 3,
  },
  lightingSpark: {
    count: 10, speed: 4.0, speedVariance: 2.0, life: 0.2, lifeVariance: 0.08,
    gravity: 0, size: 0.035, sizeDecay: true, spread: 'sphere',
  },
  meteorImpact: {
    count: 40, speed: 4.0, speedVariance: 2.0, life: 0.8, lifeVariance: 0.3,
    gravity: 5, size: 0.08, sizeDecay: true, spread: 'sphere',
  },
  upgradeSparkle: {
    count: 18, speed: 1.2, speedVariance: 0.5, life: 0.8, lifeVariance: 0.2,
    gravity: -1.5, size: 0.04, sizeDecay: true, spread: 'cone', coneAngle: Math.PI / 6,
  },
};

/** 各預設的預設顏色 */
const PRESET_COLORS: Record<ParticlePreset, number> = {
  deathBurst: 0xff6b35,
  hitSpark: 0xfef3c7,
  flameBurst: 0xfb923c,
  iceShard: 0x93c5fd,
  lightingSpark: 0xfde047,
  meteorImpact: 0xff4500,
  upgradeSparkle: 0xfbbf24,
};

// ===== 粒子實例 =====

interface Particle {
  alive: boolean;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  gravity: number;
  life: number;      // 剩餘壽命
  maxLife: number;    // 初始壽命
  baseSize: number;
  sizeDecay: boolean;
  color: THREE.Color;
}

const DENSITY_LIMITS: Record<string, number> = {
  low: 512,
  medium: 1024,
  high: 2048,
};

interface GpuParticleSystem {
  /** 在指定位置噴發粒子 */
  burst(x: number, y: number, z: number, preset: ParticlePreset, color?: number): void;
  /** 每幀更新 */
  update(dt: number): void;
  /** 動態調整粒子上限 */
  setDensity(density: 'low' | 'medium' | 'high'): void;
  dispose(): void;
}

export function createGpuParticleSystem(scene: THREE.Scene, initialDensity: 'low' | 'medium' | 'high' = 'medium'): GpuParticleSystem {
  let maxParticles = DENSITY_LIMITS[initialDensity] || 1024;

  // 粒子幾何：小正方形（billboard 風格，但用 InstancedMesh 可帶 emissive）
  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  let mesh = new THREE.InstancedMesh(geo, mat, maxParticles);
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const particles: Particle[] = [];
  for (let i = 0; i < maxParticles; i++) {
    particles.push({
      alive: false, x: 0, y: -100, z: 0,
      vx: 0, vy: 0, vz: 0, gravity: 0,
      life: 0, maxLife: 1, baseSize: 0.05, sizeDecay: true,
      color: new THREE.Color(0xffffff),
    });
  }

  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();
  let cameraQuat: THREE.Quaternion | null = null;

  // 尋找空閒粒子槽
  let nextSearch = 0;
  const findFree = (): number => {
    for (let i = 0; i < maxParticles; i++) {
      const idx = (nextSearch + i) % maxParticles;
      if (!particles[idx].alive) {
        nextSearch = (idx + 1) % maxParticles;
        return idx;
      }
    }
    // 全滿時覆蓋最老的（壽命最短的）
    let oldest = 0;
    let minLife = Infinity;
    for (let i = 0; i < maxParticles; i++) {
      if (particles[i].life < minLife) {
        minLife = particles[i].life;
        oldest = i;
      }
    }
    return oldest;
  };

  const randomDir = (spread: 'sphere' | 'cone', coneAngle?: number): [number, number, number] => {
    if (spread === 'sphere') {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      return [
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
      ];
    }
    // cone: 向上的錐體
    const halfAngle = coneAngle ?? Math.PI / 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * halfAngle;
    return [
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    ];
  };

  const burst: GpuParticleSystem['burst'] = (x, y, z, preset, color) => {
    const cfg = PRESETS[preset];
    const baseColor = color ?? PRESET_COLORS[preset];
    const count = cfg.count;

    for (let i = 0; i < count; i++) {
      const idx = findFree();
      const p = particles[idx];
      p.alive = true;
      p.x = x;
      p.y = y;
      p.z = z;
      const spd = cfg.speed + (Math.random() - 0.5) * 2 * cfg.speedVariance;
      const [dx, dy, dz] = randomDir(cfg.spread, cfg.coneAngle);
      p.vx = dx * spd;
      p.vy = dy * spd;
      p.vz = dz * spd;
      p.gravity = cfg.gravity;
      p.maxLife = cfg.life + (Math.random() - 0.5) * 2 * cfg.lifeVariance;
      p.life = p.maxLife;
      p.baseSize = cfg.size * (0.7 + Math.random() * 0.6);
      p.sizeDecay = cfg.sizeDecay;
      // 輕微色彩變化
      const hsl = { h: 0, s: 0, l: 0 };
      p.color.setHex(baseColor);
      p.color.getHSL(hsl);
      hsl.l = Math.min(1, hsl.l + (Math.random() - 0.5) * 0.15);
      p.color.setHSL(hsl.h, hsl.s, hsl.l);
    }
  };

  // 隱藏矩陣
  const ZERO_MAT = new THREE.Matrix4().makeScale(0, 0, 0);

  const update: GpuParticleSystem['update'] = (dt) => {
    // 嘗試從場景中取得相機四元數（用於 billboard）
    // 粒子面朝相機
    const cam = scene.getObjectByProperty('type', 'PerspectiveCamera') as THREE.PerspectiveCamera | undefined;
    if (cam) cameraQuat = cam.quaternion;

    let visibleCount = 0;

    for (let i = 0; i < maxParticles; i++) {
      const p = particles[i];
      if (!p.alive) {
        mesh.setMatrixAt(i, ZERO_MAT);
        continue;
      }

      p.life -= dt;
      if (p.life <= 0) {
        p.alive = false;
        mesh.setMatrixAt(i, ZERO_MAT);
        continue;
      }

      // 物理更新
      p.vy -= p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      // 大小 & alpha (透過顏色亮度模擬)
      const lifeRatio = p.life / p.maxLife;
      const size = p.sizeDecay ? p.baseSize * (0.3 + 0.7 * lifeRatio) : p.baseSize;

      dummy.position.set(p.x, Math.max(0.02, p.y), p.z);
      if (cameraQuat) dummy.quaternion.copy(cameraQuat);
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // 顏色隨壽命暗淡（模擬 alpha 衰減）
      tmpColor.copy(p.color).multiplyScalar(lifeRatio * lifeRatio);
      mesh.setColorAt(i, tmpColor);

      visibleCount++;
    }

    mesh.count = maxParticles;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  const setDensity: GpuParticleSystem['setDensity'] = (density) => {
    const newMax = DENSITY_LIMITS[density] || 1024;
    if (newMax === maxParticles) return;

    // 需要重建 InstancedMesh
    scene.remove(mesh);
    mesh.dispose();

    maxParticles = newMax;
    mesh = new THREE.InstancedMesh(geo, mat, maxParticles);
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);

    // 重置粒子池
    particles.length = 0;
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        alive: false, x: 0, y: -100, z: 0,
        vx: 0, vy: 0, vz: 0, gravity: 0,
        life: 0, maxLife: 1, baseSize: 0.05, sizeDecay: true,
        color: new THREE.Color(0xffffff),
      });
    }
    nextSearch = 0;
  };

  const dispose = () => {
    scene.remove(mesh);
    mesh.dispose();
    geo.dispose();
    mat.dispose();
  };

  return { burst, update, setDensity, dispose };
}
