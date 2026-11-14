/**
 * 中等難度地圖 · Medium
 *
 * 難度標籤：中等
 *  - 對稱或單純分叉
 *  - 需基本配置策略
 */

import type { PathConfig } from '@/types/game';

export const mediumPaths: Record<string, PathConfig> = {
  zigzag: {
    name: '之字形',
    description: '之字交錯，對稱平衡的雙路',
    difficulty: '中等',
    category: 'advanced',
    waypoints: [{ col: 0, row: 6 }, { col: 14, row: 6 }],
    startSegmentId: 'zz-entry',
    segments: [
      { id: 'zz-entry', waypoints: [
        { col: 0, row: 6 }, { col: 3, row: 6 },
      ], next: ['zz-upper1', 'zz-lower1'] },
      { id: 'zz-upper1', waypoints: [
        { col: 3, row: 6 }, { col: 3, row: 3 }, { col: 6, row: 3 }, { col: 6, row: 6 },
      ], next: ['zz-mid'] },
      { id: 'zz-lower1', waypoints: [
        { col: 3, row: 6 }, { col: 3, row: 9 }, { col: 6, row: 9 }, { col: 6, row: 6 },
      ], next: ['zz-mid'] },
      { id: 'zz-mid', waypoints: [
        { col: 6, row: 6 }, { col: 8, row: 6 },
      ], next: ['zz-upper2', 'zz-lower2'] },
      { id: 'zz-upper2', waypoints: [
        { col: 8, row: 6 }, { col: 8, row: 3 }, { col: 11, row: 3 }, { col: 11, row: 6 },
      ], next: ['zz-exit'] },
      { id: 'zz-lower2', waypoints: [
        { col: 8, row: 6 }, { col: 8, row: 9 }, { col: 11, row: 9 }, { col: 11, row: 6 },
      ], next: ['zz-exit'] },
      { id: 'zz-exit', waypoints: [
        { col: 11, row: 6 }, { col: 14, row: 6 },
      ], next: [] },
    ],
  },

  u_shape: {
    name: 'U形',
    description: 'U形彎道，直走或繞底擇一',
    difficulty: '中等',
    category: 'advanced',
    waypoints: [{ col: 0, row: 2 }, { col: 14, row: 6 }],
    startSegmentId: 'u-entry',
    segments: [
      { id: 'u-entry', waypoints: [
        { col: 0, row: 2 }, { col: 6, row: 2 },
      ], next: ['u-direct', 'u-detour'] },
      { id: 'u-direct', waypoints: [
        { col: 6, row: 2 }, { col: 12, row: 2 }, { col: 12, row: 6 },
      ], next: ['u-exit'] },
      { id: 'u-detour', waypoints: [
        { col: 6, row: 2 }, { col: 6, row: 10 }, { col: 12, row: 10 }, { col: 12, row: 6 },
      ], next: ['u-exit'] },
      { id: 'u-exit', waypoints: [
        { col: 12, row: 6 }, { col: 14, row: 6 },
      ], next: [] },
    ],
  },

  diagonal: {
    name: '對角線',
    description: '對角斜走，左上至右下分流',
    difficulty: '中等',
    category: 'advanced',
    waypoints: [{ col: 0, row: 1 }, { col: 14, row: 9 }],
    startSegmentId: 'dg-entry',
    segments: [
      { id: 'dg-entry', waypoints: [
        { col: 0, row: 1 }, { col: 4, row: 1 }, { col: 4, row: 5 },
      ], next: ['dg-wide', 'dg-steep'] },
      { id: 'dg-wide', waypoints: [
        { col: 4, row: 5 }, { col: 10, row: 5 }, { col: 10, row: 9 },
      ], next: ['dg-exit'] },
      { id: 'dg-steep', waypoints: [
        { col: 4, row: 5 }, { col: 4, row: 9 }, { col: 10, row: 9 },
      ], next: ['dg-exit'] },
      { id: 'dg-exit', waypoints: [
        { col: 10, row: 9 }, { col: 14, row: 9 },
      ], next: [] },
    ],
  },

  corridor: {
    name: '長廊',
    description: '上下平行雙走廊，獨立分流',
    difficulty: '中等',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'co-entry',
    segments: [
      { id: 'co-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['co-upper', 'co-lower'] },
      { id: 'co-upper', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 3 }, { col: 14, row: 3 },
      ], next: [] },
      { id: 'co-lower', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 7 }, { col: 14, row: 7 },
      ], next: [] },
    ],
  },

  snake: {
    name: '蛇形',
    description: '蛇形蜿蜒，上直下繞兩路考驗',
    difficulty: '中等',
    category: 'advanced',
    waypoints: [{ col: 0, row: 2 }, { col: 14, row: 8 }],
    startSegmentId: 'sn-entry',
    segments: [
      { id: 'sn-entry', waypoints: [
        { col: 0, row: 2 }, { col: 5, row: 2 },
      ], next: ['sn-direct', 'sn-snake'] },
      { id: 'sn-direct', waypoints: [
        { col: 5, row: 2 }, { col: 11, row: 2 }, { col: 11, row: 8 }, { col: 14, row: 8 },
      ], next: [] },
      { id: 'sn-snake', waypoints: [
        { col: 5, row: 2 }, { col: 5, row: 5 }, { col: 3, row: 5 }, { col: 3, row: 8 }, { col: 14, row: 8 },
      ], next: [] },
    ],
  },

  y_fork: {
    name: 'Y型分叉',
    description: '中段分叉，敵人隨機擇路而行',
    difficulty: '中等',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'y-entry',
    segments: [
      { id: 'y-entry', waypoints: [
        { col: 0, row: 5 }, { col: 5, row: 5 },
      ], next: ['y-upper', 'y-lower'] },
      { id: 'y-upper', waypoints: [
        { col: 5, row: 5 }, { col: 5, row: 2 }, { col: 14, row: 2 },
      ], next: [] },
      { id: 'y-lower', waypoints: [
        { col: 5, row: 5 }, { col: 5, row: 8 }, { col: 14, row: 8 },
      ], next: [] },
    ],
  },
};
