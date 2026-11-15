/**
 * 工坊戰役進度（每個專案各自一份完成清單）
 *
 * 只記「哪些關卡已完成」；解鎖規則是純函式（workshop/progress.ts），
 * 這樣規則可以單元測試、也可以在別的入口（未來的戰役選單）重用。
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkshopProgressState {
  /** projectId → 已完成的 levelId 清單 */
  completed: Record<string, string[]>;
  markCompleted: (projectId: string, levelId: string) => void;
  unmarkCompleted: (projectId: string, levelId: string) => void;
  resetProject: (projectId: string) => void;
}

export const useWorkshopProgressStore = create<WorkshopProgressState>()(
  persist(
    (set) => ({
      completed: {},
      markCompleted: (projectId, levelId) =>
        set((state) => {
          const list = state.completed[projectId] ?? [];
          if (list.includes(levelId)) return state;
          return { completed: { ...state.completed, [projectId]: [...list, levelId] } };
        }),
      unmarkCompleted: (projectId, levelId) =>
        set((state) => ({
          completed: {
            ...state.completed,
            [projectId]: (state.completed[projectId] ?? []).filter((id) => id !== levelId),
          },
        })),
      resetProject: (projectId) =>
        set((state) => ({
          completed: { ...state.completed, [projectId]: [] },
        })),
    }),
    { name: 'guagua-workshop-progress' },
  ),
);
