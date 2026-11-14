/**
 * 創意工坊 · 頂列統計（HARDLINE：mono 標籤 + 等寬數值）
 */
import { useTranslation } from '@/i18n';

export type WorkshopStatsMode = 'editor' | 'manager';

interface WorkshopHeaderStatsProps {
  mode: WorkshopStatsMode;
  installedCount: number;
  enabledCount: number;
}

const CELL = 'flex flex-col items-end gap-1 border-l border-[var(--hl-line)] px-3 first:border-l-0 first:pl-0';
const VALUE = 'font-mono text-[13px] leading-none font-semibold tabular-nums';

export function WorkshopHeaderStats({ mode, installedCount, enabledCount }: WorkshopHeaderStatsProps) {
  const { t } = useTranslation();
  const h = t.workshop.headerStats;

  return (
    <div className="hidden items-center md:flex">
      <div className={CELL}>
        <span className="hl-label">{mode === 'editor' ? h.editorMode : h.managerMode}</span>
        <span className={`${VALUE} text-[var(--hl-signal)]`}>
          {mode === 'editor' ? h.editing : h.browsing}
        </span>
      </div>
      <div className={CELL}>
        <span className="hl-label">{h.installed}</span>
        <span className={`${VALUE} text-[var(--hl-ink)]`}>{String(installedCount).padStart(2, '0')}</span>
      </div>
      <div className={CELL}>
        <span className="hl-label">{h.enabled}</span>
        <span className={`${VALUE} text-[var(--hl-vital)]`}>{String(enabledCount).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

export default WorkshopHeaderStats;
