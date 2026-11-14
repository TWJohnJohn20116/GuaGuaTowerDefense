/** 統計紀錄用的對局模式 */
export type StatsGameMode = 'campaign' | 'standard' | 'endless' | 'mutator' | 'mod' | 'unknown';

export const STATS_GAME_MODE_LABELS: Record<StatsGameMode, string> = {
  campaign: '戰役',
  standard: '標準',
  endless: '無盡',
  mutator: '變體',
  mod: '模組',
  unknown: '一般',
};

export function resolveStatsGameMode(input: {
  isCampaign?: boolean;
  endless?: boolean;
  mutatorId?: string | null;
  customWaveSetId?: string;
}): StatsGameMode {
  if (input.mutatorId) return 'mutator';
  if (input.isCampaign) return 'campaign';
  if (input.endless) return 'endless';
  if (input.customWaveSetId) return 'mod';
  return 'standard';
}

export function getStatsGameModeLabel(mode?: StatsGameMode): string {
  if (!mode) return STATS_GAME_MODE_LABELS.unknown;
  return STATS_GAME_MODE_LABELS[mode] ?? STATS_GAME_MODE_LABELS.unknown;
}

/** 模式標籤色（Tailwind 類名） */
export function getStatsGameModeTone(mode?: StatsGameMode): string {
  switch (mode) {
    case 'campaign': return 'bg-amber-500/20 text-amber-200 border-amber-500/30';
    case 'endless': return 'bg-orange-500/20 text-orange-200 border-orange-500/30';
    case 'mutator': return 'bg-violet-500/20 text-violet-200 border-violet-500/30';
    case 'mod': return 'bg-cyan-500/20 text-cyan-200 border-cyan-500/25';
    case 'standard': return 'bg-sky-500/15 text-sky-200 border-sky-500/25';
    default: return 'bg-[var(--hl-deck-3)] text-[var(--hl-ink-2)] border-[var(--hl-line-strong)]';
  }
}
