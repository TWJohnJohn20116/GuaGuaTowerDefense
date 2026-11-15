/**
 * .ggmod → 工坊資料（純函式）
 *
 * 封包的專案資料放在 project.data（levels／winConditions／assetRefs／progress），
 * 這裡只做「型別守衛 + 轉回 Workshop 形狀」，不碰 store；寫入由 UI 決定。
 */
import type { AssetRef, WinCondition, WorkshopAsset, WorkshopLevel, WorkshopProject } from '@/types/workshop';
import type { GgmodAssetSnapshot, GgmodFile } from './format';

const LICENSES: WorkshopProject['license'][] = ['all-rights-reserved', 'cc-by-4.0', 'cc-by-sa-4.0', 'cc0-1.0', 'mit'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAssetRef(value: unknown): value is AssetRef {
  return isRecord(value) && typeof value.assetId === 'string' && typeof value.version === 'string';
}

export function assetSnapshotToWorkshop(asset: GgmodAssetSnapshot): WorkshopAsset {
  return {
    id: asset.assetId,
    kind: asset.kind,
    name: asset.name,
    version: asset.version,
    data: asset.data,
    dependsOn: asset.dependsOn.map((ref) => ref.assetId),
    updatedAt: Date.now(),
  } as WorkshopAsset;
}

export interface GgmodRestorePayload {
  /** 已換成新的專案 id（避免與本機既有專案撞號） */
  project: WorkshopProject;
  assets: WorkshopAsset[];
  completedLevels: string[];
}

export function restoreFromGgmod(file: GgmodFile, newProjectId: string): GgmodRestorePayload {
  const data = isRecord(file.project.data) ? file.project.data : {};
  const levels = Array.isArray(data.levels) ? (data.levels as WorkshopLevel[]) : [];
  const winConditions = isRecord(data.winConditions) ? (data.winConditions as WinCondition) : undefined;
  const ruleSetRef = isAssetRef(data.ruleSetRef) ? data.ruleSetRef : null;
  const assetRefs = Array.isArray(data.assetRefs) ? data.assetRefs.filter(isAssetRef) : [];
  const progress = Array.isArray(data.progress)
    ? data.progress.filter((id): id is string => typeof id === 'string')
    : [];
  const license = LICENSES.includes(file.project.license as WorkshopProject['license'])
    ? (file.project.license as WorkshopProject['license'])
    : 'all-rights-reserved';

  return {
    project: {
      id: newProjectId,
      name: file.project.name,
      description: file.project.description,
      thumbnail: '',
      version: file.project.version,
      author: file.project.author,
      license,
      signature: file.signature,
      ruleSetRef,
      winConditions,
      assetRefs,
      levels,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    assets: file.assets.map(assetSnapshotToWorkshop),
    completedLevels: progress.filter((levelId) => levels.some((level) => level.id === levelId)),
  };
}
