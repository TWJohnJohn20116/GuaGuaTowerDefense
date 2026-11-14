/**
 * 地圖側欄 · 難度篩選（HARDLINE Chip，不多選漸層）
 */
import { Chip } from '@/components/hl';
import { getPathDifficultyLabel } from './difficulty';
import { useTranslation } from '@/i18n';

interface DifficultyChipsProps {
  available: string[];
  activeFilters: Set<string>;
  onToggle: (difficulty: string) => void;
  onReset: () => void;
}

export function DifficultyChips({
  available,
  activeFilters,
  onToggle,
  onReset,
}: DifficultyChipsProps) {
  const { t } = useTranslation();

  if (available.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Chip active={activeFilters.size === 0} onClick={onReset}>
        {t.skins.all}
      </Chip>
      {available.map((diff) => (
        <Chip key={diff} active={activeFilters.has(diff)} onClick={() => onToggle(diff)}>
          {getPathDifficultyLabel(diff, t)}
        </Chip>
      ))}
    </div>
  );
}

export default DifficultyChips;
