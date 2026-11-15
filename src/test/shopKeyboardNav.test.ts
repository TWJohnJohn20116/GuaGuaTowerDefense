import { describe, expect, it } from 'vitest';
import {
  nextShopSelection,
  resolveShopHotkey,
  resolveShopPurchaseKey,
} from '@/data/shopKeyboardNav';
import { zhTW } from '@/i18n/locales/zh-TW';
import type { ShopSelection } from '@/components/scenes/shop/shopData';

const towers: ShopSelection[] = [
  { kind: 'tower', id: 'basic' },
  { kind: 'tower', id: 'sniper' },
  { kind: 'tower', id: 'cannon' },
];

describe('shop keyboard navigation', () => {
  it('moves to the next and previous product and wraps', () => {
    expect(nextShopSelection(towers, { kind: 'tower', id: 'basic' }, 1)).toEqual({ kind: 'tower', id: 'sniper' });
    expect(nextShopSelection(towers, { kind: 'tower', id: 'cannon' }, 1)).toEqual({ kind: 'tower', id: 'basic' });
    expect(nextShopSelection(towers, { kind: 'tower', id: 'basic' }, -1)).toEqual({ kind: 'tower', id: 'cannon' });
  });

  it('falls back to the first product when nothing is selected', () => {
    expect(nextShopSelection(towers, null, 1)).toEqual({ kind: 'tower', id: 'basic' });
    expect(nextShopSelection([], { kind: 'tower', id: 'basic' }, 1)).toBeNull();
  });

  it('treats Enter as purchase/confirm and ignores typing', () => {
    expect(resolveShopHotkey({ key: 'Enter', inTextField: false })).toBe('activate');
    expect(resolveShopHotkey({ key: 'ArrowLeft', inTextField: false })).toBe('prev');
    expect(resolveShopHotkey({ key: 'Enter', inTextField: true })).toBe('ignore');
    expect(resolveShopPurchaseKey({
      key: 'Enter', inTextField: false, unlocked: false, canAfford: true, free: false, confirming: false,
    })).toBe('start_confirm');
    expect(resolveShopPurchaseKey({
      key: 'Enter', inTextField: false, unlocked: false, canAfford: true, free: false, confirming: true,
    })).toBe('purchase');
    expect(resolveShopPurchaseKey({
      key: 'Enter', inTextField: false, unlocked: false, canAfford: true, free: true, confirming: false,
    })).toBe('purchase');
    expect(resolveShopPurchaseKey({
      key: 'Enter', inTextField: false, unlocked: false, canAfford: false, free: false, confirming: false,
    })).toBe('ignore');
  });

  it('drops the English subtitle in shop copy', () => {
    expect(zhTW.shop.subtitle).not.toMatch(/TOWER SHOP/i);
    expect(zhTW.shop.subtitle).toMatch(/塔|技能/);
    expect(zhTW.shop.toolbar.buyProduct).toMatch(/購買|確認/);
  });
});
