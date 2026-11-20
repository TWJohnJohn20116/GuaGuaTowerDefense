// 塔模型繪製系統（俯視 2D 糖果貼紙風；與戰鬥、回放及預覽共用）
//
// 本檔案僅作為「dispatch + 公開介面」薄層, 真正的繪製邏輯依塔型分別實作於:
//   - towerModels/basicTowerNordic.ts
//   - towerModels/combatTowersNordic.ts   (sniper, cannon, machine, shotgun)
//   - towerModels/elementTowersNordic.ts  (frost, poison, flame, wind)
//   - towerModels/energyTowersNordic.ts   (laser, lightning, pulse, money)
//   - towerModels/nordicShared.ts         (共用幾何工具與配色)
//
// 注意：砲管朝 +X 方向（右方）繪製，rotation=0 即朝右。
// 遊戲中 rotation = atan2(dy,dx)，0=右 PI/2=下 PI=左 -PI/2=上。

import { getSkinDrawer } from '@/data/skins/skinModelLibrary';
import { drawBasicTowerNordic } from './towerModels/basicTowerNordic';
import {
  drawSniperTowerNordic,
  drawCannonTowerNordic,
  drawMachineTowerNordic,
  drawShotgunTowerNordic,
  drawBallistaTowerNordic,
} from './towerModels/combatTowersNordic';
import {
  drawFrostTowerNordic,
  drawPoisonTowerNordic,
  drawFlameTowerNordic,
  drawWindTowerNordic,
} from './towerModels/elementTowersNordic';
import {
  drawLaserTowerNordic,
  drawLightningTowerNordic,
  drawPulseTowerNordic,
  drawMoneyTowerNordic,
} from './towerModels/energyTowersNordic';

import {
  drawStormTowerNordic,
  drawPlagueTowerNordic,
  drawDemolisherTowerNordic,
  drawTempestTowerNordic,
} from './towerModels/fusionTowersNordic';

export interface TowerDrawParams {
  ctx: CanvasRenderingContext2D;
  cx: number;       // 中心 X
  cy: number;       // 中心 Y
  radius: number;   // 基礎半徑
  rotation: number; // 砲管旋轉角度（0=右）
  color: string;    // 塔主色
  highlight: string; // 高亮色
  level: number;
  recoil: number;   // 後座力偏移量
  tileSize: number;
}

// ============================================================
// 統一入口
// ============================================================
/**
 * 繪製塔模型
 * @param type 塔類型 ID（如 'basic', 'sniper', ...）
 * @param params 繪製參數
 * @param skinModelSetId 可選的皮膚模型集 ID。若指定且該等級存在,
 *                       會優先使用該模型集的繪製函數而非預設塔模型。
 */
export const drawTowerModel = (
  type: string,
  params: TowerDrawParams,
  skinModelSetId?: string,
): void => {
  if (!Number.isFinite(params.radius) || params.radius <= 0 || !Number.isFinite(params.cx) || !Number.isFinite(params.cy)) return;

  // 貼紙底影：塔也要「站在」紙面上，而不是浮著
  const { ctx, cx, cy, radius } = params;
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#2e2440';
  ctx.beginPath();
  ctx.ellipse(cx, cy + radius * 0.8, radius * 0.96, radius * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (skinModelSetId) {
    const drawer = getSkinDrawer(skinModelSetId, params.level);
    if (drawer) {
      drawer(params);
      return;
    }
  }

  switch (type) {
    case 'basic': return drawBasicTowerNordic(params);
    case 'sniper': return drawSniperTowerNordic(params);
    case 'cannon': return drawCannonTowerNordic(params);
    case 'machine': return drawMachineTowerNordic(params);
    case 'shotgun': return drawShotgunTowerNordic(params);
    case 'ballista': return drawBallistaTowerNordic(params);
    case 'frost': return drawFrostTowerNordic(params);
    case 'poison': return drawPoisonTowerNordic(params);
    case 'laser': return drawLaserTowerNordic(params);
    case 'lightning': return drawLightningTowerNordic(params);
    case 'flame': return drawFlameTowerNordic(params);
    case 'money': return drawMoneyTowerNordic(params);
    case 'wind': return drawWindTowerNordic(params);
    case 'pulse': return drawPulseTowerNordic(params);
    // 融合塔各有來源結構融合而成的輪廓，既有合體光環仍由動態層疊加。
    case 'storm': return drawStormTowerNordic(params);
    case 'plague': return drawPlagueTowerNordic(params);
    case 'demolisher': return drawDemolisherTowerNordic(params);
    case 'tempest': return drawTempestTowerNordic(params);
    default: return drawBasicTowerNordic(params);
  }
};
