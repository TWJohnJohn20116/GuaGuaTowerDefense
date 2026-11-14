/**
 * 敵人模型渲染（門面）
 *
 * 原本這是 884 行的單檔，2026-11-14 因 TD-07 拆成四塊：
 * - `enemyRendererPrimitives.ts`：型別與共用畫法（眼睛、描邊）
 * - `enemyRendererBasic.ts`：基礎十種造型
 * - `enemyRendererAdvanced.ts`：進階／Mod 十二種造型（含 `drawDefault` 後備）
 * - 本檔：類型 → 造型的映射表，以及對外的 `drawEnemyModel`
 *
 * 拆檔只搬移，不動任何繪製參數；`drawEnemyModel` 的行為與簽名完全不變。
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
  drawJammer,
  drawEscort,
  drawDefault,
} from './enemyRendererAdvanced';
import type { DrawFn } from './enemyRendererPrimitives';

// ========== 渲染器映射表 ==========
//
// 鍵是 `enemyType` 字串。Mod 自訂敵人可能帶來表上沒有的鍵，
// 由 `drawEnemyModel` 的 `|| drawDefault` 接手，所以這裡不需要 `default` 這一項。

const ENEMY_RENDERERS: Record<string, DrawFn> = {
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
  ctx.save();
  const renderer = (enemyType && ENEMY_RENDERERS[enemyType]) || drawDefault;
  renderer(ctx, x, y, radius, color, time);
  ctx.restore();
};
