/**
 * Mod 編輯器 · 左軌分類 — HARDLINE Rail 212px
 *
 * 選中只有左緣 2px 訊號條；右側是計數與驗證狀態方塊。
 */
import { useTranslation } from '@/i18n';
import type { ModValidationFlag } from '@/types/game';
import { countTabValidation } from '@/components/mod-editor/modValidationFlags';
import type { ContentTab } from '@/components/scenes/mod-editor-scene/ModEditorContentPanel';
import { Rail, RailItem, Dot } from '@/components/hl';

interface TabConfig {
  id: ContentTab;
  label: string;
  icon: React.ReactNode;
}

interface ModEditorSidebarNavProps {
  tabsConfig: TabConfig[];
  activeTab: ContentTab;
  onTabChange: (tab: ContentTab) => void;
  getItemCount: (tab: ContentTab) => number | undefined;
  validationFlags?: ModValidationFlag[];
}

export function ModEditorSidebarNav({
  tabsConfig,
  activeTab,
  onTabChange,
  getItemCount,
  validationFlags,
}: ModEditorSidebarNavProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;

  return (
    <Rail label={m.categoriesTitle}>
      {tabsConfig.map((tab, i) => {
        const count = getItemCount(tab.id);
        const counts = countTabValidation(validationFlags, tab.id);
        const hasValIssue = counts.errors > 0 || counts.warnings > 0;

        return (
          <RailItem
            key={tab.id}
            index={i + 1}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            right={
              <span className="flex items-center gap-1.5">
                {hasValIssue && (
                  <Dot
                    tone={counts.errors > 0 ? 'alarm' : 'caution'}
                  />
                )}
                <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
                  {count !== undefined ? String(count).padStart(2, '0') : '--'}
                </span>
              </span>
            }
          />
        );
      })}
    </Rail>
  );
}
