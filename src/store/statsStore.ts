import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TowerType, EnemyType } from '@/types/game';
import type { StatsGameMode } from '@/store/statsGameMode';

export interface TowerStats {
  type: TowerType;
  totalDamage: number;
  kills: number;
  totalCost: number;
  upgradeCount: number;
  maxLevel: number;
  timeAlive: number;
  damagePerCost: number;
  killsPerMinute: number;
}

export interface WaveSnapshot {
  wave: number;
  timestamp: number;
  money: number;
  health: number;
  towerCount: number;
  enemiesKilled: number;
  totalDamage: number;
}

export interface EconomySnapshot {
  timestamp: number;
  money: number;
  income: number;
  expenses: number;
  netWorth: number;
}

export interface GameRecord {
  id: string;
  date: number;
  mapId: string;
  difficulty: string;
  isVictory: boolean;
  score: number;
  finalWave: number;
  finalHealth: number;
  duration: number;
  
  totalDamageDealt: number;
  totalEnemiesKilled: number;
  totalMoneyEarned: number;
  totalMoneySpent: number;
  
  towersPlaced: number;
  towersUpgraded: number;
  towersSold: number;
  /** 對局模式（舊紀錄可能缺省） */
  gameMode?: StatsGameMode;

  towerStats: TowerStats[];
  waveSnapshots: WaveSnapshot[];
  economySnapshots: EconomySnapshot[];
  
  enemiesKilledByType: Record<string, number>;
  damageByTowerType: Record<string, number>;
  
  peakMoney: number;
  peakTowerCount: number;
  averageDPS: number;
  
  perfectWaves: number;
  damageTaken: number;
}

export interface CurrentGameTracking {
  gameStartTime: number;
  lastSnapshotTime: number;
  
  towerTracking: Map<string, {
    type: TowerType;
    placedAt: number;
    totalCost: number;
    damageDealt: number;
    kills: number;
    upgradeCount: number;
    maxLevel: number;
  }>;
  
  waveSnapshots: WaveSnapshot[];
  economySnapshots: EconomySnapshot[];
  
  totalMoneyEarned: number;
  totalMoneySpent: number;
  totalDamageDealt: number;
  totalEnemiesKilled: number;
  
  enemiesKilledByType: Record<string, number>;
  damageByTowerType: Record<string, number>;
  
  peakMoney: number;
  peakTowerCount: number;
  
  perfectWaves: number;
  damageTaken: number;
  lastWaveDamageTaken: number;
  towersSold: number;
  gameMode: StatsGameMode;
}

export interface PersonalBests {
  highestScore: number;
  highestWave: number;
  fastestVictory: number;
  mostEfficientEconomy: number;
  highestDPS: number;
  mostKills: number;
}

export interface GlobalStats {
  totalGamesPlayed: number;
  totalGamesWon: number;
  totalPlaytime: number;
  totalDamageDealt: number;
  totalEnemiesKilled: number;
  totalTowersSold: number;
  
  favoriteMap: string;
  favoriteTower: TowerType | null;
  favoriteStrategy: string;
  
  averageScore: number;
  averageWave: number;
  winRate: number;
}

interface StatsStore {
  gameHistory: GameRecord[];
  currentGame: CurrentGameTracking | null;
  personalBests: PersonalBests;
  globalStats: GlobalStats;
  
  startGameTracking: (gameMode: StatsGameMode) => void;
  endGameTracking: (
    mapId: string,
    difficulty: string,
    isVictory: boolean,
    score: number,
    finalWave: number,
    finalHealth: number
  ) => void;
  
  recordWaveSnapshot: (wave: number, money: number, health: number, towerCount: number) => void;
  recordEconomySnapshot: (money: number, income: number, expenses: number) => void;
  
  trackTowerPlaced: (towerId: string, type: TowerType, cost: number) => void;
  trackTowerUpgraded: (towerId: string, cost: number, newLevel: number) => void;
  trackTowerSold: (towerId: string, refund: number) => void;
  trackTowerDamage: (towerId: string, damage: number) => void;
  trackTowerKill: (towerId: string) => void;
  
  trackEnemyKilled: (type: EnemyType) => void;
  // 批次版: 一次處理多隻敵人擊殺與整批獎勵金錢, 僅 1 次 set。
  trackEnemyKilledBatch: (types: EnemyType[], earnedMoney: number) => void;
  trackMoneyEarned: (amount: number) => void;
  trackMoneySpent: (amount: number) => void;
  trackDamageTaken: (amount: number) => void;
  
  onWaveComplete: (wave: number) => void;
  
  getRecentGames: (count: number) => GameRecord[];
  getGameById: (id: string) => GameRecord | undefined;
  getBestGames: (sortBy: 'score' | 'wave' | 'duration') => GameRecord[];
  getStatsByMap: (mapId: string) => {
    gamesPlayed: number;
    winRate: number;
    averageScore: number;
    bestScore: number;
  };
  getStatsByDifficulty: (difficulty: string) => {
    gamesPlayed: number;
    winRate: number;
    averageScore: number;
  };
  
  clearHistory: () => void;
  deleteGame: (id: string) => void;
}

const initialPersonalBests: PersonalBests = {
  highestScore: 0,
  highestWave: 0,
  fastestVictory: Infinity,
  mostEfficientEconomy: 0,
  highestDPS: 0,
  mostKills: 0,
};

const initialGlobalStats: GlobalStats = {
  totalGamesPlayed: 0,
  totalGamesWon: 0,
  totalPlaytime: 0,
  totalDamageDealt: 0,
  totalEnemiesKilled: 0,
  totalTowersSold: 0,
  favoriteMap: '',
  favoriteTower: null,
  favoriteStrategy: '',
  averageScore: 0,
  averageWave: 0,
  winRate: 0,
};

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      gameHistory: [],
      currentGame: null,
      personalBests: initialPersonalBests,
      globalStats: initialGlobalStats,

      startGameTracking: (gameMode) => {
        set({
          currentGame: {
            gameStartTime: Date.now(),
            lastSnapshotTime: Date.now(),
            towerTracking: new Map(),
            waveSnapshots: [],
            economySnapshots: [],
            totalMoneyEarned: 0,
            totalMoneySpent: 0,
            totalDamageDealt: 0,
            totalEnemiesKilled: 0,
            enemiesKilledByType: {},
            damageByTowerType: {},
            peakMoney: 0,
            peakTowerCount: 0,
            perfectWaves: 0,
            damageTaken: 0,
            lastWaveDamageTaken: 0,
            towersSold: 0,
            gameMode,
          },
        });
      },

      endGameTracking: (mapId, difficulty, isVictory, score, finalWave, finalHealth) => {
        const current = get().currentGame;
        if (!current) return;

        const duration = Date.now() - current.gameStartTime;
        const durationSeconds = duration / 1000;

        const towerStats: TowerStats[] = Array.from(current.towerTracking.entries()).map(
          ([_id, data]) => ({
            type: data.type,
            totalDamage: data.damageDealt,
            kills: data.kills,
            totalCost: data.totalCost,
            upgradeCount: data.upgradeCount,
            maxLevel: data.maxLevel,
            timeAlive: (Date.now() - data.placedAt) / 1000,
            damagePerCost: data.totalCost > 0 ? data.damageDealt / data.totalCost : 0,
            killsPerMinute: data.kills / (durationSeconds / 60),
          })
        );

        const averageDPS = durationSeconds > 0 ? current.totalDamageDealt / durationSeconds : 0;

        const gameRecord: GameRecord = {
          id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: Date.now(),
          mapId,
          difficulty,
          isVictory,
          score,
          finalWave,
          finalHealth,
          duration,
          totalDamageDealt: current.totalDamageDealt,
          totalEnemiesKilled: current.totalEnemiesKilled,
          totalMoneyEarned: current.totalMoneyEarned,
          totalMoneySpent: current.totalMoneySpent,
          towersPlaced: current.towerTracking.size,
          towersUpgraded: towerStats.reduce((sum, t) => sum + t.upgradeCount, 0),
          towersSold: current.towersSold,
          gameMode: current.gameMode,
          towerStats,
          waveSnapshots: current.waveSnapshots,
          economySnapshots: current.economySnapshots,
          enemiesKilledByType: current.enemiesKilledByType,
          damageByTowerType: current.damageByTowerType,
          peakMoney: current.peakMoney,
          peakTowerCount: current.peakTowerCount,
          averageDPS,
          perfectWaves: current.perfectWaves,
          damageTaken: current.damageTaken,
        };

        set((state) => {
          const newHistory = [gameRecord, ...state.gameHistory].slice(0, 100);
          
          const newBests = { ...state.personalBests };
          if (score > newBests.highestScore) newBests.highestScore = score;
          if (finalWave > newBests.highestWave) newBests.highestWave = finalWave;
          if (isVictory && duration < newBests.fastestVictory) newBests.fastestVictory = duration;
          if (averageDPS > newBests.highestDPS) newBests.highestDPS = averageDPS;
          if (current.totalEnemiesKilled > newBests.mostKills) newBests.mostKills = current.totalEnemiesKilled;

          const newGlobalStats = { ...state.globalStats };
          newGlobalStats.totalGamesPlayed += 1;
          if (isVictory) newGlobalStats.totalGamesWon += 1;
          newGlobalStats.totalPlaytime += durationSeconds;
          newGlobalStats.totalDamageDealt += current.totalDamageDealt;
          newGlobalStats.totalEnemiesKilled += current.totalEnemiesKilled;
          newGlobalStats.totalTowersSold += current.towersSold;
          newGlobalStats.winRate = newGlobalStats.totalGamesPlayed > 0 
            ? (newGlobalStats.totalGamesWon / newGlobalStats.totalGamesPlayed) * 100 
            : 0;
          newGlobalStats.averageScore = newHistory.reduce((sum, g) => sum + g.score, 0) / newHistory.length;
          newGlobalStats.averageWave = newHistory.reduce((sum, g) => sum + g.finalWave, 0) / newHistory.length;

          return {
            gameHistory: newHistory,
            currentGame: null,
            personalBests: newBests,
            globalStats: newGlobalStats,
          };
        });
      },

      recordWaveSnapshot: (wave, money, health, towerCount) => {
        set((state) => {
          if (!state.currentGame) return state;
          return {
            currentGame: {
              ...state.currentGame,
              waveSnapshots: [
                ...state.currentGame.waveSnapshots,
                {
                  wave,
                  timestamp: Date.now(),
                  money,
                  health,
                  towerCount,
                  enemiesKilled: state.currentGame.totalEnemiesKilled,
                  totalDamage: state.currentGame.totalDamageDealt,
                },
              ],
            },
          };
        });
      },

      recordEconomySnapshot: (money, income, expenses) => {
        set((state) => {
          if (!state.currentGame) return state;
          
          const newPeakMoney = Math.max(state.currentGame.peakMoney, money);
          
          return {
            currentGame: {
              ...state.currentGame,
              peakMoney: newPeakMoney,
              economySnapshots: [
                ...state.currentGame.economySnapshots,
                {
                  timestamp: Date.now(),
                  money,
                  income,
                  expenses,
                  netWorth: money + income - expenses,
                },
              ],
            },
          };
        });
      },

      trackTowerPlaced: (towerId, type, cost) => {
        set((state) => {
          if (!state.currentGame) return state;
          
          const newTracking = new Map(state.currentGame.towerTracking);
          newTracking.set(towerId, {
            type,
            placedAt: Date.now(),
            totalCost: cost,
            damageDealt: 0,
            kills: 0,
            upgradeCount: 0,
            maxLevel: 1,
          });

          const newPeakTowerCount = Math.max(state.currentGame.peakTowerCount, newTracking.size);

          return {
            currentGame: {
              ...state.currentGame,
              towerTracking: newTracking,
              totalMoneySpent: state.currentGame.totalMoneySpent + cost,
              peakTowerCount: newPeakTowerCount,
            },
          };
        });
      },

      trackTowerUpgraded: (towerId, cost, newLevel) => {
        set((state) => {
          if (!state.currentGame) return state;
          
          const newTracking = new Map(state.currentGame.towerTracking);
          const tower = newTracking.get(towerId);
          if (tower) {
            newTracking.set(towerId, {
              ...tower,
              totalCost: tower.totalCost + cost,
              upgradeCount: tower.upgradeCount + 1,
              maxLevel: Math.max(tower.maxLevel, newLevel),
            });
          }

          return {
            currentGame: {
              ...state.currentGame,
              towerTracking: newTracking,
              totalMoneySpent: state.currentGame.totalMoneySpent + cost,
            },
          };
        });
      },

      trackTowerSold: (towerId, refund) => {
        set((state) => {
          if (!state.currentGame) return state;
          
          const newTracking = new Map(state.currentGame.towerTracking);
          newTracking.delete(towerId);

          return {
            currentGame: {
              ...state.currentGame,
              towerTracking: newTracking,
              totalMoneyEarned: state.currentGame.totalMoneyEarned + refund,
              towersSold: state.currentGame.towersSold + 1,
            },
          };
        });
      },

      trackTowerDamage: (towerId, damage) => {
        set((state) => {
          if (!state.currentGame) return state;
          
          const newTracking = new Map(state.currentGame.towerTracking);
          const tower = newTracking.get(towerId);
          if (tower) {
            newTracking.set(towerId, {
              ...tower,
              damageDealt: tower.damageDealt + damage,
            });

            const damageByType = { ...state.currentGame.damageByTowerType };
            damageByType[tower.type] = (damageByType[tower.type] || 0) + damage;

            return {
              currentGame: {
                ...state.currentGame,
                towerTracking: newTracking,
                totalDamageDealt: state.currentGame.totalDamageDealt + damage,
                damageByTowerType: damageByType,
              },
            };
          }
          return state;
        });
      },

      trackTowerKill: (towerId) => {
        set((state) => {
          if (!state.currentGame) return state;
          
          const newTracking = new Map(state.currentGame.towerTracking);
          const tower = newTracking.get(towerId);
          if (tower) {
            newTracking.set(towerId, {
              ...tower,
              kills: tower.kills + 1,
            });

            return {
              currentGame: {
                ...state.currentGame,
                towerTracking: newTracking,
              },
            };
          }
          return state;
        });
      },

      trackEnemyKilled: (type) => {
        set((state) => {
          if (!state.currentGame) return state;
          
          const killedByType = { ...state.currentGame.enemiesKilledByType };
          killedByType[type] = (killedByType[type] || 0) + 1;

          return {
            currentGame: {
              ...state.currentGame,
              totalEnemiesKilled: state.currentGame.totalEnemiesKilled + 1,
              enemiesKilledByType: killedByType,
            },
          };
        });
      },

      trackEnemyKilledBatch: (types, earnedMoney) => {
        if (types.length === 0 && earnedMoney <= 0) return;
        set((state) => {
          if (!state.currentGame) return state;

          const killedByType = { ...state.currentGame.enemiesKilledByType };
          for (let i = 0; i < types.length; i++) {
            const t = types[i];
            killedByType[t] = (killedByType[t] || 0) + 1;
          }

          return {
            currentGame: {
              ...state.currentGame,
              totalEnemiesKilled: state.currentGame.totalEnemiesKilled + types.length,
              enemiesKilledByType: killedByType,
              totalMoneyEarned: state.currentGame.totalMoneyEarned + Math.max(0, earnedMoney),
            },
          };
        });
      },

      trackMoneyEarned: (amount) => {
        set((state) => {
          if (!state.currentGame) return state;
          return {
            currentGame: {
              ...state.currentGame,
              totalMoneyEarned: state.currentGame.totalMoneyEarned + amount,
            },
          };
        });
      },

      trackMoneySpent: (amount) => {
        set((state) => {
          if (!state.currentGame) return state;
          return {
            currentGame: {
              ...state.currentGame,
              totalMoneySpent: state.currentGame.totalMoneySpent + amount,
            },
          };
        });
      },

      trackDamageTaken: (amount) => {
        set((state) => {
          if (!state.currentGame) return state;
          return {
            currentGame: {
              ...state.currentGame,
              damageTaken: state.currentGame.damageTaken + amount,
              lastWaveDamageTaken: state.currentGame.lastWaveDamageTaken + amount,
            },
          };
        });
      },

      onWaveComplete: () => {
        set((state) => {
          if (!state.currentGame) return state;
          
          const isPerfectWave = state.currentGame.lastWaveDamageTaken === 0;
          
          return {
            currentGame: {
              ...state.currentGame,
              perfectWaves: isPerfectWave ? state.currentGame.perfectWaves + 1 : state.currentGame.perfectWaves,
              lastWaveDamageTaken: 0,
            },
          };
        });
      },

      getRecentGames: (count) => {
        return get().gameHistory.slice(0, count);
      },

      getGameById: (id) => {
        return get().gameHistory.find((g) => g.id === id);
      },

      getBestGames: (sortBy) => {
        const history = [...get().gameHistory];
        switch (sortBy) {
          case 'score':
            return history.sort((a, b) => b.score - a.score).slice(0, 10);
          case 'wave':
            return history.sort((a, b) => b.finalWave - a.finalWave).slice(0, 10);
          case 'duration':
            return history.filter(g => g.isVictory).sort((a, b) => a.duration - b.duration).slice(0, 10);
          default:
            return history.slice(0, 10);
        }
      },

      getStatsByMap: (mapId) => {
        const games = get().gameHistory.filter((g) => g.mapId === mapId);
        const wins = games.filter((g) => g.isVictory).length;
        const scores = games.map((g) => g.score);
        
        return {
          gamesPlayed: games.length,
          winRate: games.length > 0 ? (wins / games.length) * 100 : 0,
          averageScore: games.length > 0 ? scores.reduce((a, b) => a + b, 0) / games.length : 0,
          bestScore: games.length > 0 ? Math.max(...scores) : 0,
        };
      },

      getStatsByDifficulty: (difficulty) => {
        const games = get().gameHistory.filter((g) => g.difficulty === difficulty);
        const wins = games.filter((g) => g.isVictory).length;
        const scores = games.map((g) => g.score);
        
        return {
          gamesPlayed: games.length,
          winRate: games.length > 0 ? (wins / games.length) * 100 : 0,
          averageScore: games.length > 0 ? scores.reduce((a, b) => a + b, 0) / games.length : 0,
        };
      },

      clearHistory: () => {
        set({
          gameHistory: [],
          personalBests: initialPersonalBests,
          globalStats: initialGlobalStats,
        });
      },

      deleteGame: (id) => {
        set((state) => ({
          gameHistory: state.gameHistory.filter((g) => g.id !== id),
        }));
      },
    }),
    {
      name: 'stats-storage',
      partialize: (state) => ({
        gameHistory: state.gameHistory,
        personalBests: state.personalBests,
        globalStats: state.globalStats,
      }),
    }
  )
);
