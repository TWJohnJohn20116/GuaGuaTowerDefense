/**
 * 突變挑戰 · 共用常數與工具（HARDLINE）
 *
 * accent 只當資料色：綠=vital、藍=reach、黃/橙=caution、紅=alarm。
 * 不再輸出漸層或彩虹邊。
 */
import type { MutatorChallenge } from '@/types/mutatorChallenge';
import type { Translations } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';

export type MutatorTierFilter = 'all' | MutatorChallenge['tier'];

export type AccentTone = 'vital' | 'reach' | 'caution' | 'alarm';

export const ACCENT_TONE: Record<MutatorChallenge['accent'], AccentTone> = {
  orange: 'caution',
  cyan: 'reach',
  red: 'alarm',
  purple: 'reach',
  green: 'vital',
  yellow: 'caution',
};

export function getAccentTone(accent: MutatorChallenge['accent']): AccentTone {
  return ACCENT_TONE[accent] ?? 'reach';
}

export function getTierLabel(t: Translations, tier: MutatorChallenge['tier']): string {
  const tb = t.mutatorChallenge.toolbar;
  switch (tier) {
    case 'easy':
      return tb.tierEasy;
    case 'medium':
      return tb.tierMedium;
    case 'hard':
      return tb.tierHard;
    case 'extreme':
      return tb.tierExtreme;
    default:
      return tier;
  }
}

export function getDifficultyLabel(t: Translations, difficulty: string): string {
  const d = t.mutatorChallenge.detail;
  switch (difficulty) {
    case 'easy':
      return d.diffEasy;
    case 'normal':
      return d.diffNormal;
    case 'hard':
      return d.diffHard;
    case 'nightmare':
      return d.diffNightmare;
    case 'impossible':
      return d.diffImpossible;
    case 'custom':
      return d.diffCustom;
    default:
      return difficulty;
  }
}

export function formatMutatorWaveLine(t: Translations, challenge: MutatorChallenge): string {
  const d = t.mutatorChallenge.detail;
  const base = getDifficultyLabel(t, challenge.difficulty);
  if (challenge.endless) return `${base}${d.endlessSuffix}`;
  return `${base}${fillTemplate(d.wavesSuffix, { count: String(challenge.maxWaves) })}`;
}

/** @deprecated 使用 getTierLabel(t, tier) */
export const TIER_LABEL: Record<MutatorChallenge['tier'], string> = {
  easy: '簡單',
  medium: '中等',
  hard: '困難',
  extreme: '極限',
};

/** @deprecated 使用 getDifficultyLabel(t, diff) */
export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '簡單',
  normal: '普通',
  hard: '困難',
  nightmare: '夢魘',
  impossible: '地獄',
  custom: '自訂',
};

export function filterByTier(
  challenges: MutatorChallenge[],
  tier: MutatorTierFilter,
): MutatorChallenge[] {
  if (tier === 'all') return challenges;
  return challenges.filter((c) => c.tier === tier);
}
