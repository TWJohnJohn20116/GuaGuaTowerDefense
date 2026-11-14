/**
 * 第八批鄰塔協同：雷散、燃脈、機砲
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

const NEW_IDS = ['volt_spray', 'ember_pulse', 'mill_cannon'] as const;

function tower(
  id: string,
  type: 'lightning' | 'shotgun' | 'flame' | 'pulse' | 'machine' | 'cannon',
  col: number,
  row: number,
) {
  return { id, type, col, row };
}

describe('eighth synergy pack', () => {
  it('registers three unique recipes with a real combat bonus', () => {
    const ids = TOWER_SYNERGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    const voltSpray = TOWER_SYNERGIES.find((s) => s.id === 'volt_spray');
    expect(voltSpray, 'volt_spray').toBeDefined();
    expect(voltSpray!.name).toBe('雷散連線');
    expect(findSynergyRecipe('lightning', 'shotgun')?.id).toBe('volt_spray');
    expect(voltSpray!.damageMult).toBeGreaterThan(1);

    const emberPulse = TOWER_SYNERGIES.find((s) => s.id === 'ember_pulse');
    expect(emberPulse, 'ember_pulse').toBeDefined();
    expect(emberPulse!.name).toBe('燃脈連線');
    expect(findSynergyRecipe('flame', 'pulse')?.id).toBe('ember_pulse');
    expect(emberPulse!.fireRateMult).toBeGreaterThan(1);

    const millCannon = TOWER_SYNERGIES.find((s) => s.id === 'mill_cannon');
    expect(millCannon, 'mill_cannon').toBeDefined();
    expect(millCannon!.name).toBe('機砲火網');
    expect(findSynergyRecipe('machine', 'cannon')?.id).toBe('mill_cannon');
    expect(millCannon!.damageMult).toBeGreaterThan(1);

    for (const id of NEW_IDS) {
      expect(TOWER_SYNERGIES.find((s) => s.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('applies the new recipes when the pair is orthogonally adjacent', () => {
    const lightning = tower('l', 'lightning', 2, 2);
    const shotgun = tower('g', 'shotgun', 3, 2);
    expect(getSynergyModsForTower(lightning, [lightning, shotgun]).damageMult).toBeGreaterThan(1);

    const flame = tower('f', 'flame', 4, 4);
    const pulse = tower('p', 'pulse', 4, 5);
    expect(getSynergyModsForTower(flame, [flame, pulse]).fireRateMult).toBeGreaterThan(1);

    const machine = tower('m', 'machine', 6, 6);
    const cannon = tower('c', 'cannon', 7, 6);
    expect(getSynergyModsForTower(machine, [machine, cannon]).damageMult).toBeGreaterThan(1);
  });

  it('shows up in encyclopedia and placement preview', () => {
    expect(getEncyclopediaSynergiesForTower('lightning').some((s) => s.partnerType === 'shotgun')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('flame').some((s) => s.partnerType === 'pulse')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('machine').some((s) => s.partnerType === 'cannon')).toBe(true);

    const preview = previewPlacementSynergies('cannon', 7, 6, [tower('m', 'machine', 6, 6)]);
    expect(preview.map((p) => p.name)).toContain('機砲火網');
  });

  it('keeps the catalog achievement aligned with the live synergy pool', () => {
    const poolSize = TOWER_SYNERGIES.length;
    expect(poolSize).toBeGreaterThanOrEqual(29);
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'synergy_catalog');
    expect(achievement).toBeDefined();
    expect(achievement!.conditions[0].target).toBe(poolSize);
    expect(achievement!.description).toContain(String(poolSize));
  });
});
