// 塔防操作：放置、升級、出售、撤銷、技能、屬性等
import type { 
  Tower, GridPosition, TowerData, UpgradePath, TargetPriority 
} from '@/types/game';
import { GAME_CONSTANTS } from '@/data/gameData';
import { setTileTowerId } from './gridTower';
import { getTowerStatBonus } from '@/data/towerCombatStats';
import { canBatchUpgradeTower, getTowerUpgradeCost } from '@/data/towerUpgradeCost';
import { getTowerBuildCost } from '@/data/towerCost';
import { getTowerSellRefund } from '@/store/sellConfirm';
import { TOWER_SKILLS, SKILL_DATA, getSkillRangeCells, applySkillCooldownReduction } from '@/data/skillData';
import { tickTowerSkills } from '@/data/skillAura';
import { getTowerData, generateId, applyDamageToEnemy } from './gameStoreUtils';
import type { GameStore } from './gameStoreTypes';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from './tutorialStore';
import { notifyModScripts } from '@/mod-script/dispatch';
import { playBuild, playUpgrade } from '@/services/audioService';

const getAchievementStore = () => import('./achievementStore').then(m => m.useAchievementStore);
const getStatsStore = () => import('./statsStore').then(m => m.useStatsStore);
import { useDevStore } from './devStore';
import { useStatsStore } from './statsStore';
import { getFusionRecipe, isFusionTower, computeFusionCost } from '@/data/fusionRecipes';
import { getDiscountedTowerCost, getProtocolWaveMods } from '@/data/tacticalProtocolData';
import { getActiveSynergyKindIds, getSynergyModsForTower, toTowerRef } from '@/data/towerSynergyData';
import { defaultTargetPriority } from '@/data/towerTargeting';
import { applyFreezeBlast } from '@/data/combatStatus';

type GetState = () => GameStore;
type SetState = (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void;

export const createTowerActions = (get: GetState, set: SetState) => ({
  placeTower: (pos: GridPosition) => {
    const { grid, money, selectedTowerType, towers, placementHistory, placementHistoryIndex, quickPlaceMode, placementStats, difficultyModifiers, currentWave, protocolNextTowerDiscount } = get();
    if (!selectedTowerType) return false;

    const tile = grid[pos.row]?.[pos.col];
    if (!tile || tile.type !== 'empty' || tile.towerId) return false;
    
    const towerData = getTowerData(selectedTowerType);
    if (!towerData) return false;
    
    // 應用難度修飾器（費用算式與自動戰鬥、TowerButton 共用同一個純函式）
    const actualCost = getDiscountedTowerCost(
      getTowerBuildCost(towerData.cost, difficultyModifiers.towerCostMult),
      protocolNextTowerDiscount,
    );
    const dev = useDevStore.getState();
    if (!dev.infiniteMoney && money < actualCost) return false;

    // 獲取塔的技能
    const skillType = TOWER_SKILLS[selectedTowerType];
    
    const newTower: Tower = {
      id: generateId(),
      type: selectedTowerType,
      gridPos: pos,
      x: 0,
      y: 0,
      // 開啟「滿級塔」devToggle 時，新塔直接放置為最高等級
      level: dev.maxTowerLevel ? GAME_CONSTANTS.MAX_TOWER_LEVEL : 1,
      upgradePath: null,
      rotation: 0,
      target: null,
      lastFireTime: 0,
      kills: 0,
      totalDamage: 0,
      targetPriority: defaultTargetPriority(selectedTowerType),
      placedAt: Date.now(),
      health: 100,
      maxHealth: 100,
      skill: skillType ? {
        skillId: skillType,
        lastUsedTime: 0,
        isActive: false,
        activeUntil: 0,
      } : undefined,
    };

    const newGrid = setTileTowerId(grid, pos, newTower.id);

    // 更新放置歷史（刪除當前索引之後的歷史）
    const newHistory = placementHistory.slice(0, placementHistoryIndex + 1);
    newHistory.push({ tower: newTower, cost: actualCost });

    set({
      grid: newGrid,
      towers: [...towers, newTower],
      money: dev.infiniteMoney ? money : money - actualCost,
      placementHistory: newHistory,
      placementHistoryIndex: newHistory.length - 1,
      placementStats: {
        ...placementStats,
        totalPlaced: placementStats.totalPlaced + 1,
        totalSpent: placementStats.totalSpent + actualCost,
      },
      protocolNextTowerDiscount: 0,
      // 如果不是快速放置模式，清除選擇
      selectedTowerType: quickPlaceMode ? selectedTowerType : null,
    });

    // Mod 腳本：建塔事件
    notifyModScripts('onTowerPlaced', { towerType: selectedTowerType, row: pos.row, col: pos.col });

    // 追蹤成就
    getAchievementStore().then(store => {
      const api = store.getState();
      api.onTowerPlaced(selectedTowerType, actualCost, currentWave);
      api.onSynergyBoard(getActiveSynergyKindIds(get().towers.map(toTowerRef)));
    });
    
    // 追蹤統計
    getStatsStore().then(store => {
      store.getState().trackTowerPlaced(newTower.id, selectedTowerType, actualCost);
    });

    playBuild(); // 建造音
    return true;
  },

  upgradeTower: (tower: Tower, path?: UpgradePath) => {
    const { money, towers, upgradeHistory, upgradeStats, currentWave } = get();
    const maxLevel = GAME_CONSTANTS.MAX_TOWER_LEVEL;
    
    if (tower.level >= maxLevel) return false;
    
    const towerData = getTowerData(tower.type);
    if (!towerData) return false;
    
    // 計算升級費用：基礎成本 * (0.5 + 等級 * 0.25)，2級以後額外遞增
    const upgradeCost = getTowerUpgradeCost(towerData.cost, tower.level);
    const dev = useDevStore.getState();
    const freeUpgrade = dev.freeUpgrades || dev.infiniteMoney;
    if (!freeUpgrade && money < upgradeCost) return false;

    // 升級到等級2時必須選擇路線
    const newLevel = tower.level + 1;
    let newPath = tower.upgradePath;
    
    if (newLevel === 2) {
      // 升級到等級2時需要選擇路線
      if (!path) return false; // 必須提供路線
      newPath = path;
    } else if (newLevel >= 3) {
      // 升級到等級3以上時沿用之前的路線
      if (!tower.upgradePath) return false; // 等級2時應該已經選擇了路線
      newPath = tower.upgradePath;
    }

    const upgradeTime = Date.now();
    const newTowers = towers.map(t => 
      t.id === tower.id ? { ...t, level: newLevel, upgradePath: newPath, lastUpgradeTime: upgradeTime } : t
    );

    // 塔的資料只有 towers 一份：升級不必再同步 grid（舊模型的手寫雙寫已移除）
    // 記錄升級歷史
    const newHistory = [...upgradeHistory, {
      towerId: tower.id,
      fromLevel: tower.level,
      toLevel: newLevel,
      cost: upgradeCost,
      path: newPath || undefined,
    }];

    // 觸發升級動畫
    const newUpgradeAnimations = [...get().upgradeAnimations, {
      id: generateId(),
      towerId: tower.id,
      gridPos: tower.gridPos,
      newLevel,
      towerColor: towerData.color,
      startTime: upgradeTime,
      isMaxLevel: newLevel >= maxLevel,
    }];

    set({
      towers: newTowers,
      money: freeUpgrade ? money : money - upgradeCost,
      selectedTower: newTowers.find(t => t.id === tower.id) || null,
      upgradeHistory: newHistory,
      upgradeStats: {
        totalUpgrades: upgradeStats.totalUpgrades + 1,
        totalSpent: upgradeStats.totalSpent + (freeUpgrade ? 0 : upgradeCost),
        maxLevelReached: Math.max(upgradeStats.maxLevelReached, newLevel),
      },
      upgradeAnimations: newUpgradeAnimations,
    });

    // 追蹤成就
    const isMaxLevel = newLevel >= maxLevel;
    getAchievementStore().then(store => {
      store.getState().onTowerUpgraded(upgradeCost, isMaxLevel, tower.type, currentWave);
    });
    
    // 追蹤統計
    getStatsStore().then(store => {
      store.getState().trackTowerUpgraded(tower.id, upgradeCost, newLevel);
    });

    playUpgrade(); // 升級音
    return true;
  },

  sellTower: (tower: Tower) => {
    // 鎖定保護:鎖定的塔無法被出售
    if (tower.locked) return;
    const { towers, grid, money, placementStats, sellAnimations } = get();
    const towerData = getTowerData(tower.type);
    if (!towerData) return;
    const sellPrice = getTowerSellRefund(towerData.cost);

    const newTowers = towers.filter(t => t.id !== tower.id);
    const newGrid = setTileTowerId(grid, tower.gridPos, null);

    set({
      towers: newTowers,
      grid: newGrid,
      money: money + sellPrice,
      selectedTower: null,
      placementStats: {
        ...placementStats,
        totalSold: placementStats.totalSold + 1,
      },
      sellAnimations: [...sellAnimations, {
        id: tower.id,
        gridPos: tower.gridPos,
        towerColor: towerData.color,
        startTime: Date.now(),
        refundAmount: sellPrice,
      }],
    });

    // 浮動金錢文字（出售退款）
    get().addMoneyText(tower.gridPos.col, tower.gridPos.row, sellPrice, true);

    // 追蹤成就
    getAchievementStore().then(store => {
      store.getState().onTowerSold(sellPrice);
    });
    
    // 追蹤統計
    getStatsStore().then(store => {
      store.getState().trackTowerSold(tower.id, sellPrice);
    });
  },

  // 升級撤銷
  undoUpgrade: () => {
    const { upgradeHistory, towers, money, upgradeStats } = get();
    if (upgradeHistory.length === 0) return false;
    
    const lastUpgrade = upgradeHistory[upgradeHistory.length - 1];
    const tower = towers.find(t => t.id === lastUpgrade.towerId);
    if (!tower) return false;
    
    // 恢復塔的等級
    const newTowers = towers.map(t => {
      if (t.id !== lastUpgrade.towerId) return t;
      return {
        ...t,
        level: lastUpgrade.fromLevel,
        upgradePath: lastUpgrade.fromLevel < 2 ? null : t.upgradePath,
      };
    });
    
    set({
      towers: newTowers,
      money: money + lastUpgrade.cost,
      upgradeHistory: upgradeHistory.slice(0, -1),
      upgradeStats: {
        ...upgradeStats,
        totalUpgrades: Math.max(0, upgradeStats.totalUpgrades - 1),
        totalSpent: upgradeStats.totalSpent - lastUpgrade.cost,
      },
      selectedTower: newTowers.find(t => t.id === lastUpgrade.towerId) || null,
    });

    // 浮動金錢文字（撤銷升級退款）
    get().addMoneyText(tower.gridPos.col, tower.gridPos.row, lastUpgrade.cost, true);

    return true;
  },

  // 批量升級（升級所有可升級的塔）
  batchUpgrade: () => {
    const { towers, money } = get();
    const maxLevel = GAME_CONSTANTS.MAX_TOWER_LEVEL;
    let totalCost = 0;
    let upgraded = 0;
    let currentMoney = money;
    
    // 找出所有可升級的塔並按優先級排序
    const upgradableTowers = towers
      .filter(t => canBatchUpgradeTower(t, maxLevel))
      .map(t => {
        const towerData = getTowerData(t.type);
        const cost = towerData ? getTowerUpgradeCost(towerData.cost, t.level) : 0;
        return { tower: t, cost };
      })
      .filter(({ cost }) => cost > 0)
      .sort((a, b) => a.cost - b.cost); // 按費用排序
    
    // 逐個升級
    for (const { tower, cost } of upgradableTowers) {
      if (currentMoney >= cost) {
        const success = get().upgradeTower(tower, tower.upgradePath || undefined);
        if (success) {
          currentMoney -= cost;
          totalCost += cost;
          upgraded++;
        }
      }
    }
    
    return { upgraded, cost: totalCost };
  },

  // 切換自動升級
  toggleAutoUpgrade: () => {
    set(state => ({ autoUpgradeEnabled: !state.autoUpgradeEnabled }));
  },

  // 設置自動升級優先級
  setAutoUpgradePriority: (priority: 'damage' | 'range' | 'cost') => {
    set({ autoUpgradePriority: priority });
  },

  // 獲取升級預覽
  getUpgradePreview: (tower: Tower) => {
    const towerData = getTowerData(tower.type);
    if (!towerData) return null;
    
    const maxLevel = GAME_CONSTANTS.MAX_TOWER_LEVEL;
    if (tower.level >= maxLevel) return null;
    
    const cost = getTowerUpgradeCost(towerData.cost, tower.level);
    const nextLevel = tower.level + 1;
    const bonus = getTowerStatBonus({
      type: tower.type,
      level: nextLevel,
      upgradePath: tower.upgradePath,
    });
    const stats: TowerData = {
      ...towerData,
      damage: Math.floor(towerData.damage * bonus.damageMultiplier),
      range: Math.floor(towerData.range * bonus.rangeMultiplier),
      fireRate: (towerData.fireRate || 1) * bonus.fireRateMultiplier,
    };
    
    return { stats, cost };
  },

  // 放置撤銷
  undoPlacement: () => {
    const { placementHistory, placementHistoryIndex, towers, grid, money } = get();
    if (placementHistoryIndex < 0) return false;
    
    const lastPlacement = placementHistory[placementHistoryIndex];
    if (!lastPlacement) return false;
    
    // 找到並移除塔
    const towerToRemove = towers.find(t => t.id === lastPlacement.tower.id);
    if (!towerToRemove) {
      // 如果塔已經不在場上 (可能被賣掉或摧毀了)，則無法復原放置
      return false;
    }
    
    const newTowers = towers.filter(t => t.id !== lastPlacement.tower.id);
    const newGrid = setTileTowerId(grid, towerToRemove.gridPos, null);
    
    set({
      towers: newTowers,
      grid: newGrid,
      money: money + lastPlacement.cost,
      placementHistoryIndex: placementHistoryIndex - 1,
    });

    // 浮動金錢文字（撤銷放置退款）
    get().addMoneyText(lastPlacement.tower.gridPos.col, lastPlacement.tower.gridPos.row, lastPlacement.cost, true);

    return true;
  },

  // 放置重做
  redoPlacement: () => {
    const { placementHistory, placementHistoryIndex, towers, grid, money } = get();
    if (placementHistoryIndex >= placementHistory.length - 1) return false;
    
    const nextPlacement = placementHistory[placementHistoryIndex + 1];
    if (!nextPlacement) return false;
    
    const towerData = getTowerData(nextPlacement.tower.type);
    const dev = useDevStore.getState();
    if (!towerData || (!dev.infiniteMoney && money < nextPlacement.cost)) return false;
    
    const pos = nextPlacement.tower.gridPos;
    const tile = grid[pos.row]?.[pos.col];
    if (!tile || tile.type !== 'empty' || tile.towerId) return false;
    
    const newGrid = setTileTowerId(grid, pos, nextPlacement.tower.id);
    
    set({
      towers: [...towers, nextPlacement.tower],
      grid: newGrid,
      money: dev.infiniteMoney ? money : money - nextPlacement.cost,
      placementHistoryIndex: placementHistoryIndex + 1,
    });
    
    return true;
  },

  // 切換快速放置模式
  toggleQuickPlaceMode: () => {
    set(state => ({ quickPlaceMode: !state.quickPlaceMode }));
  },

  setQuickPlaceMode: (enabled: boolean) => {
    set({ quickPlaceMode: enabled });
  },

  // 切換戰術建議視圖
  toggleTacticalView: () => {
    set(state => ({ showTacticalView: !state.showTacticalView }));
  },

  // 清除放置歷史
  clearPlacementHistory: () => {
    set({ placementHistory: [], placementHistoryIndex: -1 });
  },

  // 啟動技能
  activateSkill: (towerId: string) => {
    const { towers, enemies } = get();
    const tower = towers.find(t => t.id === towerId);
    if (!tower || !tower.skill) return false;
    
    const skillData = SKILL_DATA[tower.skill.skillId];
    if (!skillData) return false;

    const towerData = getTowerData(tower.type);
    const updatedEnemies = [...enemies];
    const tw = tower;
    


    // 檢查冷卻 (教學模式下可無視冷卻)
    const now = Date.now();
    let isTutorialForce = false;
    try {
      if (useTutorialStore.getState().isActive) {
        const step = useTutorialStore.getState();
        const action = INTERACTIVE_TUTORIAL_STEPS[step.currentStepIndex]?.action;
        if (action === 'use_skill') {
          isTutorialForce = true;
        }
      }
    } catch (e) { /* ignore */ }

    if (!isTutorialForce && now - tower.skill.lastUsedTime < skillData.cooldown) return false;

    // 追蹤成就：技能使用次數（skills_used 成就依賴此統計）
    getAchievementStore().then(store => {
      store.getState().onSkillUsed();
    });
    
    // 更新技能狀態
    const updatedTowers = towers.map(t => {
      if (t.id !== towerId) return t;
      return {
        ...t,
        skill: {
          ...t.skill!,
          lastUsedTime: now,
          isActive: skillData.duration !== 0,
          activeUntil: skillData.duration > 0 ? now + skillData.duration : -1,
        },
      };
    });
    
    // 處理即時效果技能
    if (skillData.duration === 0) {
      switch (tower.skill.skillId) {
        case 'freeze_blast': {
          // 凍結範圍內所有敵人 (範圍 4 格)
          const freezeRange = getSkillRangeCells(skillData, 4);
          const updatedEnemies = enemies.map(enemy => {
            const dx = enemy.x - tower.gridPos.col;
            const dy = enemy.y - tower.gridPos.row;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= freezeRange) {
              const nextEffects = [...enemy.effects];
              applyFreezeBlast(nextEffects, now);
              return { ...enemy, effects: nextEffects };
            }
            return enemy;
          });
          const { selectedTower } = get();
          let updatedSelectedTower = selectedTower;
          if (selectedTower && selectedTower.id === towerId) {
            updatedSelectedTower = updatedTowers.find(t => t.id === towerId) || null;
          }
          set({ towers: updatedTowers, enemies: updatedEnemies, selectedTower: updatedSelectedTower });
          return true;
        }
        case 'repair': {
          // 減少周圍塔的冷卻
          // 修復技能範圍為 5 格
          const repairRange = getSkillRangeCells(skillData, 5);
          const repairedTowers = updatedTowers.map(t => {
            if (t.id === towerId || !t.skill) return t;
            const dx = t.gridPos.col - tower.gridPos.col;
            const dy = t.gridPos.row - tower.gridPos.row;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= repairRange) {
              const targetSkill = SKILL_DATA[t.skill.skillId];
              const nextUsed = applySkillCooldownReduction(
                t.skill.lastUsedTime,
                now,
                targetSkill?.cooldown ?? skillData.cooldown,
                skillData.effectMultiplier ?? 0.5,
              );
              return {
                ...t,
                skill: {
                  ...t.skill,
                  lastUsedTime: nextUsed,
                },
              };
            }
            return t;
          });
          
          const { selectedTower } = get();
          let updatedSelectedTower = selectedTower;
          if (selectedTower && selectedTower.id === towerId) {
            updatedSelectedTower = repairedTowers.find(t => t.id === towerId) || null;
          }
          set({ towers: repairedTowers, selectedTower: updatedSelectedTower });
          return true;
        }
        // ===== 融合塔技能：瞬發 AOE 效果 =====
        // 協助函式：對範圍內所有敵人套用效果（idx 為 updatedEnemies 索引）
        const forEachEnemyInRange = (range: number, fn: (e: typeof enemies[number], idx: number) => void) => {
          updatedEnemies.forEach((e, idx) => {
            if (e.health <= 0) return;
            const dx = e.x - tw.gridPos.col;
            const dy = e.y - tw.gridPos.row;
            if (dx * dx + dy * dy <= range * range) fn(e, idx);
          });
        };
        const applyDamageInRange = (range: number, dmg: number) => {
          let total = 0;
          let kills = 0;
          updatedEnemies.forEach((e) => {
            if (e.health <= 0) return;
            const dx = e.x - tw.gridPos.col;
            const dy = e.y - tw.gridPos.row;
            if (dx * dx + dy * dy > range * range) return;
            const out = applyDamageToEnemy(e, dmg, now);
            total += out.dealt;
            if (out.health <= 0) kills++;
            get().addDamageText(e.x, e.y, out.dealt, false, towerData?.color || '#fff');
          });
          if (total > 0) {
            const statsStore = useStatsStore.getState();
            statsStore.trackTowerDamage(towerId, total);
            for (let k = 0; k < kills; k++) statsStore.trackTowerKill(towerId);
          }
        };
        const skillRange = getSkillRangeCells(skillData, 4);
        switch (skillData.id) {
          case 'storm_surge': {
            // 全場連鎖閃電 + 群體減速
            forEachEnemyInRange(6, (e, idx) => {
              const newEffects = [...e.effects.filter(ef => ef.type !== 'slow'), {
                type: 'slow' as const, duration: 2500, startTime: now, value: 0.5,
              }];
              updatedEnemies[idx] = { ...e, effects: newEffects };
            });
            applyDamageInRange(6, (towerData?.damage || 50) * (skillData.effectMultiplier || 1.5));
            set({ towers: updatedTowers, enemies: updatedEnemies, selectedTower: get().selectedTower?.id === towerId ? updatedTowers.find(t => t.id === towerId) || null : get().selectedTower });
            get().addShake(2);
            return true;
          }
          case 'plague_burst': {
            // 大範圍施加灼燒 + 劇毒 DoT
            forEachEnemyInRange(skillRange, (e, idx) => {
              const burnDps = (towerData?.damagePerSecond || 40) * 0.6;
              const poisonDps = (towerData?.poisonDamage || 8);
              const newEffects = [...e.effects];
              const burnIdx = newEffects.findIndex(ef => ef.type === 'burn');
              if (burnIdx >= 0) newEffects[burnIdx] = { ...newEffects[burnIdx], startTime: now, duration: 4000, value: burnDps };
              else newEffects.push({ type: 'burn', value: burnDps, duration: 4000, startTime: now, stacks: 1 });
              const poisonIdx = newEffects.findIndex(ef => ef.type === 'poison');
              if (poisonIdx >= 0) newEffects[poisonIdx] = { ...newEffects[poisonIdx], startTime: now, duration: 4000, value: poisonDps };
              else newEffects.push({ type: 'poison', value: poisonDps, duration: 4000, startTime: now, stacks: 1 });
              updatedEnemies[idx] = { ...e, effects: newEffects };
            });
            set({ towers: updatedTowers, enemies: updatedEnemies, selectedTower: get().selectedTower?.id === towerId ? updatedTowers.find(t => t.id === towerId) || null : get().selectedTower });
            return true;
          }
          case 'siege_volley': {
            // 大範圍重型濺射（以高額瞬發傷害近似）
            applyDamageInRange(8, (towerData?.damage || 90) * (skillData.effectMultiplier || 2.5));
            set({ towers: updatedTowers, enemies: updatedEnemies, selectedTower: get().selectedTower?.id === towerId ? updatedTowers.find(t => t.id === towerId) || null : get().selectedTower });
            get().addShake(3);
            return true;
          }
          case 'tempest_blast': {
            // 全場擊退 + 脈衝傷害
            forEachEnemyInRange(skillRange, (e, idx) => {
              const newEffects = [...e.effects, { type: 'wind' as const, duration: 600, startTime: now, value: 3 }];
              updatedEnemies[idx] = { ...e, effects: newEffects };
            });
            applyDamageInRange(skillRange, (towerData?.damage || 45) * (skillData.effectMultiplier || 1.8));
            set({ towers: updatedTowers, enemies: updatedEnemies, selectedTower: get().selectedTower?.id === towerId ? updatedTowers.find(t => t.id === towerId) || null : get().selectedTower });
            get().addShake(2.5);
            return true;
          }
        }
      }
    }
    
    const ticked = tickTowerSkills(updatedTowers, get().enemies, now);
    const { selectedTower } = get();
    let updatedSelectedTower = selectedTower;
    if (selectedTower && selectedTower.id === towerId) {
      updatedSelectedTower = ticked.towers.find(t => t.id === towerId) || null;
    }

    set({
      towers: ticked.towers,
      enemies: ticked.enemies,
      selectedTower: updatedSelectedTower,
    });
    return true;
  },

  // 更新技能狀態（每幀調用）：過期關閉，並刷新毒霧／地獄火區域
  updateSkills: () => {
    const { towers, enemies } = get();
    const result = tickTowerSkills(towers, enemies, Date.now());
    if (result.towersChanged || result.enemiesChanged) {
      set({ towers: result.towers, enemies: result.enemies });
    }
  },

  // 獲取塔的實際屬性（包含升級加成）
  getTowerEffectiveStats: (tower: Tower) => {
    const baseTowerData = getTowerData(tower.type);
    if (!baseTowerData) return null;

    const bonus = getTowerStatBonus(tower);
    let stats: TowerData = {
      ...baseTowerData,
      damage: Math.floor(baseTowerData.damage * bonus.damageMultiplier),
      damagePerSecond: baseTowerData.damagePerSecond
        ? Math.floor(baseTowerData.damagePerSecond * bonus.damageMultiplier)
        : undefined,
      range: Math.floor(baseTowerData.range * bonus.rangeMultiplier),
      fireRate: (baseTowerData.fireRate || 1) * bonus.fireRateMultiplier,
      splashRadius: baseTowerData.splashRadius
        ? Math.floor(baseTowerData.splashRadius * bonus.splashRadiusMultiplier)
        : undefined,
      slowAmount: baseTowerData.slowAmount
        ? baseTowerData.slowAmount * bonus.slowAmountMultiplier
        : undefined,
      poisonDamage: baseTowerData.poisonDamage
        ? Math.floor(baseTowerData.poisonDamage * bonus.poisonDamageMultiplier)
        : undefined,
      chainCount: baseTowerData.chainCount
        ? baseTowerData.chainCount + bonus.chainCountBonus
        : bonus.chainCountBonus > 0 ? bonus.chainCountBonus : undefined,
    };
    
    // 應用技能加成
    if (tower.skill?.isActive) {
      const skillData = SKILL_DATA[tower.skill.skillId];
      if (skillData) {
        switch (tower.skill.skillId) {
          case 'overcharge':
            // 攻速提升
            stats.fireRate = (stats.fireRate || 1) * (skillData.effectMultiplier || 3);
            break;
          case 'chain_surge':
            // 連鎖數量翻倍
            if (stats.chainCount) {
              stats.chainCount = stats.chainCount * (skillData.effectMultiplier || 2);
            }
            break;
        }
      }
    }
    
    const protocolMods = getProtocolWaveMods(get().activeProtocol);
    const synergyMods = getSynergyModsForTower(
      toTowerRef(tower),
      get().towers.map(toTowerRef),
    );
    stats = {
      ...stats,
      fireRate: (stats.fireRate || 1) * protocolMods.fireRateMult * synergyMods.fireRateMult,
      range: stats.range * protocolMods.rangeMult * synergyMods.rangeMult,
      damage: Math.floor(stats.damage * synergyMods.damageMult * protocolMods.damageMult),
      damagePerSecond: stats.damagePerSecond
        ? Math.floor(stats.damagePerSecond * synergyMods.damageMult * protocolMods.damageMult)
        : undefined,
      moneyPerSecond: stats.moneyPerSecond
        ? stats.moneyPerSecond * synergyMods.incomeMult * protocolMods.incomeMult
        : undefined,
      critChance: (stats.critChance || 0) + protocolMods.critChanceAdd,
    };

    return stats;
  },

  setTowerPriority: (towerId: string, priority: TargetPriority) => {
    const { towers, selectedTower } = get();
    const newTowers = towers.map(t => 
      t.id === towerId ? { ...t, targetPriority: priority } : t
    );
    
    set({ 
      towers: newTowers,
      selectedTower: selectedTower?.id === towerId 
        ? { ...selectedTower, targetPriority: priority }
        : selectedTower
    });
  },

  renameTower: (towerId: string, name: string) => {
    const { towers, selectedTower } = get();
    const trimmedName = name.trim().slice(0, 20); // 最多 20 個字元
    const newTowers = towers.map(t =>
      t.id === towerId ? { ...t, customName: trimmedName || undefined } : t
    );

    // 名稱只存在 towers 一份，不需要同步 grid
    set({
      towers: newTowers,
      selectedTower: selectedTower?.id === towerId
        ? { ...selectedTower, customName: trimmedName || undefined }
        : selectedTower,
    });
  },

  // ===== 融合系統：雙塔合體 =====
  enterFusionMode: (towerId: string) => {
    const { towers } = get();
    const source = towers.find(t => t.id === towerId);
    // 融合塔本身不能作為來源再次合體
    if (!source || isFusionTower(source.type)) return;
    set({ fusionMode: true, fusionSourceId: towerId, selectedTower: source, fusionFundsShort: null });
  },

  cancelFusion: () => {
    set({ fusionMode: false, fusionSourceId: null, fusionFundsShort: null });
  },

  fuseTowers: (sourceId: string, targetId: string) => {
    const { towers, grid, money, fusionAnimations, difficultyModifiers } = get();
    if (sourceId === targetId) return false;

    const source = towers.find(t => t.id === sourceId);
    const target = towers.find(t => t.id === targetId);
    if (!source || !target) return false;
    // 融合塔不能作為來源再次合體；兩座來源也不能是融合塔
    if (isFusionTower(source.type) || isFusionTower(target.type)) return false;

    const recipe = getFusionRecipe(source.type, target.type);
    if (!recipe) return false;

    const dev = useDevStore.getState();
    // 融合費用：兩座來源塔的基礎成本各取 25%（受難度費用倍率影響）
    const sourceData = getTowerData(source.type);
    const targetData = getTowerData(target.type);
    const fusionCost = computeFusionCost(
      sourceData?.cost || 0,
      targetData?.cost || 0,
      difficultyModifiers.towerCostMult,
    );
    if (!dev.infiniteMoney && money < fusionCost) {
      set({ fusionFundsShort: fusionCost });
      return false;
    }

    const resultData = getTowerData(recipe.result);
    if (!resultData) return false;

    const skillType = TOWER_SKILLS[recipe.result];

    // 合體產物放置在 source 的格位，target 的格位清空
    const pos = source.gridPos;
    const newTower: Tower = {
      id: generateId(),
      type: recipe.result,
      gridPos: pos,
      x: 0,
      y: 0,
      level: 1,
      upgradePath: null,
      rotation: 0,
      target: null,
      lastFireTime: 0,
      kills: 0,
      totalDamage: 0,
      targetPriority: defaultTargetPriority(recipe.result),
      placedAt: Date.now(),
      health: 100,
      maxHealth: 100,
      fusedFrom: [source.type, target.type],
      skill: skillType ? {
        skillId: skillType,
        lastUsedTime: 0,
        isActive: false,
        activeUntil: 0,
      } : undefined,
    };

    const newTowers = towers
      .filter(t => t.id !== sourceId && t.id !== targetId)
      .concat(newTower);

    // 合體產物放在 source 格位、target 格位清空
    const clearedGrid = setTileTowerId(
      setTileTowerId(grid, source.gridPos, null),
      target.gridPos,
      null,
    );
    const newGrid = setTileTowerId(clearedGrid, pos, newTower.id);

    const newAnimations = [...fusionAnimations, {
      id: generateId(),
      gridPos: pos,
      resultType: recipe.result,
      startTime: Date.now(),
      colorA: sourceData?.color || '#888',
      colorB: targetData?.color || '#888',
    }];

    set({
      towers: newTowers,
      grid: newGrid,
      money: dev.infiniteMoney ? money : money - fusionCost,
      selectedTower: newTower,
      fusionMode: false,
      fusionSourceId: null,
      fusionFundsShort: null,
      fusionAnimations: newAnimations,
    });

    // 浮動金錢文字（融合費用）
    get().addMoneyText(pos.col, pos.row, fusionCost, false);
    playBuild();

    // 追蹤統計與成就
    getStatsStore().then(store => {
      store.getState().trackTowerPlaced(newTower.id, recipe.result, fusionCost);
    });
    getAchievementStore().then(store => {
      store.getState().onTowerFused();
    });

    return true;
  },
});
