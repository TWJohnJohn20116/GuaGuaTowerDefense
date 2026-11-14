/**
 * 成就系統 Store
 * Achievement System Store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Achievement,
  PlayerAchievement,
  AchievementStats,
  AchievementNotification,
  GameStatistics,
  AchievementCategory,
  AchievementRarity,
  AchievementStatus,
} from '@/types/achievement';
import {
  RARITY_CONFIG,
  CATEGORY_CONFIG,
} from '@/types/achievement';
import {
  ALL_ACHIEVEMENTS,
  getAchievement,
  calculateAchievementPoints,
  getTotalAchievementPoints,
  getInitialStatistics,
} from '@/data/achievementData';
import { checkCondition, getCatalogAchievements } from './achievementStoreCheck';
import type { PlaystyleSessionStats } from '@/types/playstyleIsm';
import { getInitialPlaystyleSession } from '@/types/playstyleIsm';
import type { PlaystyleGameEndContext } from '@/types/playstyleIsm';
import {
  checkAndUnlockPlaystyleIsms,
  mergePlaystyleOnTowerPlaced,
  mergePlaystyleOnUpgrade,
  mergePlaystyleOnPause,
  mergePlaystyleOnSkill,
} from './achievementStorePlaystyle';
import type { LastGameEndReport } from '@/types/gameEndReport';
import { resolveChaptersCompleted } from '@/data/campaignData/utils';
import { useCampaignStore } from './campaignStore';
import type { MutatorChallengeRecord } from '@/types/mutatorChallenge';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { useMutatorChallengeStore } from '@/store/mutatorChallengeStore';
import {
  buildGameOutcomeForDaily,
  getActiveMutatorChallengeId,
  submitDailyAndBuildSection,
  submitMutatorAndBuildSection,
} from '@/store/gameEndChallengeReport';

// Store 介面
interface AchievementStore {
  // 玩家成就進度
  playerAchievements: Record<string, PlayerAchievement>;
  
  // 遊戲統計
  statistics: GameStatistics;
  
  // 通知佇列
  notifications: AchievementNotification[];
  
  // 當前遊戲統計（遊戲結束時合併到總統計）
  currentGameStats: Partial<GameStatistics> & { playstyle?: PlaystyleSessionStats };
  
  // 遊戲開始時間
  gameStartTime: number | null;

  // 本局開始時已完成的成就（用於結算頁比對新解鎖）
  sessionBaselineAchievementIds: string[];

  // 本局開始時每日挑戰進度快照
  sessionDailyProgressBaseline: number[];

  // 本局突變試煉（開局快照）
  sessionMutatorChallengeId: string | null;
  sessionMutatorRecordBefore: MutatorChallengeRecord | null;

  // 最近一局結算報告（勝利／失敗畫面展示，不持久化）
  lastGameEndReport: LastGameEndReport | null;

  // 從結算頁前往成就館時要高亮的成就 id（讀取後清除）
  navigateHighlightAchievementId: string | null;
  setNavigateHighlightAchievementId: (id: string | null) => void;
  
  // 計算方法
  getAchievementStatus: (achievementId: string) => AchievementStatus;
  getAchievementProgress: (achievementId: string) => number[];
  getCompletionPercentage: (achievementId: string) => number;
  getStats: () => AchievementStats;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getAchievementsByCategory: (category: AchievementCategory) => Achievement[];
  getAchievementsByRarity: (rarity: AchievementRarity) => Achievement[];
  getTotalPoints: () => number;
  getEarnedPoints: () => number;
  
  // 成就操作
  checkAchievements: () => string[];
  unlockAchievement: (achievementId: string) => boolean;
  claimAchievement: (achievementId: string) => boolean;
  claimAllAchievements: () => number;
  
  // 統計更新
  updateStatistic: <K extends keyof GameStatistics>(key: K, value: GameStatistics[K] | ((prev: GameStatistics[K]) => GameStatistics[K])) => void;
  incrementStatistic: (key: keyof GameStatistics, amount?: number) => void;
  incrementNestedStatistic: (key: 'enemiesKilledByType' | 'towersPlacedByType' | 'mapsCompleted' | 'difficultiesCompleted', subKey: string, amount?: number) => void;
  
  // 遊戲生命週期
  onGameStart: (startingMoney?: number) => void;
  onGameEnd: (
    won: boolean,
    score: number,
    wave: number,
    health: number,
    mapId: string,
    difficulty: string,
    towersPlaced: number,
    towersUpgraded: number,
    endless: boolean,
    playstyleContext?: PlaystyleGameEndContext,
    campaignLevelId?: string | null,
    customWaveSetId?: string | null,
  ) => void;
  onWaveComplete: (waveNumber: number, damageTaken: number) => void;
  onEnemyKilled: (enemyType: string, isBoss: boolean, damage: number) => void;
  // 批次版: 一次處理多隻敵人擊殺,僅 1 次 statistics set + 1 次 checkAchievements。
  // 用於遊戲主迴圈高頻場景(同幀多隻敵人死亡)以避免 setState 風暴。
  batchOnEnemyKilled: (kills: { type: string; isBoss: boolean; damage: number }[], earnedMoney: number) => void;
  onTowerPlaced: (towerType: string, cost: number, wave?: number) => void;
  onTowerUpgraded: (cost: number, isMaxLevel: boolean, towerType?: string, wave?: number) => void;
  onTowerSold: (refund: number) => void;
  onMoneyEarned: (amount: number) => void;
  onDamageTaken: (amount: number) => void;
  onSkillUsed: () => void;
  onTowerFused: () => void;
  onPauseUsed: () => void;
  onProtocolChosen: (protocolId: string) => void;
  onSynergyBoard: (kindIds: string[]) => void;

  // 進階整合
  syncSkinStats: (unlocked: number, equippedNonDefault: number, total: number) => void;
  markTimeFlag: (flagId: string) => void;
  checkTimeBasedAchievements: () => void;
  
  // 通知管理
  addNotification: (achievementId: string, type: 'unlock' | 'progress' | 'claim') => void;
  dismissNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // 資料管理
  resetProgress: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
  
  // 修改器功能
  unlockAll: () => void;
  resetAll: () => void;
}

// 建立 Store
export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      playerAchievements: {},
      statistics: getInitialStatistics(),
      notifications: [],
      currentGameStats: {},
      gameStartTime: null,
      sessionBaselineAchievementIds: [],
      sessionDailyProgressBaseline: [],
      sessionMutatorChallengeId: null,
      sessionMutatorRecordBefore: null,
      lastGameEndReport: null,
      navigateHighlightAchievementId: null,

      setNavigateHighlightAchievementId: (id) => {
        set({ navigateHighlightAchievementId: id });
      },

      // ============ 計算方法 ============

      getAchievementStatus: (achievementId: string) => {
        const pa = get().playerAchievements[achievementId];
        return pa?.status || 'locked';
      },

      getAchievementProgress: (achievementId: string) => {
        const pa = get().playerAchievements[achievementId];
        if (pa) return pa.progress;
        
        const achievement = getAchievement(achievementId);
        if (!achievement) return [];
        
        const { progress } = checkCondition(achievement, get().statistics, get().playerAchievements);
        return progress;
      },

      getCompletionPercentage: (achievementId: string) => {
        const achievement = getAchievement(achievementId);
        if (!achievement) return 0;
        
        const progress = get().getAchievementProgress(achievementId);
        if (progress.length === 0) return 0;
        
        let total = 0;
        let completed = 0;
        
        achievement.conditions.forEach((condition, index) => {
          total += condition.target;
          completed += Math.min(progress[index] || 0, condition.target);
        });
        
        return total > 0 ? (completed / total) * 100 : 0;
      },

      getStats: () => {
        const { playerAchievements } = get();
        const catalog = getCatalogAchievements();
        const catalogIds = new Set(catalog.map((a) => a.id));
        const totalAchievements = catalog.length;
        const completedIds = Object.entries(playerAchievements)
          .filter(([id, pa]) => catalogIds.has(id) && (pa.status === 'completed' || pa.status === 'claimed'))
          .map(([id]) => id);
        const claimedIds = Object.entries(playerAchievements)
          .filter(([id, pa]) => catalogIds.has(id) && pa.status === 'claimed')
          .map(([id]) => id);

        const byCategory: Record<AchievementCategory, { total: number; completed: number }> = {} as Record<AchievementCategory, { total: number; completed: number }>;
        const byRarity: Record<AchievementRarity, { total: number; completed: number }> = {} as Record<AchievementRarity, { total: number; completed: number }>;

        // 初始化
        Object.keys(CATEGORY_CONFIG).forEach(cat => {
          byCategory[cat as AchievementCategory] = { total: 0, completed: 0 };
        });
        Object.keys(RARITY_CONFIG).forEach(rar => {
          byRarity[rar as AchievementRarity] = { total: 0, completed: 0 };
        });

        catalog.forEach(achievement => {
          byCategory[achievement.category].total++;
          byRarity[achievement.rarity].total++;
          if (completedIds.includes(achievement.id)) {
            byCategory[achievement.category].completed++;
            byRarity[achievement.rarity].completed++;
          }
        });

        const earnedPoints = completedIds.reduce((sum, id) => sum + calculateAchievementPoints(id), 0);

        return {
          totalAchievements,
          completedAchievements: completedIds.length,
          claimedAchievements: claimedIds.length,
          totalPoints: catalog.reduce((sum, a) => sum + calculateAchievementPoints(a.id), 0),
          earnedPoints,
          completionRate: (completedIds.length / totalAchievements) * 100,
          byCategory,
          byRarity,
          recentUnlocks: completedIds.slice(-5).reverse(),
        };
      },

      getUnlockedAchievements: () => {
        const { playerAchievements } = get();
        return ALL_ACHIEVEMENTS.filter(a => {
          const pa = playerAchievements[a.id];
          return pa && (pa.status === 'completed' || pa.status === 'claimed');
        });
      },

      getLockedAchievements: () => {
        const { playerAchievements } = get();
        return ALL_ACHIEVEMENTS.filter(a => {
          const pa = playerAchievements[a.id];
          return !pa || pa.status === 'locked' || pa.status === 'in_progress';
        });
      },

      getAchievementsByCategory: (category: AchievementCategory) => {
        return ALL_ACHIEVEMENTS.filter(a => a.category === category);
      },

      getAchievementsByRarity: (rarity: AchievementRarity) => {
        return ALL_ACHIEVEMENTS.filter(a => a.rarity === rarity);
      },

      getTotalPoints: () => getTotalAchievementPoints(),

      getEarnedPoints: () => {
        const { playerAchievements } = get();
        return Object.entries(playerAchievements)
          .filter(([, pa]) => pa.status === 'completed' || pa.status === 'claimed')
          .reduce((sum, [id]) => sum + calculateAchievementPoints(id), 0);
      },

      // ============ 成就操作 ============

      checkAchievements: () => {
        // 性能優化: 原版每個成就一次 set, ALL_ACHIEVEMENTS 約 N 個 → 一次 check 觸發 N 次 setState
        // (再加上 persist middleware 序列化開銷, 在 game loop 中累積成 ms 級瓶頸)
        // 改為: 累積到本地 map, 只在實際有變化時最後一次 set; 通知也一次 push 多筆。
        const { statistics, playerAchievements } = get();
        const newlyUnlocked: string[] = [];
        const updates: Record<string, PlayerAchievement> = {};
        const now = Date.now();
        let changed = false;

        const catalog = getCatalogAchievements();
        for (let i = 0; i < catalog.length; i++) {
          const achievement = catalog[i];
          const existing = playerAchievements[achievement.id];
          if (existing?.status === 'completed' || existing?.status === 'claimed') {
            continue;
          }

          if (achievement.prerequisite) {
            let prereqsMet = true;
            for (let j = 0; j < achievement.prerequisite.length; j++) {
              const prereq = playerAchievements[achievement.prerequisite[j]];
              if (!prereq || (prereq.status !== 'completed' && prereq.status !== 'claimed')) {
                prereqsMet = false;
                break;
              }
            }
            if (!prereqsMet) continue;
          }

          const { met, progress } = checkCondition(achievement, statistics, playerAchievements);
          const nextStatus: AchievementStatus = met
            ? 'completed'
            : (progress.some(p => p > 0) ? 'in_progress' : 'locked');
          const nextUnlockedAt = met && !existing?.unlockedAt ? now : existing?.unlockedAt;

          // 只在「狀態」或「進度任一格」確實改變才寫入(避免無謂的 reference 變更觸發訂閱)
          let progressEqual = !!existing && existing.progress.length === progress.length;
          if (progressEqual && existing) {
            for (let k = 0; k < progress.length; k++) {
              if (existing.progress[k] !== progress[k]) { progressEqual = false; break; }
            }
          }
          const statusEqual = existing?.status === nextStatus;
          const unlockedEqual = existing?.unlockedAt === nextUnlockedAt;
          if (existing && statusEqual && progressEqual && unlockedEqual) {
            continue;
          }

          updates[achievement.id] = {
            id: achievement.id,
            status: nextStatus,
            progress,
            unlockedAt: nextUnlockedAt,
          };
          changed = true;

          if (met) {
            newlyUnlocked.push(achievement.id);
          }
        }

        if (changed) {
          set(state => ({
            playerAchievements: {
              ...state.playerAchievements,
              ...updates,
            },
          }));
        }

        // 通知合併為「一次 set」
        if (newlyUnlocked.length > 0) {
          const queued: AchievementNotification[] = newlyUnlocked.map(id => ({
            id: `${id}-${now}`,
            achievementId: id,
            type: 'unlock',
            timestamp: now,
            dismissed: false,
          }));
          set(state => ({
            notifications: [...state.notifications, ...queued].slice(-10),
          }));
        }

        return newlyUnlocked;
      },

      unlockAchievement: (achievementId: string) => {
        const achievement = getAchievement(achievementId);
        if (!achievement) return false;

        const existing = get().playerAchievements[achievementId];
        if (existing?.status === 'completed' || existing?.status === 'claimed') {
          return false;
        }

        if (achievement.prerequisite?.length) {
          const { playerAchievements } = get();
          const prereqsMet = achievement.prerequisite.every((prereqId) => {
            const prereq = playerAchievements[prereqId];
            return prereq?.status === 'completed' || prereq?.status === 'claimed';
          });
          if (!prereqsMet) return false;
        }

        set(state => ({
          playerAchievements: {
            ...state.playerAchievements,
            [achievementId]: {
              id: achievementId,
              status: 'completed',
              progress: achievement.conditions.map(c => c.target),
              unlockedAt: Date.now(),
            },
          },
        }));

        get().addNotification(achievementId, 'unlock');
        return true;
      },

      claimAchievement: (achievementId: string) => {
        const existing = get().playerAchievements[achievementId];
        if (!existing || existing.status !== 'completed') {
          return false;
        }

        set(state => ({
          playerAchievements: {
            ...state.playerAchievements,
            [achievementId]: {
              ...existing,
              status: 'claimed',
              claimedAt: Date.now(),
            },
          },
        }));

        return true;
      },

      claimAllAchievements: () => {
        const { playerAchievements } = get();
        const ids = Object.entries(playerAchievements)
          .filter(([, pa]) => pa.status === 'completed')
          .map(([id]) => id);
        if (ids.length === 0) return 0;
        set(state => {
          const next = { ...state.playerAchievements };
          const now = Date.now();
          for (const id of ids) {
            next[id] = { ...next[id], status: 'claimed', claimedAt: now };
          }
          return { playerAchievements: next };
        });
        return ids.length;
      },

      // ============ 統計更新 ============

      updateStatistic: (key, value) => {
        set(state => ({
          statistics: {
            ...state.statistics,
            [key]: typeof value === 'function' ? value(state.statistics[key]) : value,
          },
        }));
        get().checkAchievements();
      },

      incrementStatistic: (key, amount = 1) => {
        set(state => ({
          statistics: {
            ...state.statistics,
            [key]: (state.statistics[key] as number) + amount,
          },
        }));
        get().checkAchievements();
      },

      incrementNestedStatistic: (key, subKey, amount = 1) => {
        set(state => ({
          statistics: {
            ...state.statistics,
            [key]: {
              ...state.statistics[key],
              [subKey]: ((state.statistics[key] as Record<string, number>)[subKey] || 0) + amount,
            },
          },
        }));
        get().checkAchievements();
      },

      // ============ 遊戲生命週期 ============

      onGameStart: (startingMoney = 0) => {
        const baseline = Object.entries(get().playerAchievements)
          .filter(([, pa]) => pa.status === 'completed' || pa.status === 'claimed')
          .map(([id]) => id);

        useDailyChallengeStore.getState().refreshIfNeeded();
        const dailyBaseline =
          useDailyChallengeStore.getState().todayChallenge?.progress?.slice() ?? [];

        const mutatorId = getActiveMutatorChallengeId();
        const mutatorBefore = mutatorId
          ? { ...useMutatorChallengeStore.getState().getRecord(mutatorId) }
          : null;

        set({
          gameStartTime: Date.now(),
          sessionBaselineAchievementIds: baseline,
          sessionDailyProgressBaseline: dailyBaseline,
          sessionMutatorChallengeId: mutatorId,
          sessionMutatorRecordBefore: mutatorBefore,
          lastGameEndReport: null,
          currentGameStats: {
            totalDamageTaken: 0,
            playstyle: getInitialPlaystyleSession(startingMoney),
          },
        });
        get().checkTimeBasedAchievements();
      },

      onGameEnd: (won, score, wave, health, mapId, difficulty, towersPlaced, towersUpgraded, endless, playstyleContext, campaignLevelId, customWaveSetId) => {
        const { gameStartTime, statistics, currentGameStats } = get();
        const statsSnapshot = { ...currentGameStats };
        const playTime = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
        const noDamage = currentGameStats.totalDamageTaken === 0;
        const fullHpFinish = won && health >= 100;
        const newWinStreak = won ? (statistics.winStreak || 0) + 1 : 0;
        const ctx: PlaystyleGameEndContext = playstyleContext ?? {
          maxWaves: 0,
          gameSpeed: 1,
          finalMoney: 0,
          allTowersMaxLevel: false,
          allTowersLevel1: true,
          maxTowerLevel: 1,
          maxLevelTowerCount: 0,
          soloMaxLevelRestLv1: false,
        };

        // 每日 / 突變挑戰同步結算（須在組裝 report 前完成）
        const dailyOutcome = buildGameOutcomeForDaily(
          won,
          playTime,
          noDamage,
          fullHpFinish,
          statsSnapshot as Record<string, unknown>,
          towersPlaced,
          endless,
          wave,
          difficulty,
          customWaveSetId,
        );
        const dailySection = submitDailyAndBuildSection(
          dailyOutcome,
          get().sessionDailyProgressBaseline,
        );
        const mutatorId = get().sessionMutatorChallengeId ?? getActiveMutatorChallengeId();
        const mutatorSection = submitMutatorAndBuildSection(
          won,
          score,
          get().sessionMutatorRecordBefore,
          mutatorId,
        );

        set(state => ({
          statistics: {
            ...state.statistics,
            gamesPlayed: state.statistics.gamesPlayed + 1,
            gamesWon: state.statistics.gamesWon + (won ? 1 : 0),
            gamesLost: state.statistics.gamesLost + (won ? 0 : 1),
            highestScore: Math.max(state.statistics.highestScore, score),
            highestWave: Math.max(state.statistics.highestWave, wave),
            fastestWin: won ? Math.min(state.statistics.fastestWin, playTime) : state.statistics.fastestWin,
            noDamageGames: state.statistics.noDamageGames + (won && noDamage ? 1 : 0),
            totalPlaytime: state.statistics.totalPlaytime + playTime,
            endlessHighestWave: endless ? Math.max(state.statistics.endlessHighestWave, wave) : state.statistics.endlessHighestWave,
            mapsCompleted: won ? {
              ...state.statistics.mapsCompleted,
              [mapId]: (state.statistics.mapsCompleted[mapId] || 0) + 1,
            } : state.statistics.mapsCompleted,
            waveSetsCompleted: (() => {
              const prev = state.statistics.waveSetsCompleted || {};
              if (!won || !customWaveSetId) return prev;
              return {
                ...prev,
                [customWaveSetId]: (prev[customWaveSetId] || 0) + 1,
              };
            })(),
            difficultiesCompleted: won ? {
              ...state.statistics.difficultiesCompleted,
              [difficulty]: (state.statistics.difficultiesCompleted[difficulty] || 0) + 1,
            } : state.statistics.difficultiesCompleted,
            winStreak: newWinStreak,
            bestWinStreak: Math.max(state.statistics.bestWinStreak || 0, newWinStreak),
            fullHpWins: (state.statistics.fullHpWins || 0) + (fullHpFinish ? 1 : 0),
            chaptersCompleted: resolveChaptersCompleted(
              useCampaignStore.getState().completedLevels,
              won ? campaignLevelId : undefined,
            ),
          },
          gameStartTime: null,
          currentGameStats: {},
        }));

        // 主義成就解鎖
        checkAndUnlockPlaystyleIsms(
          {
            won,
            wave,
            health,
            difficulty,
            endless,
            towersPlaced,
            towersUpgraded,
            noDamage,
            towersPlacedByType: currentGameStats.towersPlacedByType || {},
            totalTowersSold: currentGameStats.totalTowersSold || 0,
            playstyle: currentGameStats.playstyle,
            context: ctx,
          },
          (id) => get().unlockAchievement(id),
        );

        // 保留既有特殊成就（極簡等）
        if (won && towersPlaced < 5) {
          get().unlockAchievement('minimalist');
        }
        if (towersPlaced >= 50) {
          get().unlockAchievement('tower_hoarder');
        }
        if (won && towersPlaced <= 3 && difficulty === 'hard') {
          get().unlockAchievement('tower_efficiency_3');
          get().unlockAchievement('legend_minimalist');
        }

        get().checkAchievements();

        const baseline = new Set(get().sessionBaselineAchievementIds);
        const unlockedThisSession = Object.values(get().playerAchievements)
          .filter(
            (pa) =>
              (pa.status === 'completed' || pa.status === 'claimed') &&
              !baseline.has(pa.id),
          )
          .map((pa) => pa.id);

        const report: LastGameEndReport = {
          won,
          wave,
          maxWaves: endless ? 0 : ctx.maxWaves,
          endless,
          health,
          playTimeSeconds: playTime,
          damageTaken: statsSnapshot.totalDamageTaken || 0,
          perfectWaves: statsSnapshot.perfectWaves || 0,
          wavesCompleted: statsSnapshot.wavesCompleted || 0,
          enemiesKilled: statsSnapshot.totalEnemiesKilled || 0,
          towersPlaced,
          towersSold: statsSnapshot.totalTowersSold || 0,
          unlockedAchievementIds: unlockedThisSession,
          dailyChallenge: dailySection,
          mutatorChallenge: mutatorSection,
        };

        set({
          lastGameEndReport: report,
          sessionBaselineAchievementIds: [],
          sessionDailyProgressBaseline: [],
          sessionMutatorChallengeId: null,
          sessionMutatorRecordBefore: null,
        });
      },

      onWaveComplete: (_waveNumber, damageTaken) => {
        const noDamage = damageTaken === 0;
        
        set(state => ({
          statistics: {
            ...state.statistics,
            wavesCompleted: state.statistics.wavesCompleted + 1,
            perfectWaves: state.statistics.perfectWaves + (noDamage ? 1 : 0),
          },
          currentGameStats: {
            ...state.currentGameStats,
            wavesCompleted: (state.currentGameStats.wavesCompleted || 0) + 1,
            perfectWaves: (state.currentGameStats.perfectWaves || 0) + (noDamage ? 1 : 0),
          },
        }));

        get().checkAchievements();
      },

      onEnemyKilled: (enemyType, isBoss, damage) => {
        set(state => ({
          statistics: {
            ...state.statistics,
            totalEnemiesKilled: state.statistics.totalEnemiesKilled + 1,
            enemiesKilledByType: {
              ...state.statistics.enemiesKilledByType,
              [enemyType]: (state.statistics.enemiesKilledByType[enemyType] || 0) + 1,
            },
            bossesKilled: state.statistics.bossesKilled + (isBoss ? 1 : 0),
            totalDamageDealt: state.statistics.totalDamageDealt + damage,
          },
          currentGameStats: {
            ...state.currentGameStats,
            totalEnemiesKilled: (state.currentGameStats.totalEnemiesKilled || 0) + 1,
            enemiesKilledByType: {
              ...(state.currentGameStats.enemiesKilledByType || {}),
              [enemyType]: ((state.currentGameStats.enemiesKilledByType || {})[enemyType] || 0) + 1,
            },
            bossesKilled: (state.currentGameStats.bossesKilled || 0) + (isBoss ? 1 : 0),
          },
        }));

        get().checkAchievements();
      },

      batchOnEnemyKilled: (kills, earnedMoney) => {
        if (kills.length === 0 && earnedMoney <= 0) return;

        // 一次性把 N 隻敵人的擊殺資訊合併到 statistics
        let totalKills = 0;
        let totalBosses = 0;
        let totalDamage = 0;
        const killsByType: Record<string, number> = {};
        for (let i = 0; i < kills.length; i++) {
          const k = kills[i];
          totalKills++;
          if (k.isBoss) totalBosses++;
          totalDamage += k.damage;
          killsByType[k.type] = (killsByType[k.type] || 0) + 1;
        }

        set(state => {
          const baseByType = { ...state.statistics.enemiesKilledByType };
          const curByType = { ...(state.currentGameStats.enemiesKilledByType || {}) };
          for (const type in killsByType) {
            baseByType[type] = (baseByType[type] || 0) + killsByType[type];
            curByType[type] = (curByType[type] || 0) + killsByType[type];
          }
          return {
            statistics: {
              ...state.statistics,
              totalEnemiesKilled: state.statistics.totalEnemiesKilled + totalKills,
              enemiesKilledByType: baseByType,
              bossesKilled: state.statistics.bossesKilled + totalBosses,
              totalDamageDealt: state.statistics.totalDamageDealt + totalDamage,
              totalMoneyEarned: state.statistics.totalMoneyEarned + Math.max(0, earnedMoney),
            },
            currentGameStats: {
              ...state.currentGameStats,
              totalEnemiesKilled: (state.currentGameStats.totalEnemiesKilled || 0) + totalKills,
              enemiesKilledByType: curByType,
              bossesKilled: (state.currentGameStats.bossesKilled || 0) + totalBosses,
              totalMoneyEarned: (state.currentGameStats.totalMoneyEarned || 0) + Math.max(0, earnedMoney),
            },
          };
        });

        get().checkAchievements();
      },

      onTowerPlaced: (towerType, cost, wave = 0) => {
        set(state => ({
          statistics: {
            ...state.statistics,
            totalTowersPlaced: state.statistics.totalTowersPlaced + 1,
            towersPlacedByType: {
              ...state.statistics.towersPlacedByType,
              [towerType]: (state.statistics.towersPlacedByType[towerType] || 0) + 1,
            },
            totalMoneySpent: state.statistics.totalMoneySpent + cost,
          },
          currentGameStats: {
            ...state.currentGameStats,
            totalTowersPlaced: (state.currentGameStats.totalTowersPlaced || 0) + 1,
            towersPlacedByType: {
              ...(state.currentGameStats.towersPlacedByType || {}),
              [towerType]: ((state.currentGameStats.towersPlacedByType || {})[towerType] || 0) + 1,
            },
            totalMoneySpent: (state.currentGameStats.totalMoneySpent || 0) + cost,
            playstyle: mergePlaystyleOnTowerPlaced(state.currentGameStats.playstyle, towerType, wave),
          },
        }));

        get().checkAchievements();
      },

      onTowerUpgraded: (cost, isMaxLevel, towerType, wave = 0) => {
        set(state => {
          const reached = new Set(state.statistics.towerTypesReachedMaxLevel || []);
          if (isMaxLevel && towerType) reached.add(towerType);
          return {
            statistics: {
              ...state.statistics,
              totalTowersUpgraded: state.statistics.totalTowersUpgraded + 1,
              towersReachedMaxLevel: state.statistics.towersReachedMaxLevel + (isMaxLevel ? 1 : 0),
              totalMoneySpent: state.statistics.totalMoneySpent + cost,
              towerTypesReachedMaxLevel: Array.from(reached),
            },
            currentGameStats: {
              ...state.currentGameStats,
              totalTowersUpgraded: (state.currentGameStats.totalTowersUpgraded || 0) + 1,
              towersReachedMaxLevel: (state.currentGameStats.towersReachedMaxLevel || 0) + (isMaxLevel ? 1 : 0),
              totalMoneySpent: (state.currentGameStats.totalMoneySpent || 0) + cost,
              playstyle: mergePlaystyleOnUpgrade(state.currentGameStats.playstyle, wave, towerType),
            },
          };
        });

        get().checkAchievements();
      },

      onTowerSold: (refund) => {
        set(state => ({
          statistics: {
            ...state.statistics,
            totalTowersSold: state.statistics.totalTowersSold + 1,
            totalMoneyEarned: state.statistics.totalMoneyEarned + refund,
          },
          currentGameStats: {
            ...state.currentGameStats,
            totalTowersSold: (state.currentGameStats.totalTowersSold || 0) + 1,
            totalMoneyEarned: (state.currentGameStats.totalMoneyEarned || 0) + refund,
          },
        }));

        get().checkAchievements();
      },

      onMoneyEarned: (amount) => {
        set(state => ({
          statistics: {
            ...state.statistics,
            totalMoneyEarned: state.statistics.totalMoneyEarned + amount,
          },
          currentGameStats: {
            ...state.currentGameStats,
            totalMoneyEarned: (state.currentGameStats.totalMoneyEarned || 0) + amount,
          },
        }));

        get().checkAchievements();
      },

      onDamageTaken: (amount) => {
        set(state => ({
          statistics: {
            ...state.statistics,
            totalDamageTaken: state.statistics.totalDamageTaken + amount,
          },
          currentGameStats: {
            ...state.currentGameStats,
            totalDamageTaken: (state.currentGameStats.totalDamageTaken || 0) + amount,
          },
        }));
      },

      onSkillUsed: () => {
        set(state => ({
          statistics: {
            ...state.statistics,
            skillsUsed: state.statistics.skillsUsed + 1,
          },
          currentGameStats: {
            ...state.currentGameStats,
            playstyle: mergePlaystyleOnSkill(state.currentGameStats.playstyle),
          },
        }));

        get().checkAchievements();
      },

      onProtocolChosen: (protocolId: string) => {
        set(state => {
          const types = state.statistics.tacticalProtocolTypes || [];
          const nextTypes = types.includes(protocolId) ? types : [...types, protocolId];
          return {
            statistics: {
              ...state.statistics,
              tacticalProtocolsChosen: (state.statistics.tacticalProtocolsChosen || 0) + 1,
              tacticalProtocolTypes: nextTypes,
            },
          };
        });
        get().checkAchievements();
      },

      onSynergyBoard: (kindIds: string[]) => {
        if (kindIds.length === 0) return;
        set(state => {
          const known = new Set(state.statistics.towerSynergyTypes || []);
          for (const id of kindIds) known.add(id);
          const maxKinds = Math.max(state.statistics.towerSynergyMaxKinds || 0, kindIds.length);
          return {
            statistics: {
              ...state.statistics,
              towerSynergyTypes: [...known],
              towerSynergyMaxKinds: maxKinds,
            },
          };
        });
        get().checkAchievements();
      },

      onTowerFused: () => {
        set(state => ({
          statistics: {
            ...state.statistics,
            totalTowerFusions: state.statistics.totalTowerFusions + 1,
          },
          currentGameStats: {
            ...state.currentGameStats,
            totalTowerFusions: (state.currentGameStats.totalTowerFusions || 0) + 1,
          },
        }));

        get().checkAchievements();
      },

      onPauseUsed: () => {
        set(state => ({
          currentGameStats: {
            ...state.currentGameStats,
            playstyle: mergePlaystyleOnPause(state.currentGameStats.playstyle),
          },
        }));
      },

      // ============ 進階整合 ============

      syncSkinStats: (unlocked, equippedNonDefault, total) => {
        set(state => ({
          statistics: {
            ...state.statistics,
            unlockedSkinsCount: unlocked,
            equippedNonDefaultSkinsCount: equippedNonDefault,
            totalSkinsCount: total,
          },
        }));
        get().checkAchievements();
      },

      markTimeFlag: (flagId) => {
        const existing = get().statistics.timeFlags?.[flagId];
        if (existing) return;
        set(state => ({
          statistics: {
            ...state.statistics,
            timeFlags: {
              ...(state.statistics.timeFlags || {}),
              [flagId]: true,
            },
          },
        }));
        get().checkAchievements();
      },

      checkTimeBasedAchievements: () => {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        const date = now.getDate();
        const month = now.getMonth() + 1;
        const flagsToMark: string[] = [];

        if (hour >= 0 && hour < 4) flagsToMark.push('night_owl');
        if (hour >= 5 && hour < 7) flagsToMark.push('early_bird');
        if (hour === 12) flagsToMark.push('noon_warrior');
        if (day === 0 || day === 6) flagsToMark.push('weekend_warrior');
        if (date === 13 && day === 5) flagsToMark.push('friday_13th');
        if (month === 7 && date === 7) flagsToMark.push('lucky_seven');
        if (month === 1 && date === 1) flagsToMark.push('new_year_player');

        flagsToMark.forEach(flag => get().markTimeFlag(flag));
      },

      // ============ 通知管理 ============

      addNotification: (achievementId, type) => {
        const notification: AchievementNotification = {
          id: `${achievementId}-${Date.now()}`,
          achievementId,
          type,
          timestamp: Date.now(),
          dismissed: false,
        };

        set(state => ({
          notifications: [...state.notifications, notification].slice(-10), // 只保留最新 10 個
        }));
      },

      dismissNotification: (notificationId) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, dismissed: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // ============ 資料管理 ============

      resetProgress: () => {
        set({
          playerAchievements: {},
          statistics: getInitialStatistics(),
          notifications: [],
          currentGameStats: {},
          gameStartTime: null,
          sessionBaselineAchievementIds: [],
          sessionDailyProgressBaseline: [],
          sessionMutatorChallengeId: null,
          sessionMutatorRecordBefore: null,
          lastGameEndReport: null,
        });
      },

      exportData: () => {
        const { playerAchievements, statistics } = get();
        return JSON.stringify({ playerAchievements, statistics, version: 1 });
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.version !== 1) return false;
          
          set({
            playerAchievements: parsed.playerAchievements || {},
            statistics: { ...getInitialStatistics(), ...parsed.statistics },
          });
          return true;
        } catch {
          return false;
        }
      },

      // ============ 修改器功能 ============

      unlockAll: () => {
        const now = Date.now();
        const allAchievements: Record<string, PlayerAchievement> = {};
        
        for (const achievement of ALL_ACHIEVEMENTS) {
          allAchievements[achievement.id] = {
            id: achievement.id,
            status: 'completed',
            progress: achievement.conditions.map(c => c.target),
            unlockedAt: now,
          };
        }
        
        set({ playerAchievements: allAchievements });
      },

      resetAll: () => {
        set({
          playerAchievements: {},
          statistics: getInitialStatistics(),
          notifications: [],
          currentGameStats: {},
          gameStartTime: null,
          sessionBaselineAchievementIds: [],
          sessionDailyProgressBaseline: [],
          sessionMutatorChallengeId: null,
          sessionMutatorRecordBefore: null,
          lastGameEndReport: null,
        });
      },
    }),
    {
      name: 'melon-td-achievements',
      partialize: (state) => ({
        playerAchievements: state.playerAchievements,
        statistics: state.statistics,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<AchievementStore>;
        return {
          ...currentState,
          ...persisted,
          statistics: {
            ...getInitialStatistics(),
            ...(persisted.statistics || {}),
          },
        };
      },
    }
  )
);
