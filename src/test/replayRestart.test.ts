import { describe, expect, it } from 'vitest';
import { resolveReplayRestartArgs } from '@/data/replayRestart';

describe('replay restart args', () => {
  it('falls back to mapId and victory wave for old replays', () => {
    expect(resolveReplayRestartArgs({
      mapId: 'zigzag',
      difficulty: 'hard',
      endlessMode: false,
      isVictory: true,
      finalWave: 12,
    })).toEqual({
      pathName: 'zigzag',
      difficulty: 'hard',
      endless: false,
      maxWaves: 12,
    });
  });

  it('restores campaign id and custom wave set instead of the raw map', () => {
    expect(resolveReplayRestartArgs({
      mapId: 'straight',
      startPathName: 'ch1_lv2',
      difficulty: 'normal',
      endlessMode: false,
      maxWaves: 10,
      isVictory: false,
      finalWave: 4,
      customWaveSetId: 'mod-waves',
    })).toEqual({
      pathName: 'ch1_lv2',
      difficulty: 'normal',
      endless: false,
      maxWaves: 10,
      customWaveSetId: 'mod-waves',
    });
  });

  it('forces endless games to unlimited waves', () => {
    expect(resolveReplayRestartArgs({
      mapId: 'spiral',
      difficulty: 'nightmare',
      endlessMode: true,
      maxWaves: 99,
      isVictory: false,
      finalWave: 40,
    }).maxWaves).toBe(0);
  });
});
