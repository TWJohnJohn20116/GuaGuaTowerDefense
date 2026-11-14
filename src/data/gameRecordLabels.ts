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

export function gameDifficultyLabelsFromDetail(d: {
  diffEasy: string;
  diffNormal: string;
  diffHard: string;
  diffNightmare: string;
  diffImpossible: string;
  diffCustom: string;
}): GameDifficultyLabels {
  return {
    easy: d.diffEasy,
    normal: d.diffNormal,
    hard: d.diffHard,
    nightmare: d.diffNightmare,
    impossible: d.diffImpossible,
    custom: d.diffCustom,
  };
}
