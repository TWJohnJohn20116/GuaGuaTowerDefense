/**
 * 戰鬥 HUD 語彙（＝大廳 CANDY 語彙）
 *
 * 戰鬥畫面的面板與主選單、選圖、設定頁是同一套語言：
 *   面＝白卡、凹槽＝奶油紙、線＝3px 粗墨線、深度＝貼紙式硬投影（0 4px 0 墨色）。
 * 顏色一律走 --bd-*（別名指回 --cn-*），所以切換 12 套主題時 HUD 跟著換。
 *
 * 形狀規則（與 SceneShell 系列一致，不要自創）：
 *   1. 圓角 12–16px（--cn-r-sm / --cn-r-md），不用 2–3px 方角。
 *   2. 線 3px 墨色；面板內分區用淺墨線。
 *   3. 深度只有貼紙硬投影一種，沒有柔霧、沒有發光、沒有玻璃模糊。
 *   4. 數值等寬（BD_NUM），標籤小字大寫等寬（BD_LABEL）。
 */

/** 面板：白卡＋3px 墨線＋貼紙硬投影 */
export const BD_PANEL =
  'rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_4px_0_var(--cn-line)]';

/** 凹槽／表頭：奶油紙底＋淺墨線，不加投影 */
export const BD_SUNKEN =
  'rounded-[var(--cn-r-sm)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]';

/** 格線：面板內相鄰區塊的分隔（淺墨線），最後一格不留 */
export const BD_CELL = 'border-r-[3px] border-[var(--cn-line-soft)] last:border-r-0';

/** 標籤：小字、大寫、等寬、寬字距，墨色第三階 */
export const BD_LABEL =
  'font-mono text-[9.5px] font-extrabold uppercase leading-none tracking-[0.1em] text-[var(--bd-ink-3)]';

/** 數值：粗等寬、tabular，避免跳動 */
export const BD_NUM = 'font-mono font-extrabold tabular-nums leading-none text-[var(--bd-ink)]';

/** 柔和底：表頭與空狀態用，取代原本的棋盤底紋 */
export const BD_CHECKER = 'bg-[var(--cn-card-2)]';
