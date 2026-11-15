/**
 * 壓力測試模式
 *
 * 兩個層面都要鎖：
 *  1. 純資料建構器（id 唯一、分佈合法、不越過終點、只挑空格）
 *  2. 灌進 store 後，10,000 敵人 + 100 塔不會把 grid / towers 的一致性弄壞
 *     （這正是上一輪把 tile 改成只存 towerId 之後加的不變式）
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildStressEnemies,
  buildStressTowers,
  pickStressTowerPositions,
  resolvePathChain,
  STRESS_DEFAULT_ENEMIES,
  STRESS_DEFAULT_TOWERS,
  STRESS_ENEMY_ID_PREFIX,
  STRESS_TOWER_ID_PREFIX,
} from '@/data/stressTest';
import { DEFAULT_PATH, DIFFICULTY_MODIFIERS, PATHS } from '@/data/gameData';
import { findTowerOverlaps } from '@/test/contracts/gridTowerMismatches';
import { pathClearance, pathWidthOf, sampleBuildablePoints } from '@/data/mapGeometry';
import { useGameStore } from '@/store/gameStore';

const setupMatch = () => {
  useGameStore.setState({
    scene: 'game',
    selectedPath: DEFAULT_PATH,
    activeMap: PATHS[DEFAULT_PATH] ?? null,
    towers: [],
    enemies: [],
    projectiles: [],
    money: 10_000,
    currentWave: 5,
    selectedTowerType: 'basic',
    selectedTower: null,
    multiSelectedTowerIds: [],
    difficultyModifiers: DIFFICULTY_MODIFIERS.normal,
    waveActive: false,
    isGameOver: false,
    placementHistory: [],
    placementHistoryIndex: -1,
    upgradeHistory: [],
    upgradeStats: { totalUpgrades: 0, totalSpent: 0, maxLevelReached: 1 },
    placementStats: { totalPlaced: 0, totalSold: 0, totalSpent: 0 },
    protocolNextTowerDiscount: 0,
  });
  return grid;
};

describe('壓測資料建構器', () => {
  it('沿途徑均勻生成 10,000 隻敵人，id 唯一且都還在路上', () => {
    const path = PATHS[DEFAULT_PATH];
    const enemies = buildStressEnemies({ count: STRESS_DEFAULT_ENEMIES, path });

    expect(enemies).toHaveLength(STRESS_DEFAULT_ENEMIES);
    expect(new Set(enemies.map((e) => e.id)).size).toBe(enemies.length);
    expect(enemies.every((e) => e.id.startsWith(STRESS_ENEMY_ID_PREFIX))).toBe(true);

    const lastIndex = path.waypoints.length - 2;
    for (const enemy of enemies) {
      // updateEnemies 會把 pathIndex >= 終點索引的敵人判定成「已逃漏」直接移除，
      // 所以壓測敵人必須嚴格留在最後一段之前
      expect(enemy.pathIndex).toBeGreaterThanOrEqual(0);
      expect(enemy.pathIndex).toBeLessThanOrEqual(lastIndex);
      expect(enemy.progress).toBeGreaterThanOrEqual(0);
      expect(enemy.progress).toBeLessThan(1);
      expect(enemy.health).toBeGreaterThan(0);
    }

    // 速度必須遠低於正常敵人，否則一瞬間就衝進基地把局面結束掉
    expect(Math.max(...enemies.map((e) => e.speed))).toBeLessThanOrEqual(0.1);
  });

  it('count = 0 或地圖沒有路徑時回傳空陣列（不炸）', () => {
    expect(buildStressEnemies({ count: 0, path: PATHS[DEFAULT_PATH] })).toEqual([]);
    expect(buildStressEnemies({ count: 100, path: undefined })).toEqual([]);
    expect(resolvePathChain(undefined).waypoints).toEqual([]);
  });

  it('只挑可建造點（不壓路徑）且不重複', () => {
    const positions = sampleBuildablePoints(PATHS[DEFAULT_PATH], STRESS_DEFAULT_TOWERS);

    expect(positions.length).toBeGreaterThan(0);
    expect(positions.length).toBeLessThanOrEqual(STRESS_DEFAULT_TOWERS);
    expect(new Set(positions.map((p) => `${p.x},${p.y}`)).size).toBe(positions.length);

    for (const pos of positions) {
      expect(pathClearance(PATHS[DEFAULT_PATH], pos)).toBeGreaterThan(pathWidthOf(PATHS[DEFAULT_PATH]) / 2);
    }
  });

  it('生成的塔 id 帶前綴、座標正確、等級 1', () => {
    const positions = [{ x: 1.5, y: 1.5 }, { x: 2.5, y: 2.5 }];
    const towers = buildStressTowers(positions);

    expect(towers).toHaveLength(2);
    towers.forEach((tower, i) => {
      expect(tower.id.startsWith(STRESS_TOWER_ID_PREFIX)).toBe(true);
      expect(tower.pos).toEqual(positions[i]);
      expect(tower.level).toBe(1);
      expect(tower.health).toBe(tower.maxHealth);
    });
  });
});

describe('壓測灌進 store', () => {
  beforeEach(() => {
    setupMatch();
  });

  it('一鍵灌入 10,000 敵人 + 100 塔，grid 與 towers 仍然一致', () => {
    const result = useGameStore.getState().spawnStressEntities(
      STRESS_DEFAULT_ENEMIES,
      STRESS_DEFAULT_TOWERS,
    );

    expect(result.reason).toBeUndefined();
    expect(result.enemies).toBe(STRESS_DEFAULT_ENEMIES);
    expect(result.towers).toBe(STRESS_DEFAULT_TOWERS);

    const state = useGameStore.getState();
    expect(state.enemies).toHaveLength(STRESS_DEFAULT_ENEMIES);
    expect(state.towers).toHaveLength(STRESS_DEFAULT_TOWERS);
    expect(state.waveActive).toBe(false);
    expect(findTowerOverlaps(state.towers)).toEqual([]);
  });

  it('清除只會帶走壓測實體，玩家自己放的塔留著', () => {
    const spot = sampleBuildablePoints(PATHS[DEFAULT_PATH], 1)[0];

    useGameStore.setState({ selectedTowerType: 'basic' });
    expect(useGameStore.getState().placeTower(spot)).toBe(true);
    const manualTowerId = useGameStore.getState().towers[0].id;

    useGameStore.getState().spawnStressEntities(1000, 20);
    expect(useGameStore.getState().towers.length).toBe(21);

    const cleared = useGameStore.getState().clearStressEntities();

    const state = useGameStore.getState();
    expect(cleared.towers).toBe(1);
    expect(state.towers).toHaveLength(1);
    expect(state.towers[0].id).toBe(manualTowerId);
    expect(state.enemies).toHaveLength(0);
    expect(findTowerOverlaps(state.towers)).toEqual([]);
  });

  it('不在遊戲場景時拒絕灌入（回報原因，不改狀態）', () => {
    useGameStore.setState({ scene: 'mainMenu', enemies: [], towers: [] });

    const result = useGameStore.getState().spawnStressEntities(1000, 10);

    expect(result.reason).toBe('not-in-game');
    expect(useGameStore.getState().enemies).toHaveLength(0);
    expect(useGameStore.getState().towers).toHaveLength(0);
  });

  it('countStressEntities 只算壓測實體', () => {
    const grid = useGameStore.getState().grid;
    const emptyTile = grid.flat().find((t) => t.type === 'empty')!;
    useGameStore.setState({ selectedTowerType: 'basic' });
    useGameStore.getState().placeTower({ col: emptyTile.col, row: emptyTile.row });

    useGameStore.getState().spawnStressEntities(500, 10);

    const counts = useGameStore.getState().countStressEntities();
    expect(counts.enemies).toBe(500);
    expect(counts.towers).toBe(10);
  });
});
