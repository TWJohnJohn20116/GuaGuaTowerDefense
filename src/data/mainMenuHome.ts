/**
 * 主選單 · 版面規格（同心拼貼）
 *
 * 骨架：品牌條橫貫頂部 → 中央 Hero 舞台（開始遊戲，6 欄 × 2 列）→
 * 左右各一窄欄放兩塊快捷磚（上：金幣／天賦，下：成就／戰績）→
 * 底部三群入口帶（戰鬥 5 欄／收藏 4 欄／後勤 3 欄）→ 最底一條細基線。
 *
 * 為什麼不是等寬網格：等寬只有整齊，沒有主次。玩家第一眼必須落在「開始遊戲」，
 * 所以主行動拿走畫面正中央最大的一塊，入口退到四周與下方。
 *
 * 為什麼跨欄一律查表：Tailwind JIT 掃不到 `lg:col-start-${n}` 這種拼接，
 * 動態類名必須以完整字串存在原始碼裡，否則 build 後那條 CSS 根本不存在。
 */

/** 拼貼外框：窄螢幕單欄，桌機 12 欄 × 4 列（品牌／快捷與 Hero／快捷與 Hero／三群帶） */
export const HOME_SHELL_CLASS =
  'grid flex-1 grid-cols-1 content-start gap-2 overflow-y-auto lg:min-h-0 lg:grid-cols-12 lg:grid-rows-[auto_minmax(150px,1fr)_minmax(150px,1fr)_auto] lg:content-stretch';

/** 品牌條：橫貫 12 欄，窄螢幕最上 */
export const HOME_BRAND_CLASS = 'order-1 lg:order-none lg:col-span-12';

/** Hero 舞台：桌機正中央 6 欄 × 2 列；窄螢幕排在品牌之後 */
export const HOME_HERO_CLASS =
  'order-2 lg:min-h-0 lg:order-none lg:col-start-4 lg:col-end-10 lg:row-start-2 lg:row-end-4';

/** 快捷欄共同基底：桌機跨 2 列，窄螢幕兩欄並排 */
const QUICK_COL_BASE =
  'order-3 grid grid-cols-2 gap-2.5 lg:order-none lg:min-h-0 lg:flex lg:flex-col lg:gap-2.5';

/** 左快捷欄（金幣／成就） */
export const HOME_QUICK_LEFT_CLASS = QUICK_COL_BASE + ' lg:col-start-1 lg:col-end-4 lg:row-start-2 lg:row-end-4';

/** 右快捷欄（天賦／戰績）：窄螢幕接在左欄之後 */
export const HOME_QUICK_RIGHT_CLASS =
  QUICK_COL_BASE + ' order-4 lg:order-none lg:col-start-10 lg:col-end-13 lg:row-start-2 lg:row-end-4';

/** 三群入口帶：橫貫 12 欄 */
export const HOME_GROUPS_CLASS = 'order-5 lg:order-none lg:col-span-12';

/**
 * 三群：11 個入口全留，但高頻的 4 個（商店／天賦／成就／統計）升格成 Hero 環繞的快捷磚，
 * 群組內不重複出現 —— 同一個目的地放兩塊磚，等於叫玩家猜差別在哪。
 *
 * span 是三群帶內部的 12 欄切割（5 + 4 + 3 = 12），刻意不等寬。
 */
export type HomeGroupId = 'battle' | 'collection' | 'system';

/** 群組磚的場景（快捷四塊不在群組內，避免同一目的地放兩塊磚） */
export type HomeGroupScene =
  | 'statistics'
  | 'replay'
  | 'tutorial'
  | 'encyclopedia'
  | 'skins'
  | 'changelog'
  | 'settings';

export interface HomeEntryGroup {
  id: HomeGroupId;
  scenes: readonly HomeGroupScene[];
  span: 5 | 4 | 3;
}

export const HOME_ENTRY_GROUPS: readonly HomeEntryGroup[] = [
  { id: 'battle', scenes: ['statistics', 'replay', 'tutorial'], span: 5 },
  { id: 'collection', scenes: ['encyclopedia', 'skins'], span: 4 },
  { id: 'system', scenes: ['changelog', 'settings'], span: 3 },
];

/** 快捷磚的場景（Hero 環繞那四塊） */
export const HOME_QUICK_SCENES = ['shop', 'talentTree', 'achievements', 'workshop'] as const;

export type HomeQuickScene = (typeof HOME_QUICK_SCENES)[number];

/** 全部入口場景 */
export type HomeEntryScene = HomeQuickScene | HomeGroupScene;

/** 磚型：tile 是大磚（圖示 64px）、compact 是群組小磚（圖示 44px） */
export type HomeEntrySize = 'tile' | 'compact';

/**
 * 鍵盤焦點序列 = 視覺閱讀序：開始遊戲（預設）→ 左欄 → 右欄 → 三群帶。
 * 'start' 不是場景，是 Hero 上那顆開始遊戲。
 */
export const HOME_FOCUS_ORDER = [
  'start',
  'shop',
  'achievements',
  'talentTree',
  'workshop',
  'statistics',
  'replay',
  'tutorial',
  'encyclopedia',
  'skins',
  'changelog',
  'settings',
] as const;

export type HomeFocusTarget = (typeof HOME_FOCUS_ORDER)[number];

/** 三群帶內部的 12 欄切割 → 靜態類名（Tailwind 掃不到拼接字串） */
export const HOME_GROUP_SPAN_CLASS: Record<5 | 4 | 3, string> = {
  5: 'lg:col-span-5',
  4: 'lg:col-span-4',
  3: 'lg:col-span-3',
};

/** 群組內部磚數 → 靜態欄數類名（窄螢幕一律 2 欄，桌機按群組寬度排滿） */
export const HOME_GROUP_COLS_CLASS: Record<5 | 4 | 3, string> = {
  5: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2',
  3: 'grid-cols-2',
};

/** 焦點環：桌機與窄螢幕共用同一圈，只換顏色 */
export const HOME_FOCUS_RING = 'outline-none focus-visible:ring-4 focus-visible:ring-[var(--cn-signal)]/45';