/**
 * 設定 · 共用小零件（HARDLINE）
 *
 * keyCodeToDisplayName：鍵位代碼 → 顯示名（暫停選單也共用）
 * LanguageButton：語言選項（方角、1px 線、選中訊號膜）
 */

import { SettingsChoiceButton } from './settingsChoice';

/** 相容轉出：暫停選單仍使用 @/components/ui/VolumeSlider */
export { VolumeSlider } from '@/components/ui/VolumeSlider';

export const LanguageButton = ({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <SettingsChoiceButton active={selected} onClick={onClick} className="truncate">
    {name}
  </SettingsChoiceButton>
);
