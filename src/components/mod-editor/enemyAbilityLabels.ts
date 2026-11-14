/**
 * 敵人能力標籤（對齊圖鑑 encyclopedia.abilities）
 */
import { useTranslation } from '@/i18n';
import type { Translations } from '@/i18n';
import { ENEMY_DATA } from '@/data/gameData';
import { getAbilityDef } from './enemyAbilityConfig';

export function useEnemyAbilityLabels() {
  const { t } = useTranslation();
  return t.encyclopedia.abilities;
}

export function getEnemyTypeDisplayName(
  type: string,
  abilityLabels: Record<string, string>,
): string {
  const data = ENEMY_DATA[type as keyof typeof ENEMY_DATA];
  if (data?.ability && abilityLabels[data.ability as keyof typeof abilityLabels]) {
    return abilityLabels[data.ability as keyof typeof abilityLabels];
  }
  return data?.name ?? type;
}

export function getEnemyAbilityDisplayName(
  abilityId: string | undefined,
  abilityLabels: Record<string, string>,
  m: Translations['modEditorExt'],
): string | null {
  if (!abilityId) return null;
  if (abilityLabels[abilityId as keyof typeof abilityLabels]) {
    return abilityLabels[abilityId as keyof typeof abilityLabels];
  }
  return getAbilityDef(abilityId, m)?.name ?? abilityId;
}
