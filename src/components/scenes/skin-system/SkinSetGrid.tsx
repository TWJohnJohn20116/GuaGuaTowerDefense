/**
 * 皮膚工坊 · 模型套裝網格
 */
import type { SkinModelSetSummary } from './skinModelSets';
import { Empty } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { SkinSetCard } from './SkinSetCard';

interface SkinSetGridProps {
  sets: SkinModelSetSummary[];
  selectedSetId: string | null;
  favoriteSets: string[];
  onSelectSet: (setId: string) => void;
  onToggleSetFavorite: (setId: string) => void;
}

export function SkinSetGrid({
  sets,
  selectedSetId,
  favoriteSets,
  onSelectSet,
  onToggleSetFavorite,
}: SkinSetGridProps) {
  const { t } = useTranslation();
  if (sets.length === 0) {
    return <Empty title={t.skins.emptyNoSets} />;
  }

  const sorted = [...sets].sort((a, b) => {
    const aFav = favoriteSets.includes(a.id) ? 1 : 0;
    const bFav = favoriteSets.includes(b.id) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return a.name.localeCompare(b.name, 'zh-Hant');
  });

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {sorted.map((summary) => (
        <SkinSetCard
          key={summary.id}
          summary={summary}
          selected={selectedSetId === summary.id}
          favorite={favoriteSets.includes(summary.id)}
          onSelect={() => onSelectSet(summary.id)}
          onToggleFavorite={() => onToggleSetFavorite(summary.id)}
        />
      ))}
    </div>
  );
}

export default SkinSetGrid;
