/**
 * 內容頁 · 波次分析（右欄下半）
 *
 * 四種視角共用同一組 bars：HP（壓力）、金幣（產出）、難度（HP ÷ 可用金幣）、
 * 經濟（每波結束時的累積金幣）。點柱狀圖的任何一根就選中那一波。
 *
 * 難度是「相對值」不是絕對強度：換起始金幣或換平均塔價，分數會跟著變——
 * 面板上把參數攤開來，就是為了讓作者知道自己在看什麼。
 */
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Chip, Deck, Field, Input, Num, SegHead } from '@/components/hl';
import { WarningIcon } from '@/components/ui/Icons';
import type { AnalysisParams, WaveAnalysis } from '@/workshop/content/waveAnalysis';

type Metric = 'hp' | 'reward' | 'difficulty' | 'economy';

interface WaveAnalysisPanelProps {
  analysis: WaveAnalysis;
  selectedWave: number | null;
  onParams: (patch: Partial<AnalysisParams>) => void;
  onSelectWave: (index: number) => void;
  className?: string;
}

export function WaveAnalysisPanel({
  analysis,
  selectedWave,
  onParams,
  onSelectWave,
  className = '',
}: WaveAnalysisPanelProps) {
  const { t } = useTranslation();
  const c = t.studio.content.analysis;

  const [metric, setMetric] = useState<Metric>('hp');
  const [startMoney, setStartMoney] = useState(String(analysis.params.startMoney));
  const [towerPrice, setTowerPrice] = useState(String(analysis.params.towerPrice));
  const [incomeFactor, setIncomeFactor] = useState(String(analysis.params.incomeFactor));
  const [smoothWindow, setSmoothWindow] = useState(String(analysis.params.smoothWindow));

  if (analysis.bars.length === 0) {
    return (
      <Deck tone="sunken" className={`flex min-h-0 flex-col gap-2 p-3 ${className}`}>
        <SegHead label={c.title} />
        <p className="arc-label text-[var(--cn-ink-3)]">{c.noData}</p>
      </Deck>
    );
  }

  const valueOf = (index: number): number => {
    const bar = analysis.bars[index];
    if (!bar) return 0;
    if (metric === 'hp') return bar.totalHp;
    if (metric === 'reward') return bar.killReward;
    if (metric === 'difficulty') return bar.difficulty;
    return bar.moneyAfter;
  };

  const values = analysis.bars.map((_, index) => valueOf(index));
  const maxValue = values.reduce((max, value) => Math.max(max, value), 0) || 1;
  const chartWidth = analysis.bars.length * 10;
  const metricLabel = metric === 'hp' ? c.chartHp : metric === 'reward' ? c.chartReward : metric === 'difficulty' ? c.chartDifficulty : c.chartEconomy;

  return (
    <Deck tone="sunken" className={`flex min-h-0 flex-col gap-1.5 p-3 ${className}`}>
      <SegHead
        label={c.title}
        right={
          <div className="flex flex-wrap items-center gap-1">
            <Chip active={metric === 'hp'} onClick={() => setMetric('hp')} className="px-1.5 py-0.5 text-[9px]">{c.legendHp}</Chip>
            <Chip active={metric === 'reward'} onClick={() => setMetric('reward')} className="px-1.5 py-0.5 text-[9px]">{c.legendReward}</Chip>
            <Chip active={metric === 'difficulty'} onClick={() => setMetric('difficulty')} className="px-1.5 py-0.5 text-[9px]">{c.legendDifficulty}</Chip>
            <Chip active={metric === 'economy'} onClick={() => setMetric('economy')} className="px-1.5 py-0.5 text-[9px]">{c.chartEconomy}</Chip>
          </div>
        }
      />

      <svg
        viewBox={`0 0 ${chartWidth} 60`}
        preserveAspectRatio="none"
        role="img"
        aria-label={metricLabel}
        className="h-24 w-full"
      >
        <line x1="0" y1="59" x2={chartWidth} y2="59" stroke="var(--cn-line-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {analysis.bars.map((bar, index) => {
          const height = Math.max(1, (values[index] / maxValue) * 56);
          const active = selectedWave === index;
          const fill = !bar.enabled
            ? 'var(--cn-line-soft)'
            : active
              ? 'var(--cn-sun)'
              : metric === 'hp'
                ? 'var(--cn-coral)'
                : metric === 'reward'
                  ? 'var(--cn-mint)'
                  : metric === 'difficulty'
                    ? bar.difficulty >= 80 ? 'var(--cn-alert)' : 'var(--cn-grape)'
                    : 'var(--cn-sun)';
          return (
            <rect
              key={`bar-${index}`}
              x={index * 10 + 1}
              y={59 - height}
              width="8"
              height={height}
              fill={fill}
              className="cursor-pointer"
              onClick={() => onSelectWave(index)}
            >
              <title>{`${index + 1}: ${Math.round(values[index])}`}</title>
            </rect>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[var(--cn-ink-3)]">
        <span className="arc-label">{metricLabel}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <span>{c.totalHp}</span>
          <Num value={String(Math.round(analysis.totalHp))} size="sm" tone="signal" />
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <span>{c.totalKillReward}</span>
          <Num value={String(Math.round(analysis.totalKillReward + analysis.totalWaveReward))} size="sm" tone="vital" />
        </span>
        <span>·</span>
        <span>{fillTemplate(c.totalDuration, { s: (analysis.totalDurationMs / 1000).toFixed(1) })}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
        <span className="text-[var(--cn-ink-3)]">
          {analysis.peakWave >= 0
            ? fillTemplate(c.peakWave, { n: String(analysis.peakWave + 1), d: String(analysis.peakDifficulty) })
            : c.noData}
        </span>
        <span className="text-[var(--cn-ink-3)]">{fillTemplate(c.avgDifficulty, { n: String(analysis.averageDifficulty) })}</span>
      </div>

      {analysis.starvedWaves.length > 0 && (
        <div className="flex items-start gap-1 rounded-[var(--cn-r-md)] bg-[var(--cn-caution-soft)] px-1.5 py-1">
          <WarningIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cn-caution-text)]" />
          <span className="font-mono text-[9.5px] leading-snug text-[var(--cn-caution-text)]">
            {analysis.starvedWaves.map((index) => fillTemplate(c.starved, { n: String(index + 1) })).join('、')}
          </span>
        </div>
      )}

      <SegHead label={c.params} />
      <Field label={c.startMoney}>
        <Input
          type="number"
          min={0}
          value={startMoney}
          onChange={(event) => {
            setStartMoney(event.target.value);
            onParams({ startMoney: Number.parseInt(event.target.value, 10) || 0 });
          }}
          className="h-6 w-20 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={c.startMoney}
        />
      </Field>
      <Field label={c.towerPrice}>
        <Input
          type="number"
          min={1}
          value={towerPrice}
          onChange={(event) => {
            setTowerPrice(event.target.value);
            onParams({ towerPrice: Number.parseInt(event.target.value, 10) || 1 });
          }}
          className="h-6 w-20 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={c.towerPrice}
        />
      </Field>
      <Field label={c.incomeFactor}>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={incomeFactor}
          onChange={(event) => {
            setIncomeFactor(event.target.value);
            onParams({ incomeFactor: Number.parseFloat(event.target.value) || 0 });
          }}
          className="h-6 w-20 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={c.incomeFactor}
        />
      </Field>
      <Field label={c.smoothWindow}>
        <Input
          type="number"
          min={0}
          max={9}
          value={smoothWindow}
          onChange={(event) => {
            setSmoothWindow(event.target.value);
            onParams({ smoothWindow: Number.parseInt(event.target.value, 10) || 0 });
          }}
          className="h-6 w-20 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={c.smoothWindow}
        />
      </Field>
    </Deck>
  );
}
