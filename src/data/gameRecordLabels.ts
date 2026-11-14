import { getPathDisplayName } from '@/data/gameData/pathData';

export type GameDifficultyLabels = {
  easy: string;
  normal: string;
  hard: string;
  nightmare: string;
  impossible: string;
  custom: string;
};

export function formatGameRecordMap(mapId: string): string {
  return getPathDisplayName(mapId);
}

export function formatGameRecordDifficulty(
  difficulty: string,
  labels: GameDifficultyLabels,
): string {
  switch (difficulty) {
    case 'easy': return labels.easy;
    case 'normal': return labels.normal;
    case 'hard': return labels.hard;
    case 'nightmare': return labels.nightmare;
    case 'impossible': return labels.impossible;
    case 'custom': return labels.custom;
    default: return difficulty;
  }
}

export function gameDifficultyLabelsFromGameCopy(g: {
  pauseDiffEasy: string;
  pauseDiffNormal: string;
  pauseDiffHard: string;
  pauseDiffNightmare: string;
  pauseDiffImpossible: string;
  pauseDiffCustom: string;
}): GameDifficultyLabels {
  return {
    easy: g.pauseDiffEasy,
    normal: g.pauseDiffNormal,
    hard: g.pauseDiffHard,
    nightmare: g.pauseDiffNightmare,
    impossible: g.pauseDiffImpossible,
    custom: g.pauseDiffCustom,
  };
}
