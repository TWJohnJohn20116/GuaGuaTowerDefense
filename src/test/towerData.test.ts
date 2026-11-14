/**
 * 塔資料測試 (towerData)
 *
 * 測試所有塔的定義完整性與資料一致性
 */

import { describe, it, expect } from 'vitest';
import { TOWER_DATA } from '@/data/gameData';
import type { TowerType } from '@/types/game';

describe('TOWER_DATA', () => {
  it('should have all 18 tower types defined', () => {
    const expectedTypes: TowerType[] = [
      'basic', 'sniper', 'cannon', 'machine', 'ballista', 'shotgun',
      'frost', 'poison', 'laser', 'lightning', 'flame',
      'money', 'wind', 'pulse',
      'storm', 'plague', 'demolisher', 'tempest',
    ];
    for (const type of expectedTypes) {
      expect(TOWER_DATA[type]).toBeDefined();
    }
    expect(Object.keys(TOWER_DATA)).toHaveLength(18);
  });

  it('should have valid cost for all towers', () => {
    Object.values(TOWER_DATA).forEach(tower => {
      expect(tower.cost).toBeGreaterThan(0);
    });
  });

  it('should have valid name and description for all towers', () => {
    Object.values(TOWER_DATA).forEach(tower => {
      expect(tower.name).toBeTruthy();
      expect(tower.description).toBeTruthy();
    });
  });

  it('should have valid color hex codes', () => {
    Object.values(TOWER_DATA).forEach(tower => {
      expect(tower.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(tower.projectileColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(tower.highlightColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('damage towers', () => {
    it('should have damage > 0 for offensive towers', () => {
      const offensiveTypes: TowerType[] = ['basic', 'sniper', 'cannon', 'machine', 'ballista', 'shotgun', 'lightning', 'pulse'];
      for (const type of offensiveTypes) {
        expect(TOWER_DATA[type].damage).toBeGreaterThan(0);
      }
    });

    it('should have range > 0 for offensive towers', () => {
      const offensiveTypes: TowerType[] = ['basic', 'sniper', 'cannon', 'machine', 'ballista', 'shotgun', 'lightning', 'pulse'];
      for (const type of offensiveTypes) {
        expect(TOWER_DATA[type].range).toBeGreaterThan(0);
      }
    });

    it('should have fireRate > 0 for offensive towers', () => {
      const offensiveTypes: TowerType[] = ['basic', 'sniper', 'cannon', 'machine', 'ballista', 'shotgun', 'lightning', 'pulse'];
      for (const type of offensiveTypes) {
        expect(TOWER_DATA[type].fireRate).toBeGreaterThan(0);
      }
    });
  });

  describe('special towers', () => {
    it('should have money generation for money tower', () => {
      expect(TOWER_DATA.money.moneyGeneration).toBe(true);
      expect(TOWER_DATA.money.moneyPerSecond).toBeGreaterThan(0);
    });

    it('should have slow effect for frost tower', () => {
      expect(TOWER_DATA.frost.slowEffect).toBe(true);
      expect(TOWER_DATA.frost.slowAmount).toBeGreaterThan(0);
      expect(TOWER_DATA.frost.slowDuration).toBeGreaterThan(0);
    });

    it('should have poison effect for poison tower', () => {
      expect(TOWER_DATA.poison.poisonEffect).toBe(true);
      expect(TOWER_DATA.poison.poisonDamage).toBeGreaterThan(0);
      expect(TOWER_DATA.poison.poisonDuration).toBeGreaterThan(0);
    });

    it('should have wind effect for wind tower', () => {
      expect(TOWER_DATA.wind.windEffect).toBe(true);
      expect(TOWER_DATA.wind.windKnockbackDistance).toBeGreaterThan(0);
    });

    it('should have pulse effect for pulse tower', () => {
      expect(TOWER_DATA.pulse.pulseEffect).toBe(true);
    });

    it('should have flame effect for flame tower', () => {
      expect(TOWER_DATA.flame.flameEffect).toBe(true);
      expect(TOWER_DATA.flame.damagePerSecond).toBeGreaterThan(0);
    });

    it('should have splash for cannon tower', () => {
      expect(TOWER_DATA.cannon.splash).toBe(true);
      expect(TOWER_DATA.cannon.splashRadius).toBeGreaterThan(0);
    });

    it('should have chain lightning for lightning tower', () => {
      expect(TOWER_DATA.lightning.lightningEffect).toBe(true);
      expect(TOWER_DATA.lightning.chainCount).toBeGreaterThan(0);
      expect(TOWER_DATA.lightning.chainDamageReduction).toBeGreaterThan(0);
    });
  });

  describe('fusion towers', () => {
    it('should have storm as fusion of frost + lightning', () => {
      const storm = TOWER_DATA.storm;
      expect(storm.lightningEffect).toBe(true);
      expect(storm.slowEffect).toBe(true);
    });

    it('should have plague as fusion of poison + flame', () => {
      const plague = TOWER_DATA.plague;
      expect(plague.flameEffect).toBe(true);
      expect(plague.poisonEffect).toBe(true);
    });

    it('should have demolisher as fusion of cannon + sniper', () => {
      const demolisher = TOWER_DATA.demolisher;
      expect(demolisher.splash).toBe(true);
      expect(demolisher.range).toBeGreaterThanOrEqual(5);
    });

    it('should have tempest as fusion of wind + pulse', () => {
      const tempest = TOWER_DATA.tempest;
      expect(tempest.pulseEffect).toBe(true);
      expect(tempest.windEffect).toBe(true);
    });

    it('should have higher cost than base towers', () => {
      const fusionTypes: TowerType[] = ['storm', 'plague', 'demolisher', 'tempest'];
      const cheapTowerCost = Math.min(
        TOWER_DATA.basic.cost,
        TOWER_DATA.sniper.cost,
        TOWER_DATA.cannon.cost,
      );
      for (const type of fusionTypes) {
        expect(TOWER_DATA[type].cost).toBeGreaterThan(cheapTowerCost);
      }
    });
  });

  describe('stealth/invisibility interactions', () => {
    it('should have instantHit for laser and lightning (no projectiles)', () => {
      expect(TOWER_DATA.laser.instantHit).toBe(true);
      expect(TOWER_DATA.lightning.instantHit).toBe(true);
    });
  });
});