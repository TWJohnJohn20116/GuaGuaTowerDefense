// 新工坊的 id 產生器與執行期 id 命名。
//
// 工坊內部 id 一律前綴化（project_ / level_ / tower_ …），執行期 id 再由
// runtimeAssetId 把專案 id 併進去，避免兩個專案的同名資產在引擎端撞號。

import type { WorkshopAssetKind } from '@/types/workshop';

export type WorkshopIdPrefix =
  | 'project'
  | 'level'
  | 'wave'
  | 'rule'
  | 'node'
  | 'tower'
  | 'enemy'
  | 'map'
  | 'ruleSet'
  | 'script'
  | 'art';

let idCounter = 0;

/** 產生工坊 id：前綴 + 時間戳 + 序號 + 隨機尾碼 */
export function createWorkshopId(prefix: WorkshopIdPrefix): string {
  idCounter = (idCounter + 1) % 1000000;
  const stamp = Date.now().toString(36);
  const seq = idCounter.toString(36).padStart(3, '0');
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${stamp}${seq}${rand}`;
}

/** 資產 kind → id 前綴（新建資產時用） */
export function assetIdPrefix(kind: WorkshopAssetKind): WorkshopIdPrefix {
  switch (kind) {
    case 'tower':
      return 'tower';
    case 'enemy':
      return 'enemy';
    case 'map':
      return 'map';
    case 'ruleSet':
      return 'ruleSet';
    case 'script':
      return 'script';
    case 'art':
      return 'art';
  }
}

/**
 * 執行期 id：引擎看到的 CustomTowerData／CustomEnemyData id。
 *
 * 專案 id 一起入名，兩個專案各自引用同名資產時仍不會互相覆蓋；
 * 編譯器產生的波次 type 也必須用同一個函式，否則波次會指向不存在的敵人。
 */
export function runtimeAssetId(projectId: string, assetId: string): string {
  return `${projectId}.${assetId}`;
}
