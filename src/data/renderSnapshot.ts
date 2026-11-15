import type { Enemy, EnemyType, Projectile, StatusEffect, Tower, TowerType } from '@/types/game';
import { getEnemyPhaseFade, getEnemyStealthFade } from '@/data/enemyVisibility';
import { isJammerSuppressed } from '@/data/jammerAura';
import { resolveEnemyData } from './enemyDataProvider';

/**
 * 渲染 snapshot 契約（純函式層）
 *
 * 目的：2D canvas 與 3D Three.js 每幀需要的「同一份」實體視覺資料，
 * 只從 store 讀一次、只推導一次，兩個渲染器都吃這個緩衝，不再各自重算。
 *
 * 為什麼是「寫入既有緩衝」而不是每幀回傳新物件：
 * 每幀路徑新增物件配置是 §6 的效能地雷（4,500 敵人的壓測場景）。
 * 這裡的 `writeRenderSnapshot` 只寫入呼叫端持有的 `RenderSnapshot`，
 * 穩定狀態下零配置；只有實體數超過既有容量時才擴充 slot。
 *
 * 純度約定：
 *  - 不 import store / React / 任何有副作用模組（只 import types 與 data 層純函式）
 *  - 相同 source + nowMs 寫入同一份 snapshot，必定得到相同的欄位值
 *  - 唯一被改動的是輸出緩衝（明確標記為 out 參數）
 */

/** 單一敵人在「這一幀」的視覺欄位；renderer 只讀，不再回查 Enemy。 */
interface EnemyRenderFrame {
  id: string;
  type: EnemyType;
  /** 敵種主色（CSS 字串），2D 模型與 3D instance 染色共用，免去各自查 ENEMY_DATA */
  baseColor: string;
  /** 網格座標（格為單位），由各渲染器自行乘上 tileSize / toWorld */
  x: number;
  y: number;
  size: number;
  health: number;
  maxHealth: number;
  /** 0~1，已夾住範圍；2D 血條寬度與 3D 顏色暗度共用 */
  healthRatio: number;
  shield: number;
  maxShield: number;
  /** 0~1；沒有護盾上限時為 0 */
  shieldRatio: number;
  escortArmor: number;
  /** 出生時間戳；-1 代表這隻敵人沒有 spawnTime（舊存檔 / 測試 fixture） */
  spawnTime: number;
  /** now - spawnTime；-1 代表沒有出生時間，渲染器據此跳過出生動畫 */
  spawnAgeMs: number;
  stealthFade: number;
  phaseFade: number;
  /** max(stealthFade, phaseFade)：3D 以單一「幽影強度」壓暗與縮小 */
  ghostFade: number;
  /** 最高優先級狀態的色調（0 = 無狀態），2D 環與 3D tint 共用同一組優先序 */
  statusTint: number;
  statusTintMix: number;
  /** 原始狀態效果參照（不複製）；2D 狀態環需要逐型別繪製 */
  effects: StatusEffect[];
  isDisplaced: boolean;
  /** 冰凍 / 暈眩 / 石化 / 沉默期間，主動光環（治療、干擾、護航）關閉 */
  abilitySuppressed: boolean;
}

/** 單一投射物在「這一幀」的視覺欄位（3D 只用 x/y/size/color，2D 另需軌跡與形狀）。 */
export interface ProjectileRenderFrame {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  towerType: TowerType;
  isInstant: boolean;
  createdAt?: number;
  rotation?: number;
  hitEffect?: Projectile['hitEffect'];
  trailPoints?: { x: number; y: number; alpha: number }[];
}

/** 單一塔在「這一幀」的視覺欄位；塔模型 / 血條 / 協同連線 / 攻擊閃光都吃這份。 */
interface TowerRenderFrame {
  id: string;
  type: TowerType;
  /** 直接沿用塔自身的 gridPos 參照（不複製、不配置），協同連線與 toWorld 都吃這個形狀 */
  gridPos: { col: number; row: number };
  level: number;
  rotation: number;
  health: number;
  maxHealth: number;
  healthRatio: number;
  placedAt?: number;
  lastAttackTime?: number;
  lastUpgradeTime?: number;
  locked: boolean;
  fusedFrom?: [TowerType, TowerType];
  /** 目前鎖定的敵人 id（火焰束等「塔→目標」特效由此解析，不再各自掃 Enemy 陣列） */
  targetId: string | null;
}

export interface RenderSnapshot {
  /** 每次寫入 +1；除錯 / 測試用來確認 2D、3D 吃到同一幀 */
  frameId: number;
  /** 這一幀統一的時間戳（ms）。2D 過去混用 performance.now / Date.now，契約只認這個值 */
  timeMs: number;
  enemyCount: number;
  /** slot 會被重複使用，只有 [0, enemyCount) 是這一幀的有效資料 */
  enemies: EnemyRenderFrame[];
  projectileCount: number;
  projectiles: ProjectileRenderFrame[];
  towerCount: number;
  towers: TowerRenderFrame[];
}

/** 塔模型的等級縮放（3D 模型與塔血條高度共用同一條公式） */
export const towerLevelScale = (level: number): number => 1 + (level - 1) * 0.09;

/**
 * 依 id 找這一幀的敵人 frame（火焰束等「塔→目標」特效用）。
 * 火焰塔數量少、目標只有一個，線性掃描比每幀建 Map 便宜；找不到代表目標已死。
 */
export const enemyFrameById = (snapshot: RenderSnapshot, id: string): EnemyRenderFrame | null => {
  const frames = snapshot.enemies;
  for (let i = 0; i < snapshot.enemyCount; i++) {
    if (frames[i].id === id) return frames[i];
  }
  return null;
};

/** 狀態色調優先序（高 → 低）：2D 環與 3D instance 顏色都依這張表 */
const STATUS_TINTS: { type: string; color: number; mix: number }[] = [
  { type: 'freeze', color: 0x93c5fd, mix: 0.65 },
  { type: 'frostbite', color: 0xbae6fd, mix: 0.35 },
  { type: 'petrify', color: 0x9ca3af, mix: 0.7 },
  { type: 'stun', color: 0xfef9c3, mix: 0.5 },
  { type: 'berserk', color: 0xff3232, mix: 0.5 },
  { type: 'burn', color: 0xfb923c, mix: 0.45 },
  { type: 'poison', color: 0x4ade80, mix: 0.45 },
  { type: 'slow', color: 0x7dd3fc, mix: 0.35 },
];

const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

/** 未提供來源陣列時的共用空陣列（避免每幀配置 []） */
const NO_ITEMS: readonly never[] = [];

const createEmptyEnemyFrame = (): EnemyRenderFrame => ({
  id: '',
  type: 'normal',
  baseColor: '#ffffff',
  x: 0,
  y: 0,
  size: 0,
  health: 0,
  maxHealth: 0,
  healthRatio: 0,
  shield: 0,
  maxShield: 0,
  shieldRatio: 0,
  escortArmor: 0,
  spawnTime: -1,
  spawnAgeMs: -1,
  stealthFade: 0,
  phaseFade: 0,
  ghostFade: 0,
  statusTint: 0,
  statusTintMix: 0,
  effects: [],
  isDisplaced: false,
  abilitySuppressed: false,
});

const createEmptyProjectileFrame = (): ProjectileRenderFrame => ({
  id: '',
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  size: 0,
  color: '#ffffff',
  towerType: 'basic',
  isInstant: false,
  createdAt: undefined,
  rotation: undefined,
  hitEffect: undefined,
  trailPoints: undefined,
});

const EMPTY_GRID_POS = { col: 0, row: 0 };

const createEmptyTowerFrame = (): TowerRenderFrame => ({
  id: '',
  type: 'basic',
  gridPos: EMPTY_GRID_POS,
  level: 1,
  rotation: 0,
  health: 0,
  maxHealth: 0,
  healthRatio: 0,
  placedAt: undefined,
  lastAttackTime: undefined,
  lastUpgradeTime: undefined,
  locked: false,
  fusedFrom: undefined,
  targetId: null,
});

/** 只擴充、不縮減；容量成長時才配置新 slot */
const ensureCapacity = <T>(slots: T[], required: number, create: () => T): void => {
  while (slots.length < required) {
    slots.push(create());
  }
};

const pickStatusTint = (effects: readonly StatusEffect[], frame: EnemyRenderFrame): void => {
  frame.statusTint = 0;
  frame.statusTintMix = 0;
  for (let i = 0; i < STATUS_TINTS.length; i++) {
    const spec = STATUS_TINTS[i];
    for (let j = 0; j < effects.length; j++) {
      if (effects[j].type === spec.type) {
        frame.statusTint = spec.color;
        frame.statusTintMix = spec.mix;
        return;
      }
    }
  }
};

/** 建立可重複使用的 snapshot 緩衝（每個渲染器一份，存活於元件 / effect 生命週期） */
export const createRenderSnapshot = (enemyCapacity = 256): RenderSnapshot => {
  const snapshot: RenderSnapshot = {
    frameId: 0,
    timeMs: 0,
    enemyCount: 0,
    enemies: [],
    projectileCount: 0,
    projectiles: [],
    towerCount: 0,
    towers: [],
  };
  ensureCapacity(snapshot.enemies, enemyCapacity, createEmptyEnemyFrame);
  return snapshot;
};

/**
 * 把世界狀態投影成這一幀的渲染資料。
 * @param source 只要求有 enemies / towers / projectiles 陣列（store state、replay、測試 fixture 都適用）
 * @param out 呼叫端持有的緩衝；回傳同一個物件（方便串接）
 */
export const writeRenderSnapshot = (
  source: {
    enemies: readonly Enemy[];
    towers?: readonly Tower[];
    projectiles?: readonly Projectile[];
  },
  out: RenderSnapshot,
  nowMs: number,
): RenderSnapshot => {
  const enemies = source.enemies;
  const count = enemies.length;
  ensureCapacity(out.enemies, count, createEmptyEnemyFrame);

  for (let i = 0; i < count; i++) {
    const enemy = enemies[i];
    const frame = out.enemies[i];

    const stealthFade = getEnemyStealthFade(enemy, nowMs);
    const phaseFade = getEnemyPhaseFade(enemy, nowMs);
    const maxShield = enemy.maxShield ?? 0;
    const shield = enemy.shield ?? 0;

    frame.id = enemy.id;
    frame.type = enemy.type;
    frame.baseColor = resolveEnemyData(enemy.originType ?? enemy.type).color;
    frame.x = enemy.x;
    frame.y = enemy.y;
    frame.size = enemy.size;
    frame.health = enemy.health;
    frame.maxHealth = enemy.maxHealth;
    frame.healthRatio = enemy.maxHealth > 0 ? clamp01(enemy.health / enemy.maxHealth) : 0;
    frame.shield = shield;
    frame.maxShield = maxShield;
    frame.shieldRatio = maxShield > 0 ? clamp01(shield / maxShield) : 0;
    frame.escortArmor = enemy.escortArmor ?? 0;
    frame.spawnTime = enemy.spawnTime ?? -1;
    frame.spawnAgeMs = enemy.spawnTime === undefined ? -1 : nowMs - enemy.spawnTime;
    frame.stealthFade = stealthFade;
    frame.phaseFade = phaseFade;
    frame.ghostFade = stealthFade > phaseFade ? stealthFade : phaseFade;
    frame.effects = enemy.effects;
    frame.isDisplaced = enemy.isDisplaced === true;
    frame.abilitySuppressed = isJammerSuppressed(enemy, nowMs);
    pickStatusTint(enemy.effects, frame);
  }
  out.enemyCount = count;

  const projectiles = source.projectiles ?? NO_ITEMS;
  const projectileCount = projectiles.length;
  ensureCapacity(out.projectiles, projectileCount, createEmptyProjectileFrame);

  for (let i = 0; i < projectileCount; i++) {
    const projectile = projectiles[i];
    const frame = out.projectiles[i];
    frame.id = projectile.id;
    frame.x = projectile.x;
    frame.y = projectile.y;
    frame.targetX = projectile.targetX;
    frame.targetY = projectile.targetY;
    frame.size = projectile.size;
    frame.color = projectile.color;
    frame.towerType = projectile.towerType;
    frame.isInstant = projectile.isInstant === true;
    frame.createdAt = projectile.createdAt;
    frame.rotation = projectile.rotation;
    frame.hitEffect = projectile.hitEffect;
    frame.trailPoints = projectile.trailPoints;
  }
  out.projectileCount = projectileCount;

  const towers = source.towers ?? NO_ITEMS;
  const towerCount = towers.length;
  ensureCapacity(out.towers, towerCount, createEmptyTowerFrame);

  for (let i = 0; i < towerCount; i++) {
    const tower = towers[i];
    const frame = out.towers[i];
    frame.id = tower.id;
    frame.type = tower.type;
    frame.gridPos = tower.gridPos;
    frame.level = tower.level;
    frame.rotation = tower.rotation;
    frame.health = tower.health;
    frame.maxHealth = tower.maxHealth;
    frame.healthRatio = tower.maxHealth > 0 ? clamp01(tower.health / tower.maxHealth) : 0;
    frame.placedAt = tower.placedAt;
    frame.lastAttackTime = tower.lastAttackTime;
    frame.lastUpgradeTime = tower.lastUpgradeTime;
    frame.locked = tower.locked === true;
    frame.fusedFrom = tower.fusedFrom;
    frame.targetId = tower.target ? tower.target.id : null;
  }
  out.towerCount = towerCount;

  out.timeMs = nowMs;
  out.frameId += 1;
  return out;
};
