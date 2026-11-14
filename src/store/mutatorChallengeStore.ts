/**
 * 突變挑戰進度 Store
 * Mutator Challenge progress store
 *
 * 記錄各挑戰的完成狀態、最佳分數與獎勵領取狀態。獎勵的實際派發（金幣 / 天賦點）
 * 由場景在 claimReward() 回傳成功後執行，比照 dailyChallengeStore 的做法。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MutatorChallengeRecord, MutatorGameOutcome } from '@/types/mutatorChallenge';

interface MutatorChallengeState {
  /** 各挑戰進度，key = challenge id */
  records: Record<string, MutatorChallengeRecord>;
  /** 完成過的挑戰總數（去重） */
  totalCompleted: number;

  /** 取得單一挑戰紀錄（無則回傳預設） */
  getRecord: (challengeId: string) => MutatorChallengeRecord;
  /** 遊戲結束時提交結算：勝利則標記完成，分數取最大值 */
  submitGameOutcome: (outcome: MutatorGameOutcome) => void;
  /** 領取獎勵：成功回傳 true（實際派發由場景處理） */
  claimReward: (challengeId: string) => boolean;
  /** 清空所有進度（除錯用） */
  resetAll: () => void;
}

const EMPTY_RECORD: MutatorChallengeRecord = {
  completed: false,
  bestScore: 0,
  claimed: false,
};

export const useMutatorChallengeStore = create<MutatorChallengeState>()(
  persist(
    (set, get) => ({
      records: {},
      totalCompleted: 0,

      getRecord: (challengeId) => get().records[challengeId] ?? EMPTY_RECORD,

      submitGameOutcome: ({ challengeId, won, score }) => {
        const state = get();
        const prev = state.records[challengeId] ?? EMPTY_RECORD;
        const newlyCompleted = won && !prev.completed;

        const next: MutatorChallengeRecord = {
          completed: prev.completed || won,
          bestScore: Math.max(prev.bestScore, score),
          completedAt: prev.completedAt ?? (won ? Date.now() : undefined),
          claimed: prev.claimed,
        };

        set({
          records: { ...state.records, [challengeId]: next },
          totalCompleted: newlyCompleted ? state.totalCompleted + 1 : state.totalCompleted,
        });
      },

      claimReward: (challengeId) => {
        const state = get();
        const rec = state.records[challengeId];
        if (!rec || !rec.completed || rec.claimed) return false;
        set({
          records: { ...state.records, [challengeId]: { ...rec, claimed: true } },
        });
        return true;
      },

      resetAll: () => set({ records: {}, totalCompleted: 0 }),
    }),
    {
      name: 'guagua-mutator-challenge',
      version: 1,
      partialize: (state) => ({
        records: state.records,
        totalCompleted: state.totalCompleted,
      }),
    }
  )
);
