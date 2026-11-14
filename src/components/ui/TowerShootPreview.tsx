import { useRef, useEffect, useCallback, useMemo } from 'react';
import { drawTowerModel } from '@/components/game/TowerModels';
import { drawEnemyModel } from '@/utils/enemyRenderer';
import { TOWER_DATA } from '@/data/gameData';

// 塔攻擊類型
type AttackType = 'projectile' | 'laser' | 'lightning' | 'flame' | 'wind' | 'none';

// 從 TOWER_DATA 自動推導攻擊類型
const getAttackType = (id: string): AttackType => {
  const d = TOWER_DATA[id as keyof typeof TOWER_DATA];
  if (!d) return 'projectile';
  if (d.moneyGeneration) return 'none';
  if (d.windEffect) return 'wind';
  if (d.flameEffect) return 'flame';
  if (d.lightningEffect) return 'lightning';
  if (d.laserEffect) return 'laser';
  return 'projectile';
};

interface TowerShootPreviewProps {
  towerId?: string;
  /** Mod 編輯器自訂塔參數（優先於 towerId） */
  custom?: {
    modelType?: string;
    color: string;
    highlightColor?: string;
    projectileColor?: string;
    projectileSize?: number;
    damage?: number;
    fireRate?: number;
    splash?: boolean;
    splashRadius?: number;
    slowEffect?: boolean;
    poisonEffect?: boolean;
    lightningEffect?: boolean;
    chainCount?: number;
    laserEffect?: boolean;
    flameEffect?: boolean;
    windEffect?: boolean;
    moneyGeneration?: boolean;
  };
  width?: number;
  height?: number;
  level?: number;
}

interface Projectile {
  x: number; y: number;
  vx: number; vy: number;
  startX: number; startY: number;
  targetX: number; targetY: number;
  progress: number; // 0 to 1
  speed: number;
  size: number;
  color: string;
  trail: {x: number, y: number}[];
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: string;
}

interface FloatingText {
  x: number; y: number;
  text: string;
  life: number; maxLife: number;
  color: string;
}

// 從塔資料推導攻擊類型
const resolveAttackType = (
  towerType: string,
  effects: {
    moneyGeneration?: boolean;
    windEffect?: boolean;
    flameEffect?: boolean;
    lightningEffect?: boolean;
    laserEffect?: boolean;
  },
): AttackType => {
  if (effects.moneyGeneration) return 'none';
  if (effects.windEffect) return 'wind';
  if (effects.flameEffect) return 'flame';
  if (effects.lightningEffect) return 'lightning';
  if (effects.laserEffect) return 'laser';
  return getAttackType(towerType);
};

const TowerShootPreview = ({
  towerId,
  custom,
  width = 280,
  height = 100,
  level = 1,
}: TowerShootPreviewProps) => {
  const params = useMemo(() => {
    if (custom) {
      const towerType = custom.modelType || 'basic';
      const effects = {
        moneyGeneration: custom.moneyGeneration,
        windEffect: custom.windEffect,
        flameEffect: custom.flameEffect,
        lightningEffect: custom.lightningEffect,
        laserEffect: custom.laserEffect,
      };
      return {
        towerType,
        towerColor: custom.color,
        highlightColor: custom.highlightColor || `${custom.color}cc`,
        projectileColor: custom.projectileColor || custom.color,
        projectileSize: custom.projectileSize || 6,
        attackType: resolveAttackType(towerType, effects),
        splash: !!custom.splash,
        splashRadius: custom.splashRadius || 50,
        slowEffect: !!custom.slowEffect,
        poisonEffect: !!custom.poisonEffect,
        chainCount: custom.chainCount || 0,
        fireRate: custom.fireRate || 1,
        damage: custom.damage || 10,
      };
    }
    if (!towerId) return null;
    const d = TOWER_DATA[towerId as keyof typeof TOWER_DATA];
    if (!d) return null;
    return {
      towerType: towerId,
      towerColor: d.color,
      highlightColor: d.highlightColor,
      projectileColor: d.projectileColor,
      projectileSize: d.projectileSize || 6,
      attackType: getAttackType(towerId),
      splash: !!(d as { splash?: boolean }).splash,
      splashRadius: (d as { splashRadius?: number }).splashRadius || 0,
      slowEffect: !!(d as { slowEffect?: boolean }).slowEffect,
      poisonEffect: !!(d as { poisonEffect?: boolean }).poisonEffect,
      chainCount: (d as { chainCount?: number }).chainCount || 0,
      fireRate: d.fireRate || 1,
      damage: d.damage || d.damagePerSecond || 10,
    };
  }, [towerId, custom]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    lastFireTime: 0,
    recoil: 0,
    enemyHp: 100,
    enemyMaxHp: 100,
    enemyHitFlash: 0,
    enemyKnockback: 0,
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    time: 0,
    laserActive: 0,
    lightningActive: 0,
    flameActive: 0,
    moneyPhase: 0,
  });

  const draw = useCallback(() => {
    if (!params) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Draw Background Grid
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const state = stateRef.current;
    state.time += 16;
    const t = state.time;
    
    const cy = height / 2;
    const towerX = 40;
    const targetX = width - 40;
    const towerRadius = 14;
    const targetRadius = 12;

    const { attackType, towerType, towerColor, highlightColor, projectileColor, projectileSize, splash, splashRadius, slowEffect, poisonEffect, chainCount, fireRate, damage } = params;
    
    // 依據不同等級調整攻擊預覽外觀
    const isHighLevel = level >= 3;
    const isMaxLevel = level >= 5;
    
    // Logic updates
    const cooldown = 1000 / fireRate;
    let justFired = false;
    
    if (attackType === 'none') {
      state.moneyPhase = (t % 1500) / 1500;
    } else if (t - state.lastFireTime >= cooldown) {
      state.lastFireTime = t;
      justFired = true;
      state.recoil = 3;
      
      // Spawn projectiles or active beams
      let muzzleOffset = towerRadius + 4;
      if (towerType === 'sniper') muzzleOffset = towerRadius + 14;
      else if (towerType === 'cannon') muzzleOffset = towerRadius + 7;
      else if (towerType === 'machine' || towerType === 'shotgun') muzzleOffset = towerRadius + 9;
      else if (towerType === 'poison') muzzleOffset = towerRadius + 8;
      else if (towerType === 'flame') muzzleOffset = towerRadius + 6;

      const startX = towerX + muzzleOffset;
      
      if (attackType === 'projectile' || attackType === 'wind') {
        const pSpeed = attackType === 'wind' ? 0.04 : 0.06 * (fireRate > 2 ? 1.5 : 1);
        const spawnProj = (offsetY: number = 0, angleOffset: number = 0, sizeMult: number = 1) => {
          state.projectiles.push({
            x: startX, y: cy + offsetY,
            vx: Math.cos(angleOffset), vy: Math.sin(angleOffset),
            startX, startY: cy + offsetY,
            targetX, targetY: cy,
            progress: 0,
            speed: pSpeed,
            size: projectileSize * sizeMult,
            color: projectileColor,
            trail: []
          });
        };

        if (towerType === 'machine') {
          if (isMaxLevel) {
            spawnProj(-6); spawnProj(-2); spawnProj(2); spawnProj(6);
          } else if (isHighLevel) {
            spawnProj(-4); spawnProj(0); spawnProj(4);
          } else {
            spawnProj(-3); spawnProj(3);
          }
        } else if (towerType === 'shotgun') {
          const pellets = isMaxLevel ? 7 : (isHighLevel ? 5 : 3);
          const spread = isMaxLevel ? Math.PI/4 : Math.PI/6;
          for(let i=0; i<pellets; i++) {
            const angle = -spread/2 + (spread/(pellets-1))*i;
            spawnProj(0, angle, isMaxLevel ? 1.5 : 1);
          }
        } else if (towerType === 'sniper') {
           spawnProj(0, 0, isMaxLevel ? 2 : (isHighLevel ? 1.5 : 1));
        } else if (towerType === 'cannon') {
           if (isMaxLevel) spawnProj(0, 0, 3);
           else if (isHighLevel) { spawnProj(-4, 0, 1.5); spawnProj(4, 0, 1.5); }
           else spawnProj(0, 0, 1.5);
        } else if (towerType === 'pulse') {
          spawnProj(0, 0, isMaxLevel ? 2.5 : 1.5); // 脈衝塔發射能量球
        } else {
          spawnProj(0);
        }
      } else if (attackType === 'laser') {
        state.laserActive = 200;
      } else if (attackType === 'lightning') {
        state.lightningActive = 300;
      } else if (attackType === 'flame') {
        state.flameActive = 1000; // continuous
      }
    }

    if (state.recoil > 0) state.recoil -= 0.2;
    if (state.recoil < 0) state.recoil = 0;
    
    if (state.enemyHitFlash > 0) state.enemyHitFlash -= 0.05;
    if (state.enemyKnockback > 0) state.enemyKnockback -= 0.5;
    if (state.enemyKnockback < 0) state.enemyKnockback = 0;
    
    if (state.enemyHp <= 0) {
      state.enemyHp = state.enemyMaxHp;
      // Spawn death particles
      for(let i=0; i<10; i++) {
        state.particles.push({
          x: targetX, y: cy, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4,
          life: 400, maxLife: 400, size: Math.random()*3+2, color: '#444'
        });
      }
    }

    const hitEnemy = () => {
      state.enemyHitFlash = 1;
      state.enemyHp -= damage;
      if (attackType === 'wind') state.enemyKnockback = 10;
      state.floatingTexts.push({
        x: targetX + (Math.random()-0.5)*10,
        y: cy - 10 - Math.random()*10,
        text: `-${Math.round(damage)}`,
        life: 600, maxLife: 600, color: highlightColor
      });
      
      // Hit particles
      for(let i=0; i< (splash ? 8 : 4); i++) {
        state.particles.push({
          x: targetX, y: cy,
          vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3 - 1,
          life: 300+Math.random()*200, maxLife: 500, size: Math.random()*2+1, color: projectileColor
        });
      }
      
      // Splash ring
      if (splash) {
        state.particles.push({
          x: targetX, y: cy, vx: 0, vy: 0,
          life: 200, maxLife: 200, size: splashRadius * 15, color: projectileColor + '40'
        });
      }
      // Status rings
      if (slowEffect) {
        state.particles.push({
          x: targetX, y: cy, vx: 0, vy: 0, life: 300, maxLife: 300, size: targetRadius + 6, color: '#64c8ff80'
        });
      }
      if (poisonEffect) {
        state.particles.push({
          x: targetX, y: cy, vx: 0, vy: 0, life: 300, maxLife: 300, size: targetRadius + 5, color: '#96ff3280'
        });
      }
    };

    // Update Projectiles
    state.projectiles = state.projectiles.filter(p => {
      p.progress += p.speed;
      p.x = p.startX + (p.targetX - p.startX) * p.progress;
      p.y = p.startY + (p.targetY - p.startY) * p.progress;
      p.trail.push({x: p.x, y: p.y});
      if (p.trail.length > 5) p.trail.shift();
      
      if (p.progress >= 1) {
        hitEnemy();
        return false;
      }
      return true;
    });

    // Handle instant hits
    if (state.laserActive > 0 || state.lightningActive > 0 || state.flameActive > 0) {
      if (justFired) hitEnemy();
      if (state.laserActive > 0) state.laserActive -= 16;
      if (state.lightningActive > 0) state.lightningActive -= 16;
      if (state.flameActive > 0) state.flameActive -= 16;
    }

    // --- Draw Target (Enemy) ---
    const drawEnemyY = cy - state.enemyKnockback;
    ctx.save();
    if (state.enemyHitFlash > 0) {
      ctx.globalAlpha = 0.5 + state.enemyHitFlash * 0.5;
      ctx.filter = `brightness(${1 + state.enemyHitFlash * 2})`;
    }
    drawEnemyModel(ctx, targetX, drawEnemyY, targetRadius, 'orc', '#8b5a2b', t);
    ctx.restore();
    
    // Health bar
    ctx.fillStyle = '#222';
    ctx.fillRect(targetX - 10, drawEnemyY - 20, 20, 3);
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(targetX - 10, drawEnemyY - 20, 20 * Math.max(0, state.enemyHp / state.enemyMaxHp), 3);

    // --- Draw Tower ---
    const idlePulse = Math.sin(t * 0.004) * 0.04;
    const drawRadius = towerRadius * (1 + idlePulse);
    ctx.save();
    drawTowerModel(towerType, {
      ctx, cx: towerX, cy, radius: drawRadius,
      rotation: 0, color: towerColor, highlight: highlightColor,
      level, recoil: state.recoil, tileSize: drawRadius * 2.86,
    });
    ctx.restore();

    let muzzleOffset = towerRadius + 4;
    if (towerType === 'sniper') muzzleOffset = towerRadius + 14;
    else if (towerType === 'cannon') muzzleOffset = towerRadius + 7;
    else if (towerType === 'machine' || towerType === 'shotgun') muzzleOffset = towerRadius + 9;
    else if (towerType === 'poison') muzzleOffset = towerRadius + 8;
    else if (towerType === 'flame') muzzleOffset = towerRadius + 6;
    
    // Draw Attacks
    ctx.globalCompositeOperation = 'lighter';
    
    if (attackType === 'laser' && state.laserActive > 0) {
      const alpha = state.laserActive / 200;
      const width = isMaxLevel ? 12 : (isHighLevel ? 8 : 6);
      ctx.beginPath();
      ctx.moveTo(towerX + muzzleOffset, cy);
      ctx.lineTo(targetX, cy);
      ctx.strokeStyle = `rgba(255, 50, 255, ${alpha * 0.5})`;
      ctx.lineWidth = width; ctx.stroke();
      ctx.strokeStyle = `rgba(255, 200, 255, ${alpha})`;
      ctx.lineWidth = width / 3; ctx.stroke();
      
      // 添加中心高亮白光
      if (isHighLevel) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1; ctx.stroke();
      }
    }
    
    if (attackType === 'lightning' && state.lightningActive > 0) {
      const alpha = state.lightningActive / 300;
      const arcs = isMaxLevel ? 3 : (isHighLevel ? 2 : 1);
      
      for (let j = 0; j < arcs; j++) {
        ctx.beginPath();
        ctx.moveTo(towerX + muzzleOffset, cy + (j-1)*5);
        let lx = towerX + muzzleOffset;
        for(let i=0; i<4; i++) {
          lx += (targetX - towerX)/5;
          ctx.lineTo(lx, cy + (Math.random()-0.5)*20);
        }
        ctx.lineTo(targetX, cy);
        ctx.strokeStyle = j === 0 ? `rgba(255, 255, 255, ${alpha})` : `rgba(100, 200, 255, ${alpha})`;
        ctx.lineWidth = j === 0 ? 3 : 1.5; ctx.stroke();
      }
      
      // Chain targets
      if (chainCount && chainCount > 0) {
        const chainTargets = [
          { x: targetX + 20, y: cy - 22 },
          { x: targetX + 15, y: cy + 25 },
          { x: targetX + 35, y: cy - 5 },
        ];
        for (let i = 0; i < Math.min(chainCount, chainTargets.length); i++) {
          const ct = chainTargets[i];
          ctx.beginPath();
          ctx.moveTo(targetX, cy);
          ctx.lineTo(ct.x, ct.y);
          ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.5})`;
          ctx.lineWidth = 1.5; ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(ct.x, ct.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 100, 100, ${alpha})`;
          ctx.fill();
        }
      }
    }

    if (attackType === 'flame' && state.flameActive > 0) {
      const flameEnd = targetX;
      const flameLen = flameEnd - (towerX + muzzleOffset);
      const particleCount = isMaxLevel ? 30 : (isHighLevel ? 20 : 15);
      const spreadY = isMaxLevel ? 30 : 20;
      
      for(let i=0; i<particleCount; i++) {
        const fx = towerX + muzzleOffset + Math.random()*flameLen;
        const fy = cy + (Math.random()-0.5)*spreadY * (fx - towerX)/(targetX - towerX);
        ctx.beginPath();
        ctx.arc(fx, fy, Math.random()*(isMaxLevel?6:4)+2, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255, ${Math.random()*150+50}, 0, ${isMaxLevel?0.6:0.4})`;
        ctx.fill();
      }
    }

    state.projectiles.forEach(p => {
      if (attackType === 'wind') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(t * 0.02);
        ctx.strokeStyle = p.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI); ctx.stroke();
        ctx.restore();
      } else {
        // Trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for(let i=1; i<p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.strokeStyle = p.color + '80';
          ctx.lineWidth = p.size;
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size*0.5, 0, Math.PI*2);
        ctx.fillStyle = '#fff'; ctx.fill();
      }
    });
    ctx.globalCompositeOperation = 'source-over';

    // Particles (including splash/status rings)
    state.particles = state.particles.filter(p => {
      p.life -= 16;
      if (p.vx !== 0 || p.vy !== 0) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.1; // gravity
        if (p.life <= 0) return false;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fillStyle = p.color; ctx.fill();
      } else {
        // Rings
        if (p.life <= 0) return false;
        const progress = 1 - (p.life / p.maxLife);
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * progress, 0, Math.PI*2);
        ctx.strokeStyle = p.color; ctx.lineWidth = 2; ctx.stroke();
      }
      return true;
    });
    ctx.globalAlpha = 1;

    // Floating Texts
    state.floatingTexts = state.floatingTexts.filter(ft => {
      ft.life -= 16;
      ft.y -= 0.5;
      if (ft.life <= 0) return false;
      ctx.globalAlpha = ft.life / ft.maxLife;
      ctx.fillStyle = ft.color;
      ctx.font = '900 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      return true;
    });
    ctx.globalAlpha = 1;

    // Money Generation
    if (attackType === 'none') {
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${towerRadius}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('$', towerX, cy);
      if (state.moneyPhase < 0.8) {
        const coinY = cy - 20 - state.moneyPhase * 30;
        ctx.globalAlpha = state.moneyPhase < 0.6 ? 1 : 1 - (state.moneyPhase - 0.6) / 0.2;
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('+$', towerX, coinY);
        ctx.globalAlpha = 1;
      }
    }

    // Label
    const labelMap: Record<AttackType, string> = {
      projectile: '投射物', laser: '雷射光束', lightning: '連鎖閃電',
      flame: '火焰噴射', wind: '風刃擊退', none: '產金',
    };
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    ctx.fillText(labelMap[attackType], width - 6, height - 4);

  }, [params, width, height, level]);

  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <div className="relative  overflow-hidden bg-[#0f1115] border border-[var(--hl-line)] ">
      <canvas ref={canvasRef} style={{ width, height, display: 'block' }} />
    </div>
  );
};

export default TowerShootPreview;