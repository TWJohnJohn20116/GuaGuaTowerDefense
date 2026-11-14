// 更新日誌相關類型定義

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface NumberedListItem {
  number: number;
  text: string;
}

export interface ChangeItem {
  type: 'text' | 'table' | 'numbered-list';
  content: string | TableData | NumberedListItem[];
}

export interface ChangeSection {
  version: string;
  date: string;
  changes: { title: string; items: ChangeItem[] }[];
}

export interface ChangelogStats {
  totalVersions: number;
  totalChanges: number;
  majorUpdates: number;
  featureUpdates: number;
  bugFixes: number;
}
