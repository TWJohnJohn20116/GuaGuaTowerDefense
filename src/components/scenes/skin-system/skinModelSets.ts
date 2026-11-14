/**
 * 皮膚模型套裝 · 共用工具
 */
import { ALL_SKINS } from '@/data/skinData';
import { getAllSkinModelSets, getSkinModelSet } from '@/data/skins/skinModelLibrary';
import type { TowerSkin } from '@/types/skin';

export interface SkinModelSetSummary {
  id: string;
  name: string;
  description: string;
  skins: TowerSkin[];
  unlockedCount: number;
  totalCount: number;
}

export function getSkinsByModelSet(modelSetId: string): TowerSkin[] {
  return ALL_SKINS.filter((s) => !s.hidden && s.modelSet === modelSetId);
}

export function buildModelSetSummaries(
  isSkinUnlocked: (id: string) => boolean,
): SkinModelSetSummary[] {
  return getAllSkinModelSets().map((set) => {
    const skins = getSkinsByModelSet(set.id);
    const unlockedCount = skins.filter((s) => isSkinUnlocked(s.id)).length;
    return {
      id: set.id,
      name: set.name,
      description: set.description,
      skins,
      unlockedCount,
      totalCount: skins.length,
    };
  }).filter((s) => s.totalCount > 0);
}

export function getModelSetForSkin(skin: TowerSkin): SkinModelSetSummary | null {
  if (!skin.modelSet) return null;
  const meta = getSkinModelSet(skin.modelSet);
  if (!meta) return null;
  const skins = getSkinsByModelSet(skin.modelSet);
  return {
    id: meta.id,
    name: meta.name,
    description: meta.description,
    skins,
    unlockedCount: 0,
    totalCount: skins.length,
  };
}
