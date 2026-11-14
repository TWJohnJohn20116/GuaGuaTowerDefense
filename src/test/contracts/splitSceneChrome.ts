/**
 * Split 場景（選圖／商店／設定／圖鑑）共用殼的 class token（**測試專用**，TD-11）
 *
 * 原本住在 `src/data/splitSceneChrome.ts`，但正式碼一個都沒用：
 * 三條 class 字串在 `src/**` 只出現在這裡與 `designTokens.test.ts`。
 * 也就是說它一直是「測試拿來當設計語言契約樣本」的 fixture，不是產品資料。
 *
 * 2026-11-14 隨 ARCADE HUD 改版更新：小圓角、斜切感、arc token。
 */
export const SPLIT_SIDEBAR_CLASS =
  'w-full md:w-[240px] shrink-0 flex flex-col overflow-hidden rounded-[10px] border border-[var(--arc-line-strong)] bg-[var(--arc-deck-2)]';

export const SPLIT_MAIN_CLASS =
  'flex-1 min-w-0 flex flex-col overflow-hidden rounded-[10px] border border-[var(--arc-line-strong)] bg-[var(--arc-deck)]';

export const SPLIT_TABS_CLASS =
  'rounded-[10px] border border-[var(--arc-line-strong)] bg-[var(--arc-deck-3)] p-1';
