import { describe, it, expect } from 'vitest';
import {
  applyFrostSilenceToJammer,
  collectJammerAuras,
  getTowerJamFireRateMult,
  isJammerSuppressed,
  isTowerJammed,
  JAMMER_SILENCE_DURATION,
  listJammedTowerIds,
} from '@/data/jammerAura';
import { ENEMY_DATA } from '@/data/gameData';

const JAMMER = {
  ability: 'jam',
  jamRadius: 120,
  jamFireRateMult: 0.55,
} as const;

describe('jammer aura', () => {
  it('does not change fire rate when no jammer is nearby', () => {
    const auras = collectJammerAuras(
      [{ type: 'normal', x: 2, y: 2, health: 80 }],
      { normal: { ability: undefined } },
    );
    expect(auras).toHaveLength(0);
    expect(getTowerJamFireRateMult(5, 5, auras)).toBe(1);
    expect(isTowerJammed(5, 5, auras)).toBe(false);
  });

  it('slows a tower inside the jam radius', () => {
    const auras = collectJammerAuras(
      [{ type: 'jammer', x: 5, y: 5, health: 100 }],
      { jammer: JAMMER },
    );
    expect(auras).toHaveLength(1);
    expect(getTowerJamFireRateMult(5, 5, auras)).toBe(0.55);
    expect(getTowerJamFireRateMult(6.5, 5, auras)).toBe(0.55);
    expect(isTowerJammed(5, 5, auras)).toBe(true);
  });

  it('does not slow a tower outside the jam radius', () => {
    const auras = collectJammerAuras(
      [{ type: 'jammer', x: 5, y: 5, health: 100 }],
      { jammer: JAMMER },
    );
    expect(getTowerJamFireRateMult(9, 5, auras)).toBe(1);
    expect(isTowerJammed(9, 5, auras)).toBe(false);
  });

  it('uses the strongest jammer when auras overlap', () => {
    const auras = collectJammerAuras(
      [
        { type: 'jammer', x: 5, y: 5, health: 100 },
        { type: 'jammer2', x: 5.2, y: 5, health: 80 },
      ],
      {
        jammer: JAMMER,
        jammer2: { ability: 'jam', jamRadius: 120, jamFireRateMult: 0.4 },
      },
    );
    expect(getTowerJamFireRateMult(5, 5, auras)).toBe(0.4);
  });

  it('ignores dead jammers', () => {
    const auras = collectJammerAuras(
      [{ type: 'jammer', x: 5, y: 5, health: 0 }],
      { jammer: JAMMER },
    );
    expect(auras).toHaveLength(0);
  });

  it('defines jammer enemy data with a jam aura', () => {
    expect(ENEMY_DATA.jammer).toBeDefined();
    expect(ENEMY_DATA.jammer.ability).toBe('jam');
    expect(ENEMY_DATA.jammer.jamRadius).toBeGreaterThan(0);
    expect(ENEMY_DATA.jammer.jamFireRateMult).toBeGreaterThan(0);
    expect(ENEMY_DATA.jammer.jamFireRateMult).toBeLessThan(1);
  });

  it('lists only towers standing inside a jammer aura', () => {
    const auras = collectJammerAuras(
      [{ type: 'jammer', x: 5, y: 5, health: 100 }],
      { jammer: JAMMER },
    );
    expect(listJammedTowerIds(
      [
        { id: 'in', col: 5, row: 5 },
        { id: 'out', col: 12, row: 5 },
      ],
      auras,
    )).toEqual(['in']);
  });

  it('stops jamming while freeze, stun, petrify or silence is active', () => {
    const now = 10_000;
    for (const type of ['freeze', 'stun', 'petrify', 'silence'] as const) {
      const auras = collectJammerAuras(
        [{
          type: 'jammer',
          x: 5,
          y: 5,
          health: 100,
          effects: [{ type, duration: 2000, startTime: 9000 }],
        }],
        { jammer: JAMMER },
        now,
      );
      expect(auras, type).toHaveLength(0);
      expect(isJammerSuppressed({
        type: 'jammer',
        x: 5,
        y: 5,
        health: 100,
        effects: [{ type, duration: 2000, startTime: 9000 }],
      }, now)).toBe(true);
    }
  });

  it('resumes jamming after control expires and ignores root', () => {
    const now = 12_000;
    const expired = collectJammerAuras(
      [{
        type: 'jammer',
        x: 5,
        y: 5,
        health: 100,
        effects: [{ type: 'freeze', duration: 2000, startTime: 9000 }],
      }],
      { jammer: JAMMER },
      now,
    );
    expect(expired).toHaveLength(1);

    const rooted = collectJammerAuras(
      [{
        type: 'jammer',
        x: 5,
        y: 5,
        health: 100,
        effects: [{ type: 'root', duration: 2000, startTime: 11000 }],
      }],
      { jammer: JAMMER },
      now,
    );
    expect(rooted).toHaveLength(1);
    expect(isJammerSuppressed({
      type: 'jammer',
      x: 5,
      y: 5,
      health: 100,
      effects: [{ type: 'root', duration: 2000, startTime: 11000 }],
    }, now)).toBe(false);
  });

  it('lets frost shots silence a jammer without stacking duplicate silence', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applyFrostSilenceToJammer(effects, 'frost', 'jam', now);
    applyFrostSilenceToJammer(effects, 'sniper', 'jam', now);
    applyFrostSilenceToJammer(effects, 'frost', 'healing', now);
    expect(effects).toEqual([{
      type: 'silence',
      duration: JAMMER_SILENCE_DURATION,
      startTime: now,
    }]);
    applyFrostSilenceToJammer(effects, 'frost', 'jam', now + 200);
    expect(effects).toHaveLength(1);
    expect(effects[0].startTime).toBe(now + 200);
  });
});
