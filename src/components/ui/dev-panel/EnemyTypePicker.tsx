import { useMemo, useState } from 'react';
import EnemyPreview from '@/components/ui/EnemyPreview';
import { ENEMY_DATA } from '@/data/gameData';
import type { EnemyType } from '@/types/game';
import { HeartIcon, LightningIcon, CoinIcon, SearchIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';

interface EnemyTypePickerProps {
  value: EnemyType;
  onChange: (next: EnemyType) => void;
}

const ALL_TYPES = Object.keys(ENEMY_DATA) as EnemyType[];

type SortKey = 'default' | 'hp' | 'speed' | 'reward';

/**
 * 敵人類型選擇器
 *
 * 舊版包 CustomSelect：3 欄、每格 150px，22 種要捲八列，而且選中態用紅框＋右上角 X，
 * 看起來像「刪除」而不是「已選」。
 *
 * 新版：頂部固定選中詳情（血量／速度／金錢／說明），下面 4 欄緊湊格（圖示＋名稱＋HP），
 * 選中態改黃框＋左上勾；加搜尋與排序（HP／速度／金錢），22 種一屏掃完。
 */
export const EnemyTypePicker = ({ value, onChange }: EnemyTypePickerProps) => {
  const { t } = useTranslation();
  const ui = t.dev.ui;
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('default');

  const selected = ENEMY_DATA[value];

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = ALL_TYPES.filter((type) => {
      if (!q) return true;
      const d = ENEMY_DATA[type];
      return type.toLowerCase().includes(q) || (d?.name ?? '').toLowerCase().includes(q);
    });
    if (sortBy === 'default') return filtered;
    const pick = (type: EnemyType) => {
      const d = ENEMY_DATA[type];
      if (sortBy === 'hp') return d?.health ?? 0;
      if (sortBy === 'speed') return d?.speed ?? 0;
      return d?.reward ?? 0;
    };
    return [...filtered].sort((a, b) => pick(b) - pick(a));
  }, [query, sortBy]);

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: 'default', label: ui.pickerSortDefault },
    { key: 'hp', label: ui.pickerSortHp },
    { key: 'speed', label: ui.pickerSortSpeed },
    { key: 'reward', label: ui.pickerSortReward },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      {/* 選中詳情：固定在最上面，換敵人時只換這塊，下面的格線不會跳位 */}
      <div className="rounded-[6px] border border-[var(--arc-line)] bg-[var(--arc-deck-2)] p-2">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-[var(--arc-line)]"
            style={{ backgroundColor: (selected?.color ?? '#888') + '22' }}
          >
            <EnemyPreview enemyId={value} size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11.5px] font-black text-[var(--arc-ink)]">
              {selected?.name ?? value}
            </div>
            <div className="font-mono text-[9px] text-[var(--arc-ink-4)]">{value}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2 font-mono text-[10px]">
            <span className="flex items-center gap-0.5 text-[var(--arc-alert)]">
              <HeartIcon className="h-2.5 w-2.5" />
              {selected?.health ?? 0}
            </span>
            <span className="flex items-center gap-0.5 text-[var(--arc-reach)]">
              <LightningIcon className="h-2.5 w-2.5" />
              {selected?.speed?.toFixed(1) ?? '0.0'}
            </span>
            <span className="flex items-center gap-0.5 text-[var(--arc-caution)]">
              <CoinIcon className="h-2.5 w-2.5" />$
              {selected?.reward ?? 0}
            </span>
          </div>
        </div>
        {selected?.description && (
          <p className="mt-1.5 text-[10px] leading-snug text-[var(--arc-ink-3)]">{selected.description}</p>
        )}
      </div>

      {/* 搜尋 + 排序 */}
      <div className="flex items-center gap-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[5px] border border-[var(--arc-line)] bg-[var(--arc-deck-2)] px-2 py-1">
          <SearchIcon className="h-3 w-3 shrink-0 text-[var(--arc-ink-4)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ui.pickerSearch}
            className="min-w-0 flex-1 bg-transparent text-[10.5px] text-[var(--arc-ink)] placeholder:text-[var(--arc-ink-4)] focus:outline-none"
          />
        </div>
        <div className="flex shrink-0 gap-0.5">
          {sortButtons.map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setSortBy(btn.key)}
              aria-pressed={sortBy === btn.key}
              className={[
                'rounded-[4px] border px-1.5 py-1 font-mono text-[9px] font-bold transition-colors',
                sortBy === btn.key
                  ? 'border-[var(--arc-caution)]/60 bg-[var(--arc-caution)]/15 text-[var(--arc-caution)]'
                  : 'border-[var(--arc-line)] bg-[var(--arc-deck-2)] text-[var(--arc-ink-4)] hover:text-[var(--arc-ink-2)]',
              ].join(' ')}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 欄緊湊格 */}
      <div className="grid max-h-[260px] grid-cols-4 gap-1 overflow-y-auto pr-0.5">
        {list.map((type) => {
          const d = ENEMY_DATA[type];
          const isSelected = type === value;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              aria-pressed={isSelected}
              title={ui.pickerEnemyTitle
                .replace('{name}', d?.name ?? type)
                .replace('{hp}', String(d?.health ?? 0))
                .replace('{speed}', d?.speed?.toFixed(1) ?? '0')
                .replace('{reward}', String(d?.reward ?? 0))}
              className={[
                'relative flex flex-col items-center gap-0.5 rounded-[5px] border px-1 py-1.5 transition-colors',
                isSelected
                  ? 'border-[var(--arc-caution)] bg-[var(--arc-caution)]/10'
                  : 'border-[var(--arc-line)] bg-[var(--arc-deck-2)] hover:border-[var(--arc-line-strong)]',
              ].join(' ')}
            >
              {isSelected && (
                <span className="absolute left-1 top-0.5 text-[8px] font-black text-[var(--arc-caution)]">✓</span>
              )}
              <EnemyPreview enemyId={type} size={24} />
              <span className="w-full truncate text-center text-[9px] font-bold text-[var(--arc-ink-2)]">
                {d?.name ?? type}
              </span>
              <span className="font-mono text-[8px] text-[var(--arc-ink-4)]">{d?.health ?? 0}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between font-mono text-[9px] text-[var(--arc-ink-4)]">
        <span>{ui.pickerEnemyFooter.replace('{count}', String(ALL_TYPES.length))}</span>
        <span>{ui.pickerShown.replace('{count}', String(list.length))}</span>
      </div>
    </div>
  );
};