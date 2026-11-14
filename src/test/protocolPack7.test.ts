/**
 * 第七批戰術協議：發薪、超視、淘汰
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  applyInstantGrant,
  getProtocolWaveMods,
  pickProtocolForStrategy,
} from '@/data/tacticalProtocolData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

const NEW_IDS = ['payday', 'overwatch', 'culling'] as const;

describe('seventh protocol pack', () => {
  it('registers three unique protocols with real combat effects', () => {
    const ids = TACTICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    const payday = TACTICAL_PROTOCOLS.find((p) => p.id === 'payday');
    expect(payday, 'payday').toBeDefined();
    expect(payday!.name).toBe('發薪日');
    expect(applyInstantGrant(payday!).money).toBeGreaterThan(170);

    const overwatch = TACTICAL_PROTOCOLS.find((p) => p.id === 'overwatch');
    expect(overwatch, 'overwatch').toBeDefined();
    expect(overwatch!.name).toBe('超視協議');
    expect(getProtocolWaveMods(overwatch!).rangeMult).toBeGreaterThan(1.28);

    const culling = TACTICAL_PROTOCOLS.find((p) => p.id === 'culling');
    expect(culling, 'culling').toBeDefined();
    expect(culling!.name).toBe('淘汰協議');
    expect(getProtocolWaveMods(culling!).enemyHealthMult).toBeLessThan(0.72);

    for (const id of NEW_IDS) {
      expect(TACTICAL_PROTOCOLS.find((p) => p.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('lets auto-battle prefer the new cards', () => {
    const payday = TACTICAL_PROTOCOLS.find((p) => p.id === 'payday')!;
    const overwatch = TACTICAL_PROTOCOLS.find((p) => p.id === 'overwatch')!;
    const culling = TACTICAL_PROTOCOLS.find((p) => p.id === 'culling')!;
    const bounty = TACTICAL_PROTOCOLS.find((p) => p.id === 'bounty')!;
    const hospital = TACTICAL_PROTOCOLS.find((p) => p.id === 'field_hospital')!;
    const salvo = TACTICAL_PROTOCOLS.find((p) => p.id === 'salvo')!;
    expect(pickProtocolForStrategy([bounty, payday, salvo], 'economy').id).toBe('payday');
    expect(pickProtocolForStrategy([hospital, overwatch, salvo], 'defensive').id).toBe('overwatch');
    expect(pickProtocolForStrategy([salvo, culling, bounty], 'aggressive').id).toBe('culling');
  });

  it('keeps collection achievements aligned with the live protocol pool', () => {
    const poolSize = TACTICAL_PROTOCOLS.length;
    expect(poolSize).toBeGreaterThanOrEqual(33);
    for (const id of ['protocol_variety', 'tactic_protocol_all']) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement, id).toBeDefined();
      expect(achievement!.conditions[0].target).toBe(poolSize);
      expect(achievement!.description).toContain(String(poolSize));
    }
  });
});
