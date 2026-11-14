/**
 * 額外極難地圖：四葉、甬道、三角洲
 */

import type { PathConfig } from '@/types/game';

export const extraExtremePaths: Record<string, PathConfig> = {
  clover: {
    name: '四葉',
    description: '四葉分岔，四路同時壓境',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'cv-entry',
    segments: [
      { id: 'cv-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['cv-n', 'cv-en', 'cv-es', 'cv-s'] },
      { id: 'cv-n', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 0 }, { col: 14, row: 0 },
      ], next: [] },
      { id: 'cv-en', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 3 }, { col: 14, row: 3 },
      ], next: [] },
      { id: 'cv-es', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 7 }, { col: 14, row: 7 },
      ], next: [] },
      { id: 'cv-s', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 10 }, { col: 14, row: 10 },
      ], next: [] },
    ],
  },

  gauntlet: {
    name: '甬道',
    description: '長甬收束，出口再分上下',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'gn-entry',
    segments: [
      { id: 'gn-entry', waypoints: [
        { col: 0, row: 5 }, { col: 4, row: 5 },
      ], next: ['gn-choke'] },
      { id: 'gn-choke', waypoints: [
        { col: 4, row: 5 }, { col: 8, row: 5 },
      ], next: ['gn-up', 'gn-dn'] },
      { id: 'gn-up', waypoints: [
        { col: 8, row: 5 }, { col: 8, row: 1 }, { col: 14, row: 1 },
      ], next: [] },
      { id: 'gn-dn', waypoints: [
        { col: 8, row: 5 }, { col: 8, row: 9 }, { col: 14, row: 9 },
      ], next: [] },
    ],
  },

  delta: {
    name: '三角洲',
    description: '三路匯流成三角洲出口',
    difficulty: '極難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'dl-entry',
    segments: [
      { id: 'dl-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['dl-n', 'dl-m', 'dl-s'] },
      { id: 'dl-n', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 10, row: 1 }, { col: 10, row: 5 },
      ], next: ['dl-mouth'] },
      { id: 'dl-m', waypoints: [
        { col: 3, row: 5 }, { col: 10, row: 5 },
      ], next: ['dl-mouth'] },
      { id: 'dl-s', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 9 }, { col: 10, row: 9 }, { col: 10, row: 5 },
      ], next: ['dl-mouth'] },
      { id: 'dl-mouth', waypoints: [
        { col: 10, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },
};
