import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useStatsStore } from '@/store/statsStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useCampaignStore } from '@/store/campaignStore';
import { PATHS, WAVE_CONFIGS, GAME_CONSTANTS, ENEMY_DATA, generateEndlessWaveConfig } from '@/data/gameData';
import { getSegmentMap } from '@/store/gameLoop/pathHelpers';
import { generateId, getTowerData } from '@/store/gameStoreUtils';
import { clearTowerIds } from '@/store/gridTower';
import { createFrameLoopGuard } from '@/utils/frameLoopGuard';
import { requestSellTower } from '@/store/sellConfirm';
import { time as perfTime, tickFrame as perfTickFrame } from '@/utils/perfMonitor';
import type { TowerType, Enemy } from '@/types/game';
import { useAchievementTracking } from '@/hooks/useAchievementTracking';
import { INTERACTIVE_TUTORIAL_STEPS, useTutorialStore } from '@/store/tutorialStore';
import { resolveTutorialHotkeyGate } from '@/data/tutorialPauseHotkey';
import { nextGameSpeed } from '@/data/gameSpeedPresets';
import { findPlayableWaveSet } from '@/utils/waveSets';
import { PLAYER_SKILLS } from '@/data/playerSkillData';
import type { PlayerSkillId } from '@/data/playerSkillData';
import { hasActiveSelection, resolveBackKeyAction, resolveMatchKeyAction } from '@/store/gameHotkeys';
import { calculateCampaignStars } from '@/utils/campaignStars';
import { getProtocolWaveMods } from '@/data/tacticalProtocolData';
import { shouldApplyQuickPlaceDefaultSync } from '@/data/quickPlaceSync';

// 遊戲場景效果 Hook 回傳值
export interface GameSceneEffectsReturn {
  countdown: number;
  showCountdown: boolean;
}

// 塔快捷鍵列表
const towerHotkeys: TowerType[] = ['basic', 'sniper', 'cannon', 'machine', 'frost', 'poison', 'laser', 'lightning', 'flame'];

// 主動技能快捷鍵 (Shift+0~9)
const playerSkillByDigit: Record<string, PlayerSkillId> = PLAYER_SKILLS.reduce(
  (acc, s) => ({ ...acc, [s.hotkey]: s.id }),
  {} as Record<string, PlayerSkillId>,
);

/**
 * 遊戲場景副作用 Hook
 * 包含：鍵盤快捷鍵、自動波次倒數、敵人生成、遊戲主迴圈
 */
export function useGameSceneEffects(): GameSceneEffectsReturn {
  // ===== Store 訂閱 =====
  const waveActive = useGameStore((s) => s.waveActive);
  const currentWave = useGameStore((s) => s.currentWave);
  const isPaused = useGameStore((s) => s.isPaused);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const gameSpeed = useGameStore((s) => s.gameSpeed);
  const spawnEnemy = useGameStore((s) => s.spawnEnemy);
  const updateEnemies = useGameStore((s) => s.updateEnemies);
  const takeDamage = useGameStore((s) => s.takeDamage);
  const selectedPath = useGameStore((s) => s.selectedPath);
  const startWave = useGameStore((s) => s.startWave);
  const pauseGame = useGameStore((s) => s.pauseGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const setGameSpeed = useGameStore((s) => s.setGameSpeed);
  const setScene = useGameStore((s) => s.setScene);
  const resetGame = useGameStore((s) => s.resetGame);
  const keyBindings = useGameStore((s) => s.keyBindings);
  const runAutoBattleLogic = useGameStore((s) => s.runAutoBattleLogic);
  const selectedTower = useGameStore((s) => s.selectedTower);
  const selectedTowerType = useGameStore((s) => s.selectedTowerType);
  const multiSelectedTowerIds = useGameStore((s) => s.multiSelectedTowerIds);
  const fusionMode = useGameStore((s) => s.fusionMode);
  const selectTower = useGameStore((s) => s.selectTower);
  const clearMultiSelect = useGameStore((s) => s.clearMultiSelect);
  const cancelFusion = useGameStore((s) => s.cancelFusion);
  const upgradeTower = useGameStore((s) => s.upgradeTower);
  const sellTower = useGameStore((s) => s.sellTower);
  
  // 放置系統
  const selectTowerType = useGameStore((s) => s.selectTowerType);
  const undoPlacement = useGameStore((s) => s.undoPlacement);
  const redoPlacement = useGameStore((s) => s.redoPlacement);
  const toggleQuickPlaceMode = useGameStore((s) => s.toggleQuickPlaceMode);
  const setQuickPlaceMode = useGameStore((s) => s.setQuickPlaceMode);
  const toggleTacticalView = useGameStore((s) => s.toggleTacticalView);
  
  const updateTowers = useGameStore((s) => s.updateTowers);
  const updateProjectiles = useGameStore((s) => s.updateProjectiles);
  const updateSkills = useGameStore((s) => s.updateSkills);
  const updatePlayerSkills = useGameStore((s) => s.updatePlayerSkills);
  const updateVisualEffects = useGameStore((s) => s.updateVisualEffects);
  const addImpactParticles = useGameStore((s) => s.addImpactParticles);
  const addDeathAnimation = useGameStore((s) => s.addDeathAnimation);
  const addMoneyText = useGameStore((s) => s.addMoneyText);
  const activateSelectedSkill = useGameStore((s) => s.activateSkill);
  const activatePlayerSkill = useGameStore((s) => s.activatePlayerSkill);
  
  const endlessMode = useGameStore((s) => s.endlessMode);
  const endlessWaveConfig = useGameStore((s) => s.endlessWaveConfig);
  const setAllEnemiesSpawned = useGameStore((s) => s.setAllEnemiesSpawned);
  const maxWaves = useGameStore((s) => s.maxWaves);
  
  const autoStartWave = useSettingsStore((s) => s.gameplay.autoStartWave);
  const pendingProtocolChoices = useGameStore((s) => s.pendingProtocolChoices);
  const quickPlaceDefault = useSettingsStore((s) => s.gameplay.quickPlaceDefault);
  const confirmSell = useSettingsStore((s) => s.gameplay.confirmSell);

  // ===== Refs =====
  const spawnQueueRef = useRef<{ type: string; delay: number }[]>([]);
  // 使用「遊戲時間」累計器(ms)，受 gameSpeed 影響；非 Date.now() 真實時間
  const spawnElapsedRef = useRef(0);
  
  // ===== 成就追蹤 =====
  useAchievementTracking();

  // ===== 鍵盤快捷鍵處理 =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 遊戲結束時只允許返回
      if (isGameOver) {
        if (e.code === keyBindings.back) {
          resetGame();
          setScene('mainMenu');
        }
        return;
      }

      // 教學模式中禁止快捷鍵；暫停步驟例外放行暫停鍵（空白鍵仍是循環速度）
      const tutorial = useTutorialStore.getState();
      if (tutorial.isActive) {
        const step = INTERACTIVE_TUTORIAL_STEPS[tutorial.currentStepIndex];
        if (resolveTutorialHotkeyGate({
          stepAction: step?.action,
          keyCode: e.code,
          pauseKeyCode: keyBindings.pause,
        }) === 'pause_and_advance') {
          e.preventDefault();
          if (isPaused) resumeGame();
          else pauseGame();
          tutorial.checkAction('pause_game', 'tutorial-target-pause');
        }
        return;
      }

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;

      // 一顆鍵只做一件事（預設 1/2/3 是速度，不要同時選塔）
      const match = resolveMatchKeyAction({
        code: e.code,
        shiftKey: e.shiftKey,
        keyBindings,
      });

      if (match.kind === 'back') {
        e.preventDefault();
        const action = resolveBackKeyAction({
          isPaused,
          fusionMode,
          hasSelection: hasActiveSelection({
            selectedTower,
            selectedTowerType,
            multiSelectedCount: multiSelectedTowerIds.length,
          }),
        });
        if (action === 'resume') resumeGame();
        else if (action === 'pause') pauseGame();
        else if (action === 'cancel_fusion') cancelFusion();
        else {
          selectTower(null);
          selectTowerType(null);
          clearMultiSelect();
        }
        return;
      }
      if (match.kind === 'pause') {
        if (isPaused) resumeGame();
        else pauseGame();
        return;
      }
      if (match.kind === 'speed') {
        setGameSpeed(match.value);
        return;
      }
      if (match.kind === 'cycle_speed') {
        e.preventDefault();
        setGameSpeed(nextGameSpeed(gameSpeed));
        return;
      }
      if (match.kind === 'start_wave') {
        if (!waveActive) startWave();
        return;
      }
      if (match.kind === 'sell') {
        if (selectedTower) {
          const sellingDisabled = useGameStore.getState().mutatorRules?.sellingDisabled ?? false;
          const data = getTowerData(selectedTower.type);
          const intent = requestSellTower({
            towerId: selectedTower.id,
            name: selectedTower.customName || data?.name || selectedTower.type,
            cost: data?.cost ?? 0,
            confirmSell,
            locked: selectedTower.locked,
            sellingDisabled,
          });
          if (intent === 'sell_now') sellTower(selectedTower);
        }
        return;
      }
      if (match.kind === 'upgrade') {
        if (selectedTower) upgradeTower(selectedTower);
        return;
      }
      if (match.kind === 'player_skill') {
        const skillId = playerSkillByDigit[match.digit];
        if (skillId) {
          e.preventDefault();
          activatePlayerSkill(skillId);
        }
        return;
      }
      if (match.kind === 'select_tower') {
        if (match.index < towerHotkeys.length) {
          selectTowerType(towerHotkeys[match.index]);
        }
        return;
      }
      
      // 撤銷 (Ctrl+Z)
      if (e.ctrlKey && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        undoPlacement();
      }
      
      // 重做 (Ctrl+Y 或 Ctrl+Shift+Z)
      if ((e.ctrlKey && e.code === 'KeyY') || (e.ctrlKey && e.shiftKey && e.code === 'KeyZ')) {
        e.preventDefault();
        redoPlacement();
      }
      
      // 快速放置模式切換 (Q)
      if (e.code === 'KeyQ') {
        toggleQuickPlaceMode();
      }
      
      // 戰術建議視圖切換 (T)
      if (e.code === 'KeyT') {
        toggleTacticalView();
      }
      
      // 啟動選中塔的技能 (E)
      if (e.code === 'KeyE' && selectedTower) {
        activateSelectedSkill(selectedTower.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyBindings, isPaused, isGameOver, gameSpeed, waveActive, selectedTower, selectedTowerType, multiSelectedTowerIds, fusionMode, pauseGame, resumeGame, setGameSpeed, startWave, sellTower, upgradeTower, resetGame, setScene, selectTower, selectTowerType, clearMultiSelect, cancelFusion, undoPlacement, redoPlacement, toggleQuickPlaceMode, toggleTacticalView, activateSelectedSkill, activatePlayerSkill, confirmSell]);

  // 套用「快速放置預設」：重掛戰場不要蓋掉這場用 Q 切過的狀態
  const lastQuickPlaceDefault = useRef<boolean | null>(null);
  useEffect(() => {
    if (!shouldApplyQuickPlaceDefaultSync({
      previousDefault: lastQuickPlaceDefault.current,
      nextDefault: quickPlaceDefault,
    })) {
      lastQuickPlaceDefault.current = quickPlaceDefault;
      return;
    }
    lastQuickPlaceDefault.current = quickPlaceDefault;
    setQuickPlaceMode(quickPlaceDefault);
  }, [quickPlaceDefault, setQuickPlaceMode]);
  
  // ===== 自動開始波次倒數 =====
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const tutorialActive = useTutorialStore((s) => s.isActive);

  useEffect(() => {
    // 清除之前的計時器
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // 如果是教學模式，不啟動自動倒數 (強制玩家手動點擊)
    if (tutorialActive) {
      return;
    }

    // 如果遊戲暫停、結束、或波次進行中，不啟動倒數
    if (isPaused || isGameOver || waveActive || !autoStartWave || pendingProtocolChoices) {
      return;
    }

    // 獲取無盡模式狀態和最大波次
    const isEndless = useGameStore.getState().endlessMode;
    const storeMaxWaves = useGameStore.getState().maxWaves;
    
    // 如果已經打完所有波次（非無盡模式且有設定最大波次），不再倒數
    if (!isEndless && storeMaxWaves > 0 && currentWave >= storeMaxWaves) {
      return;
    }

    // 開始倒數
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // 倒數結束，清除計時器並延遲觸發下一波（避免在 setState 中更新其他元件狀態）
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setTimeout(() => startWave(), 0);
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [waveActive, isPaused, isGameOver, currentWave, startWave, autoStartWave, tutorialActive, pendingProtocolChoices]);

  // ===== 波次敵人生成佇列 =====
  useEffect(() => {
    if (!waveActive || currentWave === 0) return;
    
    const gs = useGameStore.getState();
    const isCampaign = gs.isCampaign;
    const campaignLevelId = gs.campaignLevelId;
    const customWaveSetId = gs.customWaveSetId;

    // 根據遊戲模式選擇波次配置 (含 enemies + 可選 delay/reward)
    type WaveItem = { type: string; count: number; delay?: number };
    let waveConfig: { enemies: WaveItem[] } | null = null;
    let useCustomDelay = false;
    
    if (useTutorialStore.getState().isActive && currentWave === 1) {
      waveConfig = { enemies: [{ type: 'normal', count: 3 }] };
    } else if (customWaveSetId) {
      const waveSet = findPlayableWaveSet(customWaveSetId);
      if (waveSet && waveSet.waves[currentWave - 1]) {
        const w = waveSet.waves[currentWave - 1];
        waveConfig = { enemies: w.enemies };
        useCustomDelay = true;
      }
    } else if (endlessMode && endlessWaveConfig) {
      waveConfig = endlessWaveConfig;
    } else {
      if (isCampaign && campaignLevelId === 'ch1_lv3') {
        if (currentWave === 1) waveConfig = { enemies: [{ type: 'tank', count: 3 }, { type: 'heavy', count: 2 }] };
        else if (currentWave === 2) waveConfig = { enemies: [{ type: 'tank', count: 5 }, { type: 'healer', count: 2 }, { type: 'heavy', count: 3 }] };
        else if (currentWave === 3) waveConfig = { enemies: [{ type: 'boss', count: 1 }, { type: 'healer', count: 2 }, { type: 'shield', count: 4 }] };
      } else if (isCampaign && campaignLevelId === 'ch2_lv4') {
        if (currentWave === 1) waveConfig = { enemies: [{ type: 'armored', count: 4 }, { type: 'shield', count: 3 }] };
        else if (currentWave === 2) waveConfig = { enemies: [{ type: 'berserker', count: 5 }, { type: 'healer', count: 2 }] };
        else if (currentWave === 3) waveConfig = { enemies: [{ type: 'tank', count: 6 }, { type: 'spawner', count: 2 }, { type: 'shield', count: 4 }] };
        else if (currentWave === 4) waveConfig = { enemies: [{ type: 'boss', count: 1 }, { type: 'miniboss', count: 1 }, { type: 'armored', count: 3 }, { type: 'healer', count: 3 }] };
      } else if (isCampaign && campaignLevelId === 'ch3_lv5') {
        if (currentWave === 1) waveConfig = { enemies: [{ type: 'fast', count: 8 }, { type: 'stealth', count: 3 }] };
        else if (currentWave === 2) waveConfig = { enemies: [{ type: 'armored', count: 6 }, { type: 'mage', count: 3 }, { type: 'healer', count: 2 }] };
        else if (currentWave === 3) waveConfig = { enemies: [{ type: 'berserker', count: 6 }, { type: 'spawner', count: 3 }, { type: 'shield', count: 5 }] };
        else if (currentWave === 4) waveConfig = { enemies: [{ type: 'miniboss', count: 1 }, { type: 'tank', count: 4 }, { type: 'healer', count: 3 }, { type: 'mage', count: 3 }] };
        else if (currentWave === 5) waveConfig = { enemies: [{ type: 'boss', count: 2 }, { type: 'armored', count: 6 }, { type: 'healer', count: 4 }, { type: 'shield', count: 5 }] };
      }

      if (!waveConfig) {
        // 超出預定義 15 波（如選擇 20/30/50/100 波）時，改用無盡生成器動態補足
        waveConfig = WAVE_CONFIGS[currentWave - 1] ?? generateEndlessWaveConfig(currentWave);
      }
    }
    
    if (!waveConfig) return;

    const queue: { type: string; delay: number }[] = [];
    let delay = 0;
    
    waveConfig.enemies.forEach((enemyConfig) => {
      // 自訂波次中的 delay 是組與組之間的延遲
      if (useCustomDelay && enemyConfig.delay !== undefined && enemyConfig.delay > 0) {
        delay += enemyConfig.delay;
      }
      for (let i = 0; i < enemyConfig.count; i++) {
        queue.push({ type: enemyConfig.type, delay });
        delay += GAME_CONSTANTS.ENEMY_SPAWN_DELAY;
      }
    });

    spawnQueueRef.current = queue;
    spawnElapsedRef.current = 0;
    setAllEnemiesSpawned(false);
  }, [waveActive, currentWave, endlessMode, endlessWaveConfig, setAllEnemiesSpawned]);

  // ===== 遊戲主迴圈 =====
  useEffect(() => {
    if (isPaused || isGameOver) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // 單幀異常不得殺死整個迴圈：run() 永不向外拋出，排下一幀的動作放在 try 之外
    const frameGuard = createFrameLoopGuard({ label: 'game-loop' });

    const runFrame = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) * gameSpeed;
      lastTime = currentTime;

      // 生成敵人：使用「遊戲時間」累計，倍速會同步加快生成節奏
      if (waveActive && spawnQueueRef.current.length > 0) {
        spawnElapsedRef.current += deltaTime;

        while (
          spawnQueueRef.current.length > 0 &&
          spawnElapsedRef.current >= spawnQueueRef.current[0].delay
        ) {
          const spawn = spawnQueueRef.current.shift()!;
          spawnEnemy(spawn.type as any);
        }

        const s = useGameStore.getState();
        if (spawnQueueRef.current.length === 0 && !s.allEnemiesSpawned) {
          s.setAllEnemiesSpawned(true);
        }
      }
      
      // 自動跳過波次：當所有敵人已生成且還有敵人存活時
      const storeState = useGameStore.getState();
      if (storeState.autoSkipWave && storeState.allEnemiesSpawned && storeState.enemies.length > 0) {
        storeState.skipWave();
      }

      perfTime('updateEnemies', () => updateEnemies(deltaTime, 50));
      perfTime('updateTowers', () => updateTowers(deltaTime));
      perfTime('updateProjectiles', () => updateProjectiles(deltaTime));
      perfTime('updateVisualEffects', () => updateVisualEffects(deltaTime));
      perfTime('updateSkills', () => updateSkills());
      perfTime('updatePlayerSkills', () => updatePlayerSkills());
      perfTime('runAutoBattleLogic', () => runAutoBattleLogic());

      perfTime('removeAndReward', () => {
        const path = PATHS[selectedPath];
        const isAdvancedMap = path.category === 'advanced' && path.segments && path.segments.length > 0;
        const segMap = isAdvancedMap ? getSegmentMap(path) : null;

        const currentEnemies = useGameStore.getState().enemies;
        const enemiesToRemove: string[] = [];
        let damageCount = 0;

        for (const enemy of currentEnemies) {
          if (enemy.health <= 0) {
            enemiesToRemove.push(enemy.id);
          } else if (isAdvancedMap && enemy.currentSegmentId) {
            const seg = segMap!.get(enemy.currentSegmentId);
            if (seg && seg.next.length === 0 && (enemy.segmentWaypointIndex ?? 0) >= seg.waypoints.length - 1) {
              damageCount++;
              enemiesToRemove.push(enemy.id);
            }
          } else if (!isAdvancedMap && enemy.pathIndex >= path.waypoints.length - 1) {
            damageCount++;
            enemiesToRemove.push(enemy.id);
          }
        }

        if (damageCount > 0) {
          takeDamage(damageCount);
          useGameStore.getState().addShake(4);
          useStatsStore.getState().trackDamageTaken(damageCount);
        }
        if (enemiesToRemove.length > 0) {
          const removeSet = new Set(enemiesToRemove);
          let rewardTotal = 0;
          const killedEnemies: typeof currentEnemies = [];
          for (const enemy of currentEnemies) {
            if (removeSet.has(enemy.id) && enemy.health <= 0) {
              rewardTotal += enemy.reward;
              killedEnemies.push(enemy);
            }
          }

          // ===== 死亡能力結算：生產敵人分裂 + 爆破敵人自爆 =====
          const stateForDeath = useGameStore.getState();
          const spawnedChildren: Enemy[] = [];
          const towerBombDamage: Record<string, number> = {};
          for (const e of killedEnemies) {
            const deadData = ENEMY_DATA[e.type];

            // 生產敵人：死亡時分裂出小型敵人（繼承死亡位置與路徑進度）
            if (deadData?.spawnOnDeath) {
              const childData = ENEMY_DATA[deadData.spawnOnDeath.type];
              if (childData) {
                const mods = stateForDeath.difficultyModifiers;
                const childHealth = Math.round(childData.health * mods.enemyHealthMult);
                const childShield = childData.shieldAmount
                  ? Math.round(childData.shieldAmount * mods.enemyHealthMult)
                  : undefined;
                for (let c = 0; c < deadData.spawnOnDeath.count; c++) {
                  spawnedChildren.push({
                    id: generateId(),
                    type: deadData.spawnOnDeath.type,
                    x: e.x + (Math.random() - 0.5) * 0.6,
                    y: e.y + (Math.random() - 0.5) * 0.6,
                    health: childHealth,
                    maxHealth: childHealth,
                    speed: childData.speed * mods.enemySpeedMult,
                    pathIndex: e.pathIndex,
                    progress: Math.max(0, e.progress - c * 0.06),
                    effects: [],
                    reward: Math.round(childData.reward * mods.enemyRewardMult),
                    size: childData.size,
                    spawnTime: Date.now(),
                    currentSegmentId: e.currentSegmentId,
                    segmentWaypointIndex: e.segmentWaypointIndex,
                    ...(childShield ? { shield: childShield, maxShield: childShield } : {}),
                  });
                }
              }
            }

            // 爆破敵人：死亡時爆炸，對範圍內的塔造成傷害（explosionRadius 單位 px，50px = 1 格）
            if (deadData?.ability === 'explode' && deadData.explosionRadius && deadData.explosionDamage) {
              const radiusTiles = deadData.explosionRadius / 50;
              const rSq = radiusTiles * radiusTiles;
              let hitAnyTower = false;
              for (const t of stateForDeath.towers) {
                const dx = t.gridPos.col - e.x;
                const dy = t.gridPos.row - e.y;
                if (dx * dx + dy * dy <= rSq) {
                  towerBombDamage[t.id] = (towerBombDamage[t.id] || 0) + deadData.explosionDamage;
                  hitAnyTower = true;
                }
              }
              addImpactParticles(e.x, e.y, '#ff6432', 16);
              stateForDeath.addShake(hitAnyTower ? 2.5 : 1.5);
            }
          }

          useGameStore.setState(state => ({
            enemies: [...state.enemies.filter(e => !removeSet.has(e.id)), ...spawnedChildren],
            money: state.money + rewardTotal,
            score: state.score + rewardTotal,
          }));

          // 套用爆炸傷害：可能摧毀塔 → 同步更新 Grid 與選中狀態
          if (Object.keys(towerBombDamage).length > 0) {
            const st = useGameStore.getState();
            const damagedTowers = st.towers.map(t => {
              const dmg = towerBombDamage[t.id] || 0;
              if (dmg > 0) {
                st.addDamageText(t.gridPos.col, t.gridPos.row, dmg, false, '#ff6432');
                return { ...t, health: t.health - dmg };
              }
              return t;
            });
            const aliveTowers = damagedTowers.filter(t => t.health > 0);
            const nextSelected = st.selectedTower
              ? (aliveTowers.find(t => t.id === st.selectedTower!.id) || null)
              : null;
            if (aliveTowers.length < damagedTowers.length) {
              const deadIds = new Set(
                damagedTowers.filter(t => t.health <= 0).map(t => t.id),
              );
              useGameStore.setState({
                towers: aliveTowers,
                grid: clearTowerIds(st.grid, deadIds),
                selectedTower: nextSelected,
              });
            } else {
              useGameStore.setState({ towers: aliveTowers, selectedTower: nextSelected });
            }
          }
          if (killedEnemies.length > 0) {
            // 視覺特效(buffer 機制, 不直接 setState)
            for (let i = 0; i < killedEnemies.length; i++) {
              const e = killedEnemies[i];
              const count = e.type === 'boss' ? 30 : (e.type === 'elite' ? 15 : 8);
              const enemyData = ENEMY_DATA[e.type];
              const color = enemyData?.color || '#ef4444';
              addImpactParticles(e.x, e.y, color, count);
              addDeathAnimation(e);
              if (e.reward > 0) addMoneyText(e.x, e.y, e.reward, true);
            }

            // 性能優化: 將「N 隻敵人 × 多 setState」合併為「2 次批次 setState」
            // (避免 checkAchievements 在 game loop 中被頻繁觸發, 拖慢 removeAndReward 階段)
            const kills: { type: string; isBoss: boolean; damage: number }[] = [];
            const killedTypes: typeof killedEnemies[number]['type'][] = [];
            for (let i = 0; i < killedEnemies.length; i++) {
              const enemy = killedEnemies[i];
              kills.push({
                type: enemy.type,
                isBoss: enemy.type === 'boss' || enemy.type === 'miniboss',
                damage: enemy.maxHealth,
              });
              killedTypes.push(enemy.type);
            }
            useAchievementStore.getState().batchOnEnemyKilled(kills, rewardTotal);
            useStatsStore.getState().trackEnemyKilledBatch(killedTypes, rewardTotal);
          }
        }

        const latestEnemies = useGameStore.getState().enemies;
        if (waveActive && spawnQueueRef.current.length === 0 && latestEnemies.length === 0) {
          const ending = useGameStore.getState();
          const clearBonus = getProtocolWaveMods(ending.activeProtocol).waveClearBonus;
          useGameStore.setState({ waveActive: false, activeProtocol: null });
          if (clearBonus > 0) {
            useGameStore.setState((s: { money: number }) => ({ money: s.money + clearBonus }));
            ending.addMoneyText(7, 4, clearBonus, true);
          }

          // 自訂波次組獎勵生效
          const stCustom = useGameStore.getState();
          if (stCustom.customWaveSetId) {
            const ws = findPlayableWaveSet(stCustom.customWaveSetId);
            const waveRew = ws?.waves[currentWave - 1]?.reward;
            if (typeof waveRew === 'number' && waveRew > 0) {
              useGameStore.setState((s: { money: number }) => ({ money: s.money + waveRew }));
              // 浮動金錢文字：波次獎勵（畫面中央）
              useGameStore.getState().addMoneyText(7, 4, waveRew, true);
            }
          }

          const statsStore = useStatsStore.getState();
          const latest = useGameStore.getState();
          statsStore.onWaveComplete(currentWave);
          statsStore.recordWaveSnapshot(
            currentWave,
            latest.money,
            latest.health,
            latest.towers.length
          );

          if (!latest.endlessMode && latest.maxWaves > 0 && currentWave >= latest.maxWaves) {
            latest.setVictory();

            if (latest.isCampaign && latest.campaignLevelId) {
              const stars = calculateCampaignStars(
                latest.health,
                latest.difficultyModifiers.startingHealth,
              );
              useCampaignStore.getState().completeLevel(latest.campaignLevelId, stars);
            }
          } else {
            latest.offerProtocolIfNeeded();
          }
        }
      });

    };

    const gameLoop = (currentTime: number) => {
      frameGuard.run(() => runFrame(currentTime));
      perfTickFrame();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  // deps 是完整的：列出的都是 store 動作或局內狀態（識別穩定、一變就該重建迴圈）；
  // 每幀會變的數值一律走 getState() 當下取，不進 deps（TD-17 判定：非債，別改成空陣列）
  }, [isPaused, isGameOver, waveActive, gameSpeed, selectedPath, currentWave, spawnEnemy, updateEnemies, updateTowers, updateProjectiles, updateSkills, updatePlayerSkills, takeDamage, runAutoBattleLogic]);

  // ===== 計算倒數顯示條件 =====
  const showCountdown = autoStartWave && !waveActive && !isPaused && !isGameOver && !pendingProtocolChoices && (endlessMode || maxWaves === 0 || currentWave < maxWaves);

  return { countdown, showCountdown };
}