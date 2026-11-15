/**
 * 壓力測試資料建構器（純函式，可單獨測試）
 *
 * 目標：一鍵把戰場塞爆——預設 10,000 隻敵人 + 100 座塔，
 * 用來觀察「每幀全量 set + 12 個元件訂閱」到底吃掉多少幀預算。
 *
 * 幾個刻意的設計：
 * - 敵人 id 用固定前綴 `stress_e_*`，塔用 `stress_t_*`，清除時只要比對前綴，
 *   不需要記住任何隨機 id。
 * - 壓測敵人速度極慢（預設 0.05，正常敵人 0.4~1.0），所以測試期間不會一路衝到基地
 *   把血量打光、把局面結束掉——我們要量的是「負載」，不是「玩家能撐多久」。
 * - 敵人沿路徑折線均勻分佈，視覺上是一整條長龍，而不是全部疊在起點。
 */
import type {
  Enemy,
  EnemyType,
  GridPosition,
  MapPoint,
  PathConfig,
  Tower,
  TowerType,
} from '@/types/game';
import { TOWER_SKILLS } from '@/data/skillData';
import { defaultTargetPriority } from '@/data/towerTargeting';
import { DEFAULT_TOWER_RADIUS } from '@/data/mapGeometry';

export const STRESS_DEFAULT_ENEMIES = 10_000;
export const STRESS_DEFAULT_TOWERS = 100;

export const STRESS_ENEMY_ID_PREFIX = 'stress_e_';
export const STRESS_TOWER_ID_PREFIX = 'stress_t_';

/** 敵人速度：正常敵人 0.4~1.0，這裡刻意壓到 0.05 讓負載可持續觀察 */
const STRESS_ENEMY_SPEED = 0.05;
const STRESS_ENEMY_HEALTH = 500;
const STRESS_ENEMY_SIZE = 12;
const STRESS_ENEMY_REWARD = 0;

const ENEMY_CYCLE: EnemyType[] = ['normal', 'fast', 'tank', 'swarm', 'heavy'];
const TOWER_CYCLE: TowerType[] = [
  'basic', 'sniper', 'cannon', 'machine', 'frost', 'poison', 'laser', 'lightning', 'flame',
];

/**
 * 取出這張地圖可用的 waypoint 鏈。
 * 進階地圖（叉路系統）沒有 `waypoints`，改用起始路段；
 * 這樣壓測在兩種地圖上都能跑。
 */
export const resolvePathChain = (path?: PathConfig): { waypoints: GridPosition[]; segmentId?: string } => {
  if (!path) return { waypoints: [] };

  if (Array.isArray(path.waypoints) && path.waypoints.length >= 2) {
    return { waypoints: path.waypoints };
  }

  const segments = path.segments ?? [];
  if (segments.length > 0) {
    const start =
      segments.find((s) => s.id === path.startSegmentId) ??
      segments.reduce((longest, s) => (s.waypoints.length > longest.waypoints.length ? s : longest), segments[0]);
    if (start?.waypoints?.length >= 2) {
      return { waypoints: start.waypoints, segmentId: start.id };
    }
  }

  return { waypoints: [] };
};

const segmentLengths = (waypoints: GridPosition[]): number[] =>
  waypoints.slice(0, -1).map((p, i) => {
    const next = waypoints[i + 1];
    return Math.hypot(next.col - p.col, next.row - p.row);
  });

/**
 * 把「沿路徑走了多遠」換算成 { pathIndex, progress, x, y }。
 * 回傳的 pathIndex 一定落在 `[0, waypoints.length - 2]`，
 * 否則 updateEnemies 會把它判定成「已到達終點」而立刻移除。
 */
const pointAtDistance = (
  waypoints: GridPosition[],
  lengths: number[],
  distance: number,
): { pathIndex: number; progress: number; x: number; y: number } => {
  let remaining = distance;

  for (let i = 0; i < lengths.length; i++) {
    const segLen = lengths[i] || 1;
    if (remaining <= segLen) {
      const progress = Math.min(0.999, Math.max(0, remaining / segLen));
      const from = waypoints[i];
      const to = waypoints[i + 1];
      return {
        pathIndex: i,
        progress,
        x: from.col + (to.col - from.col) * progress,
        y: from.row + (to.row - from.row) * progress,
      };
    }
    remaining -= segLen;
  }

  // 超出總長：貼在最後一段的尾端（仍然不算「到達終點」）
  const lastIndex = Math.max(0, waypoints.length - 2);
  const from = waypoints[lastIndex];
  const to = waypoints[lastIndex + 1];
  return {
    pathIndex: lastIndex,
    progress: 0.999,
    x: from.col + (to.col - from.col) * 0.999,
    y: from.row + (to.row - from.row) * 0.999,
  };
};

interface BuildStressEnemiesOptions {
  count: number;
  path?: PathConfig;
  /** 只生成這個前綴之後的序號，避免和現有壓測實體撞 id */
  idOffset?: number;
}

/** 沿路徑均勻灑 count 隻慢速敵人 */
export const buildStressEnemies = ({
  count,
  path,
  idOffset = 0,
}: BuildStressEnemiesOptions): Enemy[] => {
  const { waypoints, segmentId } = resolvePathChain(path);
  if (count <= 0) return [];
  if (waypoints.length < 2) return [];

  const lengths = segmentLengths(waypoints);
  const total = lengths.reduce((sum, len) => sum + len, 0) || 1;
  const spawnTime = Date.now();

  const enemies: Enemy[] = [];
  for (let i = 0; i < count; i++) {
    // 0.0 ~ 0.98：整批沿路徑鋪開，最後一隻也不會站在終點上
    const ratio = count === 1 ? 0.02 : (i / count) * 0.98;
    const pos = pointAtDistance(waypoints, lengths, total * ratio);

    enemies.push({
      id: `${STRESS_ENEMY_ID_PREFIX}${idOffset + i}`,
      type: ENEMY_CYCLE[i % ENEMY_CYCLE.length],
      x: pos.x,
      y: pos.y,
      health: STRESS_ENEMY_HEALTH,
      maxHealth: STRESS_ENEMY_HEALTH,
      speed: STRESS_ENEMY_SPEED,
      pathIndex: pos.pathIndex,
      progress: pos.progress,
      effects: [],
      reward: STRESS_ENEMY_REWARD,
      size: STRESS_ENEMY_SIZE,
      spawnTime,
      ...(segmentId ? { currentSegmentId: segmentId, segmentWaypointIndex: pos.pathIndex } : {}),
    });
  }

  return enemies;
};

/** 依座標清單生成塔（等級 1、滿血、帶對應主動技能） */
export const buildStressTowers = (positions: MapPoint[], idOffset = 0): Tower[] => {
  const placedAt = Date.now();

  return positions.map((pos, i) => {
    const type = TOWER_CYCLE[i % TOWER_CYCLE.length];
    const skillType = TOWER_SKILLS[type];

    return {
      id: `${STRESS_TOWER_ID_PREFIX}${idOffset + i}`,
      type,
      pos,
      radius: DEFAULT_TOWER_RADIUS,
      level: 1,
      upgradePath: null,
      rotation: 0,
      target: null,
      lastFireTime: 0,
      kills: 0,
      totalDamage: 0,
      targetPriority: defaultTargetPriority(type),
      placedAt,
      health: 100,
      maxHealth: 100,
      skill: skillType
        ? { skillId: skillType, lastUsedTime: 0, isActive: false, activeUntil: 0 }
        : undefined,
    } satisfies Tower;
  });
};
