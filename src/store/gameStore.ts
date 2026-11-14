import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  DifficultyModifiers,
  PathConfig,
  GameScene,
} from '@/types/game';
import { 
  GAME_CONSTANTS, 
  PATHS, DEFAULT_PATH, DIFFICULTY_MODIFIERS
} from '@/data/gameData';
import { 
  initializeGrid, 
  DEFAULT_KEY_BINDINGS,
  getSavedGameSpeed,
  saveGameSpeed 
} from './gameStoreUtils';
import type { GameStore } from './gameStoreTypes';
import { createTowerActions } from './gameStoreActions';
import { createWaveActions } from './gameStoreWave';
import { createLoopActions } from './gameStoreLoop';
import { createAutoBattleActions } from './gameStoreAutoBattle';
import { createEffectActions } from './gameStoreEffects';
import { createPlayerSkillActions, createInitialPlayerSkillStates } from './gameStorePlayerSkills';
import { createStressTestActions } from './stressTestActions';
import { createEmptyMatchState } from './matchState';
import { useTalentStore } from './talentStore';
import { useStatsStore } from './statsStore';
import { resolveStatsGameMode } from './statsGameMode';
import { playVictory } from '@/services/audioService';
import { useSettingsStore } from './settingsStore';

const applyTalentToDifficultyModifiers = (base: DifficultyModifiers): DifficultyModifiers => {
  const talent = useTalentStore.getState().getModifiers();
  return {
    ...base,
    startingMoney: Math.round(base.startingMoney * talent.startingMoneyMult + talent.startingMoneyFlat),
    startingHealth: Math.max(1, Math.round(base.startingHealth + talent.startingHealthFlat)),
    towerCostMult: base.towerCostMult * talent.towerCostMult,
    enemyRewardMult: base.enemyRewardMult * talent.enemyRewardMult,
  };
};

const DEFAULT_GAME_PREFS = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7,
  musicVolume: 0.5,
  gameSpeed: getSavedGameSpeed(),
  keyBindings: DEFAULT_KEY_BINDINGS,
} as const;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
  // 初始狀態
  scene: 'mainMenu',
  sceneHistory: [],
  encyclopediaDeepLink: null,
  pauseEncyclopediaFocus: null,
  resumePauseOnGameReturn: false,
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  isVictory: false,
  gameSpeed: DEFAULT_GAME_PREFS.gameSpeed,
  
  // 難度
  gameDifficulty: 'normal',
  difficultyModifiers: DIFFICULTY_MODIFIERS.normal,
  
  money: GAME_CONSTANTS.INITIAL_MONEY,
  health: GAME_CONSTANTS.INITIAL_HEALTH,
  score: 0,
  
  currentWave: 0,
  waveActive: false,
  enemiesRemaining: 0,
  endlessMode: false,
  endlessWaveConfig: null,
  allEnemiesSpawned: false,
  maxWaves: 15,
  autoSkipWave: false,
  lastStartArgs: null,
  pendingProtocolChoices: null,
  activeProtocol: null,
  protocolHistory: [],
  protocolNextTowerDiscount: 0,

  selectedPath: DEFAULT_PATH,
  grid: [],
  
  enemies: [],
  towers: [],
  projectiles: [],
  
  selectedTowerType: null,
  selectedTower: null,
  multiSelectedTowerIds: [],
  hoveredTile: null,

  // 融合系統
  fusionMode: false,
  fusionSourceId: null,
  fusionFundsShort: null,
  fusionAnimations: [],
  
  // 放置系統
  placementHistory: [],
  placementHistoryIndex: -1,
  quickPlaceMode: false,
  placementStats: { totalPlaced: 0, totalSold: 0, totalSpent: 0 },
  showTacticalView: false,
  
  // 升級系統
  upgradeHistory: [],
  upgradeStats: { totalUpgrades: 0, totalSpent: 0, maxLevelReached: 1 },
  autoUpgradeEnabled: false,
  autoUpgradePriority: 'damage',
  upgradeAnimations: [],
  sellAnimations: [],
  
  playerSkillStates: createInitialPlayerSkillStates(),
  playerSkillAnimations: [],
  
  damageTexts: [],
  impactParticles: [],
  deathAnimations: [],
  shakeIntensity: 0,
  
  // 自動戰鬥系統
  autoBattleEnabled: false,
  autoBattleStrategy: 'balanced',
  autoBattleConfig: {
    useSkills: true,
    autoSkip: true,
    autoUpgrade: true,
    autoPlace: true,
    autoSell: false,
    autoFusion: false,
  },
  autoBattleStats: { towersPlaced: 0, moneySpent: 0, decisionsCount: 0, towersSold: 0 },
  autoBattleLastDecision: 0,
  autoBattleLogs: [],
  
  soundEnabled: DEFAULT_GAME_PREFS.soundEnabled,
  musicEnabled: DEFAULT_GAME_PREFS.musicEnabled,
  soundVolume: DEFAULT_GAME_PREFS.soundVolume,
  musicVolume: DEFAULT_GAME_PREFS.musicVolume,

  keyBindings: { ...DEFAULT_KEY_BINDINGS },

  // 場景切換：自動將當前場景推入歷史堆疊，提供 BackButton 智能返回
  setScene: (scene) => {
    const state = get();
    if (state.scene === scene) return; // 同一場景不重複入棧

    const isResultScene = (s: GameScene) => s === 'gameOver' || s === 'victory' || s === 'game';

    if (isResultScene(state.scene)) {
      // 從結算頁前往其他場景（如成就館）時保留返回路徑
      if (scene !== 'game' && scene !== 'gameOver' && scene !== 'victory') {
        set({ scene, sceneHistory: [state.scene] });
        return;
      }
      set({ scene, sceneHistory: [] });
      return;
    }

    // 將當前場景推入歷史堆疊（限制最大深度避免記憶體洩漏）
    const nextHistory = [...state.sceneHistory, state.scene].slice(-15);
    set({ scene, sceneHistory: nextHistory });
  },

  openEncyclopedia: (link) => {
    const state = get();
    const fromPausedGame = state.scene === 'game' && state.isPlaying && state.isPaused;

    if (state.scene === 'encyclopedia') {
      set({ encyclopediaDeepLink: link });
      return;
    }
    const nextHistory = [...state.sceneHistory, state.scene].slice(-15);
    set({
      scene: 'encyclopedia',
      sceneHistory: nextHistory,
      encyclopediaDeepLink: link,
      resumePauseOnGameReturn: fromPausedGame,
      pauseEncyclopediaFocus: null,
    });
  },

  openSettingsFromPause: () => {
    const state = get();
    const fromPausedGame = state.scene === 'game' && state.isPlaying && state.isPaused;
    if (state.scene === 'settings') return;
    const nextHistory = [...state.sceneHistory, state.scene].slice(-15);
    set({
      scene: 'settings',
      sceneHistory: nextHistory,
      resumePauseOnGameReturn: fromPausedGame,
      pauseEncyclopediaFocus: null,
    });
  },

  openPauseEncyclopedia: (link) => {
    set({ pauseEncyclopediaFocus: link });
  },

  closePauseEncyclopedia: () => {
    set({ pauseEncyclopediaFocus: null });
  },

  // 返回上一個場景（pop history）
  goBackScene: () => {
    const state = get();
    const { sceneHistory } = state;
    if (sceneHistory.length === 0) {
      set({ scene: 'mainMenu', sceneHistory: [], resumePauseOnGameReturn: false });
      return;
    }
    const target = sceneHistory[sceneHistory.length - 1];
    const shouldResumePause = target === 'game' && state.resumePauseOnGameReturn;
    set({
      scene: target,
      sceneHistory: sceneHistory.slice(0, -1),
      ...(shouldResumePause
        ? { isPaused: true, resumePauseOnGameReturn: false }
        : { resumePauseOnGameReturn: false }),
    });
  },

  // 開始遊戲
  startGame: async (pathName, difficulty = 'normal', endless = false, maxWaves = 0, customModifiers, customWaveSetId) => {
    const actualPathName = pathName;
    
    // 如果是 Mod 地圖，從 modStore 載入並加入 PATHS
    if (!PATHS[actualPathName]) {
      try {
        const { useModStore } = await import('./modStore');
        const mods = useModStore.getState().mods;
        for (const mod of mods) {
          if (!mod.enabled) continue;
          const modMap = mod.content.maps?.find((m) => m.id === actualPathName);
          if (modMap) {
            (PATHS as Record<string, PathConfig>)[actualPathName] = {
              name: modMap.name,
              description: modMap.description,
              difficulty: modMap.difficulty,
              category: modMap.category,
              waypoints: modMap.waypoints,
              segments: modMap.segments,
              startSegmentId: modMap.startSegmentId,
              blockedCells: modMap.blockedCells,
            };
            break;
          }
        }
      } catch (e) {
        console.error('Error in mod map loading logic:', e);
      }
    }
    
    // 獲取難度修飾器（自定義難度使用傳入的修飾器）
    let baseModifiers = difficulty === 'custom' && customModifiers 
      ? customModifiers 
      : DIFFICULTY_MODIFIERS[difficulty] || DIFFICULTY_MODIFIERS['normal'];

    const modifiers = applyTalentToDifficultyModifiers(baseModifiers);
    
    const grid = initializeGrid(actualPathName);

    const statsGameMode = resolveStatsGameMode({
      endless,
      customWaveSetId,
    });
    useStatsStore.getState().startGameTracking(statsGameMode);
    
    set({
      // 局內狀態全部來自單一工廠，與 resetGame 共用
      ...createEmptyMatchState(),
      scene: 'game',
      isPlaying: true,
      isPaused: false,
      selectedPath: actualPathName,
      grid,
      gameDifficulty: difficulty,
      difficultyModifiers: modifiers,
      money: modifiers.startingMoney ?? GAME_CONSTANTS.INITIAL_MONEY,
      health: modifiers.startingHealth ?? GAME_CONSTANTS.INITIAL_HEALTH,
      endlessMode: endless,
      maxWaves: endless ? 0 : maxWaves,
      customWaveSetId,
      quickPlaceMode: useSettingsStore.getState().gameplay.quickPlaceDefault,
      // 保存原始啟動參數（再玩一次 / 快速重試時完整復原本局設定）
      lastStartArgs: { pathName, difficulty, endless, maxWaves, customModifiers, customWaveSetId },
    });
    
    // 如果是教學模式，重置為 1 倍速
    try {
      import('./tutorialStore').then(m => {
        const tutorialStore = m.useTutorialStore.getState();
        if (tutorialStore.isActive) {
          get().setGameSpeed(1);
        }
      }).catch(e => console.error(e));
    } catch (e) { /* ignore */ }
  },

  pauseGame: () => {
    set({ isPaused: true });
    void import('./achievementStore').then((m) => {
      m.useAchievementStore.getState().onPauseUsed();
    }).catch(() => { /* 載入失敗時忽略，不影響暫停流程 */ });
  },
  resumeGame: () => {
    set({ isPaused: false, pauseEncyclopediaFocus: null });
    // 當從暫停恢復時，如果有教學模式正在等待啟動，嘗試啟動它
    try {
      import('./tutorialStore').then(m => {
        const tutorialStore = m.useTutorialStore.getState();
        if (tutorialStore.isActive) {
          get().setGameSpeed(1);
        }
      }).catch(() => { /* 載入失敗時忽略，不影響恢復流程 */ });
    } catch (e) { /* ignore */ }
  },
  
  setVictory: () => { set({ isVictory: true, isPlaying: false }); playVictory(); },
  setGameSpeed: (speed) => {
    saveGameSpeed(speed);
    
    // 如果是教學模式，且正在等待敵人死亡，可以允許短暫加速，但如果是為了確保教學流程正常，我們不要覆蓋這個邏輯
    // 不過我們可以讓遊戲設定正常生效
    set({ gameSpeed: speed });
  },

  selectTowerType: (type) => set({ selectedTowerType: type, selectedTower: null, multiSelectedTowerIds: [] }),
  selectTower: (tower) => set({ selectedTower: tower, selectedTowerType: null, multiSelectedTowerIds: [] }),
  setHoveredTile: (pos) => set({ hoveredTile: pos }),

  toggleTowerInMultiSelect: (towerId) => {
    const { multiSelectedTowerIds } = get();
    const isSelected = multiSelectedTowerIds.includes(towerId);
    set({
      multiSelectedTowerIds: isSelected
        ? multiSelectedTowerIds.filter((id) => id !== towerId)
        : [...multiSelectedTowerIds, towerId],
      selectedTower: null,
      selectedTowerType: null,
    });
  },

  clearMultiSelect: () => set({ multiSelectedTowerIds: [] }),

  selectAllTowersOfType: (type) => {
    const { towers } = get();
    set({
      multiSelectedTowerIds: towers.filter((t) => t.type === type).map((t) => t.id),
      selectedTower: null,
      selectedTowerType: null,
    });
  },

  selectAllTowers: () => {
    const { towers } = get();
    set({
      multiSelectedTowerIds: towers.map((t) => t.id),
      selectedTower: null,
      selectedTowerType: null,
    });
  },

  toggleTowerLock: (towerId) => {
    const { towers, selectedTower } = get();
    // 鎖定只是塔的欄位變化，格子只記 id → 不需要同步
    const newTowers = towers.map((t) => (t.id === towerId ? { ...t, locked: !t.locked } : t));
    set({
      towers: newTowers,
      selectedTower: selectedTower && selectedTower.id === towerId
        ? newTowers.find((t) => t.id === towerId) || null
        : selectedTower,
    });
  },

  batchUpgradeSelected: () => {
    const { multiSelectedTowerIds, towers, upgradeTower } = get();
    let upgraded = 0;
    let totalCost = 0;
    const selectedTowers = towers.filter((t) => multiSelectedTowerIds.includes(t.id));
    selectedTowers.forEach((tower) => {
      const moneyBefore = get().money;
      if (upgradeTower(tower)) {
        upgraded++;
        totalCost += moneyBefore - get().money;
      }
    });
    return { upgraded, cost: totalCost };
  },

  batchSellSelected: () => {
    const { multiSelectedTowerIds, towers, sellTower } = get();
    let sold = 0;
    let totalRefund = 0;
    const selectedTowers = towers.filter((t) => multiSelectedTowerIds.includes(t.id));
    selectedTowers.forEach((tower) => {
      const moneyBefore = get().money;
      sellTower(tower);
      sold++;
      totalRefund += get().money - moneyBefore;
    });
    set({ multiSelectedTowerIds: [] });
    return { sold, refund: totalRefund };
  },

  // 塔防操作（從 gameStoreActions.ts 導入）
  ...createTowerActions(get, set),

  // 波次管理（從 gameStoreWave.ts 導入）
  ...createWaveActions(get, set),

  // 遊戲迴圈（從 gameStoreLoop.ts 導入）
  ...createLoopActions(get, set),

  // 音效設定
  toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
  toggleMusic: () => set(state => ({ musicEnabled: !state.musicEnabled })),
  setSoundVolume: (volume) => set({ soundVolume: volume }),
  setMusicVolume: (volume) => set({ musicVolume: volume }),

  // 快捷鍵
  setKeyBinding: (action, key) => set(state => ({
    keyBindings: { ...state.keyBindings, [action]: key }
  })),
  
  resetKeyBindings: () => {
    set({ keyBindings: DEFAULT_KEY_BINDINGS });
  },

  // 自動戰鬥系統（從 gameStoreAutoBattle.ts 導入）
  ...createAutoBattleActions(get, set),

  // 特效系統
  ...createEffectActions(get, set),

  // 玩家主動技能
  ...createPlayerSkillActions(get, set),

  // 壓力測試（Dev 面板）
  ...createStressTestActions(get, set),

  // 重置遊戲
  resetGame: () => set({
    // 與 startGame 共用同一份局內狀態工廠，避免兩份清單各自漂移
    ...createEmptyMatchState(),
    scene: 'mainMenu',
    sceneHistory: [],
    encyclopediaDeepLink: null,
    pauseEncyclopediaFocus: null,
    resumePauseOnGameReturn: false,
    isPlaying: false,
    isPaused: false,
    maxWaves: 15,
    quickPlaceMode: false,
    showTacticalView: false,
    autoBattleEnabled: false,
  }),
}),
    {
      name: 'guagua-game-prefs',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        soundVolume: state.soundVolume,
        musicVolume: state.musicVolume,
        keyBindings: state.keyBindings,
        gameSpeed: state.gameSpeed,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<GameStore>;
        const legacySpeed = getSavedGameSpeed();
        return {
          ...currentState,
          soundEnabled: persisted.soundEnabled ?? currentState.soundEnabled,
          musicEnabled: persisted.musicEnabled ?? currentState.musicEnabled,
          soundVolume: persisted.soundVolume ?? currentState.soundVolume,
          musicVolume: persisted.musicVolume ?? currentState.musicVolume,
          gameSpeed: persisted.gameSpeed ?? legacySpeed,
          keyBindings: {
            ...DEFAULT_KEY_BINDINGS,
            ...(persisted.keyBindings ?? {}),
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.gameSpeed != null) {
          saveGameSpeed(state.gameSpeed);
        }
        void import('@/services/musicService').then((m) => {
          m.syncMusic(undefined, true);
        }).catch(() => {
          // 音樂服務載入失敗（含測試環境已拆卸）時靜默忽略，不讓 rehydrate 失敗
        });
      },
    },
  ),
);
