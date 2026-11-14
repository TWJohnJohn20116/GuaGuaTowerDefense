// 每日挑戰 · 獎勵與提示（HARDLINE：Field 列；領取動作在左軌主行動）
import { useTranslation } from '@/i18n';
import { Field, SegHead } from '@/components/hl';
import type { DailyChallengeInstance } from '@/types/dailyChallenge';

interface DailyChallengeRewardsProps {
  challenge: DailyChallengeInstance;
}

export function DailyChallengeRewards({ challenge }: DailyChallengeRewardsProps) {
  const { t } = useTranslation();
  const { template, completed, claimed } = challenge;
  const r = template.rewards;

  const rows: { label: string; value: string; tone: string }[] = [];
  if (r.coins != null) {
    rows.push({
      label: t.dailyChallenge.coins,
      value: `+${r.coins.toLocaleString()}`,
      tone: 'text-[var(--hl-signal)]',
    });
  }
  if (r.achievementPoints != null) {
    rows.push({
      label: t.dailyChallenge.achievementPoints,
      value: `+${r.achievementPoints}`,
      tone: 'text-[var(--hl-caution)]',
    });
  }
  if (r.talentPoints != null) {
    rows.push({
      label: t.dailyChallenge.talentPoints,
      value: `+${r.talentPoints}`,
      tone: 'text-[var(--hl-reach)]',
    });
  }
  if (r.title) {
    rows.push({
      label: t.dailyChallenge.rewardContent,
      value: r.title,
      tone: 'text-[var(--hl-ink)]',
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <SegHead label={t.dailyChallenge.rewardContent} />
        <div className="mt-1.5">
          {rows.map((row) => (
            <Field key={row.label} label={row.label}>
              <span className={`font-mono text-[12.5px] font-semibold tabular-nums ${row.tone}`}>
                {row.value}
              </span>
            </Field>
          ))}
        </div>
        {completed && claimed && (
          <div className="mt-2 flex items-center gap-2 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2.5 py-1.5">
            <span className="h-1.5 w-1.5 bg-[var(--hl-vital)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-vital)]">
              {t.dailyChallenge.rewardClaimed}
            </span>
          </div>
        )}
      </div>

      {template.tips && !completed && (
        <div className="border-l-2 border-[var(--hl-caution)] pl-2.5">
          <div className="hl-label">{t.dailyChallenge.strategyTips}</div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--hl-ink-2)]">
            {template.tips}
          </p>
        </div>
      )}
    </section>
  );
}

export default DailyChallengeRewards;
