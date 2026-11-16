/**
 * 選圖 · 難度元資料（純資料／純函式，無 JSX）
 *
 * 兩個「難度」是不同的東西，不要合併：
 *   1. 地圖原生難度：PathConfig.difficulty，資料層中文鍵（極簡…極難），屬於地圖本身
 *   2. 玩家難度：GameDifficulty（easy…custom），屬於這一局的設定
 * 兩者共用 5 格刻度，色調只在這裡定義一次，卡片牆與簡報層都吃同一份。
 */

import type { GameDifficulty } from '@/types/game';
import type { Translations } from '@/i18n';
import { MAP_DIFFICULTY_MEDIUM, MAP_DIFFICULTY_ORDER } from '@/i18n/pathMapDifficultyKeys';

type DifficultyTone = 'vital' | 'reach' | 'caution' | 'alarm';

/** 小字用深色版：亮色只適合當填色（bar），不能當 10px 文字的顏色 */
const TONE_TEXT: Record<DifficultyTone, string> = {
  vital: 'text-[var(--cn-mint-deep)]',
  reach: 'text-[var(--cn-grape-deep)]',
  caution: 'text-[var(--cn-caution-text)]',
  alarm: 'text-[var(--cn-alert-deep)]',
};

const TONE_BAR: Record<DifficultyTone, string> = {
  vital: 'bg-[var(--cn-mint)]',
  reach: 'bg-[var(--cn-grape)]',
  caution: 'bg-[var(--cn-sun)]',
  alarm: 'bg-[var(--cn-alert)]',
};

interface MapDifficultyMeta {
  tone: DifficultyTone;
  /** 文字色 class */
  text: string;
  /** 方塊填色 class */
  bar: string;
  /** 0–5 */
  stars: number;
}

const meta = (tone: DifficultyTone, stars: number): MapDifficultyMeta => ({
  tone,
  text: TONE_TEXT[tone],
  bar: TONE_BAR[tone],
  stars,
});

const [EASIEST, VERY_SIMPLE, EASY, MEDIUM, HARD, EXTREME] = MAP_DIFFICULTY_ORDER;

/** 資料層難度鍵 → 刻度與色調。鍵來自 pathMapDifficultyKeys，不在此重寫字面值。 */
const MAP_DIFFICULTY_META: Record<string, MapDifficultyMeta> = {
  [EASIEST]: meta('vital', 1),
  [VERY_SIMPLE]: meta('vital', 1),
  [EASY]: meta('reach', 2),
  [MEDIUM]: meta('caution', 3),
  [HARD]: meta('caution', 4),
  [EXTREME]: meta('alarm', 5),
};

/** 篩選晶片用的順序（同資料層順序） */
export const MAP_DIFFICULTY_FILTER_ORDER: string[] = [...MAP_DIFFICULTY_ORDER];

export const getMapDifficultyMeta = (difficulty: string): MapDifficultyMeta =>
  MAP_DIFFICULTY_META[difficulty] || MAP_DIFFICULTY_META[MAP_DIFFICULTY_MEDIUM];

/** 資料層中文難度鍵 → 當前語系顯示文字 */
export const getMapDifficultyLabel = (difficulty: string, t: Translations): string => {
  const labels: Record<string, string> = {
    [EASIEST]: t.pathSelection.difficulty.veryEasy,
    [VERY_SIMPLE]: t.pathSelection.difficulty.verySimple,
    [EASY]: t.pathSelection.difficulty.easy,
    [MEDIUM]: t.pathSelection.difficulty.medium,
    [HARD]: t.pathSelection.difficulty.hard,
    [EXTREME]: t.pathSelection.difficulty.extremeHard,
  };
  return labels[difficulty] ?? difficulty;
};

/* ── 玩家難度（GameDifficulty） ─────────────────────────────────────── */

interface GameDifficultyMeta {
  tone: DifficultyTone;
  /** 0＝自訂，不畫刻度 */
  stars: number;
}

export const GAME_DIFFICULTY_META: Record<GameDifficulty, GameDifficultyMeta> = {
  easy: { tone: 'vital', stars: 1 },
  normal: { tone: 'reach', stars: 2 },
  hard: { tone: 'caution', stars: 3 },
  nightmare: { tone: 'alarm', stars: 4 },
  impossible: { tone: 'alarm', stars: 5 },
  custom: { tone: 'reach', stars: 0 },
};

export const GAME_DIFFICULTY_ORDER: GameDifficulty[] = [
  'easy',
  'normal',
  'hard',
  'nightmare',
  'impossible',
  'custom',
];

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
