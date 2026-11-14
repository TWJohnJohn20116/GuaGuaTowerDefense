import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

  it('restores campaign id, mutator, and custom wave set instead of the raw map', () => {
    expect(resolveReplayRestartArgs({
      mapId: 'straight',
      startPathName: 'ch1_lv2',
      difficulty: 'normal',
      endlessMode: false,
      maxWaves: 10,
      isVictory: false,
      finalWave: 4,
      customWaveSetId: 'mod-waves',
      mutator: { id: 'no-sell', rules: { sellingDisabled: true } },
    })).toEqual({
      pathName: 'ch1_lv2',
      difficulty: 'normal',
      endless: false,
      maxWaves: 10,
      customWaveSetId: 'mod-waves',
      mutator: { id: 'no-sell', rules: { sellingDisabled: true } },
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

  it('wires restart args into both replay start-game call sites and records lastStartArgs', () => {
    const browse = readFileSync(resolve(__dirname, '../components/scenes/Replay.tsx'), 'utf8');
    const detail = readFileSync(resolve(__dirname, '../components/scenes/replay/ReplayDetail.tsx'), 'utf8');
    const recorder = readFileSync(resolve(__dirname, '../hooks/useReplayRecorder.ts'), 'utf8');
    expect(browse).toMatch(/resolveReplayRestartArgs/);
    expect(browse).toMatch(/onReplayThis/);
    expect(detail).toMatch(/onReplayThis/);
    expect(recorder).toMatch(/lastStartArgs/);
    expect(recorder).toMatch(/startPathName/);
  });
});
