/**
 * 專案檔（.ggproject）— 可回到編輯狀態的存檔
 *
 * 與 .ggmod 的差別：.ggmod 是「發佈物」（快照、簽章、縮圖）；
 * .ggproject 是「工作檔」，保留專案與它用到的資產，匯入後可以直接繼續編輯。
 */
import type { WorkshopAsset, WorkshopProject } from '@/types/workshop';

export const PROJECT_FILE_MAGIC = 'ggproject';
export const PROJECT_FILE_VERSION = 1;

export interface ProjectFile {
  magic: typeof PROJECT_FILE_MAGIC;
  formatVersion: number;
  project: WorkshopProject;
  assets: WorkshopAsset[];
  savedAt: string;
}

/** 收集專案直接引用的資產（含專案層／關卡層／規則集依賴） */
export function collectProjectAssets(
  project: WorkshopProject,
  allAssets: readonly WorkshopAsset[],
): WorkshopAsset[] {
  const byId = new Map(allAssets.map((asset) => [asset.id, asset]));
  const wanted = new Set<string>();
  const visit = (assetId: string): void => {
    if (wanted.has(assetId)) return;
    const asset = byId.get(assetId);
    if (!asset) return;
    wanted.add(assetId);
    for (const dependency of asset.dependsOn ?? []) visit(dependency);
  };

  for (const ref of project.assetRefs ?? []) visit(ref.assetId);
  if (project.ruleSetRef) visit(project.ruleSetRef.assetId);
  for (const level of project.levels) {
    if (level.mapAssetId) visit(level.mapAssetId);
    if (level.ruleSetRef) visit(level.ruleSetRef.assetId);
    for (const ref of level.towerRefs ?? []) visit(ref.assetId);
    for (const ref of level.scriptRefs ?? []) visit(ref.assetId);
    for (const ref of level.artRefs ?? []) visit(ref.assetId);
  }

  return [...wanted].map((id) => byId.get(id)).filter((asset): asset is WorkshopAsset => Boolean(asset));
}

export function exportProjectFile(project: WorkshopProject, allAssets: readonly WorkshopAsset[]): string {
  const file: ProjectFile = {
    magic: PROJECT_FILE_MAGIC,
    formatVersion: PROJECT_FILE_VERSION,
    project,
    assets: collectProjectAssets(project, allAssets),
    savedAt: new Date().toISOString(),
  };
  return JSON.stringify(file, null, 2);
}

export type ParseProjectFileResult =
  | { ok: true; file: ProjectFile }
  | { ok: false; reason: 'notJson' | 'magic' | 'version' | 'schema' };

export function parseProjectFile(json: string): ParseProjectFileResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, reason: 'notJson' };
  }
  if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'schema' };
  const record = raw as Record<string, unknown>;
  if (record.magic !== PROJECT_FILE_MAGIC) return { ok: false, reason: 'magic' };
  if (typeof record.formatVersion !== 'number' || record.formatVersion > PROJECT_FILE_VERSION) {
    return { ok: false, reason: 'version' };
  }
  if (typeof record.project !== 'object' || record.project === null || !Array.isArray(record.assets)) {
    return { ok: false, reason: 'schema' };
  }
  return { ok: true, file: record as unknown as ProjectFile };
}
