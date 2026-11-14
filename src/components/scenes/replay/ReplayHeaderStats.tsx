// 回放 · 頂列統計（HARDLINE：mono 標籤 + 等寬數值）
import { useTranslation } from '@/i18n';
import { Num } from '@/components/hl';

interface ReplayHeaderStatsProps {
  total: number;
  victories: number;
  favorites: number;
}

const CELL = 'flex flex-col items-end gap-1 px-3 border-l border-[var(--cn-line-soft)] first:border-l-0 first:pl-0';

export function ReplayHeaderStats({ total, victories, favorites }: ReplayHeaderStatsProps) {
  const { t } = useTranslation();
  const h = t.replay.headerStats;
  const winRate = total > 0 ? Math.round((victories / total) * 100) : 0;

  return (
    <div className="hidden items-center md:flex">
      <div className={CELL}>
        <span className="arc-label">{h.total}</span>
        <Num value={String(total).padStart(2, '0')} size="md" />
      </div>
      <div className={CELL}>
        <span className="arc-label">{h.winRate}</span>
        <Num value={winRate} unit="%" tone="vital" size="md" />
      </div>
      <div className={CELL}>
        <span className="arc-label">{h.favorites}</span>
        <Num value={favorites} tone="caution" size="md" />
      </div>
    </div>
  );
}

export default ReplayHeaderStats;
