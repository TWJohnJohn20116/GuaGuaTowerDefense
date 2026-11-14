/**
 * 建塔費用的唯一算式：UI（TowerButton）、手動放置（placeTower）、
 * 自動戰鬥（gameStoreAutoBattle）三處共用。
 *
 * 為什麼要抽出來：這三個地方原本各自 `Math.round(cost * mult)` 或直接寫 `cost`，
 * 於是自動戰鬥在 1.3 倍的章節關卡少付 23%（等於免費賺錢）、在 0.5 倍關卡多付一倍，
 * 難度 preset 的設計意圖整個失效（見 docs/research/2026-11-14-auto-battle-research.md B2）。
 *
 * 只處理塔的定價倍率 `towerCostMult`（難度 preset × 天賦 × 章節）。
 * 戰術協定的一次性優惠券（`protocolNextTowerDiscount`）不屬於塔的定價，
 * 由呼叫端拿到這個值之後再套 `getDiscountedTowerCost`。
 */
export function getTowerBuildCost(baseCost: number, towerCostMult: number = 1): number {
  const mult = Number.isFinite(towerCostMult) && towerCostMult > 0 ? towerCostMult : 1;
  const base = Number.isFinite(baseCost) && baseCost > 0 ? baseCost : 0;
  return Math.round(base * mult);
}
