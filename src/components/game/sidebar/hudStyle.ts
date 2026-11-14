/**
 * HUD 風格工具：將設定轉換為 Tailwind class 字串
 * Helper that maps HUD layout settings to Tailwind utility classes.
 *
 * ARCADE HUD：外觀不再隨圓角／模糊／強調色設定變化 —— 圓角固定小圓角（2–3px）、
 * 沒有玻璃模糊、深度靠硬陰影（0 2px 0）與 1px 線。
 * 這些設定值仍保留在 store（存檔相容），只是不再產生視覺分支。
 */

import type { HudLayoutState } from '@/store/settingsStore';

// ----- Pill / 一般 / 中型 三種外型（ARCADE 全部小圓角） -----
type HudShape = 'pill' | 'panel' | 'card';

const CORNER_CLASS: Record<HudShape, string> = {
  pill: 'rounded-sm',
  panel: 'rounded-sm',
  card: 'rounded',
};

interface HudStyleClasses {
  /** 圓角 class（ARCADE：2–3px 小圓角） */
  corner: string;
  /** 底色 class（ARCADE：實色艙體，不用模糊） */
  blur: string;
  /** 邊框色 class */
  border: string;
  /** 陰影 class（ARCADE：硬陰影，做出厚度） */
  shadow: string;
  /** 一行 helper：合併常用組合 */
  combined: string;
}

/**
 * 取得 HUD 風格 class（ARCADE 版）
 * shape：決定小圓角等級，其餘一致。
 */
export function getHudStyleClasses(_layout: HudLayoutState, shape: HudShape): HudStyleClasses {
  const corner = CORNER_CLASS[shape];
  const blur = 'bg-[var(--arc-deck-2)]';
  const border = 'border-[var(--arc-line)]';
  const shadow = 'shadow-[0_2px_0_rgba(0,0,0,0.55)]';
  return {
    corner,
    blur,
    border,
    shadow,
    combined: `${blur} ${border}`.trim(),
  };
}
/** 對局速度鈕：所有寬度都顯示，不能用 hidden sm:flex 藏掉。 */
export const GAME_SPEED_BAR_CLASS =
  'flex items-stretch gap-0 border border-[var(--arc-line)] bg-[var(--arc-void-2)]';

/** 儀表帶單格高度（上下兩條 HUD 帶共用） */
export const HUD_BAND_HEIGHT = 44;
