import { describe, expect, it } from 'vitest';
import type { AutoBattleContext, AutoBattleConfig } from '@/types/autobattle';
import type { EnemyType, PathConfig, TowerType } from '@/types/game';
import { ENEMY_DATA, GAME_CONSTANTS, PATHS, TOWER_DATA, generateEndlessWaveConfig } from '@/data/gameData';
import { DEFAULT_AUTO_BATTLE_RULES } from '@/data/autobattle/defaultRules';
import { computeFusionCost, getFusionRecipe } from '@/data/fusionRecipes';
import { SKILL_DATA, TOWER_SKILLS } from '@/data/skillData';
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
  /** 技能冷卻結束時間（秒）；0 = 隨時可用 */
  skillReadyAt: number;
  /** 技能爆發結束時間（秒）：期間輸出 ×2.5 */
  skillUntil: number;
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
  firstLeakWave: number;
  skillCasts: number;
  skillSoloCasts: number;
  skillDamage: number;
  towersAtWave10: number;
  moneyAtWave10: number;
  playerSkillReadyAt: number;
  /** 火力強化（金錢出口）：層數與目前的全體輸出倍率 */
  firepowerLevel: number;
  globalPower: number;
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
      if (sim.towers.some((t) => Math.hypot(t.col - col, t.row - row) < 1.3)) continue;
      const cover = coverage(col, row, range);
      if (cover > best.cover) best = { col, row, cover };
    }
  }
  return best;
};

/** 血量倍率爬升：模擬「越打越硬」，否則兩邊都能無限存活，存活波次沒有鑑別度 */
export const HP_RAMP = 1.0;
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
  if (wave === 10 && sim.towersAtWave10 < 0) {
    sim.towersAtWave10 = sim.towers.length;
    sim.moneyAtWave10 = Math.round(sim.money);
  }
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
  firstLeakWave: -1,
  skillCasts: 0,
  skillSoloCasts: 0,
  skillDamage: 0,
  towersAtWave10: -1,
  moneyAtWave10: -1,
  playerSkillReadyAt: 0,
  firepowerLevel: 0,
  globalPower: 1,
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

  // 經濟塔：在場上時持續產金（與 TOWER_DATA 的 moneyPerSecond 一致）
  for (const t of sim.towers) {
    const d = TOWER_DATA[t.type];
    if (d.moneyGeneration) sim.money += (d.moneyPerSecond ?? 5) * dt;
  }

  // 塔輸出：主目標 + 濺射／連鎖的額外目標
  for (const t of sim.towers) {
    const data = TOWER_DATA[t.type];
    const inRange = sim.enemies.filter((e) => {
      const pos = POINTS[Math.round(e.idx)];
      return Math.hypot(pos.col - t.col, pos.row - t.row) <= rangeOf(t.type);
    });
    let target: SimEnemy | null = null;
    for (const e of inRange) if (!target || e.hp > target.hp) target = e;

    if (data.chainCount && data.chainCount > 1) {
      const extras = inRange.filter((e) => e !== target).slice(0, data.chainCount - 1);
      for (const e of extras) e.hp -= dpsOf(t.type, t.level) * (data.chainDamageReduction ?? 0.7) * dt;
    } else if (data.splash) {
      const extras = inRange.filter((e) => e !== target).slice(0, 2);
      for (const e of extras) e.hp -= dpsOf(t.type, t.level) * 0.6 * dt;
    }

    if (target) {
      // 裝甲：每次命中固定減傷（毒／火無視裝甲），高單發傷害的塔受影響較小
      const armor = ENEMY_DATA[target.type].armorValue ?? 0;
      const burst = sim.time < t.skillUntil ? 2.5 : 1;
      const data = TOWER_DATA[t.type];
      let dps = dpsOf(t.type, t.level);
      if (armor > 0 && !data.poisonEffect && !data.flameEffect) {
        const levelScale = 1 + (t.level - 1) * 0.25;
        const fireRate = data.fireRate ?? 1;
        const perShot = (data.damage > 0 ? data.damage : dps / levelScale / Math.max(0.0001, fireRate)) * levelScale;
        dps = Math.max(1, perShot - armor) * fireRate;
      }
      target.hp -= dps * burst * sim.globalPower * dt;
      if (burst > 1) sim.skillDamage += dps * (burst - 1) * dt;
    }
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
      if (sim.firstLeakWave < 0) sim.firstLeakWave = sim.wave;
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
  /** 動作組成：用來判斷決策層實際偏好的動作 */
  placed: number;
  upgraded: number;
  fused: number;
  /** 第一次漏怪的波次（越高越好，比存活波次更細緻） */
  firstLeakWave: number;
  /** 塔種組成（例如 laser:20|sniper:15），用來看融合配方是否存在 */
  typeMix: string;
  /** 技能使用統計：次數、單目標次數、爆發期間的額外傷害 */
  skillCasts: number;
  skillSoloCasts: number;
  skillDamage: number;
  /** 決策耗時：平均每次決策的毫秒數（效能預算 < 1.5ms） */
  decideMs: number;
  decideCalls: number;
  /** 第 10 波開始時的塔數與金錢：用來看前期鋪位節奏 */
  towersAtWave10: number;
  moneyAtWave10: number;
}

type Action =
  | { kind: 'place'; type: TowerType; col: number; row: number }
  | { kind: 'upgrade'; id: string }
  | { kind: 'fuse'; a: string; b: string }
  | { kind: 'sell'; id: string }
  | { kind: 'skill'; id: string }
  | { kind: 'playerSkill' }
  | { kind: 'empower' }
  | { kind: 'skip' }
  | null;

const runLegacyPolicy = (sim: Sim, tick: number): Action => {
  void tick;
  // 舊策略同樣會買火力強化（錢多就買），確保機制對兩側一視同仁
  if (sim.money >= 5000 && sim.towers.length >= 20 && sim.firepowerLevel < 25) return { kind: 'empower' };

  // 舊引擎同時會放玩家主動技能（tryActivatePlayerSkill），基準也照做
  if (sim.time >= sim.playerSkillReadyAt && sim.enemies.length >= 8) return { kind: 'playerSkill' };

  // 舊引擎有「技能就放」的邏輯（每 500ms 檢查、範圍內敵人數達門檻就放），基準也照做
  for (const tower of sim.towers) {
    if (sim.time < tower.skillReadyAt) continue;
    const near = sim.enemies.filter((e) => {
      const pos = POINTS[Math.round(e.idx)];
      return Math.hypot(pos.col - tower.col, pos.row - tower.row) <= rangeOf(tower.type) + 0.5;
    });
    const hasBoss = near.some((e) => e.type === 'boss' || e.type === 'miniboss');
    if (near.length >= 3 || hasBoss) return { kind: 'skill', id: tower.id };
  }
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
  // 金錢出口：與設計提案同一組參數（5000 金 → +2%，上限 25 層）
  firepower: { cost: 5000, step: 0.02, maxLevel: 25 },
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
  towers: sim.towers.map((t) => ({
    id: t.id,
    type: t.type,
    level: t.level,
    col: t.col,
    row: t.row,
    skillReady: sim.time >= t.skillReadyAt,
    upgradePath: t.upgradePath,
  })),
  waveActive: sim.waveActive,
  allEnemiesSpawned: sim.allSpawned,
  // 基準只模擬一個全域爆發技能，冷卻 60 秒
  playerSkills: [{ id: 'benchBurst', ready: sim.time >= sim.playerSkillReadyAt }],
  firepowerLevel: sim.firepowerLevel,
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
  if (c.kind === 'empower') {
    lastActionAt.set(c.id, ctx.time);
    return { kind: 'empower' };
  }
  if (c.kind === 'playerSkill') {
    lastActionAt.set(c.id, ctx.time);
    return { kind: 'playerSkill' };
  }
  if (c.kind === 'skill' && c.towerId) {
    lastActionAt.set(c.id, ctx.time);
    return { kind: 'skill', id: c.towerId };
  }
  if (c.kind === 'sell' && c.towerId) {
    lastActionAt.set(c.id, ctx.time);
    return { kind: 'sell', id: c.towerId };
  }
  if (c.kind === 'fusion' && c.towerId && c.targetTowerId) {
    lastActionAt.set(c.id, ctx.time);
    return { kind: 'fuse', a: c.towerId, b: c.targetTowerId };
  }
  if (c.kind === 'upgrade' && c.towerId) {
    lastActionAt.set(c.id, ctx.time);
    return { kind: 'upgrade', id: c.towerId };
  }
  // 略波在基準中一律不採用（見上）
  return null;
};

/** 賣塔後同一格的重建冷卻（與引擎 DECISION_LIMITS.rebuildLockMs 一致） */
const soldAt = new Map<string, number>();
const REBUILD_LOCK_S = 12;

const apply = (sim: Sim, action: Action): boolean => {
  if (!action) return false;
  if (action.kind === 'place') {
    const cost = costOf(action.type);
    if (cost > sim.money) return false;
    const key = `${action.col},${action.row}`;
    if (sim.time - (soldAt.get(key) ?? -999) < REBUILD_LOCK_S) return false;
    if (sim.towers.some((t) => Math.hypot(t.col - action.col, t.row - action.row) < 1.3)) return false;
    sim.money -= cost;
    sim.towers.push({
      id: `t${sim.towers.length}`,
      type: action.type,
      level: 1,
      col: action.col,
      row: action.row,
      upgradePath: null,
      skillReadyAt: 0,
      skillUntil: 0,
    });
    return true;
  }
  if (action.kind === 'empower') {
    if (sim.firepowerLevel >= 25 || sim.money < 5000) return false;
    sim.money -= 5000;
    sim.firepowerLevel += 1;
    sim.globalPower += 0.02;
    return true;
  }
  if (action.kind === 'playerSkill') {
    if (sim.time < sim.playerSkillReadyAt) return false;
    sim.playerSkillReadyAt = sim.time + 90;
    const burst = 80 * (1 + 0.25 * sim.wave);
    for (const e of sim.enemies) e.hp -= burst;
    return true;
  }
  if (action.kind === 'skill') {
    const tower = sim.towers.find((t) => t.id === action.id);
    if (!tower) return false;
    if (sim.time < tower.skillReadyAt) return false;
    const skillId = TOWER_SKILLS[tower.type];
    const cooldown = skillId ? (SKILL_DATA[skillId]?.cooldown ?? 20000) / 1000 : 20;
    tower.skillReadyAt = sim.time + cooldown;
    tower.skillUntil = sim.time + 2.5;
    const nearCount = sim.enemies.filter((e) => {
      const pos = POINTS[Math.round(e.idx)];
      return Math.hypot(pos.col - tower.col, pos.row - tower.row) <= rangeOf(tower.type);
    }).length;
    sim.skillCasts++;
    if (nearCount <= 1) sim.skillSoloCasts++;
    return true;
  }
  if (action.kind === 'sell') {
    const tower = sim.towers.find((t) => t.id === action.id);
    if (!tower) return false;
    sim.money += Math.floor(costOf(tower.type) * 0.6);
    soldAt.set(`${tower.col},${tower.row}`, sim.time);
    sim.towers = sim.towers.filter((t) => t.id !== action.id);
    return true;
  }
  if (action.kind === 'fuse') {
    const a = sim.towers.find((t) => t.id === action.a);
    const b = sim.towers.find((t) => t.id === action.b);
    if (!a || !b) return false;
    const recipe = getFusionRecipe(a.type, b.type);
    if (!recipe) return false;
    const cost = computeFusionCost(costOf(a.type), costOf(b.type), 1);
    if (cost > sim.money) return false;
    sim.money -= cost;
    sim.towers = sim.towers.filter((t) => t.id !== a.id && t.id !== b.id);
    sim.towers.push({
      id: `t${sim.towers.length}-${Math.round(sim.time * 10)}`,
      type: recipe.result,
      level: 1,
      col: a.col,
      row: a.row,
      upgradePath: null,
      skillReadyAt: 0,
      skillUntil: 0,
    });
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
  soldAt.clear();
  benchHoldStreak = 0;
  let idleTicks = 0;
  let placed = 0;
  let upgraded = 0;
  let fused = 0;
  let jitter = 0;
  let decideMs = 0;
  let decideCalls = 0;
  let lastKey = '';
  let repeats = 0;
  let tick = 0;
  const dt = 0.3;
  const maxTicks = waves * 700;
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
    // 每個 tick 單一動作（兩側同規則）
    let executed = false;
    for (let k = 0; k < 1; k++) {
      const startedAt = performance.now();
      const action = policy(sim, tick + seedOffset);
      decideMs += performance.now() - startedAt;
      decideCalls++;
      if (!apply(sim, action)) break;
      executed = true;
      if (action?.kind === 'place') placed++;
      else if (action?.kind === 'upgrade') upgraded++;
      else if (action?.kind === 'fuse') fused++;
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
    if (!executed && sim.money > 400) idleTicks++;
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
    placed,
    upgraded,
    fused,
    firstLeakWave: sim.firstLeakWave,
    typeMix: Object.entries(
      sim.towers.reduce<Record<string, number>>((acc, t) => {
        acc[t.type] = (acc[t.type] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .sort((x, y) => y[1] - x[1])
      .map(([type, count]) => `${type}:${count}`)
      .join('|'),
    skillCasts: sim.skillCasts,
    skillSoloCasts: sim.skillSoloCasts,
    skillDamage: Math.round(sim.skillDamage),
    decideMs: decideCalls > 0 ? Number((decideMs / decideCalls).toFixed(3)) : 0,
    decideCalls,
    towersAtWave10: sim.towersAtWave10,
    moneyAtWave10: sim.moneyAtWave10,
  };
};

describe('autobattle A/B benchmark', () => {
  it('同一份戰鬥模型下比較舊策略與新效用引擎', { timeout: 480000 }, () => {
    const legacy = simulate(runLegacyPolicy, 90);
    const utility = simulate(runUtilityPolicy, 90);
    const report = { legacy, utility };
    console.info('[autobattle-bench] ' + JSON.stringify(report));
    expect(legacy.towerCount).toBeGreaterThan(0);
    expect(utility.towerCount).toBeGreaterThan(0);
  });
});
