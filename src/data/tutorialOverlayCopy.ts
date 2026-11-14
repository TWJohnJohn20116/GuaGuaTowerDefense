/** 教學／圖鑑步驟進度：把 {current} / {total} 填進翻譯模板。 */
export function formatStepProgress(template: string, current: number, total: number): string {
  return template.replaceAll('{current}', String(current)).replaceAll('{total}', String(total));
}
