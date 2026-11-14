/**
 * 第三批鄰塔協同：雷射／火焰／風脈要有真實配方，圖鑑與成就數量對齊
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

const NEW_IDS = ['beam_snipe', 'blaze_cannon', 'gale_pulse'] as const;

function tower(
  id: string,
  type: 'laser' | 'sniper' | 'flame' | 'cannon' | 'wind' | 'pulse',
  col: number,
  row: number,
) {
  return { id, type, col, row };
}

describe('third synergy pack', () => {
  it('registers three unique recipes with a real combat bonus', () => {
    const ids = TOWER_SYNERGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    const beam = TOWER_SYNERGIES.find((s) => s.id === 'beam_snipe');
    expect(beam, 'beam_snipe').toBeDefined();
    expect(beam!.name).toBe('雙準連線');
    expect(findSynergyRecipe('laser', 'sniper')?.id).toBe('beam_snipe');
    expect(beam!.rangeMult).toBeGreaterThan(1);

    const blaze = TOWER_SYNERGIES.find((s) => s.id === 'blaze_cannon');
    expect(blaze, 'blaze_cannon').toBeDefined();
    expect(blaze!.name).toBe('燃爆砲火');
    expect(findSynergyRecipe('flame', 'cannon')?.id).toBe('blaze_cannon');
    expect(blaze!.damageMult).toBeGreaterThan(1);

    const gale = TOWER_SYNERGIES.find((s) => s.id === 'gale_pulse');
    expect(gale, 'gale_pulse').toBeDefined();
    expect(gale!.name).toBe('風脈共振');
    expect(findSynergyRecipe('wind', 'pulse')?.id).toBe('gale_pulse');
    expect(gale!.fireRateMult).toBeGreaterThan(1);

    for (const id of NEW_IDS) {
      expect(TOWER_SYNERGIES.find((s) => s.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('applies the new recipes when the pair is orthogonally adjacent', () => {
    const laser = tower('l', 'laser', 2, 2);
    const sniper = tower('s', 'sniper', 3, 2);
    expect(getSynergyModsForTower(laser, [laser, sniper]).rangeMult).toBeGreaterThan(1);

    const flame = tower('f', 'flame', 4, 4);
    const cannon = tower('c', 'cannon', 4, 5);
    expect(getSynergyModsForTower(flame, [flame, cannon]).damageMult).toBeGreaterThan(1);

    const wind = tower('w', 'wind', 6, 6);
    const pulse = tower('p', 'pulse', 7, 6);
    expect(getSynergyModsForTower(wind, [wind, pulse]).fireRateMult).toBeGreaterThan(1);
  });

  it('shows up in encyclopedia and placement preview', () => {
    expect(getEncyclopediaSynergiesForTower('laser').some((s) => s.partnerType === 'sniper')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('flame').some((s) => s.partnerType === 'cannon')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('wind').some((s) => s.partnerType === 'pulse')).toBe(true);

    const preview = previewPlacementSynergies('sniper', 3, 2, [tower('l', 'laser', 2, 2)]);
    expect(preview.map((p) => p.name)).toContain('雙準連線');
  });

  it('keeps the catalog achievement aligned with the live synergy pool', () => {
    const poolSize = TOWER_SYNERGIES.length;
    expect(poolSize).toBeGreaterThanOrEqual(14);
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'synergy_catalog');
    expect(achievement).toBeDefined();
    expect(achievement!.conditions[0].target).toBe(poolSize);
  });
});
