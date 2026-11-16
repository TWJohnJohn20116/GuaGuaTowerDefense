import type {
  AutoBattleActionKind,
  AutoBattleCandidate,
  AutoBattleContext,
  AutoBattleRule,
  AutoBattleRuleCondition,
  RuleVeto,
} from '@/types/autobattle';
import { ENEMY_DATA } from '@/data/gameData';
import { hasEnemyAbility } from '@/data/gameData/enemyAbilities';
import { sumFactors } from './scoring';

/** 條件比對：全部列出的條件都要成立（AND） */
export const matchCondition = (cond: AutoBattleRuleCondition, ctx: AutoBattleContext): boolean => {
  if (cond.minWave != null && ctx.wave < cond.minWave) return false;
  if (cond.maxWave != null && ctx.wave > cond.maxWave) return false;
  if (cond.minMoney != null && ctx.money < cond.minMoney) return false;
  if (cond.maxMoney != null && ctx.money > cond.maxMoney) return false;
  const healthRatio = ctx.maxHealth > 0 ? ctx.health / ctx.maxHealth : 1;
  if (cond.minHealthRatio != null && healthRatio < cond.minHealthRatio) return false;
  if (cond.maxHealthRatio != null && healthRatio > cond.maxHealthRatio) return false;
  if (cond.minEnemyCount != null && ctx.enemies.length < cond.minEnemyCount) return false;
  if (cond.minTowerCount != null && ctx.towers.length < cond.minTowerCount) return false;
  if (cond.maxTowerCount != null && ctx.towers.length > cond.maxTowerCount) return false;
  if (cond.modes && !cond.modes.includes(ctx.config.mode)) return false;
  if (cond.enemyHasAbility) {
    const ability = cond.enemyHasAbility;
    const onField = ctx.enemies.some((e) => {
      const data = ENEMY_DATA[e.type];
      if (!data) return false;
      return data.ability === ability || (data.abilities ?? []).includes(ability) || hasEnemyAbility(data, ability);
    });
    const inLookahead = ctx.lookahead.expectedAbilities.includes(ability);
    if (!onField && !inLookahead) return false;
  }
  return true;
};

export interface RuleOutcome {
  candidates: AutoBattleCandidate[];
  /** 規則衝突警告（force 與 veto 同時命中同一動作） */
  conflicts: string[];
}

/**
 * 套用規則：
 * 1. 硬性 veto 標記候選（不刪除，保留給 UI 顯示「為什麼沒做」）
 * 2. 硬性 force 給該動作種類加成
 * 3. 軟規則加減分、乘權重
 * 最後重算每個候選的總分。
 */
export const applyRules = (
  candidates: AutoBattleCandidate[],
  ctx: AutoBattleContext,
  rules: AutoBattleRule[],
): RuleOutcome => {
  const active = rules.filter((r) => r.enabled && matchCondition(r.when, ctx));
  const conflicts: string[] = [];
  const forced = new Set<AutoBattleActionKind>();
  const vetoed = new Map<AutoBattleActionKind, RuleVeto[]>();
  const bonuses: { kinds: AutoBattleActionKind[]; amount: number }[] = [];
  const weightMul = new Map<string, number>();

  for (const rule of active) {
    const effect = rule.then;
    if (effect.type === 'veto') {
      for (const kind of effect.kinds) {
        const list = vetoed.get(kind) ?? [];
        list.push({ ruleId: rule.id, reason: rule.note ?? rule.id });
        vetoed.set(kind, list);
      }
    } else if (effect.type === 'force') {
      for (const kind of effect.kinds) forced.add(kind);
    } else if (effect.type === 'bonus') {
      bonuses.push({ kinds: effect.kinds, amount: effect.amount });
    } else if (effect.type === 'weight') {
      weightMul.set(effect.factor, (weightMul.get(effect.factor) ?? 1) * effect.multiplier);
    }
  }

  for (const kind of forced) {
    if (vetoed.has(kind)) conflicts.push(`${kind}:force-vs-veto`);
  }

  const out = candidates.map((c) => {
    const kind = c.kind;
    const hardVeto = c.vetoedBy.length > 0;
    const ruleVetoes = vetoed.get(kind) ?? [];
    const vetoedBy = hardVeto ? c.vetoedBy : [...ruleVetoes];
    let bonus = c.softBonus;
    for (const b of bonuses) if (b.kinds.includes(kind)) bonus += b.amount;
    if (forced.has(kind)) bonus += 0.15;
    const factors = c.factors.map((f) => {
      const mul = weightMul.get(f.factor);
      if (!mul) return f;
      const weight = f.weight * mul;
      return { ...f, weight, contribution: f.normalized * weight };
    });
    // 因子為空時（測試或外部候選）沿用原總分，不要把分數洗成 0
    const baseScore = factors.length > 0 ? sumFactors(factors) : c.total - c.softBonus + c.penalties;
    const total = vetoedBy.length > 0 ? 0 : Math.max(0, baseScore + bonus - c.penalties);
    return { ...c, factors, softBonus: bonus, vetoedBy, total };
  });

  return { candidates: out, conflicts };
};
