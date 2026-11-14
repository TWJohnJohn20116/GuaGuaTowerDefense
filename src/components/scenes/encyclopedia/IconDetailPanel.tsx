/**
 * 圖示庫 · 右欄詳情面板（對齊 ShopDetailPanel）
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { GameIconEntry } from './gameIconRegistry';
import { ICON_LIBRARY_SCOPE } from './gameIconRegistry';
import { getIconCategoryLabel } from '@/i18n/iconCategoryLabels';
import { SparklesIcon, CheckIcon, DocumentIcon } from '@/components/ui/Icons';
import { DetailBlock, DetailCell, DetailEmptyState, DetailSurface } from '@/components/ui/SceneDetailParts';
import { SceneFilterChip } from '@/components/ui/SceneBrowseParts';
import { useTranslation } from '@/i18n';

interface IconDetailPanelProps {
  icon: GameIconEntry | null;
  onOpenFile?: (path: string) => void;
}

export function IconDetailPanel({ icon, onOpenFile }: IconDetailPanelProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;

  const previewColors = useMemo(() => [
    { label: e.iconSwatchWhite, className: 'text-[var(--arc-ink)]' },
    { label: e.iconSwatchAmber, className: 'text-[var(--arc-caution)]' },
    { label: e.iconSwatchBlue, className: 'text-[var(--arc-reach)]' },
    { label: e.iconSwatchEmerald, className: 'text-[var(--arc-vital)]' },
    { label: e.iconSwatchRose, className: 'text-[var(--arc-alert)]' },
    { label: e.iconSwatchPurple, className: 'text-[var(--arc-reach)]' },
  ], [e]);

  if (!icon) {
    return (
      <DetailEmptyState
        icon={<SparklesIcon className="h-7 w-7 text-[var(--arc-ink-3)]" />}
        message={<>{e.iconDetailSelectHintLine1}<br />{e.iconDetailSelectHintLine2}</>}
      />
    );
  }

  const IconCmp = icon.Component;
  const sourceLabel = `${icon.sourceFile.split('/').pop()}${icon.sourceLine ? `:${icon.sourceLine}` : ''}`;

  return (
    <motion.div
      key={icon.id}
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin  scrollbar-track-transparent"
    >
      <DetailSurface className="relative flex h-44 shrink-0 items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[var(--arc-deck-2)]   " />
        <IconCmp className="relative z-10 h-20 w-20 shrink-0 text-[var(--arc-ink)] drop-" />
      </DetailSurface>

      <div className="space-y-1">
        <h3 className="arc-title text-base font-semibold tracking-wide text-[var(--arc-ink)]">{icon.displayName}</h3>
        <p className="font-mono text-[11px] text-[var(--arc-ink-2)]">{icon.exportName}</p>
      </div>

      <DetailBlock className="p-3.5">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.fileDetailFormat}</p>
        <div className="flex flex-wrap items-center gap-2">
          <SceneFilterChip active accent="emerald" onClick={() => {}} disabled size="sm" className="pointer-events-none normal-case tracking-[0.08em]">
            <span className="inline-flex items-center gap-1.5">
              <CheckIcon className="h-3 w-3" />
              {e.iconDetailInlineSvg}
            </span>
          </SceneFilterChip>
          <span className="text-[10px] text-[var(--arc-ink-2)]">{e.iconDetailViewBoxHint}</span>
        </div>
      </DetailBlock>

      <DetailBlock className="p-3.5">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.fileDetailCategory}</p>
        <SceneFilterChip active accent="sky" onClick={() => {}} disabled size="sm" className="pointer-events-none normal-case tracking-[0.08em]">
          {getIconCategoryLabel(e, icon.category)}
        </SceneFilterChip>
      </DetailBlock>

      <DetailBlock className="p-3.5">
        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.iconDetailSwatches}</p>
        <div className="grid grid-cols-3 gap-2">
          {previewColors.map(({ label, className }) => (
            <DetailCell key={label} className="flex flex-col items-center gap-2">
              <IconCmp className={`h-7 w-7 shrink-0 ${className}`} />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-2)]">{label}</span>
            </DetailCell>
          ))}
        </div>
      </DetailBlock>

      <DetailBlock className="p-3.5">
        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.iconDetailSizes}</p>
        <DetailCell className="flex items-end justify-around gap-2 px-3 py-4">
          <IconCmp className="h-4 w-4 shrink-0 text-[var(--arc-ink-2)]" />
          <IconCmp className="h-6 w-6 shrink-0 text-[var(--arc-ink-2)]" />
          <IconCmp className="h-8 w-8 shrink-0 text-[var(--arc-ink)]" />
          <IconCmp className="h-12 w-12 shrink-0 text-[var(--arc-ink)]" />
        </DetailCell>
      </DetailBlock>

      <DetailBlock className="mt-auto p-3.5">
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.iconDetailSourceFile}</p>
        <p className="font-mono text-xs font-medium text-[var(--arc-ink-2)]">
          {icon.sourceFile}
          {icon.sourceLine ? `:${icon.sourceLine}` : ''}
        </p>
        {icon.sourceSection && (
          <p className="mt-1.5 text-[10px] text-[var(--arc-ink-2)]">{e.iconDetailSourceSection.replace('{section}', icon.sourceSection)}</p>
        )}
        <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--arc-ink-4)]">
          {e.iconDetailScopeNote.replace('{count}', String(ICON_LIBRARY_SCOPE.totalInRegistry))}
        </p>
        {onOpenFile && (
          <SceneFilterChip
            active={false}
            accent="sky"
            onClick={() => onOpenFile(icon.sourceFile)}
            className="mt-3 flex w-full items-center justify-center gap-2 py-2.5 normal-case tracking-[0.08em]"
          >
            <DocumentIcon className="h-3.5 w-3.5" />
            {e.iconDetailOpenInFileLib.replace('{file}', sourceLabel)}
          </SceneFilterChip>
        )}
      </DetailBlock>
    </motion.div>
  );
}
