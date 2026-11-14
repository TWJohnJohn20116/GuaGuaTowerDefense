// 強化版時間軸 — HARDLINE：1px 軌道 + 方塊刻度，無發光、無脈動光暈
import { useRef } from 'react';
import type { ReplayEvent, ReplayNote } from '@/store/replayStore';
import type { AutoBookmark } from './replayUtils';

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
  towerPlaced: 'var(--hl-vital)',
  towerUpgraded: 'var(--hl-caution)',
  towerSold: 'var(--hl-alarm)',
  skillActivated: 'var(--hl-reach)',
  waveStarted: 'var(--hl-reach)',
  waveCompleted: 'var(--hl-vital)',
  gameOver: 'var(--hl-alarm)',
  victory: 'var(--hl-vital)',
};

const BOOKMARK_TONE: Record<AutoBookmark['type'], string> = {
  lowHP: 'var(--hl-alarm)',
  bigDamage: 'var(--hl-caution)',
  victory: 'var(--hl-vital)',
  defeat: 'var(--hl-alarm)',
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
        className="group relative h-10 cursor-pointer overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]"
      >
        {/* 已播放區塊：半透明訊號色 */}
        <div
          className="absolute inset-y-0 left-0 bg-[var(--hl-signal)] opacity-[0.09]"
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
              style={{ left: `${left}%`, backgroundColor: EVENT_TONE[evt.type] ?? 'var(--hl-ink-3)', opacity: tall ? 0.9 : 0.5 }}
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
            style={{ left: `calc(${(n.time / safeDuration) * 100}% - 3px)`, backgroundColor: 'var(--hl-caution)' }}
            title={n.text}
          />
        ))}

        {/* 播放頭：1px 訊號線 */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[var(--hl-signal)]"
          style={{ left: `${playheadPercent}%` }}
        />

        {/* 時間讀數 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="hl-num text-[10px] leading-none text-[var(--hl-ink-3)] group-hover:text-[var(--hl-ink-2)]">
            {formatTime(playhead)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
