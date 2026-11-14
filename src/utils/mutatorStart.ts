/**
 * 突變挑戰開局參數：地圖、難度、波次組與規則
 */

import type { MutatorChallenge, MutatorRules } from '@/types/mutatorChallenge';
import type { DifficultyModifiers, GameDifficulty } from '@/types/game';
import { findPlayableWaveSet } from '@/utils/waveSets';

interface MutatorStartConfig {
  pathName: string;
  difficulty: GameDifficulty;
  endless: boolean;
  maxWaves: number;
  customModifiers: DifficultyModifiers | undefined;
  customWaveSetId: string | undefined;
  mutator: { id: string; rules: MutatorRules };
}

export function resolveMutatorStartConfig(challenge: MutatorChallenge): MutatorStartConfig {
  const endless = challenge.endless ?? false;
  const waveSet = challenge.customWaveSetId
    ? findPlayableWaveSet(challenge.customWaveSetId)
    : undefined;
  return {
    pathName: challenge.mapId,
    difficulty: challenge.difficulty,
    endless,
    maxWaves: endless ? 0 : (waveSet?.waves.length ?? challenge.maxWaves),
    customModifiers: undefined,
    customWaveSetId: challenge.customWaveSetId,
    mutator: { id: challenge.id, rules: challenge.rules },
  };
}
