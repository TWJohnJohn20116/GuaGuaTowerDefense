// 波次管理：開始波次、跳過波次、生成敵人、金幣與傷害
import type { Enemy, EnemyType, GridPosition } from '@/types/game';
import { 
  PATHS, ENEMY_DATA,
  generateEndlessWaveConfig 
} from '@/data/gameData';
import { generateId } from './gameStoreUtils';
import type { GameStore } from './gameStoreTypes';
import { playWaveStart, playLeak, playGameOver } from '@/services/audioService';
import {
  applyInstantGrant,
  getProtocolWaveMods,
  pickProtocolForStrategy,
  pickProtocolOffers,
  PROTOCOL_HEALTH_CAP_BONUS,
  PROTOCOL_SLOW_DURATION_MS,
  shouldOfferProtocol,
} from '@/data/tacticalProtocolData';
import { useTutorialStore } from './tutorialStore';

// 延遲導入成就 Store 以避免循環依賴
const getAchievementStore = () => import('./achievementStore').then(m => m.useAchievementStore);
import { useDevStore } from './devStore';

type GetState = () => GameStore;
type SetState = (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void;

export const createWaveActions = (get: GetState, set: SetState) => ({
  // 生成無盡模式波次
  generateEndlessWave: (waveNumber: number) => {
    return generateEndlessWaveConfig(waveNumber);
  },

  startWave: () => {
    const { currentWave, waveActive, endlessMode, maxWaves, pendingProtocolChoices } = get();
    if (waveActive) return;
    if (pendingProtocolChoices && pendingProtocolChoices.length > 0) return;
    // 唯一閘門為 maxWaves（0 = 無限）；超出 WAVE_CONFIGS 的波次由生成器動態補足
    if (!endlessMode && maxWaves > 0 && currentWave >= maxWaves) return;
    
    const newWave = currentWave + 1;
    
    // 無盡模式：生成新的波次配置
    if (endlessMode) {
      const endlessConfig = generateEndlessWaveConfig(newWave);
      set({ 
        waveActive: true, 
        currentWave: newWave,
        endlessWaveConfig: endlessConfig,
        allEnemiesSpawned: false
      });
    } else {
      set({ waveActive: true, currentWave: newWave, allEnemiesSpawned: false });
    }
    playWaveStart(); // 開波音
  },
  
  // 跳過當前波次（直接開始下一波）
  skipWave: () => {
    const { waveActive, allEnemiesSpawned, enemies, endlessMode, currentWave, maxWaves } = get();
    
    // 只有在所有敵人已生成且還有敵人存活時才能跳過
    if (!waveActive || !allEnemiesSpawned || enemies.length === 0) return;
    
    // 非無盡模式：檢查是否已經是最後一波（maxWaves 為唯一閘門）
    if (!endlessMode && maxWaves > 0 && currentWave >= maxWaves) return;
    
    // 直接結束當前波次，開始下一波
    const newWave = currentWave + 1;
    
    if (endlessMode) {
      const endlessConfig = generateEndlessWaveConfig(newWave);
      set({ 
        currentWave: newWave,
        endlessWaveConfig: endlessConfig,
        allEnemiesSpawned: false
      });
    } else {
      set({ currentWave: newWave, allEnemiesSpawned: false });
    }
  },
  
  // 切換自動跳過波次
  toggleAutoSkipWave: () => {
    set(state => ({ autoSkipWave: !state.autoSkipWave }));
  },

  setAutoSkipWaveEnabled: (enabled: boolean) => {
    set({ autoSkipWave: enabled });
  },
  
  // 設置所有敵人已生成狀態
  setAllEnemiesSpawned: (spawned: boolean) => {
    set({ allEnemiesSpawned: spawned });
  },

  addMoney: (amount: number) => set(state => ({ money: state.money + amount })),
  
  takeDamage: (amount: number) => {
    const dev = useDevStore.getState();
    if (dev.infiniteHealth || dev.godMode) return;

    // 聖盾結界生效中：基地免疫所有傷害
    if (get().isPlayerSkillActive?.('aegisBarrier')) return;

    const { health, activeProtocol } = get();
    const leakMult = getProtocolWaveMods(activeProtocol).leakDamageMult;
    const dealt = Math.max(0, Math.round(amount * leakMult));
    if (dealt <= 0) {
      playLeak();
      return;
    }
    const newHealth = health - dealt;
    
    if (newHealth <= 0) {
      // 切換到獨立的「遊戲結束」介面場景（非彈窗）
      set({ health: 0, isGameOver: true, isPlaying: false, isPaused: false, scene: 'gameOver' });
      playGameOver(); // 失敗音
    } else {
      set({ health: newHealth });
      playLeak(); // 漏怪扣血音
    }

    // 追蹤成就
    getAchievementStore().then(store => {
      store.getState().onDamageTaken(dealt);
    });
  },

  offerProtocolIfNeeded: () => {
    const state = get();
    if (state.pendingProtocolChoices && state.pendingProtocolChoices.length > 0) return;
    const tutorialActive = useTutorialStore.getState().isActive;
    if (!shouldOfferProtocol(state.currentWave, tutorialActive, {
      maxWaves: state.maxWaves,
      endlessMode: state.endlessMode,
    })) return;

    const offers = pickProtocolOffers(
      state.currentWave,
      state.selectedPath,
      state.protocolHistory.slice(-6),
    );
    set({ pendingProtocolChoices: offers });

    if (state.autoBattleEnabled) {
      const picked = pickProtocolForStrategy(offers, state.autoBattleStrategy);
      get().chooseProtocol(picked.id);
      get().addAutoBattleLog(
        'analysis',
        `戰術協議：${picked.name}`,
        picked.description,
      );
    }
  },

  chooseProtocol: (id: string) => {
    const { pendingProtocolChoices } = get();
    if (!pendingProtocolChoices || pendingProtocolChoices.length === 0) return false;
    const picked = pendingProtocolChoices.find((p) => p.id === id);
    if (!picked) return false;

    const grant = applyInstantGrant(picked);
    const startingHealth = get().difficultyModifiers.startingHealth;
    const healthCap = startingHealth + PROTOCOL_HEALTH_CAP_BONUS;

    set((state) => ({
      pendingProtocolChoices: null,
      activeProtocol: picked.duration === 'nextWave' ? picked : state.activeProtocol,
      protocolHistory: [...state.protocolHistory, picked.id],
      money: state.money + grant.money,
      health: Math.min(healthCap, state.health + grant.health),
      protocolNextTowerDiscount: grant.nextTowerDiscount > 0
        ? grant.nextTowerDiscount
        : state.protocolNextTowerDiscount,
    }));

    import('./achievementStore').then((m) => {
      m.useAchievementStore.getState().onProtocolChosen(picked.id);
    });

    if (grant.money > 0) {
      get().addMoneyText(7, 4, grant.money, true);
    }

    get().startWave();
    return true;
  },

  spawnEnemy: (type: string) => {
    const { enemies, selectedPath, difficultyModifiers, mutatorRules, activeProtocol } = get();
    const path = PATHS[selectedPath];
    const enemyType = type as EnemyType;
    const enemyData = ENEMY_DATA[enemyType];
    
    // 應用難度修飾器
    const modifiedHealth = Math.round(enemyData.health * difficultyModifiers.enemyHealthMult);
    const modifiedSpeed = enemyData.speed * difficultyModifiers.enemySpeedMult;
    const modifiedReward = Math.round(enemyData.reward * difficultyModifiers.enemyRewardMult);

    // 進階地圖：從起始路段生成
    const isAdvanced = path.category === 'advanced' && path.segments && path.startSegmentId;
    let startPos: GridPosition;
    let segmentId: string | undefined;
    let segWpIndex: number | undefined;
    
    if (isAdvanced) {
      const startSeg = path.segments!.find(s => s.id === path.startSegmentId);
      startPos = startSeg ? startSeg.waypoints[0] : path.waypoints[0];
      segmentId = path.startSegmentId;
      segWpIndex = 0;
    } else {
      startPos = path.waypoints[0];
    }

    const protocolMods = getProtocolWaveMods(activeProtocol);
    const protocolHealth = Math.max(1, Math.round(modifiedHealth * protocolMods.enemyHealthMult));
    const protocolReward = Math.round(modifiedReward * protocolMods.enemyRewardMult);
    const protocolEffects = protocolMods.enemySlow > 0
      ? [{
          type: 'slow' as const,
          duration: PROTOCOL_SLOW_DURATION_MS,
          startTime: Date.now(),
          value: protocolMods.enemySlow,
        }]
      : [];

    // 護盾敵人：初始護盾（隨難度血量倍率與弱點掃描縮放）
    const shieldAmount = enemyData.shieldAmount
      ? Math.max(1, Math.round(enemyData.shieldAmount * difficultyModifiers.enemyHealthMult * protocolMods.enemyHealthMult))
      : undefined;

    const newEnemy: Enemy = {
      id: generateId(),
      type: enemyType,
      x: startPos.col,
      y: startPos.row,
      health: protocolHealth,
      maxHealth: protocolHealth,
      speed: modifiedSpeed,
      pathIndex: 0,
      progress: 0,
      effects: protocolEffects,
      reward: protocolReward,
      size: enemyData.size,
      spawnTime: Date.now(),
      currentSegmentId: segmentId,
      segmentWaypointIndex: segWpIndex,
      ...(shieldAmount ? { shield: shieldAmount, maxShield: shieldAmount } : {}),
    };

    // 突變挑戰：套用全場敵人詞綴
    const affix = mutatorRules?.enemyAffix;
    if (affix) {
      if (affix.healthMult && affix.healthMult !== 1) {
        const hp = Math.round(newEnemy.health * affix.healthMult);
        newEnemy.health = hp;
        newEnemy.maxHealth = hp;
      }
      if (affix.speedMult && affix.speedMult !== 1) {
        newEnemy.speed = newEnemy.speed * affix.speedMult;
      }
      if (affix.shieldAdd) {
        newEnemy.shield = (newEnemy.shield ?? 0) + affix.shieldAdd;
        newEnemy.maxShield = (newEnemy.maxShield ?? 0) + affix.shieldAdd;
      }
      if (affix.armorBonus) {
        newEnemy.armorBonus = affix.armorBonus;
      }
    }

    set({ enemies: [...enemies, newEnemy] });
  },
});
