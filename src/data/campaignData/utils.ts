import type { CampaignChapter, CampaignLevel } from '@/types/campaign';
import { PATHS } from '@/data/gameData';
import { chapter1 } from './chapter1';
import { chapter2 } from './chapter2';
import { chapter3 } from './chapter3';
import { chapter4 } from './chapter4';
import { chapter5 } from './chapter5';
import { chapter6 } from './chapter6';
import { chapter7 } from './chapter7';
import { chapter8 } from './chapter8';
import { chapter9 } from './chapter9';
import { chapter10 } from './chapter10';
import { chapter11 } from './chapter11';
import { chapter12 } from './chapter12';
import { chapter13 } from './chapter13';
import { chapter14 } from './chapter14';
import { chapter15 } from './chapter15';
import { chapter16 } from './chapter16';
import { chapter17 } from './chapter17';

export const CAMPAIGN_CHAPTERS: CampaignChapter[] = [chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8, chapter9, chapter10, chapter11, chapter12, chapter13, chapter14, chapter15, chapter16, chapter17];

export const FIRST_LEVEL_ID = chapter1.levels[0]?.id ?? 'ch1_tutorial';

export function getAllCampaignLevels(): CampaignLevel[] {
  return CAMPAIGN_CHAPTERS.flatMap((c) => c.levels);
}

export function findCampaignLevelById(levelId: string | undefined | null): CampaignLevel | undefined {
  if (!levelId) return undefined;
  for (const chapter of CAMPAIGN_CHAPTERS) {
    const found = chapter.levels.find((lv) => lv.id === levelId);
    if (found) return found;
  }
  return undefined;
}

export function findChapterByLevelId(levelId: string | undefined | null): CampaignChapter | undefined {
  if (!levelId) return undefined;
  return CAMPAIGN_CHAPTERS.find((c) => c.levels.some((lv) => lv.id === levelId));
}

export function getNextLevelId(currentLevelId: string): string | undefined {
  const allLevels = getAllCampaignLevels();
  const idx = allLevels.findIndex((lv) => lv.id === currentLevelId);
  if (idx === -1 || idx === allLevels.length - 1) return undefined;
  return allLevels[idx + 1].id;
}

export function isLastLevelOfChapter(levelId: string): boolean {
  const chapter = findChapterByLevelId(levelId);
  if (!chapter) return false;
  return chapter.levels[chapter.levels.length - 1]?.id === levelId;
}

export function isChapterCompleted(
  chapter: CampaignChapter,
  completedLevels: readonly string[],
): boolean {
  return chapter.levels.every((lv) => completedLevels.includes(lv.id));
}

export function countCompletedChapters(completedLevels: readonly string[]): number {
  return CAMPAIGN_CHAPTERS.filter((c) => isChapterCompleted(c, completedLevels)).length;
}

/** 把「這一關剛通關、存檔尚未寫入」的關卡一併計入章節進度 */
export function resolveChaptersCompleted(
  completedLevels: readonly string[],
  extraLevelId?: string | null,
): number {
  if (!extraLevelId || completedLevels.includes(extraLevelId)) {
    return countCompletedChapters(completedLevels);
  }
  return countCompletedChapters([...completedLevels, extraLevelId]);
}

/** 推薦下一關：首個已解鎖且未通關；若全通關則回傳最後解鎖關 */
export function getRecommendedCampaignLevelId(
  isLevelUnlocked: (levelId: string) => boolean,
  isLevelCompleted: (levelId: string) => boolean,
): string | undefined {
  const playable = getAllCampaignLevels().filter((lv) => PATHS[lv.mapId]);
  const nextIncomplete = playable.find(
    (lv) => isLevelUnlocked(lv.id) && !isLevelCompleted(lv.id),
  );
  if (nextIncomplete) return nextIncomplete.id;
  return playable.find((lv) => isLevelUnlocked(lv.id))?.id;
}

/** 推薦補星關：首個已通關但未滿 3 星 */
export function getRecommendedRetryLevelId(
  isLevelUnlocked: (levelId: string) => boolean,
  isLevelCompleted: (levelId: string) => boolean,
  levelStars: Record<string, number>,
): string | undefined {
  const playable = getAllCampaignLevels().filter((lv) => PATHS[lv.mapId]);
  return playable.find(
    (lv) =>
      isLevelUnlocked(lv.id) &&
      isLevelCompleted(lv.id) &&
      (levelStars[lv.id] ?? 0) < 3,
  )?.id;
}

/** 鎖定關卡的解鎖提示文案 */
export function getCampaignLevelUnlockHint(levelId: string): string {
  const all = getAllCampaignLevels();
  const idx = all.findIndex((lv) => lv.id === levelId);
  if (idx <= 0) return '請先完成前面的關卡才能挑戰此任務';
  const prev = all[idx - 1];
  return `請先完成「${prev.title}」（${prev.chapter}-${prev.level}）以解鎖`;
}

export interface CampaignProgressSummary {
  completedLevels: number;
  totalLevels: number;
  percent: number;
  totalStars: number;
  maxStars: number;
  completedChapters: number;
  totalChapters: number;
}

export function getCampaignProgressSummary(
  completedLevels: readonly string[],
  levelStars: Record<string, number>,
): CampaignProgressSummary {
  const playable = getAllCampaignLevels().filter((lv) => PATHS[lv.mapId]);
  const completedCount = playable.filter((lv) => completedLevels.includes(lv.id)).length;
  const totalLevels = playable.length;
  const totalStars = Object.values(levelStars).reduce((sum, s) => sum + s, 0);
  return {
    completedLevels: completedCount,
    totalLevels,
    percent: totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0,
    totalStars,
    maxStars: totalLevels * 3,
    completedChapters: countCompletedChapters(completedLevels),
    totalChapters: CAMPAIGN_CHAPTERS.length,
  };
}
