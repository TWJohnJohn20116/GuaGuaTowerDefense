/**
 * 第四批戰術協議：傷害向加強牌，自動戰鬥的進攻／防守策略會優先選
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  applyInstantGrant,
  getProtocolWaveMods,
  pickProtocolForStrategy,
} from '@/data/tacticalProtocolData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

const NEW_IDS = ['kill_zone', 'field_hospital', 'shatter'] as const;

describe('fourth protocol pack', () => {
  it('registers three unique combat protocols', () => {
    const ids = TACTICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    const killZone = TACTICAL_PROTOCOLS.find((p) => p.id === 'kill_zone');
    expect(killZone, 'kill_zone').toBeDefined();
    expect(killZone!.name).toBe('殺傷區');
    expect(getProtocolWaveMods(killZone!).damageMult).toBeGreaterThan(1.15);

    const hospital = TACTICAL_PROTOCOLS.find((p) => p.id === 'field_hospital');
    expect(hospital, 'field_hospital').toBeDefined();
    expect(hospital!.name).toBe('野戰醫院');
    expect(applyInstantGrant(hospital!).health).toBeGreaterThan(16);

    const shatter = TACTICAL_PROTOCOLS.find((p) => p.id === 'shatter');
    expect(shatter, 'shatter').toBeDefined();
    expect(shatter!.name).toBe('粉碎協議');
    expect(getProtocolWaveMods(shatter!).enemyHealthMult).toBeLessThan(0.82);

    for (const id of NEW_IDS) {
      expect(TACTICAL_PROTOCOLS.find((p) => p.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('lets auto-battle prefer the new cards', () => {
    const killZone = TACTICAL_PROTOCOLS.find((p) => p.id === 'kill_zone')!;
    const hospital = TACTICAL_PROTOCOLS.find((p) => p.id === 'field_hospital')!;
    const shatter = TACTICAL_PROTOCOLS.find((p) => p.id === 'shatter')!;
    const salvo = TACTICAL_PROTOCOLS.find((p) => p.id === 'salvo')!;
    const medevac = TACTICAL_PROTOCOLS.find((p) => p.id === 'medevac')!;
    const scan = TACTICAL_PROTOCOLS.find((p) => p.id === 'weakness_scan')!;
    expect(pickProtocolForStrategy([salvo, killZone, scan], 'aggressive').id).toBe('kill_zone');
    expect(pickProtocolForStrategy([scan, shatter, salvo], 'aggressive').id).toBe('shatter');
    expect(pickProtocolForStrategy([medevac, hospital, salvo], 'defensive').id).toBe('field_hospital');
  });

  it('keeps collection achievements aligned with the live protocol pool', () => {
    const poolSize = TACTICAL_PROTOCOLS.length;
    expect(poolSize).toBeGreaterThanOrEqual(24);
    expect(getProtocolWaveMods(null).damageMult).toBe(1);
    for (const id of ['protocol_variety', 'tactic_protocol_all']) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement, id).toBeDefined();
      expect(achievement!.conditions[0].target).toBe(poolSize);
      expect(achievement!.description).toContain(String(poolSize));
    }
  });
});
