// 更新日誌 · 頂列統計（HARDLINE：mono 標籤 + 等寬數值，靠 1px 線分格）
import { useTranslation } from '@/i18n';
import { Num } from '@/components/hl';

interface ChangelogStatsProps {
  totalVersions: number;
  totalChanges: number;
  majorUpdates: number;
  featureUpdates: number;
}

const CELL = 'flex flex-col items-end gap-1 border-l border-[var(--cn-line-soft)] px-3 first:border-l-0 first:pl-0';
const VALUE = 'font-mono leading-none font-semibold tabular-nums';

export function ChangelogStats({
  totalVersions, totalChanges, majorUpdates, featureUpdates,
}: ChangelogStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden items-center md:flex">
      <div className={CELL}>
        <span className="arc-label">{t.changelog.totalVersions}</span>
        <Num value={String(totalVersions).padStart(2, '0')} tone="ink" size="md" className={VALUE} />
      </div>
      <div className={CELL}>
        <span className="arc-label">{t.changelog.totalChanges}</span>
        <Num value={totalChanges} tone="ink" size="md" className={VALUE} />
      </div>
      <div className={CELL}>
        <span className="arc-label">{t.changelog.majorUpdates}</span>
        <Num value={majorUpdates} tone="alarm" size="md" className={VALUE} />
      </div>
      <div className={CELL}>
        <span className="arc-label">{t.changelog.featureUpdates}</span>
        <Num value={featureUpdates} tone="reach" size="md" className={VALUE} />
      </div>
    </div>
  );
}
