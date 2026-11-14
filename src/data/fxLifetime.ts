/**
 * 特效動畫生命週期（純函式）
 *
 * 為什麼要有這一層：
 * 升級／出售／融合三種塔位特效的「還活著嗎」，原本散在
 * `components/scenes/game-scene/GameCanvas.tsx`（三個函式內常數 1500/600/1400，
 * 判斷式是 `Date.now() - startTime < D`）與 `three/effects3d.ts`
 * （`UPGRADE_FX_DURATION` / `SELL_FX_DURATION`，判斷式是進度夾制後的 `>= 1`）。
 * 同一個語意寫了兩份，時長一改就要同步兩處；更麻煩的是邊界靠 `<=` 還是 `<` 決定，
 * 「剛好等於時長算不算結束」只能靠讀那兩段程式碼推測。
 * 這裡收斂成唯一一份：時長集中、過期條件唯一、三種動畫共用同一個清理器。
 *
 * 為什麼「沒有項目過期就回傳原陣列」是重點（而不是每次回新陣列）：
 * 清理會在每幀路徑被呼叫。如果每次都回新陣列，呼叫端的 `prev === next` 永遠不成立，
 * 就會每幀 setState → 每幀寫 store → 每幀重繪，特效存活期間的整個幀率都陪葬。
 * 回傳同一參照讓呼叫端能用 `===` 判斷「這一幀完全不用動」。
 *
 * 純度約定：
 *  - 不 import store / React / services；只 import 同層 data 純函式（`fxProgress`）
 *  - 不讀 `Date.now()`：`now` 由呼叫端注入，測試才能把時間固定在邊界上
 *  - 不改動輸入陣列；需要回傳新陣列時，內容是複本
 */

import { fxProgress } from '@/data/fxProgress';

/**
 * 三種塔位特效的存活時長（毫秒）。
 *
 * 數值以 2D `GameCanvas` 的實作為準（升級 1500 / 出售 600 / 融合 1400），
 * 3D 的 `effects3d.ts` 本來就跟著同一組值；集中在這裡之後，改一次兩邊都對。
 */
export const FX_DURATIONS = {
  /** 升級：金光環 + 等級數字上浮 */
  upgrade: 1500,
  /** 出售：塔身淡出 + 退款飄字 */
  sell: 600,
  /** 融合：雙色匯聚 + 新塔彈出 */
  fusion: 1400,
} as const;

/**
 * 單一項目的過期判斷（模組私有，避免多一個零引用 export）。
 *
 * 刻意重用 `fxProgress`：它把進度夾在 0~1，所以 `>= 1` 就等於
 * `now - startTime >= duration`，不必在這裡再寫一次時間比較。
 * 順帶處理了 `duration <= 0`（`fxProgress` 直接回 1 → 視為已過期），
 * 免得出現「時長 0 的動畫永遠不消失」這種幽靈特效。
 */
const isFxExpired = (startTime: number, duration: number, now: number): boolean =>
  fxProgress(startTime, duration, now) >= 1;

/**
 * 泛型清理：回傳只含存活項目的陣列，順序保持原樣。
 *
 * @param items     來源陣列（不修改）
 * @param isExpired 回傳 true 代表該項目已過期、應被丟掉
 * @returns 沒有任何項目過期時，回傳 `items` 本身（同一參照）；
 *          否則回傳只含存活項目的新陣列
 */
export function pruneExpired<T>(items: readonly T[], isExpired: (item: T) => boolean): T[] {
  // 延遲配置：全部存活時（最常見的情況）連一次複製都不做。
  // 真的遇到第一個過期項目，才把「它之前的存活項」用 slice 複製出來
  // （`readonly T[]` 的 slice 已經回傳可變的 `T[]`，不需要額外斷言）。
  let survivors: T[] | null = null;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];

    if (!isExpired(item)) {
      if (survivors !== null) survivors.push(item);
      continue;
    }

    if (survivors === null) survivors = items.slice(0, i);
  }

  // 沒有任何項目過期 → 原參照回傳，呼叫端可用 `===` 省掉一次 setState
  if (survivors === null) return items as T[];

  return survivors;
}

/**
 * 升級動畫清理：存活 1500ms。
 *
 * 只約束 `{ startTime }`，所以 store 的完整欄位型別、3D 層的局部型別
 * 與測試的最小 fixture 都能直接餵進來，不需要為了呼叫這支函式先轉型。
 */
export const pruneUpgradeAnimations = <T extends { startTime: number }>(
  items: readonly T[],
  now: number,
): T[] =>
  pruneExpired(items, (item) => isFxExpired(item.startTime, FX_DURATIONS.upgrade, now));

/** 出售動畫清理：存活 600ms（最短，退款飄字一晃就過）。 */
export const pruneSellAnimations = <T extends { startTime: number }>(
  items: readonly T[],
  now: number,
): T[] =>
  pruneExpired(items, (item) => isFxExpired(item.startTime, FX_DURATIONS.sell, now));

/** 融合動畫清理：存活 1400ms（雙色匯聚比升級短，收尾更快）。 */
export const pruneFusionAnimations = <T extends { startTime: number }>(
  items: readonly T[],
  now: number,
): T[] =>
  pruneExpired(items, (item) => isFxExpired(item.startTime, FX_DURATIONS.fusion, now));
