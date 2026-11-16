import type { AutoBattleContext, AutoBattleTrigger } from '@/types/autobattle';

interface TriggerSnapshot {
  enemyIds: Set<string>;
  money: number;
  wave: number;
  health: number;
  readySkills: number;
  nearestProgress: number;
}

let last: TriggerSnapshot | null = null;

const snapshotOf = (ctx: AutoBattleContext): TriggerSnapshot => ({
  enemyIds: new Set(ctx.enemies.map((e) => e.id)),
  money: ctx.money,
  wave: ctx.wave,
  health: ctx.health,
  readySkills: ctx.towers.filter((t) => t.skillReady).length,
  nearestProgress: ctx.enemies.reduce((m, e) => Math.max(m, e.progress), 0),
});

/** 金錢是否跨過 500 的整數門檻（避免每次加錢都觸發） */
const crossedMoneyStep = (before: number, after: number): boolean =>
  Math.floor(before / 500) !== Math.floor(after / 500);

/**
 * 事件驅動：只有「值得重新決策」的變化才回傳非空陣列。
 * 狀態存在模組級變數（僅快取用途，符合專案對模組級可變變數的規範）。
 */
export const pollTriggers = (ctx: AutoBattleContext): AutoBattleTrigger[] => {
  const now = snapshotOf(ctx);
  if (!last) {
    last = now;
    return ['waveStart'];
  }
  const triggers: AutoBattleTrigger[] = [];
  if (now.wave !== last.wave) triggers.push(now.wave > last.wave ? 'waveStart' : 'waveEnd');
  if (now.health < last.health) {
    triggers.push('healthDrop');
    if (now.nearestProgress > 0.9) triggers.push('leak');
  }
  for (const id of now.enemyIds) {
    if (!last.enemyIds.has(id)) {
      triggers.push('enemyAppeared');
      break;
    }
  }
  if (crossedMoneyStep(last.money, now.money)) triggers.push('moneyThreshold');
  else if (ctx.money >= ctx.lookahead.moneyReserve && last.money < ctx.lookahead.moneyReserve) {
    triggers.push('moneyThreshold');
  }
  if (now.readySkills > last.readySkills) triggers.push('skillReady');
  last = now;
  return triggers;
};

/** 重開局／切換地圖時清掉快照，避免跨局誤判 */
export const resetTriggers = (): void => {
  last = null;
};
