/**
 * 遊戲 3D 視圖 · 特效管理器
 *
 * 直接消費 gameStore 既有特效資料（與 2D 渲染共用同一事實源）：
 *  - deathAnimations：死亡碎片（按 elapsed 純函式運算拋物線，px 速度 ÷60 換算為格單位）
 *  - damageTexts：傷害/金錢數字（CanvasTexture billboard，向上飄+淡出）
 *  - upgradeAnimations / sellAnimations：升級金環擴散 / 出售紅環收縮
 */

import * as THREE from 'three';
import type { DeathAnimation, DamageText } from '@/types/game';
import { fxFade, fxProgress } from '@/data/fxProgress';

// 與 2D GameCanvas 同步的動畫時長
export const UPGRADE_FX_DURATION = 1500;
export const SELL_FX_DURATION = 600;

type UpgradeAnim = { id: string; gridPos: { col: number; row: number }; towerColor: string; startTime: number; isMaxLevel?: boolean };
type SellAnim = { id: string; gridPos: { col: number; row: number }; towerColor: string; startTime: number };

/** 2D 特效以 60px/格 為基準的速度換算比 */
const PX_PER_TILE = 60;

interface DeathFx {
  group: THREE.Group;
  anim: DeathAnimation;
  /** 每個碎片的 3D 隨機補充參數（Y 初速與自轉軸） */
  shardSeeds: { vy0: number; rotAxis: THREE.Vector3; rotSpeed: number }[];
}

interface Effects3D {
  /** 每幀同步（toWorld 為格→世界座標轉換函式） */
  sync: (
    deathAnimations: DeathAnimation[],
    toWorld: (col: number, row: number) => [number, number],
    now: number,
  ) => void;
  /** 傷害/金錢數字同步 */
  syncDamageTexts: (
    texts: DamageText[],
    toWorld: (col: number, row: number) => [number, number],
    now: number,
  ) => void;
  /** 升級/出售環特效同步 */
  syncTowerFx: (
    upgrades: UpgradeAnim[],
    sells: SellAnim[],
    toWorld: (col: number, row: number) => [number, number],
    now: number,
  ) => void;
  dispose: () => void;
}

// 為傷害數字產生 canvas 紋理（一次性，掛在 sprite 上直到過期）
function makeTextSprite(text: DamageText): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 80;
  const ctx = canvas.getContext('2d')!;
  const fontSize = text.isCrit ? 52 : text.isMoney ? 40 : 42;
  ctx.font = `900 ${fontSize}px "Noto Sans TC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = `${text.prefix || ''}${text.value}${text.suffix || ''}`;
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.strokeText(label, 96, 40);
  ctx.fillStyle = text.color;
  ctx.fillText(label, 96, 40);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  const scale = text.isCrit ? 1.15 : 0.9;
  sprite.scale.set(scale * 1.6, scale * 0.66, 1);
  return sprite;
}

export function createEffects3D(scene: THREE.Scene): Effects3D {
  // ===== 死亡碎片池 =====
  const deathFxMap = new Map<string, DeathFx>();
  const shardGeo = new THREE.BoxGeometry(0.12, 0.05, 0.12);

  // ===== 傷害數字池 =====
  const textSprites = new Map<string, THREE.Sprite>();

  // ===== 升級/出售環池 =====
  const ringFxMap = new Map<string, THREE.Mesh>();
  const ringGeo = new THREE.RingGeometry(0.86, 1, 48);

  const syncDeaths = (
    deaths: DeathAnimation[],
    toWorld: (c: number, r: number) => [number, number],
    now: number,
  ) => {
    const alive = new Set<string>();
    for (const d of deaths) {
      alive.add(d.id);
      let fx = deathFxMap.get(d.id);
      if (!fx) {
        const group = new THREE.Group();
        const [wx, wz] = toWorld(d.x, d.y);
        group.position.set(wx, 0, wz);
        const shardSeeds = d.shards.map(() => ({
          vy0: 1.4 + Math.random() * 1.8,
          rotAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
          rotSpeed: (Math.random() - 0.5) * 8,
        }));
        for (const shard of d.shards) {
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(shard.color),
            transparent: true,
            roughness: 0.6,
            emissive: new THREE.Color(shard.color),
            emissiveIntensity: 0.25,
          });
          const mesh = new THREE.Mesh(shardGeo, mat);
          mesh.scale.setScalar(shard.sizeMul * Math.max(0.6, d.size / 50));
          group.add(mesh);
        }
        scene.add(group);
        fx = { group, anim: d, shardSeeds };
        deathFxMap.set(d.id, fx);
      }

      // 按 elapsed 純函式計算每個碎片的位置與淡出（進度語意與 2D 共用 data/fxProgress）
      const deathProgress = fxProgress(d.startTime, d.duration, now);
      const t = deathProgress * (d.duration / 1000);
      const fade = fxFade(d.startTime, d.duration, now);
      for (let i = 0; i < fx.group.children.length; i++) {
        const mesh = fx.group.children[i] as THREE.Mesh;
        const shard = d.shards[i];
        const seed = fx.shardSeeds[i];
        if (!shard || !seed) continue;
        // 水平面散開（2D px/s ÷ 60 → 格/s）
        const dx = (shard.vx / PX_PER_TILE) * t;
        const dz = (shard.vy / PX_PER_TILE) * t * 0.6;
        // 垂直上拋 + 重力，落地即停
        const y = Math.max(0.04, seed.vy0 * t - 4.5 * t * t + 0.3);
        mesh.position.set(dx, y, dz);
        mesh.rotation.set(
          seed.rotAxis.x * seed.rotSpeed * t,
          seed.rotAxis.y * seed.rotSpeed * t,
          seed.rotAxis.z * seed.rotSpeed * t,
        );
        (mesh.material as THREE.MeshStandardMaterial).opacity = fade;
      }
    }
    for (const [id, fx] of deathFxMap) {
      if (!alive.has(id)) {
        scene.remove(fx.group);
        for (const child of fx.group.children) {
          ((child as THREE.Mesh).material as THREE.Material).dispose();
        }
        deathFxMap.delete(id);
      }
    }
  };

  // ===== 傷害數字同步 =====
  const syncDamageTexts: Effects3D['syncDamageTexts'] = (texts, toWorld, now) => {
    const alive = new Set<string>();
    for (const t of texts) {
      alive.add(t.id);
      let sprite = textSprites.get(t.id);
      if (!sprite) {
        sprite = makeTextSprite(t);
        scene.add(sprite);
        textSprites.set(t.id, sprite);
      }
      const elapsed = now - t.startTime;
      const progress = fxProgress(t.startTime, t.duration, now);
      // store 的 y 每幀向上飄（格座標 -0.001/ms），這裡補償回初始位置改用世界高度上升
      const z0 = t.y + 0.001 * elapsed;
      const [wx, wz] = toWorld(t.x, z0);
      sprite.position.set(wx, 1.0 + progress * 0.7, wz);
      (sprite.material as THREE.SpriteMaterial).opacity = 1 - progress * progress;
    }
    for (const [id, sprite] of textSprites) {
      if (!alive.has(id)) {
        scene.remove(sprite);
        (sprite.material as THREE.SpriteMaterial).map?.dispose();
        sprite.material.dispose();
        textSprites.delete(id);
      }
    }
  };

  // ===== 升級/出售環同步 =====
  const syncTowerFx: Effects3D['syncTowerFx'] = (upgrades, sells, toWorld, now) => {
    const alive = new Set<string>();

    const syncRing = (
      id: string,
      gridPos: { col: number; row: number },
      color: string,
      progress: number,
      grow: boolean,
      maxScale: number,
    ) => {
      alive.add(id);
      let mesh = ringFxMap.get(id);
      if (!mesh) {
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        mesh = new THREE.Mesh(ringGeo, mat);
        mesh.rotation.x = -Math.PI / 2;
        const [wx, wz] = toWorld(gridPos.col, gridPos.row);
        mesh.position.set(wx, 0.18, wz);
        scene.add(mesh);
        ringFxMap.set(id, mesh);
      }
      const s = grow ? 0.3 + progress * maxScale : maxScale * (1 - progress) + 0.05;
      mesh.scale.setScalar(Math.max(0.001, s));
      (mesh.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - progress);
    };

    for (const u of upgrades) {
      const progress = fxProgress(u.startTime, UPGRADE_FX_DURATION, now);
      syncRing(u.id, u.gridPos, u.towerColor || '#f59e0b', progress, true, u.isMaxLevel ? 2.6 : 1.8);
    }
    for (const s of sells) {
      const progress = fxProgress(s.startTime, SELL_FX_DURATION, now);
      syncRing(s.id, s.gridPos, '#ef4444', progress, false, 1.4);
    }

    for (const [id, mesh] of ringFxMap) {
      if (!alive.has(id)) {
        scene.remove(mesh);
        (mesh.material as THREE.Material).dispose();
        ringFxMap.delete(id);
      }
    }
  };

  return {
    sync(deathAnimations, toWorld, now) {
      syncDeaths(deathAnimations, toWorld, now);
    },
    syncDamageTexts,
    syncTowerFx,
    dispose() {
      for (const [, fx] of deathFxMap) {
        scene.remove(fx.group);
        for (const child of fx.group.children) {
          ((child as THREE.Mesh).material as THREE.Material).dispose();
        }
      }
      deathFxMap.clear();
      shardGeo.dispose();
      for (const [, sprite] of textSprites) {
        scene.remove(sprite);
        (sprite.material as THREE.SpriteMaterial).map?.dispose();
        sprite.material.dispose();
      }
      textSprites.clear();
      for (const [, mesh] of ringFxMap) {
        scene.remove(mesh);
        (mesh.material as THREE.Material).dispose();
      }
      ringFxMap.clear();
      ringGeo.dispose();
    },
  };
}
