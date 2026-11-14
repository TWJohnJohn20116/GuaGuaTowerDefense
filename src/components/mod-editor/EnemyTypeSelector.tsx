// 美化版敵人類型選擇器 - 改用 CustomSelect（grid 網格 + 搜尋 + 分類群組 + 預覽圖）
import { useMemo } from 'react';
import type { EnemyType } from '@/types/game';
import { ENEMY_DATA } from '@/data/gameData';
import EnemyPreview from '@/components/ui/EnemyPreview';
import { CustomSelect } from '@/components/ui/CustomSelect';
import type { SelectOption, SelectGroup } from '@/components/ui/CustomSelect';
import { HeartIcon, ZapIcon, CoinIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';

const ALL_TYPES: EnemyType[] = [
  'normal', 'fast', 'elite', 'speedy',
  'tank', 'heavy', 'boss', 'flyer',
  'healer', 'spawner', 'shield', 'stealth',
  'berserker', 'armored', 'mage', 'miniboss',
  'swarm', 'ghost', 'bomber', 'saboteur', 'jammer', 'escort',
];

// 敵人分類（用於分組顯示）。顏色只用資料色，不用彩度色。
const CATEGORIES: { id: string; label: string; types: EnemyType[]; color: string }[] = [
  { id: 'basic', label: 'BASIC', types: ['normal', 'fast', 'speedy', 'swarm'], color: 'text-[var(--arc-vital)]' },
  { id: 'tough', label: 'TOUGH', types: ['tank', 'heavy', 'armored', 'shield'], color: 'text-[var(--arc-reach)]' },
  { id: 'elite', label: 'ELITE', types: ['elite', 'miniboss', 'boss', 'berserker'], color: 'text-[var(--arc-caution)]' },
  { id: 'special', label: 'SPECIAL', types: ['flyer', 'healer', 'spawner', 'stealth', 'mage', 'ghost', 'bomber', 'saboteur', 'jammer', 'escort'], color: 'text-[var(--arc-ink-2)]' },
];

interface EnemyTypeSelectorProps {
  value: EnemyType;
  onChange: (type: EnemyType) => void;
  size?: 'sm' | 'md';
}

export function EnemyTypeSelector({ value, onChange, size = 'md' }: EnemyTypeSelectorProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const previewSize = size === 'sm' ? 28 : 32;

  const options = useMemo<SelectOption<EnemyType>[]>(() => {
    const typeToGroup = new Map<EnemyType, string>();
    for (const c of CATEGORIES) for (const t of c.types) typeToGroup.set(t, c.id);
    return ALL_TYPES.map((type) => {
      const d = ENEMY_DATA[type];
      return {
        value: type,
        label: d?.name || type,
        keywords: type,
        group: typeToGroup.get(type),
        // 預覽框一律下沉一階，不用敵人主色鋪底
        previewBg: 'var(--arc-void-2)',
        preview: <EnemyPreview enemyId={type} size={previewSize} />,
        meta: (
          <div className="flex items-center gap-1 font-mono text-[9.5px] tabular-nums leading-none text-[var(--arc-ink-4)]">
            <HeartIcon className="h-2.5 w-2.5 text-[var(--arc-alert)]" /><span>{d?.health}</span>
            <ZapIcon className="ml-1 h-2.5 w-2.5 text-[var(--arc-reach)]" /><span>{d?.speed}x</span>
            <CoinIcon className="ml-1 h-2.5 w-2.5 text-[var(--arc-caution)]" /><span>{d?.reward}</span>
          </div>
        ),
      };
    });
  }, [previewSize]);

  const groups = useMemo<SelectGroup[]>(
    () => CATEGORIES.map((c) => ({ id: c.id, label: c.label, color: c.color })),
    [],
  );

  return (
    <CustomSelect<EnemyType>
      value={value}
      onChange={onChange}
      options={options}
      groups={groups}
      layout="grid"
      columns={2}
      gridCardLayout="horizontal"
      gridMeta
      searchable
      searchPlaceholder={m.etsSearchPh}
      variant="glass"
      accent="white"
      size={size}
      footer={(
        <div className="flex items-center justify-between font-mono text-[9.5px] tabular-nums">
          <span>{fillTemplate(m.etsTypeCount, { count: ALL_TYPES.length })}</span>
          <span className="normal-case">{m.etsEscClose}</span>
        </div>
      )}
    />
  );
}
