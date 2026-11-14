// 塔類型選擇器 - 改用 CustomSelect（grid 網格 + 預覽圖）
import { useMemo } from 'react';
import TowerPreview from '@/components/ui/TowerPreview';
import { TOWER_DATA } from '@/data/gameData';
import type { TowerType } from '@/types/game';
import { CustomSelect } from '@/components/ui/CustomSelect';
import type { SelectOption } from '@/components/ui/CustomSelect';
import { CoinIcon, TargetIcon, LightningIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';

interface TowerTypePickerProps {
  value: TowerType;
  onChange: (next: TowerType) => void;
}

const ALL_TYPES = Object.keys(TOWER_DATA) as TowerType[];

export const TowerTypePicker = ({ value, onChange }: TowerTypePickerProps) => {
  const { t } = useTranslation();
  const ui = t.dev.ui;

  const options = useMemo<SelectOption<TowerType>[]>(
    () => ALL_TYPES.map((type) => {
      const d = TOWER_DATA[type];
      const damage = d?.damage || (d as { damagePerSecond?: number })?.damagePerSecond || 0;
      return {
        value: type,
        label: d?.name || type,
        description: type,
        keywords: type,
        previewBg: `${d?.color || '#888'}15`,
        preview: <TowerPreview towerId={type} size={36} />,
        title: fillTemplate(ui.pickerTowerTitle, {
          name: d?.name || type,
          cost: d?.cost ?? 0,
          damage,
          range: d?.range ?? 0,
          rate: d?.fireRate?.toFixed(1) ?? 0,
        }),
        meta: (
          <span className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-[var(--arc-caution)]/90"><CoinIcon className="w-2.5 h-2.5" /> ${d?.cost || 0}</span>
            <span className="flex items-center gap-1 text-[var(--arc-reach)]/90"><TargetIcon className="w-2.5 h-2.5" /> {d?.range || 0}</span>
            <span className="flex items-center gap-1 text-[var(--arc-alert)]/90"><LightningIcon className="w-2.5 h-2.5" /> {damage}</span>
          </span>
        ),
      };
    }),
    [ui.pickerTowerTitle],
  );

  return (
    <CustomSelect<TowerType>
      value={value}
      onChange={onChange}
      options={options}
      layout="grid"
      columns={3}
      variant="filled"
      accent="cyan"
      position="inline"
      footer={ui.pickerTowerFooter.replace('{count}', String(ALL_TYPES.length))}
    />
  );
};
