/**
 * 額外中等地圖：漏斗、鉤形、三線
 */

import type { PathConfig } from '@/types/game';

export const extraMediumPaths: Record<string, PathConfig> = {
  funnel: {
    name: '漏斗',
    description: '先分後合再分，頸部是決戰點',
    difficulty: '中等',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'fn-entry',
    segments: [
      { id: 'fn-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['fn-up', 'fn-down'] },
      { id: 'fn-up', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 2 }, { col: 7, row: 2 }, { col: 7, row: 5 },
      ], next: ['fn-neck'] },
      { id: 'fn-down', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 8 }, { col: 7, row: 8 }, { col: 7, row: 5 },
      ], next: ['fn-neck'] },
      { id: 'fn-neck', waypoints: [
        { col: 7, row: 5 }, { col: 10, row: 5 },
      ], next: ['fn-up2', 'fn-down2'] },
      { id: 'fn-up2', waypoints: [
        { col: 10, row: 5 }, { col: 10, row: 3 }, { col: 14, row: 3 },
      ], next: [] },
      { id: 'fn-down2', waypoints: [
        { col: 10, row: 5 }, { col: 10, row: 7 }, { col: 14, row: 7 },
      ], next: [] },
    ],
  },

  hook: {
    name: '鉤形',
    description: '遠鉤繞底，近路直切考驗站位',
    difficulty: '中等',
    category: 'advanced',
    waypoints: [{ col: 0, row: 1 }, { col: 14, row: 9 }],
    startSegmentId: 'hk-entry',
    segments: [
      { id: 'hk-entry', waypoints: [
        { col: 0, row: 1 }, { col: 4, row: 1 },
      ], next: ['hk-long', 'hk-cut'] },
      { id: 'hk-long', waypoints: [
        { col: 4, row: 1 }, { col: 12, row: 1 }, { col: 12, row: 9 },
      ], next: ['hk-exit'] },
      { id: 'hk-cut', waypoints: [
        { col: 4, row: 1 }, { col: 4, row: 9 }, { col: 12, row: 9 },
      ], next: ['hk-exit'] },
      { id: 'hk-exit', waypoints: [
        { col: 12, row: 9 }, { col: 14, row: 9 },
      ], next: [] },
    ],
  },

  triple: {
    name: '三線',
    description: '上中下三路並行，單點火力攔不住',
    difficulty: '中等',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'tr-entry',
    segments: [
      { id: 'tr-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['tr-top', 'tr-mid', 'tr-bot'] },
      { id: 'tr-top', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 14, row: 1 },
      ], next: [] },
      { id: 'tr-mid', waypoints: [
        { col: 3, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
      { id: 'tr-bot', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 9 }, { col: 14, row: 9 },
      ], next: [] },
    ],
  },
};
