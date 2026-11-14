/**
 * 戰績匯出 · 確認對話框（HARDLINE Modal）
 */
import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import type { GameRecord, GlobalStats, PersonalBests } from '@/store/statsStore';
import { Deck, SegHead, Chip, Btn, Num } from '@/components/hl';
import {
  buildStatsExportSummary,
  downloadStatsExport,
  type StatsExportFormat,
  type StatsExportOptions,
  type StatsExportScope,
} from './statsExport';
import {
  DownloadIcon, ChartIcon, CheckIcon, WarningIcon,
} from '@/components/ui/Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  allGames: GameRecord[];
  filteredGames: GameRecord[];
  globalStats: GlobalStats;
  personalBests: PersonalBests;
  usingFilters: boolean;
}

export function StatsExportDialog({
  open,
  onClose,
  allGames,
  filteredGames,
  globalStats,
  personalBests,
  usingFilters,
}: Props) {
  const { t } = useTranslation();
  const d = t.statistics.exportDialog;
  const c = t.common;
  const e = t.encyclopedia;

  const [scope, setScope] = useState<StatsExportScope>(usingFilters ? 'filtered' : 'all');
  const [format, setFormat] = useState<StatsExportFormat>('json');
  const [includeTowerStats, setIncludeTowerStats] = useState(true);
  const [includeEconomy, setIncludeEconomy] = useState(true);
  const [includeGlobalSummary, setIncludeGlobalSummary] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  const targetGames = scope === 'filtered' ? filteredGames : allGames;
  const filteredDisabled = !usingFilters && filteredGames.length === allGames.length;

  const summary = useMemo(
    () => buildStatsExportSummary(targetGames, allGames.length),
    [targetGames, allGames.length],
  );

  if (!open) return null;

  const handleExport = () => {
    if (!confirmed) return;
    const options: StatsExportOptions = {
      format,
      scope,
      includeTowerStats,
      includeEconomy,
      includeGlobalSummary: format === 'json' && includeGlobalSummary,
    };
    const ok = downloadStatsExport(targetGames, globalStats, personalBests, options);
    setResult(ok ? 'success' : 'fail');
    if (ok) window.setTimeout(onClose, 1200);
  };

  const checkRow = (
    checked: boolean,
    onChange: (v: boolean) => void,
    label: string,
  ) => (
    <label className="flex cursor-pointer items-center gap-2 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(ev) => onChange(ev.target.checked)}
        style={{ accentColor: 'var(--arc-gold)' }}
        className="h-3 w-3 border border-[var(--arc-line-strong)]"
      />
      <span className="font-mono text-[10.5px] text-[var(--arc-ink-2)]">{label}</span>
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(6,7,10,0.82)] p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-[460px]" onClick={(ev) => ev.stopPropagation()}>
        <Deck notch className="arc-enter flex max-h-[86vh] w-full flex-col overflow-hidden" as="section">
          {/* 標題 */}
          <div className="flex items-center gap-2.5 border-b border-[var(--cn-line-soft)] px-4 py-2.5">
            <ChartIcon className="h-3.5 w-3.5 text-[var(--arc-ink-3)]" />
            <span className="text-[15px] font-semibold text-[var(--arc-ink)]">{d.title}</span>
            <Btn size="sm" variant="ghost" className="ml-auto" onClick={onClose}>
              {c.cancel}
            </Btn>
          </div>

          {/* 內容 */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {/* 摘要 */}
            <div className="flex flex-col gap-2">
              <SegHead label={d.summary} right={<Num value={String(summary.exportCount)} size="sm" tone="signal" />} />
              <div className="mt-1 flex flex-col">
                {[
                  { label: d.exportCount, value: d.gamesUnit.replace('{count}', String(summary.exportCount)) },
                  { label: d.dbTotal, value: d.gamesUnit.replace('{count}', String(summary.totalCount)) },
                  { label: d.winLoss, value: `${summary.victories} / ${summary.defeats}` },
                  { label: d.winRate, value: `${summary.winRate.toFixed(1)}%` },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-[var(--cn-line-soft)] py-1.5 last:border-b-0"
                  >
                    <span className="arc-label">{row.label}</span>
                    <Num value={row.value} size="sm" tone="muted" />
                  </div>
                ))}
                {summary.oldestDate && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="arc-label">{d.timeSpan}</span>
                    <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                      {new Date(summary.oldestDate).toLocaleDateString('zh-TW')}
                      {' — '}
                      {new Date(summary.newestDate!).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {Object.entries(summary.modeBreakdown).map(([mode, count]) => (
                  <span
                    key={mode}
                    className="border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--arc-ink-3)]"
                  >
                    {mode} {count}
                  </span>
                ))}
              </div>
            </div>

            {/* 預覽 */}
            {summary.preview.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                <SegHead label={d.preview} />
                <div className="mt-1 flex flex-col">
                  {summary.preview.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center gap-2.5 border-b border-[var(--cn-line-soft)] py-1.5 last:border-b-0"
                    >
                      <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-[var(--arc-ink-2)]">
                        {row.map}
                      </span>
                      <span
                        className={[
                          'arc-label',
                          row.result === e.statsVictory ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-alert)]',
                        ].join(' ')}
                      >
                        {row.result}
                      </span>
                      <Num value={`W${row.wave} · ${row.score.toLocaleString()}`} size="sm" tone="muted" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 範圍 */}
            <div className="mt-3 flex flex-col gap-1.5">
              <SegHead label={d.scopeTitle} />
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Chip active={scope === 'all'} onClick={() => setScope('all')}>
                  {d.scopeAll} ({allGames.length})
                </Chip>
                <Chip
                  active={scope === 'filtered'}
                  onClick={() => { if (!filteredDisabled) setScope('filtered'); }}
                  className={filteredDisabled ? 'pointer-events-none opacity-40' : ''}
                >
                  {d.scopeFiltered} ({filteredGames.length})
                </Chip>
              </div>
            </div>

            {/* 格式 */}
            <div className="mt-3 flex flex-col gap-1.5">
              <SegHead label={d.formatTitle} />
              <div className="mt-1 flex gap-1.5">
                <Chip active={format === 'json'} onClick={() => setFormat('json')}>JSON</Chip>
                <Chip active={format === 'csv'} onClick={() => setFormat('csv')}>CSV</Chip>
              </div>
            </div>

            {/* 包含項目 */}
            <div className="mt-3 flex flex-col gap-1.5">
              <SegHead label={d.includeTitle} />
              <div className="mt-1 flex flex-col">
                {checkRow(includeTowerStats, setIncludeTowerStats, d.includeTowerStats)}
                {checkRow(includeEconomy, setIncludeEconomy, d.includeEconomy)}
                {format === 'json' && checkRow(includeGlobalSummary, setIncludeGlobalSummary, d.includeGlobalSummary)}
              </div>
            </div>

            {/* 確認 */}
            <label className="mt-3 flex cursor-pointer items-start gap-2 border border-[var(--arc-caution)] px-2.5 py-2">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(ev) => setConfirmed(ev.target.checked)}
                style={{ accentColor: 'var(--arc-caution)' }}
                className="mt-0.5 h-3 w-3"
              />
              <span className="font-mono text-[10.5px] leading-relaxed text-[var(--arc-caution)]">
                {d.confirmText.replace('{count}', String(summary.exportCount)).replace('{format}', format.toUpperCase())}
              </span>
            </label>

            {result === 'success' && (
              <p className="mt-2 flex items-center gap-1.5 text-[var(--arc-vital)]">
                <CheckIcon className="h-3 w-3" />
                <span className="arc-label text-[var(--arc-vital)]">{d.success}</span>
              </p>
            )}
            {result === 'fail' && (
              <p className="mt-2 flex items-center gap-1.5 text-[var(--arc-alert)]">
                <WarningIcon className="h-3 w-3" />
                <span className="arc-label text-[var(--arc-alert)]">{d.fail}</span>
              </p>
            )}
          </div>

          {/* 動作 */}
          <div className="flex flex-col gap-2 border-t border-[var(--cn-line-soft)] p-3">
            <Btn
              variant="signal"
              size="lg"
              block
              disabled={!confirmed || targetGames.length === 0}
              icon={<DownloadIcon className="h-3.5 w-3.5" />}
              onClick={handleExport}
            >
              {d.confirm}
            </Btn>
            <Btn variant="line" size="md" block onClick={onClose}>
              {c.cancel}
            </Btn>
          </div>
        </Deck>
      </div>
    </div>
  );
}

export default StatsExportDialog;
