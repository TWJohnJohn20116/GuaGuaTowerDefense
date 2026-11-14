/**
 * 狀態效果系統測試 (enemyData)
 *
 * 測試所有狀態效果的定義完整性與敵人類型資料一致性
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA, STATUS_EFFECTS } from '@/data/gameData';
import type { EnemyType, StatusEffectType } from '@/types/game';
import {
  FROST_FROZEN_DAMAGE_MULT,
  FROST_SHATTER_DAMAGE,
  LIGHTNING_WEAKENED_DAMAGE_MULT,
  LASER_EXPOSED_DAMAGE_MULT,
  PULSE_EXPOSED_DAMAGE_MULT,
  WIND_FEARED_DAMAGE_MULT,
  MACHINE_SILENCED_DAMAGE_MULT,
  FLAME_BURNING_DAMAGE_MULT,
  POISON_TOXIN_DAMAGE_MULT,
  POISON_HEAL_MULT,
} from '@/data/combatStatus';

describe('ENEMY_DATA', () => {
  it('should have all 22 enemy types defined', () => {
    const expectedTypes: EnemyType[] = [
      'normal', 'fast', 'elite', 'speedy', 'tank', 'heavy', 'boss',
      'flyer', 'healer', 'spawner', 'shield', 'stealth', 'berserker',
      'armored', 'mage', 'miniboss', 'swarm', 'ghost', 'bomber', 'saboteur',
      'jammer', 'escort',
    ];
    for (const type of expectedTypes) {
      expect(ENEMY_DATA[type]).toBeDefined();
    }
    expect(Object.keys(ENEMY_DATA)).toHaveLength(22);
  });

  it('should have valid health for all enemies', () => {
    Object.values(ENEMY_DATA).forEach(enemy => {
      expect(enemy.health).toBeGreaterThan(0);
    });
  });

  it('should have valid speed for all enemies', () => {
    Object.values(ENEMY_DATA).forEach(enemy => {
      expect(enemy.speed).toBeGreaterThan(0);
    });
  });

  it('should have valid reward for all enemies', () => {
    Object.values(ENEMY_DATA).forEach(enemy => {
      expect(enemy.reward).toBeGreaterThan(0);
    });
  });

  it('should have size between 10 and 60 for all enemies', () => {
    Object.values(ENEMY_DATA).forEach(enemy => {
      expect(enemy.size).toBeGreaterThanOrEqual(10);
      expect(enemy.size).toBeLessThanOrEqual(60);
    });
  });

  it('should have boss with highest health', () => {
    const bossHealth = ENEMY_DATA.boss.health;
    Object.entries(ENEMY_DATA).forEach(([type, data]) => {
      if (type !== 'boss') {
        expect(data.health).toBeLessThanOrEqual(bossHealth);
      }
    });
  });

  it('should have swarm with lowest health', () => {
    const swarmHealth = ENEMY_DATA.swarm.health;
    Object.entries(ENEMY_DATA).forEach(([type, data]) => {
      if (type !== 'swarm') {
        expect(data.health).toBeGreaterThanOrEqual(swarmHealth);
      }
    });
  });

  it('should have speedy with highest speed', () => {
    const speedySpeed = ENEMY_DATA.speedy.speed;
    Object.entries(ENEMY_DATA).forEach(([type, data]) => {
      if (type !== 'speedy') {
        expect(data.speed).toBeLessThanOrEqual(speedySpeed);
      }
    });
  });

  it('should have all abilities defined in their data', () => {
    const abilityTypes = ['flying', 'healing', 'spawning', 'shield', 'stealth', 'berserk', 'armored', 'teleport', 'miniboss', 'phase', 'explode', 'sabotage', 'swarm', 'jam', 'escort'];
    const enemiesWithAbility = Object.entries(ENEMY_DATA).filter(([, data]) => data.ability);
    // 檢查每個聲稱有能力的敵人都有對應的參數
    for (const [, data] of enemiesWithAbility) {
      const ability = data.ability!;
      expect(abilityTypes).toContain(ability);
    }
  });

  it('should have shield amount for shield enemies', () => {
    expect(ENEMY_DATA.shield.shieldAmount).toBeGreaterThan(0);
    expect(ENEMY_DATA.shield.shieldRegen).toBeGreaterThan(0);
  });

  it('should have stealth duration for stealth enemies', () => {
    expect(ENEMY_DATA.stealth.stealthDuration).toBeGreaterThan(0);
    expect(ENEMY_DATA.stealth.stealthCooldown).toBeGreaterThan(0);
  });

  it('should have berserk threshold for berserker', () => {
    expect(ENEMY_DATA.berserker.berserkThreshold).toBeGreaterThan(0);
    expect(ENEMY_DATA.berserker.berserkThreshold).toBeLessThan(1);
    expect(ENEMY_DATA.berserker.berserkSpeedBoost).toBeGreaterThan(1);
  });

  it('should have armor value for armored enemies', () => {
    expect(ENEMY_DATA.armored.armorValue).toBeGreaterThan(0);
  });

  it('should have teleport cooldown for mage', () => {
    expect(ENEMY_DATA.mage.teleportCooldown).toBeGreaterThan(0);
    expect(ENEMY_DATA.mage.teleportDistance).toBeGreaterThan(0);
  });

  it('should have explosion damage for bomber', () => {
    expect(ENEMY_DATA.bomber.explosionRadius).toBeGreaterThan(0);
    expect(ENEMY_DATA.bomber.explosionDamage).toBeGreaterThan(0);
  });

  it('should have spawn data for spawner', () => {
    expect(ENEMY_DATA.spawner.spawnOnDeath).toBeDefined();
    expect(ENEMY_DATA.spawner.spawnOnDeath!.count).toBeGreaterThan(0);
  });

  it('should have jam radius and fire-rate penalty for jammer', () => {
    expect(ENEMY_DATA.jammer.ability).toBe('jam');
    expect(ENEMY_DATA.jammer.jamRadius).toBeGreaterThan(0);
    expect(ENEMY_DATA.jammer.jamFireRateMult).toBeGreaterThan(0);
    expect(ENEMY_DATA.jammer.jamFireRateMult).toBeLessThan(1);
  });

  it('should have escort radius and armor aura for escort', () => {
    expect(ENEMY_DATA.escort.ability).toBe('escort');
    expect(ENEMY_DATA.escort.escortRadius).toBeGreaterThan(0);
    expect(ENEMY_DATA.escort.escortArmor).toBeGreaterThan(0);
  });
});

describe('STATUS_EFFECTS', () => {
  it('should have all 22 status effects', () => {
    const expectedEffects: StatusEffectType[] = [
      'slow', 'poison', 'burn', 'freeze', 'stun', 'bleed', 'weakness',
      'marked', 'exposed', 'fear', 'root', 'curse', 'shield', 'regen',
      'haste', 'berserk', 'immune', 'confuse', 'silence', 'petrify', 'wind',
      'frostbite',
    ];
    for (const effect of expectedEffects) {
      expect(STATUS_EFFECTS[effect]).toBeDefined();
    }
    expect(Object.keys(STATUS_EFFECTS)).toHaveLength(22);
  });

  it('should have valid name, description, icon, and color for each effect', () => {
    Object.values(STATUS_EFFECTS).forEach(effect => {
      expect(effect.name).toBeTruthy();
      expect(effect.description).toBeTruthy();
      expect(effect.icon).toBeTruthy();
      expect(effect.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('should have both debuffs and buffs', () => {
    const debuffs = Object.values(STATUS_EFFECTS).filter(e => e.isDebuff);
    const buffs = Object.values(STATUS_EFFECTS).filter(e => !e.isDebuff);
    expect(debuffs.length).toBeGreaterThan(0);
    expect(buffs.length).toBeGreaterThan(0);
  });

  it('should have stackable effects with maxStacks > 1', () => {
    const stackable = Object.values(STATUS_EFFECTS).filter(e => e.canStack);
    for (const effect of stackable) {
      expect(effect.maxStacks).toBeGreaterThan(1);
    }
  });

  it('should have non-stackable effects with maxStacks = 1', () => {
    const nonStackable = Object.values(STATUS_EFFECTS).filter(e => !e.canStack);
    for (const effect of nonStackable) {
      expect(effect.maxStacks).toBe(1);
    }
  });

  it('mentions existing hunt identities that players already have', () => {
    expect(STATUS_EFFECTS.freeze.description).toContain(`×${FROST_FROZEN_DAMAGE_MULT}`);
    expect(STATUS_EFFECTS.freeze.description).toContain(String(FROST_SHATTER_DAMAGE));
    expect(STATUS_EFFECTS.weakness.description).toContain(`×${LIGHTNING_WEAKENED_DAMAGE_MULT}`);
    expect(STATUS_EFFECTS.exposed.description).toContain(`×${LASER_EXPOSED_DAMAGE_MULT}`);
    expect(STATUS_EFFECTS.exposed.description).toContain(`×${PULSE_EXPOSED_DAMAGE_MULT}`);
    expect(STATUS_EFFECTS.fear.description).toContain(`×${WIND_FEARED_DAMAGE_MULT}`);
    expect(STATUS_EFFECTS.silence.description).toContain(`×${MACHINE_SILENCED_DAMAGE_MULT}`);
    expect(STATUS_EFFECTS.burn.description).toContain(`×${FLAME_BURNING_DAMAGE_MULT}`);
    expect(STATUS_EFFECTS.poison.description).toContain(`×${POISON_TOXIN_DAMAGE_MULT}`);
    expect(STATUS_EFFECTS.poison.description).toContain(String(POISON_HEAL_MULT));
  });
});