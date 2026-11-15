/**
 * GameCanvasDynamic.ts - 遊戲畫布動態層繪製
 *
 * 負責繪製: 升級動畫、出售動畫、火焰塔噴射、敵人、子彈、傷害文字、玩家技能特效。
 * 這些元素每幀重繪。
 */

import { drawEnemyModel } from '@/utils/enemyRenderer';
import { getEnemySprite } from '@/utils/enemySpriteCache';
import { getEnemyData, getEnemyVisuals, getTowerVisuals, getTowerData } from '@/store/gameStoreUtils';
import { ENEMY_DATA } from '@/data/gameData';
import { hasEnemyAbility } from '@/data/gameData/enemyAbilities';
import type { RenderSnapshot } from '@/data/renderSnapshot';
import { drawTowerModel } from '@/components/game/TowerModels';
import type { TowerType, Tower, Enemy, Projectile, GridPosition, DamageText, ImpactParticle, DeathAnimation } from '@/types/game';
import type { PlayerSkillAnimation } from '@/store/gameStoreTypes';
import { drawUpgradeAnimations } from './GameCanvasUpgradeFx';
import { drawSellAnimations as drawSellAnimationsFx, drawPlaceParticles, drawBuildText } from './GameCanvasPlaceFx';
import { drawPlayerSkillAnimations } from './GameCanvasPlayerSkillFx';
import { drawDeathAnimations } from './GameCanvasDeathFx';
import { drawFusionAnimations } from './GameCanvasFusionFx';
import { drawProjectilesNordic } from './projectileRenderNordic';
import { drawFlameEffectsNordic } from './flameEffectNordic';
import { createStatusRingBatch } from './GameCanvasStatusRings';
import { getSynergyModsForTower, listActiveSynergyLinks, toTowerRef } from '@/data/towerSynergyData';
import { collectJammerAurasCached, isTowerJammed, type JammerAura } from '@/data/jammerAura';
import { getMoneyAuraRange } from '@/data/moneyAura';
import { healthBarColorCss } from '@/data/healthBarColor';
import { fxProgress } from '@/data/fxProgress';
import { shouldShowTowerHealthBar } from '@/data/towerHealthBarVisibility';

// ===== 除錯資訊繪製 =====

function drawDebugInfo(
  ctx: CanvasRenderingContext2D,
  _now: number,
  _tileSize: number,
  _offsetX: number,
  _offsetY: number,
  enemies: Enemy[],
  towers: Tower[],
  projectiles: Projectile[],
  fps: number = 0
): void {
  ctx.font = '12px monospace';
  ctx.fillStyle = '#00ff00';
  ctx.textAlign = 'left';

  let y = 20;
  const x = 10;

  ctx.fillText(`敵人: ${enemies.length}`, x, y); y += 16;
  ctx.fillText(`塔: ${towers.length}`, x, y); y += 16;
  ctx.fillText(`子彈: ${projectiles.length}`, x, y); y += 16;
  ctx.fillText(`FPS: ${fps || '--'}`, x, y); y += 16;
  ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, x, y);
}

function drawHitboxes(
  ctx: CanvasRenderingContext2D,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  enemies: Enemy[],
  towers: Tower[],
  projectiles: Projectile[]
): void {
  // 敵人碰撞框
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
  ctx.lineWidth = 2;

  enemies.forEach(enemy => {
    const ex = offsetX + enemy.x * tileSize;
    const ey = offsetY + enemy.y * tileSize;
    const size = (enemy.size / 50) * tileSize * 0.8;
    ctx.strokeRect(ex - size / 2, ey - size / 2, size, size);

    // 敵人血條底
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(ex - size / 2, ey - size / 2 - 8, size, 4);
    // 敵人血量
    const healthPercent = enemy.health / enemy.maxHealth;
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(ex - size / 2, ey - size / 2 - 8, size * healthPercent, 4);
  });

  // 塔的格子框
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
  towers.forEach(tower => {
    const tx = offsetX + tower.pos.x * tileSize;
    const ty = offsetY + tower.pos.y * tileSize;
    ctx.strokeRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);
  });

  // 子彈碰撞框
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
  projectiles.forEach(proj => {
    const px = offsetX + proj.x * tileSize;
    const py = offsetY + proj.y * tileSize;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.stroke();
  });
}

// ===== 型別定義 =====

type GetSkinVisuals = (type: TowerType) => any;
type GetSkinModelSet = (type: TowerType) => string | undefined;

interface DynamicLayerParams {
  /** 這一幀的渲染快照（2D 與 3D 共用的純函式契約），敵人本體只從這裡取資料 */
  snapshot: RenderSnapshot;
  upgradeAnimations: { id: string; towerId: string; pos: MapPoint; newLevel: number; towerColor: string; startTime: number; isMaxLevel?: boolean }[];
  sellAnimations: { id: string; pos: MapPoint; towerColor: string; startTime: number }[];
  fusionAnimations: Array<{ id: string; pos: MapPoint; resultType: string; startTime: number; colorA: string; colorB: string }>;
  playerSkillAnimations: PlayerSkillAnimation[];
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  damageTexts: DamageText[];
  impactParticles: ImpactParticle[];
  deathAnimations: DeathAnimation[];
  tileSize: number;
  offsetX: number;
  offsetY: number;
  getSkinVisuals: GetSkinVisuals;
  getSkinModelSet?: GetSkinModelSet;
  showDebugInfo: boolean;
  showHitboxes: boolean;
  showHealthBars?: boolean;
  showFPS?: boolean;
  fps?: number;
  fusionBurstLabel?: string;
  maxLevelLabel?: string;
}

// ===== 動態層主入口 =====
export function renderDynamicLayer(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  params: DynamicLayerParams
): void {
  const {
    snapshot,
    upgradeAnimations, sellAnimations, fusionAnimations, playerSkillAnimations,
    towers, enemies, projectiles,
    damageTexts, impactParticles, deathAnimations,
    tileSize, offsetX, offsetY, getSkinVisuals, getSkinModelSet,
    showDebugInfo, showHitboxes, showHealthBars = true, showFPS, fps, fusionBurstLabel, maxLevelLabel
  } = params;

  // 時間只認 snapshot：先前這裡用 Date.now()、GameCanvas 用 performance.now()，同一幀兩個基準
  const now = snapshot.timeMs;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 除錯資訊 (左上角覆蓋層)
  if (showDebugInfo) {
    drawDebugInfo(ctx, now, tileSize, offsetX, offsetY, enemies, towers, projectiles, fps);
  } else if (showFPS) {
    // 僅顯示 FPS
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.textAlign = 'left';
    ctx.fillText(`FPS: ${fps || '--'}`, 10, 24);
  }

  // 碰撞框 (debug)
  if (showHitboxes) {
    drawHitboxes(ctx, tileSize, offsetX, offsetY, enemies, towers, projectiles);
  }

  // 升級動畫
  drawUpgradeAnimations(ctx, now, tileSize, offsetX, offsetY, upgradeAnimations, maxLevelLabel);

  // 出售動畫
  drawSellAnimationsFx(ctx, now, tileSize, offsetX, offsetY, sellAnimations);
  drawFusionAnimations(ctx, now, tileSize, offsetX, offsetY, fusionAnimations, fusionBurstLabel);

  // 火焰塔噴射特效 (北歐極簡幾何風重設計; 實作於 flameEffectNordic.ts)
  drawFlameEffectsNordic(ctx, now, tileSize, offsetX, offsetY, snapshot);

  // 擊中粒子
  drawImpactParticles(ctx, now, tileSize, offsetX, offsetY, impactParticles);

  // 第四層: 塔模型 (放在火焰特效之後讓塔覆蓋特效底部；塔身/血條/協同連線都吃 snapshot)
  drawSynergyLinks(ctx, now, tileSize, offsetX, offsetY, snapshot);
  drawTowers(ctx, now, tileSize, offsetX, offsetY, snapshot, getSkinVisuals, getSkinModelSet, collectJammerAurasCached(enemies, ENEMY_DATA, now));

  // 第五層: 敵人 (使用統一敵人模型；資料來自渲染 snapshot)
  drawEnemies(ctx, now, tileSize, offsetX, offsetY, snapshot, showHealthBars);

  // 第六層: 敵人死亡動畫 (放在敵人之上、其它特效之下)
  drawDeathAnimations(ctx, now, tileSize, offsetX, offsetY, deathAnimations);

  // 第七層: 子彈 (北歐極簡幾何風重設計; 實作於 projectileRenderNordic.ts)
  drawProjectilesNordic(ctx, now, tileSize, offsetX, offsetY, snapshot, getSkinVisuals);

  // 傷害文字
  drawDamageTexts(ctx, now, tileSize, offsetX, offsetY, damageTexts);

  // 第八層: 塔血條
  drawTowerHealthBars(ctx, tileSize, offsetX, offsetY, snapshot, showHealthBars);

  // 第九層: 主動技能動畫 (放在最上層, 讓技能特效覆蓋一切)
  drawPlayerSkillAnimations(
    ctx,
    now,
    canvasWidth,
    canvasHeight,
    tileSize,
    offsetX,
    offsetY,
    playerSkillAnimations,
    snapshot,
  );
}

// ===== 塔血條 =====
function drawTowerHealthBars(
  ctx: CanvasRenderingContext2D,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  snapshot: RenderSnapshot,
  showHealthBars: boolean,
): void {
  const frames = snapshot.towers;
  for (let i = 0; i < snapshot.towerCount; i++) {
    const tower = frames[i];
    if (!shouldShowTowerHealthBar(tower.health, tower.maxHealth, showHealthBars)) continue;
    const tx = offsetX + tower.pos.x * tileSize;
    const ty = offsetY + tower.pos.y * tileSize;
    const barWidth = tileSize * 0.8;
    const barHeight = 4;
    const barX = tx + (tileSize - barWidth) / 2;
    const barY = ty - 6;

    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(barX, barY, barWidth * tower.healthRatio, barHeight);
  }
}

// ===== 傷害文字 / 金錢文字 =====

function drawDamageTexts(
  ctx: CanvasRenderingContext2D,
  now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  damageTexts: DamageText[]
): void {
  ctx.textAlign = 'center';
  damageTexts.forEach(t => {
    const progress = fxProgress(t.startTime, t.duration, now);
    const alpha = Math.min(1, (1 - progress) * 1.5);

    const tx = offsetX + t.x * tileSize;
    const ty = offsetY + t.y * tileSize;

    const baseFontMul = t.isMoney ? 0.45 : (t.isCrit ? 0.55 : 0.4);
    const fontSize = Math.floor(tileSize * baseFontMul);
    ctx.font = `900 ${fontSize}px "Noto Sans TC", sans-serif`;

    const label = `${t.prefix || ''}${t.value}${t.suffix || ''}`;

    // 陰影
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.6})`;
    ctx.fillText(label, tx + 2, ty + 2);

    // 金錢類型 ── 帶發光暈
    if (t.isMoney) {
      ctx.save();
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10 * alpha;
      ctx.fillStyle = t.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillText(label, tx, ty);
      ctx.restore();
      return;
    }

    const baseColor = t.color.startsWith('#') ? t.color : '#ffffff';
    ctx.fillStyle = baseColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.fillText(label, tx, ty);
  });
}

function drawImpactParticles(
  ctx: CanvasRenderingContext2D,
  _now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  impactParticles: ImpactParticle[]
): void {
  impactParticles.forEach(p => {
    const px = offsetX + p.x * tileSize;
    const py = offsetY + p.y * tileSize;

    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, py, p.size * (tileSize / 60), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// 升級 / 出售動畫已搬至 ./GameCanvasUpgradeFx.ts 與 ./GameCanvasPlaceFx.ts
// 火焰塔噴射特效已搬至 ./flameEffectNordic.ts (drawFlameEffectsNordic)

// 緩動函數 (easeOutBack 帶輕微反彈)
const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// ===== 鄰塔協同連線 =====
function drawSynergyLinks(
  ctx: CanvasRenderingContext2D,
  now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  snapshot: RenderSnapshot,
): void {
  const frames = snapshot.towers;
  const refs = frames.slice(0, snapshot.towerCount).map(toTowerRef);
  const links = listActiveSynergyLinks(refs);
  if (links.length === 0) return;
  const byId = new Map<string, { pos: { x: number; y: number } }>();
  for (let i = 0; i < snapshot.towerCount; i++) {
    byId.set(frames[i].id, frames[i]);
  }
  const pulse = 0.45 + 0.55 * Math.sin(now / 280);
  ctx.save();
  ctx.strokeStyle = `rgba(56, 189, 248, ${0.35 + pulse * 0.3})`;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  for (const link of links) {
    const a = byId.get(link.aId);
    const b = byId.get(link.bId);
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(offsetX + a.pos.x * tileSize, offsetY + a.pos.y * tileSize);
    ctx.lineTo(offsetX + b.pos.x * tileSize, offsetY + b.pos.y * tileSize);
    ctx.stroke();
  }
  ctx.restore();
}

// ===== 繪製塔模型 =====
function drawTowers(
  ctx: CanvasRenderingContext2D,
  now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  snapshot: RenderSnapshot,
  getSkinVisuals: GetSkinVisuals,
  getSkinModelSet?: GetSkinModelSet,
  jammerAuras: JammerAura[] = [],
): void {
  const towerFrames = snapshot.towers;
  const synergyRefs = towerFrames.slice(0, snapshot.towerCount).map(toTowerRef);
  for (let towerIndex = 0; towerIndex < snapshot.towerCount; towerIndex++) {
    const tower = towerFrames[towerIndex];
    const x = offsetX + tower.pos.x * tileSize;
    const y = offsetY + tower.pos.y * tileSize;
    const modVisuals = getTowerVisuals(tower.type);
    // 自由制：pos 就是塔的中心點，不再有「格左上 + 半格」的換算
    const centerX = x;
    const centerY = y;
    const baseRadius = tileSize * 0.35;

    // === 建造動畫 ===
    const buildElapsed = tower.placedAt ? now - tower.placedAt : 9999;
    const buildDuration = 400;
    const buildProgress = Math.min(1, buildElapsed / buildDuration);
    const buildScale = buildProgress < 1 ? 0.3 + 0.7 * easeOutBack(buildProgress) : 1;
    const buildAlpha = Math.min(1, buildProgress * 2);

    // === 待機呼吸 ===
    const idlePulse = Math.sin(now * 0.003 + tower.pos.x * 0.7 + tower.pos.y * 1.1) * 0.03;

    // === 攻擊後座力 ===
    const attackElapsed = tower.lastAttackTime ? now - tower.lastAttackTime : 9999;
    const recoilDuration = 150;
    const recoilAmount = attackElapsed < recoilDuration ? (1 - attackElapsed / recoilDuration) * 4 : 0;

    // === 升級動畫 (脈衝 + 發光) ===
    const upgradeElapsed = tower.lastUpgradeTime ? now - tower.lastUpgradeTime : 9999;
    const upgradePulseDur = 800;
    let upgradeScale = 1;
    if (upgradeElapsed < upgradePulseDur) {
      const p = upgradeElapsed / upgradePulseDur;
      // easeOutBack: 放大到 1.25 再回 1
      upgradeScale = 1 + Math.sin(p * Math.PI) * 0.25;
    }

    const radius = baseRadius * (buildScale + idlePulse) * upgradeScale;

    ctx.save();
    if (buildProgress < 1) ctx.globalAlpha = buildAlpha;

    // 皮膚或基本配色
    const skinVisuals = getSkinVisuals(tower.type as TowerType);
    const towerData = getTowerData(tower.type);
    const towerColor = skinVisuals?.color || towerData?.color || '#3b82f6';
    const highlightColor = skinVisuals?.highlightColor || towerData?.highlightColor || '#60a5fa';
    const effectiveGlowColor = skinVisuals?.glowColor || modVisuals.glowColor;
    const effectiveGlowIntensity = skinVisuals?.glowIntensity || modVisuals.glowIntensity;
    const hasAura = skinVisuals?.auraEffect;
    const auraColor = skinVisuals?.auraColor;
    const effectiveRadius = Math.max(0.1, radius * modVisuals.modelScale);
    const synergyActive = getSynergyModsForTower(toTowerRef(tower), synergyRefs).linkIds.length > 0;

    // 光環 (若有, 常駐光暈)
    if (hasAura && auraColor) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, effectiveRadius + 12, 0, Math.PI * 2);
      ctx.fillStyle = auraColor;
      ctx.fill();
    }

    if (synergyActive) {
      const pulse = 0.55 + 0.45 * Math.sin(now / 320 + tower.pos.x);
      ctx.save();
      ctx.globalAlpha = 0.35 + pulse * 0.25;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, effectiveRadius + 8 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (tower.type === 'money') {
      const auraR = getMoneyAuraRange(tower.level) * tileSize;
      const pulse = 0.55 + 0.45 * Math.sin(now * 0.0028 + tower.pos.x);
      ctx.save();
      ctx.globalAlpha = 0.2 + pulse * 0.12;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.95)';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, auraR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (isTowerJammed(tower.pos.x, tower.pos.y, jammerAuras)) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.008 + tower.pos.y);
      ctx.save();
      ctx.globalAlpha = 0.35 + pulse * 0.25;
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.95)';
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, effectiveRadius + 11 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 發光效果 (來自 Mod 設定)
    if (effectiveGlowColor && effectiveGlowIntensity > 0) {
      ctx.shadowColor = effectiveGlowColor;
      ctx.shadowBlur = 15 * effectiveGlowIntensity;
    }

    // 升級期間額外發光
    if (upgradeElapsed < upgradePulseDur) {
      const upgradeP = upgradeElapsed / upgradePulseDur;
      ctx.shadowColor = towerColor;
      ctx.shadowBlur = (1 - upgradeP) * 25;
    }

    // 使用塔模型統一繪製系統, 支援 Mod 模型類型 + 皮膚模型集
    const skinModelSetId = getSkinModelSet?.(tower.type as TowerType);
    drawTowerModel(modVisuals.modelType, {
      ctx, cx: centerX, cy: centerY, radius: effectiveRadius,
      rotation: tower.rotation,
      color: towerColor, highlight: highlightColor,
      level: tower.level, recoil: recoilAmount * modVisuals.barrelLength, tileSize,
    }, skinModelSetId);

    // 重設陰影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 融合塔：疊加脈動雙環光環，標示其為合體產物
    if (tower.fusedFrom) {
      const haloPulse = 0.5 + 0.5 * Math.sin(now / 380);
      const ringR = effectiveRadius + 6 + haloPulse * 3;
      ctx.save();
      ctx.globalAlpha = 0.55 + haloPulse * 0.35;
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = towerColor;
      ctx.shadowColor = towerColor;
      ctx.shadowBlur = 12 + haloPulse * 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.3 + haloPulse * 0.2;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringR + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 攻擊閃光 (雷射 / 閃電 / 錢塔除外)
    if (attackElapsed < 80 && tower.type !== 'laser' && tower.type !== 'lightning' && tower.type !== 'money') {
      const flashAlpha = 1 - attackElapsed / 80;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(tower.rotation);
      const muzzleX = (tower.type === 'sniper' ? radius + 14 : radius + 8) - recoilAmount;
      ctx.beginPath();
      ctx.arc(muzzleX, 0, 4 + flashAlpha * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 200, ${flashAlpha * 0.8})`;
      ctx.fill();
      ctx.restore();
    }

    // 建造時的環形擴散
    if (buildElapsed < buildDuration * 1.5) {
      const ringP = buildElapsed / (buildDuration * 1.5);
      const ringR = baseRadius + ringP * tileSize * 0.4;
      const ringAlpha = (1 - ringP) * 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = towerColor;
      ctx.lineWidth = 2 * (1 - ringP);
      ctx.globalAlpha = ringAlpha;
      ctx.stroke();
    }

    // 建造時的粒子
    if (buildElapsed < 700) {
      ctx.globalAlpha = 1;
      drawPlaceParticles(ctx, buildElapsed, tileSize, centerX, centerY, towerColor);
    }

    // 建造時的金錢文字 -$N (扣款顯示)
    if (buildElapsed < 1000 && towerData?.cost) {
      ctx.globalAlpha = 1;
      drawBuildText(ctx, buildElapsed, tileSize, centerX, centerY, towerData.cost);
    }

    // 鎖定指示 (右上角小鎖)
    if (tower.locked) {
      ctx.globalAlpha = 1;
      const lockX = centerX + radius * 0.7;
      const lockY = centerY - radius * 0.7;
      const lockSize = tileSize * 0.14;
      // 圓底
      ctx.beginPath();
      ctx.arc(lockX, lockY, lockSize * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // 鎖體
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(lockX - lockSize * 0.4, lockY - lockSize * 0.1, lockSize * 0.8, lockSize * 0.6);
      // 鎖環
      ctx.beginPath();
      ctx.arc(lockX, lockY - lockSize * 0.2, lockSize * 0.3, Math.PI, 0, false);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fbbf24';
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ===== 繪製敵人 =====
// 出生動畫時長（毫秒）
const ENEMY_SPAWN_DURATION = 380;

function drawEnemies(
  ctx: CanvasRenderingContext2D,
  now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  snapshot: RenderSnapshot,
  showHealthBars = true,
): void {
  const enemyTime = now;
  // 狀態環先收集、迴圈跑完再一次性描繪（見 GameCanvasStatusRings：每幀數萬次 stroke → 個位數）
  const ringBatch = createStatusRingBatch();
  const frames = snapshot.enemies;
  const enemyCount = snapshot.enemyCount;
  // 迴圈變數 enemy 是 snapshot frame，不是 store 的 Enemy 物件：
  // x/y/size/healthRatio/ghostFade/abilitySuppressed 都由純函式層算好，這裡不再回查 store。
  for (let frameIndex = 0; frameIndex < enemyCount; frameIndex++) {
    const enemy = frames[frameIndex];
    const enemyData = getEnemyData(enemy.originType ?? enemy.type);
    const x = offsetX + enemy.x * tileSize;
    const y = offsetY + enemy.y * tileSize;
    const radius = (enemy.size / 50) * tileSize * 0.4;

    const enemyVisuals = getEnemyVisuals(enemy.type, enemy.originType);
    const enemyRadius = radius * enemyVisuals.modelScale;

    // 出生動畫：縮放彈入 + 淡入 + 擴散光環（spawnAgeMs < 0 = 沒有出生時間，視為動畫已結束）
    const spawnAge = enemy.spawnAgeMs >= 0 ? enemy.spawnAgeMs : ENEMY_SPAWN_DURATION;
    const spawning = spawnAge >= 0 && spawnAge < ENEMY_SPAWN_DURATION;
    const spawnT = spawning ? spawnAge / ENEMY_SPAWN_DURATION : 1;
    const spawnScale = spawning ? Math.max(0, easeOutBack(spawnT)) : 1;
    const spawnAlpha = spawning ? Math.min(1, spawnT / 0.5) : 1;

    // 出生擴散光環（繪於模型底下）
    if (spawning) {
      const ringRadius = enemyRadius * (0.5 + spawnT * 1.9);
      ctx.save();
      ctx.globalAlpha = (1 - spawnT) * 0.7;
      ctx.strokeStyle = enemyData?.color || '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 治療敵人：脈動治療光環（繪於模型底下，半徑 = healRadius；50px = 1 格）
    if (hasEnemyAbility(enemyData, 'healing') && enemyData.healRadius && !enemy.abilitySuppressed) {
      const auraRadius = (enemyData.healRadius / 50) * tileSize;
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.004);
      ctx.save();
      ctx.globalAlpha = 0.10 + pulse * 0.08;
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.25 + pulse * 0.2;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // 干擾敵人：紫色干擾光環（半徑 = jamRadius；50px = 1 格；被控場時關閉）
    if (hasEnemyAbility(enemyData, 'jam') && enemyData.jamRadius && !enemy.abilitySuppressed) {
      const auraRadius = (enemyData.jamRadius / 50) * tileSize;
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.005 + x);
      ctx.save();
      ctx.globalAlpha = 0.10 + pulse * 0.08;
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.35 + pulse * 0.2;
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 護航敵人：鋼青裝甲光環（半徑 = escortRadius；50px = 1 格；被控場時關閉）
    if (hasEnemyAbility(enemyData, 'escort') && enemyData.escortRadius && !enemy.abilitySuppressed) {
      const auraRadius = (enemyData.escortRadius / 50) * tileSize;
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.004 + y);
      ctx.save();
      ctx.globalAlpha = 0.10 + pulse * 0.08;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.35 + pulse * 0.2;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 隱身敵人：隱身期間僅剩幽影（玩家可微弱辨識，塔無法鎖定）
    const stealthFade = enemy.stealthFade;
    // 幽靈敵人：相位期間半透明虛體（無法鎖定且免疫傷害）
    const phaseFade = enemy.phaseFade;

    // 模型（含發光），出生期間套用縮放與透明度（以中心為基準）
    ctx.save();
    if (spawning) {
      ctx.globalAlpha = spawnAlpha;
      ctx.translate(x, y);
      ctx.scale(spawnScale, spawnScale);
      ctx.translate(-x, -y);
    }
    if (stealthFade > 0) {
      ctx.globalAlpha = ctx.globalAlpha * (1 - stealthFade * 0.8);
    }
    if (phaseFade > 0) {
      ctx.globalAlpha = ctx.globalAlpha * (1 - phaseFade * 0.72);
    }
    // 本體：優先畫快取精靈（光暈已烘進去，一次 drawImage 取代十幾次路徑繪製 + shadowBlur）；
    // 沒有離屏 canvas 的環境（jsdom 測試）退回原本的直接繪製。
    const sprite = getEnemySprite({
      modelType: enemyVisuals.modelType,
      color: enemyData?.color || '#ef4444',
      radius: enemyRadius,
      glowColor: enemyVisuals.glowColor,
      glowIntensity: enemyVisuals.glowIntensity,
    });

    if (sprite) {
      // 外層的 translate/scale（出生動畫）與 globalAlpha（隱身/相位/出生淡入）照樣生效
      ctx.drawImage(sprite.image, x - sprite.half, y - sprite.half, sprite.size, sprite.size);
    } else {
      if (enemyVisuals.glowColor && enemyVisuals.glowIntensity > 0) {
        ctx.shadowColor = enemyVisuals.glowColor;
        ctx.shadowBlur = 12 * enemyVisuals.glowIntensity;
      }
      drawEnemyModel(ctx, x, y, enemyRadius, enemyVisuals.modelType, enemyData?.color || '#ef4444', enemyTime);
    }
    ctx.restore();

    // 被護航：鋼青實線圈，標示這隻敵人目前有額外裝甲
    if (enemy.escortArmor > 0) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.007 + x);
      ctx.save();
      ctx.globalAlpha = 0.4 + pulse * 0.25;
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.95)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(x, y, enemyRadius + 5 + pulse * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 隱身虛線輪廓（提示玩家位置但保持「難以瞄準」的視覺語言）
    if (stealthFade > 0.5) {
      ctx.save();
      ctx.globalAlpha = (stealthFade - 0.5) * 2 * 0.5;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(x, y, enemyRadius + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 相位雙重輪廓（藍白虛體，與隱身的銀灰虛線作出區隔）
    if (phaseFade > 0.3) {
      const pa = (phaseFade - 0.3) / 0.7;
      ctx.save();
      ctx.globalAlpha = pa * 0.55;
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.arc(x, y, enemyRadius + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = pa * 0.3;
      ctx.beginPath();
      ctx.arc(x, y, enemyRadius + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 護盾圈：護盾值尚存時顯示藍色防護罩
    if (enemy.shield > 0 && enemy.maxShield > 0) {
      const shieldRatio = enemy.shieldRatio;
      ctx.save();
      ctx.globalAlpha = 0.25 + shieldRatio * 0.35;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, enemyRadius + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.08 + shieldRatio * 0.07;
      ctx.fillStyle = '#60a5fa';
      ctx.fill();
      ctx.restore();
    }

    ringBatch.add(enemy, x, y, radius, now);

    if (!showHealthBars) continue;

    // 血條（出生期間隨敵人淡入）
    ctx.save();
    if (spawning) ctx.globalAlpha = spawnAlpha;
    const barWidth = radius * 2;
    const barHeight = 4;
    const barY = y - radius - 8;
    ctx.fillStyle = '#1a1d24';
    ctx.fillRect(x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);

    const healthPercent = enemy.healthRatio;
    ctx.fillStyle = healthBarColorCss(healthPercent);
    ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, barHeight);

    // 護盾條（血條上方的藍色細條）
    if (enemy.maxShield > 0 && enemy.shield > 0) {
      const shieldPercent = enemy.shieldRatio;
      const sBarY = barY - 4;
      ctx.fillStyle = '#1a1d24';
      ctx.fillRect(x - barWidth / 2 - 1, sBarY - 1, barWidth + 2, 3 + 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x - barWidth / 2, sBarY, barWidth * shieldPercent, 3);
    }
    ctx.restore();
  }

  ringBatch.flush(ctx);
}
