/**
 * 圖鑑 · 檔案管理員鍵盤操作
 */

import { useCallback, useEffect, useRef } from 'react';
import { getParentFolder, type FileManagerRow } from './srcFolderTree';

interface UseFileManagerKeyboardOptions {
  sortedRows: FileManagerRow[];
  focusIndex: number;
  setFocusIndex: (index: number | ((prev: number) => number)) => void;
  mode: 'browse' | 'search';
  currentPath: string;
  onNavigate: (path: string) => void;
  onSelectFile: (id: string) => void;
}

export function useFileManagerKeyboard({
  sortedRows,
  focusIndex,
  setFocusIndex,
  mode,
  currentPath,
  onNavigate,
  onSelectFile,
}: UseFileManagerKeyboardOptions) {
  const listRef = useRef<HTMLDivElement>(null);

  const activateRow = useCallback(
    (row: FileManagerRow) => {
      if (row.kind === 'parent' || row.kind === 'folder') {
        onNavigate(row.path);
        return;
      }
      onSelectFile(row.file.id);
    },
    [onNavigate, onSelectFile],
  );

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (sortedRows.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIndex((prev) => Math.min(prev + 1, sortedRows.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const row = sortedRows[focusIndex];
        if (row) activateRow(row);
        return;
      }
      if (e.key === 'Backspace' && mode === 'browse' && currentPath !== 'src') {
        e.preventDefault();
        const parent = getParentFolder(currentPath);
        if (parent) onNavigate(parent);
      }
    };

    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [
    sortedRows,
    focusIndex,
    setFocusIndex,
    mode,
    currentPath,
    onNavigate,
    activateRow,
  ]);

  useEffect(() => {
    const rowEl = listRef.current?.querySelector(`[data-focus-index="${focusIndex}"]`);
    rowEl?.scrollIntoView({ block: 'nearest' });
  }, [focusIndex, sortedRows]);

  return listRef;
}
