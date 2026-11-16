import type { AutoBattleContext, AutoBattleCurvePoint, AutoBattleDecision } from '@/types/autobattle';
import { dpsOf } from './candidates';

/** 每波取樣（persist 只存這個，不存每幀資料） */
export const sampleCurve = (ctx: AutoBattleContext): AutoBattleCurvePoint => {
  const dps = ctx.towers.reduce((sum, t) => sum + dpsOf(t.type, t.level), 0);
  return {
    wave: ctx.wave,
    money: ctx.money,
    health: ctx.health,
    dps: Math.round(dps),
    towerCount: ctx.towers.length,
  };
};

/** 同一波只留最後一筆，最多 40 波 */
export const mergeCurve = (curve: AutoBattleCurvePoint[], point: AutoBattleCurvePoint): AutoBattleCurvePoint[] => {
  const next = curve.filter((p) => p.wave !== point.wave);
  next.push(point);
  next.sort((a, b) => a.wave - b.wave);
  return next.slice(-40);
};

export interface DecisionQuality {
  /** 同目標 10 秒內反覆動作的次數（越低越好，目標 0） */
  jitter: number;
  /** 有錢但連續 hold 的次數（空轉） */
  idleHolds: number;
  /** 被規則擋掉的次數（過度保守的指標） */
  blocked: number;
  executed: number;
}

/** 決策品質統計（CI 斷言與事後報告共用） */
export const qualityOf = (decisions: AutoBattleDecision[]): DecisionQuality => {
  const jitterWindow = 10000;
  let jitter = 0;
  let idleHolds = 0;
  let blocked = 0;
  let executed = 0;
  const lastAt = new Map<string, number>();
  for (const d of decisions) {
    if (d.verdict === 'blocked') blocked++;
    if (d.verdict === 'executed') executed++;
    if (d.verdict === 'hold' && d.snapshot.money > 400) idleHolds++;
    const key = d.chosen?.id;
    if (!key) continue;
    const prev = lastAt.get(key);
    if (prev != null && d.time - prev < jitterWindow) jitter++;
    lastAt.set(key, d.time);
  }
  return { jitter, idleHolds, blocked, executed };
};
