/**
 * 第六批戰術協議：屯積、冰河、準星
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  getProtocolWaveMods,
  pickProtocolForStrategy,
} from '@/data/tacticalProtocolData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

const NEW_IDS = ['stockpile', 'ice_age', 'bullseye'] as const;

describe('sixth protocol pack', () => {
  it('registers three unique protocols with real combat effects', () => {
    const ids = TACTICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    const stockpile = TACTICAL_PROTOCOLS.find((p) => p.id === 'stockpile');
    expect(stockpile, 'stockpile').toBeDefined();
    expect(stockpile!.name).toBe('屯積協議');
    expect(getProtocolWaveMods(stockpile!).waveClearBonus).toBeGreaterThan(220);

    const iceAge = TACTICAL_PROTOCOLS.find((p) => p.id === 'ice_age');
    expect(iceAge, 'ice_age').toBeDefined();
    expect(iceAge!.name).toBe('冰河期');
    expect(getProtocolWaveMods(iceAge!).enemySlow).toBeGreaterThan(0.58);

    const bullseye = TACTICAL_PROTOCOLS.find((p) => p.id === 'bullseye');
    expect(bullseye, 'bullseye').toBeDefined();
    expect(bullseye!.name).toBe('準星協議');
    expect(getProtocolWaveMods(bullseye!).critChanceAdd).toBeGreaterThan(0.3);

    for (const id of NEW_IDS) {
      expect(TACTICAL_PROTOCOLS.find((p) => p.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('lets auto-battle prefer the new cards', () => {
    const stockpile = TACTICAL_PROTOCOLS.find((p) => p.id === 'stockpile')!;
    const iceAge = TACTICAL_PROTOCOLS.find((p) => p.id === 'ice_age')!;
    const bullseye = TACTICAL_PROTOCOLS.find((p) => p.id === 'bullseye')!;
    const bounty = TACTICAL_PROTOCOLS.find((p) => p.id === 'bounty')!;
    const hospital = TACTICAL_PROTOCOLS.find((p) => p.id === 'field_hospital')!;
    const salvo = TACTICAL_PROTOCOLS.find((p) => p.id === 'salvo')!;
    expect(pickProtocolForStrategy([bounty, stockpile, salvo], 'economy').id).toBe('stockpile');
    expect(pickProtocolForStrategy([hospital, iceAge, salvo], 'defensive').id).toBe('ice_age');
    expect(pickProtocolForStrategy([salvo, bullseye, bounty], 'aggressive').id).toBe('bullseye');
  });

  it('keeps collection achievements aligned with the live protocol pool', () => {
    const poolSize = TACTICAL_PROTOCOLS.length;
    expect(poolSize).toBeGreaterThanOrEqual(30);
    for (const id of ['protocol_variety', 'tactic_protocol_all']) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement, id).toBeDefined();
      expect(achievement!.conditions[0].target).toBe(poolSize);
      expect(achievement!.description).toContain(String(poolSize));
    }
  });
});
