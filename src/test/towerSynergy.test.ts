/**
 * 鄰塔協同：正交相鄰的特定塔對會提供真實戰鬥加成
 */

import { describe, it, expect } from 'vitest';
import type { TowerType } from '@/types/game';
import {
  TOWER_SYNERGIES,
  areOrthogonallyAdjacent,
  getSynergyModsForTower,
  countActiveSynergyKinds,
  getEncyclopediaSynergiesForTower,
  previewPlacementSynergies,
} from '@/data/towerSynergyData';

function tower(id: string, type: TowerType, col: number, row: number) {
  return { id, type, col, row };
}

describe('areOrthogonallyAdjacent', () => {
  it('accepts 4-direction neighbors and rejects diagonal or far cells', () => {
    expect(areOrthogonallyAdjacent({ col: 3, row: 4 }, { col: 4, row: 4 })).toBe(true);
    expect(areOrthogonallyAdjacent({ col: 3, row: 4 }, { col: 3, row: 3 })).toBe(true);
    expect(areOrthogonallyAdjacent({ col: 3, row: 4 }, { col: 4, row: 5 })).toBe(false);
    expect(areOrthogonallyAdjacent({ col: 3, row: 4 }, { col: 5, row: 4 })).toBe(false);
    expect(areOrthogonallyAdjacent({ col: 3, row: 4 }, { col: 3, row: 4 })).toBe(false);
  });
});

describe('getSynergyModsForTower', () => {
  it('returns identity mods when no partner is adjacent', () => {
    const sniper = tower('s', 'sniper', 2, 2);
    const frost = tower('f', 'frost', 5, 5);
    const mods = getSynergyModsForTower(sniper, [sniper, frost]);
    expect(mods.fireRateMult).toBe(1);
    expect(mods.damageMult).toBe(1);
    expect(mods.rangeMult).toBe(1);
    expect(mods.incomeMult).toBe(1);
    expect(mods.linkNames).toEqual([]);
  });

  it('applies frost + sniper fire-rate bonus to both when orthogonally adjacent', () => {
    const sniper = tower('s', 'sniper', 2, 2);
    const frost = tower('f', 'frost', 3, 2);
    const sniperMods = getSynergyModsForTower(sniper, [sniper, frost]);
    const frostMods = getSynergyModsForTower(frost, [sniper, frost]);
    expect(sniperMods.fireRateMult).toBeGreaterThan(1);
    expect(frostMods.fireRateMult).toBe(sniperMods.fireRateMult);
    expect(sniperMods.linkNames.length).toBe(1);
  });

  it('ignores a matching pair that is only diagonal', () => {
    const sniper = tower('s', 'sniper', 2, 2);
    const frost = tower('f', 'frost', 3, 3);
    const mods = getSynergyModsForTower(sniper, [sniper, frost]);
    expect(mods.fireRateMult).toBe(1);
  });

  it('stacks two different partners and still stays under the fire-rate cap', () => {
    const frost = tower('f', 'frost', 2, 2);
    const sniper = tower('s', 'sniper', 3, 2);
    const cannon = tower('c', 'cannon', 2, 3);
    const mods = getSynergyModsForTower(frost, [frost, sniper, cannon]);
    expect(mods.linkNames.length).toBe(2);
    expect(mods.fireRateMult).toBeLessThanOrEqual(1.45);
    expect(mods.damageMult).toBeGreaterThan(1);
  });
});

describe('countActiveSynergyKinds', () => {
  it('counts unique recipe kinds on the board, not duplicate copies', () => {
    const frostA = tower('f1', 'frost', 1, 1);
    const sniperA = tower('s1', 'sniper', 2, 1);
    const frostB = tower('f2', 'frost', 4, 4);
    const sniperB = tower('s2', 'sniper', 5, 4);
    expect(countActiveSynergyKinds([frostA, sniperA, frostB, sniperB])).toBe(1);
  });
});

describe('TOWER_SYNERGIES', () => {
  it('defines unordered unique pairs with at least one bonus above 1', () => {
    const keys = TOWER_SYNERGIES.map((s) => [s.a, s.b].sort().join('+'));
    expect(new Set(keys).size).toBe(TOWER_SYNERGIES.length);
    for (const synergy of TOWER_SYNERGIES) {
      const hasBonus = synergy.fireRateMult > 1 || synergy.damageMult > 1
        || synergy.rangeMult > 1 || synergy.incomeMult > 1;
      expect(hasBonus).toBe(true);
    }
  });
});

describe('getEncyclopediaSynergiesForTower', () => {
  it('lists frost control partners and wind-sniper range synergy', () => {
    const frost = getEncyclopediaSynergiesForTower('frost');
    expect(frost.map((s) => s.partnerType).sort()).toEqual(['cannon', 'laser', 'lightning', 'shotgun', 'sniper', 'wind']);
    expect(getEncyclopediaSynergiesForTower('wind').map((s) => s.partnerType).sort()).toEqual(['frost', 'pulse', 'sniper']);
  });

  it('is symmetric and includes a readable bonus label', () => {
    const sniper = getEncyclopediaSynergiesForTower('sniper');
    expect(sniper.map((s) => s.partnerType).sort()).toEqual(['ballista', 'frost', 'laser', 'wind']);
    const frostLink = sniper.find((s) => s.partnerType === 'frost');
    expect(frostLink?.name).toBe('寒霜瞄準');
    expect(frostLink?.bonusLabel).toContain('1.18');
    const frostPartner = getEncyclopediaSynergiesForTower('frost').find((s) => s.partnerType === 'sniper');
    expect(frostPartner?.recipeId).toBe(frostLink?.recipeId);
  });
});

describe('previewPlacementSynergies', () => {
  it('returns the recipe that would fire on an orthogonal neighbor', () => {
    const frost = tower('f', 'frost', 2, 2);
    const preview = previewPlacementSynergies('sniper', 3, 2, [frost]);
    expect(preview).toHaveLength(1);
    expect(preview[0].name).toBe('寒霜瞄準');
    expect(preview[0].partnerId).toBe('f');
    expect(preview[0].partnerCol).toBe(2);
    expect(preview[0].partnerRow).toBe(2);
  });

  it('ignores diagonal neighbors and empty surroundings', () => {
    const frost = tower('f', 'frost', 2, 2);
    expect(previewPlacementSynergies('sniper', 3, 3, [frost])).toEqual([]);
    expect(previewPlacementSynergies('sniper', 5, 5, [frost])).toEqual([]);
  });

  it('stacks two orthogonal partners of different recipes', () => {
    const sniper = tower('s', 'sniper', 4, 2);
    const cannon = tower('c', 'cannon', 3, 3);
    const preview = previewPlacementSynergies('frost', 3, 2, [sniper, cannon]);
    expect(preview.map((p) => p.name).sort()).toEqual(['寒霜爆破', '寒霜瞄準']);
  });
});
