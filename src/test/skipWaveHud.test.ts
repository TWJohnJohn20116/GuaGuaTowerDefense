import { describe, expect, it } from 'vitest';
import { canSkipWave, skipWaveTitleKey } from '@/data/skipWaveHud';

const midWave = {
  tutorialActive: false,
  waveActive: true,
  allEnemiesSpawned: true,
  enemyCount: 3,
  endlessMode: false,
  currentWave: 2,
  maxWaves: 8,
};

describe('skip wave HUD', () => {
  it('allows skip only after every enemy has spawned and more waves remain', () => {
    expect(canSkipWave(midWave)).toBe(true);
    expect(canSkipWave({ ...midWave, allEnemiesSpawned: false })).toBe(false);
    expect(canSkipWave({ ...midWave, enemyCount: 0 })).toBe(false);
    expect(canSkipWave({ ...midWave, waveActive: false })).toBe(false);
    expect(canSkipWave({ ...midWave, tutorialActive: true })).toBe(false);
  });

  it('does not look skippable on the last campaign wave', () => {
    const lastWave = { ...midWave, currentWave: 8, maxWaves: 8 };
    expect(canSkipWave(lastWave)).toBe(false);
    expect(skipWaveTitleKey(lastWave)).toBe('skipWaveLast');
  });

  it('explains wait vs overlap instead of a generic skip title', () => {
    expect(skipWaveTitleKey(midWave)).toBe('skipWaveReady');
    expect(skipWaveTitleKey({ ...midWave, allEnemiesSpawned: false })).toBe('skipWaveWait');
    expect(canSkipWave({ ...midWave, endlessMode: true, currentWave: 99, maxWaves: 8 })).toBe(true);
  });
});
