/**
 * 主題色票（12 套：10 亮色 + 2 深色）
 *
 * 顏色分三種角色，不要混用：
 *   1. 墨與線（ink / line）：**文字**與邊框，必須在 paper 上達到 WCAG AA。
 *   2. 強調區三階：primary 只當**填色與邊框**、primaryDeep 當**深填色**、
 *      accentText 才是**強調色文字**（深色主題的 primary 太亮，不能當填色配白字）。
 *   3. cta / onCta：主要行動按鈕的底色與字色，12 套都驗過 onCta/cta ≥ 4.5:1。
 *
 * 所有對比由 src/data/themeContrast.ts 在 CI 測試中強制檢查，改色票就要跑測試。
 */

export type ThemeId =
  | 'coral'
  | 'mint'
  | 'sky'
  | 'sun'
  | 'grape'
  | 'rose'
  | 'forest'
  | 'salt'
  | 'caramel'
  | 'sakura'
  | 'midnight'
  | 'abyss';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  /** 頁面紙底 */
  paper: string;
  /** 紙底第二階（條紋、hover 底） */
  paper2: string;
  /** 卡片 */
  card: string;
  /** 卡片第二階 */
  card2: string;
  /** 主墨色（標題、正文） */
  ink: string;
  ink2: string;
  ink3: string;
  ink4: string;
  /** 粗墨線（邊框、貼紙投影） */
  line: string;
  lineSoft: string;
  lineMid: string;
  /** 強調色：填色／邊框／選中指示 */
  primary: string;
  /** 強調色的深階：深填色、深色主題的陰影 */
  primaryDeep: string;
  /** 強調色的淺階：徽章底 */
  primarySoft: string;
  /** 強調色**文字**（在 paper / card / primarySoft 上可讀） */
  accentText: string;
  /** 主要行動按鈕底色 */
  cta: string;
  /** 主要行動按鈕字色 */
  onCta: string;
}

/** 遊戲場地（canvas）配色：只影響地板、格子、道路，不影響敵人與塔的造型 */
export interface ThemeBoard {
  /** 戰場底色（畫布填滿） */
  floor: string;
  /** 空地格子 */
  tile: string;
  /** 道路 */
  path: string;
  /** 起點格 */
  start: string;
  /** 終點格 */
  end: string;
  /** 道路描邊／接縫 */
  edge: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  mode: ThemeMode;
  colors: ThemeColors;
  /** 頁面柔光（三層 radial-gradient），顏色以 rgba 字串給 */
  glow: [string, string, string];
  /** 紙底細點紋顏色 */
  dot: string;
  board: ThemeBoard;
}

export const DEFAULT_THEME_ID: ThemeId = 'coral';

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: 'coral',
    mode: 'light',
    colors: {
      paper: '#fff8ef', paper2: '#ffeede', card: '#ffffff', card2: '#fff4e6',
      ink: '#2e2440', ink2: '#5a4e75', ink3: '#6e6288', ink4: '#75698f',
      line: '#2e2440', lineSoft: '#e8ddf3', lineMid: '#cdbfe0',
      primary: '#ff6b4a', primaryDeep: '#b8330f', primarySoft: '#ffe3db',
      accentText: '#b8330f', cta: '#b8330f', onCta: '#ffffff',
    },
    glow: ['rgba(255, 107, 74, 0.13)', 'rgba(155, 107, 255, 0.12)', 'rgba(61, 165, 255, 0.12)'],
    dot: 'rgba(46, 36, 64, 0.055)',
    board: { floor: '#241b28', tile: '#2c2231', path: '#3a3040', start: '#2f3d31', end: '#43303a', edge: '#1a1218' },
  },
  {
    id: 'mint',
    mode: 'light',
    colors: {
      paper: '#f2fbf6', paper2: '#e2f7ec', card: '#ffffff', card2: '#eefaf3',
      ink: '#16302a', ink2: '#3a5f52', ink3: '#4a7162', ink4: '#4b7364',
      line: '#16302a', lineSoft: '#d2ece0', lineMid: '#b0d8c6',
      primary: '#0f9d63', primaryDeep: '#086139', primarySoft: '#d4f6e7',
      accentText: '#086139', cta: '#086139', onCta: '#ffffff',
    },
    glow: ['rgba(15, 157, 99, 0.13)', 'rgba(61, 165, 255, 0.12)', 'rgba(255, 107, 74, 0.10)'],
    dot: 'rgba(22, 48, 42, 0.055)',
    board: { floor: '#14211b', tile: '#1b2a23', path: '#294036', start: '#1f3a2c', end: '#3a2430', edge: '#0e1512' },
  },
  {
    id: 'sky',
    mode: 'light',
    colors: {
      paper: '#f2f8fd', paper2: '#e2f0fb', card: '#ffffff', card2: '#edf6ff',
      ink: '#13243a', ink2: '#375270', ink3: '#456482', ink4: '#50708f',
      line: '#13243a', lineSoft: '#d3e6f5', lineMid: '#b0cfe9',
      primary: '#1f7fd1', primaryDeep: '#124f85', primarySoft: '#d6ecff',
      accentText: '#124f85', cta: '#124f85', onCta: '#ffffff',
    },
    glow: ['rgba(31, 127, 209, 0.14)', 'rgba(155, 107, 255, 0.10)', 'rgba(35, 201, 139, 0.10)'],
    dot: 'rgba(19, 36, 58, 0.055)',
    board: { floor: '#131d29', tile: '#1a2735', path: '#27394c', start: '#1c3327', end: '#3a2433', edge: '#0b1219' },
  },
  {
    id: 'sun',
    mode: 'light',
    colors: {
      paper: '#fffaf0', paper2: '#fff3dc', card: '#ffffff', card2: '#fff8e6',
      ink: '#3a2c10', ink2: '#5f4a1f', ink3: '#6f5a2c', ink4: '#7a6535',
      line: '#3a2c10', lineSoft: '#f2e4c6', lineMid: '#e0cda2',
      primary: '#b5760a', primaryDeep: '#7a4c00', primarySoft: '#fff0c2',
      accentText: '#7a4c00', cta: '#7a4c00', onCta: '#ffffff',
    },
    glow: ['rgba(181, 118, 10, 0.14)', 'rgba(255, 107, 74, 0.10)', 'rgba(35, 201, 139, 0.08)'],
    dot: 'rgba(58, 44, 16, 0.055)',
    board: { floor: '#221d15', tile: '#2b2419', path: '#3b3222', start: '#263425', end: '#3d2a26', edge: '#14100a' },
  },
  {
    id: 'grape',
    mode: 'light',
    colors: {
      paper: '#f8f4ff', paper2: '#f0e8ff', card: '#ffffff', card2: '#f7f1ff',
      ink: '#2b1f45', ink2: '#4f3d75', ink3: '#5e4c86', ink4: '#6a5892',
      line: '#2b1f45', lineSoft: '#e3d9f7', lineMid: '#cbbcf0',
      primary: '#6f3fe8', primaryDeep: '#4b23a8', primarySoft: '#ebe1ff',
      accentText: '#4b23a8', cta: '#4b23a8', onCta: '#ffffff',
    },
    glow: ['rgba(111, 63, 232, 0.13)', 'rgba(255, 123, 197, 0.10)', 'rgba(61, 165, 255, 0.10)'],
    dot: 'rgba(43, 31, 69, 0.055)',
    board: { floor: '#1a1726', tile: '#231e30', path: '#322944', start: '#20301f', end: '#3a2436', edge: '#100d18' },
  },
  {
    id: 'rose',
    mode: 'light',
    colors: {
      paper: '#fff5f9', paper2: '#ffe8f1', card: '#ffffff', card2: '#fff0f6',
      ink: '#3a1f2e', ink2: '#654159', ink3: '#755167', ink4: '#805c73',
      line: '#3a1f2e', lineSoft: '#f7d9e6', lineMid: '#eab7cf',
      primary: '#cf3d72', primaryDeep: '#8f1446', primarySoft: '#ffdfea',
      accentText: '#8f1446', cta: '#8f1446', onCta: '#ffffff',
    },
    glow: ['rgba(207, 61, 114, 0.13)', 'rgba(255, 107, 74, 0.10)', 'rgba(155, 107, 255, 0.10)'],
    dot: 'rgba(58, 31, 46, 0.055)',
    board: { floor: '#231720', tile: '#2c1e28', path: '#3d2935', start: '#253329', end: '#45283a', edge: '#160e13' },
  },
  {
    id: 'forest',
    mode: 'light',
    colors: {
      paper: '#f5f8f0', paper2: '#e9f0dd', card: '#ffffff', card2: '#f1f7e8',
      ink: '#1f2b1c', ink2: '#42523c', ink3: '#52654a', ink4: '#5e7256',
      line: '#1f2b1c', lineSoft: '#dbe7cb', lineMid: '#c1d5a9',
      primary: '#24704a', primaryDeep: '#144a2c', primarySoft: '#ddf0e2',
      accentText: '#144a2c', cta: '#144a2c', onCta: '#ffffff',
    },
    glow: ['rgba(36, 112, 74, 0.14)', 'rgba(201, 159, 0, 0.10)', 'rgba(61, 165, 255, 0.08)'],
    dot: 'rgba(31, 43, 28, 0.055)',
    board: { floor: '#141d16', tile: '#1b271d', path: '#293a2b', start: '#1f3a26', end: '#3a2a22', edge: '#0d130e' },
  },
  {
    id: 'salt',
    mode: 'light',
    colors: {
      paper: '#f6f7f9', paper2: '#eaedf1', card: '#ffffff', card2: '#f2f4f7',
      ink: '#202a33', ink2: '#44525f', ink3: '#54646f', ink4: '#5f707b',
      line: '#202a33', lineSoft: '#dde3e9', lineMid: '#c4ced8',
      primary: '#2f587a', primaryDeep: '#1e3d55', primarySoft: '#dbe8f2',
      accentText: '#1e3d55', cta: '#1e3d55', onCta: '#ffffff',
    },
    glow: ['rgba(47, 88, 122, 0.14)', 'rgba(148, 163, 184, 0.14)', 'rgba(35, 201, 139, 0.08)'],
    dot: 'rgba(32, 42, 51, 0.055)',
    board: { floor: '#161a1f', tile: '#1d232a', path: '#2a333c', start: '#1f3229', end: '#3a2a30', edge: '#0d1013' },
  },
  {
    id: 'caramel',
    mode: 'light',
    colors: {
      paper: '#fdf6ec', paper2: '#f9ecd8', card: '#ffffff', card2: '#fdf2e4',
      ink: '#32241a', ink2: '#59422f', ink3: '#6a5140', ink4: '#755c49',
      line: '#32241a', lineSoft: '#eddfcb', lineMid: '#dcc6a9',
      primary: '#b06a1f', primaryDeep: '#7a4310', primarySoft: '#ffeed6',
      accentText: '#7a4310', cta: '#7a4310', onCta: '#ffffff',
    },
    glow: ['rgba(176, 106, 31, 0.14)', 'rgba(255, 107, 74, 0.10)', 'rgba(35, 201, 139, 0.08)'],
    dot: 'rgba(50, 36, 26, 0.055)',
    board: { floor: '#211a14', tile: '#2a2219', path: '#3a2f24', start: '#263326', end: '#3f2a22', edge: '#130e0a' },
  },
  {
    id: 'sakura',
    mode: 'light',
    colors: {
      paper: '#fff6f8', paper2: '#ffe9ef', card: '#ffffff', card2: '#fff2f5',
      ink: '#3a2430', ink2: '#62455a', ink3: '#715467', ink4: '#7c5f72',
      line: '#3a2430', lineSoft: '#f7dde4', lineMid: '#ecc0cd',
      primary: '#c84670', primaryDeep: '#8e1e45', primarySoft: '#ffe2ea',
      accentText: '#8e1e45', cta: '#8e1e45', onCta: '#ffffff',
    },
    glow: ['rgba(200, 70, 112, 0.13)', 'rgba(255, 123, 197, 0.10)', 'rgba(155, 107, 255, 0.08)'],
    dot: 'rgba(58, 36, 48, 0.05)',
    board: { floor: '#231a20', tile: '#2c2128', path: '#3d2f36', start: '#253329', end: '#44263a', edge: '#150e12' },
  },
  {
    id: 'midnight',
    mode: 'dark',
    colors: {
      paper: '#14121c', paper2: '#1a1725', card: '#1f1b2b', card2: '#262133',
      ink: '#f5f1ff', ink2: '#d4cbe9', ink3: '#b9aed2', ink4: '#a89cc2',
      line: '#5c4f7d', lineSoft: '#332c45', lineMid: '#463b5e',
      primary: '#ff8f73', primaryDeep: '#b83c17', primarySoft: '#33232c',
      accentText: '#ff8f73', cta: '#ff8f73', onCta: '#1a1218',
    },
    glow: ['rgba(255, 143, 115, 0.16)', 'rgba(155, 107, 255, 0.14)', 'rgba(61, 165, 255, 0.12)'],
    dot: 'rgba(255, 255, 255, 0.05)',
    board: { floor: '#0e0c15', tile: '#161320', path: '#211d2e', start: '#17261e', end: '#2a1620', edge: '#06050a' },
  },
  {
    id: 'abyss',
    mode: 'dark',
    colors: {
      paper: '#0f1622', paper2: '#141e2c', card: '#18222f', card2: '#1e2a38',
      ink: '#eaf2ff', ink2: '#c3d4e8', ink3: '#a8bcd4', ink4: '#97abc4',
      line: '#3c5c78', lineSoft: '#233247', lineMid: '#2f4258',
      primary: '#57c8ff', primaryDeep: '#14648f', primarySoft: '#152c3b',
      accentText: '#57c8ff', cta: '#57c8ff', onCta: '#0b1219',
    },
    glow: ['rgba(87, 200, 255, 0.16)', 'rgba(35, 201, 139, 0.12)', 'rgba(155, 107, 255, 0.10)'],
    dot: 'rgba(255, 255, 255, 0.05)',
    board: { floor: '#0b1219', tile: '#101a24', path: '#1a2836', start: '#12241d', end: '#241a24', edge: '#05080c' },
  },
];

export const THEME_IDS: readonly ThemeId[] = THEMES.map((t) => t.id);

const THEME_MAP = new Map<ThemeId, ThemeDefinition>(THEMES.map((t) => [t.id, t] as const));

/** 取主題；傳入未知 id 一律回退預設（存檔壞掉不會讓畫面空白） */
export function getTheme(id: ThemeId): ThemeDefinition {
  return THEME_MAP.get(id) ?? THEMES[0];
}

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEME_MAP.has(value as ThemeId);
}

/** 顏色鍵 → CSS 變數名。新增顏色鍵時這裡沒補就會被型別擋住 */
const COLOR_VAR: Record<keyof ThemeColors, string> = {
  paper: '--cn-paper',
  paper2: '--cn-paper-2',
  card: '--cn-card',
  card2: '--cn-card-2',
  ink: '--cn-ink',
  ink2: '--cn-ink-2',
  ink3: '--cn-ink-3',
  ink4: '--cn-ink-4',
  line: '--cn-line',
  lineSoft: '--cn-line-soft',
  lineMid: '--cn-line-mid',
  primary: '--cn-coral',
  primaryDeep: '--cn-coral-deep',
  primarySoft: '--cn-coral-soft',
  accentText: '--cn-accent-text',
  cta: '--cn-cta',
  onCta: '--cn-on-cta',
};

/** 把一套主題攤平成可直接 setProperty 的 CSS 變數表 */
export function themeCssVars(theme: ThemeDefinition): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of Object.keys(COLOR_VAR) as (keyof ThemeColors)[]) {
    vars[COLOR_VAR[key]] = theme.colors[key];
  }
  vars['--cn-glow-1'] = theme.glow[0];
  vars['--cn-glow-2'] = theme.glow[1];
  vars['--cn-glow-3'] = theme.glow[2];
  vars['--cn-dot'] = theme.dot;
  return vars;
}
