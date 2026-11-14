// 塔融合動畫繪製模組 - 雙塔合體時的爆裂特效
import type { GridPosition } from '@/types/game';
import { fusionBurstText } from '@/data/fusionBurstLabel';

interface FusionAnim {
  id: string;
  gridPos: GridPosition;
  resultType: string;
  startTime: number;
  colorA: string;
  colorB: string;
}

const TWO_PI = Math.PI * 2;

export function drawFusionAnimations(
  ctx: CanvasRenderingContext2D,
  now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  fusionAnimations: FusionAnim[],
  burstLabel?: string,
): void {
  fusionAnimations.forEach((anim) => {
    const elapsed = now - anim.startTime;
    const dur = 1400;
    if (elapsed > dur) return;

    const cx = offsetX + anim.gridPos.col * tileSize + tileSize / 2;
    const cy = offsetY + anim.gridPos.row * tileSize + tileSize / 2;
    const r = tileSize * 0.35;

    // 效果 1：衝擊閃光 (0-250ms)
    if (elapsed < 250) {
      const fp = elapsed / 250;
      const alpha = (1 - fp) * 0.8;
      const flashR = r + fp * tileSize * 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, flashR, 0, TWO_PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    // 效果 2：垂直光柱 (50-500ms)
    if (elapsed > 50 && elapsed < 500) {
      const bp = (elapsed - 50) / 450;
      const beamW = tileSize * 0.35 * (1 - bp * 0.3);
      const beamAlpha = bp < 0.3 ? bp / 0.3 : 1 - (bp - 0.3) / 0.7;
      const grad = ctx.createLinearGradient(cx, cy - tileSize * 3, cx, cy + tileSize * 0.3);
      grad.addColorStop(0, 'rgba(180, 130, 255, 0)');
      grad.addColorStop(0.5, `rgba(200, 150, 255, ${beamAlpha * 0.5})`);
      grad.addColorStop(1, `rgba(180, 130, 255, ${beamAlpha * 0.8})`);
      ctx.fillStyle = grad;
      ctx.fillRect(cx - beamW / 2, cy - tileSize * 3, beamW, tileSize * 3 + tileSize * 0.3);
    }

    // 效果 3：雙色收縮環 (0-500ms) — 來自兩種源塔的顏色向內匯聚
    if (elapsed < 500) {
      const rp = elapsed / 500;
      const ringR = r + tileSize * 0.6 * (1 - rp);
      const ringAlpha = (1 - rp) * 0.6;

      ctx.save();
      ctx.globalAlpha = ringAlpha;
      ctx.lineWidth = 3;
      ctx.strokeStyle = anim.colorA;
      ctx.beginPath();
      ctx.arc(cx - rp * tileSize * 0.1, cy - rp * tileSize * 0.08, ringR, 0, TWO_PI);
      ctx.stroke();

      ctx.strokeStyle = anim.colorB;
      ctx.beginPath();
      ctx.arc(cx + rp * tileSize * 0.1, cy + rp * tileSize * 0.08, ringR * 0.9, 0, TWO_PI);
      ctx.stroke();
      ctx.restore();
    }

    // 效果 4：向外擴散衝擊環 (250-1000ms)
    if (elapsed > 250 && elapsed < 1000) {
      const wp = (elapsed - 250) / 750;
      const wR = r + wp * tileSize * 1.2;
      const wAlpha = (1 - wp) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, wR, 0, TWO_PI);
      ctx.strokeStyle = `rgba(160, 100, 255, ${wAlpha})`;
      ctx.lineWidth = 3 * (1 - wp);
      ctx.stroke();
    }

    // 效果 5：火焰粒子 (100-1100ms)
    if (elapsed > 100 && elapsed < 1100) {
      const pp = (elapsed - 100) / 1000;
      const count = 14;
      for (let i = 0; i < count; i++) {
        const angle = TWO_PI * i / count + pp * 0.4;
        const dist = pp * tileSize * 0.8;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist - pp * tileSize * 0.2;
        const size = (3 + (i % 3)) * (1 - pp * 0.7);
        const alpha = (1 - pp) * 0.8;
        if (size < 0.5) continue;
        ctx.save();
        ctx.globalAlpha = alpha;
        const color = i % 2 === 0 ? anim.colorA : anim.colorB;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, size);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.4, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, TWO_PI);
        ctx.fill();
        ctx.restore();
      }
    }

    // 效果 6：合體字上浮 (300-1300ms)
    if (elapsed > 300 && elapsed < 1300) {
      const tp = (elapsed - 300) / 1000;
      const ty = cy - tileSize * 0.45 - tp * tileSize * 0.6;
      const tAlpha = tp < 0.15 ? tp / 0.15 : Math.max(0, 1 - (tp - 0.15) / 0.85);
      const text = fusionBurstText(burstLabel);
      ctx.save();
      ctx.globalAlpha = tAlpha;
      ctx.font = `bold ${tileSize * 0.24}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(text, cx, ty);
      ctx.fillStyle = '#c084fc';
      ctx.fillText(text, cx, ty);
      ctx.restore();
    }
  });
}
