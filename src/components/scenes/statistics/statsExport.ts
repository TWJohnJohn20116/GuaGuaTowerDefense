/**
 * 戰績匯出 · 建構與下載
 */
import type { GameRecord, GlobalStats, PersonalBests } from '@/store/statsStore';
import { getStatsGameModeLabel } from '@/store/statsGameMode';
import { getPathDisplayName } from '@/data/gameData/pathData';

export type StatsExportFormat = 'json' | 'csv';
export type StatsExportScope = 'filtered' | 'all';

export interface StatsExportOptions {
  format: StatsExportFormat;
  scope: StatsExportScope;
  includeTowerStats: boolean;
  includeEconomy: boolean;
  includeGlobalSummary: boolean;
}

interface StatsExportSummary {
  exportCount: number;
  totalCount: number;
  victories: number;
  defeats: number;
  winRate: number;
  modeBreakdown: Record<string, number>;
  oldestDate: number | null;
  newestDate: number | null;
  preview: Array<{
    id: string;
    date: string;
    map: string;
    result: string;
    score: number;
    wave: number;
  }>;
}

function formatExportDate(ts: number): string {
  return new Date(ts).toLocaleString('zh-TW');
}

export function buildStatsExportSummary(
  games: GameRecord[],
  totalCount: number,
): StatsExportSummary {
  const victories = games.filter((g) => g.isVictory).length;
  const modeBreakdown: Record<string, number> = {};
  for (const g of games) {
    const label = getStatsGameModeLabel(g.gameMode);
    modeBreakdown[label] = (modeBreakdown[label] ?? 0) + 1;
  }
  const dates = games.map((g) => g.date);
  return {
    exportCount: games.length,
    totalCount,
    victories,
    defeats: games.length - victories,
    winRate: games.length > 0 ? (victories / games.length) * 100 : 0,
    modeBreakdown,
    oldestDate: dates.length ? Math.min(...dates) : null,
    newestDate: dates.length ? Math.max(...dates) : null,
    preview: games.slice(0, 3).map((g) => ({
      id: g.id,
      date: formatExportDate(g.date),
      map: getPathDisplayName(g.mapId),
      result: g.isVictory ? '勝利' : '失敗',
      score: g.score,
      wave: g.finalWave,
    })),
  };
}

function escapeCsv(value: string | number | boolean): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function gamesToCsv(games: GameRecord[], options: StatsExportOptions): string {
  const headers = [
    'id', 'date', 'mapId', 'mapName', 'difficulty', 'mode', 'result',
    'score', 'wave', 'health', 'durationSec', 'kills', 'damage',
    'moneyEarned', 'moneySpent', 'towersPlaced', 'towersUpgraded', 'towersSold',
  ];
  const rows = games.map((g) => [
    g.id,
    formatExportDate(g.date),
    g.mapId,
    getPathDisplayName(g.mapId),
    g.difficulty,
    getStatsGameModeLabel(g.gameMode),
    g.isVictory ? 'victory' : 'defeat',
    g.score,
    g.finalWave,
    g.finalHealth,
    Math.round(g.duration / 1000),
    g.totalEnemiesKilled,
    g.totalDamageDealt,
    g.totalMoneyEarned,
    g.totalMoneySpent,
    g.towersPlaced,
    g.towersUpgraded,
    g.towersSold ?? 0,
  ].map(escapeCsv).join(','));

  let csv = `${headers.join(',')}\n${rows.join('\n')}`;

  if (options.includeTowerStats) {
    csv += '\n\n# tower_stats\n';
    csv += 'gameId,towerType,damage,kills,cost,upgrades,maxLevel\n';
    for (const g of games) {
      for (const t of g.towerStats ?? []) {
        csv += [
          g.id, t.type, t.totalDamage, t.kills, t.totalCost, t.upgradeCount, t.maxLevel,
        ].map(escapeCsv).join(',') + '\n';
      }
    }
  }

  return csv;
}

export function downloadStatsExport(
  games: GameRecord[],
  globalStats: GlobalStats,
  personalBests: PersonalBests,
  options: StatsExportOptions,
): boolean {
  try {
    const stamp = new Date().toISOString().slice(0, 10);
    if (options.format === 'json') {
      const payload: Record<string, unknown> = {
        exportedAt: new Date().toISOString(),
        scope: options.scope,
        gameCount: games.length,
        games,
      };
      if (options.includeGlobalSummary) {
        payload.globalStats = globalStats;
        payload.personalBests = personalBests;
      }
      if (options.includeEconomy) {
        payload.economyIncluded = true;
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      triggerDownload(blob, `guatd-stats-${stamp}.json`);
      return true;
    }

    const csv = gamesToCsv(games, options);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, `guatd-stats-${stamp}.csv`);
    return true;
  } catch (e) {
    console.error('Stats export failed:', e);
    return false;
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
