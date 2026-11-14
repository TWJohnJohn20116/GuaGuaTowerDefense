/**
 * 設定匯出 / 匯入 - 區段勾選清單
 */
import {
  ALL_SETTINGS_EXPORT_SECTIONS,
  SETTINGS_SECTION_GROUPS,
  SETTINGS_SECTION_LABELS,
  type SettingsExportSection,
  type SettingsExportSelection,
} from '@/services/settingsExportSections';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { SceneFilterChip } from '@/components/ui/SceneBrowseParts';
import { SCENE_GLASS } from '@/components/ui/SceneWorkshopLayout';
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
    sections.filter((s) => availableSet.has(s)).forEach((s) => { next[s] = on; });
    onSelectionChange(next);
  };

  const selectedCount = availableSections.filter((s) => selection[s]).length;
  const allSelected = selectedCount === availableSections.length;

  return (
    <>
      <p className="mb-3 text-[11px] text-[var(--arc-ink-2)]">
        {ed.checklistSelected
          .replace('{selected}', String(selectedCount))
          .replace('{total}', String(availableSections.length))}
      </p>

      <div className="mb-4 flex gap-2">
        <SceneFilterChip
          active={allSelected}
          accent="emerald"
          size="sm"
          onClick={() => toggleGroup(availableSections, true)}
        >
          {ed.selectAll}
        </SceneFilterChip>
        <SceneFilterChip
          active={false}
          accent="emerald"
          size="sm"
          onClick={() => toggleGroup(availableSections, false)}
        >
          {ed.selectNone}
        </SceneFilterChip>
      </div>

      <div className="flex flex-col gap-4">
        {SETTINGS_SECTION_GROUPS.map((group) => {
          const groupSections = group.sections.filter((s) => availableSet.has(s));
          if (groupSections.length === 0) return null;
          return (
            <div key={group.title} className={`p-3 ${SCENE_GLASS.listShell}`}>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
                {group.title}
              </div>
              <div className="flex flex-col gap-1.5">
                {groupSections.map((section) => (
                  <CustomCheckbox
                    key={section}
                    checked={selection[section]}
                    onChange={() => toggleSection(section)}
                    label={SETTINGS_SECTION_LABELS[section]}
                    color="emerald-500"
                    className="gap-3  p-2.5"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function countAvailableSelected(
  availableSections: SettingsExportSection[],
  selection: SettingsExportSelection,
): number {
  return availableSections.filter((s) => selection[s]).length;
}

export default SettingsSectionChecklist;
