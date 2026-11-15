/**
 * 無畫面戰局推進器
 *
 * 為什麼需要這支：真正的每幀邏輯有一半在 useGameSceneEffects 的 runFrame 裡
 * （生成佇列、結算擊殺／漏怪、死亡能力、波次結束判定），那是 React hook 的閉包，
 * 無畫面模擬碰不到。這裡把那段「照順序重寫一次」，但刻意拿掉：
 *   1. 統計（statsStore）與成就（achievementStore）——臨時局／模擬都不該污染玩家資料
 *   2. 視覺特效（damageTexts／粒子／死亡動畫／浮動金錢）——沒有畫面，產生它們只是浪費
 *   3. takeDamage() 這個 action——它會在血量歸零時直接 set scene: 'gameOver'，把整個 app 切走
 *
 * 保留的部分（影響勝負，不能省）：生成佇列節奏、自動略波、Enemy/Tower/Projectile/Skill
 * 更新、自動戰鬥 AI、擊殺獎勵、死亡分裂與自爆、漏怪扣血、協議波次加成、通關判定。
 */
import type { Enemy } from '@/types/game';
import {
  ENEMY_DATA,
  GAME_CONSTANTS,
  PATHS,
  WAVE_CONFIGS,
  generateEndlessWaveConfig,
} from '@/data/gameData';
import { getProtocolWaveMods } from '@/data/tacticalProtocolData';
import { hasEnemyAbility } from '@/data/gameData/enemyAbilities';
import { findPlayableWaveSet } from '@/utils/waveSets';
import { clearTowerIds } from '@/store/gridTower';
import { getSegmentMap } from '@/store/gameLoop/pathHelpers';
import { generateId, getEnemyData } from '@/store/gameStoreUtils';
import { useGameStore } from '@/store/gameStore';

/** 每幀更新敵人時傳給引擎的格寬（與 useGameSceneEffects 一致） */
const ENGINE_TILE_SIZE = 50;

/** 每隔多少模擬毫秒放行一次自動戰鬥決策（對齊官方 300~1000ms 的決策節奏） */
const AUTO_BATTLE_DECISION_MS = 600;

interface WaveItem {
  type: string;
  count: number;
  delay?: number;
}

export interface MatchRuntime {
  /** 尚未生成的敵人（type + 該隻敵人的絕對生成延遲） */
  spawnQueue: { type: string; delay: number }[];
  /** 生成用累計器（模擬毫秒） */
  spawnElapsed: number;
  /** 這個佇列是為第幾波建立的（換波才重建） */
  queueWave: number;
  /** 模擬時間（毫秒） */
  simNow: number;
  /** 每次波次清空時記錄的基地血量 */
  waveHealth: number[];
  /** 上一次放行自動戰鬥決策的模擬時間 */
  lastDecisionAt: number;
}

export function createMatchRuntime(): MatchRuntime {
  return {
    spawnQueue: [],
    spawnElapsed: 0,
    queueWave: 0,
    simNow: 0,
    waveHealth: [],
    lastDecisionAt: -AUTO_BATTLE_DECISION_MS,
  };
}

/** 依當前波次產生生成佇列（複製 useGameSceneEffects 的解析順序，教學模式除外） */
function buildSpawnQueue(customWaveSetId: string | undefined, wave: number): { type: string; delay: number }[] {
  const gs = useGameStore.getState();
  let enemies: WaveItem[] | null = null;
  let useCustomDelay = false;

  if (customWaveSetId) {
    const waveSet = findPlayableWaveSet(customWaveSetId);
    const config = waveSet?.waves[wave - 1];
    if (config) {
      enemies = config.enemies;
      useCustomDelay = true;
    }
  }
  if (!enemies) {
    if (gs.endlessMode && gs.endlessWaveConfig) {
      enemies = gs.endlessWaveConfig.enemies;
    } else {
      const preset = WAVE_CONFIGS[wave - 1];
      enemies = preset ? preset.enemies : generateEndlessWaveConfig(wave).enemies;
    }
  }

  const queue: { type: string; delay: number }[] = [];
  let delay = 0;
  for (const item of enemies) {
    if (useCustomDelay && item.delay !== undefined && item.delay > 0) {
      delay += item.delay;
    }
    for (let i = 0; i < item.count; i++) {
      queue.push({ type: item.type, delay });
      delay += GAME_CONSTANTS.ENEMY_SPAWN_DELAY;
    }
  }
  return queue;
}

/** 結算死亡能力：生產敵人分裂 + 爆破敵人自爆（只算數值，不產特效） */
function resolveDeathAbilities(killed: Enemy[]): {
  children: Enemy[];
  towerBombDamage: Record<string, number>;
} {
  const state = useGameStore.getState();
  const children: Enemy[] = [];
  const towerBombDamage: Record<string, number> = {};

  for (const dead of killed) {
    const data = getEnemyData(dead.originType ?? dead.type);

    if (data?.spawnOnDeath) {
      const childData = ENEMY_DATA[data.spawnOnDeath.type];
      if (childData) {
        const mods = state.difficultyModifiers;
        const childHealth = Math.round(childData.health * mods.enemyHealthMult);
        const childShield = childData.shieldAmount
          ? Math.round(childData.shieldAmount * mods.enemyHealthMult)
          : undefined;
        for (let c = 0; c < data.spawnOnDeath.count; c++) {
          children.push({
            id: generateId(),
            type: data.spawnOnDeath.type,
            x: dead.x,
            y: dead.y,
            health: childHealth,
            maxHealth: childHealth,
            speed: childData.speed * mods.enemySpeedMult,
            pathIndex: dead.pathIndex,
            progress: Math.max(0, dead.progress - c * 0.06),
            effects: [],
            reward: Math.round(childData.reward * mods.enemyRewardMult),
            size: childData.size,
            spawnTime: Date.now(),
            currentSegmentId: dead.currentSegmentId,
            segmentWaypointIndex: dead.segmentWaypointIndex,
            ...(childShield ? { shield: childShield, maxShield: childShield } : {}),
          });
        }
      }
    }

    if (hasEnemyAbility(data, 'explode') && data.explosionRadius && data.explosionDamage) {
      const radiusTiles = data.explosionRadius / 50;
      const rSq = radiusTiles * radiusTiles;
      for (const tower of state.towers) {
        const dx = tower.gridPos.col - dead.x;
        const dy = tower.gridPos.row - dead.y;
        if (dx * dx + dy * dy <= rSq) {
          towerBombDamage[tower.id] = (towerBombDamage[tower.id] ?? 0) + data.explosionDamage;
        }
      }
    }
  }

  return { children, towerBombDamage };
}

/** 漏怪扣血（複製 takeDamage 的算式，但**不**碰場景、成就與音效） */
function applyLeakDamage(count: number): void {
  const state = useGameStore.getState();
  const leakMult = getProtocolWaveMods(state.activeProtocol).leakDamageMult;
  const dealt = Math.max(0, Math.round(count * leakMult));
  if (dealt <= 0) return;
  const nextHealth = state.health - dealt;
  if (nextHealth <= 0) {
    useGameStore.setState({ health: 0, isGameOver: true, isPlaying: false, isPaused: false });
  } else {
    useGameStore.setState({ health: nextHealth });
  }
}

/** 移除已死／已到終點的敵人，並結算獎勵、死亡能力、塔的爆炸傷害 */
function settleEnemies(_rt: MatchRuntime): void {
  const store = useGameStore.getState();
  const path = PATHS[store.selectedPath];
  if (!path) return;

  const isAdvancedMap = path.category === 'advanced' && Boolean(path.segments && path.segments.length > 0);
  const segMap = isAdvancedMap ? getSegmentMap(path) : null;

  const currentEnemies = store.enemies;
  const removeIds: string[] = [];
  const killed: Enemy[] = [];
  let leakCount = 0;

  for (const enemy of currentEnemies) {
    if (enemy.health <= 0) {
      removeIds.push(enemy.id);
      killed.push(enemy);
      continue;
    }
    if (isAdvancedMap && enemy.currentSegmentId && segMap) {
      const seg = segMap.get(enemy.currentSegmentId);
      if (seg && seg.next.length === 0 && (enemy.segmentWaypointIndex ?? 0) >= seg.waypoints.length - 1) {
        leakCount++;
        removeIds.push(enemy.id);
      }
    } else if (!isAdvancedMap && enemy.pathIndex >= path.waypoints.length - 1) {
      leakCount++;
      removeIds.push(enemy.id);
    }
  }

  if (leakCount > 0) applyLeakDamage(leakCount);

  if (removeIds.length === 0) return;

  const removeSet = new Set(removeIds);
  let rewardTotal = 0;
  for (const enemy of killed) rewardTotal += enemy.reward;

  const { children, towerBombDamage } = resolveDeathAbilities(killed);

  useGameStore.setState((state) => ({
    enemies: [...state.enemies.filter((e) => !removeSet.has(e.id)), ...children],
    money: state.money + rewardTotal,
    score: state.score + rewardTotal,
  }));

  const bombIds = Object.keys(towerBombDamage);
  if (bombIds.length > 0) {
    const after = useGameStore.getState();
    const damaged = after.towers.map((tower) => {
      const dmg = towerBombDamage[tower.id] ?? 0;
      return dmg > 0 ? { ...tower, health: tower.health - dmg } : tower;
    });
    const alive = damaged.filter((tower) => tower.health > 0);
    if (alive.length < damaged.length) {
      const deadIds = new Set(damaged.filter((tower) => tower.health <= 0).map((tower) => tower.id));
      const selectedId = after.selectedTower ? after.selectedTower.id : null;
      const nextSelected = selectedId ? alive.find((tower) => tower.id === selectedId) ?? null : null;
      useGameStore.setState({
        towers: alive,
        grid: clearTowerIds(after.grid, deadIds),
        selectedTower: nextSelected,
      });
    } else {
      useGameStore.setState({ towers: alive });
    }
  }
}

/** 波次結束判定（含波次獎勵、協議、通關） */
function settleWave(rt: MatchRuntime): void {
  const store = useGameStore.getState();
  if (!store.waveActive) return;
  if (rt.spawnQueue.length > 0) return;
  if (store.enemies.length > 0) return;

  rt.waveHealth.push(Math.max(0, store.health));

  const clearBonus = getProtocolWaveMods(store.activeProtocol).waveClearBonus;
  useGameStore.setState((state) => ({
    waveActive: false,
    activeProtocol: null,
    money: state.money + Math.max(0, clearBonus),
  }));

  const after = useGameStore.getState();
  if (after.customWaveSetId) {
    const waveSet = findPlayableWaveSet(after.customWaveSetId);
    const reward = waveSet?.waves[after.currentWave - 1]?.reward;
    if (typeof reward === 'number' && reward > 0) {
      useGameStore.setState((state) => ({ money: state.money + reward }));
    }
  }

  const latest = useGameStore.getState();
  if (!latest.endlessMode && latest.maxWaves > 0 && latest.currentWave >= latest.maxWaves) {
    latest.setVictory();
    return;
  }
  latest.offerProtocolIfNeeded();

  // 自動戰鬥開著時協議會自己選；沒開（模擬中不會發生）就把待選清單清掉，避免卡住推進
  const pending = useGameStore.getState().pendingProtocolChoices;
  if (pending && pending.length > 0) {
    useGameStore.getState().chooseProtocol(pending[0].id);
  }
}

/**
 * 推進一幀
 *
 * 順序刻意與 useGameSceneEffects.runFrame 一致：生成 → 自動略波 → 各系統更新 → 結算 → 換波。
 */
export function advanceMatch(rt: MatchRuntime, stepMs: number): void {
  const store = useGameStore.getState();
  if (!store.isPlaying || store.isGameOver || store.isVictory) return;

  rt.simNow += stepMs;

  // 換波就重建生成佇列
  if (store.waveActive && store.currentWave !== rt.queueWave) {
    const customWaveSetId = store.customWaveSetId;
    rt.spawnQueue = buildSpawnQueue(customWaveSetId, store.currentWave);
    rt.spawnElapsed = 0;
    rt.queueWave = store.currentWave;
    useGameStore.getState().setAllEnemiesSpawned(false);
  }

  const afterQueue = useGameStore.getState();
  if (afterQueue.waveActive && rt.spawnQueue.length > 0) {
    rt.spawnElapsed += stepMs;
    while (rt.spawnQueue.length > 0 && rt.spawnElapsed >= rt.spawnQueue[0].delay) {
      const spawn = rt.spawnQueue.shift();
      if (!spawn) break;
      useGameStore.getState().spawnEnemy(spawn.type);
    }
    if (rt.spawnQueue.length === 0) {
      const s = useGameStore.getState();
      if (!s.allEnemiesSpawned) s.setAllEnemiesSpawned(true);
    }
  }

  const skipping = useGameStore.getState();
  if (skipping.autoSkipWave && skipping.allEnemiesSpawned && skipping.enemies.length > 0) {
    skipping.skipWave();
  }

  // 自動戰鬥的決策間隔是「牆上時鐘」節流；虛擬時鐘下牆上時間不夠，這裡主動把閘門往前推
  if (rt.simNow - rt.lastDecisionAt >= AUTO_BATTLE_DECISION_MS) {
    rt.lastDecisionAt = rt.simNow;
    useGameStore.setState({ autoBattleLastDecision: Date.now() - 5000 });
  }

  store.updateEnemies(stepMs, ENGINE_TILE_SIZE);
  store.updateTowers(stepMs);
  store.updateProjectiles(stepMs);
  store.updateSkills();
  store.updatePlayerSkills();
  store.runAutoBattleLogic();

  settleEnemies(rt);
  settleWave(rt);

  const next = useGameStore.getState();
  if (!next.waveActive && !next.isVictory && !next.isGameOver) {
    const canStart = next.endlessMode || next.maxWaves === 0 || next.currentWave < next.maxWaves;
    if (canStart) {
      next.startWave();
    }
  }
}

/** 目前這一局是否已結束（勝或敗） */
export function isMatchFinished(): boolean {
  const s = useGameStore.getState();
  return s.isVictory || s.isGameOver;
}

