/**
 * 皮膚工坊 · 模型套裝卡（Deck + Segments，無漸層）
 */
import TowerPreview from '@/components/ui/TowerPreview';
import { StarIcon, CheckIcon } from '@/components/ui/Icons';
import { Deck, Segments, Num } from '@/components/hl';
import type { SkinModelSetSummary } from './skinModelSets';
import { getPreviewTower } from './skinShared';
import { useTranslation } from '@/i18n';

interface SkinSetCardProps {
  summary: SkinModelSetSummary;
  selected: boolean;
  favorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export function SkinSetCard({
  summary,
  selected,
  favorite,
  onSelect,
  onToggleFavorite,
}: SkinSetCardProps) {
  const { t } = useTranslation();
  const previewSkin = summary.skins[0];
  const previewTower = previewSkin ? getPreviewTower(previewSkin) : 'basic';
  const complete = summary.unlockedCount >= summary.totalCount && summary.totalCount > 0;

  return (
    <Deck
      active={selected}
      className={[
        'group relative flex h-full w-full flex-col gap-3 overflow-hidden p-3.5 text-left',
        'transition-colors duration-150',
        selected ? '' : 'hover:border-[var(--hl-line-hot)]',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={summary.name}
        className="absolute inset-0 z-10 cursor-pointer"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="hl-label-hot font-mono text-[10px] uppercase tracking-[0.08em]">
            {summary.name}
          </span>
          <span className="text-[11px] leading-relaxed text-[var(--hl-ink-3)]">
            {summary.description}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={favorite ? t.skins.favorited : t.skins.addFavorite}
          className={[
            'z-20 flex h-6 w-6 shrink-0 items-center justify-center border bg-[var(--hl-void)] transition-colors duration-150',
            favorite
              ? 'border-[var(--hl-caution)] text-[var(--hl-caution)]'
              : 'border-[var(--hl-line)] text-[var(--hl-ink-4)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink-2)]',
          ].join(' ')}
        >
          <StarIcon className="h-3 w-3" />
        </button>
      </div>

      {previewSkin && (
        <div className="flex h-24 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
          <div className="scale-[1.3]">
            <TowerPreview
              towerId={previewTower}
              color={previewSkin.visuals.color}
              highlightColor={previewSkin.visuals.highlightColor}
              size={56}
              animMode="idle"
              level={3}
              skinModelSetId={summary.id}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Num
            value={`${summary.unlockedCount}/${summary.totalCount}`}
            size="sm"
            tone="muted"
          />
          {complete && (
            <span className="flex items-center gap-1 text-[var(--hl-vital)]">
              <CheckIcon className="h-3 w-3" />
              <span className="hl-label text-[var(--hl-vital)]">
                {t.skins.headerStats.collectionProgress}
              </span>
            </span>
          )}
        </div>
        <Segments total={summary.totalCount} filled={summary.unlockedCount} size="sm" />
      </div>
    </Deck>
  );
}

export default SkinSetCard;
