/**
 * 圖鑑 · 精選檔案說明擴充（成就 / 戰役 / 皮膚 / 場景）
 * 說明文案已移至 i18n encyclopedia.fileMetaExtra
 */

import type { FileMetaEntry } from './encyclopediaFileMeta';

/** 合併至 FILE_META 的擴充條目（僅 path 與 relatedTab） */
export const FILE_META_EXTRA: Record<string, FileMetaEntry> = {
  'src/data/achievements/progressAchievements.ts': { description: '' },
  'src/data/achievements/challengeAchievements.ts': { description: '' },
  'src/data/achievements/specialAchievements.ts': { description: '' },
  'src/data/achievements/worldAchievements.ts': { description: '' },
  'src/data/achievements/bonusAchievements.ts': { description: '' },
  'src/data/achievements/playstyleIsms.ts': { description: '' },
  'src/components/scenes/Achievements.tsx': { description: '' },
  'src/components/scenes/PathSelection.tsx': { description: '' },
  'src/data/skins/attackTowerSkins.ts': { description: '' },
  'src/data/skins/elementalTowerSkins.ts': { description: '' },
  'src/data/skins/specialTowerSkins.ts': { description: '' },
  'src/data/skins/utilityTowerSkins.ts': { description: '' },
  'src/data/skins/skinModelLibrary.ts': { description: '' },
  'src/components/scenes/Skins.tsx': { description: '' },
  'src/store/skinStore.ts': { description: '' },
  'src/components/scenes/Shop.tsx': { description: '' },
  'src/store/shopStore.ts': { description: '' },
  'src/components/scenes/Replay.tsx': { description: '' },
  'src/store/replayStore.ts': { description: '' },
  'src/components/scenes/ModManager.tsx': { description: '' },
  'src/components/scenes/ModEditor.tsx': { description: '' },
  'src/data/sampleMods.ts': { description: '' },
  'src/components/scenes/TalentTree.tsx': { description: '' },
  'src/store/talentStore.ts': { description: '' },
  'src/components/scenes/Statistics.tsx': { description: '' },
  'src/services/audioService.ts': { description: '' },
  'src/components/scenes/Settings.tsx': { description: '' },
  'src/store/settingsStore.ts': { description: '' },
};
