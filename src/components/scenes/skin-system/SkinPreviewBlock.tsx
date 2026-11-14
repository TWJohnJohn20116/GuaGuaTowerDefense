/**
 * 皮膚詳情 · 大預覽（1px 線外框，不做陰影光暈）
 */
import type { TowerSkin } from '@/types/skin';
import TowerPreview from '@/components/ui/TowerPreview';
import { CheckIcon, LockIcon } from '@/components/ui/Icons';
import { getPreviewTower, type SkinPreviewAnimMode } from './skinShared';
import { useTranslation } from '@/i18n';
import { SkinPreviewControls } from './SkinPreviewControls';
import { SkinComparePreview } from './SkinComparePreview';

interface SkinPreviewBlockProps {
  skin: TowerSkin;
  equippedSkinId: string | null;
  isUnlocked: boolean;
  previewLevel: 1 | 2 | 3 | 4 | 5;
  animMode: SkinPreviewAnimMode;
  compareMode: boolean;
  onLevelChange: (lv: 1 | 2 | 3 | 4 | 5) => void;
  onAnimModeChange: (mode: SkinPreviewAnimMode) => void;
  onCompareModeChange: (enabled: boolean) => void;
}

export function SkinPreviewBlock({
  skin,
  equippedSkinId,
  isUnlocked,
  previewLevel,
  animMode,
  compareMode,
  onLevelChange,
  onAnimModeChange,
  onCompareModeChange,
}: SkinPreviewBlockProps) {
  const { t } = useTranslation();
  const previewTower = getPreviewTower(skin);
  const effectiveAnim = isUnlocked ? animMode : 'static';

  return (
    <div className="flex shrink-0 flex-col gap-2.5">
      {compareMode ? (
        <SkinComparePreview
          skin={skin}
          equippedSkinId={equippedSkinId}
          isUnlocked={isUnlocked}
          previewLevel={previewLevel}
          animMode={animMode}
        />
      ) : (
        <div className="relative flex h-44 items-center justify-center overflow-hidden border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
          <div className={`scale-[1.6] ${!isUnlocked ? 'opacity-40' : ''}`}>
            <TowerPreview
              towerId={previewTower}
              color={skin.visuals.color}
              highlightColor={skin.visuals.highlightColor}
              size={72}
              animMode={effectiveAnim}
              level={previewLevel}
              skinModelSetId={skin.modelSet}
            />
          </div>

          <span className="absolute left-2 top-2 arc-label">
            {skin.modelSet ? skin.modelSet : skin.category}
          </span>

          {isUnlocked ? (
            <span className="absolute right-2 top-2 flex items-center gap-1 text-[var(--arc-vital)]">
              <CheckIcon className="h-3 w-3" />
              <span className="arc-label text-[var(--arc-vital)]">{t.skins.unlocked}</span>
            </span>
          ) : (
            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void)]">
              <LockIcon className="h-2.5 w-2.5 text-[var(--arc-ink-4)]" />
            </span>
          )}
        </div>
      )}

      <SkinPreviewControls
        previewLevel={previewLevel}
        animMode={animMode}
        compareMode={compareMode}
        onLevelChange={onLevelChange}
        onAnimModeChange={onAnimModeChange}
        onCompareModeChange={onCompareModeChange}
      />
    </div>
  );
}

export default SkinPreviewBlock;
