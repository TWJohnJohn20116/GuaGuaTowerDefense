// 回放 · 頂列統計（HARDLINE：mono 標籤 + 等寬數值）
import { useTranslation } from '@/i18n';

interface ReplayHeaderStatsProps {
  total: number;
  victories: number;
  favorites: number;
}

const CELL = 'flex flex-col items-end gap-1 px-3 border-l border-[var(--hl-line)] first:border-l-0 first:pl-0';

export function ReplayHeaderStats({ total, victories, favorites }: ReplayHeaderStatsProps) {
  const { t } = useTranslation();
  const h = t.replay.headerStats;
  const winRate = total > 0 ? Math.round((victories / total) * 100) : 0;

  return (
    <div className="hidden items-center md:flex">
      <div className={CELL}>
        <span className="hl-label">{h.total}</span>
        <span className="hl-num text-[13px] leading-none">{String(total).padStart(2, '0')}</span>
      </div>
      <div className={CELL}>
        <span className="hl-label">{h.winRate}</span>
        <span className="hl-num text-[13px] leading-none text-[var(--hl-vital)]">{winRate}%</span>
      </div>
      <div className={CELL}>
        <span className="hl-label">{h.favorites}</span>
        <span className="hl-num text-[13px] leading-none text-[var(--hl-caution)]">{favorites}</span>
      </div>
    </div>
  );
}

export default ReplayHeaderStats;
