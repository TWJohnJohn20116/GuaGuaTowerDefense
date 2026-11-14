/**
 * 每日挑戰系統 Store
 * Daily Challenge System Store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DailyChallengeInstance,
  DailyChallengeState,
  DailyChallengeHistoryEntry,
  DailyChallengeCondition,
} from '@/types/dailyChallenge';
import {
  DAILY_CHALLENGE_TEMPLATES,
  selectDailyChallengeForDate,
  getTodayDateString,
  getDailyChallengeTemplate,
} from '@/data/dailyChallengeData';

// 完成挑戰結束時送來的遊戲結算資料
export interface GameOutcomeForChallenge {
  /** 是否勝利 */
  won: boolean;
  /** 是否無傷通關 */
  noDamage: boolean;
  /** 是否滿血通關 */
  fullHp: boolean;
  /** 通關時間（秒） */
  playTimeSeconds: number;
  /** 本場花費 */
  moneySpent: number;
  /** 本場累計賺取金錢 */
  moneyEarned: number;
  /** 本場擊殺敵人數 */
  enemiesKilled: number;
  /** 本場擊殺敵人類型 -> 數量 */
  enemiesKilledByType: Record<string, number>;
  /** 本場擊殺 Boss 數 */
  bossesKilled: number;
  /** 本場放置塔總數 */
  towersPlaced: number;
  /** 本場放置塔類型 -> 數量 */
  towersPlacedByType: Record<string, number>;
  /** 本場升至滿級的塔數 */
  towersReachedMaxLevel: number;
  /** 本場無傷波次數 */
  perfectWaves: number;
  /** 是否為無盡模式 */
  endless: boolean;
  /** 無盡模式達到的最高波次 */
  endlessWave: number;
  /** 難度（'easy' | 'normal' | 'hard' | 'nightmare' | 'impossible'） */
  difficulty: string;
  /** 本場融合次數 */
  towersFused: number;
  /** 本場使用的波次組 id */
  customWaveSetId?: string;
}

interface DailyChallengeStore extends DailyChallengeState {
  // 操作
  refreshIfNeeded: () => void;
  /** 在遊戲結束時推入結算資料來嘗試完成挑戰 */
  submitGameOutcome: (outcome: GameOutcomeForChallenge) => boolean;
  /** 領取挑戰獎勵 */
  claimReward: () => boolean;
  /** 重置全部進度（修改器） */
  resetAll: () => void;
  /** 從每日挑戰進入選圖頁時為 true，選圖頁套用建議設定後可清除 */
  pathHandoffActive: boolean;
  beginPathHandoff: () => void;
  clearPathHandoff: () => void;
}

// 計算單一條件的「對 outcome 而言」當前進度
const evalCondition = (cond: DailyChallengeCondition, o: GameOutcomeForChallenge): number => {
  switch (cond.type) {
    case 'win_game':
      return o.won ? 1 : 0;
    case 'win_difficulty':
      return o.won && o.difficulty === cond.difficulty ? 1 : 0;
    case 'win_speed':
      return o.won && o.playTimeSeconds <= cond.target ? 1 : 0;
    case 'win_no_damage':
      return o.won && o.noDamage ? 1 : 0;
    case 'win_full_hp':
      return o.won && o.fullHp ? 1 : 0;
    case 'win_thrifty':
      return o.won && o.moneySpent <= cond.target ? 1 : 0;
    case 'kill_enemies':
      return o.enemiesKilled;
    case 'kill_enemy_type':
      return o.enemiesKilledByType[cond.enemyType || ''] || 0;
    case 'kill_bosses':
      return o.bossesKilled;
    case 'place_towers':
      return o.towersPlaced;
    case 'place_tower_type':
      return o.towersPlacedByType[cond.towerType || ''] || 0;
    case 'place_tower_variety':
      return Object.values(o.towersPlacedByType).filter((c) => c > 0).length;
    case 'tower_max_level':
      return o.towersReachedMaxLevel;
    case 'perfect_waves':
      return o.perfectWaves;
    case 'reach_endless_wave':
      return o.endless ? o.endlessWave : 0;
    case 'earn_money':
      return o.moneyEarned;
    case 'fuse_towers':
      return o.towersFused || 0;
    case 'win_wave_set':
      return o.won && o.customWaveSetId === cond.waveSetId ? 1 : 0;
    default:
      return 0;
  }
};

export const evaluateDailyCondition = evalCondition;

// 對於部分條件，「win_*」之類的進度應使用 0 / 1 表示是否達成；而「kill_*」之類則為累計。
// evalCondition 傳出當下這場結束的快照數值，此處與既有進度做合併（取較大值，或對 win_* 累加為 1）
const mergeProgress = (
  current: number,
  newValue: number,
  cond: DailyChallengeCondition
): number => {
  switch (cond.type) {
    // 一次性條件：成功就保持為 1
    case 'win_game':
    case 'win_difficulty':
    case 'win_speed':
    case 'win_no_damage':
    case 'win_full_hp':
    case 'win_thrifty':
    case 'win_wave_set':
      return Math.max(current, newValue);
    // 數值型條件：取較大值（同一場視為一次嘗試的成果）
    default:
      return Math.max(current, newValue);
  }
};

// 建立今日的挑戰實體（如尚未存在）
const ensureTodayChallenge = (
  state: DailyChallengeState,
  today: string,
): DailyChallengeInstance => {
  if (state.todayChallenge && state.todayChallenge.date === today) {
    return state.todayChallenge;
  }
  const template = selectDailyChallengeForDate(today);
  return {
    id: template.id,
    date: today,
    template,
    progress: template.conditions.map(() => 0),
    completed: false,
    claimed: false,
  };
};

// 將昨日挑戰寫入 history（若尚未紀錄）
const archivePreviousChallenge = (
  state: DailyChallengeState,
  today: string,
): DailyChallengeHistoryEntry[] => {
  if (!state.todayChallenge || state.todayChallenge.date === today) {
    return state.history;
  }
  const prev = state.todayChallenge;
  const entry: DailyChallengeHistoryEntry = {
    date: prev.date,
    templateId: prev.id,
    completed: prev.completed,
  };
  // 若已存在不要重複加入
  if (state.history.some((h) => h.date === entry.date)) return state.history;
  return [entry, ...state.history].slice(0, 30);
};

const computeStreak = (
  prevStreak: number,
  prevDate: string,
  newCompletedDate: string
): number => {
  if (!prevDate) return 1;
  const prev = new Date(prevDate);
  const curr = new Date(newCompletedDate);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 1) return prevStreak + 1; // 連續
  if (diffDays === 0) return prevStreak;     // 同一天（理論上不會發生）
  return 1;                                  // 中斷
};

export const useDailyChallengeStore = create<DailyChallengeStore>()(
  persist(
    (set, get) => ({
      todayChallenge: null,
      lastCheckDate: '',
      totalCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      history: [],
      pathHandoffActive: false,
      beginPathHandoff: () => set({ pathHandoffActive: true }),
      clearPathHandoff: () => set({ pathHandoffActive: false }),

      refreshIfNeeded: () => {
        const today = getTodayDateString();
        const state = get();
        if (state.lastCheckDate === today && state.todayChallenge) return;

        const newHistory = archivePreviousChallenge(state, today);
        const newChallenge = ensureTodayChallenge(state, today);

        // 若昨天沒有完成挑戰，連續紀錄歸零
        let nextStreak = state.currentStreak;
        if (state.todayChallenge && state.todayChallenge.date !== today && !state.todayChallenge.completed) {
          // 如果上一日有挑戰但未完成，連續紀錄歸零
          nextStreak = 0;
        }

        set({
          todayChallenge: newChallenge,
          lastCheckDate: today,
          history: newHistory,
          currentStreak: nextStreak,
        });
      },

      submitGameOutcome: (outcome) => {
        const state = get();
        if (!state.todayChallenge) return false;
        const challenge = state.todayChallenge;
        if (challenge.completed) return false;

        const newProgress = challenge.template.conditions.map((cond, i) => {
          const newVal = evalCondition(cond, outcome);
          return Math.min(cond.target, mergeProgress(challenge.progress[i] || 0, newVal, cond));
        });

        const allMet = challenge.template.conditions.every(
          (cond, i) => newProgress[i] >= cond.target
        );

        let newTodayChallenge: DailyChallengeInstance = {
          ...challenge,
          progress: newProgress,
        };

        let newTotalCompleted = state.totalCompleted;
        let newCurrentStreak = state.currentStreak;
        let newLongestStreak = state.longestStreak;

        if (allMet && !challenge.completed) {
          newTodayChallenge = {
            ...newTodayChallenge,
            completed: true,
            completedAt: Date.now(),
          };
          newTotalCompleted += 1;

          // 計算連續完成
          const lastCompletedDate = state.history.find((h) => h.completed)?.date || '';
          newCurrentStreak = computeStreak(state.currentStreak, lastCompletedDate, challenge.date);
          newLongestStreak = Math.max(state.longestStreak, newCurrentStreak);
        }

        set({
          todayChallenge: newTodayChallenge,
          totalCompleted: newTotalCompleted,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
        });

        return allMet;
      },

      claimReward: () => {
        const state = get();
        if (!state.todayChallenge) return false;
        if (!state.todayChallenge.completed || state.todayChallenge.claimed) return false;

        set({
          todayChallenge: {
            ...state.todayChallenge,
            claimed: true,
            claimedAt: Date.now(),
          },
        });
        return true;
      },

      resetAll: () => {
        set({
          todayChallenge: null,
          lastCheckDate: '',
          totalCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          history: [],
          pathHandoffActive: false,
        });
      },
    }),
    {
      name: 'guagua-daily-challenge',
      // 正確還原 todayChallenge.template（從 ID 重新查找以保留 React 元素）
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<DailyChallengeState>;
        let restored = persisted.todayChallenge;
        if (restored && restored.id) {
          const template = getDailyChallengeTemplate(restored.id);
          if (template) {
            restored = {
              ...restored,
              template,
              progress: restored.progress?.length === template.conditions.length
                ? restored.progress
                : template.conditions.map(() => 0),
            };
          } else {
            restored = null;
          }
        }
        return {
          ...currentState,
          ...persisted,
          todayChallenge: restored ?? null,
        };
      },
      partialize: (state) => ({
        // template.icon 是 React 元素，不適合直接序列化；persist 後 template 會被重新查找
        todayChallenge: state.todayChallenge
          ? {
              id: state.todayChallenge.id,
              date: state.todayChallenge.date,
              progress: state.todayChallenge.progress,
              completed: state.todayChallenge.completed,
              completedAt: state.todayChallenge.completedAt,
              claimed: state.todayChallenge.claimed,
              claimedAt: state.todayChallenge.claimedAt,
            }
          : null,
        lastCheckDate: state.lastCheckDate,
        totalCompleted: state.totalCompleted,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        history: state.history,
      }) as unknown as DailyChallengeState,
    }
  )
);

// 匯出方便檢查
export const DAILY_CHALLENGE_POOL_SIZE = DAILY_CHALLENGE_TEMPLATES.length;
