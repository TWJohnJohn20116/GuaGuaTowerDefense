// 回放播放控制元件（HARDLINE：Btn + Chip，速度是標籤不是糖果）
import { useTranslation } from '@/i18n';
import { Btn, Chip } from '@/components/hl';
import { extractWaveMarkers } from './replayUtils';
import type { ReplaySnapshot } from '@/store/replayStore';
import {
  PlayIcon, PauseIcon, FastForwardIcon, RewindIcon, RefreshIcon,
} from '@/components/ui/Icons';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface ReplayControlsProps {
  playing: boolean;
  onTogglePlay: () => void;
  playhead: number;
  duration: number;
  onPlayheadChange: (n: number) => void;
  speed: number;
  onSpeedChange: (n: number) => void;
  loop: boolean;
  onToggleLoop: () => void;
  snapshots: ReplaySnapshot[];
  onJumpToWave: (wave: number) => void;
  formatTime: (s: number) => string;
}

const SPEEDS = [0.5, 1, 2, 4, 8, 16];

export function ReplayControls({
  playing,
  onTogglePlay,
  playhead,
  duration,
  onPlayheadChange,
  speed,
  onSpeedChange,
  loop,
  onToggleLoop,
  snapshots,
  onJumpToWave,
  formatTime,
}: ReplayControlsProps) {
  const { t } = useTranslation();
  const r = t.replay;
  const waveMarkers = extractWaveMarkers(snapshots);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Btn variant="line" size="sm" onClick={() => onPlayheadChange(0)} title={r.restart} className="w-7 px-0">
        <RefreshIcon className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        variant="line"
        size="sm"
        onClick={() => onPlayheadChange(Math.max(0, playhead - 5))}
        title={r.skipBack}
        className="w-7 px-0"
      >
        <RewindIcon className="h-3.5 w-3.5" />
      </Btn>

      <Btn
        variant="signal"
        size="md"
        onClick={onTogglePlay}
        icon={playing ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
      >
        {playing ? r.pause : r.play}
      </Btn>

      <Btn
        variant="line"
        size="sm"
        onClick={() => onPlayheadChange(Math.min(duration, playhead + 5))}
        title={r.skipForward}
        className="w-7 px-0"
      >
        <FastForwardIcon className="h-3.5 w-3.5" />
      </Btn>

      <span className="mx-1 h-4 w-px bg-[var(--hl-line)]" />

      <span className="hl-label">{r.speed}</span>
      <div className="flex items-center gap-1">
        {SPEEDS.map((s) => (
          <Chip key={s} active={speed === s} onClick={() => onSpeedChange(s)}>
            {s}x
          </Chip>
        ))}
      </div>

      <span className="mx-1 h-4 w-px bg-[var(--hl-line)]" />

      <Chip active={loop} onClick={onToggleLoop}>
        {loop ? r.loopOn : r.loopOff}
      </Chip>

      {waveMarkers.length > 0 && (
        <CustomSelect
          value=""
          placeholder={r.jumpToWave}
          onChange={(v) => {
            const w = parseInt(v, 10);
            if (!Number.isNaN(w)) onJumpToWave(w);
          }}
          options={waveMarkers.map((w) => ({
            value: String(w.wave),
            label: `W${w.wave} @ ${formatTime(w.time)}`,
          }))}
          variant="glass"
          size="sm"
        />
      )}
    </div>
  );
}
