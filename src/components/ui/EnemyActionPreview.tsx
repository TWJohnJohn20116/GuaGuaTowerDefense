import { useRef, useEffect, useCallback, useMemo } from 'react';
import { drawEnemyModel } from '@/utils/enemyRenderer';
import { ENEMY_DATA } from '@/data/gameData';
import { useTranslation } from '@/i18n';

/**
 * 敵人行動預覽 - 動畫展示敵人沿路徑移動並展現特殊能力
 */
interface EnemyActionPreviewProps {
  enemyId?: string;
  /** Mod 編輯器自訂敵人參數（優先於 enemyId） */
  custom?: {
    color: string;
    speed: number;
    health: number;
    size: number;
    ability?: string;
    modelType?: string;
  };
  width?: number;
  height?: number;
}

// 能力類型對應的視覺效果
type AbilityVisual = 'healing' | 'shield' | 'stealth' | 'berserk' | 'teleport' | 'phase' | 'explode' | 'spawning' | 'flying' | 'swarm' | 'armored' | 'jam' | 'escort' | 'none';

const getAbilityVisual = (ability?: string): AbilityVisual => {
  if (!ability) return 'none';
  const map: Record<string, AbilityVisual> = {
    healing: 'healing', shield: 'shield', stealth: 'stealth', berserk: 'berserk',
    teleport: 'teleport', phase: 'phase', explode: 'explode', spawning: 'spawning',
    flying: 'flying', swarm: 'swarm', armored: 'armored', jam: 'jam', escort: 'escort', miniboss: 'none',
  };
  return map[ability] || 'none';
};

const EnemyActionPreview = ({ enemyId, custom, width = 280, height = 100 }: EnemyActionPreviewProps) => {
  const { t } = useTranslation();
  const enc = t.encyclopedia;
  const labelsRef = useRef({
    stealth: enc.abilities.stealth,
    phase: enc.abilities.phase,
    splitHint: enc.previewSplitHint.replace('{count}', '3'),
    abilities: enc.abilities,
  });
  labelsRef.current = {
    stealth: enc.abilities.stealth,
    phase: enc.abilities.phase,
    splitHint: enc.previewSplitHint.replace('{count}', '3'),
    abilities: enc.abilities,
  };

  const params = useMemo(() => {
    if (custom) {
      return {
        color: custom.color,
        speed: custom.speed,
        health: custom.health,
        size: custom.size,
        ability: getAbilityVisual(custom.ability),
        modelType: custom.modelType || 'normal',
      };
    }
    const d = ENEMY_DATA[enemyId as keyof typeof ENEMY_DATA];
    if (!d) return null;
    return {
      color: d.color,
      speed: d.speed,
      health: d.health,
      size: d.size,
      ability: getAbilityVisual(d.ability),
      modelType: enemyId,
    };
  }, [enemyId, custom]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !params) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const t = timeRef.current;
    const cy = height / 2;
    const enemyRadius = Math.min(14, params.size * 0.35);
    const pathStartX = 30;
    const pathEndX = width - 30;
    const pathLen = pathEndX - pathStartX;

    // 移動週期（速度越快週期越短）
    const cycleDuration = Math.max(1500, 4000 / params.speed);
    const phase = (t % cycleDuration) / cycleDuration;

    // 繪製路徑背景
    ctx.strokeStyle = '#3a4a3a';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pathStartX, cy);
    ctx.lineTo(pathEndX, cy);
    ctx.stroke();

    // 路徑表面
    ctx.strokeStyle = '#5a6a5a';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(pathStartX, cy);
    ctx.lineTo(pathEndX, cy);
    ctx.stroke();

    // 路徑虛線
    ctx.strokeStyle = '#6a7a6a';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(pathStartX, cy);
    ctx.lineTo(pathEndX, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // 起點標記
    ctx.beginPath();
    ctx.arc(pathStartX, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    // 終點標記
    ctx.beginPath();
    ctx.arc(pathEndX, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // 敵人位置
    let enemyX = pathStartX + pathLen * phase;
    const enemyY = cy;
    const ability = params.ability;

    // ===== 特殊能力視覺效果 =====

    // 飛行：波浪形飛行軌跡
    let drawY = enemyY;
    if (ability === 'flying') {
      drawY = enemyY + Math.sin(phase * Math.PI * 4) * 12;
      // 翅膀殘影
      const wingAlpha = 0.15 + Math.sin(t * 0.01) * 0.1;
      ctx.save();
      ctx.globalAlpha = wingAlpha;
      for (let i = 1; i <= 3; i++) {
        const trailX = enemyX - i * 12;
        const trailY = enemyY + Math.sin((phase - i * 0.03) * Math.PI * 4) * 12;
        if (trailX > pathStartX) {
          ctx.beginPath();
          ctx.arc(trailX, trailY, enemyRadius * (1 - i * 0.2), 0, Math.PI * 2);
          ctx.fillStyle = params.color;
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 治療：治療光環
    if (ability === 'healing') {
      const pulseR = 25 + Math.sin(t * 0.005) * 5;
      const grad = ctx.createRadialGradient(enemyX, drawY, 0, enemyX, drawY, pulseR);
      grad.addColorStop(0, 'rgba(74, 222, 128, 0.2)');
      grad.addColorStop(0.6, 'rgba(74, 222, 128, 0.08)');
      grad.addColorStop(1, 'rgba(74, 222, 128, 0)');
      ctx.beginPath();
      ctx.arc(enemyX, drawY, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      // 十字
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemyX - 5, drawY); ctx.lineTo(enemyX + 5, drawY);
      ctx.moveTo(enemyX, drawY - 5); ctx.lineTo(enemyX, drawY + 5);
      ctx.stroke();
    }

    // 干擾：紫色電波圈
    if (ability === 'jam') {
      const pulseR = 28 + Math.sin(t * 0.006) * 6;
      const grad = ctx.createRadialGradient(enemyX, drawY, 0, enemyX, drawY, pulseR);
      grad.addColorStop(0, 'rgba(167, 139, 250, 0.22)');
      grad.addColorStop(0.6, 'rgba(167, 139, 250, 0.08)');
      grad.addColorStop(1, 'rgba(167, 139, 250, 0)');
      ctx.beginPath();
      ctx.arc(enemyX, drawY, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(196, 181, 253, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(enemyX, drawY, pulseR * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 護航：鋼青裝甲圈
    if (ability === 'escort') {
      const pulseR = 26 + Math.sin(t * 0.005) * 5;
      const grad = ctx.createRadialGradient(enemyX, drawY, 0, enemyX, drawY, pulseR);
      grad.addColorStop(0, 'rgba(148, 163, 184, 0.22)');
      grad.addColorStop(0.6, 'rgba(148, 163, 184, 0.08)');
      grad.addColorStop(1, 'rgba(148, 163, 184, 0)');
      ctx.beginPath();
      ctx.arc(enemyX, drawY, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.save();
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(enemyX, drawY, pulseR * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 護盾：護盾弧形
    if (ability === 'shield') {
      const shieldAlpha = 0.3 + Math.sin(t * 0.004) * 0.15;
      ctx.save();
      ctx.globalAlpha = shieldAlpha;
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(enemyX, drawY, enemyRadius + 5, -Math.PI * 0.7, Math.PI * 0.7);
      ctx.stroke();
      ctx.restore();
    }

    // 隱身：閃爍透明
    if (ability === 'stealth') {
      const stealthPhase = (t % 3000) / 3000;
      if (stealthPhase > 0.4 && stealthPhase < 0.7) {
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.sin(stealthPhase * Math.PI * 10) * 0.15;
        drawEnemyModel(ctx, enemyX, drawY, enemyRadius, params.modelType, params.color, t);
        ctx.restore();
        // 標記文字
        ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labelsRef.current.stealth, enemyX, drawY - enemyRadius - 6);
        // 跳過正常繪製
        drawHealthBar(ctx, enemyX, drawY, enemyRadius, params);
        return;
      }
    }

    // 狂暴：紅色光環（在後半段觸發）
    if (ability === 'berserk' && phase > 0.6) {
      const berserkPulse = Math.sin(t * 0.01) * 0.3 + 0.7;
      ctx.save();
      ctx.globalAlpha = berserkPulse * 0.4;
      ctx.beginPath();
      ctx.arc(enemyX, drawY, enemyRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ff3232';
      ctx.fill();
      ctx.restore();
      // 加速線
      for (let i = 0; i < 3; i++) {
        const lineX = enemyX - 8 - i * 6;
        const lineAlpha = 0.4 - i * 0.12;
        ctx.strokeStyle = `rgba(255, 50, 50, ${lineAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lineX, drawY - 4);
        ctx.lineTo(lineX - 4, drawY);
        ctx.lineTo(lineX, drawY + 4);
        ctx.stroke();
      }
    }

    // 傳送：傳送閃光
    if (ability === 'teleport') {
      const tpPhase = (t % 4000) / 4000;
      if (tpPhase > 0.45 && tpPhase < 0.55) {
        // 傳送前閃光
        const flashAlpha = Math.sin((tpPhase - 0.45) / 0.1 * Math.PI);
        ctx.save();
        ctx.globalAlpha = flashAlpha * 0.6;
        ctx.beginPath();
        ctx.arc(enemyX, drawY, enemyRadius + 10, 0, Math.PI * 2);
        ctx.fillStyle = '#c864ff';
        ctx.fill();
        ctx.restore();
        // 跳躍後的位置指示
        const jumpDist = pathLen * 0.15;
        ctx.save();
        ctx.globalAlpha = flashAlpha * 0.3;
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#c864ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(enemyX, drawY);
        ctx.lineTo(enemyX + jumpDist, drawY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // 相位：半透明閃爍
    if (ability === 'phase') {
      const phaseVisual = (t % 4000) / 4000;
      if (phaseVisual > 0.3 && phaseVisual < 0.55) {
        ctx.save();
        ctx.globalAlpha = 0.2 + Math.sin(phaseVisual * Math.PI * 8) * 0.15;
        drawEnemyModel(ctx, enemyX, drawY, enemyRadius, params.modelType, params.color, t);
        ctx.restore();
        ctx.fillStyle = 'rgba(200, 200, 255, 0.5)';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labelsRef.current.phase, enemyX, drawY - enemyRadius - 6);
        drawHealthBar(ctx, enemyX, drawY, enemyRadius, params);
        return;
      }
    }

    // 爆炸：死亡爆炸效果（接近終點時）
    if (ability === 'explode' && phase > 0.9) {
      const explodePhase = (phase - 0.9) / 0.1;
      const explodeR = 20 * explodePhase;
      const explodeAlpha = 1 - explodePhase;
      ctx.save();
      ctx.globalAlpha = explodeAlpha;
      const grad = ctx.createRadialGradient(enemyX, drawY, 0, enemyX, drawY, explodeR);
      grad.addColorStop(0, '#ffaa00');
      grad.addColorStop(0.5, '#ff6432');
      grad.addColorStop(1, 'rgba(255, 100, 50, 0)');
      ctx.beginPath();
      ctx.arc(enemyX, drawY, explodeR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    // 生產：展示分裂效果（接近終點時分裂成3個小敵人）
    if (ability === 'spawning') {
      if (phase < 0.85) {
        // 移動階段：顯示內部的小史萊姆
        for (let i = 0; i < 3; i++) {
          const angle = (t * 0.002 + i * Math.PI * 2 / 3);
          const orbX = enemyX + Math.cos(angle) * (enemyRadius * 0.4);
          const orbY = drawY + Math.sin(angle) * (enemyRadius * 0.4);
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(orbX, orbY, enemyRadius * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = params.color;
          ctx.fill();
          ctx.restore();
        }
      } else {
        // 分裂階段：母體消失，3個小敵人散開
        const splitPhase = (phase - 0.85) / 0.15;
        
        // 母體逐漸消失
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - splitPhase * 2);
        drawEnemyModel(ctx, enemyX, drawY, enemyRadius, params.modelType, params.color, t);
        ctx.restore();
        
        // 3個小敵人從中心散開
        const spawnedEnemyRadius = enemyRadius * 0.4;
        const spreadDist = enemyRadius * 2 * splitPhase;
        
        for (let i = 0; i < 3; i++) {
          const angle = i * Math.PI * 2 / 3 - Math.PI / 2;
          const spawnX = enemyX + Math.cos(angle) * spreadDist;
          const spawnY = drawY + Math.sin(angle) * spreadDist;
          
          // 小敵人逐漸顯現
          ctx.save();
          ctx.globalAlpha = Math.min(1, splitPhase * 1.5);
          
          // 繪製小敵人（簡化的普通敵人模型）
          ctx.beginPath();
          ctx.arc(spawnX, spawnY, spawnedEnemyRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#c83c3c'; // 普通敵人顏色
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // 小敵人的眼睛
          const eyeSize = spawnedEnemyRadius * 0.15;
          const eyeY = spawnY - spawnedEnemyRadius * 0.15;
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(spawnX - spawnedEnemyRadius * 0.25, eyeY, eyeSize, 0, Math.PI * 2);
          ctx.arc(spawnX + spawnedEnemyRadius * 0.25, eyeY, eyeSize, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
        
        // 分裂特效：擴散光環
        if (splitPhase < 0.5) {
          const effectRadius = enemyRadius * (1 + splitPhase * 3);
          ctx.save();
          ctx.globalAlpha = (1 - splitPhase * 2) * 0.4;
          ctx.strokeStyle = params.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(enemyX, drawY, effectRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        
        // 跳過正常繪製
        drawHealthBar(ctx, enemyX, drawY, enemyRadius, params);
        
        // 分裂提示文字
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labelsRef.current.splitHint, enemyX, drawY - enemyRadius - 15);
        
        return;
      }
    }

    // 裝甲：金屬邊框
    if (ability === 'armored') {
      ctx.strokeStyle = 'rgba(160, 160, 160, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(enemyX, drawY, enemyRadius + 3, 0, Math.PI * 2);
      ctx.stroke();
      // 鉚釘
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + t * 0.001;
        ctx.beginPath();
        ctx.arc(enemyX + Math.cos(a) * (enemyRadius + 3), drawY + Math.sin(a) * (enemyRadius + 3), 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#aaa';
        ctx.fill();
      }
    }

    // 蟲群：多個小個體
    if (ability === 'swarm') {
      for (let i = 0; i < 4; i++) {
        const ox = Math.sin(t * 0.003 + i * 1.5) * 10;
        const oy = Math.cos(t * 0.004 + i * 2) * 6;
        const sx = enemyX + ox;
        const sy = drawY + oy;
        if (sx > pathStartX && sx < pathEndX) {
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fillStyle = params.color + '80';
          ctx.fill();
        }
      }
    }

    // 繪製敵人模型
    drawEnemyModel(ctx, enemyX, drawY, enemyRadius, params.modelType, params.color, t);

    // 血量條
    drawHealthBar(ctx, enemyX, drawY, enemyRadius, params);

    // 速度標示
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${params.speed}x`, enemyX, drawY + enemyRadius + 14);

    // 右下角能力標籤
    if (params.ability !== 'none') {
      const ab = labelsRef.current.abilities;
      const abilityLabels: Record<AbilityVisual, string> = {
        healing: ab.healing, shield: ab.shield, stealth: ab.stealth, berserk: ab.berserk,
        teleport: ab.teleport, phase: ab.phase, explode: ab.explode, spawning: ab.spawning,
        flying: ab.flying, swarm: ab.swarm, armored: ab.armored, jam: ab.jam, escort: ab.escort, none: '',
      };
      const label = abilityLabels[params.ability];
      if (label) {
        const lw = ctx.measureText(label).width + 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(width - lw - 6, height - 18, lw, 14, 3);
        ctx.fill();
        ctx.fillStyle = params.color;
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(label, width - 10, height - 8);
      }
    }
  }, [params, width, height]);

  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      timeRef.current = performance.now();
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [draw]);

  if (!params) return null;

  return (
    <canvas ref={canvasRef} style={{ width, height }}
      className=" bg-nordic-bg/60 border border-nordic-border/30" />
  );
};

// 血量條
function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, params: { health: number; color: string }) {
  const barW = r * 2;
  const barH = 3;
  const barY = y - r - 8;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.roundRect(x - barW / 2, barY, barW, barH, 1.5);
  ctx.fill();
  ctx.fillStyle = params.health >= 200 ? '#ef4444' : params.health >= 100 ? '#eab308' : '#22c55e';
  ctx.beginPath();
  ctx.roundRect(x - barW / 2, barY, barW, barH, 1.5);
  ctx.fill();
}

export default EnemyActionPreview;
