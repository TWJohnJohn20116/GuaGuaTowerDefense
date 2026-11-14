/**
 * 第九批鄰塔協同：毒脈、焰束、砲庫
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

const NEW_IDS = ['toxic_pulse', 'beam_flame', 'vault_cannon'] as const;

function tower(
  id: string,
  type: 'poison' | 'pulse' | 'laser' | 'flame' | 'money' | 'cannon',
  col: number,
  row: number,
) {
  return { id, type, col, row };
}

describe('ninth synergy pack', () => {
  it('registers three unique recipes with a real combat bonus', () => {
    const ids = TOWER_SYNERGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    const toxicPulse = TOWER_SYNERGIES.find((s) => s.id === 'toxic_pulse');
    expect(toxicPulse, 'toxic_pulse').toBeDefined();
    expect(toxicPulse!.name).toBe('毒脈連線');
    expect(findSynergyRecipe('poison', 'pulse')?.id).toBe('toxic_pulse');
    expect(toxicPulse!.damageMult).toBeGreaterThan(1);

    const beamFlame = TOWER_SYNERGIES.find((s) => s.id === 'beam_flame');
    expect(beamFlame, 'beam_flame').toBeDefined();
    expect(beamFlame!.name).toBe('焰束連線');
    expect(findSynergyRecipe('laser', 'flame')?.id).toBe('beam_flame');
    expect(beamFlame!.damageMult).toBeGreaterThan(1);

    const vaultCannon = TOWER_SYNERGIES.find((s) => s.id === 'vault_cannon');
    expect(vaultCannon, 'vault_cannon').toBeDefined();
    expect(vaultCannon!.name).toBe('砲庫連線');
    expect(findSynergyRecipe('money', 'cannon')?.id).toBe('vault_cannon');
    expect(vaultCannon!.incomeMult).toBeGreaterThan(1);

    for (const id of NEW_IDS) {
      expect(TOWER_SYNERGIES.find((s) => s.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('applies the new recipes when the pair is orthogonally adjacent', () => {
    const poison = tower('o', 'poison', 2, 2);
    const pulse = tower('p', 'pulse', 3, 2);
    expect(getSynergyModsForTower(poison, [poison, pulse]).damageMult).toBeGreaterThan(1);

    const laser = tower('l', 'laser', 4, 4);
    const flame = tower('f', 'flame', 4, 5);
    expect(getSynergyModsForTower(laser, [laser, flame]).damageMult).toBeGreaterThan(1);

    const money = tower('m', 'money', 6, 6);
    const cannon = tower('c', 'cannon', 7, 6);
    expect(getSynergyModsForTower(money, [money, cannon]).incomeMult).toBeGreaterThan(1);
  });

  it('shows up in encyclopedia and placement preview', () => {
    expect(getEncyclopediaSynergiesForTower('poison').some((s) => s.partnerType === 'pulse')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('laser').some((s) => s.partnerType === 'flame')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('money').some((s) => s.partnerType === 'cannon')).toBe(true);

    const preview = previewPlacementSynergies('cannon', 7, 6, [tower('m', 'money', 6, 6)]);
    expect(preview.map((p) => p.name)).toContain('砲庫連線');
  });

  it('keeps the catalog achievement aligned with the live synergy pool', () => {
    const poolSize = TOWER_SYNERGIES.length;
    expect(poolSize).toBeGreaterThanOrEqual(32);
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'synergy_catalog');
    expect(achievement).toBeDefined();
    expect(achievement!.conditions[0].target).toBe(poolSize);
    expect(achievement!.description).toContain(String(poolSize));
  });
});
