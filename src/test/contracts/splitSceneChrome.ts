/**
 * Split 場景（選圖／商店／設定／圖鑑）共用北歐殼的 class token（**測試專用**，TD-11）
 *
 * 原本住在 `src/data/splitSceneChrome.ts`，但正式碼一個都沒用：
 * 三條 class 字串在 `src/**` 只出現在這裡與 `designTokens.test.ts`。
 * 也就是說它一直是「測試拿來當 HARDLINE 契約樣本」的 fixture，不是產品資料，
 * 放在 `src/data/` 會讓人以為場景外殼吃這幾個常數（實際各場景自己寫 class）。
 */
export const SPLIT_SIDEBAR_CLASS =
  'w-full md:w-[240px] shrink-0 flex flex-col overflow-hidden rounded-[10px] border border-[#3d4a5c] bg-[#1c2430]';

export const SPLIT_MAIN_CLASS =
  'flex-1 min-w-0 flex flex-col overflow-hidden rounded-[10px] border border-[#3d4a5c] bg-[#1c2430]';

export const SPLIT_TABS_CLASS =
  'rounded-[10px] border border-[#3d4a5c] bg-[#273140] p-1';
