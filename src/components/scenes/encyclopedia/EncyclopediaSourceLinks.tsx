/**
 * 圖鑑 · 資料來源檔案連結區塊（反向連結到檔案庫）
 */

import { DocumentIcon, FolderIcon } from '@/components/ui/Icons';
import { DetailBlock } from '@/components/ui/SceneDetailParts';
import { SceneFilterChip } from '@/components/ui/SceneBrowseParts';
import { getEncyclopediaFileById } from './encyclopediaFileRegistry';
import { getEncyclopediaSourceFiles, type EncyclopediaDataTab } from './encyclopediaSourceMap';
import { useTranslation } from '@/i18n';

interface EncyclopediaSourceLinksProps {
  tab: EncyclopediaDataTab;
  itemId?: string;
  onOpenFile: (path: string) => void;
}

export function EncyclopediaSourceLinks({ tab, itemId, onOpenFile }: EncyclopediaSourceLinksProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const paths = getEncyclopediaSourceFiles(tab, itemId);
  const entries = paths
    .map((p) => getEncyclopediaFileById(p))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  if (entries.length === 0) return null;

  return (
    <DetailBlock className="p-3.5">
      <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
        {e.sourceLinksTitle}
      </p>
      <div className="flex flex-col gap-1.5">
        {entries.map((file) => (
          <SceneFilterChip
            key={file.path}
            active={false}
            accent="sky"
            size="sm"
            onClick={() => onOpenFile(file.path)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left normal-case tracking-normal"
          >
            <DocumentIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-reach)]" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-semibold text-[var(--hl-ink)]">{file.name}</span>
              <span className="block truncate font-mono text-[10px] text-[var(--hl-ink-4)]">{file.path}</span>
            </span>
          </SceneFilterChip>
        ))}
      </div>
      <p className="mt-2 text-[10px] font-medium text-[var(--hl-ink-4)]">
        {e.sourceLinksHint}
      </p>
    </DetailBlock>
  );
}

interface FileRelationLinksProps {
  title: string;
  paths: string[];
  onOpenFile?: (path: string) => void;
  emptyHint?: string;
  maxItems?: number;
}

/** 檔案詳情中的引用／被引用列表 */
export function FileRelationLinks({
  title,
  paths,
  onOpenFile,
  emptyHint,
  maxItems = 12,
}: FileRelationLinksProps) {
  const { t } = useTranslation();
  const hint = emptyHint ?? t.common.none;
  const visible = paths.slice(0, maxItems);
  const overflow = paths.length - visible.length;

  return (
    <DetailBlock className="p-3.5">
      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">{title}</p>
      {visible.length === 0 ? (
        <p className="text-[10px] font-medium text-[var(--hl-ink-4)]">{hint}</p>
      ) : (
        <div className="flex flex-col gap-1">
          {visible.map((filePath) => {
            const file = getEncyclopediaFileById(filePath);
            const label = file?.name ?? filePath.split('/').pop() ?? filePath;
            return (
              <button
                key={filePath}
                type="button"
                onClick={() => onOpenFile?.(filePath)}
                disabled={!onOpenFile}
                className="flex items-center gap-1.5  px-2 py-1.5 text-left transition-colors hover:bg-[var(--hl-deck-2)] disabled:cursor-default disabled:hover:bg-transparent"
              >
                <FolderIcon className="h-3 w-3 shrink-0 text-[var(--hl-ink-4)]" />
                <span className="truncate font-mono text-[10px] text-[var(--hl-ink-3)]">{label}</span>
              </button>
            );
          })}
          {overflow > 0 && (
            <p className="px-2 text-[10px] font-medium text-[var(--hl-ink-4)]">另有 {overflow} 個檔案…</p>
          )}
        </div>
      )}
    </DetailBlock>
  );
}
