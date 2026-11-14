/**
 * 漏斗／鉤形／三線：支援網、相位奇襲、爆破拆遷
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA, PATHS } from '@/data/gameData';
import { MUTATOR_CHALLENGES } from '@/data/mutatorChallengeData';
import { DAILY_CHALLENGE_TEMPLATES } from '@/data/dailyChallengeData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';
import { resolveMutatorStartConfig } from '@/utils/mutatorStart';
import { evaluateDailyCondition, type GameOutcomeForChallenge } from '@/store/dailyChallengeStore';
import { PATHS_BY_DIFFICULTY } from '@/data/gameData/pathData';

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

const PACKS = [
  {
    waveSetId: 'official_support_web',
    waveName: '支援網',
    enemy: 'healer' as const,
    mutatorId: 'mc_support_funnel',
    mapId: 'funnel',
    mapName: '漏斗',
    mapAchId: 'map_funnel',
    waveAchId: 'wave_support_web',
    dailyId: 'dc_support_web',
  },
  {
    waveSetId: 'official_phase_raid',
    waveName: '相位奇襲',
    enemy: 'ghost' as const,
    mutatorId: 'mc_phase_hook',
    mapId: 'hook',
    mapName: '鉤形',
    mapAchId: 'map_hook',
    waveAchId: 'wave_phase_raid',
    dailyId: 'dc_phase_raid',
  },
  {
    waveSetId: 'official_siege_mix',
    waveName: '爆破拆遷',
    enemy: 'bomber' as const,
    mutatorId: 'mc_siege_triple',
    mapId: 'triple',
    mapName: '三線',
    mapAchId: 'map_triple',
    waveAchId: 'wave_siege_mix',
    dailyId: 'dc_siege_mix',
  },
] as const;

describe('new map trio packs', () => {
  it('registers three playable medium maps with valid forks', () => {
    for (const pack of PACKS) {
      const path = PATHS[pack.mapId];
      expect(path, pack.mapId).toBeDefined();
      expect(path.name).toBe(pack.mapName);
      expect(path.difficulty).toBe('中等');
      expect(PATHS_BY_DIFFICULTY.medium[pack.mapId]).toBeDefined();
      expect(path.startSegmentId).toBeTruthy();
      expect(path.segments?.length).toBeGreaterThanOrEqual(3);
      const ids = new Set(path.segments!.map((s) => s.id));
      expect(ids.has(path.startSegmentId!)).toBe(true);
      for (const segment of path.segments!) {
        expect(segment.waypoints.length).toBeGreaterThanOrEqual(2);
        for (const point of segment.waypoints) {
          expect(point.col).toBeGreaterThanOrEqual(0);
          expect(point.col).toBeLessThanOrEqual(14);
          expect(point.row).toBeGreaterThanOrEqual(0);
          expect(point.row).toBeLessThanOrEqual(10);
        }
        for (const nextId of segment.next) {
          expect(ids.has(nextId), `${pack.mapId} -> ${nextId}`).toBe(true);
        }
      }
    }
  });

  it('registers three unique official wave sets', () => {
    const ids = OFFICIAL_WAVE_SETS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const pack of PACKS) {
      const set = OFFICIAL_WAVE_SETS.find((item) => item.id === pack.waveSetId);
      expect(set, pack.waveSetId).toBeDefined();
      expect(set!.name).toBe(pack.waveName);
      expect(set!.waves.length).toBeGreaterThanOrEqual(8);
      const themed = set!.waves.filter((wave) => wave.enemies.some((g) => g.type === pack.enemy));
      expect(themed.length, pack.waveSetId).toBeGreaterThanOrEqual(6);
      for (const wave of set!.waves) {
        expect(wave.reward).toBeGreaterThan(0);
        for (const group of wave.enemies) {
          expect(ENEMY_DATA[group.type], group.type).toBeDefined();
          expect(group.count).toBeGreaterThan(0);
        }
      }
      expect(findPlayableWaveSet(pack.waveSetId)?.name).toBe(pack.waveName);
      const last = set!.waves.at(-1)!;
      expect(last.enemies.some((g) => g.type === 'boss' || g.type === pack.enemy)).toBe(true);
    }
  });

  it('locks each set onto its new map with unique mutators', () => {
    const ids = MUTATOR_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const pack of PACKS) {
      const challenge = MUTATOR_CHALLENGES.find((c) => c.id === pack.mutatorId);
      expect(challenge, pack.mutatorId).toBeDefined();
      expect(challenge!.mapId).toBe(pack.mapId);
      expect(challenge!.customWaveSetId).toBe(pack.waveSetId);
      const start = resolveMutatorStartConfig(challenge!);
      expect(start.customWaveSetId).toBe(pack.waveSetId);
      expect(start.maxWaves).toBe(findPlayableWaveSet(pack.waveSetId)!.waves.length);
    }
  });

  it('unlocks map and wave-set achievements', () => {
    for (const pack of PACKS) {
      const mapAch = ALL_ACHIEVEMENTS.find((a) => a.id === pack.mapAchId);
      expect(mapAch, pack.mapAchId).toBeDefined();
      expect(mapAch!.conditions[0].mapId).toBe(pack.mapId);
      expect(checkCondition(
        mapAch!,
        { ...getInitialStatistics(), mapsCompleted: { [pack.mapId]: 1 } },
        {},
      ).met).toBe(true);

      const waveAch = ALL_ACHIEVEMENTS.find((a) => a.id === pack.waveAchId);
      expect(waveAch, pack.waveAchId).toBeDefined();
      expect(waveAch!.conditions[0].type).toBe('complete_wave_set');
      expect(waveAch!.conditions[0].waveSetId).toBe(pack.waveSetId);
      expect(checkCondition(
        waveAch!,
        { ...getInitialStatistics(), waveSetsCompleted: { [pack.waveSetId]: 1 } },
        {},
      ).met).toBe(true);
    }
  });

  it('adds daily templates that only count the matching wave set', () => {
    const ids = DAILY_CHALLENGE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const pack of PACKS) {
      const template = DAILY_CHALLENGE_TEMPLATES.find((t) => t.id === pack.dailyId);
      expect(template, pack.dailyId).toBeDefined();
      expect(template!.conditions.some((c) => c.type === 'win_wave_set' && c.waveSetId === pack.waveSetId)).toBe(true);

      const cond = { type: 'win_wave_set' as const, target: 1, waveSetId: pack.waveSetId, label: pack.waveName };
      expect(evaluateDailyCondition(cond, blankOutcome({ won: true, customWaveSetId: pack.waveSetId }))).toBe(1);
      expect(evaluateDailyCondition(cond, blankOutcome({ won: true, customWaveSetId: 'official_normal_tide' }))).toBe(0);
    }
  });
});
