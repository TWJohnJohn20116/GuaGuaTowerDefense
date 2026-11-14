/**
 * 圖鑑 · 檔案說明 path → i18n key 對照
 */

import type { Translations } from '@/i18n';

/** path → encyclopedia.fileMeta 的 key */
const FILE_META_PATH_KEYS: Record<string, keyof Translations['encyclopedia']['fileMeta']> = {
  'src/data/gameData/towerData.ts': 'towerData',
  'src/data/gameData/enemyData.ts': 'enemyData',
  'src/data/gameData/pathData.ts': 'pathData',
  'src/data/gameData/waveData.ts': 'waveData',
  'src/data/gameData/paths/easyPaths.ts': 'easyPaths',
  'src/data/gameData/paths/mediumPaths.ts': 'mediumPaths',
  'src/data/gameData/paths/hardPaths.ts': 'hardPaths',
  'src/data/gameData/paths/extremePaths.ts': 'extremePaths',
  'src/data/gameData/paths/hiddenPaths.ts': 'hiddenPaths',
  'src/data/playerSkillData.ts': 'playerSkillData',
  'src/data/upgradeBranches.ts': 'upgradeBranches',
  'src/data/memorialData.ts': 'memorialData',
  'src/data/skinData.ts': 'skinData',
  'src/data/achievementData.ts': 'achievementData',
  'src/types/game.ts': 'gameTypes',
  'src/types/achievement.ts': 'achievementTypes',
  'src/store/gameStore.ts': 'gameStore',
  'src/store/gameStoreActions.ts': 'gameStoreActions',
  'src/store/gameStoreWave.ts': 'gameStoreWave',
  'src/store/achievementStore.ts': 'achievementStore',
  'src/store/modStore.ts': 'modStore',
  'src/store/statsStore.ts': 'statsStore',
  'src/store/campaignStore.ts': 'campaignStore',
  'src/store/tutorialStore.ts': 'tutorialStore',
  'src/store/gameLoop/updateTowers.ts': 'updateTowers',
  'src/store/gameLoop/updateEnemies.ts': 'updateEnemies',
  'src/store/gameLoop/updateProjectiles.ts': 'updateProjectiles',
  'src/components/scenes/GameScene.tsx': 'gameScene',
  'src/components/scenes/game-scene/GameCanvas.tsx': 'gameCanvas',
  'src/components/scenes/game-scene/three/GameScene3D.tsx': 'gameScene3D',
  'src/components/scenes/game-scene/three/towerModels3d.ts': 'towerModels3d',
  'src/components/game/TowerModels.ts': 'towerModels2d',
  'src/utils/enemyRenderer.ts': 'enemyRenderer',
  'src/components/scenes/Encyclopedia.tsx': 'encyclopediaScene',
  'src/components/scenes/encyclopedia/EncyclopediaTypes.ts': 'encyclopediaTypes',
  'src/components/scenes/encyclopedia/EncyclopediaIcons.tsx': 'encyclopediaIcons',
  'src/components/scenes/encyclopedia/gameIconRegistry.ts': 'gameIconRegistry',
  'src/components/scenes/encyclopedia/encyclopediaFileRegistry.ts': 'encyclopediaFileRegistry',
  'src/components/scenes/encyclopedia/FileLibraryPanel.tsx': 'fileLibraryPanel',
  'src/components/ui/Icons.tsx': 'iconsLib',
  'src/components/ui/SceneShell.tsx': 'sceneShell',
  'src/components/ui/BackButton.tsx': 'backButton',
  'src/components/ui/PauseOverlay.tsx': 'pauseOverlay',
  'src/App.tsx': 'appRoot',
  'src/main.tsx': 'mainEntry',
};

/** path → encyclopedia.fileMetaExtra 的 key */
const FILE_META_EXTRA_PATH_KEYS: Record<string, keyof Translations['encyclopedia']['fileMetaExtra']> = {
  'src/data/achievements/progressAchievements.ts': 'progressAchievements',
  'src/data/achievements/challengeAchievements.ts': 'challengeAchievements',
  'src/data/achievements/specialAchievements.ts': 'specialAchievements',
  'src/data/achievements/worldAchievements.ts': 'worldAchievements',
  'src/data/achievements/bonusAchievements.ts': 'bonusAchievements',
  'src/data/achievements/playstyleIsms.ts': 'playstyleIsms',
  'src/components/scenes/Achievements.tsx': 'achievementsScene',
  'src/data/campaignData/index.ts': 'campaignIndex',
  'src/data/campaignData/utils.ts': 'campaignUtils',
  'src/components/scenes/PathSelection.tsx': 'pathSelectionScene',
  'src/components/scenes/path-selection/CampaignList.tsx': 'campaignList',
  'src/components/scenes/path-selection/CampaignDetail.tsx': 'campaignDetail',
  'src/data/skins/attackTowerSkins.ts': 'attackTowerSkins',
  'src/data/skins/elementalTowerSkins.ts': 'elementalTowerSkins',
  'src/data/skins/specialTowerSkins.ts': 'specialTowerSkins',
  'src/data/skins/utilityTowerSkins.ts': 'utilityTowerSkins',
  'src/data/skins/skinModelLibrary.ts': 'skinModelLibrary',
  'src/components/scenes/Skins.tsx': 'skinsScene',
  'src/store/skinStore.ts': 'skinStore',
  'src/data/dailyChallengeData.ts': 'dailyChallengeData',
  'src/data/mutatorChallengeData.ts': 'mutatorChallengeData',
  'src/components/scenes/Shop.tsx': 'shopScene',
  'src/store/shopStore.ts': 'shopStore',
  'src/components/scenes/Replay.tsx': 'replayScene',
  'src/store/replayStore.ts': 'replayStore',
  'src/components/scenes/ModManager.tsx': 'modManagerScene',
  'src/components/scenes/ModEditor.tsx': 'modEditorScene',
  'src/data/sampleMods.ts': 'sampleMods',
  'src/components/scenes/Memorial.tsx': 'memorialScene',
  'src/components/scenes/TalentTree.tsx': 'talentTreeScene',
  'src/store/talentStore.ts': 'talentStore',
  'src/components/scenes/Statistics.tsx': 'statisticsScene',
  'src/services/audioService.ts': 'audioService',
  'src/components/scenes/Settings.tsx': 'settingsScene',
  'src/store/settingsStore.ts': 'settingsStore',
};

export function resolveFileDescription(
  enc: Translations['encyclopedia'],
  path: string,
  fallback: string,
): string {
  const mainKey = FILE_META_PATH_KEYS[path];
  if (mainKey && enc.fileMeta?.[mainKey]) return enc.fileMeta[mainKey];
  const extraKey = FILE_META_EXTRA_PATH_KEYS[path];
  if (extraKey && enc.fileMetaExtra?.[extraKey]) return enc.fileMetaExtra[extraKey];
  return fallback;
}

/** @deprecated 使用 resolveFileDescription */
export function getFileMetaExtraDescription(
  enc: Translations['encyclopedia'],
  path: string,
  fallback: string,
): string {
  return resolveFileDescription(enc, path, fallback);
}

/** 替換模板中的 {name}、{hp} 等佔位符 */
export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}
