import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useModStore } from '@/store/modStore';
import type { Mod, ModType } from '@/types/game';
import { Toggle } from '@/components/hl';
import { DocumentIcon, ClipboardIcon, FolderIcon, CheckIcon, ThemeIcon } from '@/components/ui/Icons';
import { renderModIcon } from '@/components/ui/ModIcon';
import { ModBalanceScoreBadge } from '@/components/mod-editor/ModBalanceScoreBadge';

// Mod 類型配置（icon 保留 data 層 emoji，由 ThemeIcon 轉成 SVG；沒有對應時退回原文）
export const MOD_TYPE_CONFIG: Record<ModType, {
  labelKey: 'modTypeTower' | 'modTypeEnemy' | 'modTypeMap' | 'modTypeWave' | 'modTypeFull';
  icon: string;
  color: string;
  bg: string;
  border: string;
}> = {
  tower: {
    labelKey: 'modTypeTower',
    icon: '🗼',
    color: 'text-[var(--hl-reach)]',
    bg: 'bg-[var(--hl-deck-2)]',
    border: 'border-[rgba(111,168,255,0.38)]',
  },
  enemy: {
    labelKey: 'modTypeEnemy',
    icon: '👾',
    color: 'text-[var(--hl-alarm)]',
    bg: 'bg-[var(--hl-deck-2)]',
    border: 'border-[rgba(255,75,62,0.38)]',
  },
  map: {
    labelKey: 'modTypeMap',
    icon: '🗺️',
    color: 'text-[var(--hl-vital)]',
    bg: 'bg-[var(--hl-deck-2)]',
    border: 'border-[rgba(56,224,143,0.38)]',
  },
  wave: {
    labelKey: 'modTypeWave',
    icon: '🌊',
    color: 'text-[var(--hl-ink-2)]',
    bg: 'bg-[var(--hl-deck-2)]',
    border: 'border-[var(--hl-line-strong)]',
  },
  full: {
    labelKey: 'modTypeFull',
    icon: '📦',
    color: 'text-[var(--hl-caution)]',
    bg: 'bg-[var(--hl-deck-2)]',
    border: 'border-[rgba(255,182,39,0.38)]',
  },
};

export function getModTypeLabel(
  w: ReturnType<typeof useTranslation>['t']['workshop']['modManagerExt'],
  type: ModType,
): string {
  return w[MOD_TYPE_CONFIG[type].labelKey];
}

// Mod 卡片（HARDLINE：方角、1px 線、實色底，沒有漸層與光暈）
export const ModCard = ({ mod, onSelect }: { mod: Mod; onSelect: () => void }) => {
  const { t } = useTranslation();
  const w = t.workshop.modManagerExt;
  const enableMod = useModStore((s) => s.enableMod);
  const disableMod = useModStore((s) => s.disableMod);
  const config = MOD_TYPE_CONFIG[mod.metadata.type];
  const typeLabel = w[config.labelKey];

  const contentCount =
    (mod.content.towers?.length || 0) +
    (mod.content.enemies?.length || 0) +
    (mod.content.maps?.length || 0) +
    (mod.content.waves?.length || 0);

  return (
    <motion.div
      className={[
        'group relative flex h-full cursor-pointer flex-col overflow-hidden border p-4 transition-colors duration-150',
        mod.enabled
          ? 'border-[var(--hl-signal)] bg-[var(--hl-deck)]'
          : 'border-[var(--hl-line)] bg-[var(--hl-void-2)] hover:border-[var(--hl-line-hot)]',
      ].join(' ')}
      onClick={onSelect}
    >
      {/* 頂部：類型標籤與開關 */}
      <div className="relative z-10 mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={[
              'flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em]',
              config.bg,
              config.color,
              config.border,
            ].join(' ')}
          >
            {renderModIcon(mod.metadata.icon, <ThemeIcon icon={config.icon} className="h-3.5 w-3.5" />, 'h-3.5 w-3.5', { rounded: '', translateFactor: 0.25, scaleFactor: 0.4 })}
            <span>{typeLabel}</span>
          </span>
          {mod.enabled && (
            <span className="flex items-center gap-1 border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--hl-vital)]">
              <CheckIcon className="h-3 w-3" />
              {w.enabled}
            </span>
          )}
          <ModBalanceScoreBadge mod={mod} />
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <Toggle
            on={mod.enabled}
            label={w.enabled}
            onChange={() => { if (mod.enabled) disableMod(mod.metadata.id); else enableMod(mod.metadata.id); }}
          />
        </div>
      </div>

      {/* 標題 */}
      <h3 className="relative z-10 mb-1.5 text-[14px] font-semibold leading-tight text-[var(--hl-ink)]">
        {mod.metadata.name}
      </h3>

      {/* 描述 */}
      <p className="relative z-10 mb-4 line-clamp-2 flex-1 text-[11px] leading-relaxed text-[var(--hl-ink-3)]">
        {mod.metadata.description}
      </p>

      {/* 元信息與標籤 */}
      <div className="relative z-10 mt-auto border-t border-[var(--hl-line)] pt-2.5">
        <div className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
          <span className="flex items-center gap-1">
            <DocumentIcon className="h-3 w-3" />
            v{mod.metadata.version}
          </span>
          <span className="flex items-center gap-1">
            <ClipboardIcon className="h-3 w-3" />
            {mod.metadata.author}
          </span>
          <span className="flex items-center gap-1">
            <FolderIcon className="h-3 w-3" />
            {w.itemsCount.replace('{count}', String(contentCount))}
          </span>
        </div>

        {mod.metadata.tags && mod.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {mod.metadata.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--hl-ink-4)]"
              >
                #{tag}
              </span>
            ))}
            {mod.metadata.tags.length > 3 && (
              <span className="px-1 py-0.5 font-mono text-[9px] tracking-[0.06em] text-[var(--hl-ink-4)]">
                +{mod.metadata.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
