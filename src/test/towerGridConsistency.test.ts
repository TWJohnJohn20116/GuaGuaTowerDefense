/**
 * 塔與佔位的一致性（自由制版）
 *
 * 舊版驗的是「格子登記的 towerId 與塔的 gridPos 對得上」——那組不變式隨格子陣列一起消失了。
 * 自由制下真正該守的是：
 *   1. 放塔成功後，塔的位置**就是**你點的那個點（沒有 floor、沒有吸附）
 *   2. 路徑上不能放（圓形淨空）
 *   3. 兩座塔的佔位圓不能重疊
 *   4. 賣掉之後塔真的消失，位置可以再放一座
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { DEFAULT_PATH, DIFFICULTY_MODIFIERS, PATHS } from '@/data/gameData';
import {
  DEFAULT_TOWER_RADIUS,
  circlesOverlap,
  pathClearance,
  pathWidthOf,
  sampleBuildablePoints,
} from '@/data/mapGeometry';
import { findTowerOverlaps } from '@/test/contracts/gridTowerMismatches';
import type { MapPoint } from '@/types/game';

const MAP = PATHS[DEFAULT_PATH];

const resetMatch = () => {
  useGameStore.setState({
    scene: 'game',
    selectedPath: DEFAULT_PATH,
    activeMap: MAP ?? null,
    towers: [],
    enemies: [],
    projectiles: [],
    money: 10_000,
    selectedTowerType: 'basic',
    selectedTower: null,
    multiSelectedTowerIds: [],
    difficultyModifiers: DIFFICULTY_MODIFIERS.normal,
    placementHistory: [],
    placementHistoryIndex: -1,
  });
};

const buildable = (count: number): MapPoint[] => sampleBuildablePoints(MAP, count);

beforeEach(() => {
  resetMatch();
});

describe('自由放置', () => {
  it('塔的位置就是點擊的位置（不吸附整數格）', () => {
    const spot = { x: 3.37, y: 4.62 };
    // 先確認這個點合法，否則測的是「被拒絕」而不是「位置保真」
    expect(pathClearance(MAP, spot)).toBeGreaterThan(pathWidthOf(MAP) / 2 + DEFAULT_TOWER_RADIUS);

    expect(useGameStore.getState().placeTower(spot)).toBe(true);
    const tower = useGameStore.getState().towers[0];
    expect(tower.pos.x).toBeCloseTo(spot.x, 6);
    expect(tower.pos.y).toBeCloseTo(spot.y, 6);
    expect(tower.radius).toBe(DEFAULT_TOWER_RADIUS);
  });

  it('路徑上不能放塔', () => {
    const first = MAP?.waypoints[0];
    expect(first).toBeTruthy();
    const onPath = { x: first!.col, y: first!.row };
    expect(useGameStore.getState().placeTower(onPath)).toBe(false);
    expect(useGameStore.getState().towers).toHaveLength(0);
  });

  it('與既有塔的佔位圓重疊時不能放', () => {
    const [spot] = buildable(1);
    expect(useGameStore.getState().placeTower(spot)).toBe(true);

    const overlapping = { x: spot.x + DEFAULT_TOWER_RADIUS, y: spot.y };
    expect(useGameStore.getState().placeTower(overlapping)).toBe(false);
    expect(useGameStore.getState().towers).toHaveLength(1);
  });

  it('連放多座塔後，沒有任何兩座重疊', () => {
    const spots = buildable(12);
    for (const spot of spots) {
      useGameStore.getState().placeTower(spot);
    }
    const towers = useGameStore.getState().towers;
    expect(towers.length).toBeGreaterThan(0);
    expect(findTowerOverlaps(towers, MAP)).toEqual([]);

    for (let i = 0; i < towers.length; i++) {
      for (let j = i + 1; j < towers.length; j++) {
        expect(
          circlesOverlap(towers[i].pos, towers[i].radius, towers[j].pos, towers[j].radius),
        ).toBe(false);
      }
    }
  });

  it('賣掉之後塔消失，同一個位置可以再放', () => {
    const [spot] = buildable(1);
    expect(useGameStore.getState().placeTower(spot)).toBe(true);
    const tower = useGameStore.getState().towers[0];

    useGameStore.getState().sellTower(tower);
    expect(useGameStore.getState().towers).toHaveLength(0);

    expect(useGameStore.getState().placeTower(spot)).toBe(true);
    expect(useGameStore.getState().towers).toHaveLength(1);
  });

  it('邊界外不能放', () => {
    expect(useGameStore.getState().placeTower({ x: -3, y: 4 })).toBe(false);
    expect(useGameStore.getState().placeTower({ x: 4, y: 999 })).toBe(false);
  });
});
