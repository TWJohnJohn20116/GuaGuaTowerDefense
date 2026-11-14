/**
 * 皮膚預覽 · 三欄對比（預設 / 已裝備 / 選中）
 * 三格都是 1px 線 + 方角，選中那一格只換線色。
 */
import type { TowerSkin } from '@/types/skin';
import TowerPreview from '@/components/ui/TowerPreview';
import { getSkin } from '@/data/skinData';
import type { SkinPreviewAnimMode } from './skinShared';
import { getPreviewTower } from './skinShared';
import { useTranslation } from '@/i18n';

interface SkinComparePreviewProps {
  skin: TowerSkin;
  equippedSkinId: string | null;
  isUnlocked: boolean;
  previewLevel: 1 | 2 | 3 | 4 | 5;
  animMode: SkinPreviewAnimMode;
}

interface CompareColumnProps {
  label: string;
  active?: boolean;
  previewTower: ReturnType<typeof getPreviewTower>;
  previewLevel: 1 | 2 | 3 | 4 | 5;
  animMode: 'idle' | 'attack' | 'static';
  dimmed?: boolean;
  color?: string;
  highlightColor?: string;
  skinModelSetId?: string;
}

function CompareColumn({
  label,
  active = false,
  previewTower,
  previewLevel,
  animMode,
  dimmed,
  color,
  highlightColor,
  skinModelSetId,
}: CompareColumnProps) {
  return (
    <div
      className={[
        'flex flex-col items-center gap-1.5 border py-2.5',
        active
          ? 'border-[var(--arc-gold)]'
          : 'border-[var(--cn-line-soft)]',
        'bg-[var(--arc-void-2)]',
      ].join(' ')}
    >
      <span className="arc-label w-full max-w-[92px] truncate px-1 text-center">{label}</span>
      <div className={dimmed ? 'opacity-40' : ''}>
        <TowerPreview
          towerId={previewTower}
          size={52}
          level={previewLevel}
          animMode={animMode}
          color={color}
          highlightColor={highlightColor}
          skinModelSetId={skinModelSetId}
        />
      </div>
    </div>
  );
}

export function SkinComparePreview({
  skin,
  equippedSkinId,
  isUnlocked,
  previewLevel,
  animMode,
}: SkinComparePreviewProps) {
  const { t } = useTranslation();
  const s = t.skins;
  const previewTower = getPreviewTower(skin);
  const effectiveAnim = isUnlocked ? animMode : 'static';
  const equippedSkin = equippedSkinId ? getSkin(equippedSkinId) : null;

  return (
    <div className="grid grid-cols-3 gap-1.5">
      <CompareColumn
        label={s.defaultAppearance}
        previewTower={previewTower}
        previewLevel={previewLevel}
        animMode={effectiveAnim}
      />
      <CompareColumn
        label={equippedSkin ? equippedSkin.name : s.currentEquipped}
        previewTower={previewTower}
        previewLevel={previewLevel}
        animMode={effectiveAnim}
        color={equippedSkin?.visuals.color}
        highlightColor={equippedSkin?.visuals.highlightColor}
        skinModelSetId={equippedSkin?.modelSet}
      />
      <CompareColumn
        label={skin.name}
        active
        previewTower={previewTower}
        previewLevel={previewLevel}
        animMode={effectiveAnim}
        dimmed={!isUnlocked}
        color={skin.visuals.color}
        highlightColor={skin.visuals.highlightColor}
        skinModelSetId={skin.modelSet}
      />
    </div>
  );
}

export default SkinComparePreview;
