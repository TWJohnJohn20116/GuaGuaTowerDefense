// 每日挑戰 · 狀態帶識別塊（HARDLINE：圖示方框 + mono 標籤 + 進度計量）
import { useTranslation } from '@/i18n';
import { Meter } from '@/components/hl';
import { DAILY_CHALLENGE_POOL_SIZE } from '@/store/dailyChallengeStore';
import type { DailyChallengeInstance } from '@/types/dailyChallenge';
import type { DailyChallengeDifficulty } from '@/types/dailyChallenge';
import { DAILY_CHALLENGE_DIFFICULTY_CONFIG } from '@/types/dailyChallenge';

const DIFF_TONE: Record<DailyChallengeDifficulty, string> = {
  easy: 'border-[var(--hl-vital)]/40 text-[var(--hl-vital)]',
  medium: 'border-[var(--hl-reach)]/40 text-[var(--hl-reach)]',
  hard: 'border-[var(--hl-caution)]/40 text-[var(--hl-caution)]',
};

interface DailyChallengeHeroProps {
  challenge: DailyChallengeInstance;
  overallProgress: number;
}

export function DailyChallengeHero({ challenge, overallProgress }: DailyChallengeHeroProps) {
  const { t } = useTranslation();
  const { template, completed, date } = challenge;
  const pct = Math.round(overallProgress);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[var(--hl-ink-2)]">
        {template.icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`border px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-[14px] tracking-[0.08em] ${DIFF_TONE[template.difficulty]}`}
          >
            {DAILY_CHALLENGE_DIFFICULTY_CONFIG[template.difficulty].label}
          </span>
          <span className="font-mono text-[9.5px] tabular-nums tracking-[0.08em] text-[var(--hl-ink-4)]">
            {date}
          </span>
          <span className="font-mono text-[9.5px] tabular-nums tracking-[0.08em] text-[var(--hl-ink-4)]">
            {t.dailyChallenge.poolSize.replace('{n}', String(DAILY_CHALLENGE_POOL_SIZE))}
          </span>
          {completed && (
            <span className="border border-[var(--hl-vital)]/40 px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-[14px] tracking-[0.08em] text-[var(--hl-vital)]">
              {t.dailyChallenge.completedTag}
            </span>
          )}
        </div>
        <div className="mt-1 truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
          {template.name}
        </div>
      </div>

      <div className="hidden w-[128px] shrink-0 md:block">
        <div className="flex items-baseline justify-between">
          <span className="hl-label">{t.dailyChallenge.overallProgress}</span>
          <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-2)]">{pct}%</span>
        </div>
        <Meter value={overallProgress} max={100} tone={completed ? 'vital' : 'signal'} className="mt-1.5" />
      </div>
    </div>
  );
}

export default DailyChallengeHero;
