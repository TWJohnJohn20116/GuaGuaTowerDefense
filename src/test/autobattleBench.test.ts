import { describe, expect, it } from 'vitest';
import type { AutoBattleContext, AutoBattleConfig } from '@/types/autobattle';
import type { EnemyType, PathConfig, TowerType } from '@/types/game';
import { ENEMY_DATA, GAME_CONSTANTS, PATHS, TOWER_DATA, generateEndlessWaveConfig } from '@/data/gameData';
import { DEFAULT_AUTO_BATTLE_RULES } from '@/data/autobattle/defaultRules';
import { decide } from '@/store/autobattle/decide';
import { collectPathPoints } from '@/data/autobattle/mapInfo';

/**
 * 自動戰鬥 A/B 基準。
 *
 * 兩邊跑在同一份「簡化戰鬥模型」上：同樣的路徑點、同樣的敵人表、同樣的傷害公式，
 * 差別只在決策者：
 *   legacy = 舊引擎的行為複刻（最高覆蓋點放最便宜塔、錢夠就升級、固定門檻略波）
 *   utility = 新的效用評分引擎（直接呼叫 buildCandidates → applyRules → decide）
 *
 * 這是策略層的對照，不是舊檔逐行重跑（舊檔已刪除且依賴已移除的 store 欄位）。
 */

interface SimEnemy {
  id: string;
  type: EnemyType;
  idx: number;
  hp: number;
  maxHp: number;
  progress: number;
}
interface SimTower {
  id: string;
  type: TowerType;
  level: number;
  col: number;
  row: number;
  /** Lv2 起必須有路線，否則升級路徑會卡死（引擎端 canAutoUpgradeTower 會擋） */
  upgradePath: 'A' | 'B' | null;
}
interface Sim {
  money: number;
  health: number;
  wave: number;
  time: number;
  enemies: SimEnemy[];
  towers: SimTower[];
  waveActive: boolean;
  allSpawned: boolean;
  spawnQueue: { type: EnemyType; at: number; hpScale: number }[];
  lastSkipAt: number;
}

// 用真實地圖（zigzag），確保覆蓋計算與實戰同一份路徑資料
const PATH_CONFIG: PathConfig = (PATHS.zigzag ?? Object.values(PATHS)[0]) as PathConfig;
const POINTS = collectPathPoints(PATH_CONFIG);
const COLS = GAME_CONSTANTS.GRID_COLS;
const ROWS = GAME_CONSTANTS.GRID_ROWS;

const dpsOf = (type: TowerType, level: number): number => {
  const d = TOWER_DATA[type];
  return (d.damagePerSecond ?? d.damage * (d.fireRate ?? 1)) * (1 + (level - 1) * 0.25);
};
const costOf = (type: TowerType): number => TOWER_DATA[type].cost;
const rangeOf = (type: TowerType): number => TOWER_DATA[type].range;

const coverage = (col: number, row: number, range: number): number =>
  POINTS.reduce((sum, p) => (Math.hypot(p.col - col, p.row - row) <= range ? sum + 1 : sum), 0);

const bestSpot = (sim: Sim, range: number): { col: number; row: number; cover: number } => {
  let best = { col: -1, row: -1, cover: -1 };
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      if (sim.towers.some((t) => Math.hypot(t.col - col, t.row - row) < 1.6)) continue;
      const cover = coverage(col, row, range);
      if (cover > best.cover) best = { col, row, cover };
    }
  }
  return best;
};

/** 血量倍率爬升：模擬「越打越硬」，否則兩邊都能無限存活，存活波次沒有鑑別度 */
export const HP_RAMP = 1.2;
export const hpScaleAt = (wave: number): number => 1 + HP_RAMP * (wave - 1);

/** 追加一波敵人（不清空現有佇列：略波只是提前放下一波，場上敵人不會消失） */
const appendWave = (sim: Sim, wave: number): void => {
  // 用真實的無盡模式生成器：敵人數量隨波次成長，才會有「防線被壓垮」的臨界點
  const cfg = generateEndlessWaveConfig(wave);
  const scale = hpScaleAt(wave);
  let at = sim.time;
  for (const group of cfg.enemies) {
    for (let i = 0; i < group.count; i++) {
      sim.spawnQueue.push({ type: group.type as EnemyType, at, hpScale: scale });
      at += 0.3;
    }
  }
  sim.allSpawned = false;
  sim.waveActive = true;
  sim.wave = Math.max(sim.wave, wave);
};

const makeSim = (): Sim => ({
  money: 500,
  health: 10,
  wave: 0,
  time: 0,
  enemies: [],
  towers: [],
  waveActive: false,
  allSpawned: false,
  spawnQueue: [],
  lastSkipAt: -999,
});

const step = (sim: Sim, dt: number): void => {
  sim.time += dt;
  while (sim.spawnQueue.length > 0 && sim.spawnQueue[0].at <= sim.time) {
    const next = sim.spawnQueue.shift();
    if (!next) break;
    const data = ENEMY_DATA[next.type];
    const hp = data.health * next.hpScale;
    sim.enemies.push({
      id: `e${sim.time.toFixed(2)}-${sim.enemies.length}`,
      type: next.type,
      idx: 0,
      hp,
      maxHp: hp,
      progress: 0,
    });
  }
  if (sim.spawnQueue.length === 0) sim.allSpawned = true;

  // 敵人前進
  for (const e of sim.enemies) {
    const speed = ENEMY_DATA[e.type].speed;
    const advance = (speed * dt) / (POINTS.length - 1);
    e.idx = Math.min(POINTS.length - 1, e.idx + advance);
    e.progress = e.idx / (POINTS.length - 1);
  }

  // 塔輸出：射程內打血最多（同分取 id 小）的敵人
  for (const t of sim.towers) {
    let target: SimEnemy | null = null;
    for (const e of sim.enemies) {
      const pos = POINTS[Math.round(e.idx)];
      if (Math.hypot(pos.col - t.col, pos.row - t.row) > rangeOf(t.type)) continue;
      if (!target || e.hp > target.hp) target = e;
    }
    if (target) target.hp -= dpsOf(t.type, t.level) * dt;
  }

  // 死亡與漏怪
  const alive: SimEnemy[] = [];
  for (const e of sim.enemies) {
    if (e.hp <= 0) {
      sim.money += ENEMY_DATA[e.type].reward;
      continue;
    }
    if (e.progress >= 1) {
      sim.health -= 1;
      continue;
    }
    alive.push(e);
  }
  sim.enemies = alive;
};

interface AgentResult {
  wavesSurvived: number;
  leaks: number;
  moneyLeft: number;
  coverageSum: number;
  towerCount: number;
  idleTicks: number;
  jitter: number;
  /** 死亡當下的總 DPS 與等級分佈：用來判斷是不是「塔位用盡造成 DPS 上限」 */
  totalDps: number;
  levelSum: number;
  maxLevelTowers: number;
}

type Action =
  | { kind: 'place'; type: TowerType; col: number; row: number }
  | { kind: 'upgrade'; id: string }
  | { kind: 'skip' }
  | null;

const runLegacyPolicy = (sim: Sim, tick: number): Action => {
  void tick;
  // 基準刻意不略波：要比較的是「防線能撐幾波」，不是誰比較會按略波
  const money = sim.money;
  if (sim.towers.length > 0 && money > 250) {
    const up = [...sim.towers].filter((t) => t.level < 5).sort((a, b) => b.level - a.level)[0];
    if (up) {
      const cost = Math.floor(costOf(up.type) * (0.5 + up.level * 0.25));
      if (cost <= money) return { kind: 'upgrade', id: up.id };
    }
  }
  const affordable = (Object.keys(TOWER_DATA) as TowerType[]).filter((t) => costOf(t) <= money);
  if (affordable.length === 0) return null;
  const type = affordable.sort((a, b) => costOf(a) - costOf(b))[0];
  const spot = bestSpot(sim, rangeOf(type));
  if (spot.cover <= 0) return null;
  return { kind: 'place', type, col: spot.col, row: spot.row };
};

const config = (): AutoBattleConfig => ({
  mode: 'coach',
  presetId: 'balanced',
  weights: {},
  rules: DEFAULT_AUTO_BATTLE_RULES,
  allowedTiles: [],
  aiUntilWave: 99,
  lockedTargets: [],
  showOverlay: false,
  dryRun: false,
});

const ctxOf = (sim: Sim): AutoBattleContext => ({
  time: sim.time * 1000,
  wave: Math.max(1, sim.wave),
  money: sim.money,
  health: sim.health,
  maxHealth: 10,
  enemies: sim.enemies.map((e) => {
    const pos = POINTS[Math.round(e.idx)];
    return { id: e.id, type: e.type, x: pos.col, y: pos.row, health: e.hp, maxHealth: e.maxHp, progress: e.progress };
  }),
  towers: sim.towers.map((t) => ({ ...t, skillReady: false })),
  waveActive: sim.waveActive,
  allEnemiesSpawned: sim.allSpawned,
  lookahead: {
    moneyReserve: 120 + sim.wave * 20,
    expectedAbilities: [],
    expectedEnemyCount: 10,
    pressure: 0.4,
    nextWaveTypes: [],
  },
  config: config(),
  trigger: ['cooldown'],
});

const lastActionAt = new Map<string, number>();
/** 與線上 slice 相同的連續猶豫計數，確保基準反映真實行為 */
let benchHoldStreak = 0;

const runUtilityPolicy = (sim: Sim): Action => {
  const ctx = ctxOf(sim);
  const decision = decide({
    ctx,
    pathConfig: PATH_CONFIG,
    costMult: 1,
    rules: DEFAULT_AUTO_BATTLE_RULES,
    triggers: ['cooldown'],
    lastActionAt,
    holdStreak: benchHoldStreak,
  });
  if (decision.verdict === 'hold') benchHoldStreak++;
  else if (decision.verdict === 'executed') benchHoldStreak = 0;
  if (decision.verdict !== 'executed' || !decision.chosen) return null;
  const c = decision.chosen;
  if (c.kind === 'place' && c.towerType && c.col != null && c.row != null) {
    lastActionAt.set(c.id, ctx.time);
    return { kind: 'place', type: c.towerType, col: c.col, row: c.row };
  }
  if (c.kind === 'upgrade' && c.towerId) {
    lastActionAt.set(c.id, ctx.time);
    return { kind: 'upgrade', id: c.towerId };
  }
  // 略波在基準中一律不採用（見上）
  return null;
};

const apply = (sim: Sim, action: Action): boolean => {
  if (!action) return false;
  if (action.kind === 'place') {
    const cost = costOf(action.type);
    if (cost > sim.money) return false;
    if (sim.towers.some((t) => Math.hypot(t.col - action.col, t.row - action.row) < 1.6)) return false;
    sim.money -= cost;
    sim.towers.push({ id: `t${sim.towers.length}`, type: action.type, level: 1, col: action.col, row: action.row, upgradePath: null });
    return true;
  }
  if (action.kind === 'upgrade') {
    const tower = sim.towers.find((t) => t.id === action.id);
    if (!tower || tower.level >= 5) return false;
    const cost = Math.floor(costOf(tower.type) * (0.5 + tower.level * 0.25));
    if (cost > sim.money) return false;
    sim.money -= cost;
    tower.level += 1;
    if (tower.level >= 2 && !tower.upgradePath) tower.upgradePath = 'A';
    return true;
  }
  // skip：提前放下一波，場上敵人留著（與實戰 skipWave 語意一致），並有 8 秒冷卻
  if (sim.time - sim.lastSkipAt < 8) return false;
  sim.lastSkipAt = sim.time;
  appendWave(sim, sim.wave + 1);
  return true;
};

const simulate = (policy: (sim: Sim, tick: number) => Action, waves: number, seedOffset = 0): AgentResult => {
  const sim = makeSim();
  lastActionAt.clear();
  benchHoldStreak = 0;
  let idleTicks = 0;
  let jitter = 0;
  let lastKey = '';
  let repeats = 0;
  let tick = 0;
  const dt = 0.3;
  const maxTicks = waves * 400;
  let waveIndex = 1;
  appendWave(sim, waveIndex);
  while (tick < maxTicks && sim.health > 0) {
    step(sim, dt);
    tick++;
    if (sim.enemies.length === 0 && sim.spawnQueue.length === 0) {
      if (waveIndex >= waves) break;
      waveIndex++;
      appendWave(sim, waveIndex);
      continue;
    }
    // 每個 tick 最多連續 3 個動作：錢多時不必等下一次決策才再花一次
    let acted = false;
    for (let k = 0; k < 3; k++) {
      const action = policy(sim, tick + seedOffset);
      if (!apply(sim, action)) break;
      acted = true;
      const key = action
        ? `${action.kind}:${'type' in action ? action.type : ''}:${'col' in action ? `${action.col},${action.row}` : ''}${'id' in action ? action.id : ''}`
        : '';
      if (key && key === lastKey) {
        repeats++;
        if (repeats === 3) jitter++;
      } else {
        repeats = 0;
      }
      lastKey = key;
    }
    if (!acted && sim.money > 400) idleTicks++;
  }
  const coverSum = sim.towers.reduce((sum, t) => sum + coverage(t.col, t.row, rangeOf(t.type)), 0);
  return {
    wavesSurvived: sim.health > 0 ? waveIndex : waveIndex - 1,
    leaks: 10 - Math.max(0, sim.health),
    moneyLeft: Math.round(sim.money),
    coverageSum: coverSum,
    towerCount: sim.towers.length,
    idleTicks,
    jitter,
    totalDps: Math.round(sim.towers.reduce((sum, t) => sum + dpsOf(t.type, t.level), 0)),
    levelSum: sim.towers.reduce((sum, t) => sum + t.level, 0),
    maxLevelTowers: sim.towers.filter((t) => t.level >= 5).length,
  };
};

describe('autobattle A/B benchmark', () => {
  it('同一份戰鬥模型下比較舊策略與新效用引擎', { timeout: 120000 }, () => {
    const legacy = simulate(runLegacyPolicy, 40);
    const utility = simulate(runUtilityPolicy, 40);
    const report = { legacy, utility };
    console.info('[autobattle-bench] ' + JSON.stringify(report));
    expect(legacy.towerCount).toBeGreaterThan(0);
    expect(utility.towerCount).toBeGreaterThan(0);
  });
});
