/**
 * 圖鑑／暫停圖鑑共用的鄰塔協同列表
 */

import TowerPreview from '@/components/ui/TowerPreview';
import { LinkIcon2 } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import type { TowerType } from '@/types/game';
import { getEncyclopediaSynergiesForTower } from '@/data/towerSynergyData';

export function TowerSynergyList({ towerType, compact = false }: { towerType: string; compact?: boolean }) {
  const { t } = useTranslation();
  const synergies = getEncyclopediaSynergiesForTower(towerType as TowerType);
  if (synergies.length === 0) return null;

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <div className={`flex items-center gap-1.5 font-extrabold uppercase tracking-[0.08em] text-[var(--arc-reach)] ${compact ? 'text-[10px]' : 'text-xs'}`}>
        <LinkIcon2 className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        {t.encyclopedia.synergyTitle}
      </div>
      <p className={`text-[var(--arc-ink-2)] ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{t.encyclopedia.synergyHint}</p>
      <div className={compact ? 'space-y-1.5' : 'grid gap-2 sm:grid-cols-2'}>
        {synergies.map((synergy) => (
          <div
            key={synergy.recipeId}
            className="flex items-center gap-2  arc-chip px-2.5 py-2"
          >
            <TowerPreview towerId={synergy.partnerType} size={compact ? 28 : 36} />
            <div className="min-w-0">
              <div className={`font-bold text-[var(--arc-ink)] ${compact ? 'text-[11px]' : 'text-sm'}`}>{synergy.name}</div>
              <div className="truncate text-[10px] text-[var(--arc-reach)]">{synergy.bonusLabel}</div>
              {!compact && (
                <div className="mt-0.5 text-[10px] leading-snug text-[var(--arc-ink-3)]">{synergy.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
