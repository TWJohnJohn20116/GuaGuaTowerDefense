/**
 * 敵人模型渲染（門面）
 *
 * 原本這是 884 行的單檔，2026-11-14 因 TD-07 拆成四塊：
 * - `enemyRendererPrimitives.ts`：型別與共用畫法（眼睛、描邊）
 * - `enemyRendererBasic.ts`：基礎十種造型
 * - `enemyRendererAdvanced.ts`：特殊十二種造型與 Mod 後備
 * - 本檔：類型 → 造型的映射表，以及對外的 `drawEnemyModel`
 *
 * 本體採與塔一致的糖果貼紙幾何；維持原簽名、體型及靜態精靈快取。
 */

import {
  drawNormal,
  drawFast,
  drawElite,
  drawSpeedy,
  drawTank,
  drawHeavy,
  drawBoss,
  drawFlyer,
  drawHealer,
  drawSpawner,
} from './enemyRendererBasic';
import {
  drawShield,
  drawStealth,
  drawBerserker,
  drawArmored,
  drawMage,
  drawMiniboss,
  drawSwarm,
  drawGhost,
  drawBomber,
  drawSaboteur,
  drawJammer,
  drawEscort,
  drawDefault,
} from './enemyRendererAdvanced';
import type { DrawFn } from './enemyRendererPrimitives';
import type { EnemyType } from '@/types/game';

// ========== 渲染器映射表 ==========
//
// 鍵是 `enemyType` 字串。Mod 自訂敵人可能帶來表上沒有的鍵，
// 由 drawEnemyModel 的自有鍵查表與 drawDefault 後備接手，未知 Mod 名稱也能安全繪製。

const ENEMY_RENDERERS: Record<EnemyType, DrawFn> = {
  normal: drawNormal,
  fast: drawFast,
  elite: drawElite,
  speedy: drawSpeedy,
  tank: drawTank,
  heavy: drawHeavy,
  boss: drawBoss,
  flyer: drawFlyer,
  healer: drawHealer,
  spawner: drawSpawner,
  shield: drawShield,
  stealth: drawStealth,
  berserker: drawBerserker,
  armored: drawArmored,
  mage: drawMage,
  miniboss: drawMiniboss,
  swarm: drawSwarm,
  ghost: drawGhost,
  bomber: drawBomber,
  saboteur: drawSaboteur,
  jammer: drawJammer,
  escort: drawEscort,
};

// ========== 匯出主函數 ==========

/**
 * 繪製敵人獨特模型
 * @param ctx Canvas 2D 渲染上下文
 * @param x 敵人中心 X 座標
 * @param y 敵人中心 Y 座標
 * @param radius 敵人基礎半徑
 * @param enemyType 敵人類型字串
 * @param color 敵人顏色
 * @param time 當前時間戳（用於動畫效果）
 */
export const drawEnemyModel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  /** 選填：mod 自訂敵人沒有 modelType 時走 drawDefault */
  enemyType: string | undefined,
  color: string,
  time: number
) => {
  if (!Number.isFinite(radius) || radius <= 0 || !Number.isFinite(x) || !Number.isFinite(y)) return;
  ctx.save();
  // 不覆寫出生、隱身與相位的外層透明度；直接繪製與快取精靈維持一致。
  const alpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha * 0.16;
  ctx.fillStyle = '#2e2440';
  ctx.beginPath();
  ctx.ellipse(x, y + radius * 0.72, radius * 0.9, radius * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = alpha;

  const renderer = enemyType && Object.prototype.hasOwnProperty.call(ENEMY_RENDERERS, enemyType)
    ? ENEMY_RENDERERS[enemyType as EnemyType]
    : drawDefault;
  renderer(ctx, x, y, radius, color, time);
  ctx.restore();
};
