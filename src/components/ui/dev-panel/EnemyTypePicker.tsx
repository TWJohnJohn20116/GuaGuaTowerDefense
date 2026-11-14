// 敵人類型選擇器 - 改用 CustomSelect（grid 網格 + 預覽圖）
import { useMemo } from 'react';
import EnemyPreview from '@/components/ui/EnemyPreview';
import { ENEMY_DATA } from '@/data/gameData';
import type { EnemyType } from '@/types/game';
import { CustomSelect } from '@/components/ui/CustomSelect';
import type { SelectOption } from '@/components/ui/CustomSelect';
import { HeartIcon, LightningIcon, CoinIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';

interface EnemyTypePickerProps {
  value: EnemyType;
  onChange: (next: EnemyType) => void;
}

const ALL_TYPES = Object.keys(ENEMY_DATA) as EnemyType[];

export const EnemyTypePicker = ({ value, onChange }: EnemyTypePickerProps) => {
  const { t } = useTranslation();
  const ui = t.dev.ui;

  const options = useMemo<SelectOption<EnemyType>[]>(
    () => ALL_TYPES.map((type) => {
      const d = ENEMY_DATA[type];
      return {
        value: type,
        label: d?.name || type,
        description: type,
        keywords: type,
        previewBg: `${d?.color || '#888'}15`,
        preview: <EnemyPreview enemyId={type} size={36} />,
        title: fillTemplate(ui.pickerEnemyTitle, {
          name: d?.name || type,
          hp: d?.health ?? 0,
          speed: d?.speed?.toFixed(1) ?? 0,
          reward: d?.reward ?? 0,
        }),
        meta: (
          <span className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-[var(--hl-alarm)]/90"><HeartIcon className="w-2.5 h-2.5" /> {d?.health || 0}</span>
            <span className="flex items-center gap-1 text-[var(--hl-reach)]/90"><LightningIcon className="w-2.5 h-2.5" /> {d?.speed?.toFixed(1) || 0}</span>
            <span className="flex items-center gap-1 text-[var(--hl-caution)]/90"><CoinIcon className="w-2.5 h-2.5" /> ${d?.reward || 0}</span>
          </span>
        ),
      };
    }),
    [ui.pickerEnemyTitle],
  );

  return (
    <CustomSelect<EnemyType>
      value={value}
      onChange={onChange}
      options={options}
      layout="grid"
      columns={3}
      variant="filled"
      accent="rose"
      position="inline"
      footer={ui.pickerEnemyFooter.replace('{count}', String(ALL_TYPES.length))}
    />
  );
};
