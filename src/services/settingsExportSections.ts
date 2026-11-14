/**
 * 設定匯出區段定義
 */
export type SettingsExportSection =
  | 'language'
  | 'visual'
  | 'gameplay'
  | 'audio'
  | 'controls'
  | 'hudLayout'
  | 'masterAudio'
  | 'keyBindings'
  | 'gameSpeed';

export const ALL_SETTINGS_EXPORT_SECTIONS: SettingsExportSection[] = [
  'language',
  'visual',
  'gameplay',
  'audio',
  'controls',
  'hudLayout',
  'masterAudio',
  'keyBindings',
  'gameSpeed',
];

export const SETTINGS_SECTION_LABELS: Record<SettingsExportSection, string> = {
  language: '語言',
  visual: '顯示',
  gameplay: '遊戲行為',
  audio: '音效分類',
  controls: '滑鼠與視角',
  hudLayout: 'HUD 佈局',
  masterAudio: '主音量（音效 / BGM）',
  keyBindings: '快捷鍵',
  gameSpeed: '預設遊戲速度',
};

export const SETTINGS_SECTION_GROUPS: { title: string; sections: SettingsExportSection[] }[] = [
  { title: '一般', sections: ['language', 'visual', 'gameplay'] },
  { title: '音效', sections: ['masterAudio', 'audio'] },
  { title: '操作', sections: ['controls', 'keyBindings', 'gameSpeed'] },
  { title: '介面', sections: ['hudLayout'] },
];

export type SettingsExportSelection = Record<SettingsExportSection, boolean>;

export function createDefaultExportSelection(): SettingsExportSelection {
  return ALL_SETTINGS_EXPORT_SECTIONS.reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {} as SettingsExportSelection,
  );
}

export function countSelectedSections(selection: SettingsExportSelection): number {
  return ALL_SETTINGS_EXPORT_SECTIONS.filter((s) => selection[s]).length;
}
/** 依備份內容建立匯入勾選（僅 payload 內含區段預設勾選） */
export function createImportSelectionFromPayload(
  payload: { sections: SettingsExportSection[] } | null | undefined,
): SettingsExportSelection {
  const available = new Set(payload?.sections ?? []);
  return ALL_SETTINGS_EXPORT_SECTIONS.reduce(
    (acc, key) => {
      acc[key] = available.has(key);
      return acc;
    },
    {} as SettingsExportSelection,
  );
}
