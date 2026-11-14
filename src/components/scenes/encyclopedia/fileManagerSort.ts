/**
 * 圖鑑 · 檔案庫列表排序
 */

import { getFolderLineTotal } from './encyclopediaFileRegistry';
import type { FileManagerRow } from './srcFolderTree';

export type FileSortColumn = 'name' | 'type' | 'lines' | 'path';
export type FileSortDirection = 'asc' | 'desc';

export interface FileSortState {
  column: FileSortColumn;
  direction: FileSortDirection;
}

export const DEFAULT_FILE_SORT: FileSortState = { column: 'name', direction: 'asc' };

function sortValue(row: FileManagerRow, column: FileSortColumn): string | number {
  if (row.kind === 'parent') return '';
  if (column === 'name') {
    return row.kind === 'folder' ? row.label : row.file.name;
  }
  if (column === 'type') {
    return row.kind === 'folder' ? '__folder__' : row.file.extension || row.file.format;
  }
  if (column === 'lines') {
    return row.kind === 'folder' ? getFolderLineTotal(row.path) : row.file.lineCount;
  }
  return row.kind === 'folder' ? row.path : row.file.path;
}

function compareRows(
  a: FileManagerRow,
  b: FileManagerRow,
  column: FileSortColumn,
  direction: FileSortDirection,
): number {
  const va = sortValue(a, column);
  const vb = sortValue(b, column);
  let cmp = 0;

  if (typeof va === 'number' && typeof vb === 'number') {
    cmp = va - vb;
  } else {
    cmp = String(va).localeCompare(String(vb), 'en', { numeric: true, sensitivity: 'base' });
  }

  return direction === 'asc' ? cmp : -cmp;
}

function sortGroup(rows: FileManagerRow[], sort: FileSortState): FileManagerRow[] {
  return [...rows].sort((a, b) => compareRows(a, b, sort.column, sort.direction));
}

/** 上層固定最前；資料夾與檔案分組後各自排序 */
export function sortFileManagerRows(rows: FileManagerRow[], sort: FileSortState): FileManagerRow[] {
  const parents = rows.filter((r) => r.kind === 'parent');
  const folders = rows.filter((r) => r.kind === 'folder');
  const files = rows.filter((r) => r.kind === 'file');

  return [...parents, ...sortGroup(folders, sort), ...sortGroup(files, sort)];
}

export function toggleFileSort(current: FileSortState, column: FileSortColumn): FileSortState {
  if (current.column === column) {
    return { column, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { column, direction: 'asc' };
}
