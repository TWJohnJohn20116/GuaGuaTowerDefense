/**
 * 創意工坊 · 主區提示條（HARDLINE：1px 結構線 + mono 說明）
 * 模式切換由左軌 Rail 負責，這裡只留說明。
 */
import { useTranslation } from '@/i18n';

export type WorkshopTab = 'modEditor' | 'modManager';

interface WorkshopToolbarProps {
  tab: WorkshopTab;
}

export function WorkshopToolbar({ tab }: WorkshopToolbarProps) {
  const { t } = useTranslation();
  const w = t.workshop;
  const tb = w.toolbar;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-4 py-2.5">
      <span className="hl-label">{tab === 'modEditor' ? w.modEditor : w.modManager}</span>
      <span className="h-px flex-1 bg-[var(--hl-line)]" />
      <span className="hl-micro">
        {tab === 'modEditor' ? tb.editorHint : tb.managerHint}
      </span>
    </div>
  );
}

export default WorkshopToolbar;
