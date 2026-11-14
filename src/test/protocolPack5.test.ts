/**
 * 第五批戰術協議：鑄幣、鐵幕、獵頭
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  getProtocolWaveMods,
  pickProtocolForStrategy,
} from '@/data/tacticalProtocolData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

const NEW_IDS = ['mint', 'iron_curtain', 'headhunter'] as const;

describe('fifth protocol pack', () => {
  it('registers three unique protocols with real combat effects', () => {
    const ids = TACTICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    const mint = TACTICAL_PROTOCOLS.find((p) => p.id === 'mint');
    expect(mint, 'mint').toBeDefined();
    expect(mint!.name).toBe('鑄幣廠');
    expect(getProtocolWaveMods(mint!).incomeMult).toBeGreaterThan(1.3);

    const curtain = TACTICAL_PROTOCOLS.find((p) => p.id === 'iron_curtain');
    expect(curtain, 'iron_curtain').toBeDefined();
    expect(curtain!.name).toBe('鐵幕');
    expect(getProtocolWaveMods(curtain!).leakDamageMult).toBeLessThan(0.45);

    const hunter = TACTICAL_PROTOCOLS.find((p) => p.id === 'headhunter');
    expect(hunter, 'headhunter').toBeDefined();
    expect(hunter!.name).toBe('獵頭協議');
    expect(getProtocolWaveMods(hunter!).critChanceAdd).toBeGreaterThan(0.24);

    for (const id of NEW_IDS) {
      expect(TACTICAL_PROTOCOLS.find((p) => p.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('lets auto-battle prefer the new cards', () => {
    const mint = TACTICAL_PROTOCOLS.find((p) => p.id === 'mint')!;
    const curtain = TACTICAL_PROTOCOLS.find((p) => p.id === 'iron_curtain')!;
    const hunter = TACTICAL_PROTOCOLS.find((p) => p.id === 'headhunter')!;
    const bounty = TACTICAL_PROTOCOLS.find((p) => p.id === 'bounty')!;
    const hospital = TACTICAL_PROTOCOLS.find((p) => p.id === 'field_hospital')!;
    const salvo = TACTICAL_PROTOCOLS.find((p) => p.id === 'salvo')!;
    expect(pickProtocolForStrategy([bounty, mint, salvo], 'economy').id).toBe('mint');
    expect(pickProtocolForStrategy([hospital, curtain, salvo], 'defensive').id).toBe('iron_curtain');
    expect(pickProtocolForStrategy([salvo, hunter, bounty], 'aggressive').id).toBe('headhunter');
  });

  it('keeps collection achievements aligned with the live protocol pool', () => {
    const poolSize = TACTICAL_PROTOCOLS.length;
    expect(poolSize).toBeGreaterThanOrEqual(27);
    expect(getProtocolWaveMods(null).incomeMult).toBe(1);
    for (const id of ['protocol_variety', 'tactic_protocol_all']) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement, id).toBeDefined();
      expect(achievement!.conditions[0].target).toBe(poolSize);
      expect(achievement!.description).toContain(String(poolSize));
    }
  });
});
