/**
 * 皮膚工坊 · 皮膚卡網格
 */
import type { TowerSkin } from '@/types/skin';
import { Empty } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { SkinCard } from './SkinCard';
import type { SkinPreviewAnimMode } from './skinShared';

interface SkinGridProps {
  skins: TowerSkin[];
  selectedId: string | null;
  isUnlocked: (id: string) => boolean;
  isEquipped: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
  onSelect: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  previewAnimMode?: SkinPreviewAnimMode;
  emptyHint?: string;
}

export function SkinGrid({
  skins,
  selectedId,
  isUnlocked,
  isEquipped,
  isFavorite,
  onSelect,
  onToggleFavorite,
  previewAnimMode = 'idle',
  emptyHint,
}: SkinGridProps) {
  const { t } = useTranslation();
  const emptyMessage = emptyHint ?? t.skins.noSkins;

  if (skins.length === 0) {
    return <Empty title={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
      {skins.map((skin) => (
        <SkinCard
          key={skin.id}
          skin={skin}
          selected={selectedId === skin.id}
          unlocked={isUnlocked(skin.id)}
          equipped={isEquipped(skin.id)}
          favorite={isFavorite(skin.id)}
          previewAnimMode={selectedId === skin.id ? previewAnimMode : 'idle'}
          onSelect={() => onSelect(skin.id)}
          onToggleFavorite={onToggleFavorite
            ? () => onToggleFavorite(skin.id)
            : undefined}
        />
      ))}
    </div>
  );
}

export default SkinGrid;
