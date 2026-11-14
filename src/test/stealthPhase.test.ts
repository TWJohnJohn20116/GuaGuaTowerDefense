/**
 * 隱身 / 相位判定測試 (gameStoreUtils)
 *
 * 測試 isEnemyStealthed 和 isEnemyPhased 的週期判定邏輯
 */

import { describe, it, expect } from 'vitest';
import { isEnemyStealthed, isEnemyPhased } from '@/store/gameStoreUtils';

describe('isEnemyStealthed', () => {
  it('should return false for non-stealth enemies', () => {
    const now = Date.now();
    const enemy = { type: 'normal', health: 100, spawnTime: now };
    expect(isEnemyStealthed(enemy, now)).toBe(false);
  });

  it('should return false for dead enemies', () => {
    const now = Date.now();
    const enemy = { type: 'stealth', health: -1, spawnTime: now };
    expect(isEnemyStealthed(enemy, now)).toBe(false);
  });

  it('should be visible at spawn time', () => {
    const now = Date.now();
    const enemy = { type: 'stealth', health: 100, spawnTime: now };
    // 剛生成時應在可見期 (cooldown = 5000ms)
    expect(isEnemyStealthed(enemy, now)).toBe(false);
  });

  it('should be stealthed after cooldown period', () => {
    const now = Date.now();
    // stealth: cd=5000ms, dur=3000ms
    // 生成 5500ms 後應在隱身狀態
    const enemy = { type: 'stealth', health: 100, spawnTime: now - 5500 };
    expect(isEnemyStealthed(enemy, now)).toBe(true);
  });

  it('should cycle between visible and stealth', () => {
    const now = Date.now();
    const enemy = { type: 'stealth', health: 100, spawnTime: now - 9000 };
    // 9000ms 後：一個完整週期 (5000+3000=8000) + 1000ms → 在可見期
    expect(isEnemyStealthed(enemy, now)).toBe(false);

    const enemy2 = { type: 'stealth', health: 100, spawnTime: now - 12000 };
    // 12000ms 後：8000 週期 + 4000ms → 在可見期（第二個週期的 cd 階段）
    expect(isEnemyStealthed(enemy2, now)).toBe(false);
  });
});

describe('isEnemyPhased', () => {
  it('should return false for non-phase enemies', () => {
    const now = Date.now();
    const enemy = { type: 'normal', health: 100, spawnTime: now };
    expect(isEnemyPhased(enemy, now)).toBe(false);
  });

  it('should return false for dead enemies', () => {
    const now = Date.now();
    const enemy = { type: 'ghost', health: -1, spawnTime: now };
    expect(isEnemyPhased(enemy, now)).toBe(false);
  });

  it('should be solid at spawn time', () => {
    const now = Date.now();
    const enemy = { type: 'ghost', health: 100, spawnTime: now };
    // ghost: cd=4000ms, dur=2000ms
    expect(isEnemyPhased(enemy, now)).toBe(false);
  });

  it('should be phased after cooldown period', () => {
    const now = Date.now();
    // 生成 4500ms 後應在相位狀態（cd=4000ms 後 + 500ms）
    const enemy = { type: 'ghost', health: 100, spawnTime: now - 4500 };
    expect(isEnemyPhased(enemy, now)).toBe(true);
  });

  it('should cycle between solid and phase', () => {
    const now = Date.now();
    const enemy = { type: 'ghost', health: 100, spawnTime: now - 6500 };
    // 6500ms 後：一個完整週期 (4000+2000=6000) + 500ms → 在固態期
    expect(isEnemyPhased(enemy, now)).toBe(false);
  });
});