/**
 * 設定匯出 / 匯入 - 區段勾選清單
 *
 * 舊版是「大圓角組卡片 + 大圓角項目卡」雙層包，每項 60px 高、10 項就要捲；
 * 而且 CustomCheckbox 的選中態用動態類名（border-${color}/30），Tailwind JIT 掃不到，
 * 勾了跟沒勾幾乎一樣。
 *
 * 新版：小標題＋細分隔線分組，項目一行 30px（方框＋標籤），勾選框自寫，選中態用實色。
 */
import {
  ALL_SETTINGS_EXPORT_SECTIONS,
  SETTINGS_SECTION_GROUPS,
  SETTINGS_SECTION_LABELS,
  type SettingsExportSection,
  type SettingsExportSelection,
} from '@/services/settingsExportSections';
import { useTranslation } from '@/i18n';

interface Props {
  availableSections?: SettingsExportSection[];
  selection: SettingsExportSelection;
  onSelectionChange: (next: SettingsExportSelection) => void;
}

export function SettingsSectionChecklist({
  availableSections = ALL_SETTINGS_EXPORT_SECTIONS,
  selection,
  onSelectionChange,
}: Props) {
  const { t } = useTranslation();
  const ed = t.settings.exportDialog;
  const availableSet = new Set(availableSections);

  const toggleSection = (key: SettingsExportSection) => {
    if (!availableSet.has(key)) return;
    onSelectionChange({ ...selection, [key]: !selection[key] });
  };

  const toggleGroup = (sections: SettingsExportSection[], on: boolean) => {
    const next = { ...selection };
    sections.filter((s) => availableSet.has(s)).forEach((s) => {
      next[s] = on;
    });
    onSelectionChange(next);
  };

  const selectedCount = availableSections.filter((s) => selection[s]).length;
  const allSelected = selectedCount === availableSections.length;

  return (
    <div className="flex flex-col gap-3">
      {/* 標題列：計數 + 細線 + 全選／全不選 */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--cn-ink-3)]">
          {ed.checklistSelected
            .replace('{selected}', String(selectedCount))
            .replace('{total}', String(availableSections.length))}
        </span>
        <span className="h-px flex-1 bg-[var(--cn-line-soft)]" />
        <button
          type="button"
          onClick={() => toggleGroup(availableSections, true)}
          aria-pressed={allSelected}
          className={[
            'rounded-[4px] px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] transition-colors',
            allSelected
              ? 'text-[var(--cn-mint-deep)]'
              : 'text-[var(--cn-ink-3)] hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]',
          ].join(' ')}
        >
          {ed.selectAll}
        </button>
        <button
          type="button"
          onClick={() => toggleGroup(availableSections, false)}
          className="rounded-[4px] px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-[var(--cn-ink-3)] transition-colors hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]"
        >
          {ed.selectNone}
        </button>
      </div>

      {SETTINGS_SECTION_GROUPS.map((group) => {
        const groupSections = group.sections.filter((s) => availableSet.has(s));
        if (groupSections.length === 0) return null;
        const groupChecked = groupSections.filter((s) => selection[s]).length;
        return (
          <div key={group.title} className="flex flex-col">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--cn-ink-4)]">
                {group.title}
              </span>
              <span className="h-px flex-1 bg-[var(--cn-line-soft)]" />
              <span className="font-mono text-[9px] tabular-nums text-[var(--cn-ink-4)]">
                {groupChecked}/{groupSections.length}
              </span>
            </div>
            {groupSections.map((section) => {
              const checked = selection[section];
              return (
                <button
                  key={section}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggleSection(section)}
                  className="flex items-center gap-2.5 rounded-[4px] px-1.5 py-1.5 text-left transition-colors hover:bg-[var(--cn-card-2)]"
                >
                  <span
                    className={[
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors',
                      checked
                        ? 'border-[var(--cn-mint-deep)] bg-[var(--cn-mint-deep)] text-[var(--cn-on-fill)]'
                        : 'border-[var(--cn-line)] bg-transparent',
                    ].join(' ')}
                  >
                    {checked && <span className="text-[9px] font-black leading-none">✓</span>}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] text-[var(--cn-ink)]">
                    {SETTINGS_SECTION_LABELS[section]}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function countAvailableSelected(
  availableSections: SettingsExportSection[],
  selection: SettingsExportSelection,
): number {
  return availableSections.filter((s) => selection[s]).length;
}

export default SettingsSectionChecklist;