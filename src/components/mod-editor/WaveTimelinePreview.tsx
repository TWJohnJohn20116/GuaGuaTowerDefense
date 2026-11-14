/**
 * 波次組 · 時間軸與敵人數量預覽（Canvas · 實色方塊條 + 方塊 Boss 標記）
 *
 * HARDLINE：canvas 內只用單色塊與 1px 線，沒有漸層、沒有陰影、沒有圓角。
 * 座標、比例、量測與繪製順序完全維持原樣，只換顏色與線寬。
 */
import { useRef, useEffect, useMemo } from 'react';
import type { CustomWaveData } from '@/types/game';
import { ENEMY_DATA } from '@/data/gameData';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { WaveIcon } from '@/components/ui/Icons';
import { Empty } from '@/components/hl';
import { enemyTypeColor, isBossEnemyType } from './modValidation';

interface WaveTimelinePreviewProps {
  waveSet: CustomWaveData;
  className?: string;
  height?: number;
  compact?: boolean;
  selectedWaveIndex?: number | null;
  onWaveClick?: (index: number) => void;
}

function getThemeColor(varName: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
}

/* ---------------------------------------------------------------- 資料色 */

/** 圖表只准用四個資料色；同一種敵人永遠拿到同一個色，圖例與堆疊條才會對得上。 */
export type EnemyBarTone = 'vital' | 'alarm' | 'caution' | 'reach';

const TONE_ORDER: EnemyBarTone[] = ['reach', 'alarm', 'vital', 'caution'];

const TONE_FALLBACK: Record<EnemyBarTone, string> = {
  vital: '#38e08f',
  alarm: '#ff4b3e',
  caution: '#ffb627',
  reach: '#6fa8ff',
};

export function enemyBarTone(type: string): EnemyBarTone {
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) % 9973;
  return TONE_ORDER[hash % TONE_ORDER.length];
}

/** CSS 用：回傳 `var(--hl-*)` 字串。 */
export function enemyBarVar(type: string): string {
  return `var(--hl-${enemyBarTone(type)})`;
}

function toneHex(tone: EnemyBarTone): string {
  return getThemeColor(`--hl-${tone}`, TONE_FALLBACK[tone]);
}

export interface WaveEnemySegment {
  type: string;
  count: number;
  color: string;
  isBoss: boolean;
}

export interface WaveMetric {
  index: number;
  enemyCount: number;
  spawnMs: number;
  reward: number;
  hp: number;
  segments: WaveEnemySegment[];
  hasBoss: boolean;
}

export function computeWaveMetrics(waveSet: CustomWaveData): WaveMetric[] {
  return waveSet.waves.map((wave, index) => {
    const segments: WaveEnemySegment[] = wave.enemies.map((eg) => ({
      type: eg.type,
      count: eg.count,
      color: enemyTypeColor(eg.type),
      isBoss: isBossEnemyType(eg.type),
    }));
    const enemyCount = segments.reduce((s, e) => s + e.count, 0);
    let spawnMs = 0;
    wave.enemies.forEach((eg) => {
      if (eg.delay) spawnMs += eg.delay;
      spawnMs += eg.count * 400;
    });
    const hp = wave.enemies.reduce((s, eg) => {
      const data = ENEMY_DATA[eg.type as keyof typeof ENEMY_DATA];
      return s + (data?.health ?? 50) * eg.count;
    }, 0);
    return {
      index,
      enemyCount,
      spawnMs,
      reward: wave.reward ?? 0,
      hp,
      segments,
      hasBoss: segments.some((s) => s.isBoss),
    };
  });
}

/** Boss 標記：6×6 方塊，1px 描邊，不用三角形也不用發光。 */
function drawBossMarker(ctx: CanvasRenderingContext2D, cx: number, topY: number) {
  const size = 6;
  const tone = toneHex('caution');
  const x = cx - size / 2;
  const y = topY - size - 2;
  ctx.fillStyle = tone;
  ctx.strokeStyle = tone;
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, size, size);
  ctx.strokeRect(x, y, size, size);
}

function drawStackedBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  barW: number,
  baseY: number,
  barH: number,
  segments: WaveEnemySegment[],
  total: number,
  bg: string,
) {
  if (total <= 0 || barH <= 0) return;
  let offset = 0;
  segments.forEach((seg) => {
    const segH = (seg.count / total) * barH;
    if (segH < 0.5) return;
    const y = baseY - barH + offset;
    ctx.fillStyle = toneHex(enemyBarTone(seg.type));
    ctx.fillRect(x + 1, y, barW - 2, segH);
    // 段與段之間留 1px 底色線，不用透明度也不用漸層
    ctx.fillStyle = bg;
    ctx.fillRect(x + 1, y, barW - 2, 1);
    offset += segH;
  });
}

export function WaveTimelinePreview({
  waveSet,
  className = '',
  height = 160,
  compact = false,
  selectedWaveIndex = null,
  onWaveClick,
}: WaveTimelinePreviewProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const metrics = useMemo(() => computeWaveMetrics(waveSet), [waveSet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const h = height;
    canvas.width = width * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const bg = getThemeColor('--hl-void-2', '#080b0f');
    const text = getThemeColor('--hl-ink-3', '#6c7480');
    const line = getThemeColor('--hl-line', '#222831');
    const signal = getThemeColor('--hl-signal', '#d9ff3f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, h);

    if (metrics.length === 0) return;

    const padL = 28;
    const padR = 12;
    const padT = compact ? 18 : 26;
    const padB = compact ? 30 : 38;
    const chartW = width - padL - padR;
    const chartH = h - padT - padB;

    const maxCount = Math.max(...metrics.map((wm) => wm.enemyCount), 1);
    const barGap = 4;
    const barW = Math.max(8, (chartW - barGap * (metrics.length - 1)) / metrics.length);
    const totalDuration = metrics.reduce((s, wm) => s + wm.spawnMs, 0) || 1;

    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    let timeCursor = 0;
    metrics.forEach((metric, i) => {
      const barH = (metric.enemyCount / maxCount) * chartH;
      const x = padL + i * (barW + barGap);
      const baseY = padT + chartH;

      drawStackedBar(ctx, x, barW, baseY, barH, metric.segments, metric.enemyCount, bg);

      if (selectedWaveIndex === i) {
        // 選中：訊號色 1px 方框，不填充
        ctx.strokeStyle = signal;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, baseY - barH - 2, barW, barH + 4);
      }

      if (metric.hasBoss) {
        drawBossMarker(ctx, x + barW / 2, baseY - barH);
      }

      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.fillStyle = text + '99';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, x + barW / 2, baseY + 12);

      if (!compact) {
        ctx.font = '8px ui-monospace, monospace';
        ctx.fillStyle = text + '70';
        ctx.fillText(String(metric.enemyCount), x + barW / 2, baseY - barH - (metric.hasBoss ? 10 : 4));
      }

      const segW = (metric.spawnMs / totalDuration) * chartW;
      const segX = padL + (timeCursor / totalDuration) * chartW;
      ctx.fillStyle = signal + '38';
      ctx.fillRect(segX, baseY + 16, Math.max(2, segW), 6);
      timeCursor += metric.spawnMs;
    });

    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.fillStyle = text + '50';
    ctx.textAlign = 'left';
    ctx.fillText(compact ? m.waveCount : `${m.waveCount} / ${m.waveTotalEnemies}`, padL, 12);

    if (!compact) {
      ctx.textAlign = 'right';
      ctx.fillText(fillTemplate(m.wvTimelineEstSec, {
        seconds: (totalDuration / 1000).toFixed(0),
      }), padL + chartW, 12);
    }
  }, [waveSet, metrics, height, compact, selectedWaveIndex, m.waveCount, m.waveTotalEnemies, m.wvTimelineEstSec]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onWaveClick || metrics.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padL = 28;
    const padR = 12;
    const chartW = rect.width - padL - padR;
    const barGap = 4;
    const barW = Math.max(8, (chartW - barGap * (metrics.length - 1)) / metrics.length);
    const relX = x - padL;
    if (relX < 0) return;
    const idx = Math.floor(relX / (barW + barGap));
    if (idx >= 0 && idx < metrics.length) onWaveClick(idx);
  };

  if (waveSet.waves.length === 0) {
    return (
      <Empty
        title={
          <span className="flex items-center justify-center gap-2">
            <WaveIcon className="h-4 w-4 text-[var(--hl-ink-4)]" />
            {m.noWaves}
          </span>
        }
        className={className}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      role={onWaveClick ? 'button' : undefined}
      tabIndex={onWaveClick ? 0 : undefined}
      onClick={handleCanvasClick}
      onKeyDown={(e) => {
        if (!onWaveClick) return;
        if (e.key === 'ArrowRight' && selectedWaveIndex !== null && selectedWaveIndex < metrics.length - 1) {
          onWaveClick(selectedWaveIndex + 1);
        } else if (e.key === 'ArrowLeft' && selectedWaveIndex !== null && selectedWaveIndex > 0) {
          onWaveClick(selectedWaveIndex - 1);
        }
      }}
      className={`w-full border border-[var(--hl-line)] bg-[var(--hl-void-2)] ${
        onWaveClick
          ? 'cursor-pointer hover:border-[var(--hl-signal-edge)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--hl-signal)]'
          : ''
      } ${className}`}
      style={{ height, display: 'block' }}
    />
  );
}
