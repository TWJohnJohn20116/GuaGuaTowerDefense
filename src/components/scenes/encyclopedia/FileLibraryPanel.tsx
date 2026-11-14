/**
 * 圖鑑 · 檔案庫分頁（檔案管理員風格）
 */

import { useEffect, useMemo, useState } from 'react';
import { SearchInput } from '@/components/ui/CustomInput';
import { SceneBrowseDetailAside, SceneBrowseToolbar } from '@/components/ui/SceneWorkshopLayout';
import { FolderIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import {
  ALL_ENCYCLOPEDIA_FILES,
  SRC_FILE_STATS,
  formatLineCount,
  getEncyclopediaFileById,
} from './encyclopediaFileRegistry';
import { isOverLineLimit } from './fileLineLimits';
import {
  buildBrowseRows,
  searchFiles,
  type FileManagerRow,
} from './srcFolderTree';
import { FileManagerTree } from './FileManagerTree';
import { FileManagerList } from './FileManagerList';
import { FileDetailPanel } from './FileDetailPanel';
import type { TabType } from './EncyclopediaTypes';

interface FileLibraryPanelProps {
  onOpenTab?: (tab: TabType) => void;
  focusFilePath?: string | null;
  onFocusConsumed?: () => void;
}

export function FileLibraryPanel({ onOpenTab, focusFilePath, onFocusConsumed }: FileLibraryPanelProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const [search, setSearch] = useState('');
  const [currentPath, setCurrentPath] = useState('src');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    if (!focusFilePath) return;
    const file = getEncyclopediaFileById(focusFilePath);
    if (file) {
      setSearch('');
      setCurrentPath(file.folder);
      setSelectedId(file.id);
    }
    onFocusConsumed?.();
  }, [focusFilePath, onFocusConsumed]);

  const openFile = (path: string) => {
    const file = getEncyclopediaFileById(path);
    if (!file) return;
    setSearch('');
    setCurrentPath(file.folder);
    setSelectedId(file.id);
  };

  const browseRows = useMemo(
    () => (isSearching ? [] : buildBrowseRows(currentPath)),
    [currentPath, isSearching],
  );

  const searchRows = useMemo((): FileManagerRow[] => {
    if (!isSearching) return [];
    return searchFiles(search).map((file) => ({ kind: 'file' as const, file }));
  }, [search]);

  const rows = isSearching ? searchRows : browseRows;
  const overLimitCount = useMemo(
    () => ALL_ENCYCLOPEDIA_FILES.filter((f) => isOverLineLimit(f.lineCount)).length,
    [],
  );

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return getEncyclopediaFileById(selectedId) ?? null;
  }, [selectedId]);

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedId(null);
      return;
    }
    const fileRows = rows.filter((r): r is Extract<FileManagerRow, { kind: 'file' }> => r.kind === 'file');
    if (fileRows.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !fileRows.some((r) => r.file.id === selectedId)) {
      setSelectedId(fileRows[0].file.id);
    }
  }, [rows, selectedId]);

  const navigate = (path: string) => {
    setSearch('');
    setCurrentPath(path);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <SceneBrowseToolbar className="py-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-md">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder={e.fileLibSearchPlaceholder}
              size="sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-[var(--hl-ink-2)]">
            <FolderIcon className="h-3.5 w-3.5 text-[var(--hl-caution)]" />
            <span>{SRC_FILE_STATS.root}</span>
            <span className="text-[var(--hl-ink-4)]">|</span>
            <span>{e.fileLibTotalFiles.replace('{count}', String(ALL_ENCYCLOPEDIA_FILES.length))}</span>
            <span className="text-[var(--hl-ink-4)]">|</span>
            <span>{e.fileLibTotalLines.replace('{count}', formatLineCount(SRC_FILE_STATS.totalLines))}</span>
            {overLimitCount > 0 && (
              <>
                <span className="text-[var(--hl-ink-4)]">|</span>
                <span className="text-[var(--hl-alarm)]">{e.fileLibOverLimitFiles.replace('{count}', String(overLimitCount))}</span>
              </>
            )}
          </div>
        </div>
      </SceneBrowseToolbar>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        {!isSearching && (
          <FileManagerTree currentPath={currentPath} onNavigate={navigate} />
        )}

        <FileManagerList
          mode={isSearching ? 'search' : 'browse'}
          currentPath={currentPath}
          rows={rows}
          selectedId={selectedId}
          searchTerm={search}
          onNavigate={navigate}
          onSelectFile={setSelectedId}
        />

        <SceneBrowseDetailAside className="min-h-0 lg:w-[300px] xl:w-[340px]">
          <FileDetailPanel file={selected} onOpenTab={onOpenTab} onOpenFile={openFile} />
        </SceneBrowseDetailAside>
      </div>
    </div>
  );
}
