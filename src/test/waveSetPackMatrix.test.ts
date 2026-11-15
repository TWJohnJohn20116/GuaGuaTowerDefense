/**
 * 官方波次包（地圖 × 波次集 × 成就）的參數化行為測試
 *
 * 原本是 6 支 *TrioPack.test.ts：同一套骨架複製 6 次，每支只差 3 組
 * （地圖、波次集、敵人主題、兩個成就）。收斂成 it.each 之後，新增一批
 * 波次包只要往 WAVE_PACK_CASES 加 3 筆。
 *
 * 差異保留：laneTrioPack 原本只驗波次集與成就、沒有驗 PATHS 幾何，
 * 所以那一批的 map 欄位留空。
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA, PATHS } from '@/data/gameData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';
import { PATHS_BY_DIFFICULTY } from '@/data/gameData/pathData';
import type { EnemyType } from '@/types/game';

type MapId = keyof typeof PATHS;
type DifficultyBucket = 'extreme' | 'hard' | 'medium';

interface WavePackCase {
  waveSetId: string;
  waveName: string;
  enemy: EnemyType;
  mapId: MapId;
  mapAchId: string;
  waveAchId: string;
  /** 只有實際走 PATHS 幾何檢查的包才填（lane trio 原本沒驗） */
  map?: { name: string; difficulty: string; bucket: DifficultyBucket };
}

const WAVE_PACK_CASES: WavePackCase[] = [
  // 極難：四葉／甬道／三角洲
  { waveSetId: 'official_tank_push', waveName: '坦克壓境', enemy: 'tank', mapId: 'clover', mapAchId: 'map_clover', waveAchId: 'wave_tank_push', map: { name: '四葉', difficulty: '極難', bucket: 'extreme' } },
  { waveSetId: 'official_shadow_run', waveName: '影行突襲', enemy: 'stealth', mapId: 'gauntlet', mapAchId: 'map_gauntlet', waveAchId: 'wave_shadow_run', map: { name: '甬道', difficulty: '極難', bucket: 'extreme' } },
  { waveSetId: 'official_guard_fan', waveName: '護航扇面', enemy: 'escort', mapId: 'delta', mapAchId: 'map_delta', waveAchId: 'wave_guard_fan', map: { name: '三角洲', difficulty: '極難', bucket: 'extreme' } },
  // 極難：稜鏡／層瀑／錨形
  { waveSetId: 'official_arcane_ward', waveName: '秘法結界', enemy: 'mage', mapId: 'prism', mapAchId: 'map_prism', waveAchId: 'wave_arcane_ward', map: { name: '稜鏡', difficulty: '極難', bucket: 'extreme' } },
  { waveSetId: 'official_air_bomb', waveName: '空中爆破', enemy: 'bomber', mapId: 'cascade', mapAchId: 'map_cascade', waveAchId: 'wave_air_bomb', map: { name: '層瀑', difficulty: '極難', bucket: 'extreme' } },
  { waveSetId: 'official_iron_tide', waveName: '重盾浪潮', enemy: 'heavy', mapId: 'anchor', mapAchId: 'map_anchor', waveAchId: 'wave_iron_tide', map: { name: '錨形', difficulty: '極難', bucket: 'extreme' } },
  // 困難：盤繞／閘門／谷地
  { waveSetId: 'official_air_blink', waveName: '空閃縱隊', enemy: 'flyer', mapId: 'coil', mapAchId: 'map_coil', waveAchId: 'wave_air_blink', map: { name: '盤繞', difficulty: '困難', bucket: 'hard' } },
  { waveSetId: 'official_rage_wall', waveName: '狂暴鐵壁', enemy: 'berserker', mapId: 'gate', mapAchId: 'map_gate', waveAchId: 'wave_rage_wall', map: { name: '閘門', difficulty: '困難', bucket: 'hard' } },
  { waveSetId: 'official_nest_jam', waveName: '巢穴干擾', enemy: 'spawner', mapId: 'valley', mapAchId: 'map_valley', waveAchId: 'wave_nest_jam', map: { name: '谷地', difficulty: '困難', bucket: 'hard' } },
  // 困難：新月／楔形／格網
  { waveSetId: 'official_saboteur_veil', waveName: '影襲破壞', enemy: 'saboteur', mapId: 'crescent', mapAchId: 'map_crescent', waveAchId: 'wave_saboteur_veil', map: { name: '新月', difficulty: '困難', bucket: 'hard' } },
  { waveSetId: 'official_swarm_air', waveName: '蟲空潮汐', enemy: 'swarm', mapId: 'wedge', mapAchId: 'map_wedge', waveAchId: 'wave_swarm_air', map: { name: '楔形', difficulty: '困難', bucket: 'hard' } },
  { waveSetId: 'official_elite_jam', waveName: '干擾先鋒', enemy: 'elite', mapId: 'lattice', mapAchId: 'map_lattice', waveAchId: 'wave_elite_jam', map: { name: '格網', difficulty: '困難', bucket: 'hard' } },
  // 中等：漏斗／鉤形／三線
  { waveSetId: 'official_support_web', waveName: '支援網', enemy: 'healer', mapId: 'funnel', mapAchId: 'map_funnel', waveAchId: 'wave_support_web', map: { name: '漏斗', difficulty: '中等', bucket: 'medium' } },
  { waveSetId: 'official_phase_raid', waveName: '相位奇襲', enemy: 'ghost', mapId: 'hook', mapAchId: 'map_hook', waveAchId: 'wave_phase_raid', map: { name: '鉤形', difficulty: '中等', bucket: 'medium' } },
  { waveSetId: 'official_siege_mix', waveName: '爆破拆遷', enemy: 'bomber', mapId: 'triple', mapAchId: 'map_triple', waveAchId: 'wave_siege_mix', map: { name: '三線', difficulty: '中等', bucket: 'medium' } },
  // 直線／長廊／蛇形（原本不驗 PATHS 幾何）
  { waveSetId: 'official_normal_tide', waveName: '普通潮汐', enemy: 'normal', mapId: 'straight', mapAchId: 'map_straight', waveAchId: 'wave_normal_tide' },
  { waveSetId: 'official_armor_column', waveName: '裝甲縱隊', enemy: 'armored', mapId: 'corridor', mapAchId: 'map_corridor', waveAchId: 'wave_armor_column' },
  { waveSetId: 'official_fast_raid', waveName: '快速突襲', enemy: 'fast', mapId: 'snake', mapAchId: 'map_snake', waveAchId: 'wave_fast_raid' },
];

describe('官方波次包', () => {
  it('官方波次集 id 唯一', () => {
    const ids = OFFICIAL_WAVE_SETS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(WAVE_PACK_CASES)('$mapId 是合法地圖：分支、連通與格線範圍', (entry) => {
    if (!entry.map) return;

    const path = PATHS[entry.mapId];
    expect(path, entry.mapId).toBeDefined();
    expect(path.name).toBe(entry.map.name);
    expect(path.difficulty).toBe(entry.map.difficulty);
    expect(PATHS_BY_DIFFICULTY[entry.map.bucket][entry.mapId]).toBeDefined();
    expect(path.startSegmentId).toBeTruthy();
    expect(path.segments?.length).toBeGreaterThanOrEqual(3);

    const ids = new Set(path.segments!.map((s) => s.id));
    expect(ids.has(path.startSegmentId!)).toBe(true);
    for (const segment of path.segments!) {
      expect(segment.waypoints.length).toBeGreaterThanOrEqual(2);
      for (const point of segment.waypoints) {
        expect(point.col).toBeGreaterThanOrEqual(0);
        expect(point.col).toBeLessThanOrEqual(14);
        expect(point.row).toBeGreaterThanOrEqual(0);
        expect(point.row).toBeLessThanOrEqual(10);
      }
      for (const nextId of segment.next) {
        expect(ids.has(nextId), `${entry.mapId} -> ${nextId}`).toBe(true);
      }
    }
  });

  it.each(WAVE_PACK_CASES)('$waveSetId 是主題波次集且可被選取', (entry) => {
    const set = OFFICIAL_WAVE_SETS.find((item) => item.id === entry.waveSetId);
    expect(set, entry.waveSetId).toBeDefined();
    expect(set!.name).toBe(entry.waveName);
    expect(set!.waves.length).toBeGreaterThanOrEqual(8);

    const themed = set!.waves.filter((wave) => wave.enemies.some((g) => g.type === entry.enemy));
    expect(themed.length, entry.waveSetId).toBeGreaterThanOrEqual(6);

    for (const wave of set!.waves) {
      expect(wave.reward).toBeGreaterThan(0);
      for (const group of wave.enemies) {
        expect(ENEMY_DATA[group.type], group.type).toBeDefined();
        expect(group.count).toBeGreaterThan(0);
      }
    }

    expect(findPlayableWaveSet(entry.waveSetId)?.name).toBe(entry.waveName);
    const last = set!.waves.at(-1)!;
    expect(last.enemies.some((g) => g.type === 'boss' || g.type === entry.enemy)).toBe(true);
  });

  it.each(WAVE_PACK_CASES)('$waveSetId 對應的地圖與波次成就真的會解鎖', (entry) => {
    const mapAch = ALL_ACHIEVEMENTS.find((a) => a.id === entry.mapAchId);
    expect(mapAch, entry.mapAchId).toBeDefined();
    expect(mapAch!.conditions[0].mapId).toBe(entry.mapId);
    expect(
      checkCondition(mapAch!, { ...getInitialStatistics(), mapsCompleted: { [entry.mapId]: 1 } }, {}).met,
    ).toBe(true);

    const waveAch = ALL_ACHIEVEMENTS.find((a) => a.id === entry.waveAchId);
    expect(waveAch, entry.waveAchId).toBeDefined();
    expect(waveAch!.conditions[0].type).toBe('complete_wave_set');
    expect(waveAch!.conditions[0].waveSetId).toBe(entry.waveSetId);
    expect(
      checkCondition(
        waveAch!,
        { ...getInitialStatistics(), waveSetsCompleted: { [entry.waveSetId]: 1 } },
        {},
      ).met,
    ).toBe(true);
  });
});
