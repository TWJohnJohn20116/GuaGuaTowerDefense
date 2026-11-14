type SkipWaveHudInput = {
  tutorialActive: boolean;
  waveActive: boolean;
  allEnemiesSpawned: boolean;
  enemyCount: number;
  endlessMode: boolean;
  currentWave: number;
  maxWaves: number;
};

type SkipWaveTitleKey = 'skipWaveReady' | 'skipWaveWait' | 'skipWaveLast';

function isLastPlayableWave(input: SkipWaveHudInput): boolean {
  return !input.endlessMode && input.maxWaves > 0 && input.currentWave >= input.maxWaves;
}

/** 與 skipWave() 同一套閘門：教學中、尚未出完兵、最後一波都不能跳。 */
export function canSkipWave(input: SkipWaveHudInput): boolean {
  if (input.tutorialActive || !input.waveActive) return false;
  if (!input.allEnemiesSpawned || input.enemyCount === 0) return false;
  if (isLastPlayableWave(input)) return false;
  return true;
}

export function skipWaveTitleKey(input: SkipWaveHudInput): SkipWaveTitleKey {
  if (input.waveActive && isLastPlayableWave(input)) return 'skipWaveLast';
  if (canSkipWave(input)) return 'skipWaveReady';
  return 'skipWaveWait';
}
