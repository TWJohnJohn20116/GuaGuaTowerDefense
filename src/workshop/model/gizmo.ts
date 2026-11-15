/**
 * 3D 模型編輯器 · gizmo 拖曳純數學
 *
 * 這裡只做「螢幕座標 → 世界軸位移／旋轉／縮放」的換算，不碰 three.js 場景，
 * 也不需要相機物件：呼叫端把 world → 螢幕像素 的投影函式傳進來即可，
 * 因此可以在 node 測試裡用假投影驗證（見 src/test/workshopModelGizmo.test.ts）。
 *
 * 螢幕座標系與 DOM 一致：x 向右、y 向下、單位像素。
 */

export type GizmoAxis = 'x' | 'y' | 'z';
export type GizmoTool = 'translate' | 'rotate' | 'scale';
export type ViewPreset = 'front' | 'back' | 'left' | 'right' | 'top' | 'iso';

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

/** 世界座標 → 螢幕像素（由相機提供） */
export type ProjectFn = (world: Vec3Like) => ScreenPoint;

export const AXIS_VECTOR: Record<GizmoAxis, Vec3Like> = {
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
  z: { x: 0, y: 0, z: 1 },
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** 沿軸取分量 */
export function axisComponent(v: Vec3Like, axis: GizmoAxis): number {
  return axis === 'x' ? v.x : axis === 'y' ? v.y : v.z;
}

/** 回傳把某軸分量換掉的新向量 */
export function withAxis(v: Vec3Like, axis: GizmoAxis, value: number): Vec3Like {
  return {
    x: axis === 'x' ? value : v.x,
    y: axis === 'y' ? value : v.y,
    z: axis === 'z' ? value : v.z,
  };
}

export interface AxisProjection {
  /** 單位方向（螢幕像素系，y 向下）；軸幾乎垂直螢幕時為 (0,0) */
  dir: ScreenPoint;
  /** 每世界單位對應幾像素；0 表示這條軸在畫面上看不到 */
  pxPerUnit: number;
}

/**
 * 把世界軸投影到螢幕，得到「螢幕方向 + 每單位像素數」。
 * axisLenWorld 是取樣長度（建議用 gizmo 手柄長度），不影響 dir。
 */
export function projectAxis(
  origin: Vec3Like,
  axis: GizmoAxis,
  project: ProjectFn,
  axisLenWorld = 1,
): AxisProjection {
  const unit = AXIS_VECTOR[axis];
  const a = project(origin);
  const b = project({
    x: origin.x + unit.x * axisLenWorld,
    y: origin.y + unit.y * axisLenWorld,
    z: origin.z + unit.z * axisLenWorld,
  });
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (!Number.isFinite(len) || len < 1e-6) {
    return { dir: { x: 0, y: 0 }, pxPerUnit: 0 };
  }
  return { dir: { x: dx / len, y: dy / len }, pxPerUnit: len / axisLenWorld };
}

/** 滑鼠位移在軸方向上的像素投影 */
export function projectDrag(
  axisProjection: AxisProjection,
  from: ScreenPoint,
  to: ScreenPoint,
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return dx * axisProjection.dir.x + dy * axisProjection.dir.y;
}

/** 依步進吸附（step <= 0 表示不吸附） */
export function snapValue(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  if (!(step > 0)) return value;
  return Math.round(value / step) * step;
}

export interface TranslateDragInput {
  origin: Vec3Like;
  axis: GizmoAxis;
  from: ScreenPoint;
  to: ScreenPoint;
  project: ProjectFn;
  axisLenWorld?: number;
  /** 吸附步進（世界單位） */
  snap?: number;
}

/** 沿單軸拖曳的世界位移量（已含吸附） */
export function dragTranslate(input: TranslateDragInput): number {
  const projection = projectAxis(input.origin, input.axis, input.project, input.axisLenWorld ?? 1);
  if (projection.pxPerUnit < 1e-6) return 0;
  const px = projectDrag(projection, input.from, input.to);
  const raw = px / projection.pxPerUnit;
  return snapValue(raw, input.snap ?? 0);
}

export interface RotateDragInput {
  /** 選中部件中心（世界座標） */
  center: Vec3Like;
  axis: GizmoAxis;
  from: ScreenPoint;
  to: ScreenPoint;
  project: ProjectFn;
  /** 軸指向鏡頭時螢幕旋轉方向會反向，由呼叫端依相機方向提供 */
  invert?: boolean;
  /** 吸附步進（弧度；預設 15°） */
  snap?: number;
}

/**
 * 繞單軸拖曳的旋轉量（弧度）。
 * 用「滑鼠相對部件中心的螢幕極角變化」計算，與軸的螢幕方向無關，
 * 因此任何視角都直覺；軸是否朝鏡頭由 invert 修正。
 */
export function dragRotate(input: RotateDragInput): number {
  const c = input.project(input.center);
  const a0 = Math.atan2(input.from.y - c.y, input.from.x - c.x);
  const a1 = Math.atan2(input.to.y - c.y, input.to.x - c.x);
  let delta = a1 - a0;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  const snapped = snapValue(delta, input.snap ?? Math.PI / 12);
  return input.invert ? -snapped : snapped;
}

export interface ScaleDragInput {
  origin: Vec3Like;
  axis: GizmoAxis;
  from: ScreenPoint;
  to: ScreenPoint;
  project: ProjectFn;
  axisLenWorld?: number;
  /** 起始倍率（單軸） */
  base: number;
  min?: number;
  max?: number;
}

/** 沿單軸拖曳的縮放倍率（1 世界單位 ≈ 100px 的靈敏度） */
export function dragScale(input: ScaleDragInput): number {
  const projection = projectAxis(input.origin, input.axis, input.project, input.axisLenWorld ?? 1);
  if (projection.pxPerUnit < 1e-6) return clamp(input.base, input.min ?? 0.2, input.max ?? 3);
  const px = projectDrag(projection, input.from, input.to);
  const factor = input.base + px / 100;
  return clamp(factor, input.min ?? 0.2, input.max ?? 3);
}

/** 四視圖／等角視角的球座標（theta 水平角、phi 仰角，弧度） */
export const VIEW_ANGLES: Record<ViewPreset, { theta: number; phi: number }> = {
  front: { theta: 0, phi: Math.PI * 0.42 },
  back: { theta: Math.PI, phi: Math.PI * 0.42 },
  left: { theta: -Math.PI / 2, phi: Math.PI * 0.42 },
  right: { theta: Math.PI / 2, phi: Math.PI * 0.42 },
  top: { theta: 0, phi: Math.PI * 0.02 },
  iso: { theta: Math.PI * 0.25, phi: Math.PI * 0.28 },
};

/**
 * 球座標 → 相機位移（y 向上）。
 *
 * phi 是「與 +Y 的夾角」：phi=0 在正上方、phi=π/2 在地平面，
 * 所以水平半徑是 sin(phi)，垂直分量是 cos(phi)。
 * （曾誤用 cos(phi) 當水平半徑，導致俯視時相機跑到側面。）
 */
export function sphericalOffset(theta: number, phi: number, dist: number): Vec3Like {
  const horizontal = Math.sin(phi) * dist;
  return {
    x: Math.sin(theta) * horizontal,
    y: Math.cos(phi) * dist,
    z: Math.cos(theta) * horizontal,
  };
}
