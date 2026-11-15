/**
 * Mod 匯入內容合併工具
 */
import type { Mod, CustomTowerData, CustomEnemyData, CustomMapData, CustomWaveData } from '@/types/game';
import type { CustomScriptData } from '@/types/modScript';

export type ImportMergeMode = 'replace' | 'merge';

function regenId(prefix = 'item'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

interface MergedImportContent {
  towers: CustomTowerData[];
  enemies: CustomEnemyData[];
  maps: CustomMapData[];
  waves: CustomWaveData[];
  scripts: CustomScriptData[];
}

export function mergeModImportContent(
  current: MergedImportContent,
  incoming: Mod['content'],
  mode: ImportMergeMode,
  generateId: (prefix?: string) => string = regenId,
): MergedImportContent {
  if (mode === 'replace') {
    return {
      towers: (incoming.towers ?? []).map((t) => ({ ...t, id: generateId() })),
      enemies: (incoming.enemies ?? []).map((e) => ({ ...e, id: generateId() })),
      maps: (incoming.maps ?? []).map((m) => ({ ...m, id: generateId() })),
      waves: (incoming.waves ?? []).map((w) => ({ ...w, id: generateId() })),
      scripts: (incoming.scripts ?? []).map((s) => ({ ...s, id: generateId() })),
    };
  }

  return {
    towers: [
      ...current.towers,
      ...(incoming.towers ?? []).map((t) => ({ ...t, id: generateId() })),
    ],
    enemies: [
      ...current.enemies,
      ...(incoming.enemies ?? []).map((e) => ({ ...e, id: generateId() })),
    ],
    maps: [
      ...current.maps,
      ...(incoming.maps ?? []).map((m) => ({ ...m, id: generateId() })),
    ],
    waves: [
      ...current.waves,
      ...(incoming.waves ?? []).map((w) => ({ ...w, id: generateId() })),
    ],
    scripts: [
      ...current.scripts,
      ...(incoming.scripts ?? []).map((s) => ({ ...s, id: generateId() })),
    ],
  };
}

export function detectImportConflict(
  parsed: Mod,
  installedModIds: string[],
  editingModId: string | null,
): boolean {
  return !!(
    parsed.metadata?.id &&
    installedModIds.includes(parsed.metadata.id) &&
    parsed.metadata.id !== editingModId
  );
}
