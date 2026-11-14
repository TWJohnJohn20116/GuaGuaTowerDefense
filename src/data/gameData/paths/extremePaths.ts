/**
 * 極限難度地圖 · Extreme
 *
 * 難度標籤：極難
 *  - 多重路徑同時並進
 *  - 需要極致火力分配與場控
 */

import type { PathConfig } from '@/types/game';

export const extremePaths: Record<string, PathConfig> = {
  double_helix: {
    name: '雙螺旋',
    description: '雙螺旋纏繞，兩面同時兼顧',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'dh-entry',
    segments: [
      { id: 'dh-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['dh-upper', 'dh-lower'] },
      { id: 'dh-upper', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 2 }, { col: 8, row: 2 }, { col: 11, row: 2 }, { col: 11, row: 5 },
      ], next: ['dh-exit'] },
      { id: 'dh-lower', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 8 }, { col: 8, row: 8 }, { col: 11, row: 8 }, { col: 11, row: 5 },
      ], next: ['dh-exit'] },
      { id: 'dh-exit', waypoints: [
        { col: 11, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },

  maze: {
    name: '迷宮',
    description: '多重分岔迷宮，敵人路線難測',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 7 }],
    startSegmentId: 'maze-entry',
    segments: [
      { id: 'maze-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['maze-upper', 'maze-lower'] },
      { id: 'maze-upper', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 7, row: 1 }, { col: 7, row: 5 }, { col: 10, row: 5 },
      ], next: ['maze-exit'] },
      { id: 'maze-lower', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 9 }, { col: 7, row: 9 }, { col: 7, row: 7 }, { col: 10, row: 7 },
      ], next: ['maze-exit-low'] },
      { id: 'maze-exit', waypoints: [
        { col: 10, row: 5 }, { col: 10, row: 7 }, { col: 14, row: 7 },
      ], next: [] },
      { id: 'maze-exit-low', waypoints: [
        { col: 10, row: 7 }, { col: 14, row: 7 },
      ], next: [] },
    ],
  },

  trident: {
    name: '三叉戟',
    description: '三線並進，無合流的極限考驗',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'tri-entry',
    segments: [
      { id: 'tri-entry', waypoints: [
        { col: 0, row: 5 }, { col: 4, row: 5 },
      ], next: ['tri-top', 'tri-mid', 'tri-bot'] },
      { id: 'tri-top', waypoints: [
        { col: 4, row: 5 }, { col: 4, row: 1 }, { col: 14, row: 1 },
      ], next: [] },
      { id: 'tri-mid', waypoints: [
        { col: 4, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
      { id: 'tri-bot', waypoints: [
        { col: 4, row: 5 }, { col: 4, row: 9 }, { col: 14, row: 9 },
      ], next: [] },
    ],
  },
};
