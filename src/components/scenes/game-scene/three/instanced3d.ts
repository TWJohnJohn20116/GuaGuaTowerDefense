/**
 * 遊戲 3D 視圖 · InstancedMesh 實例化渲染池（階段 4）
 *
 * 把「每實體一個 Mesh + 獨立材質」改為「單一 InstancedMesh + per-instance 矩陣/顏色」：
 *  - 敵人本體：1 draw call（原本 N 個）
 *  - 敵人血條：2 draw call（bg/fg 各一，billboard 矩陣朝向相機；左錨點縮放）
 *  - 投射物：1 draw call
 *  - 命中粒子：1 draw call（AdditiveBlending，顏色×alpha 等效淡出）
 *
 * 無盡模式 100+ 敵人時 draw call 從 ~400 降至 ~5。
 */

import * as THREE from 'three';
import type { Enemy, Projectile, ImpactParticle } from '@/types/game';
import { ENEMY_DATA } from '@/data/gameData';
import { getEnemyStealthFade, getEnemyPhaseFade } from '@/store/gameStoreUtils';

const MAX_ENEMIES = 512;
const MAX_PROJECTILES = 1024;
const MAX_PARTICLES = 1024;

const HP_BAR_W = 0.66;
const HP_BAR_H = 0.07;

/** 血量顏色：綠 → 黃 → 紅 */
const hpColorOf = (ratio: number): number => {
  if (ratio > 0.55) return 0x4ade80;
  if (ratio > 0.25) return 0xfacc15;
  return 0xef4444;
};

const ZERO_SCALE = new THREE.Matrix4().makeScale(0, 0, 0);

/** 安全解析 CSS 顏色 */
const safeColor = (c: string | undefined, fallback = 0xffffff): THREE.Color => {
  try {
    return new THREE.Color(c || fallback);
  } catch {
    return new THREE.Color(fallback);
  }
};

// ===================== 敵人實例池（本體 + 血條） =====================

export interface EnemyInstances {
  sync: (
    enemies: Enemy[],
    toWorld: (c: number, r: number) => [number, number],
    cameraQuat: THREE.Quaternion,
    showHealthBars?: boolean,
  ) => void;
  /** 敵人本體 InstancedMesh（供 raycaster 拾取，instanceId 即 enemies 陣列索引） */
  bodyMesh: THREE.InstancedMesh;
  dispose: () => void;
}

// 狀態效果色調（優先級由高到低，取第一個命中者與本體色混合）
const STATUS_TINTS: { type: string; color: number; mix: number }[] = [
  { type: 'freeze', color: 0x93c5fd, mix: 0.65 },
  { type: 'frostbite', color: 0xbae6fd, mix: 0.35 },
  { type: 'petrify', color: 0x9ca3af, mix: 0.7 },
  { type: 'stun', color: 0xfef9c3, mix: 0.5 },
  { type: 'berserk', color: 0xff3232, mix: 0.5 },
  { type: 'burn', color: 0xfb923c, mix: 0.45 },
  { type: 'poison', color: 0x4ade80, mix: 0.45 },
  { type: 'slow', color: 0x7dd3fc, mix: 0.35 },
];

/** 護盾色（護盾尚存時往藍色調混合） */
const SHIELD_TINT = 0x3b82f6;

export function createEnemyInstances(scene: THREE.Scene): EnemyInstances {
  const bodyGeo = new THREE.SphereGeometry(0.32, 16, 12);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    emissive: 0xffffff,
    emissiveIntensity: 0.12,
  });
  const body = new THREE.InstancedMesh(bodyGeo, bodyMat, MAX_ENEMIES);
  body.castShadow = true;
  body.frustumCulled = false;
  body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(body);

  // 血條背景（居中錨點）
  const bgGeo = new THREE.PlaneGeometry(HP_BAR_W, HP_BAR_H);
  const bgMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const hpBg = new THREE.InstancedMesh(bgGeo, bgMat, MAX_ENEMIES);
  hpBg.frustumCulled = false;
  hpBg.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(hpBg);

  // 血條前景（幾何預偏移 → 左錨點，scale.x 從左往右伸展）
  const fgGeo = new THREE.PlaneGeometry(HP_BAR_W, HP_BAR_H * 0.8);
  fgGeo.translate(HP_BAR_W / 2, 0, 0);
  const fgMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
  const hpFg = new THREE.InstancedMesh(fgGeo, fgMat, MAX_ENEMIES);
  hpFg.frustumCulled = false;
  hpFg.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(hpFg);

  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();
  const tintColor = new THREE.Color();

  const sync: EnemyInstances['sync'] = (enemies, toWorld, cameraQuat, showHealthBars = true) => {
    const n = Math.min(enemies.length, MAX_ENEMIES);

    const nowMs = Date.now();
    for (let i = 0; i < n; i++) {
      const e = enemies[i];
      const [wx, wz] = toWorld(e.x, e.y);
      // 隱身/相位敵人：本體縮小 + 顏色壓暗（InstancedMesh 無逐實例透明度，以縮放/調色模擬幽影）
      const stealthFade = getEnemyStealthFade(e, nowMs);
      const phaseFade = getEnemyPhaseFade(e, nowMs);
      const ghostFade = Math.max(stealthFade, phaseFade);
      const s = Math.max(0.5, (e.size || 50) / 50) * (1 - ghostFade * 0.5);
      const hpRatio = Math.max(0, Math.min(1, e.health / e.maxHealth));

      // --- 本體 ---
      dummy.position.set(wx, 0.32 * s + 0.06, wz);
      dummy.quaternion.identity();
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);
      // 血量越低顏色越暗（同時影響 diffuse 與整體觀感）
      tmpColor.copy(safeColor(ENEMY_DATA[e.type]?.color)).multiplyScalar((0.55 + hpRatio * 0.45) * (1 - ghostFade * 0.62));
      // 相位：往藍白色偏移，與隱身的純壓暗作出區隔
      if (phaseFade > 0) {
        tmpColor.lerp(tintColor.setHex(0x93c5fd), phaseFade * 0.5);
      }
      // 護盾尚存：往藍色調混合，提示需先破盾
      if ((e.shield ?? 0) > 0 && e.maxShield) {
        tmpColor.lerp(tintColor.setHex(SHIELD_TINT), 0.35 * Math.min(1, (e.shield ?? 0) / e.maxShield));
      }
      // 狀態效果色調：凍結偏藍、狂暴偏紅、燃燒偏橙、中毒偏綠…（取最高優先級）
      if (e.effects.length > 0) {
        for (const tint of STATUS_TINTS) {
          if (e.effects.some((ef) => ef.type === tint.type)) {
            tmpColor.lerp(tintColor.setHex(tint.color), tint.mix);
            break;
          }
        }
      }
      body.setColorAt(i, tmpColor);

      // --- 血條（滿血或設定關閉時以零縮放隱藏）---
      if (showHealthBars && hpRatio < 0.999) {
        const barY = 0.32 * s + 0.28;
        // bg：billboard 居中
        dummy.position.set(wx, barY, 0 + wz);
        dummy.quaternion.copy(cameraQuat);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        hpBg.setMatrixAt(i, dummy.matrix);

        // fg：沿自身（已朝相機）X 軸左移半寬 → 左錨點
        dummy.position.set(wx, barY, wz);
        dummy.quaternion.copy(cameraQuat);
        dummy.scale.set(Math.max(0.001, hpRatio), 1, 1);
        dummy.translateX(-HP_BAR_W / 2);
        dummy.translateZ(0.01);
        dummy.updateMatrix();
        hpFg.setMatrixAt(i, dummy.matrix);
        hpFg.setColorAt(i, tmpColor.setHex(hpColorOf(hpRatio)));
      } else {
        hpBg.setMatrixAt(i, ZERO_SCALE);
        hpFg.setMatrixAt(i, ZERO_SCALE);
      }
    }

    body.count = n;
    hpBg.count = n;
    hpFg.count = n;
    body.instanceMatrix.needsUpdate = true;
    hpBg.instanceMatrix.needsUpdate = true;
    hpFg.instanceMatrix.needsUpdate = true;
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
    if (hpFg.instanceColor) hpFg.instanceColor.needsUpdate = true;
  };

  const dispose = () => {
    for (const m of [body, hpBg, hpFg]) {
      scene.remove(m);
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
      m.dispose();
    }
  };

  return { sync, bodyMesh: body, dispose };
}

// ===================== 投射物實例池 =====================

export interface ProjectileInstances {
  sync: (projectiles: Projectile[], toWorld: (c: number, r: number) => [number, number]) => void;
  dispose: () => void;
}

export function createProjectileInstances(scene: THREE.Scene): ProjectileInstances {
  const geo = new THREE.SphereGeometry(0.09, 8, 6);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mesh = new THREE.InstancedMesh(geo, mat, MAX_PROJECTILES);
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();

  const sync: ProjectileInstances['sync'] = (projectiles, toWorld) => {
    const n = Math.min(projectiles.length, MAX_PROJECTILES);
    for (let i = 0; i < n; i++) {
      const p = projectiles[i];
      const [wx, wz] = toWorld(p.x, p.y);
      dummy.position.set(wx, 0.55, wz);
      dummy.quaternion.identity();
      // 投射物大小：size(px) → 約略比例
      dummy.scale.setScalar(Math.max(0.6, (p.size || 5) / 6));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, tmpColor.copy(safeColor(p.color)));
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  const dispose = () => {
    scene.remove(mesh);
    geo.dispose();
    mat.dispose();
    mesh.dispose();
  };

  return { sync, dispose };
}

// ===================== 命中粒子實例池 =====================

export interface ParticleInstances {
  sync: (
    particles: ImpactParticle[],
    toWorld: (c: number, r: number) => [number, number],
    cameraQuat: THREE.Quaternion,
  ) => void;
  dispose: () => void;
}

export function createParticleInstances(scene: THREE.Scene): ParticleInstances {
  const geo = new THREE.PlaneGeometry(1, 1);
  // 加色混合：顏色乘 alpha 變暗 = 視覺上淡出，免 per-instance opacity
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, MAX_PARTICLES);
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();

  const sync: ParticleInstances['sync'] = (particles, toWorld, cameraQuat) => {
    const n = Math.min(particles.length, MAX_PARTICLES);
    for (let i = 0; i < n; i++) {
      const p = particles[i];
      const [wx, wz] = toWorld(p.x, p.y);
      const s = 0.06 + (p.size / 60) * 0.5;
      dummy.position.set(wx, 0.45, wz);
      dummy.quaternion.copy(cameraQuat);  // billboard
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const a = Math.max(0, Math.min(1, p.alpha));
      mesh.setColorAt(i, tmpColor.copy(safeColor(p.color)).multiplyScalar(a));
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  const dispose = () => {
    scene.remove(mesh);
    geo.dispose();
    mat.dispose();
    mesh.dispose();
  };

  return { sync, dispose };
}
