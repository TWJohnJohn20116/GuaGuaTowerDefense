const FALLBACK_MAX = '已滿級';

export function towerMaxLevelText(label?: string | null): string {
  const trimmed = label?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : FALLBACK_MAX;
}

/** 塔角標：滿級用翻譯，否則維持既有 Lv 數字。 */
export function formatTowerLevelBadge(input: {
  currentLevel: number;
  maxLevel: number;
  maxLabel?: string | null;
}): string {
  if (input.currentLevel >= input.maxLevel) {
    return towerMaxLevelText(input.maxLabel);
  }
  return `Lv${input.currentLevel}`;
}
