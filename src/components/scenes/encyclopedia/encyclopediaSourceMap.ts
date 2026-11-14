/**
 * 圖鑑 · 遊戲資料分頁與原始碼檔案對應（反向連結）
 */

import mapSources from './encyclopediaMapSources.json';
import type { TabType } from './EncyclopediaTypes';

/** 可從圖鑑詳情跳轉到檔案庫的分頁 */
export type EncyclopediaDataTab = Exclude<TabType, 'stats' | 'icons' | 'files'>;

const TAB_BASE_SOURCES: Record<EncyclopediaDataTab, string[]> = {
  towers: [
    'src/data/gameData/towerData.ts',
    'src/data/upgradeBranches.ts',
    'src/components/game/TowerModels.ts',
    'src/components/scenes/game-scene/three/towerModels3d.ts',
  ],
  enemies: [
    'src/data/gameData/enemyData.ts',
    'src/utils/enemyRenderer.ts',
  ],
  maps: [
    'src/data/gameData/pathData.ts',
  ],
  difficulty: [
    'src/data/gameData/waveData.ts',
  ],
  effects: [
    'src/data/gameData/enemyData.ts',
    'src/components/scenes/encyclopedia/EncyclopediaIcons.tsx',
  ],
  skills: [
    'src/data/playerSkillData.ts',
    'src/components/scenes/encyclopedia/EncyclopediaIcons.tsx',
  ],
};

const MAP_SOURCE_INDEX = mapSources as Record<string, string>;

/** 取得圖鑑分頁對應的原始碼檔案路徑（去重） */
export function getEncyclopediaSourceFiles(
  tab: EncyclopediaDataTab,
  itemId?: string,
): string[] {
  const paths = [...TAB_BASE_SOURCES[tab]];

  if (tab === 'maps' && itemId) {
    const mapFile = MAP_SOURCE_INDEX[itemId];
    if (mapFile && !paths.includes(mapFile)) paths.push(mapFile);
  }

  return [...new Set(paths)];
}

/** 地圖 id 對應的 paths 子檔案 */