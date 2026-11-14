import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  formatBatchSellName,
  getPendingSellIds,
  requestBatchSell,
  summarizeBatchSell,
} from '@/store/sellConfirm';
import { useSellConfirmStore } from '@/store/sellConfirmStore';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('batch sell confirmation', () => {
  beforeEach(() => {
    useSellConfirmStore.getState().closeSellConfirm();
  });

  it('names a single sellable tower by its own name, and many by count + unit', () => {
    expect(formatBatchSellName([{ name: '基礎塔' }], '個塔')).toBe('基礎塔');
    expect(formatBatchSellName([{ name: 'A' }, { name: 'B' }], '個塔')).toBe('2 個塔');
  });

  it('excludes locked towers from refund and ids', () => {
    expect(summarizeBatchSell([
      { id: 'lock', name: '鎖定塔', cost: 200, locked: true },
      { id: 'ok', name: '基礎塔', cost: 100 },
    ], '個塔')).toEqual({
      towerIds: ['ok'],
      name: '基礎塔',
      refund: 50,
    });
  });

  it('sells the batch immediately when confirmation is off', () => {
    expect(requestBatchSell({
      towers: [
        { id: 'a', name: '基礎塔', cost: 100 },
        { id: 'b', name: '狙擊塔', cost: 150 },
      ],
      confirmSell: false,
      unitLabel: '個塔',
    })).toBe('sell_now');
    expect(useSellConfirmStore.getState().pending).toBeNull();
  });

  it('opens the same in-game prompt for a batch instead of selling immediately', () => {
    expect(requestBatchSell({
      towers: [
        { id: 'a', name: '基礎塔', cost: 100 },
        { id: 'b', name: '狙擊塔', cost: 150 },
      ],
      confirmSell: true,
      unitLabel: '個塔',
    })).toBe('prompt');
    expect(useSellConfirmStore.getState().pending).toEqual({
      towerIds: ['a', 'b'],
      name: '2 個塔',
      refund: 125,
    });
    expect(getPendingSellIds(useSellConfirmStore.getState().pending!)).toEqual(['a', 'b']);
  });

  it('blocks when selling is disabled or nothing is sellable', () => {
    expect(requestBatchSell({
      towers: [{ id: 'a', name: '基礎塔', cost: 100, locked: true }],
      confirmSell: false,
      unitLabel: '個塔',
    })).toBe('blocked');
    expect(requestBatchSell({
      towers: [{ id: 'a', name: '基礎塔', cost: 100 }],
      confirmSell: false,
      sellingDisabled: true,
      unitLabel: '個塔',
    })).toBe('blocked');
    expect(useSellConfirmStore.getState().pending).toBeNull();
  });

  it('does not use window.confirm on the multi-select panel', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/game/MultiSelectPanel.tsx'),
      'utf8',
    );
    expect(src).toMatch(/requestBatchSell/);
    expect(src).not.toMatch(/\bconfirm\(/);
    expect(zhTW.towers.sellConfirmHintBatch).toMatch(/這些塔/);
  });
});
