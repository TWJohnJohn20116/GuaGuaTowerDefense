// 每日挑戰 · 完成條件（HARDLINE：hl-row 表格列 + 計量條，不用卡片）
import { useTranslation } from '@/i18n';
import { Dot, Meter, SegHead } from '@/components/hl';
import type { DailyChallengeInstance } from '@/types/dailyChallenge';

interface DailyChallengeConditionsProps {
  challenge: DailyChallengeInstance;
}

export function DailyChallengeConditions({ challenge }: DailyChallengeConditionsProps) {
  const { t } = useTranslation();
  const { template, progress } = challenge;
  const metCount = template.conditions.filter((c, i) => (progress[i] || 0) >= c.target).length;

  return (
    <section>
      <div className="px-4 pt-3">
        <SegHead
          label={t.dailyChallenge.completionConditions}
          right={
            <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
              {`${metCount}/${template.conditions.length}`}
            </span>
          }
        />
      </div>

      <div className="mt-2 flex flex-col border-t border-[var(--hl-line)]">
        {template.conditions.map((cond, i) => {
          const current = progress[i] || 0;
          const met = current >= cond.target;
          const percent = Math.min(100, (current / cond.target) * 100);

          return (
            <div key={i} className="hl-row hl-row-hover">
              <span className="w-6 shrink-0 font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-4)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <Dot tone={met ? 'vital' : 'signal'} />
              <span
                className={`min-w-0 flex-1 truncate text-[12.5px] ${
                  met ? 'text-[var(--hl-ink)]' : 'text-[var(--hl-ink-2)]'
                }`}
              >
                {cond.label}
              </span>
              <span className="w-[140px] shrink-0">
                <Meter value={percent} max={100} tone={met ? 'vital' : 'signal'} />
              </span>
              <span
                className={`w-[86px] shrink-0 text-right font-mono text-[10.5px] tabular-nums ${
                  met ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-ink-3)]'
                }`}
              >
                {current.toLocaleString()}/{cond.target.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DailyChallengeConditions;
