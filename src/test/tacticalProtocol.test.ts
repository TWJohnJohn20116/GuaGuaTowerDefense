/**
 * 波間戰術協議：何時出現、三選一抽選、數值效果
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  shouldOfferProtocol,
  pickProtocolOffers,
  getProtocolWaveMods,
  applyInstantGrant,
  pickProtocolForStrategy,
  getDiscountedTowerCost,
} from '@/data/tacticalProtocolData';

describe('shouldOfferProtocol', () => {
  it('skips the first wave and tutorial', () => {
    expect(shouldOfferProtocol(0, false)).toBe(false);
    expect(shouldOfferProtocol(1, true)).toBe(false);
  });

  it('offers after odd completed waves (before 2, 4, 6...)', () => {
    expect(shouldOfferProtocol(1, false)).toBe(true);
    expect(shouldOfferProtocol(2, false)).toBe(false);
    expect(shouldOfferProtocol(3, false)).toBe(true);
    expect(shouldOfferProtocol(15, false)).toBe(true);
  });

  it('does not offer after the final wave of a limited match', () => {
    expect(shouldOfferProtocol(15, false, { maxWaves: 15, endlessMode: false })).toBe(false);
    expect(shouldOfferProtocol(15, false, { maxWaves: 0, endlessMode: true })).toBe(true);
  });
});

describe('pickProtocolOffers', () => {
  it('returns three unique protocols', () => {
    const offers = pickProtocolOffers(1, 'straight', []);
    expect(offers).toHaveLength(3);
    const ids = offers.map((p) => p.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('is deterministic for the same seed', () => {
    const a = pickProtocolOffers(4, 'ring', ['overclock']).map((p) => p.id);
    const b = pickProtocolOffers(4, 'ring', ['overclock']).map((p) => p.id);
    expect(a).toEqual(b);
  });

  it('avoids recently used ids when the pool allows', () => {
    const recent = TACTICAL_PROTOCOLS.slice(0, 6).map((p) => p.id);
    const offers = pickProtocolOffers(7, 'spiral', recent);
    const overlap = offers.filter((p) => recent.includes(p.id));
    expect(overlap.length).toBeLessThan(3);
  });
});

describe('getProtocolWaveMods', () => {
  it('returns identity mods when no protocol is active', () => {
    const mods = getProtocolWaveMods(null);
    expect(mods.fireRateMult).toBe(1);
    expect(mods.rangeMult).toBe(1);
    expect(mods.critChanceAdd).toBe(0);
    expect(mods.enemyRewardMult).toBe(1);
    expect(mods.enemySlow).toBe(0);
    expect(mods.revealStealth).toBe(false);
    expect(mods.enemyHealthMult).toBe(1);
    expect(mods.leakDamageMult).toBe(1);
    expect(mods.waveClearBonus).toBe(0);
  });

  it('applies overclock as a fire-rate multiplier', () => {
    const proto = TACTICAL_PROTOCOLS.find((p) => p.id === 'overclock');
    expect(proto).toBeDefined();
    const mods = getProtocolWaveMods(proto!);
    expect(mods.fireRateMult).toBeGreaterThan(1);
  });

  it('applies recon flare as stealth reveal', () => {
    const proto = TACTICAL_PROTOCOLS.find((p) => p.id === 'recon_flare');
    expect(getProtocolWaveMods(proto!).revealStealth).toBe(true);
  });

  it('applies weakness scan as enemy health reduction', () => {
    const proto = TACTICAL_PROTOCOLS.find((p) => p.id === 'weakness_scan');
    expect(proto).toBeDefined();
    const mods = getProtocolWaveMods(proto!);
    expect(mods.enemyHealthMult).toBeLessThan(1);
    expect(mods.enemyHealthMult).toBeGreaterThan(0.5);
  });

  it('applies aegis line as leak damage reduction', () => {
    const proto = TACTICAL_PROTOCOLS.find((p) => p.id === 'aegis_line');
    expect(getProtocolWaveMods(proto!).leakDamageMult).toBe(0.5);
  });

  it('applies salvage rights as wave-clear bonus gold', () => {
    const proto = TACTICAL_PROTOCOLS.find((p) => p.id === 'salvage_rights');
    expect(getProtocolWaveMods(proto!).waveClearBonus).toBeGreaterThan(0);
  });
});

describe('applyInstantGrant', () => {
  it('grants money for supply drop', () => {
    const proto = TACTICAL_PROTOCOLS.find((p) => p.id === 'supply_drop')!;
    const grant = applyInstantGrant(proto);
    expect(grant.money).toBeGreaterThan(0);
    expect(grant.health).toBe(0);
    expect(grant.nextTowerDiscount).toBe(0);
  });

  it('sets a one-shot tower discount for rush permit', () => {
    const proto = TACTICAL_PROTOCOLS.find((p) => p.id === 'rush_permit')!;
    const grant = applyInstantGrant(proto);
    expect(grant.nextTowerDiscount).toBeGreaterThan(0);
    expect(grant.nextTowerDiscount).toBeLessThan(1);
  });
});

describe('getDiscountedTowerCost', () => {
  it('reduces cost and never drops below 1', () => {
    expect(getDiscountedTowerCost(200, 0.45)).toBe(110);
    expect(getDiscountedTowerCost(1, 0.9)).toBe(1);
    expect(getDiscountedTowerCost(100, 0)).toBe(100);
  });
});

describe('pickProtocolForStrategy', () => {
  const offers = [
    TACTICAL_PROTOCOLS.find((p) => p.id === 'frost_line')!,
    TACTICAL_PROTOCOLS.find((p) => p.id === 'overclock')!,
    TACTICAL_PROTOCOLS.find((p) => p.id === 'bounty')!,
  ];

  it('picks bounty for economy and overclock for aggressive', () => {
    expect(pickProtocolForStrategy(offers, 'economy').id).toBe('bounty');
    expect(pickProtocolForStrategy(offers, 'aggressive').id).toBe('overclock');
    expect(pickProtocolForStrategy(offers, 'defensive').id).toBe('frost_line');
  });
});
