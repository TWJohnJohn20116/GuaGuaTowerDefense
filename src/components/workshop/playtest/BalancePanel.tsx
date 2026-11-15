/**
 * 平衡模擬面板
 *
 * 按「開始模擬」會用官方自動戰鬥跑 N 局（預設 20 局），全程不渲染任何東西，
 * 結果給出勝率、平均存活波次、平均剩餘血量與逐波存活曲線。
 *
 * 為什麼要分片：一局 15 波的模擬要推幾千幀，整段同步跑會讓工坊凍住。
 * simulator 每個分片只吃 sliceBudgetMs（6ms）就 setTimeout(0) 讓出主執行緒，
 * 所以進度條會動、取消鈕隨時可按——這是「禁止阻塞 UI」的具體做法。
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { Btn, Deck, Empty, Input, Meter, SegHead, StatCell } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { resolvePlaytestSetup } from '@/workshop/playtest/projectSource';
import { runBalanceSimulation } from '@/workshop/playtest/simulator';
import { emptySummary, formatRate } from '@/workshop/playtest/stats';
import type { BalanceSummary, CancelToken, SimulationProgress } from '@/workshop/playtest/types';

/** 曲線圖的繪圖區尺寸（viewBox 座標，實際寬度由 CSS 撐滿） */
const CHART_W = 320;
const CHART_H = 120;
const CHART_PAD = 14;

function SurvivalCurve({ summary }: { summary: BalanceSummary }) {
  const { t } = useTranslation();
  const points = summary.curve;
  if (points.length === 0) {
    return (
      <div className="flex h-[140px] items-center justify-center rounded-[var(--cn-r-md)] border-[3px] border-dashed border-[var(--cn-line-mid)] text-[12px] font-bold text-[var(--cn-ink-3)]">
        {t.studio.playtest.idle}
      </div>
    );
  }

  const maxWave = points[points.length - 1].wave;
  const spanX = Math.max(1, maxWave - 1);
  const toX = (wave: number) => CHART_PAD + ((wave - 1) / spanX) * (CHART_W - CHART_PAD * 2);
  const toY = (ratio: number) => CHART_PAD + (1 - Math.max(0, Math.min(1, ratio))) * (CHART_H - CHART_PAD * 2);
  const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + toX(p.wave).toFixed(1) + ' ' + toY(p.avgRatio).toFixed(1)).join(' ');

  return (
    <div className="flex flex-col gap-1">
      <svg
        viewBox={'0 0 ' + CHART_W + ' ' + CHART_H}
        className="h-[140px] w-full"
        role="img"
        aria-label={t.studio.playtest.survivalCurve}
      >
        {[0, 0.5, 1].map((ratio) => (
          <line
            key={ratio}
            x1={CHART_PAD}
            x2={CHART_W - CHART_PAD}
            y1={toY(ratio)}
            y2={toY(ratio)}
            stroke="var(--cn-line-soft)"
            strokeWidth={2}
            strokeDasharray={ratio === 0 ? undefined : '4 4'}
          />
        ))}
        <path d={path} fill="none" stroke="var(--cn-coral)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => (
          <circle key={p.wave} cx={toX(p.wave)} cy={toY(p.avgRatio)} r={3} fill="var(--cn-coral)" />
        ))}
        <text x={CHART_PAD} y={CHART_H - 2} fill="var(--cn-ink-3)" fontSize={10} fontWeight={700}>
          1
        </text>
        <text x={CHART_W - CHART_PAD} y={CHART_H - 2} textAnchor="end" fill="var(--cn-ink-3)" fontSize={10} fontWeight={700}>
          {maxWave}
        </text>
      </svg>
      <span className="arc-micro">{t.studio.playtest.survivalCurve}</span>
    </div>
  );
}

export default function BalancePanel({ projectId, levelId }: { projectId: string; levelId?: string }) {
  const { t } = useTranslation();
  const setup = useMemo(() => resolvePlaytestSetup(projectId, levelId), [projectId, levelId]);

  const [runs, setRuns] = useState(20);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<SimulationProgress | null>(null);
  const [summary, setSummary] = useState<BalanceSummary>(() => emptySummary());
  const [wallClockMs, setWallClockMs] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);
  const tokenRef = useRef<CancelToken | null>(null);

  const handleStart = useCallback(async () => {
    if (!setup || running) return;
    const token: CancelToken = { cancelled: false };
    tokenRef.current = token;
    setRunning(true);
    setErrorText(null);
    setProgress({ done: 0, total: runs, currentWave: 0, maxWaves: setup.maxWaves });
    try {
      const outcome = await runBalanceSimulation({
        setup,
        runs,
        stepMs: 100,
        maxMatchMs: 600000,
        sliceBudgetMs: 6,
        token,
        onProgress: (p) => setProgress(p),
      });
      setSummary(outcome.summary);
      setWallClockMs(outcome.wallClockMs);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : String(error));
    } finally {
      tokenRef.current = null;
      setRunning(false);
    }
  }, [setup, running, runs]);

  const handleCancel = useCallback(() => {
    if (tokenRef.current) tokenRef.current.cancelled = true;
  }, []);

  if (!setup) {
    return <Empty title={t.studio.playtest.noProject} hint={t.studio.playtest.tempNotice} />;
  }

  const done = progress?.done ?? 0;
  const total = progress?.total ?? runs;
  const progressText = t.studio.playtest.progress
    .replace('{done}', String(done))
    .replace('{total}', String(total));

  return (
    <Deck tone="raised" className="flex flex-col gap-4 p-4">
      <SegHead
        label={t.studio.playtest.balance}
        right={
          running ? (
            <Btn variant="danger" size="sm" onClick={handleCancel}>
              {t.studio.playtest.cancel}
            </Btn>
          ) : (
            <Btn variant="signal" size="sm" onClick={() => { void handleStart(); }}>
              {t.studio.playtest.start}
            </Btn>
          )
        }
      />

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="arc-label">{t.studio.playtest.runs}</span>
          <Input
            type="number"
            min={1}
            max={100}
            value={runs}
            disabled={running}
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              setRuns(Number.isFinite(next) ? Math.max(1, Math.min(100, next)) : 1);
            }}
            className="w-[92px]"
          />
        </label>
        <span className="arc-micro">{setup.mapLabel}</span>
        {setup.levelLabel && <span className="arc-micro">{setup.levelLabel}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <Meter value={done} max={Math.max(1, total)} tone="signal" />
        <span className="arc-micro">{progressText}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCell label={t.studio.playtest.winRate} value={formatRate(summary.winRate)} tone="vital" />
        <StatCell label={t.studio.playtest.avgWave} value={summary.avgSurvivedWaves} />
        <StatCell label={t.studio.playtest.avgHealth} value={summary.avgRemainingHealth} tone="alarm" />
      </div>

      <SurvivalCurve summary={summary} />

      <span className="arc-micro">
        {t.studio.playtest.elapsed.replace('{ms}', String(wallClockMs))}
      </span>

      {errorText && (
        <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-alert-soft)] px-3 py-2 text-[12px] font-bold text-[var(--cn-alert-deep)]">
          {errorText}
        </div>
      )}
    </Deck>
  );
}
