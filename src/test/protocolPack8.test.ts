/**
 * 第八批戰術協議：橫財、遠眺、處決
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  applyInstantGrant,
  getProtocolWaveMods,
  pickProtocolForStrategy,
} from '@/data/tacticalProtocolData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

const NEW_IDS = ['windfall', 'longshot', 'execute'] as const;

describe('eighth protocol pack', () => {
  it('registers three unique protocols with real combat effects', () => {
    const ids = TACTICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    const windfall = TACTICAL_PROTOCOLS.find((p) => p.id === 'windfall');
    expect(windfall, 'windfall').toBeDefined();
    expect(windfall!.name).toBe('橫財');
    expect(applyInstantGrant(windfall!).money).toBeGreaterThan(220);

    const longshot = TACTICAL_PROTOCOLS.find((p) => p.id === 'longshot');
    expect(longshot, 'longshot').toBeDefined();
    expect(longshot!.name).toBe('遠眺協議');
    expect(getProtocolWaveMods(longshot!).rangeMult).toBeGreaterThan(1.35);

    const execute = TACTICAL_PROTOCOLS.find((p) => p.id === 'execute');
    expect(execute, 'execute').toBeDefined();
    expect(execute!.name).toBe('處決協議');
    expect(getProtocolWaveMods(execute!).enemyHealthMult).toBeLessThan(0.65);

    for (const id of NEW_IDS) {
      expect(TACTICAL_PROTOCOLS.find((p) => p.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('lets auto-battle prefer the new cards', () => {
    const windfall = TACTICAL_PROTOCOLS.find((p) => p.id === 'windfall')!;
    const longshot = TACTICAL_PROTOCOLS.find((p) => p.id === 'longshot')!;
    const execute = TACTICAL_PROTOCOLS.find((p) => p.id === 'execute')!;
    const bounty = TACTICAL_PROTOCOLS.find((p) => p.id === 'bounty')!;
    const hospital = TACTICAL_PROTOCOLS.find((p) => p.id === 'field_hospital')!;
    const salvo = TACTICAL_PROTOCOLS.find((p) => p.id === 'salvo')!;
    expect(pickProtocolForStrategy([bounty, windfall, salvo], 'economy').id).toBe('windfall');
    expect(pickProtocolForStrategy([hospital, longshot, salvo], 'defensive').id).toBe('longshot');
    expect(pickProtocolForStrategy([salvo, execute, bounty], 'aggressive').id).toBe('execute');
  });

  it('keeps collection achievements aligned with the live protocol pool', () => {
    const poolSize = TACTICAL_PROTOCOLS.length;
    expect(poolSize).toBeGreaterThanOrEqual(36);
    for (const id of ['protocol_variety', 'tactic_protocol_all']) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement, id).toBeDefined();
      expect(achievement!.conditions[0].target).toBe(poolSize);
      expect(achievement!.description).toContain(String(poolSize));
    }
  });
});
