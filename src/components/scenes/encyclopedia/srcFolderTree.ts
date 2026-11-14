/**
 * 圖鑑 · src 資料夾樹工具
 */

import {
  ALL_ENCYCLOPEDIA_FILES,
  type EncyclopediaFileEntry,
} from './encyclopediaFileRegistry';

export interface FolderTreeNode {
  path: string;
  name: string;
  children: FolderTreeNode[];
}

export type FileManagerRow =
  | { kind: 'parent'; path: string; label: string }
  | { kind: 'folder'; path: string; label: string }
  | { kind: 'file'; file: EncyclopediaFileEntry };

/** 收集 src 下所有資料夾路徑（含中間層） */
function getAllFolderPaths(): string[] {
  const dirs = new Set<string>(['src']);
  for (const file of ALL_ENCYCLOPEDIA_FILES) {
    let current = file.folder;
    dirs.add(current);
    while (current.includes('/')) {
      current = current.substring(0, current.lastIndexOf('/'));
      dirs.add(current);
    }
  }
  return [...dirs].sort((a, b) => a.localeCompare(b, 'en'));
}

export function buildFolderTree(): FolderTreeNode {
  const paths = getAllFolderPaths();
  const nodeMap = new Map<string, FolderTreeNode>();

  for (const path of paths) {
    const name = path === 'src' ? 'src' : path.split('/').pop() ?? path;
    nodeMap.set(path, { path, name, children: [] });
  }

  const root = nodeMap.get('src')!;
  for (const path of paths) {
    if (path === 'src') continue;
    const parentPath = path.substring(0, path.lastIndexOf('/'));
    const parent = nodeMap.get(parentPath);
    const node = nodeMap.get(path);
    if (parent && node) parent.children.push(node);
  }

  const sortTree = (node: FolderTreeNode) => {
    node.children.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    node.children.forEach(sortTree);
  };
  sortTree(root);
  return root;
}

/** 目前資料夾內的直接子資料夾 */
function getSubfolders(folderPath: string): string[] {
  const prefix = folderPath === 'src' ? 'src/' : `${folderPath}/`;
  const subs = new Set<string>();

  for (const path of getAllFolderPaths()) {
    if (!path.startsWith(prefix) || path === folderPath) continue;
    const rest = path.slice(prefix.length);
    if (!rest.includes('/')) subs.add(path);
  }

  return [...subs].sort((a, b) => a.localeCompare(b, 'en'));
}

/** 目前資料夾內的檔案（不含子資料夾） */
function getFilesInFolder(folderPath: string): EncyclopediaFileEntry[] {
  return ALL_ENCYCLOPEDIA_FILES
    .filter((f) => f.folder === folderPath)
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

/** 麵包屑路徑片段 */
export function getBreadcrumb(folderPath: string): { path: string; label: string }[] {
  if (folderPath === 'src') return [{ path: 'src', label: 'src' }];
  const parts = folderPath.replace(/^src\//, '').split('/');
  const crumbs: { path: string; label: string }[] = [{ path: 'src', label: 'src' }];
  let acc = 'src';
  for (const part of parts) {
    acc = `${acc}/${part}`;
    crumbs.push({ path: acc, label: part });
  }
  return crumbs;
}

export function getParentFolder(folderPath: string): string | null {
  if (folderPath === 'src') return null;
  return folderPath.substring(0, folderPath.lastIndexOf('/')) || 'src';
}

export function searchFiles(term: string): EncyclopediaFileEntry[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  return ALL_ENCYCLOPEDIA_FILES.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.path.toLowerCase().includes(q) ||
      f.extension.toLowerCase().includes(q),
  );
}

/** 組裝目前資料夾的列表列（上層 / 子資料夾 / 檔案） */
export function buildBrowseRows(currentPath: string): FileManagerRow[] {
  const rows: FileManagerRow[] = [];
  const parent = getParentFolder(currentPath);
  if (parent) {
    rows.push({ kind: 'parent', path: parent, label: parent });
  }

  for (const sub of getSubfolders(currentPath)) {
    rows.push({
      kind: 'folder',
      path: sub,
      label: sub.split('/').pop() ?? sub,
    });
  }

  for (const file of getFilesInFolder(currentPath)) {
    rows.push({ kind: 'file', file });
  }

  return rows;
}
