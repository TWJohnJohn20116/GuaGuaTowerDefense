/**
 * 塔的「雙份真相」行為測試
 *
 * 目前 grid[r][c].tower 與 state.towers 各存一份塔物件，全靠每個 action 手動雙寫。
 * 這支測試不關心實作細節（兩份或一份），只鎖定**外部可觀察的行為**：
 *   - 建造/升級/鎖定/出售後，金錢、等級、鎖定狀態正確
 *   - 任何時候「grid 上的塔」與「towers 陣列」必須完全對得上（雙向）
 * 重構（把 tile 改成只存 towerId）前後都必須綠。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { initializeGrid } from '@/store/gameStoreUtils';
import { findGridTowerMismatches } from '@/test/contracts/gridTowerMismatches';
import { DEFAULT_PATH, DIFFICULTY_MODIFIERS } from '@/data/gameData';
import type { GridPosition, Tile, Tower } from '@/types/game';

/** 從某個格子取出塔（重構前後都適用） */
const towerAt = (grid: Tile[][], pos: GridPosition): Tower | null => {
  const tile = grid[pos.row]?.[pos.col];
  if (!tile) return null;
  const legacy = (tile as Tile & { tower?: Tower | null }).tower;
  if (legacy) return legacy;
  const id = (tile as Tile & { towerId?: string | null }).towerId;
  if (!id) return null;
  return useGameStore.getState().towers.find((t) => t.id === id) ?? null;
};

const firstEmpty = (grid: Tile[][]): GridPosition => {
  for (const row of grid) {
    for (const tile of row) {
      if (tile.type === 'empty' && !towerAt(grid, { col: tile.col, row: tile.row })) {
        return { col: tile.col, row: tile.row };
      }
    }
  }
  throw new Error('no empty tile');
};

const resetMatch = () => {
  const grid = initializeGrid(DEFAULT_PATH);
  useGameStore.setState({
    grid,
    towers: [],
    enemies: [],
    projectiles: [],
    money: 10_000,
    currentWave: 5,
    selectedTowerType: 'basic',
    selectedTower: null,
    difficultyModifiers: DIFFICULTY_MODIFIERS.normal,
    placementHistory: [],
    placementHistoryIndex: -1,
    upgradeHistory: [],
    upgradeStats: { totalUpgrades: 0, totalSpent: 0, maxLevelReached: 1 },
    upgradeAnimations: [],
    placementStats: { totalPlaced: 0, totalSold: 0, totalSpent: 0 },
    protocolNextTowerDiscount: 0,
    fusionMode: false,
    fusionSourceId: null,
  });
  return grid;
};

/** 雙向一致性：grid 上每個塔都必須在 towers 裡，towers 每個塔都必須在它的格子上 */
const expectGridMatchesTowers = () => {
  const { grid, towers } = useGameStore.getState();
  const towerIds = new Set(towers.map((t) => t.id));

  for (const row of grid) {
    for (const tile of row) {
      const placed = towerAt(grid, { col: tile.col, row: tile.row });
      if (!placed) continue;
      expect(towerIds.has(placed.id), `格子 (${tile.col},${tile.row}) 上的塔 ${placed.id} 不在 towers 裡`).toBe(true);
      expect(placed.gridPos).toEqual({ col: tile.col, row: tile.row });
    }
  }

  for (const tower of towers) {
    const placed = towerAt(grid, tower.gridPos);
    expect(placed?.id, `塔 ${tower.id} 沒有出現在 grid (${tower.gridPos.col},${tower.gridPos.row})`).toBe(tower.id);
  }

  // 數量也必須一致（防止「一塔多格」或「幽靈格」）
  const occupied = grid.flat().filter((tile) => towerAt(grid, { col: tile.col, row: tile.row })).length;
  expect(occupied).toBe(towers.length);
};

describe('塔與格子的雙寫一致性', () => {
  beforeEach(() => {
    resetMatch();
  });

  it('建造：塔同時出現在 towers 與格子，金錢被扣', () => {
    const grid = useGameStore.getState().grid;
    const pos = firstEmpty(grid);
    const moneyBefore = useGameStore.getState().money;

    const ok = useGameStore.getState().placeTower(pos);

    expect(ok).toBe(true);
    const { towers } = useGameStore.getState();
    expect(towers).toHaveLength(1);

    const placed = towerAt(useGameStore.getState().grid, pos);
    expect(placed).not.toBeNull();
    expect(placed!.id).toBe(towers[0].id);
    expect(placed!.level).toBe(1);
    expect(useGameStore.getState().money).toBeLessThan(moneyBefore);
    expectGridMatchesTowers();
  });

  it('建造：同一格不能建第二次', () => {
    const pos = firstEmpty(useGameStore.getState().grid);
    expect(useGameStore.getState().placeTower(pos)).toBe(true);
    const snapshot = useGameStore.getState();

    expect(useGameStore.getState().placeTower(pos)).toBe(false);
    expect(useGameStore.getState().towers).toHaveLength(1);
    expect(useGameStore.getState().money).toBe(snapshot.money);
    expectGridMatchesTowers();
  });

  it('升級：towers 與格子上的等級一起變，且要選路線才能升到 2 級', () => {
    const pos = firstEmpty(useGameStore.getState().grid);
    useGameStore.getState().placeTower(pos);
    const tower = useGameStore.getState().towers[0];

    // 沒給路線 -> 拒絕
    expect(useGameStore.getState().upgradeTower(tower)).toBe(false);
    expect(useGameStore.getState().towers[0].level).toBe(1);

    expect(useGameStore.getState().upgradeTower(tower, 'A')).toBe(true);

    const upgraded = useGameStore.getState().towers[0];
    expect(upgraded.level).toBe(2);
    expect(upgraded.upgradePath).toBe('A');

    const onTile = towerAt(useGameStore.getState().grid, pos);
    expect(onTile!.level).toBe(2);
    expect(onTile!.upgradePath).toBe('A');
    expectGridMatchesTowers();
  });

  it('鎖定：towers 與格子同步，鎖定後不能出售', () => {
    const pos = firstEmpty(useGameStore.getState().grid);
    useGameStore.getState().placeTower(pos);
    const id = useGameStore.getState().towers[0].id;

    useGameStore.getState().toggleTowerLock(id);

    expect(useGameStore.getState().towers[0].locked).toBe(true);
    expect(towerAt(useGameStore.getState().grid, pos)!.locked).toBe(true);

    // 鎖定保護：sellTower 直接 return，塔還在
    useGameStore.getState().sellTower(useGameStore.getState().towers[0]);
    expect(useGameStore.getState().towers).toHaveLength(1);
    expectGridMatchesTowers();

    // 解鎖後可以賣
    useGameStore.getState().toggleTowerLock(id);
    expect(useGameStore.getState().towers[0].locked).toBe(false);
    expectGridMatchesTowers();
  });

  it('出售：towers 與格子同時清空，金錢回收', () => {
    const pos = firstEmpty(useGameStore.getState().grid);
    useGameStore.getState().placeTower(pos);
    const moneyAfterBuild = useGameStore.getState().money;
    const tower = useGameStore.getState().towers[0];

    useGameStore.getState().sellTower(tower);

    expect(useGameStore.getState().towers).toHaveLength(0);
    expect(towerAt(useGameStore.getState().grid, pos)).toBeNull();
    expect(useGameStore.getState().money).toBeGreaterThan(moneyAfterBuild);
    expectGridMatchesTowers();
  });

  it('重命名：兩邊都拿到新名字', () => {
    const pos = firstEmpty(useGameStore.getState().grid);
    useGameStore.getState().placeTower(pos);
    const id = useGameStore.getState().towers[0].id;

    useGameStore.getState().renameTower(id, '  前線哨塔  ');

    expect(useGameStore.getState().towers[0].customName).toBe('前線哨塔');
    expect(towerAt(useGameStore.getState().grid, pos)!.customName).toBe('前線哨塔');
    expectGridMatchesTowers();
  });

  it('連續操作後仍然雙向一致（建造→升級→鎖定→解鎖→出售）', () => {
    const grid = useGameStore.getState().grid;
    const positions = grid
      .flat()
      .filter((t) => t.type === 'empty')
      .slice(0, 3)
      .map((t) => ({ col: t.col, row: t.row }));

    // 非快速放置模式下每建一座塔就會清掉 selectedTowerType（真實 UX），所以每次都要重新選
    for (const pos of positions) {
      useGameStore.setState({ selectedTowerType: 'basic' });
      expect(useGameStore.getState().placeTower(pos)).toBe(true);
    }
    expect(useGameStore.getState().towers).toHaveLength(3);
    expectGridMatchesTowers();

    const [first, second] = useGameStore.getState().towers;
    useGameStore.getState().upgradeTower(first, 'B');
    useGameStore.getState().toggleTowerLock(second.id);
    useGameStore.getState().sellTower(useGameStore.getState().towers[2]);

    expect(useGameStore.getState().towers).toHaveLength(2);
    expectGridMatchesTowers();
  });

  it('撤銷 / 重做放置後格子不會留下孤兒 id', () => {
    const positions = useGameStore
      .getState()
      .grid.flat()
      .filter((t) => t.type === 'empty')
      .slice(0, 2)
      .map((t) => ({ col: t.col, row: t.row }));

    useGameStore.setState({ selectedTowerType: 'basic' });
    useGameStore.getState().placeTower(positions[0]);
    useGameStore.setState({ selectedTowerType: 'sniper' });
    useGameStore.getState().placeTower(positions[1]);
    expect(useGameStore.getState().towers).toHaveLength(2);
    expectGridMatchesTowers();

    expect(useGameStore.getState().undoPlacement()).toBe(true);
    expect(useGameStore.getState().towers).toHaveLength(1);
    expectGridMatchesTowers();
    expect(towerAt(useGameStore.getState().grid, positions[1])).toBeNull();

    expect(useGameStore.getState().redoPlacement()).toBe(true);
    expect(useGameStore.getState().towers).toHaveLength(2);
    expectGridMatchesTowers();
    expect(towerAt(useGameStore.getState().grid, positions[1])).not.toBeNull();
  });

  it('融合：兩個來源格清空、產物落在 source 格，且全程可解析', () => {
    const positions = useGameStore
      .getState()
      .grid.flat()
      .filter((t) => t.type === 'empty')
      .slice(0, 2)
      .map((t) => ({ col: t.col, row: t.row }));

    useGameStore.setState({ selectedTowerType: 'frost' });
    useGameStore.getState().placeTower(positions[0]);
    useGameStore.setState({ selectedTowerType: 'lightning' });
    useGameStore.getState().placeTower(positions[1]);

    const [source, target] = useGameStore.getState().towers;
    expect(useGameStore.getState().fuseTowers(source.id, target.id)).toBe(true);

    const { towers } = useGameStore.getState();
    expect(towers).toHaveLength(1);
    expect(towers[0].type).toBe('storm');
    expect(towers[0].gridPos).toEqual(positions[0]);

    expect(towerAt(useGameStore.getState().grid, positions[0])!.id).toBe(towers[0].id);
    expect(towerAt(useGameStore.getState().grid, positions[1])).toBeNull();
    expectGridMatchesTowers();
  });

  it('結構不變式檢查器本身抓得到髒資料（防止護欄失效）', () => {
    const pos = firstEmpty(useGameStore.getState().grid);
    useGameStore.getState().placeTower(pos);
    const { grid, towers } = useGameStore.getState();

    expect(findGridTowerMismatches(grid, towers)).toEqual([]);

    // 手動弄髒：格子指向不存在的塔
    const dirty = grid.map((row) => row.map((tile) => ({ ...tile })));
    dirty[pos.row][pos.col] = { ...dirty[pos.row][pos.col], towerId: 'ghost-tower' };
    expect(findGridTowerMismatches(dirty, towers).join('\n')).toMatch(/ghost-tower/);
  });
});
