// 回放圖表 + 統計小元件（HARDLINE：1px 線 + 半透明訊號色塊，無發光、無漸層）
import { useMemo } from 'react';
import type { ReplaySnapshot, ReplayEvent } from '@/store/replayStore';
import { useTranslation } from '@/i18n';
import { Deck, Num, SegHead } from '@/components/hl';

type Tone = 'signal' | 'vital' | 'alarm' | 'caution' | 'reach' | 'ink';

const TEXT: Record<Tone, string> = {
  signal: 'text-[var(--arc-gold)]',
  vital: 'text-[var(--arc-vital)]',
  alarm: 'text-[var(--arc-alert)]',
  caution: 'text-[var(--arc-caution)]',
  reach: 'text-[var(--arc-reach)]',
  ink: 'text-[var(--arc-ink-2)]',
};

/* ------------------------------------------------------------- StatBox */

export function StatBox({ label, value, tone = 'ink' }: { label: string; value: string; tone?: Tone }) {
  return (
    <Deck className="flex flex-col gap-1.5 px-3 py-2.5">
      <span className="arc-label truncate">{label}</span>
      <Num value={value} tone={tone} size="md" />
    </Deck>
  );
}

/* ---------------------------------------------------------- MiniStatBox */

export function MiniStatBox({ label, value, tone = 'ink' }: { label: string; value: string | number; tone?: Tone }) {
  return (
    <div className="flex min-w-[76px] flex-1 flex-col gap-1 border-r border-[var(--cn-line-soft)] px-3 py-2 last:border-r-0">
      <span className="arc-label truncate">{label}</span>
      <Num value={value} tone={tone} size="sm" />
    </div>
  );
}

/* ------------------------------------------------------------ TimeChart */

export function TimeChart({
  title,
  snapshots,
  field,
  tone = 'signal',
  playhead,
}: {
  title: string;
  snapshots: ReplaySnapshot[];
  field: 'money' | 'health' | 'score';
  tone?: Tone;
  playhead: number;
}) {
  const W = 280;
  const H = 72;

  const last = snapshots[snapshots.length - 1];
  const totalDuration = last ? last.time : 1;

  // 折線只依賴快照本身：memo 化 + 下採樣至 240 點，
  // 避免高密度快照下 playhead 每次更新都重算數千點
  const points = useMemo(() => {
    const max = Math.max(1, ...snapshots.map((s) => s[field]));
    const step = Math.max(1, Math.ceil(snapshots.length / 240));
    const sampled: string[] = [];
    for (let i = 0; i < snapshots.length; i += step) {
      const s = snapshots[i];
      const x = (s.time / totalDuration) * W;
      const y = H - (s[field] / max) * (H - 12) - 6;
      sampled.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    if (snapshots.length > 0 && (snapshots.length - 1) % step !== 0) {
      const s = snapshots[snapshots.length - 1];
      const x = (s.time / totalDuration) * W;
      const y = H - (s[field] / max) * (H - 12) - 6;
      sampled.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return sampled;
  }, [snapshots, field, totalDuration]);

  const phX = Math.max(0, Math.min(W, (playhead / totalDuration) * W));

  return (
    <Deck className="p-3">
      <SegHead
        label={title}
        right={<Num value={Math.round(phX / W * 100)} unit="%" tone={tone} size="sm" />}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-[72px] w-full" preserveAspectRatio="none">
        {/* 水平結構線 */}
        <line x1={0} y1={H - 0.5} x2={W} y2={H - 0.5} stroke="var(--arc-line)" strokeWidth="1" />
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="var(--arc-line)" strokeWidth="1" strokeDasharray="3 4" />
        {/* 已播放區塊：半透明訊號方塊，不是漸層填滿 */}
        <rect x={0} y={0} width={phX} height={H} fill="currentColor" className={TEXT[tone]} opacity="0.09" />
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          className={TEXT[tone]}
        />
        <line x1={phX} y1={0} x2={phX} y2={H} stroke="var(--arc-ink-3)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </Deck>
  );
}

/* ------------------------------------------------------------- EventLog */

const EVENT_TONE: Record<ReplayEvent['type'], Tone> = {
  towerPlaced: 'vital',
  towerUpgraded: 'caution',
  towerSold: 'alarm',
  skillActivated: 'reach',
  waveStarted: 'reach',
  waveCompleted: 'vital',
  gameOver: 'alarm',
  victory: 'vital',
};

export function EventLog({ events, formatTime }: { events: ReplayEvent[]; formatTime: (s: number) => string }) {
  const { t } = useTranslation();
  const r = t.replay;
  const eventLabels: Record<ReplayEvent['type'], string> = {
    towerPlaced: r.eventTowerPlaced,
    towerUpgraded: r.eventTowerUpgraded,
    towerSold: r.eventTowerSold,
    skillActivated: r.eventSkillActivated,
    waveStarted: r.eventWaveStarted,
    waveCompleted: r.eventWaveCompleted,
    gameOver: r.eventGameOver,
    victory: r.eventVictory,
  };

  return (
    <Deck className="flex min-h-0 flex-col">
      <div className="border-b border-[var(--cn-line-soft)] px-3 py-2">
        <SegHead label={r.eventLog} right={<Num value={events.length} tone="muted" size="sm" />} />
      </div>
      <div className="max-h-56 min-h-0 flex-1 overflow-y-auto">
        {events.slice(-30).reverse().map((e, i) => (
          <div
            key={`${e.time}-${i}`}
            className="flex items-center justify-between gap-2 border-b border-[var(--cn-line-soft)] px-3 py-1.5 last:border-b-0"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className={`h-1.5 w-1.5 shrink-0 ${EVENT_FILL[EVENT_TONE[e.type] ?? 'ink']}`} />
              <span className="truncate text-[11px] text-[var(--arc-ink-2)]">{eventLabels[e.type] || e.type}</span>
            </span>
            <Num value={formatTime(e.time)} tone="muted" size="sm" className="shrink-0" />
          </div>
        ))}
        {events.length === 0 && <div className="px-3 py-4 text-center arc-label">—</div>}
      </div>
    </Deck>
  );
}

const EVENT_FILL: Record<Tone, string> = {
  signal: 'bg-[var(--arc-gold)]',
  vital: 'bg-[var(--arc-vital)]',
  alarm: 'bg-[var(--arc-alert)]',
  caution: 'bg-[var(--arc-caution)]',
  reach: 'bg-[var(--arc-reach)]',
  ink: 'bg-[var(--arc-ink-3)]',
};
