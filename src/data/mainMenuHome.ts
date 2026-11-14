/**
 * 主選單 · 版面規格
 *
 * 版面是「左欄招牌 + 右欄 bento 入口牆 + 底部遙測帶」。
 * bento = 12 欄網格、卡片跨不同欄數，行與行之間才有大小節奏；
 * 全部等寬的網格看起來整齊，但沒有主次，久了就死板。
 *
 * 跨欄數只能用靜態類名（JIT 掃不到 `lg:col-span-${n}` 這種拼接），
 * 所以這裡放的是「欄數 → 類名」的對照表，元件端只查表不拼字串。
 */

/** 左欄招牌：桌機固定 392，行動版自動滿寬 */
export const HOME_RAIL_CLASS =
  'relative flex w-auto shrink-0 flex-col overflow-hidden rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_5px_0_-1px_rgba(46,36,64,0.18)] lg:w-[392px]';

/** 右欄 bento 網格：窄螢幕 2 欄、桌機 12 欄 */
export const HOME_GRID_CLASS =
  'grid min-h-0 flex-1 auto-rows-[minmax(148px,auto)] grid-cols-2 gap-3 overflow-visible p-1 lg:auto-rows-fr lg:grid-cols-12 lg:overflow-y-auto';

/** 跨欄數：12 欄網格上的欄數 */
type HomeEntrySpan = 2 | 3 | 4 | 5;

/** 跨欄數 → 靜態類名（2/3 = 直式小磚，4/5 = 橫式大磚） */
export const HOME_SPAN_CLASS: Record<HomeEntrySpan, string> = {
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
};

/** 卡片尺寸檔：4 欄以上用橫式大磚，3 欄以下用直式小磚 */
export type HomeEntrySize = 'tile' | 'compact';

/**
 * 入口順序 = 畫面順序，刻意排成三行：
 *   第 1 行 5 + 4 + 3（金幣／天賦／成就：有數值、會變動的優先）
 *   第 2 行 3 + 3 + 3 + 3（收藏與資料）
 *   第 3 行 4 + 4 + 2 + 2（紀錄與工具，跨度收窄收尾）
 * 三行都是 12 欄，但每行內部的切割不同，視線不會一路平滑到底。
 */
export const HOME_ENTRY_SCENES = [
  'shop',
  'talentTree',
  'achievements',
  'encyclopedia',
  'skins',
  'workshop',
  'statistics',
  'replay',
  'tutorial',
  'changelog',
  'settings',
] as const;

export type HomeEntryScene = (typeof HOME_ENTRY_SCENES)[number];

/** 每個入口在 12 欄網格上的跨欄數（總和 36 = 3 行 × 12 欄） */
export const HOME_ENTRY_SPAN: Record<HomeEntryScene, HomeEntrySpan> = {
  shop: 5,
  talentTree: 4,
  achievements: 3,
  encyclopedia: 3,
  skins: 3,
  workshop: 3,
  statistics: 3,
  replay: 4,
  tutorial: 4,
  changelog: 2,
  settings: 2,
};

export function homeEntrySize(scene: HomeEntryScene): HomeEntrySize {
  return HOME_ENTRY_SPAN[scene] >= 4 ? 'tile' : 'compact';
}
