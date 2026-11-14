// 回放圖表 + 統計小元件（HARDLINE：1px 線 + 半透明訊號色塊，無發光、無漸層）
import { useMemo } from 'react';
import type { ReplaySnapshot, ReplayEvent } from '@/store/replayStore';
import { useTranslation } from '@/i18n';
import { SegHead } from '@/components/hl';

type Tone = 'signal' | 'vital' | 'alarm' | 'caution' | 'reach' | 'ink';

const TEXT: Record<Tone, string> = {
  signal: 'text-[var(--hl-signal)]',
  vital: 'text-[var(--hl-vital)]',
  alarm: 'text-[var(--hl-alarm)]',
  caution: 'text-[var(--hl-caution)]',
  reach: 'text-[var(--hl-reach)]',
  ink: 'text-[var(--hl-ink-2)]',
};

/* ------------------------------------------------------------- StatBox */

export function StatBox({ label, value, tone = 'ink' }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="flex flex-col gap-1.5 border border-[var(--hl-line)] bg-[var(--hl-deck)] px-3 py-2.5">
      <span className="hl-label truncate">{label}</span>
      <span className={`hl-num text-[15px] leading-none ${TEXT[tone]}`}>{value}</span>
    </div>
  );
}

/* ---------------------------------------------------------- MiniStatBox */

export function MiniStatBox({ label, value, tone = 'ink' }: { label: string; value: string | number; tone?: Tone }) {
  return (
    <div className="flex min-w-[76px] flex-1 flex-col gap-1 border-r border-[var(--hl-line)] px-3 py-2 last:border-r-0">
      <span className="hl-label truncate">{label}</span>
      <span className={`hl-num text-[12px] leading-none ${TEXT[tone]}`}>{value}</span>
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
    <div className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
      <SegHead
        label={title}
        right={<span className={`hl-num text-[10px] leading-none ${TEXT[tone]}`}>{Math.round(phX / W * 100)}%</span>}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-[72px] w-full" preserveAspectRatio="none">
        {/* 水平結構線 */}
        <line x1={0} y1={H - 0.5} x2={W} y2={H - 0.5} stroke="var(--hl-line)" strokeWidth="1" />
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="var(--hl-line)" strokeWidth="1" strokeDasharray="3 4" />
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
        <line x1={phX} y1={0} x2={phX} y2={H} stroke="var(--hl-ink-3)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
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
    <div className="flex min-h-0 flex-col border border-[var(--hl-line)] bg-[var(--hl-deck)]">
      <div className="border-b border-[var(--hl-line)] px-3 py-2">
        <SegHead label={r.eventLog} right={<span className="hl-num text-[10px] leading-none text-[var(--hl-ink-4)]">{events.length}</span>} />
      </div>
      <div className="max-h-56 min-h-0 flex-1 overflow-y-auto">
        {events.slice(-30).reverse().map((e, i) => (
          <div
            key={`${e.time}-${i}`}
            className="flex items-center justify-between gap-2 border-b border-[var(--hl-line)] px-3 py-1.5 last:border-b-0"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className={`h-1.5 w-1.5 shrink-0 ${EVENT_FILL[EVENT_TONE[e.type] ?? 'ink']}`} />
              <span className="truncate text-[11px] text-[var(--hl-ink-2)]">{eventLabels[e.type] || e.type}</span>
            </span>
            <span className="hl-num shrink-0 text-[10px] leading-none text-[var(--hl-ink-4)]">{formatTime(e.time)}</span>
          </div>
        ))}
        {events.length === 0 && <div className="px-3 py-4 text-center hl-label">—</div>}
      </div>
    </div>
  );
}

const EVENT_FILL: Record<Tone, string> = {
  signal: 'bg-[var(--hl-signal)]',
  vital: 'bg-[var(--hl-vital)]',
  alarm: 'bg-[var(--hl-alarm)]',
  caution: 'bg-[var(--hl-caution)]',
  reach: 'bg-[var(--hl-reach)]',
  ink: 'bg-[var(--hl-ink-3)]',
};
