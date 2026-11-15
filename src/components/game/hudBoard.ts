/**
 * 棋盤 HUD 語彙（BOARD HUD）
 *
 * 戰鬥畫面的面板不是「貼在遊戲上的紙卡」，而是棋盤的一部分：
 *   底＝空地格（--bd-tile）、次級面＝道路（--bd-tile-2）、
 *   線＝道路接縫（--bd-line 由 --bd-edge 派生）、強調＝路徑導引線（--bd-accent）。
 *
 * 形狀規則（與 drawGrid 的格子對齊，不要改）：
 *   1. 圓角 2–3px：格子是 roundRect(2)，面板最多 3px。
 *   2. 線 1px：格子之間是 1.5px 縫，面板內部用 1px 格線分區。
 *   3. 深度只有 `0 2px 0 var(--bd-edge)` 一種硬投影，沒有柔霧、沒有發光。
 *   4. 數值一律等寬（BD_NUM），標籤一律小幅大寫等寬（BD_LABEL）。
 */

/** 面板：與戰場空地格同底色 */
export const BD_PANEL =
  'relative rounded-[3px] border border-[var(--bd-line)] bg-[var(--bd-tile)] shadow-[0_2px_0_var(--bd-edge)]';

/** 表頭／凹槽：與戰場底同色，用來把面板切出區塊，不加投影 */
export const BD_SUNKEN =
  'rounded-[2px] border border-[var(--bd-line-soft)] bg-[var(--bd-floor)]';

/** 格線：面板內相鄰區塊的分隔，最後一格不留線 */
export const BD_CELL = 'border-r border-[var(--bd-line)] last:border-r-0';

/** 標籤：小字、大寫、等寬、寬字距 */
export const BD_LABEL =
  'font-mono text-[9.5px] font-medium uppercase leading-none tracking-[0.12em] text-[var(--bd-ink-3)]';

/** 數值：粗等寬、tabular，避免跳動 */
export const BD_NUM = 'font-mono font-semibold tabular-nums leading-none text-[var(--bd-ink)]';

/** 棋盤底紋：8px 交錯格，只用在表頭與空狀態，不鋪滿整片（class 定義在 index.css） */
export const BD_CHECKER = 'bd-checker';
