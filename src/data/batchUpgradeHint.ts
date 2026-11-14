export type BatchUpgradeHint = 'ready' | 'none' | 'short';

/** 多選升級：沒有可升的塔、或錢不夠時給出原因。 */
export function resolveBatchUpgradeHint(input: {
  upgradableCount: number;
  totalCost: number;
  money: number;
}): BatchUpgradeHint {
  if (input.upgradableCount <= 0) return 'none';
  if (input.money < input.totalCost) return 'short';
  return 'ready';
}
