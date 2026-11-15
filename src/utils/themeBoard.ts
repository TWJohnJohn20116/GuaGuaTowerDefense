/**
 * 目前主題的場地配色
 *
 * 兩件事共用同一份來源：
 *   1. 2D canvas：PathRenderer / GameCanvasStatic 直接讀 getBoardColors()。
 *   2. 3D 場景：getBoard3DColors() 由同一份 board 色**推導**（壓暗、交錯色），
 *      不另外維護第二份 12 套色票——改主題色不會出現「2D 換了 3D 沒換」。
 *
 * 模組級狀態只有 activeThemeId（§4.2 允許的純快取，無業務邏輯），
 * 由 themeService 套用主題時同步寫入，避免每幀去讀 DOM。
 */

import { DEFAULT_THEME_ID, getTheme, type ThemeBoard, type ThemeId } from '@/data/themeData';

let activeThemeId: ThemeId = DEFAULT_THEME_ID;

export function setActiveThemeId(id: ThemeId): void {
  activeThemeId = id;
}

/** 地圖自訂主題（per-map）；null＝跟隨全域主題 */
let activeMapTheme: string | null = null;

/** 地圖主題色票：只調場地與道路，起終點與障礙保持全域主題色，避免整張圖變單色 */
const MAP_THEME_TINTS: Record<string, { path: string; tile: string }> = {
  moss: { path: '#6f8f4a', tile: '#e8f0d8' },
  ash: { path: '#7a7480', tile: '#e7e3ea' },
  frost: { path: '#6f97b5', tile: '#e2eef6' },
  ember: { path: '#b56a4a', tile: '#f7e7dd' },
};

export function setActiveMapTheme(theme: string | null): void {
  activeMapTheme = theme;
}

export function getBoardColors(): ThemeBoard {
  const board = getTheme(activeThemeId).board;
  if (!activeMapTheme) return board;
  const tint = MAP_THEME_TINTS[activeMapTheme];
  if (!tint) return board;
  return { ...board, path: mixHex(board.path, tint.path, 0.65), tile: mixHex(board.tile, tint.tile, 0.5) };
}

/** 3D 場景用的場地配色（three 的 MeshStandardMaterial 吃 #rrggbb 字串） */
export interface Board3DColors {
  /** 大地面 */
  ground: string;
  /** 場景底色與霧 */
  background: string;
  /** 空地格（棋盤交錯的主色） */
  empty: string;
  /** 空地格（棋盤交錯的第二色） */
  emptyAlt: string;
  /** 道路 */
  path: string;
  /** 起點 */
  start: string;
  /** 終點 */
  end: string;
  /** 障礙塊 */
  blocked: string;
  /** 路徑導引線（主題強調色） */
  pathLine: string;
}

function parseHex(hex: string): [number, number, number] | null {
  const s = hex.replace('#', '').trim();
  if (s.length === 3) return [0, 1, 2].map((i) => parseInt(s[i] + s[i], 16)) as [number, number, number];
  if (s.length !== 6 || /[^0-9a-fA-F]/.test(s)) return null;
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as [number, number, number];
}

/** 兩色線性混合，t=0 取 from、t=1 取 to（只支援 #rgb / #rrggbb） */
export function mixHex(from: string, to: string, t: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) return from;
  const k = Math.max(0, Math.min(1, t));
  const rgb = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/**
 * 3D 場地色：2D 場地色壓暗後給立體地塊用。
 * 3D 有光照（半球光＋主光＋Bloom），不壓暗會比 2D 亮一大截而失去立體感。
 */
export function getBoard3DColors(): Board3DColors {
  const theme = getTheme(activeThemeId);
  const { board, colors } = theme;
  return {
    ground: mixHex(board.floor, '#000000', 0.55),
    background: mixHex(board.floor, '#000000', 0.72),
    empty: mixHex(board.tile, '#000000', 0.30),
    emptyAlt: mixHex(board.tile, '#000000', 0.46),
    path: mixHex(board.path, '#000000', 0.25),
    start: board.start,
    end: board.end,
    blocked: board.edge,
    pathLine: colors.primary,
  };
}
