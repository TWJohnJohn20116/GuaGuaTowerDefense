/**
 * 第二批戰術協議必須進池，效果比既有同類型更強，自動戰鬥會優先選
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  applyInstantGrant,
  getProtocolWaveMods,
  pickProtocolForStrategy,
} from '@/data/tacticalProtocolData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

const NEW_IDS = ['medevac', 'deep_freeze', 'crit_storm'] as const;

describe('second protocol pack', () => {
  it('registers three unique stronger protocols', () => {
    const ids = TACTICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    const medevac = TACTICAL_PROTOCOLS.find((p) => p.id === 'medevac');
    expect(medevac, 'medevac').toBeDefined();
    expect(medevac!.name).toBe('戰地後送');
    expect(applyInstantGrant(medevac!).health).toBeGreaterThan(8);

    const freeze = TACTICAL_PROTOCOLS.find((p) => p.id === 'deep_freeze');
    expect(freeze, 'deep_freeze').toBeDefined();
    expect(freeze!.name).toBe('深凍協議');
    expect(getProtocolWaveMods(freeze!).enemySlow).toBeGreaterThan(0.4);

    const storm = TACTICAL_PROTOCOLS.find((p) => p.id === 'crit_storm');
    expect(storm, 'crit_storm').toBeDefined();
    expect(storm!.name).toBe('暴擊風暴');
    expect(getProtocolWaveMods(storm!).critChanceAdd).toBeGreaterThan(0.15);

    for (const id of NEW_IDS) {
      expect(TACTICAL_PROTOCOLS.find((p) => p.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('lets auto-battle prefer the new defensive and aggressive cards', () => {
    const medevac = TACTICAL_PROTOCOLS.find((p) => p.id === 'medevac')!;
    const freeze = TACTICAL_PROTOCOLS.find((p) => p.id === 'deep_freeze')!;
    const storm = TACTICAL_PROTOCOLS.find((p) => p.id === 'crit_storm')!;
    const bounty = TACTICAL_PROTOCOLS.find((p) => p.id === 'bounty')!;
    expect(pickProtocolForStrategy([bounty, freeze, storm], 'defensive').id).toBe('deep_freeze');
    expect(pickProtocolForStrategy([bounty, medevac, storm], 'defensive').id).toBe('medevac');
    expect(pickProtocolForStrategy([bounty, freeze, storm], 'aggressive').id).toBe('crit_storm');
  });

  it('keeps collection achievements aligned with the live protocol pool', () => {
    const poolSize = TACTICAL_PROTOCOLS.length;
    expect(poolSize).toBeGreaterThanOrEqual(18);
    for (const id of ['protocol_variety', 'tactic_protocol_all']) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement, id).toBeDefined();
      expect(achievement!.conditions[0].target).toBe(poolSize);
    }
  });
});
