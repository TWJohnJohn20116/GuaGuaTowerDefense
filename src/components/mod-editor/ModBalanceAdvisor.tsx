/**
 * Mod 平衡 AI 建議（DPS vs 威脅量評分）— HARDLINE
 *
 * 區段頭 + 密集數值格（1px 分隔）+ 方塊線圖；沒有卡片、沒有漸層、沒有發光。
 */
import { useMemo } from 'react';
import type { CustomTowerData, CustomEnemyData, CustomWaveData } from '@/types/game';
import { analyzeModBalance } from './modBalanceAnalysis';
import { ModBalanceWaveChart } from './ModBalanceWaveChart';
import { ModBalanceSuggestionGroups } from './ModBalanceSuggestionGroups';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { ChartIcon, DownloadIcon, CopyIcon, DocumentIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { buildBalanceMarkdownReport } from './modBalanceExportMarkdown';
import { SegHead, Btn, Num } from '@/components/hl';

export { analyzeModBalance } from './modBalanceAnalysis';

interface ModBalanceAdvisorProps {
  towers: CustomTowerData[];
  enemies: CustomEnemyData[];
  waves: CustomWaveData[];
  className?: string;
}

function scoreTone(score: number): 'vital' | 'caution' | 'alarm' {
  if (score >= 70) return 'vital';
  if (score >= 45) return 'caution';
  return 'alarm';
}

function scoreLabel(score: number, m: ReturnType<typeof useTranslation>['t']['modEditorExt']): string {
  if (score >= 80) return m.balScoreEasy;
  if (score >= 65) return m.balScoreGood;
  if (score >= 45) return m.balScoreMedium;
  return m.balScoreHard;
}

export function ModBalanceAdvisor({ towers, enemies, waves, className = '' }: ModBalanceAdvisorProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const analysis = useMemo(
    () => analyzeModBalance(towers, enemies, waves, m),
    [towers, enemies, waves, m],
  );

  if (towers.length === 0 && enemies.length === 0 && waves.length === 0) return null;

  const cells = [
    { key: 'dps', label: m.balTotalDps, value: analysis.totalDps.toFixed(0), tone: 'reach' as const },
    { key: 'threat', label: m.balTotalThreat, value: analysis.totalThreat.toFixed(0), tone: 'alarm' as const },
    {
      key: 'kill',
      label: m.balKillEstimate,
      value: analysis.killSeconds !== null ? `~${analysis.killSeconds.toFixed(0)}s` : '—',
      tone: 'reach' as const,
    },
    { key: 'towers', label: m.balMetricTowers, value: String(analysis.towerCount), tone: 'ink' as const },
    { key: 'enemies', label: m.balMetricEnemies, value: String(analysis.enemyCount), tone: 'caution' as const },
    { key: 'eff', label: m.balMetricEfficiency, value: analysis.dpsPer100Gold.toFixed(2), tone: 'vital' as const },
  ];

  return (
    <div className={`flex flex-col gap-2 border border-[var(--hl-line)] bg-[var(--hl-deck)] p-2.5 ${className}`}>
      <div className="flex items-center gap-2">
        <SegHead
          label={
            <span className="flex items-center gap-1.5">
              <ChartIcon className="h-3 w-3" />
              {m.balAiTitle}
            </span>
          }
          className="flex-1"
        />
        <span className="flex shrink-0 items-baseline gap-1">
          <Num value={String(analysis.score)} tone={scoreTone(analysis.score)} size="md" />
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
            {scoreLabel(analysis.score, m)}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => {
            const md = buildBalanceMarkdownReport(analysis, m);
            const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mod-balance-report.md';
            a.click();
            URL.revokeObjectURL(url);
          }}
          title={m.balExportMarkdown}
          icon={<DocumentIcon className="h-3 w-3" />}
        />
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => {
            const text = [
              `${m.balAiTitle}: ${analysis.score}`,
              `${m.balTotalDps}: ${analysis.totalDps.toFixed(0)}`,
              `${m.balTotalThreat}: ${analysis.totalThreat.toFixed(0)}`,
              `${m.balKillEstimate}: ${analysis.killSeconds !== null ? `~${analysis.killSeconds.toFixed(0)}s` : '—'}`,
              ...analysis.suggestions.map((s) => `• ${s}`),
            ].join('\n');
            navigator.clipboard.writeText(text);
          }}
          title={m.balCopyReport}
          icon={<CopyIcon className="h-3 w-3" />}
        />
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => {
            const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mod-balance-report.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
          title={m.balDownloadJson}
          icon={<DownloadIcon className="h-3 w-3" />}
        />
      </div>

      {/* 數值格：1px 分隔，不用卡片 */}
      <div className="grid grid-cols-3 gap-px bg-[var(--hl-line)] sm:grid-cols-6">
        {cells.map((cell) => (
          <div key={cell.key} className="bg-[var(--hl-void-2)] px-1.5 py-1.5">
            <div className="truncate font-mono text-[8.5px] uppercase tracking-[0.06em] text-[var(--hl-ink-4)]">
              {cell.label}
            </div>
            <div className="mt-0.5">
              <Num value={cell.value} tone={cell.tone} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {analysis.waveCount > 0 && (
        <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
          {fillTemplate(m.balMetricWaves, {
            waves: String(analysis.waveCount),
            bosses: String(analysis.bossWaves),
          })}
        </p>
      )}

      <ModBalanceWaveChart points={analysis.waveThreats} />

      <ModBalanceSuggestionGroups items={analysis.categorizedSuggestions} m={m} />
    </div>
  );
}
