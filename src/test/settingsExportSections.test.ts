import { describe, expect, it } from 'vitest';
import {
  ALL_SETTINGS_EXPORT_SECTIONS,
  SETTINGS_SECTION_GROUPS,
  SETTINGS_SECTION_LABELS,
  countSelectedSections,
  createDefaultExportSelection,
  createImportSelectionFromPayload,
} from '@/services/settingsExportSections';

describe('設定備份區段', () => {
  it('主題色是獨立區段，且有顯示名稱', () => {
    expect(ALL_SETTINGS_EXPORT_SECTIONS).toContain('theme');
    expect(SETTINGS_SECTION_LABELS.theme).toBeTruthy();
  });

  it('每個區段都出現在介面分組，否則使用者勾不到', () => {
    const grouped = SETTINGS_SECTION_GROUPS.flatMap((group) => group.sections);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect([...grouped].sort()).toEqual([...ALL_SETTINGS_EXPORT_SECTIONS].sort());
  });

  it('預設全選包含主題色', () => {
    const selection = createDefaultExportSelection();
    expect(selection.theme).toBe(true);
    expect(countSelectedSections(selection)).toBe(ALL_SETTINGS_EXPORT_SECTIONS.length);
  });

  it('舊備份沒有 theme 區段時不預設勾選，避免誤覆寫目前主題', () => {
    const selection = createImportSelectionFromPayload({ sections: ['visual', 'gameplay'] });
    expect(selection.theme).toBe(false);
    expect(selection.visual).toBe(true);
  });
});
