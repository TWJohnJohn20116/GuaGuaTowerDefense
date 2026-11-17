import type {
  AutoBattleCandidate,
  AutoBattleContext,
  AutoBattleDecision,
  AutoBattleRule,
  AutoBattleTrigger,
} from '@/types/autobattle';
import type { PathConfig } from '@/types/game';
import { DECISION_LIMITS } from '@/data/autobattle/scoreWeights';
import { buildCandidates, sumEnemyWeight } from './candidates';
import { applyRules } from './rules';
import { jitterPenalty } from './scoring';
import { buildNarration } from './narration';

export interface DecideInput {
  ctx: AutoBattleContext;
  pathConfig: PathConfig | undefined;
  costMult: number;
  rules: AutoBattleRule[];
  triggers: AutoBattleTrigger[];
  /** 目標 key → 上次對它動作的時間（防抖動） */
  lastActionAt: Map<string, number>;
  /** 連續猶豫次數：超過門檻就強制執行最佳候選，避免「一直不敢動」 */
  holdStreak?: number;
}

/** 連續猶豫超過這個次數就強制落地（0.05 分以上才值得做） */
const HOLD_STREAK_LIMIT = 6;
const MIN_EXECUTE_SCORE = 0.02;

let decisionSeq = 0;

const snapshotOf = (ctx: AutoBattleContext) => ({
  money: ctx.money,
  health: ctx.health,
  wave: ctx.wave,
  enemyCount: ctx.enemies.length,
  towerCount: ctx.towers.length,
  threat: Math.min(1, sumEnemyWeight(ctx.enemies) / 6),
});

/** 模式是否允許「真的落地」（assist／階段模式之外一律可） */
const modeAllowsExecution = (ctx: AutoBattleContext): boolean => {
  if (ctx.config.dryRun) return false;
  if (ctx.config.mode === 'assist') return false;
  if (ctx.config.mode === 'phases') return ctx.wave <= ctx.config.aiUntilWave;
  return true;
};

/**
 * 決定一次動作（純函式：只讀 ctx 與 rules，不碰 store）。
 * 回傳完整決策紀錄，呼叫端負責 execute()。
 */
export const decide = ({ ctx, pathConfig, costMult, rules, triggers, lastActionAt, holdStreak = 0 }: DecideInput): AutoBattleDecision => {
  const raw = buildCandidates({ ctx, pathConfig, costMult });
  const { candidates, conflicts } = applyRules(raw, ctx, rules);

  // 防抖動：最近動過的目標扣分
  const scored: AutoBattleCandidate[] = candidates.map((c) => {
    const penalty = jitterPenalty(lastActionAt.get(c.id), ctx.time, c.kind);
    if (penalty <= 0) return c;
    return { ...c, penalties: c.penalties + penalty, total: Math.max(0, c.total - penalty) };
  });

  const sorted = [...scored].sort((a, b) => b.total - a.total);
  const alive = sorted.filter((c) => c.vetoedBy.length === 0);
  const best = alive[0] ?? null;
  const canExecute = modeAllowsExecution(ctx);

  // 猶豫只在「不同種類的動作」分數接近時才成立：
  // 同種類的兩個塔位互相咬分是正常的，不該讓 AI 因此什麼都不做。
  const bestOtherKind = best ? alive.find((c) => c.kind !== best.kind) ?? null : null;
  const clear = best
    ? best.total >= MIN_EXECUTE_SCORE &&
      (!bestOtherKind || best.total - bestOtherKind.total >= DECISION_LIMITS.minMargin)
    : false;
  const forcedByStreak = Boolean(best) && best.total >= MIN_EXECUTE_SCORE && holdStreak >= HOLD_STREAK_LIMIT;
  const winner = clear || forcedByStreak;

  let verdict: AutoBattleDecision['verdict'];
  if (!best) verdict = 'blocked';
  else if (!canExecute) verdict = 'suggested';
  else if (!winner) verdict = 'hold';
  else verdict = 'executed';

  const chosen = winner || !canExecute ? best : null;
  const narration = buildNarration(chosen, ctx);

  decisionSeq = (decisionSeq + 1) % 100000;

  return {
    id: `${ctx.time}-${decisionSeq}`,
    time: ctx.time,
    wave: ctx.wave,
    triggers,
    chosen: verdict === 'hold' ? null : chosen,
    candidates: sorted.slice(0, 5),
    verdict,
    narrationKey: narration.key,
    narrationParams: { ...narration.params, conflictCount: conflicts.length },
    snapshot: snapshotOf(ctx),
  };
};

/** 記錄上限裁剪（persist 用） */
export const trimDecisions = (list: AutoBattleDecision[]): AutoBattleDecision[] =>
  list.slice(0, DECISION_LIMITS.recordLimit);
