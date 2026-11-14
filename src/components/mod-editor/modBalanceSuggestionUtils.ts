/**
 * Mod 平衡建議 · 分類與 UI 輔助
 */
import type { Translations } from '@/i18n';

export type BalanceSuggestionCategory = 'difficulty' | 'economy' | 'waves' | 'counters' | 'general';

export interface BalanceSuggestionItem {
  category: BalanceSuggestionCategory;
  text: string;
}

type BalMsg = Translations['modEditorExt'];

const CATEGORY_ORDER: BalanceSuggestionCategory[] = [
  'difficulty',
  'economy',
  'waves',
  'counters',
  'general',
];

export function groupBalanceSuggestions(
  items: BalanceSuggestionItem[],
): { category: BalanceSuggestionCategory; label: string; items: string[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: '',
    items: items.filter((i) => i.category === category).map((i) => i.text),
  })).filter((g) => g.items.length > 0);
}

function balanceCategoryLabel(
  category: BalanceSuggestionCategory,
  m: BalMsg,
): string {
  switch (category) {
    case 'difficulty': return m.balCatDifficulty;
    case 'economy': return m.balCatEconomy;
    case 'waves': return m.balCatWaves;
    case 'counters': return m.balCatCounters;
    default: return m.balCatGeneral;
  }
}

export function attachCategoryLabels(
  groups: ReturnType<typeof groupBalanceSuggestions>,
  m: BalMsg,
) {
  return groups.map((g) => ({
    ...g,
    label: balanceCategoryLabel(g.category, m),
  }));
}
