/**
 * 額外極難地圖：稜鏡、層瀑、錨形
 */

import type { PathConfig } from '@/types/game';

export const extraExtremePaths2: Record<string, PathConfig> = {
  prism: {
    name: '稜鏡',
    description: '三路分光再收束，出口再裂兩道',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 2 }],
    startSegmentId: 'pr-entry',
    segments: [
      { id: 'pr-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['pr-hi', 'pr-mid', 'pr-lo'] },
      { id: 'pr-hi', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 8, row: 1 }, { col: 8, row: 5 },
      ], next: ['pr-neck'] },
      { id: 'pr-mid', waypoints: [
        { col: 3, row: 5 }, { col: 8, row: 5 },
      ], next: ['pr-neck'] },
      { id: 'pr-lo', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 9 }, { col: 8, row: 9 }, { col: 8, row: 5 },
      ], next: ['pr-neck'] },
      { id: 'pr-neck', waypoints: [
        { col: 8, row: 5 }, { col: 10, row: 5 },
      ], next: ['pr-up', 'pr-dn'] },
      { id: 'pr-up', waypoints: [
        { col: 10, row: 5 }, { col: 10, row: 2 }, { col: 14, row: 2 },
      ], next: [] },
      { id: 'pr-dn', waypoints: [
        { col: 10, row: 5 }, { col: 10, row: 8 }, { col: 14, row: 8 },
      ], next: [] },
    ],
  },

  cascade: {
    name: '層瀑',
    description: '高台直切或跌落谷底，兩層同時出水',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 1 }, { col: 14, row: 8 }],
    startSegmentId: 'cs-entry',
    segments: [
      { id: 'cs-entry', waypoints: [
        { col: 0, row: 1 }, { col: 3, row: 1 },
      ], next: ['cs-top', 'cs-drop'] },
      { id: 'cs-top', waypoints: [
        { col: 3, row: 1 }, { col: 12, row: 1 }, { col: 12, row: 3 }, { col: 14, row: 3 },
      ], next: [] },
      { id: 'cs-drop', waypoints: [
        { col: 3, row: 1 }, { col: 3, row: 8 }, { col: 12, row: 8 }, { col: 14, row: 8 },
      ], next: [] },
    ],
  },

  anchor: {
    name: '錨形',
    description: '錨柄直進，兩翼張開雙出口',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 1 }],
    startSegmentId: 'an-entry',
    segments: [
      { id: 'an-entry', waypoints: [
        { col: 0, row: 5 }, { col: 5, row: 5 },
      ], next: ['an-shank'] },
      { id: 'an-shank', waypoints: [
        { col: 5, row: 5 }, { col: 9, row: 5 },
      ], next: ['an-up', 'an-dn'] },
      { id: 'an-up', waypoints: [
        { col: 9, row: 5 }, { col: 9, row: 1 }, { col: 14, row: 1 },
      ], next: [] },
      { id: 'an-dn', waypoints: [
        { col: 9, row: 5 }, { col: 9, row: 9 }, { col: 14, row: 9 },
      ], next: [] },
    ],
  },
};
