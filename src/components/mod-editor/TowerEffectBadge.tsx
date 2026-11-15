/**
 * 塔效果徽章（SVG，對齊敵人能力徽章）
 *
 * HARDLINE：方角、1px 線、mono 10px。狀態只用資料色（vital / alarm / caution / reach），
 * 不加底色塊、不加陰影，顏色面積只留在 1px 邊與文字上。
 */
import { useTranslation } from '@/i18n';
import {
  getTowerEffectIds,
  getTowerEffectStyle,
  getTowerEffectIcon,
  getTowerEffectShortLabel,
  type TowerEffectId,
} from './towerEffectConfig';

interface TowerEffectBadgeProps {
  effectId: TowerEffectId;
  size?: 'sm' | 'md';
  className?: string;
}

export function TowerEffectBadge({ effectId, size = 'sm', className = '' }: TowerEffectBadgeProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const label = getTowerEffectShortLabel(effectId, m);
  const style = getTowerEffectStyle(effectId);
  const box = size === 'sm' ? 'gap-1 px-1.5 py-[2px] text-[9.5px]' : 'gap-1.5 px-2 py-1 text-[10.5px]';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <span
      className={`inline-flex items-center border bg-[var(--arc-void-2)] font-mono leading-none tracking-[0.02em] ${box} ${style.border} ${style.text} ${className}`}
    >
      <span className={`flex flex-shrink-0 items-center ${iconSize}`}>
        {getTowerEffectIcon(effectId, iconSize)}
      </span>
      {label}
    </span>
  );
}

interface TowerEffectBadgeListProps {
  tower: import('@/types/game').CustomTowerData;
  size?: 'sm' | 'md';
  className?: string;
}

export function TowerEffectBadgeList({ tower, size = 'sm', className = '' }: TowerEffectBadgeListProps) {
  const ids = getTowerEffectIds(tower);
  if (ids.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {ids.map((id) => (
        <TowerEffectBadge key={id} effectId={id} size={size} />
      ))}
    </div>
  );
}
