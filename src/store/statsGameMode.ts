/** 統計紀錄用的對局模式 */
export type StatsGameMode = 'campaign' | 'standard' | 'endless' | 'mutator' | 'mod' | 'unknown';

const STATS_GAME_MODE_LABELS: Record<StatsGameMode, string> = {
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
