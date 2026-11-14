/**
 * 回放播放引擎：快照二分搜尋 + 實體插值
 *
 * 回放快照以固定間隔錄製（新版 333ms、舊版 1000ms），直接逐快照切換會造成
 * 敵人「一秒跳一格」的卡頓。本模組在相鄰快照之間做線性插值，
 * 讓畫布能以顯示器幀率（rAF，遠超 24 FPS）平滑繪製：
 *  - 敵人：依 id 配對，位置 / 血量線性插值；新出現的在後半段淡入，消失的淡出
 *  - 塔：位置固定，取前一快照清單（旋轉角插值），新塔在 t>0.5 後出現
 *  - 子彈：壽命極短無法配對，取較近的快照原樣顯示
 *  - 統計（金錢 / 生命 / 分數）：線性插值，顯示端取整
 */

import type { ReplaySnapshot, ReplayEnemyEntity, ReplayTowerEntity, ReplayProjectileEntity } from '@/store/replayStore';

/** 插值後供畫布繪製的敵人（含淡入淡出透明度） */
interface RenderEnemy extends ReplayEnemyEntity {
  alpha: number;
}

interface RenderFrame {
  towers: ReplayTowerEntity[];
  enemies: RenderEnemy[];
  projectiles: ReplayProjectileEntity[];
  /** 插值後統計（顯示端自行取整） */
  money: number;
  health: number;
  score: number;
  currentWave: number;
  enemyCount: number;
  towerCount: number;
  projectileCount: number;
  totalDamage: number;
  totalKills: number;
}

/** 二分搜尋：回傳最後一個 time <= t 的快照索引（無則 -1） */
function findSnapshotIndex(snapshots: ReplaySnapshot[], t: number): number {
  let lo = 0;
  let hi = snapshots.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (snapshots[mid].time <= t) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 兩快照間的敵人插值（id 配對） */
function interpolateEnemies(
  prev: ReplayEnemyEntity[] | undefined,
  next: ReplayEnemyEntity[] | undefined,
  t: number,
): RenderEnemy[] {
  const a = prev ?? [];
  const b = next ?? [];
  if (a.length === 0 && b.length === 0) return [];

  const nextById = new Map<string, ReplayEnemyEntity>();
  for (const e of b) nextById.set(e.id, e);

  const out: RenderEnemy[] = [];
  const seen = new Set<string>();

  for (const e0 of a) {
    const e1 = nextById.get(e0.id);
    if (e1) {
      seen.add(e0.id);
      out.push({
        ...e0,
        x: lerp(e0.x, e1.x, t),
        y: lerp(e0.y, e1.y, t),
        hp: lerp(e0.hp, e1.hp, t),
        alpha: 1,
      });
    } else {
      // 下一快照已消失（被擊殺 / 抵達終點）：前半段淡出
      const alpha = Math.max(0, 1 - t * 2);
      if (alpha > 0.02) out.push({ ...e0, alpha });
    }
  }

  // 僅存在於下一快照的（新生成）：後半段淡入
  for (const e1 of b) {
    if (seen.has(e1.id)) continue;
    const alpha = Math.max(0, (t - 0.5) * 2);
    if (alpha > 0.02) out.push({ ...e1, alpha });
  }

  return out;
}

/** 兩快照間的塔插值（位置固定，僅旋轉角；新塔在後半段出現） */
function interpolateTowers(
  prev: ReplayTowerEntity[] | undefined,
  next: ReplayTowerEntity[] | undefined,
  t: number,
): ReplayTowerEntity[] {
  const a = prev ?? [];
  const b = next ?? [];
  if (a.length === 0 && b.length === 0) return [];

  const nextById = new Map<string, ReplayTowerEntity>();
  for (const tw of b) nextById.set(tw.id, tw);

  const out: ReplayTowerEntity[] = [];
  const seen = new Set<string>();

  for (const t0 of a) {
    const t1 = nextById.get(t0.id);
    if (t1) {
      seen.add(t0.id);
      // 旋轉角插值（取最短弧）
      let d = (t1.rotation ?? 0) - (t0.rotation ?? 0);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      out.push({ ...t0, rotation: (t0.rotation ?? 0) + d * t, level: t > 0.5 ? t1.level : t0.level });
    } else if (t < 0.5) {
      // 已被出售：前半段仍顯示
      out.push(t0);
    }
  }

  for (const t1 of b) {
    if (!seen.has(t1.id) && t >= 0.5) out.push(t1);
  }

  return out;
}

/**
 * 主入口：給定 playhead 時間，回傳插值後的渲染幀。
 * 快照不足或落在序列外時自動鉗制。
 */
export function buildRenderFrame(snapshots: ReplaySnapshot[], playhead: number): RenderFrame | null {
  if (snapshots.length === 0) return null;

  const idx = findSnapshotIndex(snapshots, playhead);
  const s0 = snapshots[Math.max(0, idx)];
  const s1 = idx >= 0 && idx < snapshots.length - 1 ? snapshots[idx + 1] : null;

  // 無下一快照（播放至結尾 / 開頭之前）：直接用 s0
  if (!s1 || idx < 0) {
    return {
      towers: s0.towers ?? [],
      enemies: (s0.enemies ?? []).map((e) => ({ ...e, alpha: 1 })),
      projectiles: s0.projectiles ?? [],
      money: s0.money,
      health: s0.health,
      score: s0.score,
      currentWave: s0.currentWave,
      enemyCount: s0.enemyCount,
      towerCount: s0.towerCount,
      projectileCount: s0.projectileCount,
      totalDamage: s0.totalDamage,
      totalKills: s0.totalKills,
    };
  }

  const span = Math.max(0.001, s1.time - s0.time);
  const t = Math.max(0, Math.min(1, (playhead - s0.time) / span));

  return {
    towers: interpolateTowers(s0.towers, s1.towers, t),
    enemies: interpolateEnemies(s0.enemies, s1.enemies, t),
    // 子彈壽命短無法配對：取較近的快照
    projectiles: (t < 0.5 ? s0.projectiles : s1.projectiles) ?? [],
    money: lerp(s0.money, s1.money, t),
    health: lerp(s0.health, s1.health, t),
    score: lerp(s0.score, s1.score, t),
    currentWave: t < 1 ? s0.currentWave : s1.currentWave,
    enemyCount: Math.round(lerp(s0.enemyCount, s1.enemyCount, t)),
    towerCount: t < 0.5 ? s0.towerCount : s1.towerCount,
    projectileCount: Math.round(lerp(s0.projectileCount, s1.projectileCount, t)),
    totalDamage: lerp(s0.totalDamage, s1.totalDamage, t),
    totalKills: t < 1 ? s0.totalKills : s1.totalKills,
  };
}
