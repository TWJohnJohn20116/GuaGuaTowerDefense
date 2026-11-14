/**
 * 第五批鄰塔協同：雷光、彈幕、霜風
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

const NEW_IDS = ['volt_beam', 'spray_line', 'frost_gale'] as const;

function tower(
  id: string,
  type: 'laser' | 'lightning' | 'shotgun' | 'machine' | 'frost' | 'wind',
  col: number,
  row: number,
) {
  return { id, type, col, row };
}

describe('fifth synergy pack', () => {
  it('registers three unique recipes with a real combat bonus', () => {
    const ids = TOWER_SYNERGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    const voltBeam = TOWER_SYNERGIES.find((s) => s.id === 'volt_beam');
    expect(voltBeam, 'volt_beam').toBeDefined();
    expect(voltBeam!.name).toBe('雷光連線');
    expect(findSynergyRecipe('laser', 'lightning')?.id).toBe('volt_beam');
    expect(voltBeam!.damageMult).toBeGreaterThan(1);

    const sprayLine = TOWER_SYNERGIES.find((s) => s.id === 'spray_line');
    expect(sprayLine, 'spray_line').toBeDefined();
    expect(sprayLine!.name).toBe('彈幕火網');
    expect(findSynergyRecipe('shotgun', 'machine')?.id).toBe('spray_line');
    expect(sprayLine!.fireRateMult).toBeGreaterThan(1);

    const frostGale = TOWER_SYNERGIES.find((s) => s.id === 'frost_gale');
    expect(frostGale, 'frost_gale').toBeDefined();
    expect(frostGale!.name).toBe('霜風夾擊');
    expect(findSynergyRecipe('frost', 'wind')?.id).toBe('frost_gale');
    expect(frostGale!.rangeMult).toBeGreaterThan(1);

    for (const id of NEW_IDS) {
      expect(TOWER_SYNERGIES.find((s) => s.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('applies the new recipes when the pair is orthogonally adjacent', () => {
    const laser = tower('l', 'laser', 2, 2);
    const lightning = tower('n', 'lightning', 3, 2);
    expect(getSynergyModsForTower(laser, [laser, lightning]).damageMult).toBeGreaterThan(1);

    const shotgun = tower('g', 'shotgun', 4, 4);
    const machine = tower('m', 'machine', 4, 5);
    expect(getSynergyModsForTower(shotgun, [shotgun, machine]).fireRateMult).toBeGreaterThan(1);

    const frost = tower('f', 'frost', 6, 6);
    const wind = tower('w', 'wind', 7, 6);
    expect(getSynergyModsForTower(frost, [frost, wind]).rangeMult).toBeGreaterThan(1);
  });

  it('shows up in encyclopedia and placement preview', () => {
    expect(getEncyclopediaSynergiesForTower('laser').some((s) => s.partnerType === 'lightning')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('shotgun').some((s) => s.partnerType === 'machine')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('frost').some((s) => s.partnerType === 'wind')).toBe(true);

    const preview = previewPlacementSynergies('machine', 4, 5, [tower('g', 'shotgun', 4, 4)]);
    expect(preview.map((p) => p.name)).toContain('彈幕火網');
  });

  it('keeps the catalog achievement aligned with the live synergy pool', () => {
    const poolSize = TOWER_SYNERGIES.length;
    expect(poolSize).toBeGreaterThanOrEqual(20);
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'synergy_catalog');
    expect(achievement).toBeDefined();
    expect(achievement!.conditions[0].target).toBe(poolSize);
    expect(achievement!.description).toContain(String(poolSize));
  });
});
