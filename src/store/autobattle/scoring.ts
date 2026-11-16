import type {
  AutoBattleActionKind,
  AutoBattleCandidate,
  AutoBattleFactor,
  AutoBattleWeights,
  ScoreFactor,
} from '@/types/autobattle';
import { BASE_WEIGHTS, DECISION_LIMITS } from '@/data/autobattle/scoreWeights';
import { getPreset } from '@/data/autobattle/presets';

/** 夾在 0..1 */
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 線性映射並夾住，v <= lo → 0、v >= hi → 1 */
export const scaleBetween = (v: number, lo: number, hi: number): number =>
  hi === lo ? 0 : clamp01((v - lo) / (hi - lo));

/** 合併權重：BASE → 使用者覆寫 → 預設檔覆寫（順序＝前者被後者蓋） */
export const resolveWeights = (
  kind: Exclude<AutoBattleActionKind, 'hold'>,
  config: { presetId: string; weights: Partial<Record<AutoBattleActionKind, AutoBattleWeights>> },
): AutoBattleWeights => {
  const preset = getPreset(config.presetId);
  return {
    ...BASE_WEIGHTS[kind],
    ...(preset.weights?.[kind] ?? {}),
    ...(config.weights[kind] ?? {}),
  };
};

/** 建立單一因子：raw 已算好，normalized 由呼叫端給（各有語意） */
export const makeFactor = (
  factor: AutoBattleFactor,
  raw: number,
  normalized: number,
  weight: number,
  detail?: string,
): ScoreFactor => ({
  factor,
  raw,
  normalized: clamp01(normalized),
  weight,
  contribution: clamp01(normalized) * weight,
  detail,
});

/** 依權重把因子加總（未列出的因子貢獻 0） */
export const sumFactors = (factors: ScoreFactor[]): number =>
  factors.reduce((sum, f) => sum + f.contribution, 0);

/**
 * 套用預設檔的因子乘數（只乘權重，不动 normalized，保留可解釋性）。
 * 回傳新的 factor 陣列。
 */
export const applyPresetBoost = (
  factors: ScoreFactor[],
  presetId: string,
  extra: Partial<Record<AutoBattleFactor, number>> = {},
): ScoreFactor[] => {
  const boost = { ...(getPreset(presetId).factorBoost ?? {}), ...extra };
  return factors.map((f) => {
    const mul = boost[f.factor] ?? 1;
    if (mul === 1) return f;
    const weight = f.weight * mul;
    return { ...f, weight, contribution: f.normalized * weight };
  });
};

/** 收尾：總分、裁剪因子數（記錄用）*/
export const finalizeCandidate = (
  candidate: AutoBattleCandidate,
  penalty = 0,
): AutoBattleCandidate => {
  const factors = [...candidate.factors]
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, DECISION_LIMITS.maxFactorsInRecord)
    .sort((a, b) => a.factor.localeCompare(b.factor));
  const total = Math.max(0, sumFactors(factors) + candidate.softBonus - penalty);
  return { ...candidate, factors, penalties: penalty, total };
};

/** 抖動懲罰：同一目標短時間重複決策、賣後重建冷卻 */
export const jitterPenalty = (
  lastDecisionAt: number | undefined,
  now: number,
  kind: AutoBattleActionKind,
): number => {
  if (!lastDecisionAt) return 0;
  const age = now - lastDecisionAt;
  if (age >= DECISION_LIMITS.targetCooldownMs) return 0;
  const base = kind === 'sell' || kind === 'place' ? 0.22 : 0.12;
  return base * (1 - age / DECISION_LIMITS.targetCooldownMs);
};


