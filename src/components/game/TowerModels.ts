// 塔模型繪製系統 (北歐極簡幾何風重設計版)
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
  if (params.radius <= 0) return;

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
    // 融合塔：重用來源模型的幾何繪製，再由 GameCanvas 疊加融合光環
    case 'storm': return drawLightningTowerNordic(params);
    case 'plague': return drawFlameTowerNordic(params);
    case 'demolisher': return drawCannonTowerNordic(params);
    case 'tempest': return drawPulseTowerNordic(params);
    default: return drawBasicTowerNordic(params);
  }
};
