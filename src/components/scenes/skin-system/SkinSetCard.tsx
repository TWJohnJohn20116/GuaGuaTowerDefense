/**
 * 皮膚工坊 · 模型套裝卡（Deck + Segments，無漸層）
 */
import TowerPreview from '@/components/ui/TowerPreview';
import { StarIcon, CheckIcon } from '@/components/ui/Icons';
import { Deck, Segments, Num, IconBtn } from '@/components/hl';
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
        selected ? '' : 'hover:border-[var(--arc-line-hot)]',
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
          <span className="arc-label-hot font-mono text-[10px] uppercase tracking-[0.08em]">
            {summary.name}
          </span>
          <span className="text-[11px] leading-relaxed text-[var(--arc-ink-3)]">
            {summary.description}
          </span>
        </div>
        <IconBtn
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          label={favorite ? t.skins.favorited : t.skins.addFavorite}
          className={[
            'z-20 flex h-6 w-6 shrink-0 items-center justify-center border bg-[var(--arc-void)] transition-colors duration-150',
            favorite
              ? 'border-[var(--arc-caution)] text-[var(--arc-caution)]'
              : 'border-[var(--cn-line-soft)] text-[var(--arc-ink-4)] hover:border-[var(--arc-line-hot)] hover:text-[var(--arc-ink-2)]',
          ].join(' ')}
        >
          <StarIcon className="h-3 w-3" />
        </IconBtn>
      </div>

      {previewSkin && (
        <div className="flex h-24 items-center justify-center border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
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
            <span className="flex items-center gap-1 text-[var(--arc-vital)]">
              <CheckIcon className="h-3 w-3" />
              <span className="arc-label text-[var(--arc-vital)]">
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
