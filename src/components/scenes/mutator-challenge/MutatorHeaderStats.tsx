// 突變挑戰 · 頂列數值（HARDLINE StatCell）
import { useTranslation } from '@/i18n';
import { StatCell } from '@/components/hl';

interface MutatorHeaderStatsProps {
  completed: number;
  total: number;
}

export function MutatorHeaderStats({ completed, total }: MutatorHeaderStatsProps) {
  const { t } = useTranslation();
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-stretch divide-x divide-[var(--hl-line)] border border-[var(--hl-line)]">
      <div className="px-3 py-1.5">
        <StatCell
          label={t.mutatorChallenge.completedCount}
          value={`${completed}/${total}`}
          tone="signal"
        />
      </div>
      <div className="px-3 py-1.5">
        <StatCell label={t.mutatorChallenge.completionRate} value={pct} unit="%" />
      </div>
    </div>
  );
}

export default MutatorHeaderStats;
