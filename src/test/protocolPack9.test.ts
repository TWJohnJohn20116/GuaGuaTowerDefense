/**
 * 第九批戰術協議：大運、冰川、清算
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  applyInstantGrant,
  getProtocolWaveMods,
  pickProtocolForStrategy,
} from '@/data/tacticalProtocolData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

const NEW_IDS = ['haul', 'glacier', 'purge'] as const;

describe('ninth protocol pack', () => {
  it('registers three unique protocols with real combat effects', () => {
    const ids = TACTICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    const haul = TACTICAL_PROTOCOLS.find((p) => p.id === 'haul');
    expect(haul, 'haul').toBeDefined();
    expect(haul!.name).toBe('大運');
    expect(applyInstantGrant(haul!).money).toBeGreaterThan(260);

    const glacier = TACTICAL_PROTOCOLS.find((p) => p.id === 'glacier');
    expect(glacier, 'glacier').toBeDefined();
    expect(glacier!.name).toBe('冰川協議');
    expect(getProtocolWaveMods(glacier!).enemySlow).toBeGreaterThan(0.7);

    const purge = TACTICAL_PROTOCOLS.find((p) => p.id === 'purge');
    expect(purge, 'purge').toBeDefined();
    expect(purge!.name).toBe('清算協議');
    expect(getProtocolWaveMods(purge!).enemyHealthMult).toBeLessThan(0.58);

    for (const id of NEW_IDS) {
      expect(TACTICAL_PROTOCOLS.find((p) => p.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('lets auto-battle prefer the new cards', () => {
    const haul = TACTICAL_PROTOCOLS.find((p) => p.id === 'haul')!;
    const glacier = TACTICAL_PROTOCOLS.find((p) => p.id === 'glacier')!;
    const purge = TACTICAL_PROTOCOLS.find((p) => p.id === 'purge')!;
    const bounty = TACTICAL_PROTOCOLS.find((p) => p.id === 'bounty')!;
    const hospital = TACTICAL_PROTOCOLS.find((p) => p.id === 'field_hospital')!;
    const salvo = TACTICAL_PROTOCOLS.find((p) => p.id === 'salvo')!;
    expect(pickProtocolForStrategy([bounty, haul, salvo], 'economy').id).toBe('haul');
    expect(pickProtocolForStrategy([hospital, glacier, salvo], 'defensive').id).toBe('glacier');
    expect(pickProtocolForStrategy([salvo, purge, bounty], 'aggressive').id).toBe('purge');
  });

  it('keeps collection achievements aligned with the live protocol pool', () => {
    const poolSize = TACTICAL_PROTOCOLS.length;
    expect(poolSize).toBeGreaterThanOrEqual(39);
    for (const id of ['protocol_variety', 'tactic_protocol_all']) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement, id).toBeDefined();
      expect(achievement!.conditions[0].target).toBe(poolSize);
      expect(achievement!.description).toContain(String(poolSize));
    }
  });
});
