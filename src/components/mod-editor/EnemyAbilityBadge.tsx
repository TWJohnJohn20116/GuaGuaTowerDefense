/**
 * 敵人能力徽章（SVG，無 emoji）
 *
 * HARDLINE：方角、1px 線、mono 10px，底色下沉一階，不加陰影也不加第二個主色。
 */
import { getAbilityDef } from './enemyAbilityConfig';
import { useTranslation } from '@/i18n';
import { useEnemyAbilityLabels, getEnemyAbilityDisplayName } from './enemyAbilityLabels';

interface EnemyAbilityBadgeProps {
  abilityId?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function EnemyAbilityBadge({ abilityId, size = 'sm', className = '' }: EnemyAbilityBadgeProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const labels = useEnemyAbilityLabels();
  const name = getEnemyAbilityDisplayName(abilityId, labels, m);
  const def = getAbilityDef(abilityId, m);

  if (!abilityId || !name) return null;

  const box = size === 'sm' ? 'gap-1 px-1.5 py-[2px] text-[9.5px]' : 'gap-1.5 px-2 py-1 text-[10.5px]';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <span
      className={`inline-flex items-center border border-[var(--arc-line-strong)] bg-[var(--arc-void-2)] font-mono leading-none tracking-[0.02em] text-[var(--arc-ink-2)] ${box} ${className}`}
    >
      {def && (
        <span className={`flex flex-shrink-0 items-center text-[var(--arc-ink-3)] ${iconSize}`}>
          {def.icon}
        </span>
      )}
      {name}
    </span>
  );
}
