import type { Tower, TowerType, UpgradePath } from '@/types/game';
import { PATHS, TOWER_DATA, ENEMY_DATA, GAME_CONSTANTS } from '@/data/gameData';
import { TOWER_SKILLS, SKILL_DATA, isSkillReady } from '@/data/skillData';
import { getTowerData, generateId } from './gameStoreUtils';
import { setTileTowerId } from './gridTower';
import type { GameStore } from './gameStoreTypes';
import { useShopStore } from './shopStore';
import { tryActivatePlayerSkill } from './gameStoreAutoBattlePlayerSkills';
import { getFusionRecipe, isFusionTower, computeFusionCost } from '@/data/fusionRecipes';
import { findSynergyRecipe, getActiveSynergyKindIds, toTowerRef } from '@/data/towerSynergyData';
import { defaultTargetPriority } from '@/data/towerTargeting';
import { canAutoUpgradeTower, getTowerUpgradeCost } from '@/data/towerUpgradeCost';
import { getTowerBuildCost } from '@/data/towerCost';

// 延遲導入成就 Store 以避免循環依賴
const getAchievementStore = () => import('./achievementStore').then(m => m.useAchievementStore);

type GetState = () => GameStore;
type SetState = (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void;

// 模組級別計時器（技能和略波使用獨立檢查間隔）
let lastSkillCheckTime = 0;
let lastSkipCheckTime = 0;
let lastPlayerSkillCheckTime = 0;

export const createAutoBattleActions = (get: GetState, set: SetState) => ({
  toggleAutoBattle: () => set(state => ({ 
    autoBattleEnabled: !state.autoBattleEnabled,
    autoBattleLastDecision: Date.now(),
    autoBattleLogs: !state.autoBattleEnabled ? [] : state.autoBattleLogs,
  })),
  
  setAutoBattleStrategy: (strategy: 'balanced' | 'economy' | 'aggressive' | 'defensive') => set({ autoBattleStrategy: strategy }),
  
  setAutoBattleConfig: (config: Partial<GameStore['autoBattleConfig']>) => set(state => ({
    autoBattleConfig: { ...state.autoBattleConfig, ...config }
  })),
  
  addAutoBattleLog: (type: 'place' | 'upgrade' | 'analysis' | 'skill' | 'skip' | 'sell', message: string, details?: string, thinking?: string[]) => {
    const now = Date.now();
    set(state => ({
      autoBattleLogs: [
        { id: `${now}-${Math.random().toString(36).slice(2, 6)}`, time: now, type, message, details, thinking },
        ...state.autoBattleLogs,
      ].slice(0, 500),
    }));
  },
  
  runAutoBattleLogic: () => {
    const state = get();
    
    if (!state.autoBattleEnabled || !state.isPlaying || state.isPaused || state.isGameOver) {
      return;
    }
    
    const now = Date.now();
    
    // 快速檢查：是否有任何計時器到期，避免每幀執行昂貴計算
    const skillGateOpen = now - lastSkillCheckTime >= 500;
    const playerSkillGateOpen = now - lastPlayerSkillCheckTime >= 700;
    const skipGateOpen = now - lastSkipCheckTime >= 2000;
    const placementGateMaybeOpen = now - state.autoBattleLastDecision >= 300;
    if (!skillGateOpen && !playerSkillGateOpen && !skipGateOpen && !placementGateMaybeOpen) return;
    
    const { money, towers, grid, selectedPath, enemies, health, currentWave, difficultyModifiers } = state;
    
    // 獲取當前地圖配置
    const pathConfig = PATHS[selectedPath];
    if (!pathConfig) return;
    
    const waypoints = pathConfig.waypoints;
    const tileSize = 40;

    // 統一處理普通地圖與進階地圖：取出所有路徑段的 waypoints 陣列
    // 進階地圖（advanced）使用 segments，普通地圖（normal/未指定）使用 waypoints
    const pathWaypointArrays: { col: number; row: number }[][] =
      (pathConfig.segments && pathConfig.segments.length > 0)
        ? pathConfig.segments.filter(s => s.waypoints.length >= 2).map(s => s.waypoints)
        : (waypoints.length >= 2 ? [waypoints] : []);
    
    // ===== 智能威脅評估（加強版）=====
    // 在原有基礎上加入：首領加成、速度因子、危險敵人類型加成
    const calculateThreatLevel = (): number => {
      if (enemies.length === 0) return 0;
      
      let threat = 0;
      const maxDist = Math.sqrt(GAME_CONSTANTS.GRID_COLS ** 2 + GAME_CONSTANTS.GRID_ROWS ** 2);
      let bossBonus = 0;
      
      for (const enemy of enemies) {
        let minDistToEnd = maxDist;
        
        if (pathConfig.segments && pathConfig.segments.length > 0) {
           const endSegments = pathConfig.segments.filter(s => s.next.length === 0);
           for (const seg of endSegments) {
             const endWp = seg.waypoints[seg.waypoints.length - 1];
             const dist = Math.sqrt((enemy.x - endWp.col) ** 2 + (enemy.y - endWp.row) ** 2);
             minDistToEnd = Math.min(minDistToEnd, dist);
           }
        } else {
           const endWp = waypoints[waypoints.length - 1];
           const dist = Math.sqrt((enemy.x - endWp.col) ** 2 + (enemy.y - endWp.row) ** 2);
           minDistToEnd = dist;
        }
        
        // 進度比例：距離終點越近進度越高 (0~1)
        const progressRatio = Math.max(0, 1 - (minDistToEnd / (maxDist * 0.7)));
        const enemyData = ENEMY_DATA[enemy.type];
        const healthRatio = enemy.health / (enemyData?.health || 100);
        
        // 速度因子：速度高的敵人在路徑後段更危險
        const speed = enemyData?.speed || 1;
        const speedFactor = 1 + Math.max(0, speed - 1) * progressRatio * 0.4;
        
        // 危險類型加成
        let dangerMul = 1;
        if (enemy.type === 'boss') { dangerMul = 1.8; bossBonus += 0.12; }
        else if (enemy.type === 'miniboss') { dangerMul = 1.4; bossBonus += 0.06; }
        else if (enemy.type === 'spawner') dangerMul = 1.3;
        else if (enemy.type === 'healer') dangerMul = 1.2;
        else if (enemy.type === 'jammer') dangerMul = 1.25;
        else if (enemy.type === 'escort') dangerMul = 1.3;
        else if (enemy.type === 'tank' || enemy.type === 'heavy' || enemy.type === 'armored') dangerMul = 1.15;
        
        threat += progressRatio * healthRatio * speedFactor * dangerMul * 0.3;
      }
      
      threat += (1 - health / GAME_CONSTANTS.INITIAL_HEALTH) * 0.3;
      threat += Math.min(enemies.length / 10, 0.4);
      threat += Math.min(bossBonus, 0.25);
      
      return Math.min(threat, 1);
    };
    
    const threatLevel = calculateThreatLevel();
    const strategy = state.autoBattleStrategy;
    
    // ===== 快速決策：技能啟動（每 500ms）=====
    if (state.autoBattleConfig.useSkills && now - lastSkillCheckTime >= 500 && enemies.length > 0) {
      lastSkillCheckTime = now;
      
      const skillThreshMult = strategy === 'aggressive' ? 0.7 : strategy === 'economy' ? 1.5 : strategy === 'defensive' ? 0.9 : 1.0;
      let skillsUsed = 0;
      
      const skillCandidates: { towerId: string; priority: number; nearbyCount: number; hasBoss: boolean; skillId: string; towerType: string; col: number; row: number }[] = [];
      
      for (const tower of towers) {
        if (!tower.skill || tower.type === 'money') continue;
        const skillData = SKILL_DATA[tower.skill.skillId];
        if (!skillData) continue;
        if (!isSkillReady(tower.skill.lastUsedTime, skillData.cooldown)) continue;
        if (tower.skill.isActive) continue;
        
        const towerData = getTowerData(tower.type);
        const range = towerData?.range || 3;
        let nearbyCount = 0;
        let hasBoss = false;
        let hasHighHP = false;
        
        for (const enemy of enemies) {
          const dx = enemy.x - tower.gridPos.col;
          const dy = enemy.y - tower.gridPos.row;
          if (Math.sqrt(dx * dx + dy * dy) <= range + 1) {
            nearbyCount++;
            if (enemy.type === 'boss' || enemy.type === 'miniboss') hasBoss = true;
            if (enemy.health > 100) hasHighHP = true;
          }
        }
        
        if (nearbyCount === 0) continue;
        
        let priority = 0;
        const sid = tower.skill.skillId;
        
        if (sid === 'freeze_blast') {
          priority = nearbyCount >= 3 ? 10 : hasBoss ? 8 : nearbyCount >= 2 ? 5 : 2;
        } else if (sid === 'sniper_focus' || sid === 'precision') {
          priority = hasBoss ? 10 : hasHighHP ? 6 : nearbyCount >= 1 ? 3 : 0;
        } else if (sid === 'barrage') {
          priority = nearbyCount >= 3 ? 9 : nearbyCount >= 2 ? 5 : 2;
        } else if (sid === 'overcharge') {
          priority = nearbyCount >= 2 ? 6 : threatLevel > 0.3 ? 4 : 2;
        } else if (sid === 'chain_surge') {
          priority = nearbyCount >= 3 ? 8 : nearbyCount >= 2 ? 5 : 2;
        } else if (sid === 'toxic_cloud' || sid === 'inferno') {
          priority = nearbyCount >= 2 ? 7 : hasBoss ? 5 : nearbyCount >= 1 ? 3 : 0;
        }
        
        priority *= (0.5 + threatLevel * 0.8);
        if (strategy === 'defensive' && (sid === 'freeze_blast' || sid === 'toxic_cloud')) priority *= 1.4;
        
        const threshold = 3 * skillThreshMult;
        if (priority >= threshold) {
          skillCandidates.push({ towerId: tower.id, priority, nearbyCount, hasBoss, skillId: tower.skill.skillId, towerType: tower.type, col: tower.gridPos.col, row: tower.gridPos.row });
        }
      }
      
      skillCandidates.sort((a, b) => b.priority - a.priority);
      
      for (const cand of skillCandidates) {
        if (skillsUsed >= 2) break;
        
        const result = get().activateSkill(cand.towerId);
        if (!result) continue;
        skillsUsed++;
        
        const skillData = SKILL_DATA[cand.skillId as keyof typeof SKILL_DATA];
        const towerData = getTowerData(cand.towerType as any);
        const sName = strategy === 'balanced' ? '平衡' : strategy === 'economy' ? '經濟' : strategy === 'aggressive' ? '積極' : '防守';
        
        const thinkingSteps = [
          `[ 策略 ] ${sName} - 技能評估`,
          `[ 局勢 ] 威脅 ${(threatLevel * 100).toFixed(0)}% | 敵人 ${enemies.length}`,
          `[ 目標 ] ${towerData?.name || cand.towerType} @ (${cand.col}, ${cand.row})`,
          `[ 偵測 ] 範圍內 ${cand.nearbyCount} 敵人 ${cand.hasBoss ? '(含首領)' : ''}`,
          `[ 判定 ] 優先度 ${cand.priority.toFixed(1)} / 閾值 ${(3 * skillThreshMult).toFixed(1)}`,
          `[ 執行 ] ✓ 啟動技能: ${skillData.name}`
        ];
        
        get().addAutoBattleLog('skill', `${skillData.icon} ${towerData?.name} 使用 ${skillData.name}`,
          `${cand.nearbyCount} 敵人${cand.hasBoss ? ' | Boss' : ''} | 優先度 ${cand.priority.toFixed(1)}`, thinkingSteps);
      }
    }
    
    // ===== 玩家主動技能釋放（每 700ms 評估一次，避免過於頻繁）=====
    if (state.autoBattleConfig.useSkills && now - lastPlayerSkillCheckTime >= 700) {
      lastPlayerSkillCheckTime = now;
      tryActivatePlayerSkill(get, threatLevel);
    }
    
    // ===== 中速決策：智能略波（每 2000ms）=====
    if (state.autoBattleConfig.autoSkip && now - lastSkipCheckTime >= 2000) {
      lastSkipCheckTime = now;
      
      const { waveActive, allEnemiesSpawned } = state;
      
      if (waveActive && allEnemiesSpawned && enemies.length > 0 && towers.length >= 3) {
        let totalDPS = 0;
        for (const tower of towers) {
          const data = getTowerData(tower.type);
          if (!data) continue;
          totalDPS += (data.damagePerSecond || data.damage * (data.fireRate || 1)) * (1 + (tower.level - 1) * 0.25);
        }
        
        const totalRemainingHP = enemies.reduce((sum, e) => sum + e.health, 0);
        const timeToKill = totalDPS > 0 ? totalRemainingHP / totalDPS : Infinity;
        
        let maxProgress = 0;
        const maxDist = Math.sqrt(GAME_CONSTANTS.GRID_COLS ** 2 + GAME_CONSTANTS.GRID_ROWS ** 2);
        for (const enemy of enemies) {
          let minDistToEnd = maxDist;
          if (pathConfig.segments && pathConfig.segments.length > 0) {
             const endSegments = pathConfig.segments.filter(s => s.next.length === 0);
             for (const seg of endSegments) {
               const endWp = seg.waypoints[seg.waypoints.length - 1];
               const dist = Math.sqrt((enemy.x - endWp.col) ** 2 + (enemy.y - endWp.row) ** 2);
               minDistToEnd = Math.min(minDistToEnd, dist);
             }
          } else {
             const endWp = waypoints[waypoints.length - 1];
             const dist = Math.sqrt((enemy.x - endWp.col) ** 2 + (enemy.y - endWp.row) ** 2);
             minDistToEnd = dist;
          }
          const prog = Math.max(0, 1 - (minDistToEnd / (maxDist * 0.7)));
          maxProgress = Math.max(maxProgress, prog);
        }
        
        const healthRatio = health / GAME_CONSTANTS.INITIAL_HEALTH;
        
        const th: Record<string, { time: number; hp: number; prog: number; maxE: number }> = {
          aggressive: { time: 8, hp: 0.4, prog: 0.75, maxE: 8 },
          balanced: { time: 5, hp: 0.6, prog: 0.6, maxE: 5 },
          economy: { time: 6, hp: 0.5, prog: 0.65, maxE: 6 },
          defensive: { time: 3, hp: 0.8, prog: 0.5, maxE: 3 },
        };
        
        const t = th[strategy] || th.balanced;
        
        const shouldSkip = (
          timeToKill < t.time &&
          healthRatio >= t.hp &&
          maxProgress < t.prog &&
          enemies.length <= t.maxE
        );
        
        if (shouldSkip) {
          get().skipWave();
          
          const sName = strategy === 'balanced' ? '平衡' : strategy === 'economy' ? '經濟' : strategy === 'aggressive' ? '積極' : '防守';
          
          const thinkingSteps = [
            `[ 策略 ] ${sName} - 略波評估`,
            `[ 局勢 ] 剩餘敵人 ${enemies.length} | 總血量 ${Math.floor(totalRemainingHP)}`,
            `[ 戰力 ] 總 DPS ${Math.floor(totalDPS)} | 預計清空 ${timeToKill.toFixed(1)}s (標準 <${t.time}s)`,
            `[ 狀態 ] 核心血量 ${(healthRatio * 100).toFixed(0)}% (標準 >${(t.hp * 100).toFixed(0)}%)`,
            `[ 進度 ] 敵軍最遠 ${(maxProgress * 100).toFixed(0)}% (標準 <${(t.prog * 100).toFixed(0)}%)`,
            `[ 執行 ] ✓ 條件達成，觸發提早略波`
          ];
          
          get().addAutoBattleLog('skip', `略過第 ${currentWave} 波`,
            `剩餘 ${enemies.length} 敵人 | ${timeToKill.toFixed(1)}s | HP ${(healthRatio * 100).toFixed(0)}%`, thinkingSteps);
        }
      }
    }
    
    // ===== 慢速決策：放塔/升級（原有邏輯）=====
    
    const decisionInterval = threatLevel > 0.7 ? 300 : threatLevel > 0.4 ? 600 : 1000;
    
    if (now - state.autoBattleLastDecision < decisionInterval) {
      return;
    }
    
    // ===== 分析當前塔陣容 =====
    const analyzeTowerComposition = () => {
      const comp = {
        damage: 0,
        slow: 0,
        aoe: 0,
        dps: 0,
        money: 0,
        total: towers.length,
        avgLevel: towers.length > 0 ? towers.reduce((sum, t) => sum + t.level, 0) / towers.length : 0,
        totalDPS: 0,
        incomePerSecond: 0,
      };
      
      for (const tower of towers) {
        const data = getTowerData(tower.type);
        if (!data) continue;
        
        const levelMultiplier = 1 + (tower.level - 1) * 0.25;
        comp.totalDPS += (data.damagePerSecond || data.damage * (data.fireRate || 1)) * levelMultiplier;
        
        if (tower.type === 'sniper' || tower.type === 'laser') comp.damage++;
        if (tower.type === 'frost' || tower.type === 'poison') comp.slow++;
        if (tower.type === 'cannon' || tower.type === 'lightning' || tower.type === 'pulse') comp.aoe++;
        if (tower.type === 'machine' || tower.type === 'flame') comp.dps++;
        if (tower.type === 'money') {
          comp.money++;
          const moneyData = data as typeof data & { moneyPerSecond?: number };
          if (moneyData.moneyPerSecond) {
            comp.incomePerSecond += moneyData.moneyPerSecond * (1 + (tower.level - 1) * 0.2);
          }
        }
      }
      
      return comp;
    };
    
    const towerComposition = analyzeTowerComposition();
    
    // ===== 智能策略參數 =====
    const unlockedTowers = useShopStore.getState().unlockedTowers;
    const filterUnlocked = (types: TowerType[]) => types.filter(t => unlockedTowers.includes(t));

    const calculateEconomyPriorities = (): TowerType[] => {
      const priorities: TowerType[] = [];
      if (towerComposition.money < 4) priorities.push('money');
      if (towerComposition.slow < 1) priorities.push('frost', 'poison');
      priorities.push('machine', 'basic');
      return filterUnlocked([...new Set(priorities)]);
    };
    
    const calculateSmartTowerPriorities = (): TowerType[] => {
      const priorities: TowerType[] = [];
      
      if (currentWave < 3 && towerComposition.money < 2) priorities.push('money');
      if (towerComposition.slow < 2) priorities.push('frost', 'poison');
      if (towerComposition.aoe < 2) priorities.push('cannon', 'lightning', 'flame');
      if (towerComposition.slow >= 1 && towerComposition.damage < 2) priorities.push('sniper', 'ballista', 'laser');
      if (towerComposition.dps < 2) priorities.push('machine', 'shotgun', 'flame');
      if (currentWave >= 3 && currentWave < 6 && towerComposition.money < 2 && money > 400) priorities.push('money');
      priorities.push('basic');
      
      return filterUnlocked([...new Set(priorities)]);
    };
    
    const getStrategyConfig = () => {
      const baseConfig = {
        balanced: {
          minReserve: 80,
          upgradeWeight: 0.5,
          towerPriorities: calculateSmartTowerPriorities(),
          maxMoneyTowers: 2,
        },
        economy: {
          minReserve: 100,
          upgradeWeight: 0.6,
          towerPriorities: calculateEconomyPriorities(),
          maxMoneyTowers: 4,
        },
        aggressive: {
          minReserve: 30,
          upgradeWeight: 0.3,
          towerPriorities: filterUnlocked(['cannon', 'sniper', 'ballista', 'laser', 'lightning', 'machine', 'shotgun', 'basic']),
          maxMoneyTowers: 1,
        },
        defensive: {
          minReserve: 60,
          upgradeWeight: 0.6,
          towerPriorities: filterUnlocked(['frost', 'poison', 'cannon', 'flame', 'money', 'basic']),
          maxMoneyTowers: 2,
        },
      };
      return baseConfig[strategy];
    };
    
    const config = getStrategyConfig();
    const adjustedMinReserve = threatLevel > 0.6 ? Math.floor(config.minReserve * 0.5) : config.minReserve;
    
    // 初始可用金幣檢查
    if (money - adjustedMinReserve < 50) return;
    
    // 如果關閉了自動升級和自動放置，就不做決策
    if (!state.autoBattleConfig.autoUpgrade && !state.autoBattleConfig.autoPlace) return;
    
    // ===== 批量決策上限（根據策略調整） =====
    const maxActions: Record<string, number> = { aggressive: 5, balanced: 4, economy: 3, defensive: 3 };
    const maxActionsPerCycle = maxActions[strategy] || 4;
    
    // ===== 預先計算路徑相關資料（迴圈外只算一次）=====
    // 遍歷所有路徑段（含進階地圖的叉路），每段的相鄰 waypoint 對形成一條線段
    const pathSegments: { x1: number; y1: number; x2: number; y2: number; index: number; midCol: number; midRow: number }[] = [];
    {
      let segIdx = 0;
      for (const wps of pathWaypointArrays) {
        for (let i = 0; i < wps.length - 1; i++) {
          pathSegments.push({
            x1: wps[i].col * tileSize + tileSize / 2,
            y1: wps[i].row * tileSize + tileSize / 2,
            x2: wps[i + 1].col * tileSize + tileSize / 2,
            y2: wps[i + 1].row * tileSize + tileSize / 2,
            index: segIdx,
            midCol: (wps[i].col + wps[i + 1].col) / 2,
            midRow: (wps[i].row + wps[i + 1].row) / 2,
          });
          segIdx++;
        }
      }
    }

    // 戰略點：每段內的轉角 + 段端點（叉路口/匯合處），用 Set 去除重複
    const strategicPoints: { col: number; row: number; value: number }[] = [];
    {
      const seenPoints = new Set<string>();
      const addPoint = (col: number, row: number, value: number) => {
        const key = `${col},${row}`;
        if (seenPoints.has(key)) return;
        seenPoints.add(key);
        strategicPoints.push({ col, row, value });
      };
      for (const wps of pathWaypointArrays) {
        for (let i = 1; i < wps.length - 1; i++) {
          const prev = wps[i - 1];
          const curr = wps[i];
          const next = wps[i + 1];
          const dir1 = { x: curr.col - prev.col, y: curr.row - prev.row };
          const dir2 = { x: next.col - curr.col, y: next.row - curr.row };
          if (dir1.x !== dir2.x || dir1.y !== dir2.y) {
            addPoint(curr.col, curr.row, 3);
          }
        }
        if (wps.length > 0) {
          addPoint(wps[0].col, wps[0].row, 2);
        }
      }
    }
    
    const pointToSegDist = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lengthSq = dx * dx + dy * dy;
      if (lengthSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
      let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
      t = Math.max(0, Math.min(1, t));
      const nearestX = x1 + t * dx;
      const nearestY = y1 + t * dy;
      return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2);
    };

    // ===== 可變狀態（迴圈內會更新）=====
    let curMoney = money;
    let curTowers = [...towers];
    let curGrid = grid.map(row => row.map(tile => ({ ...tile })));
    let actionsExecuted = 0;
    let totalMoneySpent = 0;
    let towersPlacedCount = 0;
    let upgradesCount = 0;
    let upgradeSpent = 0;
    let maxLevelReached = state.upgradeStats.maxLevelReached;
    let towersSoldCount = 0;
    let fusionCount = 0;
    let moneyRefunded = 0;
    const sellAnimationsAdded: { id: string; gridPos: { col: number; row: number }; towerColor: string; startTime: number; refundAmount?: number }[] = [];
    // 自動戰鬥的升級動畫緩衝（金光環 / 等級數字飄字），稍後一次合併到 store
    const upgradeAnimationsAdded: GameStore['upgradeAnimations'] = [];
    const fusionAnimationsAdded: GameStore['fusionAnimations'] = [];
    // 飄字緩衝：放塔扣款、出售退款，戰後同步觸發 addMoneyText
    const moneyTextsToAdd: { col: number; row: number; amount: number; isGain: boolean }[] = [];
    // 成就追蹤佇列
    const achievementQueue: { type: 'place' | 'upgrade' | 'sell' | 'fusion'; towerType: TowerType; cost: number; isMaxLevel?: boolean; wave: number }[] = [];

    // ===== 拆塔決策（每個慢速 tick 最多拆 1 個塔，安全條件：威脅低 + 塔夠多 + 已過開局）=====
    if (state.autoBattleConfig.autoSell && curTowers.length >= 5 && threatLevel < 0.5 && currentWave >= 3) {
      let bestSell: {
        tower: Tower; sellPrice: number; coveredSegs: number; peerCoverage: number;
        strategicValue: number; score: number; reasons: string[];
      } | null = null;

      for (const t of curTowers) {
        const tdata = getTowerData(t.type);
        if (!tdata) continue;
        // 投資保護：等級 ≥3 不拆；剛放置不滿 10 秒不拆（避免買 → 立刻拆）
        if (t.level >= 3) continue;
        if (t.placedAt && now - t.placedAt < 10000) continue;

        const sellPrice = Math.floor(tdata.cost * 0.5);

        // 覆蓋的路徑段 + 段位冗餘度
        let coveredSegs = 0;
        let totalSegPeers = 0;
        for (const seg of pathSegments) {
          const dist = Math.sqrt((t.gridPos.col - seg.midCol) ** 2 + (t.gridPos.row - seg.midRow) ** 2);
          if (dist <= tdata.range) {
            coveredSegs++;
            let segPeers = 0;
            for (const peer of curTowers) {
              if (peer.id === t.id) continue;
              const pdata = getTowerData(peer.type);
              if (!pdata) continue;
              const pd = Math.sqrt((peer.gridPos.col - seg.midCol) ** 2 + (peer.gridPos.row - seg.midRow) ** 2);
              if (pd <= pdata.range) segPeers++;
            }
            totalSegPeers += segPeers;
          }
        }
        const peerCoverage = coveredSegs > 0 ? totalSegPeers / coveredSegs : 0;

        // 戰略點接近度（要地塔保護）
        let strategicValue = 0;
        for (const pt of strategicPoints) {
          const d = Math.sqrt((t.gridPos.col - pt.col) ** 2 + (t.gridPos.row - pt.row) ** 2);
          if (d <= 2) strategicValue += pt.value * (2 - d) / 2;
        }

        // 評分（正向：拆除動機；負向：投資保護）
        let score = 0;
        const reasons: string[] = [];
        if (coveredSegs === 0) { score += 6; reasons.push('完全無覆蓋'); }
        else if (coveredSegs === 1 && peerCoverage >= 2) { score += 3; reasons.push('段位冗餘'); }
        else if (peerCoverage >= 2.5) { score += 2; reasons.push('重複覆蓋'); }
        if (t.type === 'money' && coveredSegs >= 2) { score += 4; reasons.push('經濟塔佔用要地'); }
        if (currentWave >= 5 && t.kills <= 1 && t.totalDamage < 100 && t.level === 1) {
          score += 3; reasons.push('長期低績效');
        }
        score -= Math.min(t.kills / 5, 3);
        score -= Math.min(t.totalDamage / 1000, 3);
        score -= (t.level - 1) * 2;
        score -= strategicValue;

        if (score >= 4 && (!bestSell || score > bestSell.score)) {
          bestSell = { tower: t, sellPrice, coveredSegs, peerCoverage, strategicValue, score, reasons };
        }
      }

      if (bestSell) {
        const t = bestSell.tower;
        const tdata = getTowerData(t.type)!;
        curTowers = curTowers.filter(x => x.id !== t.id);
        curGrid = setTileTowerId(curGrid, t.gridPos, null);
        curMoney += bestSell.sellPrice;
        towersSoldCount++;
        moneyRefunded += bestSell.sellPrice;
        actionsExecuted++;
        sellAnimationsAdded.push({
          id: t.id,
          gridPos: t.gridPos,
          towerColor: tdata.color,
          startTime: now,
          refundAmount: bestSell.sellPrice,
        });
        moneyTextsToAdd.push({ col: t.gridPos.col, row: t.gridPos.row, amount: bestSell.sellPrice, isGain: true });
        achievementQueue.push({ type: 'sell', towerType: t.type, cost: bestSell.sellPrice, wave: currentWave });

        const sName = strategy === 'balanced' ? '平衡' : strategy === 'economy' ? '經濟' : strategy === 'aggressive' ? '積極' : '防守';
        get().addAutoBattleLog('sell', `拆除 ${tdata.name}`,
          `回收 $${bestSell.sellPrice} | 位置 (${t.gridPos.col}, ${t.gridPos.row}) | ${bestSell.reasons.join(', ')}`,
          [
            `[ 策略 ] ${sName} - 拆塔評估`,
            `[ 局勢 ] 威脅 ${(threatLevel * 100).toFixed(0)}% | 波次 ${currentWave} | 塔數 ${towers.length}`,
            `[ 候選 ] ${tdata.name} @ (${t.gridPos.col}, ${t.gridPos.row}) | Lv.${t.level}`,
            `[ 分析 ] 覆蓋 ${bestSell.coveredSegs} 段 | 冗餘 ${bestSell.peerCoverage.toFixed(1)} | 要地 ${bestSell.strategicValue.toFixed(1)}`,
            `[ 績效 ] 擊殺 ${t.kills} | 傷害 ${Math.floor(t.totalDamage)}`,
            `[ 評分 ] ${bestSell.score.toFixed(1)} (閾值 4.0) | 因素: ${bestSell.reasons.join(', ')}`,
            `[ 執行 ] ✓ 拆除回收 $${bestSell.sellPrice}`,
          ]);
      }
    }

    // ===== 批量融合決策（每個循環最多一次融合）=====
    if (state.autoBattleConfig.autoFusion && threatLevel < 0.6 && curTowers.length >= 4 && curMoney > adjustedMinReserve + 100) {
      const fusionCandidates: {
        source: Tower; target: Tower; resultType: TowerType;
        cost: number; value: number; score: number;
      }[] = [];
      const effMoney = curMoney - adjustedMinReserve;

      for (let i = 0; i < curTowers.length; i++) {
        const a = curTowers[i];
        if (isFusionTower(a.type)) continue;
        for (let j = i + 1; j < curTowers.length; j++) {
          const b = curTowers[j];
          if (isFusionTower(b.type)) continue;
          const recipe = getFusionRecipe(a.type, b.type);
          if (!recipe) continue;
          const aData = getTowerData(a.type);
          const bData = getTowerData(b.type);
          const resData = getTowerData(recipe.result);
          if (!aData || !bData || !resData) continue;
          const cost = computeFusionCost(aData.cost, bData.cost, difficultyModifiers.towerCostMult);
          if (cost > effMoney) continue;
          // 價值 = 結果塔戰力（DPS + 每發傷害 + 射程換算），欄位以 TowerData 實際定義為準
          const value = (resData.damagePerSecond || resData.damage || 10) + (resData.damage || 10) + (resData.range || 3) * 10;
          // 評分：價值 / 成本，越划算越好
          const score = value / cost;
          fusionCandidates.push({ source: a, target: b, resultType: recipe.result, cost, value, score });
        }
      }

      if (fusionCandidates.length > 0) {
        fusionCandidates.sort((x, y) => y.score - x.score);
        const best = fusionCandidates[0];
        const srcGridPos = best.source.gridPos;
        const aData = getTowerData(best.source.type)!;
        const bData = getTowerData(best.target.type)!;
        const resData = getTowerData(best.resultType)!;

        const skillType = TOWER_SKILLS[best.resultType];
        const fusedTower: Tower = {
          id: generateId(),
          type: best.resultType,
          gridPos: srcGridPos,
          x: 0, y: 0, level: 1, upgradePath: null, rotation: 0, target: null,
          lastFireTime: 0, kills: 0, totalDamage: 0, targetPriority: defaultTargetPriority(best.resultType),
          placedAt: now,
          health: 100, maxHealth: 100,
          fusedFrom: [best.source.type, best.target.type],
          skill: skillType ? { skillId: skillType, lastUsedTime: 0, isActive: false, activeUntil: 0 } : undefined,
        };

        curTowers = curTowers
          .filter(t => t.id !== best.source.id && t.id !== best.target.id)
          .concat(fusedTower);
        const cleared = setTileTowerId(
          setTileTowerId(curGrid, best.source.gridPos, null),
          best.target.gridPos,
          null,
        );
        curGrid = setTileTowerId(cleared, srcGridPos, fusedTower.id);
        curMoney -= best.cost;
        totalMoneySpent += best.cost;
        actionsExecuted++;
        fusionCount++;

        fusionAnimationsAdded.push({
          id: generateId(),
          gridPos: srcGridPos,
          resultType: best.resultType,
          startTime: now,
          colorA: aData.color || '#888',
          colorB: bData.color || '#888',
        });

        achievementQueue.push({ type: 'fusion', towerType: best.resultType, cost: best.cost, wave: currentWave });

        const sName = strategy === 'balanced' ? '平衡' : strategy === 'economy' ? '經濟' : strategy === 'aggressive' ? '積極' : '防守';
        get().addAutoBattleLog('analysis', `融合 ${aData.name} + ${bData.name} → ${resData.name}`,
          `花費 $${best.cost} | 位置 (${srcGridPos.col}, ${srcGridPos.row}) | 評分 ${best.score.toFixed(1)}`,
          [
            `[ 策略 ] ${sName} - 融合決策`,
            `[ 資源 ] 資金 $${curMoney + best.cost} (可用 $${effMoney + best.cost})`,
            `[ 配方 ] ${aData.name}(Lv.${best.source.level}) + ${bData.name}(Lv.${best.target.level})`,
            `[ 產物 ] ${resData.name} | 戰力值 ${best.value.toFixed(0)} | CP ${best.score.toFixed(1)}`,
            `[ 執行 ] ✓ 融合成功 | 花費 $${best.cost}`,
          ]);
      }
    }

    // ===== 批量決策迴圈 =====
    for (let actionIdx = 0; actionIdx < maxActionsPerCycle; actionIdx++) {
      const availableMoney = curMoney - adjustedMinReserve;
      if (availableMoney < 50) break;
      
      // --- 重新分析路徑覆蓋（基於當前塔陣列）---
      // 使用 pathSegments 內的 midCol/midRow 來支援普通與進階地圖兩種路徑結構
      const analyzePathCoverage = () => {
        const coverage: { segment: number; covered: boolean; towerCount: number; midCol: number; midRow: number }[] = [];
        for (const seg of pathSegments) {
          let towerCount = 0;
          for (const tower of curTowers) {
            const dist = Math.sqrt(Math.pow(tower.gridPos.col - seg.midCol, 2) + Math.pow(tower.gridPos.row - seg.midRow, 2));
            const data = getTowerData(tower.type);
            const range = data ? data.range : 3;
            if (dist <= range) towerCount++;
          }
          coverage.push({ segment: seg.index, covered: towerCount > 0, towerCount, midCol: seg.midCol, midRow: seg.midRow });
        }
        return coverage;
      };
      
      const pathCoverage = analyzePathCoverage();
      const weakSegments = pathCoverage.filter(c => c.towerCount < 2);
      const hasWeakSpots = weakSegments.length > pathCoverage.length * 0.3;
      const maxLevel = GAME_CONSTANTS.MAX_TOWER_LEVEL;

      // --- 重新分析塔陣容 ---
      const curComp = {
        damage: 0, slow: 0, aoe: 0, dps: 0, money: 0, total: curTowers.length,
        avgLevel: curTowers.length > 0 ? curTowers.reduce((sum, t) => sum + t.level, 0) / curTowers.length : 0,
      };
      for (const t of curTowers) {
        if (t.type === 'sniper' || t.type === 'laser') curComp.damage++;
        if (t.type === 'frost' || t.type === 'poison') curComp.slow++;
        if (t.type === 'cannon' || t.type === 'lightning' || t.type === 'pulse') curComp.aoe++;
        if (t.type === 'machine' || t.type === 'flame') curComp.dps++;
        if (t.type === 'money') curComp.money++;
      }
      
      // --- 嘗試升級 ---
      // 用 canAutoUpgradeTower 而非 canBatchUpgradeTower：Lv1 也必須放行，
      // 下面會替 Lv1 選路線（upgradePath），否則 AI 永遠停在 Lv1（B1）。
      const upgradableTowers = curTowers
        .filter(t => canAutoUpgradeTower(t, maxLevel))
        .map(t => {
          const data = getTowerData(t.type);
          if (!data) return null;
          const cost = getTowerUpgradeCost(data.cost, t.level);
          if (cost > availableMoney) return null;
          let valueScore = 0;
          valueScore += Math.min(t.kills / 10, 2);
          valueScore += Math.min(t.totalDamage / 1000, 2);
          valueScore += (maxLevel - t.level) * 0.5;
          if (strategy === 'aggressive' && (t.type === 'sniper' || t.type === 'cannon' || t.type === 'laser')) valueScore += 1;
          if (strategy === 'defensive' && (t.type === 'frost' || t.type === 'poison')) valueScore += 1;
          for (const weak of weakSegments) {
            const dist = Math.sqrt(Math.pow(t.gridPos.col - weak.midCol, 2) + Math.pow(t.gridPos.row - weak.midRow, 2));
            if (dist < 4) valueScore += 0.5;
          }
          return { tower: t, cost, data, valueScore };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.valueScore - a.valueScore);
      
      const shouldUpgrade = (() => {
        if (!state.autoBattleConfig.autoUpgrade) return false;
        if (upgradableTowers.length === 0) return false;
        if (threatLevel > 0.5 && upgradableTowers[0].valueScore > 2) return true;
        if (curTowers.length >= 8 && curComp.avgLevel < 2.5) return true;
        if (upgradableTowers[0].valueScore > 3) return true;
        const upgradeChance = config.upgradeWeight + (hasWeakSpots ? -0.2 : 0.1);
        return Math.random() < upgradeChance && curTowers.length >= 4;
      })();
      
      if (shouldUpgrade && upgradableTowers.length > 0) {
        const { tower, cost } = upgradableTowers[0];
        
        let upgradePath: UpgradePath = tower.upgradePath;
        if (tower.level === 1) {
          if (tower.type === 'frost' || tower.type === 'poison') upgradePath = 'B';
          else if (tower.type === 'sniper' || tower.type === 'cannon') upgradePath = 'A';
          else if (strategy === 'aggressive') upgradePath = 'A';
          else if (strategy === 'defensive') upgradePath = 'B';
          else upgradePath = curComp.slow < 2 ? 'B' : 'A';
        }
        
        const newLevel = tower.level + 1;
        const newPath: UpgradePath = tower.level === 1 ? upgradePath : tower.upgradePath;

        // 更新本地狀態（含 lastUpgradeTime 觸發脈動光暈）
        curTowers = curTowers.map(t => t.id === tower.id
          ? { ...t, level: newLevel, upgradePath: newPath, lastUpgradeTime: now }
          : t,
        );
        curMoney -= cost;
        totalMoneySpent += cost;
        upgradesCount++;
        upgradeSpent += cost;
        maxLevelReached = Math.max(maxLevelReached, newLevel);
        actionsExecuted++;

        // 推入升級動畫（與手動升級共用同一個視覺管道）
        const upgradeTowerData = getTowerData(tower.type);
        upgradeAnimationsAdded.push({
          id: generateId(),
          towerId: tower.id,
          gridPos: tower.gridPos,
          newLevel,
          towerColor: upgradeTowerData?.color || '#ffffff',
          startTime: now,
          isMaxLevel: newLevel >= maxLevel,
        });
        
        const towerDataInfo = getTowerData(tower.type);
        const towerName = towerDataInfo?.name || tower.type;
        const pathName = newPath === 'A' ? '傷害路線' : newPath === 'B' ? '效果路線' : '';
        
        // 生成思考過程
        const strategyName = strategy === 'balanced' ? '平衡' : strategy === 'economy' ? '經濟' : strategy === 'aggressive' ? '積極' : '防守';
        const thinkingSteps: string[] = [
          `[ 決策 ] ${strategyName} (第 ${actionIdx + 1} 輪)`,
          `[ 局勢 ] 威脅 ${(threatLevel * 100).toFixed(0)}% | 波次 ${currentWave} | 敵人 ${enemies.length}`,
          `[ 資源 ] 資金 $${curMoney + cost} (可用 $${availableMoney + cost} / 保留 $${adjustedMinReserve})`,
          `[ 陣容 ] 總數 ${curTowers.length} (均 Lv.${curComp.avgLevel.toFixed(1)})`,
          `         ├─ 輸出: ${curComp.damage + curComp.dps} | 範圍: ${curComp.aoe}`,
          `         └─ 控制: ${curComp.slow} | 經濟: ${curComp.money}`,
          `[ 分析 ] 弱點數 ${weakSegments.length}/${pathCoverage.length} ${hasWeakSpots ? '(!)' : '(✓)'}`,
          `[ 權衡 ] 升級優先 (最高評分 ${upgradableTowers[0].valueScore.toFixed(1)})`,
          `[ 目標 ] ${towerName} @ (${tower.gridPos.col}, ${tower.gridPos.row}) | 總傷 ${Math.floor(tower.totalDamage)}`,
        ];
        if (tower.level === 1) {
          thinkingSteps.push(`[ 路線 ] 選擇 ${pathName}`);
        }
        thinkingSteps.push(`[ 執行 ] ✓ 升級至 Lv.${newLevel} | 花費 $${cost}`);
        
        get().addAutoBattleLog('upgrade', `升級 ${towerName} 至 Lv.${newLevel}`,
          `花費 $${cost}${pathName ? ` | ${pathName}` : ''} | 位置 (${tower.gridPos.col}, ${tower.gridPos.row})`, thinkingSteps);
        
        achievementQueue.push({ type: 'upgrade', towerType: tower.type as TowerType, cost, isMaxLevel: newLevel >= maxLevel, wave: currentWave });
        continue;
      }
      
      if (!state.autoBattleConfig.autoPlace) break;
      
      // --- 放置新塔 ---
      const scores: { col: number; row: number; score: number; bestTowerType: TowerType }[] = [];
      
      curGrid.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
          if (tile.type !== 'empty' || tile.towerId) return;
          
          const centerX = colIndex * tileSize + tileSize / 2;
          const centerY = rowIndex * tileSize + tileSize / 2;
          const baseRange = 150;
          
          let pathCoverageScore = 0;
          let minDistToPath = Infinity;
          let coveredSegments: number[] = [];
          
          for (const seg of pathSegments) {
            const dist = pointToSegDist(centerX, centerY, seg.x1, seg.y1, seg.x2, seg.y2);
            minDistToPath = Math.min(minDistToPath, dist);
            if (dist < baseRange) {
              pathCoverageScore += (baseRange - dist) / baseRange;
              coveredSegments.push(seg.index);
            }
          }
          
          if (minDistToPath > baseRange * 1.3) return;
          
          const multiCoverageBonus = coveredSegments.length > 1 ? coveredSegments.length * 0.5 : 0;
          
          let weakSpotBonus = 0;
          for (const weak of weakSegments) {
            if (coveredSegments.includes(weak.segment)) weakSpotBonus += 2;
          }
          
          let strategicBonus = 0;
          for (const point of strategicPoints) {
            const dist = Math.sqrt((colIndex - point.col) ** 2 + (rowIndex - point.row) ** 2);
            if (dist <= 2) strategicBonus += point.value * (2 - dist) / 2;
          }
          
          let spacingScore = 0;
          let hasFrostNearby = false;
          let synergyBonus = 0;
          for (const tower of curTowers) {
            const dist = Math.sqrt((colIndex - tower.gridPos.col) ** 2 + (rowIndex - tower.gridPos.row) ** 2);
            const manhattan = Math.abs(colIndex - tower.gridPos.col) + Math.abs(rowIndex - tower.gridPos.row);
            if (dist < 1.5) spacingScore -= manhattan === 1 ? 0.8 : 3;
            else if (dist >= 2 && dist <= 3) {
              spacingScore += 0.5;
              if (tower.type === 'frost' || tower.type === 'poison') hasFrostNearby = true;
            }
            if (manhattan === 1 && (tower.type === 'frost' || tower.type === 'poison')) hasFrostNearby = true;
          }
          
          let bestTowerType: TowerType = config.towerPriorities[0] || 'basic';
          const shouldPlaceMoneyTower = (
            config.towerPriorities.includes('money') &&
            curComp.money < (config.maxMoneyTowers || 2) &&
            minDistToPath > baseRange * 0.5
          );
          
          if (shouldPlaceMoneyTower && pathCoverageScore < 1) bestTowerType = 'money';
          else if (hasFrostNearby && (strategy === 'balanced' || strategy === 'aggressive') && unlockedTowers.includes('sniper')) bestTowerType = 'sniper';
          else if (weakSpotBonus > 0 && curComp.slow < 2 && unlockedTowers.includes('frost')) bestTowerType = 'frost';
          else if (multiCoverageBonus > 1 && curComp.aoe < 3 && unlockedTowers.includes('cannon')) bestTowerType = 'cannon';
          
          const moneyTowerBonus = bestTowerType === 'money' ? 3 : 0;
          for (const tower of curTowers) {
            const manhattan = Math.abs(colIndex - tower.gridPos.col) + Math.abs(rowIndex - tower.gridPos.row);
            if (manhattan === 1 && findSynergyRecipe(bestTowerType, tower.type)) synergyBonus += 2.4;
          }
          const totalScore = pathCoverageScore * 1.5 + multiCoverageBonus + weakSpotBonus + strategicBonus + spacingScore + moneyTowerBonus + synergyBonus;
          
          if (totalScore > 1) scores.push({ col: colIndex, row: rowIndex, score: totalScore, bestTowerType });
        });
      });
      
      scores.sort((a, b) => b.score - a.score);
      if (scores.length === 0) break;
      
      const bestPos = scores[0];
      let selectedType = bestPos.bestTowerType;
      const selectedData = TOWER_DATA[selectedType];
      const selectedCost = selectedData
        ? getTowerBuildCost(selectedData.cost, difficultyModifiers.towerCostMult)
        : Number.POSITIVE_INFINITY;
      
      if (!selectedData || selectedCost > availableMoney) {
        const affordableTypes = config.towerPriorities.filter(type => {
          const data = TOWER_DATA[type];
          return data && getTowerBuildCost(data.cost, difficultyModifiers.towerCostMult) <= availableMoney;
        });
        if (affordableTypes.length === 0) break;
        if (curComp.money < (config.maxMoneyTowers || 2) && affordableTypes.includes('money')) selectedType = 'money';
        else if (curComp.slow < 1 && affordableTypes.includes('frost')) selectedType = 'frost';
        else if (curComp.aoe < 2 && affordableTypes.includes('cannon')) selectedType = 'cannon';
        else selectedType = affordableTypes[0];
      }
      
      const placeTowerData = TOWER_DATA[selectedType];
      // 建塔費用一律走共用算式（含 towerCostMult）；原本用原始 cost，
      // 導致 1.3 倍章節少付 23%、0.5 倍章節多付一倍（B2）。
      const placeCost = placeTowerData
        ? getTowerBuildCost(placeTowerData.cost, difficultyModifiers.towerCostMult)
        : Number.POSITIVE_INFINITY;
      if (!placeTowerData || curMoney < placeCost) break;
      
      const targetTile = curGrid[bestPos.row]?.[bestPos.col];
      if (!targetTile || targetTile.type !== 'empty' || targetTile.towerId) break;
      
      const skillType = TOWER_SKILLS[selectedType];
      const newTower: Tower = {
        id: generateId(),
        type: selectedType,
        gridPos: { col: bestPos.col, row: bestPos.row },
        x: 0, y: 0, level: 1, upgradePath: null, rotation: 0, target: null,
        lastFireTime: 0, kills: 0, totalDamage: 0, targetPriority: defaultTargetPriority(selectedType),
        // 觸發放置動畫（粒子噴射 / 建造光環 / -$cost 飄字 / 塔縮放進場）
        placedAt: now,
        health: 100, maxHealth: 100,
        skill: skillType ? { skillId: skillType, lastUsedTime: 0, isActive: false, activeUntil: 0 } : undefined,
      };
      
      // 更新本地狀態
      curTowers = [...curTowers, newTower];
      curGrid = setTileTowerId(curGrid, bestPos, newTower.id);
      curMoney -= placeCost;
      totalMoneySpent += placeCost;
      towersPlacedCount++;
      actionsExecuted++;
      
      // 更新本地陣容計數
      if (selectedType === 'money') curComp.money++;
      if (selectedType === 'frost' || selectedType === 'poison') curComp.slow++;
      if (selectedType === 'cannon' || selectedType === 'lightning' || selectedType === 'pulse') curComp.aoe++;
      
      const reasonParts: string[] = [];
      if (bestPos.score > 5) reasonParts.push('戰略要地');
      if (weakSegments.length > 0 && bestPos.score > 2) reasonParts.push('加強弱點');
      if (curComp.slow < 2 && selectedType === 'frost') reasonParts.push('補充控制');
      if (curComp.aoe < 2 && (selectedType === 'cannon' || selectedType === 'lightning' || selectedType === 'pulse')) reasonParts.push('補充範圍');
      
      // 生成思考過程
      const compNeeds: string[] = [];
      if (curComp.slow < 2) compNeeds.push('控制塔不足（' + curComp.slow + '/2）');
      if (curComp.aoe < 2) compNeeds.push('範圍塔不足（' + curComp.aoe + '/2）');
      if (curComp.damage + curComp.dps < 2) compNeeds.push('輸出塔不足（' + (curComp.damage + curComp.dps) + '/2）');
      if (curComp.money < (config.maxMoneyTowers || 2)) compNeeds.push('經濟塔不足（' + curComp.money + '/' + (config.maxMoneyTowers || 2) + '）');

      const strategyName = strategy === 'balanced' ? '平衡' : strategy === 'economy' ? '經濟' : strategy === 'aggressive' ? '積極' : '防守';
      const thinkingSteps: string[] = [
        `[ 決策 ] ${strategyName} (第 ${actionIdx + 1} 輪)`,
        `[ 局勢 ] 威脅 ${(threatLevel * 100).toFixed(0)}% | 波次 ${currentWave} | 敵人 ${enemies.length}`,
        `[ 資源 ] 資金 $${curMoney + placeCost} (可用 $${availableMoney + placeCost})`,
        `[ 陣容 ] 總數 ${curTowers.length - 1}`,
        `         ├─ 輸出: ${curComp.damage + curComp.dps} | 範圍: ${curComp.aoe}`,
        `         └─ 控制: ${curComp.slow} | 經濟: ${curComp.money}`,
        `[ 分析 ] 弱點數 ${weakSegments.length}/${pathCoverage.length} ${hasWeakSpots ? '(!)' : '(✓)'}`,
      ];
      if (compNeeds.length > 0) {
        thinkingSteps.push(`[ 需求 ] 缺乏: ${compNeeds.map(n => n.split('（')[0]).join(', ')}`);
      }
      thinkingSteps.push(`[ 權衡 ] 放置優先 (掃描 ${scores.length} 個空位)`);
      thinkingSteps.push(`[ 選擇 ] ${placeTowerData.name} @ (${bestPos.col}, ${bestPos.row}) | 評分 ${bestPos.score.toFixed(1)}`);
      if (selectedType !== bestPos.bestTowerType) {
        thinkingSteps.push(`         (註: 預算不足, 由 ${bestPos.bestTowerType} 降級)`);
      }
      if (reasonParts.length > 0) {
        thinkingSteps.push(`         (因: ${reasonParts.join(', ')})`);
      }
      thinkingSteps.push(`[ 執行 ] ✓ 建造完成 | 花費 $${placeCost}`);
      
      get().addAutoBattleLog('place', `放置 ${placeTowerData.name}`,
        `花費 $${placeCost} | 位置 (${bestPos.col}, ${bestPos.row}) | 評分 ${bestPos.score.toFixed(1)}${reasonParts.length > 0 ? ` | ${reasonParts.join(', ')}` : ''}`, thinkingSteps);
      
      achievementQueue.push({ type: 'place', towerType: selectedType, cost: placeCost, wave: currentWave });
    }
    
    // ===== 批量寫入 Store =====
    if (actionsExecuted === 0) return;
    
    // 根據執行動作數調整下次決策間隔
    const adjustedInterval = Math.floor(decisionInterval * (1 + actionsExecuted * 0.3));
    
    set({
      money: curMoney,
      towers: curTowers,
      grid: curGrid,
      autoBattleLastDecision: now + adjustedInterval - decisionInterval,
      sellAnimations: sellAnimationsAdded.length > 0
        ? [...state.sellAnimations, ...sellAnimationsAdded]
        : state.sellAnimations,
      upgradeAnimations: upgradeAnimationsAdded.length > 0
        ? [...state.upgradeAnimations, ...upgradeAnimationsAdded]
        : state.upgradeAnimations,
      fusionAnimations: fusionAnimationsAdded.length > 0
        ? [...state.fusionAnimations, ...fusionAnimationsAdded]
        : state.fusionAnimations,
      autoBattleStats: {
        towersPlaced: state.autoBattleStats.towersPlaced + towersPlacedCount,
        moneySpent: state.autoBattleStats.moneySpent + totalMoneySpent,
        decisionsCount: state.autoBattleStats.decisionsCount + actionsExecuted,
        towersSold: (state.autoBattleStats.towersSold || 0) + towersSoldCount,
      },
      placementStats: {
        ...state.placementStats,
        totalPlaced: state.placementStats.totalPlaced + towersPlacedCount,
        totalSpent: state.placementStats.totalSpent + totalMoneySpent,
        totalSold: state.placementStats.totalSold + towersSoldCount,
      },
      upgradeStats: {
        ...state.upgradeStats,
        totalUpgrades: state.upgradeStats.totalUpgrades + upgradesCount,
        totalSpent: state.upgradeStats.totalSpent + upgradeSpent,
        maxLevelReached,
      },
    });

    void moneyRefunded; // 預留：之後可用於戰報統計

    // 出售退款飄字：戰後一次觸發，與手動 sellTower 行為一致
    if (moneyTextsToAdd.length > 0) {
      const addMoneyText = get().addMoneyText;
      for (const m of moneyTextsToAdd) {
        addMoneyText(m.col, m.row, m.amount, m.isGain);
      }
    }

    // 批量追蹤成就
    getAchievementStore().then(store => {
      const s = store.getState();
      for (const a of achievementQueue) {
        if (a.type === 'place') s.onTowerPlaced(a.towerType, a.cost, a.wave);
        else if (a.type === 'sell') s.onTowerSold(a.cost);
        else if (a.type === 'fusion') s.onTowerFused();
        else s.onTowerUpgraded(a.cost, a.isMaxLevel || false, a.towerType, a.wave);
      }
      s.onSynergyBoard(getActiveSynergyKindIds(curTowers.map(toTowerRef)));
    });
  },
});
