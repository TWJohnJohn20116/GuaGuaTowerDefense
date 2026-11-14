/**
 * 皮膚詳情（右側常駐欄）· HARDLINE
 *
 * 預覽 1px 線框 → 名稱／稀有度文字標籤 → 描述 → 屬性列 → 特效標籤 → 解鎖條件 → 底部操作。
 */
import type { TowerSkin } from '@/types/skin';
import type { TowerType } from '@/types/game';
import { SKIN_CATEGORY_CONFIG } from '@/types/skin';
import { TOWER_DATA } from '@/data/gameData';
import { getSkinModelSet } from '@/data/skins/skinModelLibrary';
import {
  CheckIcon,
  LockIcon,
  StarIcon,
  ShieldIcon,
  SparklesIcon,
} from '@/components/ui/Icons';
import { SegHead, Field, Empty } from '@/components/hl';
import { SkinPreviewBlock } from './SkinPreviewBlock';
import { SkinEquipAction, SkinFavoriteAction } from './SkinDetailActions';
import { SkinUnlockHint } from './SkinUnlockHint';
import { RarityLabel } from './skinRarityTone';
import type { SkinPreviewAnimMode } from './skinShared';
import type { SkinUnlockProgress } from './skinUnlockProgress';
import { useTranslation } from '@/i18n';

export interface SkinDetailPanelProps {
  skin: TowerSkin | null;
  isUnlocked: boolean;
  isEquipped: boolean;
  isFavorite: boolean;
  equippedSkins: Record<TowerType, string | null>;
  previewLevel: 1 | 2 | 3 | 4 | 5;
  previewAnimMode: SkinPreviewAnimMode;
  compareMode: boolean;
  unlockProgress: SkinUnlockProgress | null;
  equippedSkinId: string | null;
  onLevelChange: (lv: 1 | 2 | 3 | 4 | 5) => void;
  onAnimModeChange: (mode: SkinPreviewAnimMode) => void;
  onCompareModeChange: (enabled: boolean) => void;
  onToggleFavorite: () => void;
  onEquip: (tower: TowerType, skinId: string | null) => void;
}

export function SkinDetailPanel({
  skin,
  isUnlocked,
  isEquipped,
  isFavorite,
  equippedSkins,
  previewLevel,
  previewAnimMode,
  compareMode,
  unlockProgress,
  equippedSkinId,
  onLevelChange,
  onAnimModeChange,
  onCompareModeChange,
  onToggleFavorite,
  onEquip,
}: SkinDetailPanelProps) {
  const { t } = useTranslation();
  const sk = t.skins;
  const d = sk.detail;

  if (!skin) {
    return <Empty title={d.selectHintLine1} hint={d.selectHintLine2} />;
  }

  const category = SKIN_CATEGORY_CONFIG[skin.category];
  const modelSet = getSkinModelSet(skin.modelSet);
  const towerLabel = skin.towerType === 'all'
    ? d.universalSkin
    : (TOWER_DATA[skin.towerType as TowerType]?.name || skin.towerType);

  const effectTraits: string[] = [];
  if (skin.visuals.glowColor) effectTraits.push(d.effectGlow);
  if (skin.visuals.auraEffect) effectTraits.push(d.effectAura);
  if (skin.visuals.trailColor) effectTraits.push(d.effectTrail);
  if (skin.visuals.particleColor) effectTraits.push(d.effectParticle);
  if (skin.visuals.idleAnimation && skin.visuals.idleAnimation !== 'none') {
    effectTraits.push(d.effectIdleAnim);
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <SkinPreviewBlock
        skin={skin}
        equippedSkinId={equippedSkinId}
        isUnlocked={isUnlocked}
        previewLevel={previewLevel}
        animMode={previewAnimMode}
        compareMode={compareMode}
        onLevelChange={onLevelChange}
        onAnimModeChange={onAnimModeChange}
        onCompareModeChange={onCompareModeChange}
      />

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
            {skin.name}
          </h2>
          <RarityLabel rarity={skin.rarity} />
        </div>

        <p className="hl-sub">{skin.description}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-[var(--hl-ink-3)]">
            {category.label}
          </span>
          <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-[var(--hl-ink-3)]">
            {towerLabel}
          </span>
          {modelSet && (
            <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-[var(--hl-reach)]">
              {modelSet.name}
            </span>
          )}
          {isEquipped && isUnlocked && (
            <span className="flex items-center gap-1 border border-[var(--hl-signal-edge)] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-[var(--hl-signal)]">
              <CheckIcon className="h-2.5 w-2.5" />
              {sk.equipped}
            </span>
          )}
          {isFavorite && (
            <span className="flex items-center gap-1 border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-[var(--hl-caution)]">
              <StarIcon className="h-2.5 w-2.5" />
              {d.favoriteBadge}
            </span>
          )}
          {!isUnlocked && (
            <span className="flex items-center gap-1 border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-[var(--hl-ink-3)]">
              <LockIcon className="h-2.5 w-2.5" />
              {sk.locked}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SegHead
          label={d.skinProperties}
          right={<ShieldIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />}
        />
        <div className="flex flex-col">
          <Field label={d.rarity}>
            <RarityLabel rarity={skin.rarity} />
          </Field>
          <Field label={d.category}>
            <span className="font-mono text-[11px] text-[var(--hl-ink)]">{category.label}</span>
          </Field>
          <Field label={d.towerLabel}>
            <span className="font-mono text-[11px] text-[var(--hl-ink)]">{towerLabel}</span>
          </Field>
        </div>

        {effectTraits.length > 0 && (
          <>
            <SegHead
              label={d.visualEffects}
              right={<SparklesIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />}
            />
            <div className="flex flex-wrap gap-1.5">
              {effectTraits.map((trait) => (
                <span
                  key={trait}
                  className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-[var(--hl-ink-3)]"
                >
                  {trait}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {!isUnlocked && unlockProgress && <SkinUnlockHint progress={unlockProgress} />}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <SkinEquipAction
          skin={skin}
          isUnlocked={isUnlocked}
          isEquipped={isEquipped}
          equippedSkins={equippedSkins}
          onEquip={onEquip}
        />
        <SkinFavoriteAction isFavorite={isFavorite} onToggle={onToggleFavorite} />
      </div>
    </div>
  );
}

export default SkinDetailPanel;
