/**
 * 第六批鄰塔協同：燃機、脈衝砲、毒雷
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

const NEW_IDS = ['ember_spray', 'pulse_cannon', 'toxic_bolt'] as const;

function tower(
  id: string,
  type: 'flame' | 'machine' | 'pulse' | 'cannon' | 'poison' | 'lightning',
  col: number,
  row: number,
) {
  return { id, type, col, row };
}

describe('sixth synergy pack', () => {
  it('registers three unique recipes with a real combat bonus', () => {
    const ids = TOWER_SYNERGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    const ember = TOWER_SYNERGIES.find((s) => s.id === 'ember_spray');
    expect(ember, 'ember_spray').toBeDefined();
    expect(ember!.name).toBe('燃機火網');
    expect(findSynergyRecipe('flame', 'machine')?.id).toBe('ember_spray');
    expect(ember!.fireRateMult).toBeGreaterThan(1);

    const pulseCannon = TOWER_SYNERGIES.find((s) => s.id === 'pulse_cannon');
    expect(pulseCannon, 'pulse_cannon').toBeDefined();
    expect(pulseCannon!.name).toBe('脈衝砲擊');
    expect(findSynergyRecipe('pulse', 'cannon')?.id).toBe('pulse_cannon');
    expect(pulseCannon!.damageMult).toBeGreaterThan(1);

    const toxicBolt = TOWER_SYNERGIES.find((s) => s.id === 'toxic_bolt');
    expect(toxicBolt, 'toxic_bolt').toBeDefined();
    expect(toxicBolt!.name).toBe('毒雷連線');
    expect(findSynergyRecipe('poison', 'lightning')?.id).toBe('toxic_bolt');
    expect(toxicBolt!.damageMult).toBeGreaterThan(1);

    for (const id of NEW_IDS) {
      expect(TOWER_SYNERGIES.find((s) => s.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('applies the new recipes when the pair is orthogonally adjacent', () => {
    const flame = tower('f', 'flame', 2, 2);
    const machine = tower('m', 'machine', 3, 2);
    expect(getSynergyModsForTower(flame, [flame, machine]).fireRateMult).toBeGreaterThan(1);

    const pulse = tower('p', 'pulse', 4, 4);
    const cannon = tower('c', 'cannon', 4, 5);
    expect(getSynergyModsForTower(pulse, [pulse, cannon]).damageMult).toBeGreaterThan(1);

    const poison = tower('o', 'poison', 6, 6);
    const lightning = tower('l', 'lightning', 7, 6);
    expect(getSynergyModsForTower(poison, [poison, lightning]).damageMult).toBeGreaterThan(1);
  });

  it('shows up in encyclopedia and placement preview', () => {
    expect(getEncyclopediaSynergiesForTower('flame').some((s) => s.partnerType === 'machine')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('pulse').some((s) => s.partnerType === 'cannon')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('poison').some((s) => s.partnerType === 'lightning')).toBe(true);

    const preview = previewPlacementSynergies('machine', 3, 2, [tower('f', 'flame', 2, 2)]);
    expect(preview.map((p) => p.name)).toContain('燃機火網');
  });

  it('keeps the catalog achievement aligned with the live synergy pool', () => {
    const poolSize = TOWER_SYNERGIES.length;
    expect(poolSize).toBeGreaterThanOrEqual(23);
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'synergy_catalog');
    expect(achievement).toBeDefined();
    expect(achievement!.conditions[0].target).toBe(poolSize);
    expect(achievement!.description).toContain(String(poolSize));
  });
});
