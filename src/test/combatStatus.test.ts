import { describe, it, expect } from 'vitest';
import {
  applyBallistaRoot,
  applyCannonStun,
  applyFreezeBlast,
  applyFrostbite,
  applyLaserExposed,
  applyLightningWeakness,
  applyPulseExposed,
  applyShotgunBleed,
  applySniperMark,
  applyWindFear,
  BALLISTA_ROOT_DURATION,
  CANNON_STUN_DURATION,
  MACHINE_SILENCE_DURATION,
  EXPOSED_ARMOR_MULT,
  FREEZE_BLAST_DURATION,
  FROSTBITE_STACKS_TO_FREEZE,
  FROST_FREEZE_DURATION,
  PULSE_EXPOSED_DURATION,
  WIND_FEAR_DURATION,
  getArmorTakenMult,
  getDamageTakenMult,
  getFocusFireMult,
  getExecuteMult,
  getAntiAirMult,
  getPinnedMult,
  getBleedHuntMult,
  getStunCrushMult,
  getExposedHuntMult,
  getBurnHuntMult,
  getToxinHuntMult,
  getSilenceHuntMult,
  getFearHuntMult,
  getWeaknessHuntMult,
  getLaserHuntMult,
  getFreezeHuntMult,
  getFreezeShatterDamage,
  getIncomingHealMult,
  getShieldRegenMult,
  getTowerHitDamageOpts,
  BASIC_MARKED_DAMAGE_MULT,
  SNIPER_MARKED_DAMAGE_MULT,
  LASER_EXECUTE_DAMAGE_MULT,
  LASER_EXECUTE_HP_RATIO,
  FLAME_EXECUTE_DAMAGE_MULT,
  FLAME_EXECUTE_HP_RATIO,
  MACHINE_FLYER_DAMAGE_MULT,
  LIGHTNING_FLYER_DAMAGE_MULT,
  WIND_FLYER_DAMAGE_MULT,
  BALLISTA_ROOTED_DAMAGE_MULT,
  SHOTGUN_BLEEDING_DAMAGE_MULT,
  CANNON_STUNNED_DAMAGE_MULT,
  PULSE_EXPOSED_DAMAGE_MULT,
  FLAME_BURNING_DAMAGE_MULT,
  POISON_TOXIN_DAMAGE_MULT,
  MACHINE_SILENCED_DAMAGE_MULT,
  WIND_FEARED_DAMAGE_MULT,
  LIGHTNING_WEAKENED_DAMAGE_MULT,
  LASER_EXPOSED_DAMAGE_MULT,
  FROST_FROZEN_DAMAGE_MULT,
  FROST_SHATTER_DAMAGE,
  LASER_EXPOSED_DURATION,
  LIGHTNING_WEAKNESS_DURATION,
  SHOTGUN_BLEED_DURATION,
  SHOTGUN_BLEED_PER_SECOND,
  SNIPER_MARK_DURATION,
  WEAKNESS_DAMAGE_MULT,
} from '@/data/combatStatus';

describe('combat status', () => {
  it('lets sniper shots mark a target and refresh the timer', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applySniperMark(effects, 'basic', now);
    expect(effects).toEqual([]);

    applySniperMark(effects, 'sniper', now);
    expect(effects).toEqual([{
      type: 'marked',
      duration: SNIPER_MARK_DURATION,
      startTime: now,
    }]);

    applySniperMark(effects, 'sniper', now + 400);
    expect(effects).toHaveLength(1);
    expect(effects[0].startTime).toBe(now + 400);
  });

  it('cuts incoming heals while poisoned or cursed', () => {
    const now = 10_000;
    expect(getIncomingHealMult([], now)).toBe(1);
    expect(getIncomingHealMult(
      [{ type: 'poison', duration: 3000, startTime: 9000 }],
      now,
    )).toBe(0.35);
    expect(getIncomingHealMult(
      [{ type: 'curse', duration: 3000, startTime: 9000 }],
      now,
    )).toBe(0.25);
    expect(getIncomingHealMult(
      [
        { type: 'poison', duration: 3000, startTime: 9000 },
        { type: 'curse', duration: 3000, startTime: 9000 },
      ],
      now,
    )).toBe(0.25);
    expect(getIncomingHealMult(
      [{ type: 'poison', duration: 3000, startTime: 6000 }],
      now,
    )).toBe(1);
  });

  it('lets laser expose armor and lightning apply weakness', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applyLaserExposed(effects, 'cannon', now);
    applyLightningWeakness(effects, 'cannon', now);
    expect(effects).toEqual([]);

    applyLaserExposed(effects, 'laser', now);
    applyLightningWeakness(effects, 'lightning', now);
    expect(effects).toEqual([
      { type: 'exposed', duration: LASER_EXPOSED_DURATION, startTime: now },
      { type: 'weakness', duration: LIGHTNING_WEAKNESS_DURATION, startTime: now },
    ]);
    expect(getArmorTakenMult(effects, now)).toBe(EXPOSED_ARMOR_MULT);
    expect(getDamageTakenMult(effects, now)).toBe(WEAKNESS_DAMAGE_MULT);

    applyLaserExposed(effects, 'laser', now + 200);
    expect(effects.find((effect) => effect.type === 'exposed')?.startTime).toBe(now + 200);
  });

  it('ignores expired expose and weakness', () => {
    const now = 10_000;
    expect(getArmorTakenMult(
      [{ type: 'exposed', duration: 2000, startTime: 7000 }],
      now,
    )).toBe(1);
    expect(getDamageTakenMult(
      [{ type: 'weakness', duration: 2000, startTime: 7000 }],
      now,
    )).toBe(1);
  });

  it('lets shotgun pellets apply moving bleed', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number; value?: number }[] = [];
    applyShotgunBleed(effects, 'cannon', now);
    expect(effects).toEqual([]);

    applyShotgunBleed(effects, 'shotgun', now);
    expect(effects).toEqual([{
      type: 'bleed',
      duration: SHOTGUN_BLEED_DURATION,
      startTime: now,
      value: SHOTGUN_BLEED_PER_SECOND,
    }]);
    applyShotgunBleed(effects, 'shotgun', now + 300);
    expect(effects).toHaveLength(1);
    expect(effects[0].startTime).toBe(now + 300);
  });

  it('lets lightning shots skip shields', () => {
    expect(getTowerHitDamageOpts('lightning')).toEqual({ ignoreShield: true });
    expect(getTowerHitDamageOpts('laser')).toEqual({});
    expect(getTowerHitDamageOpts('sniper')).toEqual({});
  });

  it('lets poison and plague shots skip shields', () => {
    expect(getTowerHitDamageOpts('poison')).toEqual({ ignoreShield: true, ignoreArmor: true });
    expect(getTowerHitDamageOpts('plague')).toEqual({ ignoreShield: true, ignoreArmor: true });
  });

  it('lets poison and plague shots skip armor', () => {
    expect(getTowerHitDamageOpts('poison')).toEqual({ ignoreShield: true, ignoreArmor: true });
    expect(getTowerHitDamageOpts('plague')).toEqual({ ignoreShield: true, ignoreArmor: true });
  });

  it('lets burn stop shield regeneration', () => {
    const now = 1000;
    expect(getShieldRegenMult(undefined, now)).toBe(1);
    expect(getShieldRegenMult([], now)).toBe(1);
    expect(getShieldRegenMult(
      [{ type: 'burn', duration: 3000, startTime: 500 }],
      now,
    )).toBe(0);
    expect(getShieldRegenMult(
      [{ type: 'burn', duration: 3000, startTime: 0 }],
      10_000,
    )).toBe(1);
  });

  it('lets ballista bolts briefly root a column', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applyBallistaRoot(effects, 'cannon', now);
    expect(effects).toEqual([]);

    applyBallistaRoot(effects, 'ballista', now);
    expect(effects).toEqual([{
      type: 'root',
      duration: BALLISTA_ROOT_DURATION,
      startTime: now,
    }]);
    applyBallistaRoot(effects, 'ballista', now + 200);
    expect(effects).toHaveLength(1);
    expect(effects[0].startTime).toBe(now + 200);
  });

  it('lets cannon shots briefly stun a cluster', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applyCannonStun(effects, 'sniper', now);
    expect(effects).toEqual([]);

    applyCannonStun(effects, 'cannon', now);
    expect(effects).toEqual([{
      type: 'stun',
      duration: CANNON_STUN_DURATION,
      startTime: now,
    }]);
    applyCannonStun(effects, 'cannon', now + 150);
    expect(effects).toHaveLength(1);
    expect(effects[0].startTime).toBe(now + 150);
  });

  it('lets wind blades briefly panic a runner', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applyWindFear(effects, 'frost', now);
    expect(effects).toEqual([]);

    applyWindFear(effects, 'wind', now);
    expect(effects).toEqual([{
      type: 'fear',
      duration: WIND_FEAR_DURATION,
      startTime: now,
    }]);
    applyWindFear(effects, 'wind', now + 200);
    expect(effects).toHaveLength(1);
    expect(effects[0].startTime).toBe(now + 200);
  });

  it('lets pulse rings expose armor on a cluster', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applyPulseExposed(effects, 'cannon', now);
    expect(effects).toEqual([]);

    applyPulseExposed(effects, 'pulse', now);
    expect(effects).toEqual([{
      type: 'exposed',
      duration: PULSE_EXPOSED_DURATION,
      startTime: now,
    }]);
    expect(getArmorTakenMult(effects, now)).toBe(EXPOSED_ARMOR_MULT);
    applyPulseExposed(effects, 'pulse', now + 250);
    expect(effects).toHaveLength(1);
    expect(effects[0].startTime).toBe(now + 250);
  });

  it('lets storm inherit lightning weakness and shield pierce', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applyLightningWeakness(effects, 'frost', now);
    expect(effects).toEqual([]);

    applyLightningWeakness(effects, 'storm', now);
    expect(effects).toEqual([{
      type: 'weakness',
      duration: LIGHTNING_WEAKNESS_DURATION,
      startTime: now,
    }]);
    expect(getDamageTakenMult(effects, now)).toBe(WEAKNESS_DAMAGE_MULT);
    expect(getTowerHitDamageOpts('storm')).toEqual({ ignoreShield: true });
    applyLightningWeakness(effects, 'storm', now + 180);
    expect(effects).toHaveLength(1);
    expect(effects[0].startTime).toBe(now + 180);
  });

  it('lets demolisher inherit cannon stun and sniper mark', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applyCannonStun(effects, 'storm', now);
    applySniperMark(effects, 'storm', now);
    expect(effects).toEqual([]);

    applyCannonStun(effects, 'demolisher', now);
    applySniperMark(effects, 'demolisher', now);
    expect(effects).toEqual([
      { type: 'stun', duration: CANNON_STUN_DURATION, startTime: now },
      { type: 'marked', duration: SNIPER_MARK_DURATION, startTime: now },
    ]);
    applyCannonStun(effects, 'demolisher', now + 120);
    applySniperMark(effects, 'demolisher', now + 120);
    expect(effects).toHaveLength(2);
    expect(effects[0].startTime).toBe(now + 120);
    expect(effects[1].startTime).toBe(now + 120);
  });

  it('lets tempest inherit pulse expose and wind fear', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number }[] = [];
    applyPulseExposed(effects, 'wind', now);
    applyWindFear(effects, 'pulse', now);
    expect(effects).toEqual([]);

    applyPulseExposed(effects, 'tempest', now);
    applyWindFear(effects, 'tempest', now);
    expect(effects).toEqual([
      { type: 'exposed', duration: PULSE_EXPOSED_DURATION, startTime: now },
      { type: 'fear', duration: WIND_FEAR_DURATION, startTime: now },
    ]);
    expect(getArmorTakenMult(effects, now)).toBe(EXPOSED_ARMOR_MULT);
    applyPulseExposed(effects, 'tempest', now + 220);
    applyWindFear(effects, 'tempest', now + 220);
    expect(effects).toHaveLength(2);
    expect(effects[0].startTime).toBe(now + 220);
    expect(effects[1].startTime).toBe(now + 220);
  });

  it('lets frost shots stack frostbite and freeze on the third hit', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number; stacks?: number }[] = [];
    applyFrostbite(effects, 'cannon', now);
    expect(effects).toEqual([]);

    applyFrostbite(effects, 'frost', now);
    expect(effects).toEqual([{
      type: 'frostbite',
      duration: expect.any(Number),
      startTime: now,
      stacks: 1,
    }]);

    applyFrostbite(effects, 'frost', now + 200);
    expect(effects).toHaveLength(1);
    expect(effects[0].type).toBe('frostbite');
    expect(effects[0].stacks).toBe(2);

    applyFrostbite(effects, 'frost', now + 400);
    expect(FROSTBITE_STACKS_TO_FREEZE).toBe(3);
    expect(effects.find((effect) => effect.type === 'frostbite')).toBeUndefined();
    expect(effects.find((effect) => effect.type === 'freeze')).toEqual({
      type: 'freeze',
      duration: FROST_FREEZE_DURATION,
      startTime: now + 400,
    });
  });

  it('lets freeze blast actually freeze instead of applying a dummy slow', () => {
    const now = 2000;
    const effects: { type: string; duration: number; startTime: number; value?: number }[] = [
      { type: 'slow', duration: 2000, startTime: now, value: 0.5 },
    ];
    applyFreezeBlast(effects, now);
    expect(effects.find((effect) => effect.type === 'freeze')).toEqual({
      type: 'freeze',
      duration: FREEZE_BLAST_DURATION,
      startTime: now,
    });
    expect(effects.find((effect) => effect.type === 'slow')?.value).toBe(0.5);
  });

  it('lets basic towers deal bonus damage to marked targets', () => {
    const now = 1000;
    const marked = [{ type: 'marked', duration: SNIPER_MARK_DURATION, startTime: now }];
    expect(getFocusFireMult(undefined, now, 'basic')).toBe(1);
    expect(getFocusFireMult([], now, 'basic')).toBe(1);
    expect(getFocusFireMult(marked, now, 'sniper')).toBe(SNIPER_MARKED_DAMAGE_MULT);
    expect(getFocusFireMult(marked, now, 'cannon')).toBe(1);
    expect(getFocusFireMult(marked, now, 'basic')).toBe(BASIC_MARKED_DAMAGE_MULT);
    expect(BASIC_MARKED_DAMAGE_MULT).toBeGreaterThan(1);
    expect(SNIPER_MARKED_DAMAGE_MULT).toBeGreaterThan(BASIC_MARKED_DAMAGE_MULT);
    expect(getFocusFireMult(marked, now, 'demolisher')).toBe(SNIPER_MARKED_DAMAGE_MULT);
    expect(getFocusFireMult(
      [{ type: 'marked', duration: SNIPER_MARK_DURATION, startTime: now - SNIPER_MARK_DURATION }],
      now,
      'sniper',
    )).toBe(1);
    expect(getFocusFireMult(
      [{ type: 'marked', duration: SNIPER_MARK_DURATION, startTime: now - SNIPER_MARK_DURATION }],
      now,
      'basic',
    )).toBe(1);
  });

  it('lets storm inherit frostbite stacks and freeze on the third hit', () => {
    const now = 1000;
    const effects: { type: string; duration: number; startTime: number; stacks?: number }[] = [];
    applyFrostbite(effects, 'lightning', now);
    expect(effects).toEqual([]);

    applyFrostbite(effects, 'storm', now);
    expect(effects).toEqual([{
      type: 'frostbite',
      duration: expect.any(Number),
      startTime: now,
      stacks: 1,
    }]);
    applyFrostbite(effects, 'storm', now + 200);
    expect(effects[0].stacks).toBe(2);
    applyFrostbite(effects, 'storm', now + 400);
    expect(effects.find((effect) => effect.type === 'frostbite')).toBeUndefined();
    expect(effects.find((effect) => effect.type === 'freeze')).toEqual({
      type: 'freeze',
      duration: FROST_FREEZE_DURATION,
      startTime: now + 400,
    });
  });

  it('lets laser execute wounded targets below the health threshold', () => {
    expect(getExecuteMult('cannon', 0.1)).toBe(1);
    expect(getExecuteMult('laser', 1)).toBe(1);
    expect(getExecuteMult('laser', LASER_EXECUTE_HP_RATIO + 0.01)).toBe(1);
    expect(getExecuteMult('laser', LASER_EXECUTE_HP_RATIO)).toBe(LASER_EXECUTE_DAMAGE_MULT);
    expect(getExecuteMult('laser', 0.1)).toBe(LASER_EXECUTE_DAMAGE_MULT);
    expect(LASER_EXECUTE_DAMAGE_MULT).toBeGreaterThan(1);
    expect(LASER_EXECUTE_HP_RATIO).toBeLessThan(0.5);
  });

  it('lets machine guns deal bonus damage to flyers', () => {
    expect(getAntiAirMult('machine', 'normal')).toBe(1);
    expect(getAntiAirMult('sniper', 'flyer')).toBe(1);
    expect(getAntiAirMult('machine', 'flyer')).toBe(MACHINE_FLYER_DAMAGE_MULT);
    expect(MACHINE_FLYER_DAMAGE_MULT).toBeGreaterThan(1);
    expect(getAntiAirMult(undefined, 'flyer')).toBe(1);
  });

  it('lets lightning chains deal bonus damage to flyers', () => {
    expect(getAntiAirMult('lightning', 'normal')).toBe(1);
    expect(getAntiAirMult('cannon', 'flyer')).toBe(1);
    expect(getAntiAirMult('lightning', 'flyer')).toBe(LIGHTNING_FLYER_DAMAGE_MULT);
    expect(getAntiAirMult('storm', 'flyer')).toBe(LIGHTNING_FLYER_DAMAGE_MULT);
    expect(LIGHTNING_FLYER_DAMAGE_MULT).toBeGreaterThan(1);
    expect(LIGHTNING_FLYER_DAMAGE_MULT).not.toBe(MACHINE_FLYER_DAMAGE_MULT);
  });

  it('lets wind blades deal bonus damage to flyers', () => {
    expect(getAntiAirMult('wind', 'normal')).toBe(1);
    expect(getAntiAirMult('frost', 'flyer')).toBe(1);
    expect(getAntiAirMult('wind', 'flyer')).toBe(WIND_FLYER_DAMAGE_MULT);
    expect(getAntiAirMult('tempest', 'flyer')).toBe(WIND_FLYER_DAMAGE_MULT);
    expect(WIND_FLYER_DAMAGE_MULT).toBeGreaterThan(1);
    expect(WIND_FLYER_DAMAGE_MULT).not.toBe(MACHINE_FLYER_DAMAGE_MULT);
    expect(WIND_FLYER_DAMAGE_MULT).not.toBe(LIGHTNING_FLYER_DAMAGE_MULT);
  });

  it('lets ballista bolts deal bonus damage to rooted targets', () => {
    const now = 1000;
    const rooted = [{ type: 'root', duration: BALLISTA_ROOT_DURATION, startTime: now }];
    expect(getPinnedMult(undefined, rooted, now)).toBe(1);
    expect(getPinnedMult('cannon', rooted, now)).toBe(1);
    expect(getPinnedMult('ballista', [], now)).toBe(1);
    expect(getPinnedMult('ballista', rooted, now)).toBe(BALLISTA_ROOTED_DAMAGE_MULT);
    expect(BALLISTA_ROOTED_DAMAGE_MULT).toBeGreaterThan(1);
    expect(getPinnedMult(
      'ballista',
      [{ type: 'root', duration: BALLISTA_ROOT_DURATION, startTime: 0 }],
      now,
    )).toBe(1);
  });

  it('shatters frozen enemies when freeze expires', () => {
    const now = 1000;
    const frozen = [{ type: 'freeze', duration: FROST_FREEZE_DURATION, startTime: now }];
    expect(getFreezeShatterDamage(undefined, now)).toBe(0);
    expect(getFreezeShatterDamage([], now)).toBe(0);
    expect(getFreezeShatterDamage(frozen, now)).toBe(0);
    expect(getFreezeShatterDamage(frozen, now + FROST_FREEZE_DURATION - 1)).toBe(0);
    expect(getFreezeShatterDamage(frozen, now + FROST_FREEZE_DURATION)).toBe(FROST_SHATTER_DAMAGE);
    expect(FROST_SHATTER_DAMAGE).toBeGreaterThan(0);
    expect(getFreezeShatterDamage(
      [{ type: 'root', duration: BALLISTA_ROOT_DURATION, startTime: 0 }],
      now,
    )).toBe(0);
    expect(getFreezeShatterDamage(
      [{ type: 'freeze', duration: FREEZE_BLAST_DURATION, startTime: 0 }],
      FREEZE_BLAST_DURATION,
    )).toBe(FROST_SHATTER_DAMAGE);
  });

  it('lets shotgun pellets deal bonus damage to bleeding targets', () => {
    const now = 1000;
    const bleeding = [{ type: 'bleed', duration: SHOTGUN_BLEED_DURATION, startTime: now }];
    expect(getBleedHuntMult(undefined, bleeding, now)).toBe(1);
    expect(getBleedHuntMult('cannon', bleeding, now)).toBe(1);
    expect(getBleedHuntMult('shotgun', [], now)).toBe(1);
    expect(getBleedHuntMult('shotgun', bleeding, now)).toBe(SHOTGUN_BLEEDING_DAMAGE_MULT);
    expect(SHOTGUN_BLEEDING_DAMAGE_MULT).toBeGreaterThan(1);
    expect(getBleedHuntMult(
      'shotgun',
      [{ type: 'bleed', duration: SHOTGUN_BLEED_DURATION, startTime: now - SHOTGUN_BLEED_DURATION }],
      now,
    )).toBe(1);
  });

  it('lets cannons deal bonus damage to stunned targets', () => {
    const now = 1000;
    const stunned = [{ type: 'stun', duration: CANNON_STUN_DURATION, startTime: now }];
    expect(getStunCrushMult(undefined, stunned, now)).toBe(1);
    expect(getStunCrushMult('shotgun', stunned, now)).toBe(1);
    expect(getStunCrushMult('cannon', [], now)).toBe(1);
    expect(getStunCrushMult('cannon', stunned, now)).toBe(CANNON_STUNNED_DAMAGE_MULT);
    expect(getStunCrushMult('demolisher', stunned, now)).toBe(CANNON_STUNNED_DAMAGE_MULT);
    expect(CANNON_STUNNED_DAMAGE_MULT).toBeGreaterThan(1);
    expect(getStunCrushMult(
      'cannon',
      [{ type: 'stun', duration: CANNON_STUN_DURATION, startTime: 0 }],
      now,
    )).toBe(1);
  });

  it('lets pulse rings deal bonus damage to already exposed targets', () => {
    const now = 1000;
    const exposed = [{ type: 'exposed', duration: PULSE_EXPOSED_DURATION, startTime: now }];
    expect(getExposedHuntMult(undefined, exposed, now)).toBe(1);
    expect(getExposedHuntMult('laser', exposed, now)).toBe(1);
    expect(getExposedHuntMult('pulse', [], now)).toBe(1);
    expect(getExposedHuntMult('pulse', exposed, now)).toBe(PULSE_EXPOSED_DAMAGE_MULT);
    expect(getExposedHuntMult('tempest', exposed, now)).toBe(PULSE_EXPOSED_DAMAGE_MULT);
    expect(PULSE_EXPOSED_DAMAGE_MULT).toBeGreaterThan(1);
    expect(getExposedHuntMult(
      'pulse',
      [{ type: 'exposed', duration: PULSE_EXPOSED_DURATION, startTime: now - PULSE_EXPOSED_DURATION }],
      now,
    )).toBe(1);
  });

  it('lets flame jets deal bonus damage to burning targets', () => {
    const now = 1000;
    const burning = [{ type: 'burn', duration: 3000, startTime: now }];
    expect(getBurnHuntMult(undefined, burning, now)).toBe(1);
    expect(getBurnHuntMult('cannon', burning, now)).toBe(1);
    expect(getBurnHuntMult('flame', [], now)).toBe(1);
    expect(getBurnHuntMult('flame', burning, now)).toBe(FLAME_BURNING_DAMAGE_MULT);
    expect(getBurnHuntMult('plague', burning, now)).toBe(FLAME_BURNING_DAMAGE_MULT);
    expect(FLAME_BURNING_DAMAGE_MULT).toBeGreaterThan(1);
    expect(getBurnHuntMult(
      'flame',
      [{ type: 'burn', duration: 3000, startTime: now - 3000 }],
      now,
    )).toBe(1);
  });

  it('lets flame jets execute wounded targets below the health threshold', () => {
    expect(getExecuteMult('flame', 1)).toBe(1);
    expect(getExecuteMult('flame', FLAME_EXECUTE_HP_RATIO + 0.01)).toBe(1);
    expect(getExecuteMult('flame', FLAME_EXECUTE_HP_RATIO)).toBe(FLAME_EXECUTE_DAMAGE_MULT);
    expect(getExecuteMult('flame', 0.1)).toBe(FLAME_EXECUTE_DAMAGE_MULT);
    expect(getExecuteMult('plague', 0.1)).toBe(FLAME_EXECUTE_DAMAGE_MULT);
    expect(getExecuteMult('laser', 0.1)).toBe(LASER_EXECUTE_DAMAGE_MULT);
    expect(FLAME_EXECUTE_DAMAGE_MULT).toBeGreaterThan(1);
    expect(FLAME_EXECUTE_HP_RATIO).toBeLessThan(0.5);
    expect(FLAME_EXECUTE_DAMAGE_MULT).not.toBe(LASER_EXECUTE_DAMAGE_MULT);
  });

  it('lets poison shots deal bonus damage to already poisoned targets', () => {
    const now = 1000;
    const poisoned = [{ type: 'poison', duration: 3000, startTime: now }];
    expect(getToxinHuntMult(undefined, poisoned, now)).toBe(1);
    expect(getToxinHuntMult('flame', poisoned, now)).toBe(1);
    expect(getToxinHuntMult('poison', [], now)).toBe(1);
    expect(getToxinHuntMult('poison', poisoned, now)).toBe(POISON_TOXIN_DAMAGE_MULT);
    expect(getToxinHuntMult('plague', poisoned, now)).toBe(POISON_TOXIN_DAMAGE_MULT);
    expect(POISON_TOXIN_DAMAGE_MULT).toBeGreaterThan(1);
    expect(getToxinHuntMult(
      'poison',
      [{ type: 'poison', duration: 3000, startTime: now - 3000 }],
      now,
    )).toBe(1);
  });

  it('lets machine guns deal bonus damage to silenced targets', () => {
    const now = 1000;
    const silenced = [{ type: 'silence', duration: MACHINE_SILENCE_DURATION, startTime: now }];
    expect(getSilenceHuntMult(undefined, silenced, now)).toBe(1);
    expect(getSilenceHuntMult('cannon', silenced, now)).toBe(1);
    expect(getSilenceHuntMult('machine', [], now)).toBe(1);
    expect(getSilenceHuntMult('machine', silenced, now)).toBe(MACHINE_SILENCED_DAMAGE_MULT);
    expect(MACHINE_SILENCED_DAMAGE_MULT).toBeGreaterThan(1);
    expect(getSilenceHuntMult(
      'machine',
      [{ type: 'silence', duration: MACHINE_SILENCE_DURATION, startTime: now - MACHINE_SILENCE_DURATION }],
      now,
    )).toBe(1);
  });

  it('lets wind blades deal bonus damage to feared targets', () => {
    const now = 1000;
    const feared = [{ type: 'fear', duration: WIND_FEAR_DURATION, startTime: now }];
    expect(getFearHuntMult(undefined, feared, now)).toBe(1);
    expect(getFearHuntMult('cannon', feared, now)).toBe(1);
    expect(getFearHuntMult('wind', [], now)).toBe(1);
    expect(getFearHuntMult('wind', feared, now)).toBe(WIND_FEARED_DAMAGE_MULT);
    expect(getFearHuntMult('tempest', feared, now)).toBe(WIND_FEARED_DAMAGE_MULT);
    expect(WIND_FEARED_DAMAGE_MULT).toBeGreaterThan(1);
    expect(WIND_FEARED_DAMAGE_MULT).not.toBe(WIND_FLYER_DAMAGE_MULT);
    expect(getFearHuntMult(
      'wind',
      [{ type: 'fear', duration: WIND_FEAR_DURATION, startTime: now - WIND_FEAR_DURATION }],
      now,
    )).toBe(1);
  });

  it('lets lightning chains deal bonus damage to weakened targets', () => {
    const now = 1000;
    const weakened = [{ type: 'weakness', duration: LIGHTNING_WEAKNESS_DURATION, startTime: now }];
    expect(getWeaknessHuntMult(undefined, weakened, now)).toBe(1);
    expect(getWeaknessHuntMult('cannon', weakened, now)).toBe(1);
    expect(getWeaknessHuntMult('lightning', [], now)).toBe(1);
    expect(getWeaknessHuntMult('lightning', weakened, now)).toBe(LIGHTNING_WEAKENED_DAMAGE_MULT);
    expect(getWeaknessHuntMult('storm', weakened, now)).toBe(LIGHTNING_WEAKENED_DAMAGE_MULT);
    expect(LIGHTNING_WEAKENED_DAMAGE_MULT).toBeGreaterThan(1);
    expect(getWeaknessHuntMult(
      'lightning',
      [{ type: 'weakness', duration: LIGHTNING_WEAKNESS_DURATION, startTime: now - LIGHTNING_WEAKNESS_DURATION }],
      now,
    )).toBe(1);
  });

  it('lets frost bolts deal bonus damage to frozen targets', () => {
    const now = 1000;
    const frozen = [{ type: 'freeze', duration: FROST_FREEZE_DURATION, startTime: now }];
    expect(getFreezeHuntMult(undefined, frozen, now)).toBe(1);
    expect(getFreezeHuntMult('cannon', frozen, now)).toBe(1);
    expect(getFreezeHuntMult('frost', [], now)).toBe(1);
    expect(getFreezeHuntMult('frost', frozen, now)).toBe(FROST_FROZEN_DAMAGE_MULT);
    expect(getFreezeHuntMult('storm', frozen, now)).toBe(FROST_FROZEN_DAMAGE_MULT);
    expect(FROST_FROZEN_DAMAGE_MULT).toBeGreaterThan(1);
    expect(getFreezeHuntMult(
      'frost',
      [{ type: 'freeze', duration: FROST_FREEZE_DURATION, startTime: now - FROST_FREEZE_DURATION }],
      now,
    )).toBe(1);
    expect(getFreezeHuntMult(
      'frost',
      [{ type: 'freeze', duration: FREEZE_BLAST_DURATION, startTime: now }],
      now,
    )).toBe(FROST_FROZEN_DAMAGE_MULT);
  });

  it('lets laser beams deal bonus damage to already exposed targets', () => {
    const now = 1000;
    const exposed = [{ type: 'exposed', duration: LASER_EXPOSED_DURATION, startTime: now }];
    expect(getLaserHuntMult(undefined, exposed, now)).toBe(1);
    expect(getLaserHuntMult('pulse', exposed, now)).toBe(1);
    expect(getLaserHuntMult('laser', [], now)).toBe(1);
    expect(getLaserHuntMult('laser', exposed, now)).toBe(LASER_EXPOSED_DAMAGE_MULT);
    expect(LASER_EXPOSED_DAMAGE_MULT).toBeGreaterThan(1);
    expect(LASER_EXPOSED_DAMAGE_MULT).not.toBe(PULSE_EXPOSED_DAMAGE_MULT);
    expect(getExposedHuntMult('laser', exposed, now)).toBe(1);
    expect(getLaserHuntMult(
      'laser',
      [{ type: 'exposed', duration: LASER_EXPOSED_DURATION, startTime: now - LASER_EXPOSED_DURATION }],
      now,
    )).toBe(1);
  });
});
