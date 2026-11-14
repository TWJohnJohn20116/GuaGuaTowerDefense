import { useSellConfirmStore, type PendingSell } from '@/store/sellConfirmStore';

type SellIntent = 'blocked' | 'sell_now' | 'prompt';

interface ResolveSellIntentInput {
  confirmSell: boolean;
  locked?: boolean;
}

interface RequestSellTowerInput extends ResolveSellIntentInput {
  towerId: string;
  name: string;
  cost: number;
}

interface BatchSellTowerInput {
  id: string;
  name: string;
  cost: number;
  locked?: boolean;
}

interface BatchSellSummary {
  towerIds: string[];
  name: string;
  refund: number;
}

interface RequestBatchSellInput {
  towers: BatchSellTowerInput[];
  confirmSell: boolean;
  unitLabel: string;
}

export function getTowerSellRefund(cost: number): number {
  return Math.floor(cost * 0.5);
}

export function resolveSellIntent(input: ResolveSellIntentInput): SellIntent {
  if (input.locked) return 'blocked';
  return input.confirmSell ? 'prompt' : 'sell_now';
}

export function getPendingSellIds(pending: PendingSell): string[] {
  if (pending.towerIds && pending.towerIds.length > 0) return pending.towerIds;
  return pending.towerId ? [pending.towerId] : [];
}

export function formatBatchSellName(towers: { name: string }[], unitLabel: string): string {
  if (towers.length === 1) return towers[0].name;
  return `${towers.length} ${unitLabel}`;
}

export function summarizeBatchSell(towers: BatchSellTowerInput[], unitLabel: string): BatchSellSummary {
  const sellable = towers.filter((tower) => !tower.locked);
  return {
    towerIds: sellable.map((tower) => tower.id),
    name: formatBatchSellName(sellable, unitLabel),
    refund: sellable.reduce((sum, tower) => sum + getTowerSellRefund(tower.cost), 0),
  };
}

/** 面板與快捷鍵共用：需要確認時打開遊戲內彈窗，不再用瀏覽器 confirm */
export function requestSellTower(input: RequestSellTowerInput): SellIntent {
  const intent = resolveSellIntent(input);
  if (intent === 'prompt') {
    useSellConfirmStore.getState().openSellConfirm({
      towerId: input.towerId,
      name: input.name,
      refund: getTowerSellRefund(input.cost),
    });
  }
  return intent;
}

/** 多選出售：與單塔同一套確認彈窗與「確認出售」設定 */
export function requestBatchSell(input: RequestBatchSellInput): SellIntent {
  const summary = summarizeBatchSell(input.towers, input.unitLabel);
  if (summary.towerIds.length === 0) return 'blocked';
  if (!input.confirmSell) return 'sell_now';
  useSellConfirmStore.getState().openSellConfirm({
    towerIds: summary.towerIds,
    name: summary.name,
    refund: summary.refund,
  });
  return 'prompt';
}
