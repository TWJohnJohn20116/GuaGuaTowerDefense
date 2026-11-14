import type { 
  PathConfig, TowerType, TowerData, Tile, TileType, KeyBindings, GridPosition, Mod, Custom3DModel
} from '@/types/game';
import { GAME_CONSTANTS, PATHS, TOWER_DATA, ENEMY_DATA } from '@/data/gameData';
import { useModStore } from './modStore';
import { getArmorTakenMult, getDamageTakenMult, type CombatEffectLike } from '@/data/combatStatus';

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

export const getEnemyVisuals = (enemyType: string): ModVisuals => {
  const mods = useModStore.getState().mods;
  if (mods !== enemyVisualsModsRef) {
    enemyVisualsCache.clear();
    enemyVisualsModsRef = mods;
  }

  const cached = enemyVisualsCache.get(enemyType);
  if (cached) return cached;

  const visuals = buildEnemyVisuals(enemyType, mods);
  enemyVisualsCache.set(enemyType, visuals);
  return visuals;
};

// ============ 隱身敵人（stealth）週期判定 ============
// 隱身節奏：出生後先「可見 stealthCooldown ms」→「隱身 stealthDuration ms」循環。
// 以 spawnTime 推算的純函式，戰鬥邏輯與 2D/3D 渲染共用，無需額外運行時狀態。

/** 隱身淡入淡出時長 (ms)，渲染過渡用 */
const STEALTH_FADE_MS = 250;

/** 敵人目前是否處於隱身狀態（塔無法鎖定為主目標） */
export const isEnemyStealthed = (
  enemy: { type: string; health: number; spawnTime?: number },
  now: number,
): boolean => {
  if (enemy.health <= 0) return false;
  const data = ENEMY_DATA[enemy.type as keyof typeof ENEMY_DATA];
  if (data?.ability !== 'stealth') return false;
  const dur = data.stealthDuration ?? 3000;
  const cd = data.stealthCooldown ?? 5000;
  const t = (now - (enemy.spawnTime ?? now)) % (dur + cd);
  return t >= cd;
};

/**
 * 隱身視覺強度 0~1（0=完全可見、1=完全隱身），含 STEALTH_FADE_MS 平滑過渡。
 * 非隱身型敵人恆回傳 0。
 */
export const getEnemyStealthFade = (
  enemy: { type: string; health: number; spawnTime?: number },
  now: number,
): number => {
  if (enemy.health <= 0) return 0;
  const data = ENEMY_DATA[enemy.type as keyof typeof ENEMY_DATA];
  if (data?.ability !== 'stealth') return 0;
  const dur = data.stealthDuration ?? 3000;
  const cd = data.stealthCooldown ?? 5000;
  const cycle = dur + cd;
  const t = (now - (enemy.spawnTime ?? now)) % cycle;
  if (t < cd) {
    // 可見期：尾端淡出進入隱身
    const untilStealth = cd - t;
    return untilStealth < STEALTH_FADE_MS ? 1 - untilStealth / STEALTH_FADE_MS : 0;
  }
  // 隱身期：尾端淡入回到可見
  const untilVisible = cycle - t;
  return untilVisible < STEALTH_FADE_MS ? untilVisible / STEALTH_FADE_MS : 1;
};

// ============ 幽靈敵人（phase）相位週期判定 ============
// 相位節奏：出生後先「實體 phaseCooldown ms」→「相位 phaseDuration ms」循環。
// 相位期間塔無法鎖定且完全免疫所有傷害（直擊 / AOE / DoT）。

/** 敵人目前是否處於相位狀態（無法鎖定且免疫傷害） */
export const isEnemyPhased = (
  enemy: { type: string; health: number; spawnTime?: number },
  now: number,
): boolean => {
  if (enemy.health <= 0) return false;
  const data = ENEMY_DATA[enemy.type as keyof typeof ENEMY_DATA];
  if (data?.ability !== 'phase') return false;
  const dur = data.phaseDuration ?? 2000;
  const cd = data.phaseCooldown ?? 4000;
  const t = (now - (enemy.spawnTime ?? now)) % (dur + cd);
  return t >= cd;
};

/** 相位視覺強度 0~1（0=實體、1=完全相位），含平滑過渡。非相位型敵人恆回傳 0。 */
export const getEnemyPhaseFade = (
  enemy: { type: string; health: number; spawnTime?: number },
  now: number,
): number => {
  if (enemy.health <= 0) return 0;
  const data = ENEMY_DATA[enemy.type as keyof typeof ENEMY_DATA];
  if (data?.ability !== 'phase') return 0;
  const dur = data.phaseDuration ?? 2000;
  const cd = data.phaseCooldown ?? 4000;
  const cycle = dur + cd;
  const t = (now - (enemy.spawnTime ?? now)) % cycle;
  if (t < cd) {
    const untilPhase = cd - t;
    return untilPhase < STEALTH_FADE_MS ? 1 - untilPhase / STEALTH_FADE_MS : 0;
  }
  const untilSolid = cycle - t;
  return untilSolid < STEALTH_FADE_MS ? untilSolid / STEALTH_FADE_MS : 1;
};

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
      (ENEMY_DATA[enemy.type as keyof typeof ENEMY_DATA]?.armorValue ?? 0)
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
