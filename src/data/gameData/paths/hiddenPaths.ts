/**
 * 隱藏 / 戰役專用地圖（spiral · river · fortress）
 * 亦可在「進階」分類中挑戰
 */

import type { PathConfig } from '@/types/game';

export const hiddenPaths: Record<string, PathConfig> = {
  spiral: {
    name: '螺旋',
    description: '由外而內盤旋收斂，路徑不斷收窄',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'sp-outer',
    segments: [
      {
        id: 'sp-outer',
        waypoints: [
          { col: 0, row: 5 }, { col: 2, row: 5 }, { col: 2, row: 2 },
          { col: 12, row: 2 }, { col: 12, row: 8 }, { col: 4, row: 8 },
        ],
        next: ['sp-inner'],
      },
      {
        id: 'sp-inner',
        waypoints: [
          { col: 4, row: 8 }, { col: 4, row: 4 }, { col: 10, row: 4 },
          { col: 10, row: 6 }, { col: 7, row: 6 }, { col: 7, row: 5 },
        ],
        next: ['sp-exit'],
      },
      {
        id: 'sp-exit',
        waypoints: [{ col: 7, row: 5 }, { col: 14, row: 5 }],
        next: [],
      },
    ],
  },

  river: {
    name: '河流',
    description: 'S 形河道蜿蜒，兩岸交替設防',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 3 }, { col: 14, row: 7 }],
    startSegmentId: 'rv-up',
    segments: [
      {
        id: 'rv-up',
        waypoints: [
          { col: 0, row: 3 }, { col: 4, row: 3 }, { col: 4, row: 7 },
          { col: 10, row: 7 },
        ],
        next: ['rv-down'],
      },
      {
        id: 'rv-down',
        waypoints: [
          { col: 10, row: 7 }, { col: 10, row: 3 }, { col: 14, row: 3 },
          { col: 14, row: 7 },
        ],
        next: [],
      },
    ],
  },

  fortress: {
    name: '要塞',
    description: '雙層城牆環抱，內外兩線需同時防守',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'ft-gate',
    segments: [
      {
        id: 'ft-gate',
        waypoints: [{ col: 0, row: 5 }, { col: 3, row: 5 }],
        next: ['ft-outer-cw', 'ft-outer-ccw'],
      },
      {
        id: 'ft-outer-cw',
        waypoints: [
          { col: 3, row: 5 }, { col: 3, row: 2 }, { col: 11, row: 2 },
          { col: 11, row: 5 }, { col: 8, row: 5 },
        ],
        next: ['ft-inner'],
      },
      {
        id: 'ft-outer-ccw',
        waypoints: [
          { col: 3, row: 5 }, { col: 3, row: 8 }, { col: 11, row: 8 },
          { col: 11, row: 5 }, { col: 8, row: 5 },
        ],
        next: ['ft-inner'],
      },
      {
        id: 'ft-inner',
        waypoints: [
          { col: 8, row: 5 }, { col: 8, row: 4 }, { col: 6, row: 4 },
          { col: 6, row: 6 }, { col: 8, row: 6 }, { col: 10, row: 5 },
        ],
        next: ['ft-exit'],
      },
      {
        id: 'ft-exit',
        waypoints: [{ col: 10, row: 5 }, { col: 14, row: 5 }],
        next: [],
      },
    ],
  },
};
