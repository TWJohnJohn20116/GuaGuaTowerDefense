// 塔升級動畫繪製模組 - 從 GameCanvasDynamic 抽出以保持單一檔案 ≤ 888 行
// 包含: 升級動畫主循環、星星粒子、火花粒子、等級文字、滿級文字
import type { GridPosition } from '@/types/game';
import { towerMaxLevelText } from '@/data/towerLevelLabel';

interface UpgradeAnim {
  id: string;
  towerId: string;
  gridPos: GridPosition;
  newLevel: number;
  towerColor: string;
  startTime: number;
  isMaxLevel?: boolean;
}

// ===== 升級動畫主入口 =====
export function drawUpgradeAnimations(
  ctx: CanvasRenderingContext2D,
  now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  upgradeAnimations: UpgradeAnim[],
  maxLevelLabel?: string,
): void {
  const maxText = towerMaxLevelText(maxLevelLabel);
  upgradeAnimations.forEach((anim) => {
    const totalDuration = anim.isMaxLevel ? 2400 : 1500;
    const elapsed = now - anim.startTime;
    if (elapsed > totalDuration) return;

    const ax = offsetX + anim.gridPos.col * tileSize;
    const ay = offsetY + anim.gridPos.row * tileSize;
    const acx = ax + tileSize / 2;
    const acy = ay + tileSize / 2;
    const baseRadius = tileSize * 0.35;
    const isMax = !!anim.isMaxLevel;

    // 效果 0: 滿級時 - 從天而降的光柱 (0-700ms)
    if (isMax && elapsed < 700) {
      const beamP = elapsed / 700;
      const beamAlpha = beamP < 0.3 ? beamP / 0.3 : 1 - (beamP - 0.3) / 0.7;
      const beamW = tileSize * 0.5 * (1 - beamP * 0.3);
      const grad = ctx.createLinearGradient(acx, ay - tileSize * 4, acx, acy);
      grad.addColorStop(0, 'rgba(255, 255, 200, 0)');
      grad.addColorStop(0.5, `rgba(255, 215, 0, ${beamAlpha * 0.5})`);
      grad.addColorStop(1, `rgba(255, 215, 0, ${beamAlpha * 0.9})`);
      ctx.fillStyle = grad;
      ctx.fillRect(acx - beamW / 2, ay - tileSize * 4, beamW, tileSize * 4 + tileSize * 0.3);
    }

    // 效果 1：閃光 (0-400ms) - 滿級時更亮
    if (elapsed < 400) {
      const flashP = elapsed / 400;
      const flashAlpha = (1 - flashP) * (isMax ? 0.85 : 0.6);
      const flashR = baseRadius + flashP * tileSize * (isMax ? 0.3 : 0.15);
      ctx.beginPath();
      ctx.arc(acx, acy, flashR, 0, Math.PI * 2);
      ctx.fillStyle = isMax ? `rgba(255, 230, 100, ${flashAlpha})` : `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fill();
    }

    // 效果 2：擴展光環 - 主環 (0-900ms)
    if (elapsed < 900) {
      const ringP = elapsed / 900;
      const ringR = baseRadius + ringP * tileSize * 0.9;
      const ringAlpha = (1 - ringP) * 0.7;
      ctx.beginPath();
      ctx.arc(acx, acy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = anim.towerColor;
      ctx.lineWidth = 3 * (1 - ringP);
      ctx.globalAlpha = ringAlpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 效果 2b：擴展光環 - 次環 (150-1050ms)
    if (elapsed > 150 && elapsed < 1050) {
      const ring2P = (elapsed - 150) / 900;
      const ring2R = baseRadius + ring2P * tileSize * 0.7;
      const ring2Alpha = (1 - ring2P) * 0.5;
      ctx.beginPath();
      ctx.arc(acx, acy, ring2R, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * (1 - ring2P);
      ctx.globalAlpha = ring2Alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 效果 2c：滿級時的彩虹環 (300-1500ms)
    if (isMax && elapsed > 300 && elapsed < 1500) {
      const ringP = (elapsed - 300) / 1200;
      const ringR = baseRadius + ringP * tileSize * 1.2;
      const ringAlpha = (1 - ringP) * 0.6;
      const hue = (elapsed * 0.4) % 360;
      ctx.beginPath();
      ctx.arc(acx, acy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${ringAlpha})`;
      ctx.lineWidth = 4 * (1 - ringP);
      ctx.stroke();
    }

    // 效果 3：發光底圈 (0-700ms)
    if (elapsed < 700) {
      const glowP = elapsed / 700;
      const glowR = baseRadius + 8 + glowP * 4;
      const glowAlpha = (1 - glowP) * 0.35;
      ctx.beginPath();
      ctx.arc(acx, acy, glowR, 0, Math.PI * 2);
      ctx.fillStyle = anim.towerColor + Math.floor(glowAlpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    }

    // 效果 4：星星粒子 (100-1200ms)
    drawStarParticles(ctx, elapsed, tileSize, acx, acy, anim.towerColor);

    // 效果 4b：滿級時更多金色火花粒子 (200-1800ms)
    if (isMax && elapsed > 200 && elapsed < 1800) {
      drawSparkParticles(ctx, elapsed - 200, tileSize, acx, acy);
    }

    // 效果 5：等級文字上浮 (200-1400ms)
    drawLevelText(ctx, elapsed, tileSize, acx, acy, anim.newLevel, isMax);

    // 效果 6: 滿級字樣 (500-2400ms)
    if (isMax && elapsed > 500 && elapsed < 2400) {
      drawMaxLevelText(ctx, elapsed - 500, tileSize, acx, acy, maxText);
    }
  });
}

// ===== 星星粒子效果 =====
function drawStarParticles(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  tileSize: number,
  acx: number,
  acy: number,
  towerColor: string
): void {
  if (elapsed <= 100 || elapsed >= 1200) return;

  const partP = (elapsed - 100) / 1100;
  const partCount = 8;
  for (let i = 0; i < partCount; i++) {
    const angle = (Math.PI * 2 * i) / partCount - Math.PI / 2;
    const dist = partP * tileSize * 0.9;
    const px = acx + Math.cos(angle) * dist;
    const py = acy + Math.sin(angle) * dist - partP * tileSize * 0.25;
    const pSize = (3 + Math.sin(i * 1.3) * 1.5) * (1 - partP);
    const pAlpha = (1 - partP) * 0.85;

    if (pSize < 0.5) continue;
    ctx.save();
    ctx.translate(px, py);
    ctx.globalAlpha = pAlpha;
    ctx.fillStyle = i % 2 === 0 ? '#ffd700' : towerColor;

    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      const sAngle = (Math.PI / 2) * j + elapsed * 0.005;
      const outerX = Math.cos(sAngle) * pSize;
      const outerY = Math.sin(sAngle) * pSize;
      const innerAngle = sAngle + Math.PI / 4;
      const innerX = Math.cos(innerAngle) * pSize * 0.3;
      const innerY = Math.sin(innerAngle) * pSize * 0.3;
      if (j === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ===== 滿級金色火花粒子 =====
function drawSparkParticles(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  tileSize: number,
  acx: number,
  acy: number
): void {
  const partP = elapsed / 1600;
  if (partP > 1) return;
  const partCount = 16;
  for (let i = 0; i < partCount; i++) {
    const angle = (Math.PI * 2 * i) / partCount + Math.PI / 2;
    const seed = i * 137.5;
    const dist = partP * tileSize * (0.6 + (seed % 0.4));
    const px = acx + Math.cos(angle) * dist;
    const py = acy + Math.sin(angle) * dist - partP * tileSize * 0.6 + partP * partP * tileSize * 0.4;
    const pSize = (2 + (seed % 1.5)) * (1 - partP);
    const pAlpha = (1 - partP) * 0.9;

    if (pSize < 0.5) continue;
    ctx.save();
    ctx.translate(px, py);
    ctx.globalAlpha = pAlpha;
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pSize * 2);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.5, '#ffd700');
    grad.addColorStop(1, 'rgba(255, 165, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, pSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ===== 等級文字上浮效果 =====
function drawLevelText(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  tileSize: number,
  acx: number,
  acy: number,
  newLevel: number,
  isMax: boolean = false
): void {
  if (elapsed <= 200 || elapsed >= 1400) return;

  const txtP = (elapsed - 200) / 1200;
  const txtY = acy - tileSize * 0.5 - txtP * tileSize * 0.7;
  const txtAlpha = txtP < 0.2 ? txtP / 0.2 : Math.max(0, 1 - (txtP - 0.2) / 0.8);
  const txtScale = txtP < 0.15 ? 0.5 + txtP / 0.15 * 0.5 : 1;

  ctx.save();
  ctx.translate(acx, txtY);
  ctx.scale(txtScale, txtScale);
  ctx.font = `bold ${tileSize * 0.3}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = txtAlpha;

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeText(`Lv.${newLevel}`, 0, 0);

  ctx.fillStyle = isMax ? '#ffe680' : '#ffd700';
  ctx.fillText(`Lv.${newLevel}`, 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ===== MAX 文字效果 =====
function drawMaxLevelText(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  tileSize: number,
  acx: number,
  acy: number,
  label: string,
): void {
  const txtP = elapsed / 1900;
  if (txtP > 1) return;
  const txtY = acy - tileSize * 0.85 - txtP * tileSize * 0.4;
  const txtAlpha = txtP < 0.15 ? txtP / 0.15 : Math.max(0, 1 - (txtP - 0.5) / 0.5);
  const bounce = txtP < 0.3 ? 0.4 + txtP / 0.3 * 0.7 : 1.1 - Math.abs(Math.sin(txtP * Math.PI * 2)) * 0.05;

  ctx.save();
  ctx.translate(acx, txtY);
  ctx.scale(bounce, bounce);
  ctx.font = `bold ${tileSize * 0.36}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = txtAlpha;

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText(label, 0, 0);

  const grad = ctx.createLinearGradient(-tileSize * 0.3, -tileSize * 0.2, tileSize * 0.3, tileSize * 0.2);
  grad.addColorStop(0, '#ffd700');
  grad.addColorStop(0.5, '#fff8dc');
  grad.addColorStop(1, '#ffa500');
  ctx.fillStyle = grad;
  ctx.fillText(label, 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;
}
