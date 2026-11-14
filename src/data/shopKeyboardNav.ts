import type { ShopSelection } from '@/components/scenes/shop/shopData';

function sameSelection(a: ShopSelection, b: ShopSelection): boolean {
  return a.kind === b.kind && a.id === b.id;
}

/** 商店方向鍵：在目前分頁／篩選清單裡循環切換商品。 */
export function nextShopSelection(
  items: ShopSelection[],
  current: ShopSelection | null,
  direction: 1 | -1,
): ShopSelection | null {
  if (items.length === 0) return null;
  if (!current) return items[0];
  const index = items.findIndex((item) => sameSelection(item, current));
  if (index < 0) return items[0];
  const next = (index + direction + items.length) % items.length;
  return items[next];
}

type ShopHotkeyAction = 'ignore' | 'prev' | 'next' | 'activate';
type ShopPurchaseKeyAction = 'ignore' | 'start_confirm' | 'purchase';

export function isShopTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

export function resolveShopHotkey(input: {
  key: string;
  inTextField: boolean;
}): ShopHotkeyAction {
  if (input.inTextField) return 'ignore';
  if (input.key === 'ArrowLeft') return 'prev';
  if (input.key === 'ArrowRight') return 'next';
  if (input.key === 'Enter') return 'activate';
  return 'ignore';
}

/** 詳情欄 Enter：未解鎖且付得起時先確認，免費或已在確認中則直接買。 */
export function resolveShopPurchaseKey(input: {
  key: string;
  inTextField: boolean;
  unlocked: boolean;
  canAfford: boolean;
  free: boolean;
  confirming: boolean;
}): ShopPurchaseKeyAction {
  if (input.key !== 'Enter' || input.inTextField) return 'ignore';
  if (input.unlocked) return 'ignore';
  if (!input.canAfford && !input.free) return 'ignore';
  if (input.free || input.confirming) return 'purchase';
  return 'start_confirm';
}
