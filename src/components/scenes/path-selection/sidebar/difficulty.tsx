/**
 * 地圖難度 · 資料色對照（HARDLINE）
 *
 * 難度是資料狀態，只用 --hl-* 資料色標記；不做漸層 chip、不做發光。
 * 刻度一律 5 格，餵給 <Segments total={5}>。
 */

import type { Translations } from '@/i18n';
import {
  MAP_DIFFICULTY_MEDIUM,
  MAP_DIFFICULTY_ORDER,
} from '@/i18n/pathMapDifficultyKeys';

export type DifficultyTone = 'vital' | 'reach' | 'caution' | 'alarm';

export interface DifficultyMeta {
  tone: DifficultyTone;
  /** 文字色（資料色） */
  text: string;
  /** 方塊填色（資料色） */
  bar: string;
  /** 0–5 */
  stars: number;
}

const TONE_TEXT: Record<DifficultyTone, string> = {
  vital: 'text-[var(--hl-vital)]',
  reach: 'text-[var(--hl-reach)]',
  caution: 'text-[var(--hl-caution)]',
  alarm: 'text-[var(--hl-alarm)]',
};

const TONE_BAR: Record<DifficultyTone, string> = {
  vital: 'bg-[var(--hl-vital)]',
  reach: 'bg-[var(--hl-reach)]',
  caution: 'bg-[var(--hl-caution)]',
  alarm: 'bg-[var(--hl-alarm)]',
};

const meta = (tone: DifficultyTone, stars: number): DifficultyMeta => ({
  tone,
  text: TONE_TEXT[tone],
  bar: TONE_BAR[tone],
  stars,
});

export const DIFFICULTY_META: Record<string, DifficultyMeta> = {
  極簡: meta('vital', 1),
  非常簡單: meta('vital', 1),
  簡單: meta('reach', 2),
  中等: meta('caution', 3),
  困難: meta('caution', 4),
  極難: meta('alarm', 5),
};

export const DIFFICULTY_ORDER: string[] = [...MAP_DIFFICULTY_ORDER];

export const getDifficultyMeta = (difficulty: string): DifficultyMeta =>
  DIFFICULTY_META[difficulty] || DIFFICULTY_META[MAP_DIFFICULTY_MEDIUM];

/** 將 data 層中文難度鍵轉為當前語系顯示文字 */
export const getPathDifficultyLabel = (difficulty: string, t: Translations): string => {
  const labels: Record<string, string> = {
    極簡: t.pathSelection.difficulty.veryEasy,
    非常簡單: t.pathSelection.difficulty.verySimple,
    簡單: t.pathSelection.difficulty.easy,
    中等: t.pathSelection.difficulty.medium,
    困難: t.pathSelection.difficulty.hard,
    極難: t.pathSelection.difficulty.extremeHard,
  };
  return labels[difficulty] ?? difficulty;
};
