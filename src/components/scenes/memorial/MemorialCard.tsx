/**
 * 紀念堂 · 條目列（HARDLINE 密集列表）
 *
 * 一行一人：mono 編號、姓名、職階、來源、年代。選中＝左緣 2px 訊號條。
 */
import {
  MEMORIAL_ERA_LABELS,
  MEMORIAL_ORIGIN_LABELS,
  type MemorialEntry,
  type MemorialOrigin,
} from '@/data/memorialData';

const ORIGIN_TONE: Record<MemorialOrigin, string> = {
  north_outpost: 'text-[var(--hl-reach)]',
  meong_organization: 'text-[var(--hl-caution)]',
  lambda_family: 'text-[var(--hl-vital)]',
  civilian: 'text-[var(--hl-ink-2)]',
};

interface MemorialCardProps {
  entry: MemorialEntry;
  onClick: () => void;
  index: number;
  selected?: boolean;
}

export function MemorialCard({ entry, onClick, index, selected = false }: MemorialCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={selected}
      className={[
        'relative grid w-full grid-cols-[30px_1fr_auto] items-center gap-3 border-b border-[var(--hl-line)] px-3 py-2 text-left transition-colors duration-150',
        selected ? 'bg-[var(--hl-deck-2)]' : 'hover:bg-[var(--hl-deck-2)]',
      ].join(' ')}
    >
      <span
        className={[
          'absolute left-0 top-0 h-full w-[2px]',
          selected ? 'bg-[var(--hl-signal)]' : 'bg-transparent',
        ].join(' ')}
      />

      <span
        className={[
          'font-mono text-[9.5px] tabular-nums tracking-[0.08em]',
          selected ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-4)]',
        ].join(' ')}
      >
        {String(index).padStart(2, '0')}
      </span>

      <span className="min-w-0">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-medium text-[var(--hl-ink)]">{entry.name}</span>
          <span className="shrink-0 font-mono text-[10px] text-[var(--hl-ink-3)]">{entry.rank}</span>
          {entry.age !== undefined && (
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
              {entry.age}
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-[var(--hl-ink-3)]">
          {entry.shortBio}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1.5">
        <span
          className={`font-mono text-[9.5px] uppercase tracking-[0.06em] ${ORIGIN_TONE[entry.origin]}`}
        >
          {MEMORIAL_ORIGIN_LABELS[entry.origin]}
        </span>
        <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9px] uppercase leading-[14px] tracking-[0.06em] text-[var(--hl-ink-4)]">
          {MEMORIAL_ERA_LABELS[entry.era]}
        </span>
      </span>
    </button>
  );
}

export default MemorialCard;
