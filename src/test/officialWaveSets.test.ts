/**
 * 官方波次組必須存在、敵人型別合法，且不依賴 Mod 也能查到
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA } from '@/data/gameData';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';

const OFFICIAL_IDS = ['official_shield_assault', 'official_ghost_tide'] as const;

describe('official wave sets', () => {
  it('registers two built-in wave sets with real enemies', () => {
    const ids = OFFICIAL_WAVE_SETS.map((set) => set.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of OFFICIAL_IDS) {
      const set = OFFICIAL_WAVE_SETS.find((item) => item.id === id);
      expect(set, id).toBeDefined();
      expect(set!.waves.length).toBeGreaterThanOrEqual(8);
      expect(set!.name.length).toBeGreaterThan(0);
      for (const wave of set!.waves) {
        expect(wave.enemies.length).toBeGreaterThan(0);
        expect(wave.reward).toBeGreaterThan(0);
        for (const group of wave.enemies) {
          expect(ENEMY_DATA[group.type], `${id} ${group.type}`).toBeDefined();
          expect(group.count).toBeGreaterThan(0);
        }
      }
    }
  });

  it('can be found without enabling any mod', () => {
    expect(findPlayableWaveSet('official_shield_assault')?.name).toBe('護盾強襲');
    expect(findPlayableWaveSet('official_ghost_tide')?.name).toBe('幽影潮汐');
    const lastShield = findPlayableWaveSet('official_shield_assault')!.waves.at(-1)!;
    expect(lastShield.enemies.some((g) => g.type === 'boss' || g.type === 'shield')).toBe(true);
  });
});
