/**
 * 地圖工作台 · 底部播放列
 *
 * 播放、速度、進度、復原重做全部收在底部一條，
 * 與左側工具軌、右側參數面板一起構成天際線式三段版面。
 */
import { Btn, Chip } from '@/components/hl';
import { useTranslation } from '@/i18n';

export interface MapPlaybackBarProps {
  playing: boolean;
  onTogglePlay: () => void;
  onResetPlayback: () => void;
  progress: number;
  speed: number;
  onSpeedChange: (value: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  disabled: boolean;
}

const SPEEDS: { value: number; label: string }[] = [
  { value: 1.5, label: '0.5x' },
  { value: 3, label: '1x' },
  { value: 6, label: '2x' },
];

export function MapPlaybackBar({
  playing,
  onTogglePlay,
  onResetPlayback,
  progress,
  speed,
  onSpeedChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  disabled,
}: MapPlaybackBarProps) {
  const { t } = useTranslation();
  const s = t.studio.map;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-3 py-2">
      <Btn size="sm" variant={playing ? 'signal' : 'line'} onClick={onTogglePlay} disabled={disabled}>
        {playing ? s.playback.pause : s.playback.play}
      </Btn>
      <Btn size="sm" variant="ghost" onClick={onResetPlayback} disabled={disabled}>
        {s.playback.reset}
      </Btn>

      <div className="flex items-center gap-1">
        {SPEEDS.map((item) => (
          <Chip key={item.value} active={speed === item.value} onClick={() => onSpeedChange(item.value)}>
            {item.label}
          </Chip>
        ))}
      </div>

      <span className="flex min-w-[120px] flex-1 items-center gap-2">
        <span className="h-[10px] w-full overflow-hidden rounded-full border-2 border-[var(--cn-line)] bg-[var(--cn-card-2)]">
          <span
            className="block h-full rounded-full bg-[var(--cn-coral)] transition-[width] duration-100 ease-linear"
            style={{ width: Math.max(2, Math.round(progress * 100)) + '%' }}
          />
        </span>
      </span>

      <span className="ml-auto flex items-center gap-1">
        <Btn size="sm" variant="line" onClick={onUndo} disabled={disabled || !canUndo}>
          {s.undo}
        </Btn>
        <Btn size="sm" variant="line" onClick={onRedo} disabled={disabled || !canRedo}>
          {s.redo}
        </Btn>
      </span>
    </div>
  );
}