// 塔資產 → 引擎的 CustomTowerData。
//
// 純函式：只做欄位搬移（去掉 baseType、補 modelType 預設），不碰 store／React。
// 產出的 id 一律走 runtimeAssetId，避免兩個專案的同名塔在引擎端撞號。

import type { CustomTowerData } from '@/types/game';
import type { WorkshopAssetProvenance, WorkshopTowerAsset } from '@/types/workshop';
import { runtimeAssetId } from '@/workshop/ids';

interface CompiledTower {
  tower: CustomTowerData;
  provenance: WorkshopAssetProvenance;
}

export function compileTower(projectId: string, asset: WorkshopTowerAsset): CompiledTower {
  const { baseType, ...rest } = asset.data;
  const id = runtimeAssetId(projectId, asset.id);
  const tower: CustomTowerData = {
    id,
    modId: projectId,
    name: asset.name,
    description: asset.description ?? '',
    ...rest,
    // 沒指定模型時沿用基底塔型，3D／2D 外觀才不會開天窗
    modelType: rest.modelType ?? baseType,
    // 自訂升級分支原樣透傳（未設定時維持 undefined，引擎回退官方分支表）
    upgradeBranches: rest.upgradeBranches,
  };
  return {
    tower,
    provenance: { runtimeId: id, assetId: asset.id, version: asset.version, kind: 'tower' },
  };
}
