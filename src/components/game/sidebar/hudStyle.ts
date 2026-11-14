/**
 * HUD 風格工具：將設定轉換為 Tailwind class 字串
 * Helper that maps HUD layout settings to Tailwind utility classes.
 *
 * HARDLINE：外觀不再隨圓角／模糊／強調色設定變化 —— 圓角固定 0、沒有模糊、沒有陰影、
 * 線一律 1px。這些設定值仍保留在 store（存檔相容），只是不再產生視覺分支。
 */

import type { HudLayoutState } from '@/store/settingsStore';

// ----- Pill / 一般 / 中型 三種外型（HARDLINE 全部方角） -----
export type HudShape = 'pill' | 'panel' | 'card';

const CORNER_CLASS: Record<HudShape, string> = {
  pill: '',
  panel: '',
  card: '',
};

export interface HudStyleClasses {
  /** 圓角 class（HARDLINE：永遠空字串＝0 圓角） */
  corner: string;
  /** 底色 class（HARDLINE：實色，不用模糊） */
  blur: string;
  /** 邊框色 class */
  border: string;
  /** 陰影 class（HARDLINE：沒有陰影） */
  shadow: string;
  /** 一行 helper：合併常用組合 */
  combined: string;
}

/**
 * 取得 HUD 風格 class（HARDLINE 版）
 * shape：舊 API 相容參數，三種外型現在同一個方角結果。
 */
export function getHudStyleClasses(_layout: HudLayoutState, shape: HudShape): HudStyleClasses {
  const corner = CORNER_CLASS[shape];
  const blur = 'bg-[var(--hl-deck-2)]';
  const border = 'border-[var(--hl-line)]';
  const shadow = '';
  return {
    corner,
    blur,
    border,
    shadow,
    combined: `${blur} ${border}`.trim(),
  };
}

// 給預覽使用：把整個 HudLayout 序列化成可呈現用的 className
export function getPreviewHudClasses(layout: HudLayoutState, shape: HudShape): string {
  return getHudStyleClasses(layout, shape).combined;
}

/** 對局速度鈕：所有寬度都顯示，不能用 hidden sm:flex 藏掉。 */
export const GAME_SPEED_BAR_CLASS =
  'flex items-stretch gap-0 border border-[var(--hl-line)] bg-[var(--hl-void-2)]';

/** 儀表帶單格高度（上下兩條 HUD 帶共用） */
export const HUD_BAND_HEIGHT = 44;
