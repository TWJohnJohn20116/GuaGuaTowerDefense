// 更新日誌 · 頂列統計（HARDLINE：mono 標籤 + 等寬數值，靠 1px 線分格）
import { useTranslation } from '@/i18n';

interface ChangelogStatsProps {
  totalVersions: number;
  totalChanges: number;
  majorUpdates: number;
  featureUpdates: number;
}

const CELL = 'flex flex-col items-end gap-1 border-l border-[var(--hl-line)] px-3 first:border-l-0 first:pl-0';
const VALUE = 'font-mono text-[13px] leading-none font-semibold tabular-nums';

export function ChangelogStats({
  totalVersions, totalChanges, majorUpdates, featureUpdates,
}: ChangelogStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden items-center md:flex">
      <div className={CELL}>
        <span className="hl-label">{t.changelog.totalVersions}</span>
        <span className={`${VALUE} text-[var(--hl-ink)]`}>{String(totalVersions).padStart(2, '0')}</span>
      </div>
      <div className={CELL}>
        <span className="hl-label">{t.changelog.totalChanges}</span>
        <span className={`${VALUE} text-[var(--hl-ink)]`}>{totalChanges}</span>
      </div>
      <div className={CELL}>
        <span className="hl-label">{t.changelog.majorUpdates}</span>
        <span className={`${VALUE} text-[var(--hl-alarm)]`}>{majorUpdates}</span>
      </div>
      <div className={CELL}>
        <span className="hl-label">{t.changelog.featureUpdates}</span>
        <span className={`${VALUE} text-[var(--hl-reach)]`}>{featureUpdates}</span>
      </div>
    </div>
  );
}
