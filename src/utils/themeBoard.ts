/**
 * 目前主題的場地配色快取
 *
 * canvas 每個影格都要顏色，不能每次去算或讀 DOM；所以由 themeService 套用主題時
 * 同步寫進這個模組級快取（§4.2 允許的模組級狀態：純快取，無業務邏輯）。
 */

import { DEFAULT_THEME_ID, getTheme, type ThemeBoard, type ThemeId } from '@/data/themeData';

let activeThemeId: ThemeId = DEFAULT_THEME_ID;

export function setActiveThemeId(id: ThemeId): void {
  activeThemeId = id;
}

export function getBoardColors(): ThemeBoard {
  return getTheme(activeThemeId).board;
}
