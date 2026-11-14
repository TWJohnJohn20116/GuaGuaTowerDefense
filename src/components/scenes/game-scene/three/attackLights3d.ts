/**
 * 遊戲 3D 視圖 · 攻擊閃光系統
 *
 * 塔開火時在砲口位置產生短暫 PointLight 閃光，
 * 搭配 Bloom 後處理能產生顯眼的戰鬥光效。
 *
 * 使用固定大小的 PointLight 池（預設 8 盞），避免逐幀建立/銷毀。
 * 閒置的光源 intensity=0 且移至場景外，不消耗 GPU 光照計算。
 */

import * as THREE from 'three';
import type { TowerType } from '@/types/game';

/** 每種塔類型的攻擊閃光色 */
const ATTACK_FLASH_COLORS: Partial<Record<TowerType, number>> = {
  basic:     0xf5e6c8,
  sniper:    0xfef3c7,
  cannon:    0xff9040,
  machine:   0xfde68a,
  shotgun:   0xfbbf24,
  ballista:  0xe8d5a0,
  frost:     0x93c5fd,
  poison:    0x86efac,
  laser:     0xf472b6,
  lightning: 0xfde047,
  flame:     0xfb923c,
  money:     0xfbbf24,
  wind:      0xa5f3fc,
  pulse:     0xc084fc,
};

const POOL_SIZE = 8;
const FLASH_DURATION = 150; // ms
const FLASH_INTENSITY = 3.5;
const FLASH_DISTANCE = 5;

interface PooledLight {
  light: THREE.PointLight;
  /** 閃光開始時間（0 = 閒置） */
  startTime: number;
}

export interface AttackLights3D {
  /** 塔開火時呼叫，在 (worldX, 高度, worldZ) 產生短暫閃光 */
  flash(worldX: number, worldZ: number, towerType: TowerType): void;
  /** 每幀更新衰減 */
  update(now: number): void;
  dispose(): void;
}

export function createAttackLights3D(scene: THREE.Scene): AttackLights3D {
  const pool: PooledLight[] = [];

  for (let i = 0; i < POOL_SIZE; i++) {
    const light = new THREE.PointLight(0xffffff, 0, FLASH_DISTANCE);
    light.position.set(0, -100, 0); // 閒置時移出場景
    scene.add(light);
    pool.push({ light, startTime: 0 });
  }

  /** 取得下一個閒置或最舊的光源 */
  const acquire = (): PooledLight => {
    // 優先取已過期（閒置）的
    let oldest = pool[0];
    for (const p of pool) {
      if (p.startTime === 0) return p;
      if (p.startTime < oldest.startTime) oldest = p;
    }
    return oldest; // 全滿時覆蓋最舊的
  };

  const flash: AttackLights3D['flash'] = (worldX, worldZ, towerType) => {
    const now = performance.now();
    const entry = acquire();
    entry.startTime = now;
    entry.light.color.setHex(ATTACK_FLASH_COLORS[towerType] ?? 0xfef3c7);
    entry.light.intensity = FLASH_INTENSITY;
    entry.light.position.set(worldX, 0.9, worldZ);
  };

  const update: AttackLights3D['update'] = (now) => {
    for (const entry of pool) {
      if (entry.startTime === 0) continue;
      const elapsed = now - entry.startTime;
      if (elapsed >= FLASH_DURATION) {
        // 過期 → 歸零
        entry.light.intensity = 0;
        entry.light.position.y = -100;
        entry.startTime = 0;
      } else {
        // 快速衰減（二次曲線）
        const t = elapsed / FLASH_DURATION;
        entry.light.intensity = FLASH_INTENSITY * (1 - t * t);
      }
    }
  };

  const dispose = () => {
    for (const entry of pool) {
      scene.remove(entry.light);
      entry.light.dispose();
    }
    pool.length = 0;
  };

  return { flash, update, dispose };
}
