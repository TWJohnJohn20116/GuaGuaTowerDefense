/**
 * 金錢塔金庫光環：光環內擊殺額外賞金
 */

import { describe, it, expect } from 'vitest';
import {
  collectMoneyAuras,
  getKillBountyBonus,
  getMoneyAuraRange,
  MONEY_AURA_BASE_RANGE,
  MONEY_KILL_BONUS_MULT,
} from '@/data/moneyAura';

function moneyTower(col: number, row: number, level = 1) {
  return { type: 'money' as const, pos: { x: col, y: row }, level };
}

describe('money vault aura', () => {
  it('does not pay bounty when no money tower covers the kill', () => {
    expect(collectMoneyAuras([])).toHaveLength(0);
    expect(getKillBountyBonus(5, 5, 40, [])).toBe(0);

    const auras = collectMoneyAuras([
      { type: 'basic', pos: { x: 5, y: 5 }, level: 1 },
    ]);
    expect(auras).toHaveLength(0);
    expect(getKillBountyBonus(5, 5, 40, auras)).toBe(0);
  });

  it('pays extra gold for kills inside the vault radius', () => {
    const auras = collectMoneyAuras([moneyTower(5, 5)]);
    expect(auras).toHaveLength(1);
    expect(getMoneyAuraRange(1)).toBe(MONEY_AURA_BASE_RANGE);
    expect(MONEY_KILL_BONUS_MULT).toBeGreaterThan(0);

    const onVault = getKillBountyBonus(5, 5, 40, auras);
    expect(onVault).toBe(Math.max(1, Math.round(40 * MONEY_KILL_BONUS_MULT)));
    expect(getKillBountyBonus(5 + MONEY_AURA_BASE_RANGE, 5, 40, auras)).toBe(onVault);
  });

  it('does not pay bounty outside the vault radius', () => {
    const auras = collectMoneyAuras([moneyTower(5, 5)]);
    expect(getKillBountyBonus(5 + MONEY_AURA_BASE_RANGE + 0.2, 5, 40, auras)).toBe(0);
  });

  it('does not stack overlapping vaults', () => {
    const auras = collectMoneyAuras([moneyTower(5, 5), moneyTower(5.4, 5)]);
    expect(auras.length).toBe(2);
    expect(getKillBountyBonus(5, 5, 40, auras)).toBe(Math.max(1, Math.round(40 * MONEY_KILL_BONUS_MULT)));
  });

  it('widens the aura when the vault is upgraded', () => {
    expect(getMoneyAuraRange(3)).toBeGreaterThan(getMoneyAuraRange(1));
    const auras = collectMoneyAuras([moneyTower(5, 5, 3)]);
    expect(getKillBountyBonus(5 + getMoneyAuraRange(3), 5, 20, auras)).toBeGreaterThan(0);
    expect(getKillBountyBonus(5 + getMoneyAuraRange(3) + 0.3, 5, 20, auras)).toBe(0);
  });
});
