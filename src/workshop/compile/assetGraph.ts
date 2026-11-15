// 資產引用圖：誰引用了哪個資產、編譯要抓哪些資產。
//
// 純函式、只依賴型別；store 用它判斷「刪除是否被阻擋」，編譯器用它蒐集來源。

import type {
  AssetRef,
  WorkshopAsset,
  WorkshopProject,
  WorkshopRule,
  WorkshopRuleOverride,
} from '@/types/workshop';

export type WorkshopReferenceVia = 'map' | 'ruleSet' | 'tower' | 'enemy' | 'script' | 'art' | 'unknown';

export interface WorkshopAssetReference {
  assetId: string;
  projectId: string;
  levelId?: string;
  via: WorkshopReferenceVia;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** ruleOverrides 是 unknown[]，進編譯器前先過這道型別守衛 */
function isWorkshopRule(value: unknown): value is WorkshopRule {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || value.id.length === 0) return false;
  if (typeof value.name !== 'string') return false;
  if (typeof value.enabled !== 'boolean') return false;
  if (!isRecord(value.condition) || typeof value.condition.trigger !== 'string') return false;
  if (!Array.isArray(value.actions)) return false;
  return value.actions.every((action) => isRecord(action) && typeof action.kind === 'string');
}

/** 讀出關卡層規則覆寫；形狀不合的項目直接丟棄（呼叫端負責回 warning） */
export function readRuleOverrides(raw: unknown): WorkshopRuleOverride[] {
  if (!Array.isArray(raw)) return [];
  const overrides: WorkshopRuleOverride[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const ruleId = typeof item.ruleId === 'string' ? item.ruleId : null;
    if (item.rule === null) {
      overrides.push({ ruleId, rule: null });
      continue;
    }
    if (isWorkshopRule(item.rule)) overrides.push({ ruleId, rule: item.rule });
  }
  return overrides;
}

/** 誰引用了這個資產（刪除阻擋用） */
export function findAssetReferences(
  projects: readonly WorkshopProject[],
  assets: readonly WorkshopAsset[],
  assetId: string,
): WorkshopAssetReference[] {
  const kindById = new Map<string, WorkshopAsset['kind']>();
  for (const asset of assets) kindById.set(asset.id, asset.kind);

  const references: WorkshopAssetReference[] = [];

  const pushRef = (
    ref: AssetRef | null | undefined,
    projectId: string,
    levelId: string | undefined,
    via: WorkshopReferenceVia,
  ): void => {
    if (!ref || ref.assetId !== assetId) return;
    references.push(levelId === undefined ? { assetId, projectId, via } : { assetId, projectId, levelId, via });
  };

  for (const project of projects) {
    for (const ref of project.assetRefs) {
      pushRef(ref, project.id, undefined, kindById.get(ref.assetId) ?? 'unknown');
    }
    pushRef(project.ruleSetRef, project.id, undefined, 'ruleSet');

    for (const level of project.levels) {
      if (level.mapAssetId === assetId) {
        references.push({ assetId, projectId: project.id, levelId: level.id, via: 'map' });
      }
      pushRef(level.ruleSetRef, project.id, level.id, 'ruleSet');
      for (const ref of level.towerRefs ?? []) pushRef(ref, project.id, level.id, 'tower');
      for (const ref of level.scriptRefs ?? []) pushRef(ref, project.id, level.id, 'script');
      for (const ref of level.artRefs ?? []) pushRef(ref, project.id, level.id, 'art');

      for (const wave of level.waves) {
        for (const group of wave.enemies) {
          if (group.type === assetId) {
            references.push({ assetId, projectId: project.id, levelId: level.id, via: 'enemy' });
          }
        }
      }

      for (const override of readRuleOverrides(level.ruleOverrides)) {
        if (!override.rule) continue;
        for (const action of override.rule.actions) pushRef(action.scriptRef, project.id, level.id, 'script');
      }
    }
  }

  return references;
}

/** 哪些資產自己（透過 dependsOn／規則集內的腳本引用）依賴這個資產 */
export function findDependentAssetIds(assets: readonly WorkshopAsset[], assetId: string): string[] {
  const dependents = new Set<string>();

  for (const asset of assets) {
    if (asset.id === assetId) continue;
    if (asset.dependsOn?.includes(assetId)) {
      dependents.add(asset.id);
      continue;
    }
    if (asset.kind === 'ruleSet') {
      for (const rule of asset.data.rules) {
        for (const action of rule.actions) {
          if (action.scriptRef?.assetId === assetId) dependents.add(asset.id);
        }
      }
    }
  }

  return [...dependents];
}

/**
 * 專案實際碰到的資產 id（含波次裡的敵人 id）。
 *
 * 編譯器只把這批資產放進 Mod，避免把整個資產庫塞進執行期內容；
 * 其中「不是資產 id」的字串（內建 EnemyType）由編譯器另行判斷。
 */
export function collectProjectAssetIds(project: WorkshopProject): string[] {
  const ids = new Set<string>();

  for (const ref of project.assetRefs) ids.add(ref.assetId);
  if (project.ruleSetRef) ids.add(project.ruleSetRef.assetId);

  for (const level of project.levels) {
    if (level.mapAssetId) ids.add(level.mapAssetId);
    if (level.ruleSetRef) ids.add(level.ruleSetRef.assetId);
    for (const ref of level.towerRefs ?? []) ids.add(ref.assetId);
    for (const ref of level.scriptRefs ?? []) ids.add(ref.assetId);
    for (const ref of level.artRefs ?? []) ids.add(ref.assetId);

    for (const wave of level.waves) {
      for (const group of wave.enemies) ids.add(group.type);
    }

    for (const override of readRuleOverrides(level.ruleOverrides)) {
      if (!override.rule) continue;
      for (const action of override.rule.actions) {
        if (action.scriptRef) ids.add(action.scriptRef.assetId);
      }
    }
  }

  return [...ids];
}
