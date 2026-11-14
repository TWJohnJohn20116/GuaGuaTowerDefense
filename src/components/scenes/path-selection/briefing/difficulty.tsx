/**
 * 戰前簡報 · GameDifficulty 元資料（HARDLINE）
 *
 * 難度只用資料色 + 5 格等距刻度表示，不做漸層方塊、不做彩虹邊。
 */

import type { GameDifficulty } from '@/types/game';
import type { Translations } from '@/i18n';

export type DiffTone = 'vital' | 'reach' | 'caution' | 'alarm';

export interface DifficultyMeta {
  tone: DiffTone;
  /** 文字色（資料色） */
  text: string;
  /** 0 = 自訂（無刻度） */
  stars: number;
}

const TONE_TEXT: Record<DiffTone, string> = {
  vital: 'text-[var(--arc-vital)]',
  reach: 'text-[var(--arc-reach)]',
  caution: 'text-[var(--arc-caution)]',
  alarm: 'text-[var(--arc-alert)]',
};

const meta = (tone: DiffTone, stars: number): DifficultyMeta => ({
  tone,
  text: TONE_TEXT[tone],
  stars,
});

export const DIFFICULTY_META: Record<GameDifficulty, DifficultyMeta> = {
  easy: meta('vital', 1),
  normal: meta('reach', 2),
  hard: meta('caution', 3),
  nightmare: meta('alarm', 4),
  impossible: meta('alarm', 5),
  custom: meta('reach', 0),
};

export const getGameDifficultyLabel = (t: Translations, diff: GameDifficulty): string => {
  const labels: Record<GameDifficulty, string> = {
    easy: t.game.pauseDiffEasy,
    normal: t.game.pauseDiffNormal,
    hard: t.game.pauseDiffHard,
    nightmare: t.game.pauseDiffNightmare,
    impossible: t.game.pauseDiffImpossible,
    custom: t.game.pauseDiffCustom,
  };
  return labels[diff];
};

export const DIFF_ORDER: GameDifficulty[] = [
  'easy',
  'normal',
  'hard',
  'nightmare',
  'impossible',
  'custom',
];
