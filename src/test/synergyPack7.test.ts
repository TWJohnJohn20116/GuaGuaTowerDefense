/**
 * 第七批鄰塔協同：毒散、攻城焰、基砲
 */

import { describe, it, expect } from 'vitest';
import {
  TOWER_SYNERGIES,
  findSynergyRecipe,
  getSynergyModsForTower,
  getEncyclopediaSynergiesForTower,
  previewPlacementSynergies,
} from '@/data/towerSynergyData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

const NEW_IDS = ['toxic_shot', 'siege_flame', 'base_cannon'] as const;

function tower(
  id: string,
  type: 'poison' | 'shotgun' | 'ballista' | 'flame' | 'basic' | 'cannon',
  col: number,
  row: number,
) {
  return { id, type, col, row };
}

describe('seventh synergy pack', () => {
  it('registers three unique recipes with a real combat bonus', () => {
    const ids = TOWER_SYNERGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    const toxicShot = TOWER_SYNERGIES.find((s) => s.id === 'toxic_shot');
    expect(toxicShot, 'toxic_shot').toBeDefined();
    expect(toxicShot!.name).toBe('毒霧散彈');
    expect(findSynergyRecipe('poison', 'shotgun')?.id).toBe('toxic_shot');
    expect(toxicShot!.damageMult).toBeGreaterThan(1);

    const siegeFlame = TOWER_SYNERGIES.find((s) => s.id === 'siege_flame');
    expect(siegeFlame, 'siege_flame').toBeDefined();
    expect(siegeFlame!.name).toBe('攻城烈焰');
    expect(findSynergyRecipe('ballista', 'flame')?.id).toBe('siege_flame');
    expect(siegeFlame!.damageMult).toBeGreaterThan(1);

    const baseCannon = TOWER_SYNERGIES.find((s) => s.id === 'base_cannon');
    expect(baseCannon, 'base_cannon').toBeDefined();
    expect(baseCannon!.name).toBe('基砲連線');
    expect(findSynergyRecipe('basic', 'cannon')?.id).toBe('base_cannon');
    expect(baseCannon!.fireRateMult).toBeGreaterThan(1);

    for (const id of NEW_IDS) {
      expect(TOWER_SYNERGIES.find((s) => s.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('applies the new recipes when the pair is orthogonally adjacent', () => {
    const poison = tower('o', 'poison', 2, 2);
    const shotgun = tower('g', 'shotgun', 3, 2);
    expect(getSynergyModsForTower(poison, [poison, shotgun]).damageMult).toBeGreaterThan(1);

    const ballista = tower('b', 'ballista', 4, 4);
    const flame = tower('f', 'flame', 4, 5);
    expect(getSynergyModsForTower(ballista, [ballista, flame]).damageMult).toBeGreaterThan(1);

    const basic = tower('a', 'basic', 6, 6);
    const cannon = tower('c', 'cannon', 7, 6);
    expect(getSynergyModsForTower(basic, [basic, cannon]).fireRateMult).toBeGreaterThan(1);
  });

  it('shows up in encyclopedia and placement preview', () => {
    expect(getEncyclopediaSynergiesForTower('poison').some((s) => s.partnerType === 'shotgun')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('ballista').some((s) => s.partnerType === 'flame')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('basic').some((s) => s.partnerType === 'cannon')).toBe(true);

    const preview = previewPlacementSynergies('cannon', 7, 6, [tower('a', 'basic', 6, 6)]);
    expect(preview.map((p) => p.name)).toContain('基砲連線');
  });

  it('keeps the catalog achievement aligned with the live synergy pool', () => {
    const poolSize = TOWER_SYNERGIES.length;
    expect(poolSize).toBeGreaterThanOrEqual(26);
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'synergy_catalog');
    expect(achievement).toBeDefined();
    expect(achievement!.conditions[0].target).toBe(poolSize);
    expect(achievement!.description).toContain(String(poolSize));
  });
});
