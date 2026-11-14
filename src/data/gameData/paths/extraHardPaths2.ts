/**
 * 額外困難地圖：新月、楔形、格網
 */

import type { PathConfig } from '@/types/game';

export const extraHardPaths2: Record<string, PathConfig> = {
  crescent: {
    name: '新月',
    description: '外弧遠繞，內弦直切考驗站位',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 1 }],
    startSegmentId: 'cr-entry',
    segments: [
      { id: 'cr-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['cr-arc', 'cr-chord'] },
      { id: 'cr-arc', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 13, row: 1 }, { col: 14, row: 1 },
      ], next: [] },
      { id: 'cr-chord', waypoints: [
        { col: 3, row: 5 }, { col: 10, row: 5 }, { col: 10, row: 9 }, { col: 14, row: 9 },
      ], next: [] },
    ],
  },

  wedge: {
    name: '楔形',
    description: '兩翼擠向尖端，出口再裂上下',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 2 }],
    startSegmentId: 'wd-entry',
    segments: [
      { id: 'wd-entry', waypoints: [
        { col: 0, row: 5 }, { col: 4, row: 5 },
      ], next: ['wd-up', 'wd-dn'] },
      { id: 'wd-up', waypoints: [
        { col: 4, row: 5 }, { col: 4, row: 2 }, { col: 10, row: 2 }, { col: 10, row: 5 },
      ], next: ['wd-tip'] },
      { id: 'wd-dn', waypoints: [
        { col: 4, row: 5 }, { col: 4, row: 8 }, { col: 10, row: 8 }, { col: 10, row: 5 },
      ], next: ['wd-tip'] },
      { id: 'wd-tip', waypoints: [
        { col: 10, row: 5 }, { col: 12, row: 5 },
      ], next: ['wd-out-up', 'wd-out-dn'] },
      { id: 'wd-out-up', waypoints: [
        { col: 12, row: 5 }, { col: 12, row: 2 }, { col: 14, row: 2 },
      ], next: [] },
      { id: 'wd-out-dn', waypoints: [
        { col: 12, row: 5 }, { col: 12, row: 8 }, { col: 14, row: 8 },
      ], next: [] },
    ],
  },

  lattice: {
    name: '格網',
    description: '上下格線收束再裂，單點攔不住',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 2 }],
    startSegmentId: 'lt-entry',
    segments: [
      { id: 'lt-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['lt-hi', 'lt-lo'] },
      { id: 'lt-hi', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 9, row: 1 }, { col: 9, row: 5 },
      ], next: ['lt-mid'] },
      { id: 'lt-lo', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 9 }, { col: 9, row: 9 }, { col: 9, row: 5 },
      ], next: ['lt-mid'] },
      { id: 'lt-mid', waypoints: [
        { col: 9, row: 5 }, { col: 11, row: 5 },
      ], next: ['lt-hi2', 'lt-lo2'] },
      { id: 'lt-hi2', waypoints: [
        { col: 11, row: 5 }, { col: 11, row: 2 }, { col: 14, row: 2 },
      ], next: [] },
      { id: 'lt-lo2', waypoints: [
        { col: 11, row: 5 }, { col: 11, row: 8 }, { col: 14, row: 8 },
      ], next: [] },
    ],
  },
};
