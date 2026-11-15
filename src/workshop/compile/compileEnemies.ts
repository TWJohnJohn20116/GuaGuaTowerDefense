// 敵人資產 → 引擎的 CustomEnemyData，並提供「是不是內建 EnemyType」的判定。
//
// 內建清單直接取 ENEMY_DATA 的 key：資料層是唯一真相，不在編譯器手抄 union，
// 敵人新增時這裡自動跟上。判定用 hasOwnProperty，避免原型鏈上的名稱誤判。

import type { CustomEnemyData } from '@/types/game';
import type { WorkshopAssetProvenance, WorkshopEnemyAsset } from '@/types/workshop';
import { ENEMY_DATA } from '@/data/gameData/enemyData';
import { runtimeAssetId } from '@/workshop/ids';

/** 內建敵人類型（ENEMY_DATA 的 key；模組載入時算一次） */
const BUILTIN_ENEMY_TYPES: ReadonlySet<string> = new Set(Object.keys(ENEMY_DATA));

/** 波次 enemies[].type 是內建 EnemyType 嗎？（不是資產 id 的那一半） */
export function isBuiltinEnemyType(type: string): boolean {
  return BUILTIN_ENEMY_TYPES.has(type) && Object.prototype.hasOwnProperty.call(ENEMY_DATA, type);
}

interface CompiledEnemy {
  enemy: CustomEnemyData;
  provenance: WorkshopAssetProvenance;
}

export function compileEnemy(projectId: string, asset: WorkshopEnemyAsset): CompiledEnemy {
  const { baseType, ...rest } = asset.data;
  const id = runtimeAssetId(projectId, asset.id);
  const enemy: CustomEnemyData = {
    id,
    modId: projectId,
    name: asset.name,
    description: asset.description ?? '',
    ...rest,
    // 沒指定模型時沿用基底敵人型，沿用引擎既有的走路／外觀行為
    modelType: rest.modelType ?? baseType,
  };
  return {
    enemy,
    provenance: { runtimeId: id, assetId: asset.id, version: asset.version, kind: 'enemy' },
  };
}
