/**
 * 圖鑑 · 原始碼行數上限（專案規則：單檔 ≤ 888 行）
 */

export const MAX_SOURCE_FILE_LINES = 888;

export function isOverLineLimit(lineCount: number): boolean {
  return lineCount > MAX_SOURCE_FILE_LINES;
}

export function overLineLimitLabel(lineCount: number): string {
  return `超過 ${MAX_SOURCE_FILE_LINES} 行（目前 ${lineCount.toLocaleString('zh-TW')} 行）`;
}
