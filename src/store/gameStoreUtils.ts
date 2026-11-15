import type { 
  PathConfig, TowerType, TowerData, Tile, TileType, KeyBindings, GridPosition, Mod, Custom3DModel,
  EnemyData, EnemyType, CustomTowerData, UpgradePath
} from '@/types/game';
import { GAME_CONSTANTS, PATHS, TOWER_DATA, ENEMY_DATA } from '@/data/gameData';
import { useModStore } from './modStore';
import { setEnemyDataResolver } from '@/data/enemyDataProvider';
import { getArmorTakenMult, getDamageTakenMult, type CombatEffectLike } from '@/data/combatStatus';
import {
  getEnemyPhaseFade,
  getEnemyStealthFade,
  isEnemyPhased,
  isEnemyStealthed,
} from '@/data/enemyVisibility';
import { getTowerStatBonus } from '@/data/towerCombatStats';

// 性能優化：getTowerData 結果快取
// - 基礎塔（TOWER_DATA）為穩定常數，直接命中 O(1) hash 查找
// - Mod 塔在 mods 陣列引用變更時清空快取
let cachedModsRef: Mod[] | null = null;
const modTowerDataCache = new Map<string, TowerData | null>();

const buildModTowerData = (mods: Mod[], towerType: string): TowerData | null => {
  for (const mod of mods) {
    if (!mod.enabled) continue;
    const modTower = mod.content.towers?.find(t => t.id === towerType);
    if (!modTower) continue;
    return {
      name: modTower.name,
      description: modTower.description || '',
      color: modTower.color,
      highlightColor: modTower.highlightColor || modTower.color + '80',
      damage: modTower.damage,
      damagePerSecond: modTower.damagePerSecond,
      range: modTower.range,
      fireRate: modTower.fireRate || 1,
      cost: modTower.cost,
      projectileColor: modTower.projectileColor || '#ffffff',
      projectileSpeed: modTower.projectileSpeed || 400,
      projectileSize: modTower.projectileSize || 4,
      splash: modTower.splash,
      splashRadius: modTower.splashRadius,
      slowEffect: modTower.slowEffect,
      slowAmount: modTower.slowAmount,
      slowDuration: modTower.slowDuration,
      poisonEffect: modTower.poisonEffect,
      poisonDamage: modTower.poisonDamage,
      poisonDuration: modTower.poisonDuration,
      lightningEffect: modTower.lightningEffect,
      chainCount: modTower.chainCount,
    };
  }
  return null;
};

// 獲取塔資料（支援 Mod 塔，含快取）
export const getTowerData = (towerType: string): TowerData | null => {
  const base = TOWER_DATA[towerType as TowerType];
  if (base) return base;

  const mods = useModStore.getState().mods;
  if (mods !== cachedModsRef) {
    cachedModsRef = mods;
    modTowerDataCache.clear();
  }

  const cached = modTowerDataCache.get(towerType);
  if (cached !== undefined) return cached;

  const result = buildModTowerData(mods, towerType);
  modTowerDataCache.set(towerType, result);
  return result;
};

// 性能優化：自訂塔升級分支快取（失效條件與 getTowerData 相同：mod 陣列引用變更）
let cachedBranchModsRef: Mod[] | null = null;
const modTowerBranchCache = new Map<string, CustomTowerData['upgradeBranches'] | undefined>();

/**
 * 自訂塔的升級分支（工坊寫進 CustomTowerData.upgradeBranches）。
 * 官方塔或未設定時回 undefined，呼叫端就會走原本的官方分支表。
 */
const getTowerUpgradeBranches = (towerType: string): CustomTowerData['upgradeBranches'] => {
  if (TOWER_DATA[towerType as TowerType]) return undefined;
  const mods = useModStore.getState().mods;
  if (mods !== cachedBranchModsRef) {
    cachedBranchModsRef = mods;
    modTowerBranchCache.clear();
  }
  if (modTowerBranchCache.has(towerType)) return modTowerBranchCache.get(towerType);

  let branches: CustomTowerData['upgradeBranches'];
  for (const mod of mods) {
    if (!mod.enabled) continue;
    const modTower = mod.content.towers?.find(t => t.id === towerType);
    if (!modTower) continue;
    branches = modTower.upgradeBranches;
    break;
  }
  modTowerBranchCache.set(towerType, branches);
  return branches;
};

/**
 * 對局與面板共用的屬性加成：自訂塔帶入工坊的升級分支，官方塔行為與舊版完全相同。
 * 之所以放在 store 層，是因為分支要從 modStore 解析；data 層維持純函式。
 */
export const getTowerStatBonusFor = (tower: { type: string; level: number; upgradePath: UpgradePath }) =>
  getTowerStatBonus({
    type: tower.type as TowerType,
    level: tower.level,
    upgradePath: tower.upgradePath,
    customBranches: getTowerUpgradeBranches(tower.type),
  });

// 性能優化：遞增式投射物 ID 取代 Math.random().toString(36)
// 用 32 位無號數環繞，避免長期遊戲 ID 過長
let projectileIdCounter = 0;
export const generateProjectileId = (): string => {
  projectileIdCounter = (projectileIdCounter + 1) >>> 0;
  return projectileIdCounter.toString(36);
};

// Mod 視覺參數
interface ModVisuals {
  modelType: string;
  modelScale: number;
  glowColor: string | null;
  glowIntensity: number;
  barrelLength: number;
  /** 自訂 3D 部件模型（3D 模型編輯器產生；優先於 modelType） */
  custom3d: Custom3DModel | null;
}

const DEFAULT_TOWER_VISUALS: ModVisuals = { modelType: 'basic', modelScale: 1, glowColor: null, glowIntensity: 0, barrelLength: 1, custom3d: null };
const DEFAULT_ENEMY_VISUALS: ModVisuals = { modelType: 'normal', modelScale: 1, glowColor: null, glowIntensity: 0, barrelLength: 1, custom3d: null };
// 獲取塔的完整視覺參數
export const getTowerVisuals = (towerType: string): ModVisuals => {
  if (TOWER_DATA[towerType as TowerType]) return { ...DEFAULT_TOWER_VISUALS, modelType: towerType };
  const mods = useModStore.getState().mods;
  for (const mod of mods) {
    if (!mod.enabled) continue;
    const t = mod.content.towers?.find(t => t.id === towerType);
    if (t) return {
      modelType: t.modelType || 'basic',
      modelScale: t.modelScale ?? 1,
      glowColor: t.glowColor || null,
      glowIntensity: t.glowIntensity ?? 0,
      barrelLength: t.barrelLength ?? 1,
      custom3d: t.custom3d && t.custom3d.parts.length > 0 ? t.custom3d : null,
    };
  }
  return DEFAULT_TOWER_VISUALS;
};
// 獲取敵人的完整視覺參數
//
// 性能：這個函式會被渲染層「每隻敵人每幀」呼叫一次（壓測 7,587 隻 ≈ 45 萬次/秒）。
// 原本每次都 `{ ...DEFAULT_ENEMY_VISUALS, modelType }` 新建物件，等於每秒產生 45 萬個
// 短命物件，是幀時間 P95 抖動（GC）的主要來源。這裡改成以 enemyType 為 key 快取，
// mod 清單換了才整批失效——回傳值是共享物件，呼叫端只能讀、不可改。
let enemyVisualsModsRef: Mod[] | null = null;
const enemyVisualsCache = new Map<string, ModVisuals>();

const buildEnemyVisuals = (enemyType: string, mods: Mod[]): ModVisuals => {
  if (ENEMY_DATA[enemyType as keyof typeof ENEMY_DATA]) {
    return enemyType === 'normal' ? DEFAULT_ENEMY_VISUALS : { ...DEFAULT_ENEMY_VISUALS, modelType: enemyType };
  }

  for (const mod of mods) {
    if (!mod.enabled) continue;
    const e = mod.content.enemies?.find(e => e.id === enemyType);
    if (e) {
      return {
        modelType: e.modelType || 'normal',
        modelScale: e.modelScale ?? 1,
        glowColor: e.glowColor || null,
        glowIntensity: e.glowIntensity ?? 0,
        barrelLength: 1,
        custom3d: null,
      };
    }
  }
  return DEFAULT_ENEMY_VISUALS;
};

/**
 * 敵人視覺參數。
 * 自訂敵人 spawn 時 type 會被映到內建基底（normal／flyer…），真正的外觀要看 originType，
 * 所以 cache key 必須把兩者一起算，否則同型不同 mod 敵人會互相蓋掉。
 */
export const getEnemyVisuals = (enemyType: string, originType?: string): ModVisuals => {
  const mods = useModStore.getState().mods;
  if (mods !== enemyVisualsModsRef) {
    enemyVisualsCache.clear();
    enemyVisualsModsRef = mods;
  }

  const lookup = originType ?? enemyType;
  const cacheKey = `${enemyType}|${lookup}`;
  const cached = enemyVisualsCache.get(cacheKey);
  if (cached) return cached;

  const visuals = buildEnemyVisuals(lookup, mods);
  enemyVisualsCache.set(cacheKey, visuals);
  return visuals;
};

// ============ Mod 敵人解析 ============
const modEnemyDataCache = new Map<string, EnemyData>();
let cachedEnemyModsRef: Mod[] | null = null;

const buildModEnemyData = (mods: Mod[], enemyId: string): EnemyData | null => {
  for (const mod of mods) {
    if (!mod.enabled) continue;
    const enemy = mod.content.enemies?.find((item) => item.id === enemyId);
    if (!enemy) continue;
    return {
      ...enemy,
      name: enemy.name || enemyId,
      description: enemy.description ?? '',
      ability: enemy.ability,
    };
  }
  return null;
};

/**
 * 取得敵人資料：內建優先、其次已啟用 mod 的自訂敵人，最後退回 normal。
 *
 * 回傳值可能是共用的常數物件（內建）或快取物件（mod），呼叫端只能讀、不可改。
 */
export const getEnemyData = (type: string): EnemyData => {
  const builtin = ENEMY_DATA[type as EnemyType];
  if (builtin) return builtin;
  const mods = useModStore.getState().mods;
  if (mods !== cachedEnemyModsRef) {
    cachedEnemyModsRef = mods;
    modEnemyDataCache.clear();
  }
  const cached = modEnemyDataCache.get(type);
  if (cached) return cached;
  const resolved = buildModEnemyData(mods, type) ?? ENEMY_DATA.normal;
  modEnemyDataCache.set(type, resolved);
  return resolved;
};

// data 層（隱身／相位、renderSnapshot）透過注入解析自訂敵人，不反向 import store
setEnemyDataResolver(getEnemyData);

/** 這個 id 是否可生成（內建或已啟用 mod 的自訂敵人） */
export const isKnownEnemyType = (type: string): boolean => {
  if (ENEMY_DATA[type as EnemyType]) return true;
  const mods = useModStore.getState().mods;
  return mods.some(
    (mod) => mod.enabled && (mod.content.enemies ?? []).some((enemy) => enemy.id === type),
  );
};

/**
 * 自訂敵人要掛在哪個內建 type 上。
 *
 * 引擎的能力分支是看 EnemyData.ability（飛行、治療、護盾…），不是看 type；
 * type 主要影響模型與部分硬判斷，所以把 ability 映回對應基底即可。
 */
export const inferEnemyBaseType = (data: EnemyData): EnemyType => {
  switch (data.ability) {
    case 'flying': return 'flyer';
    case 'healing': return 'healer';
    case 'spawning': return 'spawner';
    case 'shield': return 'shield';
    case 'stealth': return 'stealth';
    case 'teleport': return 'mage';
    case 'explode': return 'bomber';
    case 'jam': return 'jammer';
    case 'escort': return 'escort';
    case 'swarm': return 'swarm';
    default: return 'normal';
  }
};

// ============ 隱身 / 相位週期判定 ============
// 判定已搬到 data 層（`src/data/enemyVisibility.ts`）：戰鬥邏輯與 2D/3D 渲染的
// snapshot 都要用同一份，且渲染端不該反向 import store。這裡保留同名轉出，
// 既有呼叫端（gameLoop / 技能 / 測試）不必改 import 路徑。
export { getEnemyPhaseFade, getEnemyStealthFade, isEnemyPhased, isEnemyStealthed };

// ============ 統一傷害管線（裝甲減傷 / 護盾吸收 / 相位免疫） ============

interface EnemyDamageOptions {
  /** 跳過裝甲減傷（DoT、火焰持續傷害、玩家技能等「非實彈」傷害） */
  ignoreArmor?: boolean;
  /** 跳過護盾吸收直擊本體（毒系 DoT 的反護盾特性） */
  ignoreShield?: boolean;
}

interface EnemyDamageOutcome {
  /** 結算後生命值 */
  health: number;
  /** 結算後護盾值 */
  shield: number;
  /** 實際造成的傷害總量（護盾吸收 + 扣血，供統計使用） */
  dealt: number;
  /** 相位免疫中，本次傷害完全無效 */
  immune: boolean;
}

/**
 * 對敵人套用一次傷害，依序處理：相位免疫 → 裝甲減傷 → 護盾吸收 → 扣血。
 * 純函式：不修改傳入的 enemy，由呼叫端把 health/shield 寫回。
 */
export const applyDamageToEnemy = (
  enemy: {
    type: string;
    /** 自訂敵人原始 id（mod）；有值時裝甲等數值改查它 */
    originType?: string;
    health: number;
    shield?: number;
    spawnTime?: number;
    armorBonus?: number;
    escortArmor?: number;
    effects?: CombatEffectLike[];
  },
  rawDamage: number,
  now: number,
  opts?: EnemyDamageOptions,
): EnemyDamageOutcome => {
  const curShield = enemy.shield ?? 0;
  if (rawDamage <= 0) {
    return { health: enemy.health, shield: curShield, dealt: 0, immune: false };
  }

  // 相位免疫：完全無傷
  if (isEnemyPhased(enemy, now)) {
    return { health: enemy.health, shield: curShield, dealt: 0, immune: true };
  }

  // 虛弱先放大傷害，再算裝甲
  let damage = rawDamage * getDamageTakenMult(enemy.effects, now);

  // 裝甲減傷：每次受擊固定減免，至少保留 1 點傷害
  if (!opts?.ignoreArmor) {
    // 基礎裝甲（依敵人 type）+ 突變挑戰 per-enemy 裝甲加成；破甲會削掉一部分
    const armor = (
      (getEnemyData(enemy.originType ?? enemy.type).armorValue ?? 0)
      + (enemy.armorBonus ?? 0)
      + (enemy.escortArmor ?? 0)
    ) * getArmorTakenMult(enemy.effects, now);
    if (armor > 0) damage = Math.max(1, damage - armor);
  }

  // 護盾吸收
  let shield = curShield;
  let toHealth = damage;
  if (!opts?.ignoreShield && shield > 0) {
    const absorbed = Math.min(shield, damage);
    shield -= absorbed;
    toHealth = damage - absorbed;
  }

  const health = enemy.health - toHealth;
  const dealt = (damage - toHealth) + Math.min(toHealth, Math.max(0, enemy.health));
  return { health, shield, dealt, immune: false };
};

// 從 waypoints 陣列生成路徑格子集合
const generateWaypointTiles = (waypoints: GridPosition[]): Set<string> => {
  const tiles = new Set<string>();
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    const dx = Math.sign(end.col - start.col);
    const dy = Math.sign(end.row - start.row);
    let col = start.col;
    let row = start.row;
    while (col !== end.col || row !== end.row) {
      tiles.add(`${col},${row}`);
      if (col !== end.col) col += dx;
      if (row !== end.row) row += dy;
    }
    tiles.add(`${end.col},${end.row}`);
  }
  return tiles;
};

// 生成路径格子（支援普通地圖和進階地圖）
export const generatePathTiles = (pathName: string): Set<string> => {
  const path = PATHS[pathName];
  if (!path) return new Set();
  
  // 進階地圖：遍歷所有路段
  if (path.category === 'advanced' && path.segments && path.segments.length > 0) {
    const pathTiles = new Set<string>();
    for (const segment of path.segments) {
      const segTiles = generateWaypointTiles(segment.waypoints);
      segTiles.forEach(t => pathTiles.add(t));
    }
    return pathTiles;
  }
  
  // 普通地圖：使用 waypoints
  return generateWaypointTiles(path.waypoints);
};

// 找出進階地圖的叉路點（路段末端有多個 next 的位置）
const findForkPoints = (path: PathConfig): Set<string> => {
  const forkPoints = new Set<string>();
  if (!path.segments) return forkPoints;
  
  for (const segment of path.segments) {
    if (segment.next.length > 1) {
      // 叉路點 = 此路段最後一個 waypoint
      const lastWp = segment.waypoints[segment.waypoints.length - 1];
      forkPoints.add(`${lastWp.col},${lastWp.row}`);
    }
  }
  return forkPoints;
};

// 找出進階地圖的所有終點（路段 next 為空的最後一個 waypoint）
const findEndPoints = (path: PathConfig): Set<string> => {
  const endPoints = new Set<string>();
  if (!path.segments) return endPoints;
  
  for (const segment of path.segments) {
    if (segment.next.length === 0) {
      const lastWp = segment.waypoints[segment.waypoints.length - 1];
      endPoints.add(`${lastWp.col},${lastWp.row}`);
    }
  }
  return endPoints;
};

// 找出進階地圖的起點
const findStartPoint = (path: PathConfig): GridPosition | null => {
  if (!path.segments || !path.startSegmentId) return null;
  const startSeg = path.segments.find(s => s.id === path.startSegmentId);
  return startSeg ? startSeg.waypoints[0] : null;
};

// 初始化网格（支援普通地圖和進階地圖）
export const initializeGrid = (pathName: string): Tile[][] => {
  const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;
  const pathTiles = generatePathTiles(pathName);
  const path = PATHS[pathName];
  const blockedSet = new Set(
    (path?.blockedCells ?? []).map((c) => `${c.col},${c.row}`),
  );
  
  const isAdvanced = path?.category === 'advanced' && path.segments;
  
  // 計算起點、終點、叉路點
  let startPos: GridPosition | undefined;
  let endPoints = new Set<string>();
  let forkPoints = new Set<string>();
  
  if (isAdvanced && path.segments) {
    const sp = findStartPoint(path);
    startPos = sp || undefined;
    endPoints = findEndPoints(path);
    forkPoints = findForkPoints(path);
  } else if (path) {
    startPos = path.waypoints[0];
    const endPos = path.waypoints[path.waypoints.length - 1];
    if (endPos) endPoints.add(`${endPos.col},${endPos.row}`);
  }
  
  const grid: Tile[][] = [];
  
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowTiles: Tile[] = [];
    for (let col = 0; col < GRID_COLS; col++) {
      let type: TileType = 'empty';
      const key = `${col},${row}`;
      
      if (pathTiles.has(key)) {
        if (startPos && col === startPos.col && row === startPos.row) {
          type = 'start';
        } else if (endPoints.has(key)) {
          type = 'end';
        } else if (forkPoints.has(key)) {
          type = 'fork';
        } else {
          type = 'path';
        }
      } else if (blockedSet.has(key)) {
        type = 'blocked';
      }
      
      rowTiles.push({ type, row, col, towerId: null });
    }
    grid.push(rowTiles);
  }
  
  return grid;
};

// 生成唯一ID
export const generateId = () => Math.random().toString(36).substring(2, 9);

// 默認快捷鍵配置
export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  pause: 'KeyP',
  back: 'Escape',
  speed1: 'Digit1',
  speed2: 'Digit2',
  speed3: 'Digit3',
  cycleSpeed: 'Space',
  startWave: 'Enter',
  sellTower: 'KeyS',
  upgradeTower: 'KeyU',
};

// 从本地存儲獲取遊戲速度
export const getSavedGameSpeed = (): number => {
  const saved = localStorage.getItem('guagua-td-game-speed');
  return saved ? parseFloat(saved) : 2;
};

// 保存遊戲速度到本地存儲
export const saveGameSpeed = (speed: number): void => {
  localStorage.setItem('guagua-td-game-speed', String(speed));
};
