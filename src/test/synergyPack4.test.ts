/**
 * 第四批鄰塔協同：散彈／金庫／弩砲要有真實配方，圖鑑與成就數量對齊
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

const NEW_IDS = ['chill_shot', 'pulse_vault', 'siege_snipe'] as const;

function tower(
  id: string,
  type: 'frost' | 'shotgun' | 'money' | 'pulse' | 'ballista' | 'sniper',
  col: number,
  row: number,
) {
  return { id, type, col, row };
}

describe('fourth synergy pack', () => {
  it('registers three unique recipes with a real combat bonus', () => {
    const ids = TOWER_SYNERGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    const chillShot = TOWER_SYNERGIES.find((s) => s.id === 'chill_shot');
    expect(chillShot, 'chill_shot').toBeDefined();
    expect(chillShot!.name).toBe('寒霜散彈');
    expect(findSynergyRecipe('frost', 'shotgun')?.id).toBe('chill_shot');
    expect(chillShot!.damageMult).toBeGreaterThan(1);

    const pulseVault = TOWER_SYNERGIES.find((s) => s.id === 'pulse_vault');
    expect(pulseVault, 'pulse_vault').toBeDefined();
    expect(pulseVault!.name).toBe('脈衝金庫');
    expect(findSynergyRecipe('money', 'pulse')?.id).toBe('pulse_vault');
    expect(pulseVault!.incomeMult).toBeGreaterThan(1);

    const siegeSnipe = TOWER_SYNERGIES.find((s) => s.id === 'siege_snipe');
    expect(siegeSnipe, 'siege_snipe').toBeDefined();
    expect(siegeSnipe!.name).toBe('弩準連線');
    expect(findSynergyRecipe('ballista', 'sniper')?.id).toBe('siege_snipe');
    expect(siegeSnipe!.rangeMult).toBeGreaterThan(1);

    for (const id of NEW_IDS) {
      expect(TOWER_SYNERGIES.find((s) => s.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('applies the new recipes when the pair is orthogonally adjacent', () => {
    const frost = tower('f', 'frost', 2, 2);
    const shotgun = tower('g', 'shotgun', 3, 2);
    expect(getSynergyModsForTower(frost, [frost, shotgun]).damageMult).toBeGreaterThan(1);

    const money = tower('m', 'money', 4, 4);
    const pulse = tower('p', 'pulse', 4, 5);
    expect(getSynergyModsForTower(money, [money, pulse]).incomeMult).toBeGreaterThan(1);

    const ballista = tower('b', 'ballista', 6, 6);
    const sniper = tower('s', 'sniper', 7, 6);
    expect(getSynergyModsForTower(ballista, [ballista, sniper]).rangeMult).toBeGreaterThan(1);
  });

  it('shows up in encyclopedia and placement preview', () => {
    expect(getEncyclopediaSynergiesForTower('frost').some((s) => s.partnerType === 'shotgun')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('money').some((s) => s.partnerType === 'pulse')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('ballista').some((s) => s.partnerType === 'sniper')).toBe(true);

    const preview = previewPlacementSynergies('shotgun', 3, 2, [tower('f', 'frost', 2, 2)]);
    expect(preview.map((p) => p.name)).toContain('寒霜散彈');
  });

  it('keeps the catalog achievement aligned with the live synergy pool', () => {
    const poolSize = TOWER_SYNERGIES.length;
    expect(poolSize).toBeGreaterThanOrEqual(17);
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'synergy_catalog');
    expect(achievement).toBeDefined();
    expect(achievement!.conditions[0].target).toBe(poolSize);
    expect(achievement!.description).toContain(String(poolSize));
  });
});
