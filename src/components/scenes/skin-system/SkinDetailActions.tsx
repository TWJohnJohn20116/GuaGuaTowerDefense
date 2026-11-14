/**
 * 皮膚詳情 · 裝備 / 收藏操作（HARDLINE Btn）
 *
 * 主行動只有一顆訊號色 Btn；取消裝備與收藏走 line。
 */
import type { TowerSkin } from '@/types/skin';
import type { TowerType } from '@/types/game';
import { TOWER_DATA } from '@/data/gameData';
import {
  CheckIcon,
  CrossIcon,
  LockIcon,
  PaletteIcon,
  StarIcon,
} from '@/components/ui/Icons';
import { Btn } from '@/components/hl';
import { ALL_TOWER_TYPES } from './skinShared';
import { useTranslation } from '@/i18n';

interface SkinEquipActionProps {
  skin: TowerSkin;
  isUnlocked: boolean;
  isEquipped: boolean;
  equippedSkins: Record<TowerType, string | null>;
  onEquip: (tower: TowerType, skinId: string | null) => void;
}

export function SkinEquipAction({
  skin,
  isUnlocked,
  isEquipped,
  equippedSkins,
  onEquip,
}: SkinEquipActionProps) {
  const { t } = useTranslation();
  const s = t.skins;

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center gap-2 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] py-3 text-[var(--hl-ink-3)]">
        <LockIcon className="h-3.5 w-3.5" />
        <span className="hl-label">{s.unlockToEquip}</span>
      </div>
    );
  }

  if (isEquipped && skin.towerType !== 'all') {
    return (
      <div className="flex items-center justify-center gap-2 border border-[var(--hl-signal-edge)] py-3 text-[var(--hl-signal)]">
        <CheckIcon className="h-3.5 w-3.5" />
        <span className="hl-label text-[var(--hl-signal)]">{s.currentlyEquipped}</span>
      </div>
    );
  }

  if (skin.towerType === 'all') {
    return (
      <div className="flex flex-col gap-2">
        <span className="hl-label">{s.universalPickTower}</span>
        <div className="grid grid-cols-5 gap-1.5">
          {ALL_TOWER_TYPES.map((tower) => {
            const towerData = TOWER_DATA[tower];
            const thisEquipped = equippedSkins[tower] === skin.id;
            return (
              <button
                key={tower}
                type="button"
                onClick={() => onEquip(tower, thisEquipped ? null : skin.id)}
                title={towerData?.name ?? tower}
                className={[
                  'flex flex-col items-center gap-1 border px-1 py-1.5 transition-colors duration-150',
                  thisEquipped
                    ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)] text-[var(--hl-signal)]'
                    : 'border-[var(--hl-line)] text-[var(--hl-ink-3)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink-2)]',
                ].join(' ')}
              >
                <span
                  className="h-4 w-4 border border-[var(--hl-line)]"
                  style={{ backgroundColor: towerData?.color || '#4a515b' }}
                />
                <span className="w-full truncate font-mono text-[9px] tabular-nums">
                  {thisEquipped ? '✓' : towerData?.name?.slice(0, 2) || tower}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const tower = skin.towerType as TowerType;

  return (
    <Btn
      variant={isEquipped ? 'line' : 'signal'}
      size="lg"
      block
      icon={isEquipped ? <CrossIcon className="h-3.5 w-3.5" /> : <PaletteIcon className="h-3.5 w-3.5" />}
      onClick={() => onEquip(tower, isEquipped ? null : skin.id)}
    >
      {isEquipped ? s.unequip : s.equip}
    </Btn>
  );
}

interface SkinFavoriteActionProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export function SkinFavoriteAction({ isFavorite, onToggle }: SkinFavoriteActionProps) {
  const { t } = useTranslation();
  const s = t.skins;
  return (
    <Btn
      variant="line"
      size="md"
      block
      icon={<StarIcon className="h-3.5 w-3.5" />}
      onClick={onToggle}
    >
      {isFavorite ? s.favorited : s.addFavorite}
    </Btn>
  );
}
