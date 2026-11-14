/**
 * 3D 模型編輯器 · 部件庫與模板
 * shape key 與 towerModels3d 的共享幾何（TOWER_PART_SHAPES）一一對應
 */

import type { Custom3DPart, Custom3DModel } from '@/types/game';

export interface ShapeDef {
  id: string;
  name: string;
}

export interface ShapeCategory {
  name: string;
  shapes: ShapeDef[];
}

/** 部件庫（分類陳列；id 必須存在於 TOWER_PART_SHAPES） */
export const SHAPE_CATEGORIES: ShapeCategory[] = [
  {
    name: '底座',
    shapes: [
      { id: 'base', name: '圓底座' },
      { id: 'baseWide', name: '寬底座' },
      { id: 'baseTall', name: '高塔身' },
      { id: 'baseHex', name: '六稜座' },
      { id: 'skirt', name: '裙邊' },
      { id: 'skirtHex', name: '六稜裙邊' },
      { id: 'collar', name: '頸環' },
      { id: 'leg', name: '支撐腿' },
    ],
  },
  {
    name: '塔身',
    shapes: [
      { id: 'turret', name: '球形砲塔' },
      { id: 'turretBig', name: '大球塔' },
      { id: 'dome', name: '半球頂' },
      { id: 'pole', name: '長杆' },
      { id: 'plate', name: '裝甲板' },
      { id: 'shield', name: '護盾板' },
    ],
  },
  {
    name: '武器',
    shapes: [
      { id: 'barrel', name: '砲管' },
      { id: 'barrelLong', name: '長砲管' },
      { id: 'barrelFat', name: '粗砲管' },
      { id: 'barrelShort', name: '短砲管' },
      { id: 'muzzle', name: '砲口' },
      { id: 'muzzleWide', name: '寬砲口' },
      { id: 'brake', name: '制退器' },
      { id: 'shroud', name: '套筒' },
      { id: 'scope', name: '瞄準鏡' },
      { id: 'nozzle', name: '噴嘴' },
      { id: 'blade', name: '葉片' },
    ],
  },
  {
    name: '能量',
    shapes: [
      { id: 'orb', name: '能量球' },
      { id: 'orbSmall', name: '小光球' },
      { id: 'crystal', name: '大水晶' },
      { id: 'crystalSmall', name: '小水晶' },
      { id: 'cone', name: '錐體' },
      { id: 'spike', name: '尖刺' },
      { id: 'coil', name: '線圈' },
      { id: 'torus', name: '大環' },
      { id: 'ringThin', name: '細環' },
      { id: 'bandRing', name: '腰環' },
      { id: 'halo', name: '光環' },
      { id: 'energyBeam', name: '能量柱' },
      { id: 'lens', name: '透鏡' },
    ],
  },
  {
    name: '裝飾',
    shapes: [
      { id: 'ammoBox', name: '彈藥箱' },
      { id: 'tank', name: '副油罐' },
      { id: 'pipe', name: '管線' },
      { id: 'fin', name: '散熱片' },
      { id: 'antenna', name: '天線' },
      { id: 'valve', name: '閥門' },
      { id: 'bolt', name: '鉚釘' },
      { id: 'coin', name: '金幣' },
      { id: 'coinSmall', name: '小金幣' },
      { id: 'nacelle', name: '機艙' },
      { id: 'tailFin', name: '尾舵' },
    ],
  },
];

/** 部件 id → 顯示名（屬性面板 / 列表用） */
export const SHAPE_NAME: Record<string, string> = Object.fromEntries(
  SHAPE_CATEGORIES.flatMap((c) => c.shapes.map((s) => [s.id, s.name])),
);

let partSeq = 0;
/** 產生唯一部件 id */
export const newPartId = (): string => `p${Date.now().toString(36)}_${(partSeq++).toString(36)}`;

/** 建立預設新部件 */
export const createPart = (shape: string, overrides: Partial<Custom3DPart> = {}): Custom3DPart => ({
  id: newPartId(),
  shape,
  material: 'accent',
  x: 0,
  y: 0.5,
  z: 0,
  rx: 0,
  ry: 0,
  rz: 0,
  scale: 1,
  ...overrides,
});

const p = (
  shape: string,
  material: Custom3DPart['material'],
  x: number,
  y: number,
  z: number,
  extra: Partial<Custom3DPart> = {},
): Custom3DPart => createPart(shape, { material, x, y, z, ...extra });

export interface ModelTemplate {
  name: string;
  build: () => Custom3DModel;
}

/** 起手模板（可在編輯器中繼續增刪改） */
export const MODEL_TEMPLATES: ModelTemplate[] = [
  {
    name: '經典砲塔',
    build: () => ({
      parts: [
        p('skirt', 'trim', 0, 0.06, 0),
        p('base', 'metal', 0, 0.36, 0),
        p('collar', 'trim', 0, 0.64, 0),
        p('turret', 'accent', 0, 0.8, 0),
        p('barrel', 'accent', 0.22, 0.8, 0),
        p('muzzle', 'trim', 0.41, 0.8, 0, { rz: Math.PI / 2 }),
      ],
    }),
  },
  {
    name: '水晶尖塔',
    build: () => ({
      parts: [
        p('skirtHex', 'trim', 0, 0.06, 0),
        p('baseHex', 'metal', 0, 0.36, 0),
        p('collar', 'trim', 0, 0.64, 0),
        p('energyBeam', 'glow', 0, 0.82, 0),
        p('crystal', 'accent', 0, 0.98, 0, { spin: true }),
        p('crystalSmall', 'glow', 0.26, 1.02, 0, { spin: true }),
        p('crystalSmall', 'glow', -0.26, 0.94, 0, { spin: true }),
      ],
    }),
  },
  {
    name: '特斯拉線圈',
    build: () => ({
      parts: [
        p('skirt', 'trim', 0, 0.06, 0),
        p('base', 'metal', 0, 0.36, 0),
        p('pole', 'metal', 0, 0.95, 0),
        p('coil', 'trim', 0, 0.74, 0, { rx: Math.PI / 2 }),
        p('coil', 'trim', 0, 0.9, 0, { rx: Math.PI / 2 }),
        p('coil', 'trim', 0, 1.06, 0, { rx: Math.PI / 2 }),
        p('orb', 'accent', 0, 1.46, 0),
        p('spike', 'trim', 0, 1.68, 0),
      ],
    }),
  },
  {
    name: '懸浮光環',
    build: () => ({
      parts: [
        p('skirt', 'trim', 0, 0.06, 0),
        p('baseTall', 'metal', 0, 0.5, 0),
        p('lens', 'trim', 0, 0.96, 0),
        p('cone', 'accent', 0, 1.18, 0),
        p('orbSmall', 'glow', 0, 1.44, 0),
        p('torus', 'accent', 0, 0.68, 0, { rx: Math.PI / 2, spin: true }),
        p('crystalSmall', 'glow', 0.3, 0.68, 0, { spin: true }),
        p('crystalSmall', 'glow', -0.3, 0.68, 0, { spin: true }),
      ],
    }),
  },
  {
    name: '空白畫布',
    build: () => ({
      parts: [p('base', 'metal', 0, 0.36, 0)],
    }),
  },
];
