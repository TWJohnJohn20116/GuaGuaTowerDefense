/**
 * 回放 · 列表卡（HARDLINE：Deck + 1px 線，選中／hover 只換線色）
 */
import type { Replay as ReplayData } from '@/store/replayStore';
import {
  TrophyIcon, SkullIcon, ClockIcon, MapIcon, StarIcon, CheckIcon,
} from '@/components/ui/Icons';
import { getPathDisplayName } from './replayUtils';

export interface ReplayListCardProps {
  replay: ReplayData;
  selected: boolean;
  onSelect: () => void;
  formatTime: (s: number) => string;
  formatDate: (ts: number) => string;
  victoryLabel: string;
  defeatLabel: string;
}

export function ReplayListCard({
  replay,
  selected,
  onSelect,
  formatTime,
  formatDate,
  victoryLabel,
  defeatLabel,
}: ReplayListCardProps) {
  const title = replay.name || (replay.isVictory ? victoryLabel : defeatLabel);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'group flex h-full w-full min-w-0 flex-col border text-left transition-colors duration-150',
        selected
          ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
          : 'border-[var(--hl-line)] bg-[var(--hl-deck)] hover:border-[var(--hl-line-hot)]',
      ].join(' ')}
    >
      <div className="relative flex h-16 items-center justify-center border-b border-[var(--hl-line)] bg-[var(--hl-void-2)]">
        {replay.isVictory
          ? <TrophyIcon className={`h-6 w-6 ${selected ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-vital)]'}`} />
          : <SkullIcon className={`h-6 w-6 ${selected ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-alarm)]'}`} />}
        {replay.favorite && (
          <span className="absolute right-1.5 top-1.5">
            <StarIcon className="h-3 w-3 text-[var(--hl-caution)]" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 px-2.5 py-2">
        <span className="truncate text-[12.5px] font-medium text-[var(--hl-ink)]">{title}</span>
        <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
          {formatDate(replay.timestamp)}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
          <MapIcon className="h-2.5 w-2.5" />
          <span className="truncate">{getPathDisplayName(replay.mapId)}</span>
          <ClockIcon className="ml-1 h-2.5 w-2.5" />
          {formatTime(replay.duration)}
          <span className="text-[var(--hl-ink-4)]">W{replay.finalWave}</span>
        </span>
      </div>
    </button>
  );
}

/** 底欄狀態（選中卡可選用，列表卡內已精簡） */
export function ReplayCardStatus({
  isVictory,
  victoryLabel,
  defeatLabel,
}: {
  isVictory: boolean;
  victoryLabel: string;
  defeatLabel: string;
}) {
  return (
    <span
      className={[
        'flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em]',
        isVictory ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-alarm)]',
      ].join(' ')}
    >
      {isVictory ? <CheckIcon className="h-3 w-3" /> : <SkullIcon className="h-3 w-3" />}
      {isVictory ? victoryLabel : defeatLabel}
    </span>
  );
}

export default ReplayListCard;
