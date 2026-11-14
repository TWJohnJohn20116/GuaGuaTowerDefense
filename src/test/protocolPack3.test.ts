/**
 * 第三批戰術協議：經濟向加強牌，自動戰鬥的經濟策略會優先選
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  applyInstantGrant,
  getProtocolWaveMods,
  pickProtocolForStrategy,
} from '@/data/tacticalProtocolData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

const NEW_IDS = ['plunder', 'express_permit', 'scavenge'] as const;

describe('third protocol pack', () => {
  it('registers three unique stronger economy protocols', () => {
    const ids = TACTICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    const plunder = TACTICAL_PROTOCOLS.find((p) => p.id === 'plunder');
    expect(plunder, 'plunder').toBeDefined();
    expect(plunder!.name).toBe('掠奪令');
    expect(getProtocolWaveMods(plunder!).enemyRewardMult).toBeGreaterThan(1.4);

    const permit = TACTICAL_PROTOCOLS.find((p) => p.id === 'express_permit');
    expect(permit, 'express_permit').toBeDefined();
    expect(permit!.name).toBe('特急許可');
    expect(applyInstantGrant(permit!).nextTowerDiscount).toBeGreaterThan(0.45);

    const scavenge = TACTICAL_PROTOCOLS.find((p) => p.id === 'scavenge');
    expect(scavenge, 'scavenge').toBeDefined();
    expect(scavenge!.name).toBe('戰場搜刮');
    expect(getProtocolWaveMods(scavenge!).waveClearBonus).toBeGreaterThan(120);

    for (const id of NEW_IDS) {
      expect(TACTICAL_PROTOCOLS.find((p) => p.id === id)!.description.length).toBeGreaterThan(0);
    }
  });

  it('lets auto-battle economy prefer the new cards', () => {
    const plunder = TACTICAL_PROTOCOLS.find((p) => p.id === 'plunder')!;
    const permit = TACTICAL_PROTOCOLS.find((p) => p.id === 'express_permit')!;
    const scavenge = TACTICAL_PROTOCOLS.find((p) => p.id === 'scavenge')!;
    const bounty = TACTICAL_PROTOCOLS.find((p) => p.id === 'bounty')!;
    const rush = TACTICAL_PROTOCOLS.find((p) => p.id === 'rush_permit')!;
    const salvage = TACTICAL_PROTOCOLS.find((p) => p.id === 'salvage_rights')!;
    expect(pickProtocolForStrategy([bounty, plunder, salvage], 'economy').id).toBe('plunder');
    expect(pickProtocolForStrategy([rush, permit, bounty], 'economy').id).toBe('express_permit');
    expect(pickProtocolForStrategy([salvage, scavenge, bounty], 'economy').id).toBe('scavenge');
  });

  it('keeps collection achievements aligned with the live protocol pool', () => {
    const poolSize = TACTICAL_PROTOCOLS.length;
    expect(poolSize).toBeGreaterThanOrEqual(21);
    for (const id of ['protocol_variety', 'tactic_protocol_all']) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement, id).toBeDefined();
      expect(achievement!.conditions[0].target).toBe(poolSize);
    }
  });
});
