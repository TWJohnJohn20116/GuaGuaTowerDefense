/**
 * 每日挑戰 · 右側詳情（HARDLINE Console 右欄 336px）
 *
 * 識別 → 說明 → 獎勵與提示。主行動只有一個，在左軌。
 */
import { useTranslation } from '@/i18n';
import { Empty } from '@/components/hl';
import type { DailyChallengeInstance } from '@/types/dailyChallenge';
import { DAILY_CHALLENGE_DIFFICULTY_CONFIG } from '@/types/dailyChallenge';
import { DailyChallengeRewards } from './DailyChallengeRewards';

export interface DailyChallengeDetailPanelProps {
  challenge: DailyChallengeInstance | null;
  loading: boolean;
}

export function DailyChallengeDetailPanel({ challenge, loading }: DailyChallengeDetailPanelProps) {
  const { t } = useTranslation();

  if (loading) {
    return <Empty title={t.dailyChallenge.loading} className="m-3" />;
  }

  if (!challenge) {
    return (
      <Empty
        title={t.dailyChallenge.emptySelectHint1}
        hint={t.dailyChallenge.emptySelectHint2}
        className="m-3"
      />
    );
  }

  const { template, date } = challenge;
  const difficulty = DAILY_CHALLENGE_DIFFICULTY_CONFIG[template.difficulty];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start gap-2.5 border-b border-[var(--hl-line)] px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[var(--hl-ink-2)]">
          {template.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-[14px] tracking-[0.08em] text-[var(--hl-ink-3)]">
              {difficulty.label}
            </span>
            <span className="font-mono text-[9.5px] tabular-nums tracking-[0.08em] text-[var(--hl-ink-4)]">
              {date}
            </span>
          </div>
          <h2 className="mt-1 truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
            {template.name}
          </h2>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <p className="text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]">{template.description}</p>
        <div className="mt-3">
          <DailyChallengeRewards challenge={challenge} />
        </div>
      </div>
    </div>
  );
}

export default DailyChallengeDetailPanel;
