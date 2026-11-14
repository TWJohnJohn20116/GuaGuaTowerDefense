import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatDailyHandoffBanner, resolveDailyChallengeHandoff } from '@/data/dailyChallengeHandoff';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('daily challenge path-selection handoff', () => {
  it('maps template difficulty and turns endless / required-difficulty conditions into start settings', () => {
    expect(resolveDailyChallengeHandoff({
      name: '火力全開',
      difficulty: 'medium',
      conditions: [{ type: 'place_tower_type' }, { type: 'win_game' }],
    })).toEqual({
      category: 'advanced',
      difficulty: 'normal',
      endless: false,
      challengeName: '火力全開',
    });

    expect(resolveDailyChallengeHandoff({
      name: '夢魘試煉',
      difficulty: 'hard',
      conditions: [{ type: 'win_difficulty', difficulty: 'nightmare' }],
    }).difficulty).toBe('nightmare');

    expect(resolveDailyChallengeHandoff({
      name: '無盡十五',
      difficulty: 'easy',
      conditions: [{ type: 'reach_endless_wave' }],
    })).toMatchObject({ difficulty: 'easy', endless: true });
  });

  it('fills the path-selection banner with the challenge name', () => {
    expect(formatDailyHandoffBanner('今日挑戰：{name}', '火力全開')).toBe('今日挑戰：火力全開');
    expect(zhTW.pathSelection.dailyHandoff).toMatch(/\{name\}/);
  });

  it('starts the challenge into path selection with a handoff, and path selection consumes it', () => {
    const daily = readFileSync(resolve(__dirname, '../components/scenes/DailyChallenge.tsx'), 'utf8');
    const path = readFileSync(resolve(__dirname, '../components/scenes/PathSelection.tsx'), 'utf8');
    expect(daily).toMatch(/beginPathHandoff/);
    expect(daily).not.toMatch(/onStart=\{\(\) => setScene\('pathSelection'\)\}/);
    expect(path).toMatch(/resolveDailyChallengeHandoff/);
    expect(path).toMatch(/pathHandoffActive/);
  });
});
