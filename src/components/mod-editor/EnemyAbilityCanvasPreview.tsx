/**
 * Mod 敵人 · 能力狀態動畫預覽（複用 EnemyActionPreview）
 */
import type { CustomEnemyData } from '@/types/game';
import EnemyActionPreview from '@/components/ui/EnemyActionPreview';

interface EnemyAbilityCanvasPreviewProps {
  enemy: CustomEnemyData;
  className?: string;
}

export function EnemyAbilityCanvasPreview({ enemy, className = '' }: EnemyAbilityCanvasPreviewProps) {
  if (!enemy.ability) return null;

  return (
    <div
      className={`overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)] ${className}`}
    >
      <EnemyActionPreview
        custom={{
          color: enemy.color,
          speed: enemy.speed,
          health: enemy.health,
          size: enemy.size,
          ability: enemy.ability,
          modelType: enemy.modelType || 'normal',
        }}
        width={320}
        height={96}
      />
    </div>
  );
}
