/**
 * 困難難度地圖 · Hard
 *
 * 難度標籤：困難
 *  - 多重分叉、彎道複雜
 *  - 需要進階配置與火力分配
 *  - 含沙漏、髮夾彎、日字廊、鉗形、風車、環形、橋樑、十字交叉
 */

import type { PathConfig } from '@/types/game';

export const hardPaths: Record<string, PathConfig> = {
  ring: {
    name: '環形',
    description: '環形分流，順逆兩向左右並進',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'rg-entry',
    segments: [
      { id: 'rg-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['rg-cw', 'rg-ccw'] },
      { id: 'rg-cw', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 11, row: 1 }, { col: 11, row: 5 },
      ], next: ['rg-exit'] },
      { id: 'rg-ccw', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 9 }, { col: 11, row: 9 }, { col: 11, row: 5 },
      ], next: ['rg-exit'] },
      { id: 'rg-exit', waypoints: [
        { col: 11, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },

  island: {
    name: '島嶼',
    description: '中央島嶼，上下繞行兩條捷徑',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 3, row: 5 }, { col: 11, row: 5 }],
    startSegmentId: 'is-entry',
    segments: [
      { id: 'is-entry', waypoints: [
        { col: 3, row: 5 }, { col: 5, row: 5 },
      ], next: ['is-upper', 'is-lower'] },
      { id: 'is-upper', waypoints: [
        { col: 5, row: 5 }, { col: 5, row: 3 }, { col: 9, row: 3 }, { col: 9, row: 5 },
      ], next: ['is-exit'] },
      { id: 'is-lower', waypoints: [
        { col: 5, row: 5 }, { col: 5, row: 7 }, { col: 9, row: 7 }, { col: 9, row: 5 },
      ], next: ['is-exit'] },
      { id: 'is-exit', waypoints: [
        { col: 9, row: 5 }, { col: 11, row: 5 },
      ], next: [] },
    ],
  },

  bridge: {
    name: '橋樑',
    description: '上下橋擇一通行，靈活配置',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'br-entry',
    segments: [
      { id: 'br-entry', waypoints: [
        { col: 0, row: 5 }, { col: 2, row: 5 },
      ], next: ['br-upper', 'br-lower'] },
      { id: 'br-upper', waypoints: [
        { col: 2, row: 5 }, { col: 2, row: 2 }, { col: 7, row: 2 }, { col: 7, row: 5 }, { col: 12, row: 5 },
      ], next: ['br-exit'] },
      { id: 'br-lower', waypoints: [
        { col: 2, row: 5 }, { col: 2, row: 8 }, { col: 7, row: 8 }, { col: 7, row: 5 }, { col: 12, row: 5 },
      ], next: ['br-exit'] },
      { id: 'br-exit', waypoints: [
        { col: 12, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },

  cross: {
    name: '十字交叉',
    description: '十字交叉，繞行四角後再會合',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'cross-entry',
    segments: [
      { id: 'cross-entry', waypoints: [
        { col: 0, row: 5 }, { col: 6, row: 5 },
      ], next: ['cross-upper', 'cross-lower'] },
      { id: 'cross-upper', waypoints: [
        { col: 6, row: 5 }, { col: 6, row: 1 }, { col: 10, row: 1 }, { col: 10, row: 5 },
      ], next: ['cross-exit'] },
      { id: 'cross-lower', waypoints: [
        { col: 6, row: 5 }, { col: 6, row: 9 }, { col: 10, row: 9 }, { col: 10, row: 5 },
      ], next: ['cross-exit'] },
      { id: 'cross-exit', waypoints: [
        { col: 10, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },

  diamond: {
    name: '菱形叉路',
    description: '菱形對稱分流，再合流的雙線',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'dia-entry',
    segments: [
      { id: 'dia-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['dia-up', 'dia-down'] },
      { id: 'dia-up', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 2 }, { col: 10, row: 2 }, { col: 10, row: 5 },
      ], next: ['dia-exit'] },
      { id: 'dia-down', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 8 }, { col: 10, row: 8 }, { col: 10, row: 5 },
      ], next: ['dia-exit'] },
      { id: 'dia-exit', waypoints: [
        { col: 10, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },

  hourglass: {
    name: '沙漏',
    description: '兩端寬中段窄，雙路收束再張開',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'hg-entry',
    segments: [
      { id: 'hg-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['hg-up1', 'hg-down1'] },
      { id: 'hg-up1', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 6, row: 1 }, { col: 6, row: 5 },
      ], next: ['hg-neck'] },
      { id: 'hg-down1', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 9 }, { col: 6, row: 9 }, { col: 6, row: 5 },
      ], next: ['hg-neck'] },
      { id: 'hg-neck', waypoints: [
        { col: 6, row: 5 }, { col: 8, row: 5 },
      ], next: ['hg-up2', 'hg-down2'] },
      { id: 'hg-up2', waypoints: [
        { col: 8, row: 5 }, { col: 8, row: 1 }, { col: 11, row: 1 }, { col: 11, row: 5 },
      ], next: ['hg-exit'] },
      { id: 'hg-down2', waypoints: [
        { col: 8, row: 5 }, { col: 8, row: 9 }, { col: 11, row: 9 }, { col: 11, row: 5 },
      ], next: ['hg-exit'] },
      { id: 'hg-exit', waypoints: [
        { col: 11, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },

  switchback: {
    name: '髮夾彎',
    description: '來回髮夾彎，火力覆蓋時間長',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 1 }, { col: 14, row: 9 }],
    startSegmentId: 'sb-1',
    segments: [
      { id: 'sb-1', waypoints: [
        { col: 0, row: 1 }, { col: 13, row: 1 }, { col: 13, row: 3 },
      ], next: ['sb-2'] },
      { id: 'sb-2', waypoints: [
        { col: 13, row: 3 }, { col: 1, row: 3 }, { col: 1, row: 5 },
      ], next: ['sb-3'] },
      { id: 'sb-3', waypoints: [
        { col: 1, row: 5 }, { col: 13, row: 5 }, { col: 13, row: 7 },
      ], next: ['sb-4'] },
      { id: 'sb-4', waypoints: [
        { col: 13, row: 7 }, { col: 1, row: 7 }, { col: 1, row: 9 },
      ], next: ['sb-5'] },
      { id: 'sb-5', waypoints: [
        { col: 1, row: 9 }, { col: 14, row: 9 },
      ], next: [] },
    ],
  },

  theta: {
    name: '日字廊',
    description: '上中下三線分流，中軸是捷徑',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'th-entry',
    segments: [
      { id: 'th-entry', waypoints: [
        { col: 0, row: 5 }, { col: 3, row: 5 },
      ], next: ['th-up', 'th-mid', 'th-down'] },
      { id: 'th-up', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 1 }, { col: 11, row: 1 }, { col: 11, row: 5 },
      ], next: ['th-exit'] },
      { id: 'th-mid', waypoints: [
        { col: 3, row: 5 }, { col: 11, row: 5 },
      ], next: ['th-exit'] },
      { id: 'th-down', waypoints: [
        { col: 3, row: 5 }, { col: 3, row: 9 }, { col: 11, row: 9 }, { col: 11, row: 5 },
      ], next: ['th-exit'] },
      { id: 'th-exit', waypoints: [
        { col: 11, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },

  omega: {
    name: '開口環',
    description: '先繞外環再從開口衝出',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 2 }, { col: 14, row: 5 }],
    startSegmentId: 'om-top',
    segments: [
      { id: 'om-top', waypoints: [
        { col: 0, row: 2 }, { col: 12, row: 2 },
      ], next: ['om-drop'] },
      { id: 'om-drop', waypoints: [
        { col: 12, row: 2 }, { col: 12, row: 9 },
      ], next: ['om-bottom'] },
      { id: 'om-bottom', waypoints: [
        { col: 12, row: 9 }, { col: 3, row: 9 },
      ], next: ['om-rise'] },
      { id: 'om-rise', waypoints: [
        { col: 3, row: 9 }, { col: 3, row: 5 },
      ], next: ['om-exit'] },
      { id: 'om-exit', waypoints: [
        { col: 3, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },

  pinwheel: {
    name: '風車',
    description: '四葉分流再合流，四條線都要守',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'pw-entry',
    segments: [
      { id: 'pw-entry', waypoints: [
        { col: 0, row: 5 }, { col: 4, row: 5 },
      ], next: ['pw-n', 'pw-ne', 'pw-se', 'pw-s'] },
      { id: 'pw-n', waypoints: [
        { col: 4, row: 5 }, { col: 4, row: 1 }, { col: 10, row: 1 }, { col: 10, row: 5 },
      ], next: ['pw-exit'] },
      { id: 'pw-ne', waypoints: [
        { col: 4, row: 5 }, { col: 6, row: 3 }, { col: 8, row: 3 }, { col: 10, row: 5 },
      ], next: ['pw-exit'] },
      { id: 'pw-se', waypoints: [
        { col: 4, row: 5 }, { col: 6, row: 7 }, { col: 8, row: 7 }, { col: 10, row: 5 },
      ], next: ['pw-exit'] },
      { id: 'pw-s', waypoints: [
        { col: 4, row: 5 }, { col: 4, row: 9 }, { col: 10, row: 9 }, { col: 10, row: 5 },
      ], next: ['pw-exit'] },
      { id: 'pw-exit', waypoints: [
        { col: 10, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },

  pincer: {
    name: '鉗形',
    description: '上下貼邊夾擊，中段匯流成殺區',
    difficulty: '困難',
    category: 'advanced',
    waypoints: [{ col: 0, row: 5 }, { col: 14, row: 5 }],
    startSegmentId: 'pn-entry',
    segments: [
      { id: 'pn-entry', waypoints: [
        { col: 0, row: 5 }, { col: 2, row: 5 },
      ], next: ['pn-upper', 'pn-lower'] },
      { id: 'pn-upper', waypoints: [
        { col: 2, row: 5 }, { col: 2, row: 0 }, { col: 11, row: 0 }, { col: 11, row: 5 },
      ], next: ['pn-exit'] },
      { id: 'pn-lower', waypoints: [
        { col: 2, row: 5 }, { col: 2, row: 10 }, { col: 11, row: 10 }, { col: 11, row: 5 },
      ], next: ['pn-exit'] },
      { id: 'pn-exit', waypoints: [
        { col: 11, row: 5 }, { col: 14, row: 5 },
      ], next: [] },
    ],
  },
};
