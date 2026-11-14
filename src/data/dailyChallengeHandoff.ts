import type { GameDifficulty } from '@/types/game';
import type { DailyChallengeCondition, DailyChallengeDifficulty } from '@/types/dailyChallenge';

const GAME_DIFFICULTIES: readonly GameDifficulty[] = [
  'easy',
  'normal',
  'hard',
  'nightmare',
  'impossible',
];

interface DailyChallengeHandoffInput {
  name: string;
  difficulty: DailyChallengeDifficulty;
  conditions: Array<Pick<DailyChallengeCondition, 'type' | 'difficulty' | 'waveSetId'>>;
}

interface DailyChallengeHandoff {
  category: 'advanced';
  difficulty: GameDifficulty;
  endless: boolean;
  customWaveSetId?: string;
  challengeName: string;
}

function mapDailyDifficultyToGame(difficulty: DailyChallengeDifficulty): GameDifficulty {
  if (difficulty === 'easy') return 'easy';
  if (difficulty === 'hard') return 'hard';
  return 'normal';
}

function asGameDifficulty(value: string | undefined): GameDifficulty | null {
  if (!value) return null;
  return GAME_DIFFICULTIES.includes(value as GameDifficulty) ? (value as GameDifficulty) : null;
}

/** 開始每日挑戰時帶進選圖頁的建議難度／無盡／波次組。 */
export function resolveDailyChallengeHandoff(input: DailyChallengeHandoffInput): DailyChallengeHandoff {
  const required = input.conditions.find((cond) => cond.type === 'win_difficulty');
  const waveSet = input.conditions.find((cond) => cond.type === 'win_wave_set' && cond.waveSetId);
  const difficulty = asGameDifficulty(required?.difficulty) ?? mapDailyDifficultyToGame(input.difficulty);
  const handoff: DailyChallengeHandoff = {
    category: 'advanced',
    difficulty,
    endless: input.conditions.some((cond) => cond.type === 'reach_endless_wave'),
    challengeName: input.name,
  };
  if (waveSet?.waveSetId) handoff.customWaveSetId = waveSet.waveSetId;
  return handoff;
}

export function formatDailyHandoffBanner(template: string, name: string): string {
  return template.replaceAll('{name}', name);
}
