/**
 * 圖鑑 · 檔案庫右欄詳情
 */

import { motion } from 'framer-motion';
import {
  DocumentIcon,
  FolderIcon,
  TargetIcon,
  WarningIcon,
} from '@/components/ui/Icons';
import { DetailBlock, DetailEmptyState, DetailSurface } from '@/components/ui/SceneDetailParts';
import { SceneFilterChip } from '@/components/ui/SceneBrowseParts';
import { useTranslation } from '@/i18n';
import type { Translations } from '@/i18n';
import type { EncyclopediaFileEntry } from './encyclopediaFileRegistry';
import { formatLineCount } from './encyclopediaFileRegistry';
import { getFileCategoryLabel, getInferredFileDescription } from '@/i18n/fileCategoryLabels';
import { resolveFileDescription } from '@/i18n/fileMetaExtraLabels';
import { FileRelationLinks } from './EncyclopediaSourceLinks';
import { getFileImportedBy, getFileImports } from './fileImportGraph';
import { isOverLineLimit, MAX_SOURCE_FILE_LINES, overLineLimitLabel } from './fileLineLimits';
import type { TabType } from './EncyclopediaTypes';

interface FileDetailPanelProps {
  file: EncyclopediaFileEntry | null;
  onOpenTab?: (tab: TabType) => void;
  onOpenFile?: (path: string) => void;
}

function tabLabel(tab: TabType, e: Translations['encyclopedia']): string {
  const map: Partial<Record<TabType, string>> = {
    towers: e.towers,
    enemies: e.enemies,
    maps: e.maps,
    difficulty: e.difficultyTab,
    effects: e.effectsTabFull,
    skills: e.skillsTab,
    icons: e.iconsTab,
    files: e.filesTab,
    stats: e.statsTab,
  };
  return map[tab] ?? tab;
}

export function FileDetailPanel({ file, onOpenTab, onOpenFile }: FileDetailPanelProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;

  if (!file) {
    return (
      <DetailEmptyState
        icon={<FolderIcon className="h-7 w-7 text-[var(--arc-ink-3)]" />}
        message={<>{e.fileDetailSelectHintLine1}<br />{e.fileDetailSelectHintLine2}</>}
      />
    );
  }

  return (
    <motion.div
      key={file.id}
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin  scrollbar-track-transparent"
    >
      <DetailSurface className="relative flex h-36 shrink-0 items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[var(--arc-deck-2)]   " />
        <DocumentIcon className="relative z-10 h-16 w-16 text-[var(--arc-caution)]" />
      </DetailSurface>

      <div className="space-y-1">
        <h3 className="arc-title text-base font-semibold tracking-wide text-[var(--arc-ink)]">{file.name}</h3>
        <p className="font-mono text-[11px] leading-relaxed text-[var(--arc-ink-2)]">{file.path}</p>
      </div>

      {isOverLineLimit(file.lineCount) && (
        <DetailBlock className="flex items-start gap-2 border-[var(--cn-line-soft)] bg-[var(--arc-deck-2)] px-3.5 py-3">
          <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--arc-alert)]" />
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-alert)]">{e.fileDetailOverLimitTitle}</p>
            <p className="mt-1 text-[10px] font-medium leading-relaxed text-[var(--arc-alert)]">
              {overLineLimitLabel(file.lineCount)}{e.fileDetailOverLimitSuggest.replace('{max}', String(MAX_SOURCE_FILE_LINES))}
            </p>
          </div>
        </DetailBlock>
      )}

      <DetailBlock className="p-3.5">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.fileDetailFolder}</p>
        <p className="font-mono text-xs text-[var(--arc-ink-2)]">{file.folder}</p>
      </DetailBlock>

      <DetailBlock className="p-3.5">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.fileDetailCategory}</p>
        <SceneFilterChip active accent="amber" onClick={() => {}} disabled size="sm" className="pointer-events-none normal-case tracking-[0.08em]">
          {getFileCategoryLabel(e, file.category)}
        </SceneFilterChip>
      </DetailBlock>

      <DetailBlock className="p-3.5">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.fileDetailDescription}</p>
        <p className="text-xs font-medium leading-relaxed text-[var(--arc-ink-2)]">
          {resolveFileDescription(e, file.path, '') ||
            getInferredFileDescription(e, file.category, file.folder, file.format)}
        </p>
      </DetailBlock>

      <div className="grid grid-cols-2 gap-2">
        <DetailBlock className="p-3.5">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.fileDetailFormat}</p>
          <p className="text-sm font-semibold uppercase text-[var(--arc-ink)]">{file.format}</p>
        </DetailBlock>
        <DetailBlock className="p-3.5">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.fileDetailLineCount}</p>
          <p className={`font-mono text-sm font-semibold ${isOverLineLimit(file.lineCount) ? 'text-[var(--arc-alert)]' : 'text-[var(--arc-reach)]'}`}>
            {formatLineCount(file.lineCount)}
          </p>
        </DetailBlock>
      </div>

      <DetailBlock className="p-3.5">
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{e.fileDetailExtension}</p>
        <p className="font-mono text-sm font-semibold text-[var(--arc-ink-2)]">{file.extension || '—'}</p>
      </DetailBlock>

      <FileRelationLinks
        title={e.fileDetailImports}
        paths={getFileImports(file.path)}
        onOpenFile={onOpenFile}
        emptyHint={e.fileDetailImportsEmpty}
      />

      <FileRelationLinks
        title={e.fileDetailImportedBy}
        paths={getFileImportedBy(file.path)}
        onOpenFile={onOpenFile}
        emptyHint={e.fileDetailImportedByEmpty}
      />

      {file.relatedTab && onOpenTab && (
        <SceneFilterChip
          active={false}
          accent="sky"
          onClick={() => onOpenTab(file.relatedTab!)}
          className="flex w-full items-center justify-center gap-2 py-3 normal-case tracking-[0.08em]"
        >
          <TargetIcon className="h-3.5 w-3.5" />
          {e.fileDetailGoToTab.replace('{tab}', tabLabel(file.relatedTab, e))}
        </SceneFilterChip>
      )}
    </motion.div>
  );
}
