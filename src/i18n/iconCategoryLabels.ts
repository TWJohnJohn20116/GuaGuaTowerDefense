import type { Translations } from '@/i18n';
import type { IconCategory } from '@/components/scenes/encyclopedia/gameIconRegistry';

type Enc = Translations['encyclopedia'];

const KEY_MAP: Record<IconCategory, keyof Enc> = {
  currency: 'iconCatCurrency',
  navigation: 'iconCatNavigation',
  gameState: 'iconCatGameState',
  combat: 'iconCatCombat',
  tools: 'iconCatTools',
  overlay: 'iconCatOverlay',
  settings: 'iconCatSettings',
  enemy: 'iconCatEnemy',
  effects: 'iconCatEffects',
  theme: 'iconCatTheme',
  achievement: 'iconCatAchievement',
  shapes: 'iconCatShapes',
  other: 'iconCatOther',
};

export function getIconCategoryLabel(enc: Enc, category: IconCategory): string {
  const val = enc[KEY_MAP[category]];
  return typeof val === 'string' ? val : category;
}
