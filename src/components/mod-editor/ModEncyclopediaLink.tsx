/**
 * Mod 編輯器 · 跳轉內建圖鑑說明
 */
import { TOWER_DATA, ENEMY_DATA } from '@/data/gameData';
import { useGameStore } from '@/store/gameStore';
import { OpenBookIcon } from '@/components/ui/Icons';
import { Btn } from '@/components/hl';

import { useTranslation } from '@/i18n';

interface EncyclopediaLinkButtonProps {
  tab: 'towers' | 'enemies';
  itemId?: string;
  label?: string;
  className?: string;
}

function EncyclopediaLinkButton({
  tab,
  itemId,
  label,
  className = '',
}: EncyclopediaLinkButtonProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const displayLabel = label ?? m.ecLinkView;
  const openEncyclopedia = useGameStore((s) => s.openEncyclopedia);

  if (!itemId) return null;
  const exists = tab === 'towers'
    ? !!TOWER_DATA[itemId as keyof typeof TOWER_DATA]
    : !!ENEMY_DATA[itemId as keyof typeof ENEMY_DATA];
  if (!exists) return null;

  return (
    <Btn
      size="sm"
      variant="line"
      onClick={() => openEncyclopedia({ tab, itemId })}
      icon={<OpenBookIcon className="h-3 w-3" />}
      className={className}
    >
      {displayLabel}
    </Btn>
  );
}

/** 依塔 modelType 對應內建圖鑑 */
export function TowerEncyclopediaLink({ modelType, className }: { modelType?: string; className?: string }) {
  return (
    <EncyclopediaLinkButton
      tab="towers"
      itemId={modelType || 'basic'}
      className={className}
    />
  );
}

/** 依敵人 ability 找內建圖鑑對照 */
export function AbilityEncyclopediaLink({ ability, className }: { ability?: string; className?: string }) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  if (!ability) return null;
  const match = Object.entries(ENEMY_DATA).find(([, d]) => d.ability === ability);
  if (!match) return null;
  return <EncyclopediaLinkButton tab="enemies" itemId={match[0]} label={m.ecLinkAbility} className={className} />;
}

/** 依敵人 modelType 對應內建圖鑑 */
export function EnemyEncyclopediaLink({ modelType, className }: { modelType?: string; className?: string }) {
  const id = modelType && ENEMY_DATA[modelType as keyof typeof ENEMY_DATA] ? modelType : 'normal';
  return (
    <EncyclopediaLinkButton
      tab="enemies"
      itemId={id}
      className={className}
    />
  );
}
