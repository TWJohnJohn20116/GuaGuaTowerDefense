/**
 * 統一傷害管線測試 (applyDamageToEnemy)
 *
 * 測試傷害管線的正確性：相位免疫 → 裝甲減傷 → 護盾吸收 → 扣血
 * 以及毒/火焰 DoT 的 ignoreArmor / ignoreShield 特性
 */

import { describe, it, expect } from 'vitest';
import { applyDamageToEnemy } from '@/store/gameStoreUtils';
import { getTowerHitDamageOpts } from '@/data/combatStatus';

// 輔助函式：建立測試用 enemy 快照
const makeEnemy = (overrides: Record<string, unknown> = {}) => ({
  type: 'normal',
  health: 100,
  shield: 0,
  spawnTime: 0,
  ...overrides,
});

describe('applyDamageToEnemy', () => {
  describe('basic damage', () => {
    it('should deal direct health damage when no shield or armor', () => {
      const enemy = makeEnemy({ health: 100 });
      const result = applyDamageToEnemy(enemy, 30, Date.now());
      expect(result.health).toBe(70);
      expect(result.shield).toBe(0);
      expect(result.dealt).toBe(30);
      expect(result.immune).toBe(false);
    });

    it('should return zero dealt for zero damage', () => {
      const enemy = makeEnemy({ health: 100 });
      const result = applyDamageToEnemy(enemy, 0, Date.now());
      expect(result.health).toBe(100);
      expect(result.dealt).toBe(0);
      expect(result.immune).toBe(false);
    });

    it('should not go below zero health', () => {
      const enemy = makeEnemy({ health: 10 });
      const result = applyDamageToEnemy(enemy, 50, Date.now());
      expect(result.health).toBeLessThanOrEqual(0);
      expect(result.dealt).toBeGreaterThan(0);
    });
  });

  describe('armor reduction', () => {
    it('should reduce damage by armor value', () => {
      const enemy = makeEnemy({ type: 'armored', health: 100 });
      // armored 有 armorValue: 5
      const result = applyDamageToEnemy(enemy, 20, Date.now());
      expect(result.health).toBe(85); // 100 - (20 - 5) = 85
      expect(result.dealt).toBe(15);
    });

    it('should always deal at least 1 damage through armor', () => {
      const enemy = makeEnemy({ type: 'armored', health: 100 });
      const result = applyDamageToEnemy(enemy, 3, Date.now());
      expect(result.health).toBe(99); // 至少 1 點傷害
      expect(result.dealt).toBe(1);
    });

    it('should ignore armor with ignoreArmor option', () => {
      const enemy = makeEnemy({ type: 'armored', health: 100 });
      const result = applyDamageToEnemy(enemy, 20, Date.now(), { ignoreArmor: true });
      expect(result.health).toBe(80); // 20 - 0 = 20（無裝甲）
      expect(result.dealt).toBe(20);
    });
  });

  describe('shield absorption', () => {
    it('should absorb damage with shield first', () => {
      const enemy = makeEnemy({ type: 'shield', health: 100, shield: 50, maxShield: 50 });
      const result = applyDamageToEnemy(enemy, 30, Date.now());
      expect(result.health).toBe(100); // 血量未受損
      expect(result.shield).toBe(20);  // 護盾從 50 → 20
      expect(result.dealt).toBe(30);
    });

    it('should overflow to health when shield is depleted', () => {
      const enemy = makeEnemy({ type: 'shield', health: 100, shield: 20, maxShield: 50 });
      const result = applyDamageToEnemy(enemy, 50, Date.now());
      expect(result.health).toBe(70); // 100 - (50 - 20) = 70
      expect(result.shield).toBe(0);
      expect(result.dealt).toBe(50);
    });

    it('should bypass shield with ignoreShield option', () => {
      const enemy = makeEnemy({ type: 'shield', health: 100, shield: 50, maxShield: 50 });
      const result = applyDamageToEnemy(enemy, 30, Date.now(), { ignoreShield: true });
      expect(result.health).toBe(70); // 直接扣血
      expect(result.shield).toBe(50); // 護盾完整
      expect(result.dealt).toBe(30);
    });

    it('lets lightning hit options pierce shields', () => {
      const enemy = makeEnemy({ type: 'shield', health: 100, shield: 50, maxShield: 50 });
      const result = applyDamageToEnemy(enemy, 30, Date.now(), getTowerHitDamageOpts('lightning'));
      expect(result.health).toBe(70);
      expect(result.shield).toBe(50);
      expect(result.dealt).toBe(30);
    });

    it('lets poison hit options pierce shields', () => {
      const enemy = makeEnemy({ type: 'shield', health: 100, shield: 50, maxShield: 50 });
      const result = applyDamageToEnemy(enemy, 30, Date.now(), getTowerHitDamageOpts('poison'));
      expect(result.health).toBe(70);
      expect(result.shield).toBe(50);
      expect(result.dealt).toBe(30);
    });
  });

  describe('poison armor pierce', () => {
    it('lets poison hit options skip armor', () => {
      const enemy = makeEnemy({ type: 'armored', health: 100 });
      const result = applyDamageToEnemy(enemy, 20, Date.now(), getTowerHitDamageOpts('poison'));
      expect(result.health).toBe(80);
      expect(result.dealt).toBe(20);
    });
  });

  describe('phase immunity', () => {
    it('should return immune for phased ghosts', () => {
      const now = Date.now();
      // ghost: phase 4s cd + 2s duration
      // 在 spawnTime + 4500ms 時進入相位（cd=4000ms 後 + 持續 500ms）
      const enemy = makeEnemy({
        type: 'ghost',
        health: 100,
        spawnTime: now - 4500, // 在 phase 中
      });
      const result = applyDamageToEnemy(enemy, 50, now);
      expect(result.immune).toBe(true);
      expect(result.health).toBe(100);
      expect(result.dealt).toBe(0);
    });

    it('should deal damage when ghost is not phased', () => {
      const now = Date.now();
      const enemy = makeEnemy({
        type: 'ghost',
        health: 100,
        spawnTime: now - 1000, // 剛生成 1 秒，在實體狀態 (cd=4000ms)
      });
      const result = applyDamageToEnemy(enemy, 50, now);
      expect(result.immune).toBe(false);
      expect(result.health).toBe(50);
    });
  });

  describe('combined mechanics', () => {
    it('should apply armor then shield then health', () => {
      // 裝甲敵人 + 護盾（突變挑戰可能疊加）
      const enemy = makeEnemy({
        type: 'armored',
        health: 100,
        shield: 10,
        armorBonus: 3, // 突變挑戰額外裝甲
      });
      // armored 基礎 armorValue=5 + armorBonus=3 = 總裝甲 8
      // 輸入 30 → 裝甲減 8 = 22 → 護盾吸 10 = 12 → 扣血 88
      const result = applyDamageToEnemy(enemy, 30, Date.now());
      expect(result.health).toBe(88);
      expect(result.shield).toBe(0);
      expect(result.dealt).toBe(22);
    });
  });

  describe('status modifiers', () => {
    it('increases damage taken while weakened', () => {
      const now = 10_000;
      const enemy = makeEnemy({
        health: 100,
        effects: [{ type: 'weakness', duration: 2000, startTime: 9000 }],
      });
      const result = applyDamageToEnemy(enemy, 20, now);
      expect(result.health).toBe(70);
      expect(result.dealt).toBe(30);
    });

    it('shreds armor while exposed', () => {
      const now = 10_000;
      const enemy = makeEnemy({
        type: 'armored',
        health: 100,
        effects: [{ type: 'exposed', duration: 2000, startTime: 9000 }],
      });
      // armor 5 * 0.4 = 2 → 20 - 2 = 18
      const result = applyDamageToEnemy(enemy, 20, now);
      expect(result.health).toBe(82);
      expect(result.dealt).toBe(18);
    });
  });
});