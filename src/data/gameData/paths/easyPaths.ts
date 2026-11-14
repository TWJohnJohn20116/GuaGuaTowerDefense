/**
 * 入門難度地圖 · Easy
 *
 * 難度標籤：極簡
 *  - 路徑單純、分支少
 *  - 適合新手熟悉操作
 */

import type { PathConfig } from '@/types/game';

export const easyPaths: Record<string, PathConfig> = {
  straight: {
    name: '直線',
    description: '入門地圖，上下兩條直線並行',
    difficulty: '極簡',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'st-entry',
    segments: [
      { id: 'st-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['st-upper', 'st-lower'] },
      { id: 'st-upper', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 3 }, { col: 14, row: 3 },
      ], next: [] },
      { id: 'st-lower', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 7 }, { col: 14, row: 7 },
      ], next: [] },
    ],
  },
};
