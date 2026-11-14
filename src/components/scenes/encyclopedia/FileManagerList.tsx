/**
 * 圖鑑 · 檔案管理員中央列表
 */

import { useMemo, useState, useEffect } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DocumentIcon,
  FolderIcon,
} from '@/components/ui/Icons';
import { SCENE_GLASS } from '@/components/ui/SceneWorkshopLayout';
import { SceneBrowseEmptyState } from '@/components/ui/SceneBrowseParts';
import { useTranslation } from '@/i18n';
import { formatLineCount, getFolderLineTotal } from './encyclopediaFileRegistry';
import { isOverLineLimit } from './fileLineLimits';
import { useFileManagerKeyboard } from './fileManagerKeyboard';
import {
  DEFAULT_FILE_SORT,
  sortFileManagerRows,
  toggleFileSort,
  type FileSortColumn,
  type FileSortState,
} from './fileManagerSort';
import { getBreadcrumb, type FileManagerRow } from './srcFolderTree';

const LIST_COLS =
  'grid w-full grid-cols-[minmax(0,1fr)_72px_64px_minmax(0,1fr)] gap-2 border-b border-[var(--cn-line-soft)] px-4 py-2.5 text-left transition-colors';
const HEADER_COLS =
  'grid grid-cols-[minmax(0,1fr)_72px_64px_minmax(0,1fr)] gap-2 border-b border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-ink-4)]';

export type { FileManagerRow };

interface FileManagerListProps {
  mode: 'browse' | 'search';
  currentPath: string;
  rows: FileManagerRow[];
  selectedId: string | null;
  searchTerm?: string;
  onNavigate: (path: string) => void;
  onSelectFile: (id: string) => void;
}

export function FileManagerList({
  mode,
  currentPath,
  rows,
  selectedId,
  searchTerm,
  onNavigate,
  onSelectFile,
}: FileManagerListProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const [sort, setSort] = useState<FileSortState>(DEFAULT_FILE_SORT);
  const [focusIndex, setFocusIndex] = useState(0);
  const sortedRows = useMemo(() => sortFileManagerRows(rows, sort), [rows, sort]);
  const crumbs = getBreadcrumb(currentPath);

  useEffect(() => {
    if (sortedRows.length === 0) {
      setFocusIndex(0);
      return;
    }
    if (selectedId) {
      const idx = sortedRows.findIndex((r) => r.kind === 'file' && r.file.id === selectedId);
      if (idx >= 0) setFocusIndex(idx);
      return;
    }
    setFocusIndex((prev) => Math.min(prev, sortedRows.length - 1));
  }, [selectedId, sortedRows]);

  const listRef = useFileManagerKeyboard({
    sortedRows,
    focusIndex,
    setFocusIndex,
    mode,
    currentPath,
    onNavigate,
    onSelectFile,
  });

  const handleSort = (column: FileSortColumn) => {
    setSort((prev) => toggleFileSort(prev, column));
  };

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${SCENE_GLASS.listShell}`}>
      {/* 位址列 / 麵包屑 */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--cn-line-soft)] px-4 py-2.5">
        {mode === 'search' ? (
          <span className="text-[11px] font-semibold text-[var(--arc-ink-2)]">
            {e.fileListSearchResult.replace('{term}', searchTerm ?? '')}
          </span>
        ) : (
          crumbs.map((crumb, i) => (
            <span key={crumb.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRightIcon className="h-3 w-3 text-[var(--arc-ink-3)]" />}
              <button
                type="button"
                onClick={() => onNavigate(crumb.path)}
                className={` px-1.5 py-0.5 text-[11px] font-semibold transition-colors ${
                  crumb.path === currentPath
                    ? 'bg-[var(--arc-deck-2)] text-[var(--arc-caution)]'
                    : 'text-[var(--arc-ink-3)] hover:bg-[var(--arc-deck-2)] hover:text-[var(--arc-ink)]'
                }`}
              >
                {crumb.label}
              </button>
            </span>
          ))
        )}
      </div>

      {/* 欄位標題（可點擊排序） */}
      <div className={HEADER_COLS}>
        <SortHeaderButton
          label={e.fileListColName}
          column="name"
          sort={sort}
          onSort={handleSort}
          sortAriaTemplate={e.fileListSortBy}
        />
        <SortHeaderButton
          label={e.fileListColType}
          column="type"
          sort={sort}
          onSort={handleSort}
          sortAriaTemplate={e.fileListSortBy}
        />
        <SortHeaderButton
          label={e.fileListColLines}
          column="lines"
          sort={sort}
          onSort={handleSort}
          align="justify-end"
          sortAriaTemplate={e.fileListSortBy}
        />
        <SortHeaderButton
          label={e.fileListColPath}
          column="path"
          sort={sort}
          onSort={handleSort}
          className="hidden sm:flex"
          sortAriaTemplate={e.fileListSortBy}
        />
      </div>

      {/* 列表 */}
      <div
        ref={listRef}
        tabIndex={0}
        role="listbox"
        aria-label={e.fileListAriaLabel}
        className="min-h-0 flex-1 overflow-y-auto outline-none scrollbar-thin"
      >
        {sortedRows.length === 0 ? (
          <SceneBrowseEmptyState
            variant="inline"
            icon={<FolderIcon className="h-8 w-8 text-[var(--arc-ink-4)]" />}
            message={e.fileListEmptyFolder}
          />
        ) : (
          sortedRows.map((row, index) => (
            <FileManagerRowItem
              key={row.kind === 'file' ? row.file.id : `${row.kind}-${row.path}`}
              row={row}
              index={index}
              focused={index === focusIndex}
              selected={row.kind === 'file' && row.file.id === selectedId}
              onNavigate={onNavigate}
              onSelectFile={onSelectFile}
              onFocusRow={() => setFocusIndex(index)}
            />
          ))
        )}
      </div>

      <div className="border-t border-[var(--cn-line-soft)] px-4 py-2 text-[10px] font-medium text-[var(--arc-ink-4)]">
        {e.fileListItemCount.replace('{count}', String(sortedRows.length))}
        {fileLineSum(sortedRows) > 0 && (
          <span className="text-[var(--arc-ink-3)]">{e.fileListLineSum.replace('{count}', formatLineCount(fileLineSum(sortedRows)))}</span>
        )}
        <span className="text-[var(--arc-ink-4)]">{e.fileListKeyboardHint}</span>
      </div>
    </div>
  );
}

function FileManagerRowItem({
  row,
  index,
  focused,
  selected,
  onNavigate,
  onSelectFile,
  onFocusRow,
}: {
  row: FileManagerRow;
  index: number;
  focused: boolean;
  selected: boolean;
  onNavigate: (path: string) => void;
  onSelectFile: (id: string) => void;
  onFocusRow: () => void;
}) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const focusRing = focused ? 'outline outline-1 -outline-offset-1 outline-[var(--arc-gold)]' : '';

  if (row.kind === 'parent') {
    return (
      <button
        type="button"
        data-focus-index={index}
        onFocus={onFocusRow}
        onClick={() => onNavigate(row.path)}
        className={`${LIST_COLS} hover:bg-[var(--arc-deck-2)] ${focusRing}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <FolderIcon className="h-4 w-4 shrink-0 text-[var(--arc-ink-4)]" />
          <span className="truncate text-[12px] font-medium text-[var(--arc-ink-3)]">..</span>
        </span>
        <span className="text-[10px] text-[var(--arc-ink-4)]">{e.fileListParentFolder}</span>
        <span className="text-right text-[10px] text-[var(--arc-ink-4)]">—</span>
        <span className="hidden truncate font-mono text-[10px] text-[var(--arc-ink-3)] sm:block">{row.label}</span>
      </button>
    );
  }

  if (row.kind === 'folder') {
    const lineTotal = getFolderLineTotal(row.path);
    return (
      <button
        type="button"
        data-focus-index={index}
        onFocus={onFocusRow}
        onDoubleClick={() => onNavigate(row.path)}
        onClick={() => onNavigate(row.path)}
        className={`${LIST_COLS} hover:bg-[var(--arc-deck-2)] ${focusRing}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <FolderIcon className="h-4 w-4 shrink-0 text-[var(--arc-caution)]" />
          <span className="truncate text-[12px] font-semibold text-[var(--arc-ink)]">{row.label}</span>
        </span>
        <span className="text-[10px] font-medium text-[var(--arc-ink-2)]">{e.fileListFolderLabel}</span>
        <span className="text-right font-mono text-[10px] text-[var(--arc-ink-4)]">{formatLineCount(lineTotal)}</span>
        <span className="hidden truncate font-mono text-[10px] text-[var(--arc-ink-4)] sm:block">{row.path}</span>
      </button>
    );
  }

  const { file } = row;
  const overLimit = isOverLineLimit(file.lineCount);
  return (
    <button
      type="button"
      data-focus-index={index}
      onFocus={onFocusRow}
      onClick={() => onSelectFile(file.id)}
      className={`${LIST_COLS} ${focusRing} ${
        selected ? 'bg-[var(--arc-deck-2)] text-[var(--arc-caution)]' : 'hover:bg-[var(--arc-deck-2)]'
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <DocumentIcon className={`h-4 w-4 shrink-0 ${selected ? 'text-[var(--arc-caution)]' : 'text-[var(--arc-ink-3)]'}`} />
        <span className="truncate text-[12px] font-medium text-[var(--arc-ink)]">{file.name}</span>
        {overLimit && (
          <span className="shrink-0  arc-chip px-1 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[var(--arc-alert)]">
            {e.fileListOverLimitBadge}
          </span>
        )}
      </span>
      <span className="truncate text-[10px] font-mono text-[var(--arc-ink-2)]">{file.extension || file.format}</span>
      <span className={`text-right font-mono text-[10px] ${
        overLimit
          ? 'font-bold text-[var(--arc-alert)]'
          : selected
            ? 'text-[var(--arc-caution)]'
            : 'text-[var(--arc-ink-3)]'
      }`}>
        {formatLineCount(file.lineCount)}
      </span>
      <span className="hidden truncate font-mono text-[10px] text-[var(--arc-ink-4)] sm:block">{file.path}</span>
    </button>
  );
}

function fileLineSum(rows: FileManagerRow[]): number {
  return rows.reduce((sum, row) => (row.kind === 'file' ? sum + row.file.lineCount : sum), 0);
}

function SortHeaderButton({
  label,
  column,
  sort,
  onSort,
  sortAriaTemplate,
  align = 'justify-start',
  className = '',
}: {
  label: string;
  column: FileSortColumn;
  sort: FileSortState;
  onSort: (column: FileSortColumn) => void;
  sortAriaTemplate: string;
  align?: 'justify-start' | 'justify-end';
  className?: string;
}) {
  const active = sort.column === column;

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={`flex items-center gap-0.5 transition-colors hover:text-[var(--arc-ink-2)] ${align} ${
        active ? 'text-[var(--arc-caution)]' : ''
      } ${className}`}
      aria-label={sortAriaTemplate.replace('{label}', label)}
      aria-pressed={active}
    >
      <span>{label}</span>
      {active &&
        (sort.direction === 'asc' ? (
          <ChevronUpIcon className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronDownIcon className="h-3 w-3 shrink-0" />
        ))}
    </button>
  );
}
