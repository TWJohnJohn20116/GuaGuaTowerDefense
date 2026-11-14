/**
 * 圖鑑 · src 檔案目錄
 * 讀取 build/dev 前產生的 srcFileManifest.json（scripts/generate-src-file-manifest.mjs）
 */

import srcFilePaths from './srcFileManifest.json';
import { FILE_META } from './encyclopediaFileMeta';
import { FILE_META_EXTRA } from './encyclopediaFileMetaExtra';
import type { TabType } from './EncyclopediaTypes';

const MERGED_FILE_META = { ...FILE_META, ...FILE_META_EXTRA };

export type SrcFileCategory =
  | 'components'
  | 'data'
  | 'store'
  | 'hooks'
  | 'types'
  | 'services'
  | 'i18n'
  | 'root'
  | 'other';

type SrcFileFormat =
  | 'typescript'
  | 'tsx'
  | 'javascript'
  | 'jsx'
  | 'css'
  | 'json'
  | 'svg'
  | 'image'
  | 'markdown'
  | 'other';

export interface EncyclopediaFileEntry {
  id: string;
  path: string;
  name: string;
  folder: string;
  category: SrcFileCategory;
  description: string;
  relatedTab?: TabType;
  format: SrcFileFormat;
  extension: string;
  lineCount: number;
}

interface ManifestEntry {
  path: string;
  lines: number;
  imports?: string[];
}

const FILE_CATEGORY_LABELS: Record<SrcFileCategory, string> = {
  components: 'components',
  data: 'data',
  store: 'store',
  hooks: 'hooks',
  types: 'types',
  services: 'services',
  i18n: 'i18n',
  root: 'src 根目錄',
  other: '其他',
};

export const FILE_CATEGORY_ORDER: SrcFileCategory[] = [
  'components',
  'data',
  'store',
  'hooks',
  'types',
  'services',
  'i18n',
  'root',
  'other',
];

function inferFormat(ext: string): SrcFileFormat {
  switch (ext) {
    case 'ts': return 'typescript';
    case 'tsx': return 'tsx';
    case 'js': return 'javascript';
    case 'jsx': return 'jsx';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'svg': return 'svg';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'gif':
      return 'image';
    case 'md':
    case 'mdx':
      return 'markdown';
    default:
      return 'other';
  }
}

function inferCategory(path: string): SrcFileCategory {
  const rel = path.replace(/^src\//, '');
  const top = rel.split('/')[0];
  if (!rel.includes('/')) return 'root';
  if (top in FILE_CATEGORY_LABELS && top !== 'root' && top !== 'other') {
    return top as SrcFileCategory;
  }
  return 'other';
}

function inferDescription(path: string, category: SrcFileCategory, format: SrcFileFormat): string {
  const meta = MERGED_FILE_META[path];
  if (meta?.description) return meta.description;
  const folder = path.substring(0, path.lastIndexOf('/')) || 'src';
  return `${FILE_CATEGORY_LABELS[category]} · ${folder} · ${format.toUpperCase()} 檔案`;
}

function buildRegistry(): EncyclopediaFileEntry[] {
  return (srcFilePaths as ManifestEntry[])
    .map(({ path, lines }) => {
      const name = path.split('/').pop() ?? path;
      const folder = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : 'src';
      const extension = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
      const format = inferFormat(extension);
      const category = inferCategory(path);
      const meta = MERGED_FILE_META[path];

      return {
        id: path,
        path,
        name,
        folder,
        category,
        description: inferDescription(path, category, format),
        relatedTab: meta?.relatedTab,
        format,
        extension: extension ? `.${extension}` : '',
        lineCount: lines,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path, 'en'));
}

export const ALL_ENCYCLOPEDIA_FILES = buildRegistry();

export const SRC_FILE_STATS = {
  total: ALL_ENCYCLOPEDIA_FILES.length,
  totalLines: ALL_ENCYCLOPEDIA_FILES.reduce((sum, f) => sum + f.lineCount, 0),
  root: 'src',
};

/** 格式化行數顯示 */
export function formatLineCount(lines: number): string {
  return lines.toLocaleString('zh-TW');
}

/** 資料夾內（含子目錄）所有檔案行數加總 */
export function getFolderLineTotal(folderPath: string): number {
  const prefix = folderPath === 'src' ? 'src/' : `${folderPath}/`;
  return ALL_ENCYCLOPEDIA_FILES
    .filter((f) => f.path.startsWith(prefix))
    .reduce((sum, f) => sum + f.lineCount, 0);
}

export function filterEncyclopediaFiles(opts: {
  search?: string;
  category?: SrcFileCategory | 'all';
  folder?: string | 'all';
}): EncyclopediaFileEntry[] {
  const term = opts.search?.trim().toLowerCase() ?? '';
  return ALL_ENCYCLOPEDIA_FILES.filter((file) => {
    if (opts.category && opts.category !== 'all' && file.category !== opts.category) return false;
    if (opts.folder && opts.folder !== 'all' && file.folder !== opts.folder) return false;
    if (!term) return true;
    return (
      file.name.toLowerCase().includes(term) ||
      file.path.toLowerCase().includes(term) ||
      file.folder.toLowerCase().includes(term) ||
      file.description.toLowerCase().includes(term) ||
      file.extension.toLowerCase().includes(term)
    );
  });
}

export function getEncyclopediaFileById(id: string): EncyclopediaFileEntry | undefined {
  return ALL_ENCYCLOPEDIA_FILES.find((f) => f.id === id);
}

/** 取得不重複的資料夾路徑（供篩選） */
export function getSrcFolders(category?: SrcFileCategory | 'all'): string[] {
  const files = category && category !== 'all'
    ? ALL_ENCYCLOPEDIA_FILES.filter((f) => f.category === category)
    : ALL_ENCYCLOPEDIA_FILES;
  return [...new Set(files.map((f) => f.folder))].sort((a, b) => a.localeCompare(b, 'en'));
}
