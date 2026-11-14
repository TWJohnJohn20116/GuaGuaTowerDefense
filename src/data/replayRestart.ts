import type { GameDifficulty, DifficultyModifiers } from '@/types/game';

interface ReplayRestartSource {
  mapId: string;
  difficulty: GameDifficulty;
  endlessMode: boolean;
  maxWaves?: number;
  isVictory: boolean;
  finalWave: number;
  startPathName?: string;
  customWaveSetId?: string;
  customModifiers?: DifficultyModifiers;
}

interface ReplayRestartArgs {
  pathName: string;
  difficulty: GameDifficulty;
  endless: boolean;
  maxWaves: number;
  customModifiers?: DifficultyModifiers;
  customWaveSetId?: string;
}

/** 回放「重新挑戰」：還原戰役 id／波次組，舊檔則退回地圖與難度。 */
export function resolveReplayRestartArgs(replay: ReplayRestartSource): ReplayRestartArgs {
  const fallbackMaxWaves = replay.isVictory ? replay.finalWave : 15;
  const args: ReplayRestartArgs = {
    pathName: replay.startPathName || replay.mapId,
    difficulty: replay.difficulty,
    endless: replay.endlessMode,
    maxWaves: replay.endlessMode ? 0 : (replay.maxWaves ?? fallbackMaxWaves),
  };
  if (replay.customModifiers) args.customModifiers = replay.customModifiers;
  if (replay.customWaveSetId) args.customWaveSetId = replay.customWaveSetId;
  return args;
}
