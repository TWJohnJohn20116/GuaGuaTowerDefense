/** 設定檔案選擇器 — 使用者取消或非錯誤 dismiss */
const SETTINGS_PICKER_CANCELLED = 'cancelled';
const SETTINGS_PICKER_NO_FILE = 'no_file';

const LEGACY_DISMISS = new Set(['已取消', '未選擇檔案']);

export function isSettingsPickerDismissed(reason: string): boolean {
  return (
    reason === SETTINGS_PICKER_CANCELLED
    || reason === SETTINGS_PICKER_NO_FILE
    || LEGACY_DISMISS.has(reason)
  );
}
