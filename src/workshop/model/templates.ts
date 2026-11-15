// 自訂 3D 塔模型的預設模板：把 towerModels3d.ts 內建塔的幾何位置翻譯成部件資料。
//
// 對應關係（幾何數值直接取自該檔，座標為塔本地座標、y 軸向上）：
//   basicTowerModel   ← buildBasic  （裙邊 + 頸環 + 球塔 + 砲管組 + 側裝甲 + 天線）
//   sniperTowerModel  ← buildSniper （三斜撐 + 細高塔身 + 長管 + 套筒 + 瞄具 + 加速環）
//   cannonTowerModel  ← buildCannon （寬底座 + 側裝甲 + 粗管寬口 + 雙排氣 + 彈藥箱）
//   crystalTowerModel ← buildLaser  （方尖碑 + 透鏡 + 錐體 + 頂部聚能 + 懸浮水晶環）
//     註：towerModels3d.ts 沒有 buildCrystal；水晶塔在遊戲內就是 buildLaser 的水晶環造型。
//
// 部件一律用「塔本地絕對座標」表示（parentId 為 null），與目前 buildCustomTowerModel
// 的渲染方式一致（它尚未處理父子變換）；使用者要階層化再自行在編輯器裡掛 parentId。
//
// 每次呼叫都回傳全新的物件與陣列，呼叫端可安全就地修改。

import type { Custom3DModel, Custom3DPart } from '@/types/game';

const HALF_PI = Math.PI / 2;

/** makePart 的輸入：只寫關心的欄位，其餘補 0／1／false */
type PartSpec = {
  id: string;
  shape: string;
  material: Custom3DPart['material'];
  name: string;
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
  sx?: number;
  sy?: number;
  sz?: number;
  color?: string;
  emissive?: number;
  opacity?: number;
  hidden?: boolean;
  locked?: boolean;
  parentId?: string | null;
  spin?: boolean;
};

function makePart(spec: PartSpec): Custom3DPart {
  return {
    id: spec.id,
    shape: spec.shape,
    material: spec.material,
    x: spec.x ?? 0,
    y: spec.y ?? 0,
    z: spec.z ?? 0,
    rx: spec.rx ?? 0,
    ry: spec.ry ?? 0,
    rz: spec.rz ?? 0,
    scale: spec.scale ?? 1,
    sx: spec.sx,
    sy: spec.sy,
    sz: spec.sz,
    color: spec.color,
    emissive: spec.emissive,
    opacity: spec.opacity,
    name: spec.name,
    hidden: spec.hidden ?? false,
    locked: spec.locked ?? false,
    parentId: spec.parentId ?? null,
    spin: spec.spin ?? false,
  };
}

function model(parts: Custom3DPart[]): Custom3DModel {
  return { parts };
}

/** 通用底座裙邊 + 接地發光環（對應 addSkirt） */
function skirtParts(): Custom3DPart[] {
  return [
    makePart({ id: 'skirt', shape: 'skirt', material: 'trim', name: 'skirt', y: 0.06 }),
    makePart({
      id: 'groundRing',
      shape: 'groundRing',
      material: 'glow',
      name: 'ground ring',
      y: 0.02,
      rx: HALF_PI,
    }),
  ];
}

/** basic：經典砲塔（buildBasic 的 Lv5 形態） */
export function basicTowerModel(): Custom3DModel {
  return model([
    ...skirtParts(),
    makePart({ id: 'base', shape: 'base', material: 'metal', name: 'base', y: 0.36 }),
    makePart({ id: 'collar', shape: 'collar', material: 'trim', name: 'collar', y: 0.64 }),
    makePart({ id: 'turret', shape: 'turret', material: 'accent', name: 'turret', y: 0.8 }),
    makePart({ id: 'dome', shape: 'dome', material: 'trim', name: 'dome', y: 0.9 }),
    makePart({ id: 'barrel', shape: 'barrel', material: 'accent', name: 'barrel', x: 0.22, y: 0.8 }),
    makePart({
      id: 'muzzle',
      shape: 'muzzle',
      material: 'trim',
      name: 'muzzle',
      x: 0.41,
      y: 0.8,
      rz: HALF_PI,
    }),
    makePart({
      id: 'scope',
      shape: 'scope',
      material: 'trim',
      name: 'scope',
      x: 0.14,
      y: 0.93,
      rz: HALF_PI,
    }),
    makePart({ id: 'scopeLight', shape: 'orbSmall', material: 'glow', name: 'scope light', x: 0.24, y: 0.93 }),
    makePart({ id: 'plateLeft', shape: 'plate', material: 'trim', name: 'plate left', y: 0.8, z: 0.24 }),
    makePart({ id: 'plateRight', shape: 'plate', material: 'trim', name: 'plate right', y: 0.8, z: -0.24 }),
    makePart({ id: 'antenna', shape: 'antenna', material: 'metal', name: 'antenna', x: -0.16, y: 1.0 }),
    makePart({
      id: 'antennaLight',
      shape: 'orbSmall',
      material: 'glow',
      name: 'antenna light',
      x: -0.16,
      y: 1.17,
    }),
  ]);
}

/** sniper：細高塔 + 三斜撐 + 長管套筒 + 瞄具 + 加速環 */
export function sniperTowerModel(): Custom3DModel {
  const parts: Custom3DPart[] = [...skirtParts()];
  // 三斜撐腿環繞塔身（pivot 轉向 + 腿頂向塔心傾斜，對應 buildSniper 的 leg 迴圈）
  for (let i = 0; i < 3; i += 1) {
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
    parts.push(makePart({
      id: `leg${i + 1}`,
      shape: 'leg',
      material: 'metal',
      name: `leg ${i + 1}`,
      x: Math.cos(angle) * 0.32,
      y: 0.3,
      z: Math.sin(angle) * 0.32,
      ry: -angle,
      rz: 0.4,
    }));
  }
  parts.push(
    makePart({ id: 'base', shape: 'baseTall', material: 'metal', name: 'base', y: 0.5 }),
    makePart({ id: 'collar', shape: 'collar', material: 'trim', name: 'collar', y: 0.96 }),
    makePart({ id: 'turret', shape: 'turret', material: 'accent', name: 'turret', y: 1.1 }),
    makePart({ id: 'barrel', shape: 'barrelLong', material: 'accent', name: 'barrel', x: 0.18, y: 1.1 }),
    makePart({
      id: 'shroud',
      shape: 'shroud',
      material: 'trim',
      name: 'shroud',
      x: 0.16,
      y: 1.1,
      rz: HALF_PI,
    }),
    makePart({ id: 'brake', shape: 'brake', material: 'trim', name: 'brake', x: 0.41, y: 1.1 }),
    makePart({
      id: 'scope',
      shape: 'scope',
      material: 'trim',
      name: 'scope',
      x: 0.16,
      y: 1.22,
      rz: HALF_PI,
    }),
    makePart({ id: 'scopeLight', shape: 'orbSmall', material: 'glow', name: 'scope light', x: 0.26, y: 1.22 }),
    makePart({
      id: 'halo',
      shape: 'ringThin',
      material: 'glow',
      name: 'halo',
      x: 0.3,
      y: 1.1,
      ry: HALF_PI,
      spin: true,
    }),
  );
  return model(parts);
}

/** cannon：寬重底座 + 側裝甲 + 粗管寬口 + 後部排氣 + 雙側彈藥箱 */
export function cannonTowerModel(): Custom3DModel {
  return model([
    ...skirtParts(),
    makePart({ id: 'base', shape: 'baseWide', material: 'metal', name: 'base', y: 0.3 }),
    makePart({ id: 'plateFront', shape: 'plate', material: 'trim', name: 'plate front', y: 0.42, z: 0.31 }),
    makePart({ id: 'plateBack', shape: 'plate', material: 'trim', name: 'plate back', y: 0.42, z: -0.31 }),
    makePart({ id: 'turret', shape: 'turretBig', material: 'accent', name: 'turret', y: 0.66 }),
    makePart({ id: 'dome', shape: 'dome', material: 'trim', name: 'dome', y: 0.82 }),
    makePart({ id: 'barrel', shape: 'barrelFat', material: 'accent', name: 'barrel', x: 0.24, y: 0.66 }),
    makePart({
      id: 'muzzle',
      shape: 'muzzleWide',
      material: 'trim',
      name: 'muzzle',
      x: 0.39,
      y: 0.66,
      rz: HALF_PI,
    }),
    makePart({ id: 'brake', shape: 'brake', material: 'metal', name: 'brake', x: 0.2, y: 0.66 }),
    makePart({
      id: 'exhaustLeft',
      shape: 'pipe',
      material: 'trim',
      name: 'exhaust left',
      x: -0.3,
      y: 0.62,
      z: 0.12,
      rz: 0.5,
    }),
    makePart({
      id: 'exhaustRight',
      shape: 'pipe',
      material: 'trim',
      name: 'exhaust right',
      x: -0.3,
      y: 0.62,
      z: -0.12,
      rz: 0.5,
    }),
    makePart({ id: 'ammoLeft', shape: 'ammoBox', material: 'metal', name: 'ammo left', x: -0.12, y: 0.52, z: 0.28 }),
    makePart({ id: 'ammoRight', shape: 'ammoBox', material: 'metal', name: 'ammo right', x: -0.12, y: 0.52, z: -0.28 }),
  ]);
}

/** crystal：方尖碑 + 透鏡 + 錐體 + 頂部聚能 + 懸浮水晶環（對應 buildLaser） */
export function crystalTowerModel(): Custom3DModel {
  const parts: Custom3DPart[] = [
    ...skirtParts(),
    makePart({ id: 'base', shape: 'baseTall', material: 'metal', name: 'base', y: 0.5 }),
    makePart({ id: 'lens', shape: 'lens', material: 'trim', name: 'lens', y: 0.96 }),
    makePart({ id: 'spire', shape: 'cone', material: 'accent', name: 'spire', y: 1.18 }),
    makePart({ id: 'core', shape: 'orbSmall', material: 'glow', name: 'core', y: 1.44 }),
    makePart({ id: 'tip', shape: 'spike', material: 'glow', name: 'tip', y: 1.7 }),
    makePart({
      id: 'ring',
      shape: 'torus',
      material: 'accent',
      name: 'ring',
      y: 0.68,
      rx: HALF_PI,
      spin: true,
    }),
    makePart({
      id: 'ringGlow',
      shape: 'ringThin',
      material: 'glow',
      name: 'ring glow',
      y: 0.84,
      rx: HALF_PI,
    }),
  ];
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    parts.push(makePart({
      id: `shard${i + 1}`,
      shape: 'crystalSmall',
      material: 'glow',
      name: `shard ${i + 1}`,
      x: Math.cos(angle) * 0.3,
      y: 0.68,
      z: Math.sin(angle) * 0.3,
    }));
  }
  return model(parts);
}

/** 模板清單（UI 端用 id 接 i18n，label 只是英文後備顯示） */
export interface TowerModelTemplate {
  id: string;
  label: string;
  build: () => Custom3DModel;
}

export const TOWER_MODEL_TEMPLATES: ReadonlyArray<TowerModelTemplate> = [
  { id: 'basic', label: 'Basic', build: basicTowerModel },
  { id: 'sniper', label: 'Sniper', build: sniperTowerModel },
  { id: 'cannon', label: 'Cannon', build: cannonTowerModel },
  { id: 'crystal', label: 'Crystal', build: crystalTowerModel },
];
