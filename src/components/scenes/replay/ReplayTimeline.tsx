// 強化版時間軸 — HARDLINE：1px 軌道 + 方塊刻度，無發光、無脈動光暈
import { useRef } from 'react';
import type { ReplayEvent, ReplayNote } from '@/store/replayStore';
import type { AutoBookmark } from './replayUtils';
import { Num } from '@/components/hl';

interface ReplayTimelineProps {
  playhead: number;
  duration: number;
  onPlayheadChange: (n: number) => void;
  events: ReplayEvent[];
  notes?: ReplayNote[];
  autoBookmarks?: AutoBookmark[];
  formatTime: (s: number) => string;
}

const EVENT_TONE: Record<ReplayEvent['type'], string> = {
  towerPlaced: 'var(--arc-vital)',
  towerUpgraded: 'var(--arc-caution)',
  towerSold: 'var(--arc-alert)',
  skillActivated: 'var(--arc-reach)',
  waveStarted: 'var(--arc-reach)',
  waveCompleted: 'var(--arc-vital)',
  gameOver: 'var(--arc-alert)',
  victory: 'var(--arc-vital)',
};

const BOOKMARK_TONE: Record<AutoBookmark['type'], string> = {
  lowHP: 'var(--arc-alert)',
  bigDamage: 'var(--arc-caution)',
  victory: 'var(--arc-vital)',
  defeat: 'var(--arc-alert)',
};

export function ReplayTimeline({
  playhead,
  duration,
  onPlayheadChange,
  events,
  notes = [],
  autoBookmarks = [],
  formatTime,
}: ReplayTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const safeDuration = Math.max(1, duration);
  const playheadPercent = (playhead / safeDuration) * 100;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    onPlayheadChange(ratio * safeDuration);
  };

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleClick(e);
  };

  return (
    <div className="space-y-1.5">
      <div
        ref={trackRef}
        onClick={handleClick}
        onMouseMove={handleDrag}
        className="group relative h-10 cursor-pointer overflow-hidden border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]"
      >
        {/* 已播放區塊：半透明訊號色 */}
        <div
          className="absolute inset-y-0 left-0 bg-[var(--arc-gold)] opacity-[0.09]"
          style={{ width: `${playheadPercent}%` }}
        />

        {/* 事件刻度：方塊，不是圓柱 */}
        {events.map((evt, idx) => {
          const left = (evt.time / safeDuration) * 100;
          const tall =
            evt.type === 'waveStarted' || evt.type === 'waveCompleted' || evt.type === 'victory' || evt.type === 'gameOver';
          return (
            <div
              key={`evt-${idx}`}
              className="absolute top-0 bottom-0 w-px"
              style={{ left: `${left}%`, backgroundColor: EVENT_TONE[evt.type] ?? 'var(--arc-ink-3)', opacity: tall ? 0.9 : 0.5 }}
              title={`${evt.type} @ ${formatTime(evt.time)}`}
            />
          );
        })}

        {/* 自動書籤：小方塊 */}
        {autoBookmarks.map((bm, idx) => (
          <div
            key={`bm-${idx}`}
            className="absolute top-0 h-1.5 w-1.5"
            style={{ left: `calc(${(bm.time / safeDuration) * 100}% - 3px)`, backgroundColor: BOOKMARK_TONE[bm.type] }}
            title={`${bm.label} @ ${formatTime(bm.time)}`}
          />
        ))}

        {/* 註記：底部方塊 */}
        {notes.map((n) => (
          <div
            key={n.id}
            className="absolute bottom-0 h-1.5 w-1.5"
            style={{ left: `calc(${(n.time / safeDuration) * 100}% - 3px)`, backgroundColor: 'var(--arc-caution)' }}
            title={n.text}
          />
        ))}

        {/* 播放頭：1px 訊號線 */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[var(--arc-gold)]"
          style={{ left: `${playheadPercent}%` }}
        />

        {/* 時間讀數 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Num
            value={`${formatTime(playhead)} / ${formatTime(duration)}`}
            tone="muted"
            size="sm"
            className="group-hover:text-[var(--arc-ink-2)]"
          />
        </div>
      </div>
    </div>
  );
}
