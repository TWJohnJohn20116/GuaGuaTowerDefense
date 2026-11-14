/**
 * 格子 ↔ 塔清單的雙向一致性檢查（**測試專用**，TD-11）
 *
 * 原本住在 `src/store/gridTower.ts`：正式碼從來沒呼叫它，只有
 * `treeTest` 類的兩支測試用（`stressTest.test.ts`、`towerGridConsistency.test.ts`），
 * 放在 store 裡等於告訴所有人「這是公共 API」，實際只是測試的斷言工具。
 *
 * 這裡刻意 import 正式碼的 `towerIdAt`：檢查器與被檢查的讀取路徑要一致，
 * 否則「格子讀法」一旦改掉，測試會變成在驗自己另外寫的一套邏輯。
 */
import type { Grid } from '@/store/gridTower';
import { towerIdAt } from '@/store/gridTower';
import type { Tower } from '@/types/game';

/** 回傳空陣列代表一致；否則每條字串是一個具體的不一致 */
export const findGridTowerMismatches = (grid: Grid, towers: readonly Tower[]): string[] => {
  const problems: string[] = [];
  const byId = new Map(towers.map((t) => [t.id, t] as const));

  for (const row of grid) {
    for (const tile of row) {
      if (!tile.towerId) continue;
      const tower = byId.get(tile.towerId);
      if (!tower) {
        problems.push(`格子 (${tile.col},${tile.row}) 指向不存在的塔 ${tile.towerId}`);
        continue;
      }
      if (tower.gridPos.col !== tile.col || tower.gridPos.row !== tile.row) {
        problems.push(
          `格子 (${tile.col},${tile.row}) 指向的塔 ${tower.id} 實際在 (${tower.gridPos.col},${tower.gridPos.row})`,
        );
      }
    }
  }

  for (const tower of towers) {
    const id = towerIdAt(grid, tower.gridPos);
    if (id !== tower.id) {
      problems.push(
        `塔 ${tower.id} 位於 (${tower.gridPos.col},${tower.gridPos.row})，但該格登記的是 ${id ?? '空'}`,
      );
    }
  }

  return problems;
};
