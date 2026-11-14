/**
 * 突變挑戰 · 挑戰格（HARDLINE：密集格子，選中＝訊號線 + 訊號膜）
 */
import type { MutatorChallenge } from '@/types/mutatorChallenge';
import type { MutatorChallengeRecord } from '@/types/mutatorChallenge';
import { PATHS } from '@/data/gameData';
import { useTranslation } from '@/i18n';
import { Dot, Empty } from '@/components/hl';
import { getAccentTone, getTierLabel } from './mutatorShared';

const TONE_TEXT: Record<'vital' | 'reach' | 'caution' | 'alarm', string> = {
  vital: 'text-[var(--hl-vital)]',
  reach: 'text-[var(--hl-reach)]',
  caution: 'text-[var(--hl-caution)]',
  alarm: 'text-[var(--hl-alarm)]',
};

interface ChallengeCellProps {
  challenge: MutatorChallenge;
  record?: MutatorChallengeRecord;
  selected: boolean;
  index: number;
  onSelect: () => void;
}

function ChallengeCell({ challenge, record, selected, index, onSelect }: ChallengeCellProps) {
  const { t } = useTranslation();
  const completed = record?.completed ?? false;
  const tone = getAccentTone(challenge.accent);
  const mapName = PATHS[challenge.mapId]?.name ?? challenge.mapId;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'relative flex min-w-0 flex-col border p-2.5 text-left transition-colors duration-150',
        selected
          ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
          : 'border-[var(--hl-line)] bg-[var(--hl-deck)] hover:border-[var(--hl-line-hot)] hover:bg-[var(--hl-deck-2)]',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9.5px] tabular-nums tracking-[0.08em] text-[var(--hl-ink-4)]">
          {String(index).padStart(2, '0')}
        </span>
        <span
          className={`font-mono text-[9px] uppercase tracking-[0.08em] ${TONE_TEXT[tone]}`}
        >
          {getTierLabel(t, challenge.tier)}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[var(--hl-ink-2)]">
          {challenge.icon}
        </span>
        <span className="min-w-0 truncate text-[12.5px] font-medium text-[var(--hl-ink)]">
          {challenge.name}
        </span>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[9.5px] tracking-[0.06em] text-[var(--hl-ink-4)]">
        <span className="min-w-0 truncate">{mapName}</span>
        <span className="flex shrink-0 items-center gap-1 tabular-nums">
          {completed && <Dot tone="vital" />}
          {record?.bestScore ? record.bestScore : '—'}
        </span>
      </div>
    </button>
  );
}

export interface MutatorGridProps {
  challenges: MutatorChallenge[];
  records: Record<string, MutatorChallengeRecord>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MutatorGrid({ challenges, records, selectedId, onSelect }: MutatorGridProps) {
  const { t } = useTranslation();

  if (challenges.length === 0) {
    return <Empty title={t.mutatorChallenge.emptyTier} className="m-3" />;
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 p-3 sm:grid-cols-3 xl:grid-cols-4">
      {challenges.map((c, i) => (
        <ChallengeCell
          key={c.id}
          challenge={c}
          record={records[c.id]}
          selected={selectedId === c.id}
          index={i + 1}
          onSelect={() => onSelect(c.id)}
        />
      ))}
    </div>
  );
}

export default MutatorGrid;
