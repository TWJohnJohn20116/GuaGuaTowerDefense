import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FIRST_LEVEL_ID,
  getNextLevelId,
  findChapterByLevelId,
  findCampaignLevelById,
} from '@/data/campaignData/utils';

interface CampaignState {
  currentChapter: number;
  unlockedLevels: string[];
  completedLevels: string[];
  /** 每關獲得的最高星數 (1-3) */
  levelStars: Record<string, number>;

  unlockLevel: (levelId: string) => void;
  /** 完成關卡，stars 為本次取得的星數 (1-3)，會以最高值保留 */
  completeLevel: (levelId: string, stars?: number) => void;
  isLevelUnlocked: (levelId: string) => boolean;
  isLevelCompleted: (levelId: string) => boolean;
  /** 取得關卡星數 (0 = 未通關) */
  getLevelStars: (levelId: string) => number;
  /** 取得章節總星數 */
  getTotalStars: () => number;
  resetCampaign: () => void;
}

const INITIAL_UNLOCKED: string[] = [FIRST_LEVEL_ID];

/**
 * 依據已完成的關卡，補齊所有應解鎖的下一關。
 * 用於修復舊存檔的解鎖鏈，並讓新增章節對既有通關玩家可用。
 */
function reconcileUnlocks(unlocked: string[], completed: string[]): string[] {
  const set = new Set(unlocked);
  set.add(FIRST_LEVEL_ID);
  for (const id of completed) {
    if (!findCampaignLevelById(id)) continue;
    const next = getNextLevelId(id);
    if (next) set.add(next);
  }
  return Array.from(set);
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      currentChapter: 1,
      unlockedLevels: INITIAL_UNLOCKED,
      completedLevels: [],
      levelStars: {},

      unlockLevel: (levelId) =>
        set((state) => ({
          unlockedLevels: state.unlockedLevels.includes(levelId)
            ? state.unlockedLevels
            : [...state.unlockedLevels, levelId],
        })),

      completeLevel: (levelId, stars) =>
        set((state) => {
          const newCompleted = state.completedLevels.includes(levelId)
            ? state.completedLevels
            : [...state.completedLevels, levelId];

          const nextLevelId = getNextLevelId(levelId);
          const newUnlocked = state.unlockedLevels.slice();
          if (nextLevelId && !newUnlocked.includes(nextLevelId)) {
            newUnlocked.push(nextLevelId);
          }

          const nextChapter = findChapterByLevelId(nextLevelId);
          const updatedChapter = nextChapter?.chapterNumber ?? state.currentChapter;

          // 更新星數，保留歷史最高
          const newStars = { ...state.levelStars };
          if (stars && stars > 0) {
            const prev = newStars[levelId] ?? 0;
            if (stars > prev) {
              newStars[levelId] = Math.min(3, Math.max(1, stars));
            }
          }

          return {
            completedLevels: newCompleted,
            unlockedLevels: newUnlocked,
            currentChapter: Math.max(state.currentChapter, updatedChapter),
            levelStars: newStars,
          };
        }),

      isLevelUnlocked: (levelId) => get().unlockedLevels.includes(levelId),
      isLevelCompleted: (levelId) => get().completedLevels.includes(levelId),

      getLevelStars: (levelId) => get().levelStars[levelId] ?? 0,

      getTotalStars: () => {
        const { levelStars } = get();
        return Object.values(levelStars).reduce((sum, s) => sum + s, 0);
      },

      resetCampaign: () =>
        set({
          currentChapter: 1,
          unlockedLevels: INITIAL_UNLOCKED,
          completedLevels: [],
          levelStars: {},
        }),
    }),
    {
      name: 'guatd-campaign-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.unlockedLevels = reconcileUnlocks(
          state.unlockedLevels ?? [],
          state.completedLevels ?? [],
        );
      },
    },
  ),
);
