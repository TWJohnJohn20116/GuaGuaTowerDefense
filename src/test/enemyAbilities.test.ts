import { describe, expect, it } from 'vitest';
import { hasEnemyAbility } from '@/data/gameData/enemyAbilities';
import { ENEMY_DATA } from '@/data/gameData';
import type { EnemyData } from '@/types/game';

describe('hasEnemyAbility', () => {
  it('returns false for missing data', () => {
    expect(hasEnemyAbility(undefined, 'flying')).toBe(false);
    expect(hasEnemyAbility(null, 'flying')).toBe(false);
  });

  it('falls back to the single ability flag when abilities is absent', () => {
    expect(hasEnemyAbility({ ability: 'flying' }, 'flying')).toBe(true);
    expect(hasEnemyAbility({ ability: 'flying' }, 'stealth')).toBe(false);
    expect(hasEnemyAbility({}, 'flying')).toBe(false);
  });

  it('prefers the abilities array over the legacy flag', () => {
    const data = { ability: 'flying', abilities: ['stealth'] };
    expect(hasEnemyAbility(data, 'stealth')).toBe(true);
    expect(hasEnemyAbility(data, 'flying')).toBe(false);
  });

  it('treats an empty abilities array as explicitly having no ability', () => {
    expect(hasEnemyAbility({ ability: 'flying', abilities: [] }, 'flying')).toBe(false);
  });

  it('judges a real EnemyData entry from the data table', () => {
    const flyer = ENEMY_DATA.flyer;
    expect(flyer.ability).toBe('flying');
    expect(hasEnemyAbility(flyer, 'flying')).toBe(true);
    expect(hasEnemyAbility(flyer, 'healing')).toBe(false);
  });

  it('supports combined abilities on a real-shaped EnemyData object', () => {
    const combo: EnemyData = { ...ENEMY_DATA.stealth, abilities: ['stealth', 'phase'] };
    expect(hasEnemyAbility(combo, 'stealth')).toBe(true);
    expect(hasEnemyAbility(combo, 'phase')).toBe(true);
    expect(hasEnemyAbility(combo, 'flying')).toBe(false);
  });
});
