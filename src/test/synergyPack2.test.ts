/**
 * 第二批鄰塔協同：風／脈衝／弩砲要有真實配方，圖鑑與成就數量對齊
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

const NEW_IDS = ['wind_snipe', 'pulse_bolt', 'siege_line'] as const;

function tower(id: string, type: 'wind' | 'sniper' | 'pulse' | 'lightning' | 'ballista' | 'cannon', col: number, row: number) {
  return { id, type, col, row };
}

describe('second synergy pack', () => {
  it('registers three unique recipes with a real combat bonus', () => {
    const ids = TOWER_SYNERGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    const windSnipe = TOWER_SYNERGIES.find((s) => s.id === 'wind_snipe');
    expect(windSnipe, 'wind_snipe').toBeDefined();
    expect(windSnipe!.name).toBe('破風校準');
    expect(findSynergyRecipe('wind', 'sniper')?.id).toBe('wind_snipe');
    expect(windSnipe!.rangeMult).toBeGreaterThan(1);

    const pulseBolt = TOWER_SYNERGIES.find((s) => s.id === 'pulse_bolt');
    expect(pulseBolt, 'pulse_bolt').toBeDefined();
    expect(pulseBolt!.name).toBe('脈衝雷網');
    expect(findSynergyRecipe('pulse', 'lightning')?.id).toBe('pulse_bolt');
    expect(pulseBolt!.damageMult).toBeGreaterThan(1);

    const siege = TOWER_SYNERGIES.find((s) => s.id === 'siege_line');
    expect(siege, 'siege_line').toBeDefined();
    expect(siege!.name).toBe('攻城連線');
    expect(findSynergyRecipe('ballista', 'cannon')?.id).toBe('siege_line');
    expect(siege!.damageMult).toBeGreaterThan(1);

    for (const id of NEW_IDS) {
      expect(TOWER_SYNERGIES.find((s) => s.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('applies the new recipes when the pair is orthogonally adjacent', () => {
    const wind = tower('w', 'wind', 2, 2);
    const sniper = tower('s', 'sniper', 3, 2);
    expect(getSynergyModsForTower(wind, [wind, sniper]).rangeMult).toBeGreaterThan(1);
    expect(getSynergyModsForTower(sniper, [wind, sniper]).rangeMult).toBeGreaterThan(1);

    const pulse = tower('p', 'pulse', 4, 4);
    const bolt = tower('l', 'lightning', 4, 5);
    expect(getSynergyModsForTower(pulse, [pulse, bolt]).damageMult).toBeGreaterThan(1);

    const ballista = tower('b', 'ballista', 6, 6);
    const cannon = tower('c', 'cannon', 7, 6);
    expect(getSynergyModsForTower(ballista, [ballista, cannon]).damageMult).toBeGreaterThan(1);
  });

  it('shows up in encyclopedia and placement preview', () => {
    expect(getEncyclopediaSynergiesForTower('wind').some((s) => s.partnerType === 'sniper')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('pulse').some((s) => s.partnerType === 'lightning')).toBe(true);
    expect(getEncyclopediaSynergiesForTower('ballista').some((s) => s.partnerType === 'cannon')).toBe(true);

    const preview = previewPlacementSynergies('sniper', 3, 2, [tower('w', 'wind', 2, 2)]);
    expect(preview.map((p) => p.name)).toContain('破風校準');
  });

  it('keeps the catalog achievement aligned with the live synergy pool', () => {
    const poolSize = TOWER_SYNERGIES.length;
    expect(poolSize).toBeGreaterThanOrEqual(11);
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'synergy_catalog');
    expect(achievement).toBeDefined();
    expect(achievement!.conditions[0].target).toBe(poolSize);
  });
});
