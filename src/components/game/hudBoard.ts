/**
 * 戰鬥 HUD 語彙（無卡片 · 與遊戲同一個世界）
 *
 * 規則：
 *   1. HUD 面板沒有底色、沒有邊框、沒有投影 —— 數字與標籤直接疊在戰場上。
 *   2. 可讀性靠「紙色描邊」（.hud-ink）與墨色字階，不靠白卡。
 *   3. 只有真的需要浮起來的東西（彈窗、tooltip、hover／選中的塔格）才用 BD_SHEET。
 *   4. 顏色全部走 --bd-*（＝--cn-* 別名），切換 12 套主題時同步換色。
 */

/** HUD 面板：透明容器，只負責圓角裁切與排布 */
export const BD_PANEL = 'rounded-[var(--cn-r-md)]';

/** 凹槽：同樣透明，僅保留圓角（舊版是奶油底） */
export const BD_SUNKEN = 'rounded-[var(--cn-r-sm)]';

/** 格線：面板內相鄰區塊的細分隔線，最後一格不留 */
export const BD_CELL = 'border-r border-[var(--cn-line-soft)] last:border-r-0';

/** 標籤：小字、大寫、等寬、寬字距；描邊讓它壓在格子上也讀得清 */
export const BD_LABEL =
  'hud-ink font-mono text-[9.5px] font-extrabold uppercase leading-none tracking-[0.1em] text-[var(--bd-ink-3)]';

/** 數值：粗等寬、tabular，同樣帶紙色描邊 */
export const BD_NUM =
  'hud-ink font-mono font-extrabold tabular-nums leading-none text-[var(--bd-ink)]';

/** 柔和底：少數需要一點底色的地方（例如進度條軌道） */
export const BD_CHECKER = 'bg-[color-mix(in_oklab,var(--cn-line-soft)_55%,transparent)]';

/** 浮層紙卡：彈窗、tooltip、就地彈出的塔面板（這些必須有底） */
export const BD_SHEET =
  'rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_8px_0_-2px_rgba(46,36,64,0.35)]';
