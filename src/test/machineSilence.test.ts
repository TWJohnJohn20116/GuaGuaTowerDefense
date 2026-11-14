/**
 * 機槍壓制射擊：命中附加沉默，關掉干擾／治療／護航光環
 */

import { describe, it, expect } from 'vitest';
import {
  applyMachineSilence,
  MACHINE_SILENCE_DURATION,
} from '@/data/combatStatus';
import { collectJammerAuras } from '@/data/jammerAura';
import { collectEscortAuras } from '@/data/escortAura';

const JAMMER = {
  ability: 'jam' as const,
  jamRadius: 120,
  jamFireRateMult: 0.55,
};

const ESCORT = {
  ability: 'escort' as const,
  escortRadius: 110,
  escortArmor: 6,
};

describe('machine suppressive fire', () => {
  it('lets machine shots apply silence and refresh the timer', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applyMachineSilence(effects, 'cannon', now);
    expect(effects).toEqual([]);

    applyMachineSilence(effects, 'machine', now);
    expect(effects).toEqual([{
      type: 'silence',
      duration: MACHINE_SILENCE_DURATION,
      startTime: now,
    }]);
    expect(MACHINE_SILENCE_DURATION).toBeGreaterThan(500);

    applyMachineSilence(effects, 'machine', now + 200);
    expect(effects).toHaveLength(1);
    expect(effects[0].startTime).toBe(now + 200);
  });

  it('shuts down jammer and escort auras while the silence lasts', () => {
    const now = 10_000;
    const silenced = [{ type: 'silence', duration: MACHINE_SILENCE_DURATION, startTime: 9500 }];
    expect(collectJammerAuras(
      [{ type: 'jammer', x: 5, y: 5, health: 100, effects: silenced }],
      { jammer: JAMMER },
      now,
    )).toEqual([]);
    expect(collectEscortAuras(
      [{ type: 'escort', x: 5, y: 5, health: 100, effects: silenced }],
      { escort: ESCORT },
      now,
    )).toEqual([]);
  });
});
