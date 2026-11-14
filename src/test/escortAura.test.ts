import { describe, it, expect } from 'vitest';
import { collectEscortAuras, getEscortArmorAdd } from '@/data/escortAura';
import { ENEMY_DATA } from '@/data/gameData';
import { applyDamageToEnemy } from '@/store/gameStoreUtils';

const ESCORT = {
  ability: 'escort',
  escortRadius: 110,
  escortArmor: 6,
} as const;

describe('escort aura', () => {
  it('does not add armor when no escort is nearby', () => {
    const auras = collectEscortAuras(
      [{ type: 'normal', x: 2, y: 2, health: 80 }],
      { normal: { ability: undefined } },
    );
    expect(auras).toHaveLength(0);
    expect(getEscortArmorAdd(5, 5, auras)).toBe(0);
  });

  it('adds armor to units inside the escort radius', () => {
    const auras = collectEscortAuras(
      [{ type: 'escort', x: 5, y: 5, health: 100 }],
      { escort: ESCORT },
    );
    expect(auras).toHaveLength(1);
    expect(getEscortArmorAdd(5, 5, auras)).toBe(6);
    expect(getEscortArmorAdd(6.5, 5, auras)).toBe(6);
  });

  it('does not add armor outside the escort radius', () => {
    const auras = collectEscortAuras(
      [{ type: 'escort', x: 5, y: 5, health: 100 }],
      { escort: ESCORT },
    );
    expect(getEscortArmorAdd(9, 5, auras)).toBe(0);
  });

  it('uses the strongest escort when auras overlap', () => {
    const auras = collectEscortAuras(
      [
        { type: 'escort', x: 5, y: 5, health: 100 },
        { type: 'escort2', x: 5.2, y: 5, health: 80 },
      ],
      {
        escort: ESCORT,
        escort2: { ability: 'escort', escortRadius: 110, escortArmor: 9 },
      },
    );
    expect(getEscortArmorAdd(5, 5, auras)).toBe(9);
  });

  it('ignores dead escorts', () => {
    const auras = collectEscortAuras(
      [{ type: 'escort', x: 5, y: 5, health: 0 }],
      { escort: ESCORT },
    );
    expect(auras).toHaveLength(0);
  });

  it('defines escort enemy data with an armor aura', () => {
    expect(ENEMY_DATA.escort).toBeDefined();
    expect(ENEMY_DATA.escort.ability).toBe('escort');
    expect(ENEMY_DATA.escort.escortRadius).toBeGreaterThan(0);
    expect(ENEMY_DATA.escort.escortArmor).toBeGreaterThan(0);
  });

  it('reduces hit damage through escortArmor in the damage pipeline', () => {
    const result = applyDamageToEnemy(
      { type: 'normal', health: 100, escortArmor: 6 },
      20,
      Date.now(),
    );
    expect(result.health).toBe(86);
    expect(result.dealt).toBe(14);
  });

  it('stops escorting while freeze or silence is active', () => {
    const now = 10_000;
    const auras = collectEscortAuras(
      [{
        type: 'escort',
        x: 5,
        y: 5,
        health: 100,
        effects: [{ type: 'freeze', duration: 2000, startTime: 9000 }],
      }],
      { escort: ESCORT },
      now,
    );
    expect(auras).toHaveLength(0);
  });
});
