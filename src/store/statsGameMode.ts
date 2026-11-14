/** 統計紀錄用的對局模式 */
export type StatsGameMode = 'standard' | 'endless' | 'mod' | 'unknown';

const STATS_GAME_MODE_LABELS: Record<StatsGameMode, string> = {
  standard: '標準',
  endless: '無盡',
  mod: '模組',
  unknown: '一般',
};

export function resolveStatsGameMode(input: {
  endless?: boolean;
  customWaveSetId?: string;
}): StatsGameMode {
  if (input.endless) return 'endless';
  if (input.customWaveSetId) return 'mod';
  return 'standard';
}

export function getStatsGameModeLabel(mode?: StatsGameMode): string {
  if (!mode) return STATS_GAME_MODE_LABELS.unknown;
  return STATS_GAME_MODE_LABELS[mode] ?? STATS_GAME_MODE_LABELS.unknown;
}
