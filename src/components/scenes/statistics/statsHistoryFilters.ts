/**
 * 戰績歷史 · 篩選工具（標籤由 StatsToolbar 從 i18n 讀取）
 */
import type { GameRecord } from '@/store/statsStore';
import type { StatsGameMode } from '@/store/statsGameMode';
import {
  formatGameRecordDifficulty,
  formatGameRecordMap,
  type GameDifficultyLabels,
} from '@/data/gameRecordLabels';

export type StatsOutcomeFilter = 'all' | 'victory' | 'defeat';
export type StatsDateFilter = 'all' | 'today' | '7d' | '30d';
export type StatsModeFilter = 'all' | StatsGameMode;

function matchesDateFilter(timestamp: number, filter: StatsDateFilter): boolean {
  if (filter === 'all') return true;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (filter === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return timestamp >= start.getTime();
  }
  if (filter === '7d') return now - timestamp <= 7 * day;
  if (filter === '30d') return now - timestamp <= 30 * day;
  return true;
}

export function filterGameHistory(
  games: GameRecord[],
  outcome: StatsOutcomeFilter,
  date: StatsDateFilter,
  mode: StatsModeFilter,
  search: string,
  difficultyLabels?: GameDifficultyLabels,
): GameRecord[] {
  const q = search.trim().toLowerCase();
  return games.filter((game) => {
    if (outcome === 'victory' && !game.isVictory) return false;
    if (outcome === 'defeat' && game.isVictory) return false;
    if (mode !== 'all' && (game.gameMode ?? 'unknown') !== mode) return false;
    if (!matchesDateFilter(game.date, date)) return false;
    if (q) {
      const haystack = [
        game.mapId,
        formatGameRecordMap(game.mapId),
        game.difficulty,
        difficultyLabels ? formatGameRecordDifficulty(game.difficulty, difficultyLabels) : '',
        game.gameMode ?? '',
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
