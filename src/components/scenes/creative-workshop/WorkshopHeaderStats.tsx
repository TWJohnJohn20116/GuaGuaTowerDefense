/**
 * 創意工坊 · 頂列統計（HARDLINE：mono 標籤 + 等寬數值）
 */
import { useTranslation } from '@/i18n';
import { Num } from '@/components/hl';

type WorkshopStatsMode = 'editor' | 'manager';

interface WorkshopHeaderStatsProps {
  mode: WorkshopStatsMode;
  installedCount: number;
  enabledCount: number;
}

const CELL = 'flex flex-col items-end gap-1 border-l border-[var(--cn-line-soft)] px-3 first:border-l-0 first:pl-0';
const VALUE = 'font-mono text-[13px] leading-none font-semibold tabular-nums arc-num';

export function WorkshopHeaderStats({ mode, installedCount, enabledCount }: WorkshopHeaderStatsProps) {
  const { t } = useTranslation();
  const h = t.workshop.headerStats;

  return (
    <div className="hidden items-center md:flex">
      <div className={CELL}>
        <span className="arc-label">{mode === 'editor' ? h.editorMode : h.managerMode}</span>
        <span className={`${VALUE} text-[var(--arc-gold)]`}>
          {mode === 'editor' ? h.editing : h.browsing}
        </span>
      </div>
      <div className={CELL}>
        <span className="arc-label">{h.installed}</span>
        <Num
          value={String(installedCount).padStart(2, '0')}
          tone="ink"
          size="md"
          className="font-mono leading-none font-semibold tabular-nums"
        />
      </div>
      <div className={CELL}>
        <span className="arc-label">{h.enabled}</span>
        <Num
          value={String(enabledCount).padStart(2, '0')}
          tone="vital"
          size="md"
          className="font-mono leading-none font-semibold tabular-nums"
        />
      </div>
    </div>
  );
}

export default WorkshopHeaderStats;
