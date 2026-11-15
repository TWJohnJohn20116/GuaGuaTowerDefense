/**
 * 本波生效中的戰術協議、鄰塔協同與干擾警示 HUD
 * HARDLINE：一排 1px 線的 mono 標籤，左緣 2px 資料色，不用圓角與模糊。
 */

import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { EmpIcon, LinkIcon2, SparklesIcon } from '@/components/ui/Icons';
import { countActiveSynergyKinds, previewPlacementSynergies, toTowerRef } from '@/data/towerSynergyData';
import { collectJammerAurasCached, listJammedTowerIds } from '@/data/jammerAura';
import { ENEMY_DATA } from '@/data/gameData';

const CHIP =
  'inline-flex items-center gap-1.5 rounded-[10px] border-[2px] border-[var(--cn-line)] border-l-[6px] bg-[var(--cn-card)] px-2.5 py-1 font-mono text-[9.5px] font-extrabold uppercase tracking-[0.06em] shadow-[0_3px_0_var(--cn-line)]';

export function ProtocolHud() {
  const { t } = useTranslation();
  const active = useGameStore((s) => s.activeProtocol);
  const discount = useGameStore((s) => s.protocolNextTowerDiscount);
  const towers = useGameStore((s) => s.towers);
  const enemies = useGameStore((s) => s.enemies);
  const selectedTowerType = useGameStore((s) => s.selectedTowerType);
  const hoverPoint = useGameStore((s) => s.hoverPoint);
  const activeMap = useGameStore((s) => s.activeMap);
  // 一次配置、多處重用（原本每次渲染要 map 兩次 toTowerRef）
  const towerRefs = towers.map(toTowerRef);
  const synergyKinds = countActiveSynergyKinds(towerRefs);
  const jammedCount = listJammedTowerIds(
    towers.map((tower) => ({ id: tower.id, col: tower.pos.x, row: tower.pos.y })),
    collectJammerAurasCached(enemies, ENEMY_DATA, Date.now()),
  ).length;

  // 自由制：能不能放看圓形淨空，不再查格子
  const hoverPlaceable = !!hoverPoint
    && isInsideBounds(activeMap, hoverPoint, DEFAULT_TOWER_RADIUS)
    && !isBlockedAt(activeMap, hoverPoint, DEFAULT_TOWER_RADIUS)
    && pathClearance(activeMap, hoverPoint) >= pathWidthOf(activeMap) / 2 + DEFAULT_TOWER_RADIUS
    && !towers.some((tw) => circlesOverlap(hoverPoint, DEFAULT_TOWER_RADIUS, tw.pos, tw.radius));
  const placementPreview = selectedTowerType && hoverPoint && hoverPlaceable
    ? previewPlacementSynergies(selectedTowerType, hoverPoint.x, hoverPoint.y, towerRefs)
    : [];

  if (!active && discount <= 0 && synergyKinds <= 0 && placementPreview.length === 0 && jammedCount <= 0) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-[104px] z-20 flex max-w-[min(92vw,720px)] -translate-x-1/2 flex-wrap justify-center gap-1">
      {active && (
        <span className={`${CHIP} border-l-[var(--arc-gold)] text-[var(--arc-gold)]`}>
          <SparklesIcon className="h-3 w-3" />
          {active.name}
          <span className="text-[var(--arc-ink-4)]">{t.game.tacticalProtocol.activeHud}</span>
        </span>
      )}
      {discount > 0 && (
        <span className={`${CHIP} border-l-[var(--arc-vital)] text-[var(--arc-vital)]`}>
          <SparklesIcon className="h-3 w-3" />
          {t.game.tacticalProtocol.discountHud.replace('{pct}', String(Math.round(discount * 100)))}
        </span>
      )}
      {synergyKinds > 0 && (
        <span className={`${CHIP} border-l-[var(--arc-reach)] text-[var(--arc-reach)]`}>
          <LinkIcon2 className="h-3 w-3" />
          {t.game.towerSynergy.hud.replace('{n}', String(synergyKinds))}
        </span>
      )}
      {jammedCount > 0 && (
        <span className={`${CHIP} border-l-[var(--arc-alert)] text-[var(--arc-alert)]`}>
          <EmpIcon className="h-3 w-3" />
          {t.game.jammedCountHud.replace('{n}', String(jammedCount))}
        </span>
      )}
      {placementPreview.map((preview) => (
        <span
          key={`${preview.recipeId}-${preview.partnerId}`}
          className={`${CHIP} border-l-[var(--arc-gold)] text-[var(--arc-ink-2)]`}
        >
          <LinkIcon2 className="h-3 w-3 text-[var(--arc-gold)]" />
          {t.game.towerSynergy.previewHud.replace('{name}', preview.name)}
        </span>
      ))}
    </div>
  );
}
