/**
 * Mod 管理器 · 主清單 — HARDLINE 密集列
 *
 * 不做卡片堆疊：一列一個 Mod，1px 底線分隔。選中＝左緣 2px 訊號條。
 */
import type { Mod } from '@/types/game';
import { Empty, Btn } from '@/components/hl';
import { CheckIcon, ThemeIcon } from '@/components/ui/Icons';
import { MOD_TYPE_CONFIG, getModTypeLabel } from './ModCard';
import { renderModIcon } from '@/components/ui/ModIcon';
import { ModBalanceScoreBadge } from '@/components/mod-editor/ModBalanceScoreBadge';
import { useTranslation } from '@/i18n';

export interface ModManagerGridProps {
  mods: Mod[];
  selectedId: string | null;
  batchSelected?: Set<string>;
  onSelect: (id: string, opts?: { toggleBatch?: boolean }) => void;
  onImport: () => void;
  onClearFilters: () => void;
  emptyKind: 'none' | 'search' | 'filter';
}

const COLS = 'grid grid-cols-[28px_24px_1fr_84px_46px_18px] items-center gap-2.5';

export function ModManagerGrid({
  mods,
  selectedId,
  batchSelected,
  onSelect,
  onImport,
  onClearFilters,
  emptyKind,
}: ModManagerGridProps) {
  const { t } = useTranslation();
  const w = t.workshop.modManagerExt;
  const g = t.modManager.grid;
  const d = t.modManager.detail;

  if (mods.length === 0) {
    return (
      <div className="p-4">
        <Empty
          title={emptyKind === 'none' ? g.emptyNone : g.emptyFilter}
          action={
            <Btn
              size="sm"
              variant={emptyKind === 'none' ? 'signal' : 'line'}
              onClick={emptyKind === 'none' ? onImport : onClearFilters}
            >
              {emptyKind === 'none' ? g.importFirst : g.clearFilters}
            </Btn>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 表頭 */}
      <div className={`${COLS} shrink-0 border-b border-[var(--hl-line)] bg-[var(--hl-deck)] px-2.5 py-1.5`}>
        <span className="hl-label">#</span>
        <span className="hl-label" aria-hidden="true" />
        <span className="hl-label">mod</span>
        <span className="hl-label">balance</span>
        <span className="hl-label text-right">items</span>
        <span className="hl-label" aria-hidden="true" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {mods.map((mod, i) => {
          const cfg = MOD_TYPE_CONFIG[mod.metadata.type];
          const isSel = selectedId === mod.metadata.id;
          const isBatch = batchSelected?.has(mod.metadata.id) ?? false;
          const contentCount =
            (mod.content.towers?.length || 0) +
            (mod.content.enemies?.length || 0) +
            (mod.content.maps?.length || 0) +
            (mod.content.waves?.length || 0);

          return (
            <button
              key={mod.metadata.id}
              type="button"
              onClick={(e) => onSelect(mod.metadata.id, { toggleBatch: e.ctrlKey || e.metaKey })}
              className={[
                'group relative w-full border-b border-[var(--hl-line)] px-2.5 py-2 text-left transition-colors duration-150',
                COLS,
                isSel || isBatch ? 'bg-[var(--hl-deck-2)]' : 'hover:bg-[var(--hl-deck-2)]',
              ].join(' ')}
            >
              {/* 選中：左緣 2px 訊號條 */}
              <span
                className={[
                  'absolute left-0 top-0 h-full w-[2px]',
                  isSel ? 'bg-[var(--hl-signal)]' : isBatch ? 'bg-[var(--hl-reach)]' : 'bg-transparent',
                ].join(' ')}
              />

              <span
                className={[
                  'font-mono text-[10px] tabular-nums tracking-wider',
                  isSel ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-4)]',
                ].join(' ')}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="flex h-6 w-6 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-3)]">
                {renderModIcon(
                  mod.metadata.icon,
                  <ThemeIcon icon={cfg.icon} className="h-3.5 w-3.5" />,
                  'h-3.5 w-3.5',
                  { rounded: '', translateFactor: 0.25, scaleFactor: 0.5 },
                )}
              </span>

              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-[13px] font-medium text-[var(--hl-ink)]">
                    {mod.metadata.name}
                  </span>
                  <span className={`shrink-0 font-mono text-[9.5px] uppercase tracking-[0.08em] ${cfg.color}`}>
                    {getModTypeLabel(w, mod.metadata.type)}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-[var(--hl-ink-3)]">
                  <span className="font-mono tabular-nums">v{mod.metadata.version}</span>
                  <span className="text-[var(--hl-line-hot)]">·</span>
                  <span className="truncate">{mod.metadata.author}</span>
                  {mod.metadata.tags && mod.metadata.tags.length > 0 && (
                    <>
                      <span className="text-[var(--hl-line-hot)]">·</span>
                      <span className="truncate font-mono text-[10px] text-[var(--hl-ink-4)]">
                        {mod.metadata.tags.slice(0, 2).map((tag) => `#${tag}`).join(' ')}
                      </span>
                    </>
                  )}
                </span>
              </span>

              <span className="flex items-center justify-end">
                <ModBalanceScoreBadge mod={mod} />
              </span>

              <span className="text-right font-mono text-[11px] tabular-nums text-[var(--hl-ink-2)]">
                {String(contentCount).padStart(2, '0')}
              </span>

              <span className="flex items-center justify-center">
                {mod.enabled ? (
                  <CheckIcon className="h-3 w-3 text-[var(--hl-vital)]" aria-label={d.enabled} />
                ) : (
                  <span className="h-1.5 w-1.5 bg-[var(--hl-ink-4)]" aria-label={d.disabled} />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ModManagerGrid;
