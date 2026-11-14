/** 升級路線標籤：把 A/B 填進翻譯模板。 */
export function formatUpgradePathTag(pathKey: 'A' | 'B', template: string): string {
  return template.replace('{path}', pathKey);
}

/** 已選路線後的面板提示：未選則不顯示。 */
export function formatCurrentPathCaption(
  pathKey: 'A' | 'B' | null | undefined,
  currentPathLabel: string,
  pathTagTemplate: string,
  branchName?: string,
): string | null {
  if (pathKey !== 'A' && pathKey !== 'B') return null;
  const tag = formatUpgradePathTag(pathKey, pathTagTemplate);
  const trimmed = branchName?.trim();
  if (trimmed) return `${currentPathLabel} · ${tag} · ${trimmed}`;
  return `${currentPathLabel} · ${tag}`;
}
