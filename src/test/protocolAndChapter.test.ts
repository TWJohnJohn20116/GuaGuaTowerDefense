/**
 * 新戰術協議必須進池，戰役章節成就必須依通關關卡累計
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  applyInstantGrant,
  getProtocolWaveMods,
} from '@/data/tacticalProtocolData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { chapter1, resolveChaptersCompleted } from '@/data/campaignData';

const NEW_PROTOCOL_IDS = ['war_chest', 'salvo', 'wide_net'] as const;

describe('new tactical protocols', () => {
  it('registers three unique protocols with working effects', () => {
    const ids = TACTICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of NEW_PROTOCOL_IDS) {
      const proto = TACTICAL_PROTOCOLS.find((p) => p.id === id);
      expect(proto, id).toBeDefined();
      expect(proto!.name.length).toBeGreaterThan(0);
      expect(proto!.description.length).toBeGreaterThan(0);
    }
    expect(applyInstantGrant(TACTICAL_PROTOCOLS.find((p) => p.id === 'war_chest')!).money).toBeGreaterThan(90);
    expect(getProtocolWaveMods(TACTICAL_PROTOCOLS.find((p) => p.id === 'salvo')!).fireRateMult).toBeGreaterThan(1.28);
    expect(getProtocolWaveMods(TACTICAL_PROTOCOLS.find((p) => p.id === 'wide_net')!).rangeMult).toBeGreaterThan(1.18);
  });
});

describe('complete_chapter condition', () => {
  it('unlocks the first chapter achievement after finishing chapter 1', () => {
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'prog_campaign_1');
    expect(achievement).toBeDefined();
    const { met, progress } = checkCondition(
      achievement!,
      { ...getInitialStatistics(), chaptersCompleted: 1 },
      {},
    );
    expect(progress[0]).toBe(1);
    expect(met).toBe(true);
  });

  it('counts a just-cleared level that is not yet in the completed list', () => {
    const finished = chapter1.levels.slice(0, -1).map((lv) => lv.id);
    const lastId = chapter1.levels[chapter1.levels.length - 1].id;
    expect(resolveChaptersCompleted(finished)).toBe(0);
    expect(resolveChaptersCompleted(finished, lastId)).toBe(1);
  });
});
