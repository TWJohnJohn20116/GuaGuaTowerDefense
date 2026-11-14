/**
 * 地圖編輯器 · 型別與常數
 */

import type { GridPosition } from '@/types/game';

export type EditMode = 'path' | 'start' | 'end' | 'erase';

/** 預設路徑模板 */
export const PATH_TEMPLATES: Record<string, GridPosition[]> = {
  empty: [],
  straight: [
    { col: 0, row: 5 },
    { col: 14, row: 5 },
  ],
  sShape: [
    { col: 0, row: 2 },
    { col: 6, row: 2 },
    { col: 6, row: 8 },
    { col: 14, row: 8 },
  ],
  uShape: [
    { col: 0, row: 2 },
    { col: 12, row: 2 },
    { col: 12, row: 8 },
    { col: 0, row: 8 },
  ],
};

/** 隨機產生 segment ID */
export const generateSegId = () => 'seg-' + Math.random().toString(36).substring(2, 7);
