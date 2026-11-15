/**
 * 主題套用（唯一的 DOM 寫入點）
 *
 * 為什麼不用 data-theme 選擇器寫 12 份 CSS：色票只在 src/data/themeData.ts 定義一次，
 * 這裡把它寫成 html 的行內 CSS 變數，canvas 的場地色也讀同一份資料，不會有兩份真相。
 *
 * data-theme / data-theme-mode 仍然會設定，因為深色主題需要少量結構性覆寫
 * （柔和色階、貼紙投影、選取色），那些寫在 src/styles/themes.css。
 */

import { getTheme, themeCssVars, type ThemeId } from '@/data/themeData';
import { setActiveThemeId } from '@/utils/themeBoard';

const TRANSITION_CLASS = 'theme-switching';
const TRANSITION_MS = 220;

let transitionTimer: number | null = null;

export function applyTheme(id: ThemeId): void {
  if (typeof document === 'undefined') return;
  const theme = getTheme(id);
  const root = document.documentElement;

  // 先掛過場類別並強制一次樣式計算，變數變更才會「過渡」而不是硬跳
  root.classList.add(TRANSITION_CLASS);
  void getComputedStyle(root).getPropertyValue('--cn-paper');

  for (const [name, value] of Object.entries(themeCssVars(theme))) {
    root.style.setProperty(name, value);
  }
  root.dataset.theme = theme.id;
  root.dataset.themeMode = theme.mode;
  setActiveThemeId(theme.id);

  if (transitionTimer !== null) window.clearTimeout(transitionTimer);
  transitionTimer = window.setTimeout(() => {
    root.classList.remove(TRANSITION_CLASS);
    transitionTimer = null;
  }, TRANSITION_MS);
}
