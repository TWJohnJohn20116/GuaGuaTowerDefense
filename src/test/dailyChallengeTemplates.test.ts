/**
 * 每日挑戰新模板，以及融合次數條件可被結算
 */

import { describe, it, expect } from 'vitest';
import { DAILY_CHALLENGE_TEMPLATES } from '@/data/dailyChallengeData';
import { evaluateDailyCondition, type GameOutcomeForChallenge } from '@/store/dailyChallengeStore';

const NEW_IDS = [
  'dc_fusion_rite',
  'dc_ballista_wall',
  'dc_ghost_banish',
  'dc_nightmare_hold',
  'dc_plague_pair',
  'dc_endless_25',
];

function blankOutcome(overrides: Partial<GameOutcomeForChallenge> = {}): GameOutcomeForChallenge {
  return {
    won: false,
    noDamage: false,
    fullHp: false,
    playTimeSeconds: 0,
    moneySpent: 0,
    moneyEarned: 0,
    enemiesKilled: 0,
    enemiesKilledByType: {},
    bossesKilled: 0,
    towersPlaced: 0,
    towersPlacedByType: {},
    towersReachedMaxLevel: 0,
    perfectWaves: 0,
    endless: false,
    endlessWave: 0,
    difficulty: 'normal',
    towersFused: 0,
    ...overrides,
  };
}

describe('daily challenge templates', () => {
  it('adds six new templates with unique ids', () => {
    const ids = DAILY_CHALLENGE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of NEW_IDS) {
      const template = DAILY_CHALLENGE_TEMPLATES.find((t) => t.id === id);
      expect(template, id).toBeDefined();
      expect(template!.conditions.length).toBeGreaterThan(0);
    }
  });
});

describe('evaluateDailyCondition fuse_towers', () => {
  it('counts fusions from the game outcome', () => {
    expect(
      evaluateDailyCondition(
        { type: 'fuse_towers', target: 1, label: '融合' },
        blankOutcome({ towersFused: 2 }),
      ),
    ).toBe(2);
  });
});
