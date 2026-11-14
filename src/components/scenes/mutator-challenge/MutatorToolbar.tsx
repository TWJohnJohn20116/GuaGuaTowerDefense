// 突變挑戰 · 狀態列（HARDLINE：提示 + 目前篩選 + 進度計量 + 待領取獎勵）
import { useTranslation } from '@/i18n';
import { Meter, StatCell } from '@/components/hl';
import type { MutatorTierFilter } from './mutatorShared';

interface MutatorToolbarProps {
  tierFilter: MutatorTierFilter;
  completed: number;
  total: number;
  claimableCount: number;
}

export function MutatorToolbar({
  tierFilter,
  completed,
  total,
  claimableCount,
}: MutatorToolbarProps) {
  const { t } = useTranslation();
  const tb = t.mutatorChallenge.toolbar;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const tierLabel =
    tierFilter === 'all'
      ? tb.filterAll
      : tierFilter === 'easy'
        ? tb.tierEasy
        : tierFilter === 'medium'
          ? tb.tierMedium
          : tierFilter === 'hard'
            ? tb.tierHard
            : tb.tierExtreme;

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] px-4 py-2">
      <span className="hl-label shrink-0">{t.mutatorChallenge.title}</span>
      <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--hl-ink-3)]">{tb.hint}</span>
      <span className="shrink-0 border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-[14px] tracking-[0.08em] text-[var(--hl-ink-2)]">
        {tierLabel}
      </span>
      <span className="flex w-[150px] shrink-0 items-center gap-2">
        <Meter value={progressPercent} max={100} tone="signal" />
        <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-2)]">
          {`${completed}/${total}`}
        </span>
      </span>

      <div className="shrink-0 border-l border-[var(--hl-line)] pl-3">
        <StatCell
          label={t.mutatorChallenge.claim}
          value={claimableCount}
          tone={claimableCount > 0 ? 'caution' : 'muted'}
        />
      </div>
    </div>
  );
}

export default MutatorToolbar;
