import { describe, it, expect } from 'vitest';
import { getTowerCombatIdentityPills } from '@/data/towerCombatIdentity';
import {
  BASIC_MARKED_DAMAGE_MULT,
  SNIPER_MARKED_DAMAGE_MULT,
  SHOTGUN_BLEEDING_DAMAGE_MULT,
  BALLISTA_ROOTED_DAMAGE_MULT,
  FROST_FROZEN_DAMAGE_MULT,
  LASER_EXPOSED_DAMAGE_MULT,
  LIGHTNING_WEAKENED_DAMAGE_MULT,
  CANNON_STUNNED_DAMAGE_MULT,
  PULSE_EXPOSED_DAMAGE_MULT,
  WIND_FEARED_DAMAGE_MULT,
  FLAME_BURNING_DAMAGE_MULT,
  POISON_TOXIN_DAMAGE_MULT,
  MACHINE_SILENCED_DAMAGE_MULT,
} from '@/data/combatStatus';

function pillMults(towerType: string): number[] {
  return getTowerCombatIdentityPills(towerType)
    .map((pill) => pill.mult)
    .filter((mult): mult is number => typeof mult === 'number');
}

describe('tower combat identity pills', () => {
  it('shows mark hunt on basic, sniper and demolisher', () => {
    expect(pillMults('basic')).toContain(BASIC_MARKED_DAMAGE_MULT);
    expect(pillMults('sniper')).toContain(SNIPER_MARKED_DAMAGE_MULT);
    expect(pillMults('demolisher')).toContain(SNIPER_MARKED_DAMAGE_MULT);
  });

  it('shows bleed hunt on shotgun and pin hunt on ballista', () => {
    expect(pillMults('shotgun')).toContain(SHOTGUN_BLEEDING_DAMAGE_MULT);
    expect(pillMults('ballista')).toContain(BALLISTA_ROOTED_DAMAGE_MULT);
  });

  it('keeps existing hunt pills on the towers that already have identities', () => {
    expect(pillMults('frost')).toContain(FROST_FROZEN_DAMAGE_MULT);
    expect(pillMults('storm')).toContain(FROST_FROZEN_DAMAGE_MULT);
    expect(pillMults('storm')).toContain(LIGHTNING_WEAKENED_DAMAGE_MULT);
    expect(pillMults('laser')).toContain(LASER_EXPOSED_DAMAGE_MULT);
    expect(pillMults('lightning')).toContain(LIGHTNING_WEAKENED_DAMAGE_MULT);
    expect(pillMults('cannon')).toContain(CANNON_STUNNED_DAMAGE_MULT);
    expect(pillMults('demolisher')).toContain(CANNON_STUNNED_DAMAGE_MULT);
    expect(pillMults('pulse')).toContain(PULSE_EXPOSED_DAMAGE_MULT);
    expect(pillMults('tempest')).toContain(PULSE_EXPOSED_DAMAGE_MULT);
    expect(pillMults('tempest')).toContain(WIND_FEARED_DAMAGE_MULT);
    expect(pillMults('wind')).toContain(WIND_FEARED_DAMAGE_MULT);
    expect(pillMults('flame')).toContain(FLAME_BURNING_DAMAGE_MULT);
    expect(pillMults('plague')).toContain(FLAME_BURNING_DAMAGE_MULT);
    expect(pillMults('plague')).toContain(POISON_TOXIN_DAMAGE_MULT);
    expect(pillMults('poison')).toContain(POISON_TOXIN_DAMAGE_MULT);
    expect(pillMults('machine')).toContain(MACHINE_SILENCED_DAMAGE_MULT);
  });

  it('does not invent pills for money tower', () => {
    expect(getTowerCombatIdentityPills('money')).toEqual([]);
  });
});
