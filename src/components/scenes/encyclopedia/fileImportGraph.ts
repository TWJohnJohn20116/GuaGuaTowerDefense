/**
 * 圖鑑 · 檔案 import 引用圖（由 manifest 建立）
 */

import srcFilePaths from './srcFileManifest.json';

interface ManifestEntry {
  path: string;
  lines: number;
  imports: string[];
}

const manifest = srcFilePaths as ManifestEntry[];

const importsMap = new Map<string, string[]>();
const importedByMap = new Map<string, string[]>();

for (const entry of manifest) {
  importsMap.set(entry.path, entry.imports ?? []);
  for (const target of entry.imports ?? []) {
    const list = importedByMap.get(target) ?? [];
    list.push(entry.path);
    importedByMap.set(target, list);
  }
}

for (const [, list] of importedByMap) {
  list.sort((a, b) => a.localeCompare(b, 'en'));
}

/** 此檔案 import 了哪些 src 檔案 */
export function getFileImports(filePath: string): string[] {
  return importsMap.get(filePath) ?? [];
}

/** 哪些 src 檔案 import 了此檔案 */
export function getFileImportedBy(filePath: string): string[] {
  return importedByMap.get(filePath) ?? [];
}
