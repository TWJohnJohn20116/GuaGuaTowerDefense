/**
 * LivePreview · 塔 / 敵人單體詳細預覽
 *
 * HARDLINE：畫布只用單色塊與 1px 線，沒有發光陰影、沒有漸層。
 * 座標、比例、量測與繪製順序完全維持原樣，只換顏色與線寬。
 */
import { useRef, useEffect, useState } from 'react';
import type { CustomTowerData, CustomEnemyData } from '@/types/game';
import { drawTowerModel } from '@/components/game/TowerModels';
import { drawEnemyModel } from '@/utils/enemyRenderer';
import { useTranslation } from '@/i18n';

const getThemeVar = (name: string, fallback: string) => {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

const getThemeBg = () => getThemeVar('--arc-void-2', '#080b0f');

export const TowerDetailPreview = ({ tower }: { tower: CustomTowerData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setRotation((r) => r + 0.05), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 35 * (tower.modelScale || 1);

    ctx.fillStyle = getThemeBg();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 射程環：資料色 --arc-reach 的 1px 線
    const reach = getThemeVar('--arc-reach', '#6f8cff');
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.min(tower.range * 0.4, 80), 0, Math.PI * 2);
    ctx.fillStyle = reach + '12';
    ctx.fill();
    ctx.strokeStyle = reach + '59';
    ctx.lineWidth = 1;
    ctx.stroke();

    drawTowerModel(tower.modelType || 'basic', {
      ctx, cx: centerX, cy: centerY, radius,
      rotation,
      color: tower.color,
      highlight: tower.highlightColor || tower.color + '80',
      level: 1, recoil: 0,
      tileSize: radius * 2.86,
    });

    if (tower.splash || tower.slowEffect || tower.poisonEffect || tower.lightningEffect) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 12, 0, Math.PI * 2);
      ctx.strokeStyle = tower.splash
        ? getThemeVar('--arc-alert', '#ff4b3e')
        : tower.slowEffect
          ? getThemeVar('--arc-reach', '#6f8cff')
          : tower.poisonEffect
            ? getThemeVar('--arc-vital', '#35e08a')
            : getThemeVar('--arc-caution', '#ffa62b');
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [tower, rotation]);

  return (
    <div className="border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="block w-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export const EnemyDetailPreview = ({ enemy }: { enemy: CustomEnemyData }) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setFrame((f) => f + 1), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(enemy.size * 2, 40) * (enemy.modelScale || 1);

    ctx.fillStyle = getThemeBg();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const line = getThemeVar('--arc-line', '#222831');
    const caution = getThemeVar('--arc-caution', '#ffa62b');
    const vital = getThemeVar('--arc-vital', '#35e08a');

    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, centerY);
    ctx.lineTo(canvas.width - 20, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 速度條：底軌 + 實色塊
    const speedWidth = Math.min(enemy.speed * 30, 80);
    ctx.fillStyle = line;
    ctx.fillRect(centerX - speedWidth / 2, canvas.height - 25, speedWidth, 8);
    ctx.fillStyle = caution;
    ctx.fillRect(centerX - speedWidth / 2, canvas.height - 25, speedWidth * ((frame % 60) / 60), 8);

    drawEnemyModel(ctx, centerX, centerY, size, enemy.modelType || 'normal', enemy.color, frame * 50);

    // 生命條：底軌 + 實色塊
    const barWidth = size * 2.5;
    ctx.fillStyle = line;
    ctx.fillRect(centerX - barWidth / 2, 20, barWidth, 8);
    ctx.fillStyle = vital;
    ctx.fillRect(centerX - barWidth / 2, 20, barWidth, 8);

    if (enemy.ability) {
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = caution;
      ctx.fillText(m.lpSpecialAbility, centerX, canvas.height - 35);
    }
  }, [enemy, frame, m.lpSpecialAbility]);

  return (
    <div className="border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="block w-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
