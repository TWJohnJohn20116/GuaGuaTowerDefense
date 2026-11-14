import { describe, expect, it, beforeEach } from 'vitest';
import { getTowerSellRefund, requestSellTower, resolveSellIntent } from '@/store/sellConfirm';
import { useSellConfirmStore } from '@/store/sellConfirmStore';

describe('sell confirmation', () => {
  beforeEach(() => {
    useSellConfirmStore.getState().closeSellConfirm();
  });

  it('sells immediately when confirmation is off', () => {
    expect(resolveSellIntent({ confirmSell: false })).toBe('sell_now');
    expect(requestSellTower({
      towerId: 't1',
      name: '基礎塔',
      cost: 100,
      confirmSell: false,
    })).toBe('sell_now');
    expect(useSellConfirmStore.getState().pending).toBeNull();
  });

  it('opens an in-game prompt instead of selling immediately', () => {
    expect(resolveSellIntent({ confirmSell: true })).toBe('prompt');
    expect(requestSellTower({
      towerId: 't1',
      name: '基礎塔',
      cost: 100,
      confirmSell: true,
    })).toBe('prompt');
    expect(useSellConfirmStore.getState().pending).toEqual({
      towerId: 't1',
      name: '基礎塔',
      refund: 50,
    });
  });

  it('blocks locked towers', () => {
    expect(resolveSellIntent({ confirmSell: true, locked: true })).toBe('blocked');
  });

  it('refunds half the tower cost, rounded down', () => {
    expect(getTowerSellRefund(100)).toBe(50);
    expect(getTowerSellRefund(150)).toBe(75);
    expect(getTowerSellRefund(175)).toBe(87);
  });
});
