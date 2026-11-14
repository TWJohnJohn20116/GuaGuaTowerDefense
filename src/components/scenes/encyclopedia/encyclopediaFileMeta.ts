/**
 * 圖鑑 · 精選檔案說明與分頁關聯（第三階段：擴充 FILE_META）
 * 說明文案已移至 i18n encyclopedia.fileMeta
 */

import type { TabType } from './EncyclopediaTypes';

export interface FileMetaEntry {
  description: string;
  relatedTab?: TabType;
}

/** 手寫說明覆蓋自動推斷；relatedTab 用於檔案庫跳轉圖鑑分頁 */
export const FILE_META: Record<string, FileMetaEntry> = {
  'src/data/gameData/towerData.ts': { description: '', relatedTab: 'towers' },
  'src/data/gameData/enemyData.ts': { description: '', relatedTab: 'enemies' },
  'src/data/gameData/pathData.ts': { description: '', relatedTab: 'maps' },
  'src/data/gameData/waveData.ts': { description: '', relatedTab: 'difficulty' },
  'src/data/gameData/index.ts': { description: '', relatedTab: 'towers' },
  'src/data/gameData/paths/easyPaths.ts': { description: '', relatedTab: 'maps' },
  'src/data/gameData/paths/mediumPaths.ts': { description: '', relatedTab: 'maps' },
  'src/data/gameData/paths/extraMediumPaths.ts': { description: '', relatedTab: 'maps' },
  'src/data/gameData/paths/hardPaths.ts': { description: '', relatedTab: 'maps' },
  'src/data/gameData/paths/extraHardPaths.ts': { description: '', relatedTab: 'maps' },
  'src/data/gameData/paths/extraHardPaths2.ts': { description: '', relatedTab: 'maps' },
  'src/data/gameData/paths/extremePaths.ts': { description: '', relatedTab: 'maps' },
  'src/data/gameData/paths/extraExtremePaths.ts': { description: '', relatedTab: 'maps' },
  'src/data/gameData/paths/extraExtremePaths2.ts': { description: '', relatedTab: 'maps' },
  'src/data/gameData/paths/hiddenPaths.ts': { description: '', relatedTab: 'maps' },
  'src/data/playerSkillData.ts': { description: '', relatedTab: 'skills' },
  'src/data/upgradeBranches.ts': { description: '', relatedTab: 'towers' },
  'src/data/memorialData.ts': { description: '' },
  'src/data/skinData.ts': { description: '' },
  'src/data/achievementData.ts': { description: '' },
  'src/types/game.ts': { description: '' },
  'src/types/achievement.ts': { description: '' },
  'src/store/gameStore.ts': { description: '' },
  'src/store/gameStoreActions.ts': { description: '' },
  'src/store/gameStoreWave.ts': { description: '' },
  'src/store/achievementStore.ts': { description: '' },
  'src/store/modStore.ts': { description: '' },
  'src/store/statsStore.ts': { description: '' },
  'src/store/campaignStore.ts': { description: '' },
  'src/store/tutorialStore.ts': { description: '' },
  'src/store/gameLoop/updateTowers.ts': { description: '' },
  'src/store/gameLoop/updateEnemies.ts': { description: '' },
  'src/store/gameLoop/updateProjectiles.ts': { description: '' },
  'src/components/scenes/GameScene.tsx': { description: '' },
  'src/components/scenes/game-scene/GameCanvas.tsx': { description: '' },
  'src/components/scenes/game-scene/three/GameScene3D.tsx': { description: '' },
  'src/components/scenes/game-scene/three/towerModels3d.ts': { description: '', relatedTab: 'towers' },
  'src/components/game/TowerModels.ts': { description: '', relatedTab: 'towers' },
  'src/utils/enemyRenderer.ts': { description: '', relatedTab: 'enemies' },
  'src/components/scenes/Encyclopedia.tsx': { description: '', relatedTab: 'files' },
  'src/components/scenes/encyclopedia/EncyclopediaTypes.ts': { description: '', relatedTab: 'files' },
  'src/components/scenes/encyclopedia/EncyclopediaIcons.tsx': { description: '', relatedTab: 'icons' },
  'src/components/scenes/encyclopedia/gameIconRegistry.ts': { description: '', relatedTab: 'icons' },
  'src/components/scenes/encyclopedia/encyclopediaFileRegistry.ts': { description: '', relatedTab: 'files' },
  'src/components/scenes/encyclopedia/FileLibraryPanel.tsx': { description: '', relatedTab: 'files' },
  'src/components/ui/Icons.tsx': { description: '', relatedTab: 'icons' },
  'src/components/ui/SceneShell.tsx': { description: '' },
  'src/components/ui/BackButton.tsx': { description: '' },
  'src/components/ui/PauseOverlay.tsx': { description: '' },
  'src/App.tsx': { description: '' },
  'src/main.tsx': { description: '' },
};
