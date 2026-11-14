/**
 * 額外困難地圖：盤繞、閘門、谷地
 */

import type { PathConfig } from '@/types/game';

export const extraHardPaths: Record<string, PathConfig> = {
  coil: {
    name: '盤繞',
    description: '內圈盤繞或外圈遠路擇一',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'cl-entry',
    segments: [
      { id: 'cl-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['cl-inner', 'cl-outer'] },
      { id: 'cl-inner', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 3 }, { col: 7, row: 3 }, { col: 7, row: 7 }, { col: 11, row: 7 }, { col: 11, row: 5 },
      ], next: ['cl-exit'] },
      { id: 'cl-outer', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 12, row: 1 }, { col: 12, row: 9 }, { col: 11, row: 9 }, { col: 11, row: 5 },
      ], next: ['cl-exit'] },
      { id: 'cl-exit', waypoints: [
        { col: 11, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },

  gate: {
    name: '閘門',
    description: '中段閘門，上下分流再匯合',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'gt-entry',
    segments: [
      { id: 'gt-entry', waypoints: [
        { col: 0, row: 5 }, { col: 4, row: 5 },
      ], next: ['gt-up', 'gt-down'] },
      { id: 'gt-up', waypoints: [
        { col: 4, row: 5 }, { col: 4, row: 2 }, { col: 8, row: 2 }, { col: 8, row: 5 },
      ], next: ['gt-gate'] },
      { id: 'gt-down', waypoints: [
        { col: 4, row: 5 }, { col: 4, row: 8 }, { col: 8, row: 8 }, { col: 8, row: 5 },
      ], next: ['gt-gate'] },
      { id: 'gt-gate', waypoints: [
        { col: 8, row: 5 }, { col: 10, row: 5 },
      ], next: ['gt-up2', 'gt-down2'] },
      { id: 'gt-up2', waypoints: [
        { col: 10, row: 5 }, { col: 10, row: 3 }, { col: 14, row: 3 },
      ], next: [] },
      { id: 'gt-down2', waypoints: [
        { col: 10, row: 5 }, { col: 10, row: 7 }, { col: 14, row: 7 },
      ], next: [] },
    ],
  },

  valley: {
    name: '谷地',
    description: '谷底直切或兩岸高地繞行',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'vl-entry',
    segments: [
      { id: 'vl-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['vl-floor', 'vl-north', 'vl-south'] },
      { id: 'vl-floor', waypoints: [
        { col: 3, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
      { id: 'vl-north', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 14, row: 1 },
      ], next: [] },
      { id: 'vl-south', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 9 }, { col: 14, row: 9 },
      ], next: [] },
    ],
  },
};
