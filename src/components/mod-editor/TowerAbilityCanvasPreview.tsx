/**
 * Mod 塔 · 特殊效果動畫預覽（複用 TowerShootPreview）
 */
import type { CustomTowerData } from '@/types/game';
import TowerShootPreview from '@/components/ui/TowerShootPreview';
import { resolveTowerPreviewEffects } from './towerEffectConfig';

export { towerHasEffectPreview } from './towerEffectConfig';

interface TowerAbilityCanvasPreviewProps {
  tower: CustomTowerData;
  className?: string;
}

export function TowerAbilityCanvasPreview({ tower, className = '' }: TowerAbilityCanvasPreviewProps) {
  const fx = resolveTowerPreviewEffects(tower);

  return (
    <div
      className={`overflow-hidden border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] ${className}`}
    >
      <TowerShootPreview
        custom={{
          modelType: tower.modelType || 'basic',
          color: tower.color,
          highlightColor: tower.highlightColor,
          projectileColor: tower.projectileColor || tower.color,
          projectileSize: tower.projectileSize,
          damage: tower.damage,
          fireRate: tower.fireRate,
          splash: fx.splash,
          splashRadius: tower.splashRadius,
          slowEffect: fx.slowEffect,
          poisonEffect: fx.poisonEffect,
          lightningEffect: fx.lightningEffect,
          chainCount: fx.chainCount,
          laserEffect: fx.laserEffect,
          flameEffect: fx.flameEffect,
          windEffect: fx.windEffect,
          moneyGeneration: fx.moneyGeneration,
        }}
        width={320}
        height={96}
      />
    </div>
  );
}
