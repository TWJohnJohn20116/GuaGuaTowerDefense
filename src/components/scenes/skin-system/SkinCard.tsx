/**
 * 皮膚卡 · HARDLINE
 *
 * 一個 Deck：1px 線、方角、hover 只換線色。
 * 稀有度＝mono 10px 文字標籤 + 資料色；預覽框不發光、不漸層。
 */
import type React from 'react';
import type { TowerSkin } from '@/types/skin';
import { TOWER_DATA } from '@/data/gameData';
import type { TowerType } from '@/types/game';
import TowerPreview from '@/components/ui/TowerPreview';
import { CheckIcon, LockIcon, StarIcon } from '@/components/ui/Icons';
import { Deck } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { getPreviewTower, type SkinPreviewAnimMode } from './skinShared';
import { RarityLabel } from './skinRarityTone';

export interface SkinCardProps {
  skin: TowerSkin;
  selected: boolean;
  unlocked: boolean;
  equipped: boolean;
  favorite: boolean;
  previewAnimMode?: SkinPreviewAnimMode;
  onSelect: () => void;
  onToggleFavorite?: () => void;
}

function StatusSlot({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-void)]">
      {children}
    </span>
  );
}

function SkinCardFooter({
  unlocked,
  equipped,
  labels,
}: {
  unlocked: boolean;
  equipped: boolean;
  labels: { equipped: string; locked: string; owned: string };
}) {
  if (equipped && unlocked) {
    return (
      <span className="flex items-center gap-1.5 text-[var(--hl-signal)]">
        <CheckIcon className="h-3 w-3" />
        <span className="hl-label text-[var(--hl-signal)]">{labels.equipped}</span>
      </span>
    );
  }
  if (unlocked) {
    return (
      <span className="flex items-center gap-1.5 text-[var(--hl-vital)]">
        <CheckIcon className="h-3 w-3" />
        <span className="hl-label text-[var(--hl-vital)]">{labels.owned}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[var(--hl-ink-4)]">
      <LockIcon className="h-3 w-3" />
      <span className="hl-label">{labels.locked}</span>
    </span>
  );
}

export function SkinCard({
  skin,
  selected,
  unlocked,
  equipped,
  favorite,
  previewAnimMode = 'idle',
  onSelect,
  onToggleFavorite,
}: SkinCardProps) {
  const { t } = useTranslation();
  const sk = t.skins;
  const previewTower = getPreviewTower(skin);
  const towerLabel = skin.towerType === 'all'
    ? sk.detail.universalSkin
    : (TOWER_DATA[skin.towerType as TowerType]?.name || skin.towerType);
  const dimmed = !unlocked;

  return (
    <Deck
      active={selected}
      className={[
        'group relative flex h-full min-h-[172px] w-full flex-col overflow-hidden text-left',
        'transition-colors duration-150',
        selected ? '' : 'hover:border-[var(--hl-line-hot)]',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={skin.name}
        className="absolute inset-0 z-10 cursor-pointer"
      />

      {/* 預覽框：1px 線外框，無陰影無光暈 */}
      <div className="relative flex h-24 shrink-0 items-center justify-center overflow-hidden border-b border-[var(--hl-line)] bg-[var(--hl-void-2)]">
        <div className={dimmed ? 'opacity-40' : ''}>
          <TowerPreview
            towerId={previewTower}
            color={skin.visuals.color}
            highlightColor={skin.visuals.highlightColor}
            size={selected ? 60 : 54}
            animMode={selected && unlocked ? previewAnimMode : 'static'}
            level={3}
            skinModelSetId={skin.modelSet}
          />
        </div>

        <span className="absolute left-2 top-2 z-[2] border border-[var(--hl-line)] bg-[var(--hl-void)] px-1 py-0.5">
          <RarityLabel rarity={skin.rarity} />
        </span>

        <div className="absolute right-2 top-2 z-20 flex items-center gap-1">
          {onToggleFavorite && (
            <button
              type="button"
              aria-label={favorite ? sk.favorited : sk.addFavorite}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={[
                'flex h-5 w-5 items-center justify-center border bg-[var(--hl-void)] transition-colors duration-150',
                favorite
                  ? 'border-[var(--hl-caution)] text-[var(--hl-caution)]'
                  : 'border-[var(--hl-line)] text-[var(--hl-ink-4)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink-2)]',
              ].join(' ')}
            >
              <StarIcon className="h-2.5 w-2.5" />
            </button>
          )}
          {equipped && unlocked && (
            <StatusSlot>
              <CheckIcon className="h-2.5 w-2.5 text-[var(--hl-signal)]" />
            </StatusSlot>
          )}
          {!unlocked && (
            <StatusSlot>
              <LockIcon className="h-2.5 w-2.5 text-[var(--hl-ink-4)]" />
            </StatusSlot>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 px-3 py-2.5">
        <div className="min-w-0">
          <span className={`block truncate text-[13px] font-medium leading-tight ${
            dimmed ? 'text-[var(--hl-ink-2)]' : 'text-[var(--hl-ink)]'
          }`}>
            {skin.name}
          </span>
          <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]">
            {towerLabel}
          </span>
        </div>
        <SkinCardFooter
          unlocked={unlocked}
          equipped={equipped}
          labels={{
            equipped: sk.equipped,
            locked: sk.locked,
            owned: sk.unlocked,
          }}
        />
      </div>
    </Deck>
  );
}

export default SkinCard;
