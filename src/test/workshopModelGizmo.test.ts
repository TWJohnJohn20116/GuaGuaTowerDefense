/**
 * 3D 模型編輯器 gizmo 數學測試
 *
 * 這些函式決定「滑鼠拖多少 → 部件動多少」，錯了會出現「拖右邊往左跑」這種
 * 只有實際操作才發現的 bug，所以用假投影在 node 裡直接驗。
 */
import { describe, expect, it } from 'vitest';
import {
  AXIS_VECTOR,
  axisComponent,
  dragRotate,
  dragScale,
  dragTranslate,
  projectAxis,
  projectDrag,
  snapValue,
  sphericalOffset,
  VIEW_ANGLES,
  withAxis,
} from '@/workshop/model/gizmo';

/** 假投影：世界 x/y 直接當螢幕像素，z 不影響（等於正交俯視） */
const flatProject = (world: { x: number; y: number; z: number }) => ({ x: world.x, y: world.y });

describe('gizmo 軸投影', () => {
  it('x 軸在平面投影下是水平向右、每單位 1px', () => {
    const projection = projectAxis({ x: 0, y: 0, z: 0 }, 'x', flatProject, 1);
    expect(projection.dir.x).toBeCloseTo(1);
    expect(projection.dir.y).toBeCloseTo(0);
    expect(projection.pxPerUnit).toBeCloseTo(1);
  });

  it('y 軸在平面投影下是垂直向下（螢幕 y 向下）', () => {
    const projection = projectAxis({ x: 0, y: 0, z: 0 }, 'y', flatProject, 1);
    expect(projection.dir.y).toBeCloseTo(1);
  });

  it('完全垂直螢幕的軸（z）回報 0 pxPerUnit，呼叫端要能安全跳過', () => {
    const projection = projectAxis({ x: 0, y: 0, z: 0 }, 'z', flatProject, 1);
    expect(projection.pxPerUnit).toBe(0);
    expect(dragTranslate({ origin: { x: 0, y: 0, z: 0 }, axis: 'z', from: { x: 0, y: 0 }, to: { x: 40, y: 0 }, project: flatProject })).toBe(0);
  });

  it('軸取樣長度會等比放大 pxPerUnit', () => {
    const projection = projectAxis({ x: 0, y: 0, z: 0 }, 'x', flatProject, 2);
    expect(projection.pxPerUnit).toBeCloseTo(1);
    const doubled = projectAxis({ x: 0, y: 0, z: 0 }, 'x', (world) => ({ x: world.x * 2, y: world.y * 2 }), 1);
    expect(doubled.pxPerUnit).toBeCloseTo(2);
  });
});

describe('gizmo 位移', () => {
  it('水平拖 50px 等於沿 x 移動 50 單位', () => {
    const delta = dragTranslate({
      origin: { x: 0, y: 0, z: 0 },
      axis: 'x',
      from: { x: 100, y: 100 },
      to: { x: 150, y: 100 },
      project: flatProject,
    });
    expect(delta).toBeCloseTo(50);
  });

  it('垂直拖曳不會影響 x 軸位移', () => {
    const delta = dragTranslate({
      origin: { x: 0, y: 0, z: 0 },
      axis: 'x',
      from: { x: 100, y: 100 },
      to: { x: 100, y: 180 },
      project: flatProject,
    });
    expect(delta).toBeCloseTo(0);
  });

  it('吸附步進會把位移對齊到 0.05', () => {
    const delta = dragTranslate({
      origin: { x: 0, y: 0, z: 0 },
      axis: 'x',
      from: { x: 0, y: 0 },
      // 投影是 1000px/單位，所以 37px = 0.037 世界單位，吸附到 0.05
      to: { x: 37, y: 0 },
      project: (world) => ({ x: world.x * 1000, y: world.y * 1000 }),
      snap: 0.05,
    });
    expect(delta).toBeCloseTo(0.05);
  });
});

describe('gizmo 旋轉', () => {
  it('繞中心從 3 點鐘拖到 12 點鐘是 -90 度（螢幕 y 向下）', () => {
    const delta = dragRotate({
      center: { x: 0, y: 0, z: 0 },
      axis: 'y',
      from: { x: 100, y: 0 },
      to: { x: 0, y: -100 },
      project: flatProject,
      snap: 0,
    });
    expect(delta).toBeCloseTo(-Math.PI / 2);
  });

  it('invert 會讓螢幕方向反向（軸朝鏡頭時需要）', () => {
    const base = {
      center: { x: 0, y: 0, z: 0 },
      axis: 'y' as const,
      from: { x: 100, y: 0 },
      to: { x: 0, y: -100 },
      project: flatProject,
      snap: 0,
    };
    expect(dragRotate({ ...base, invert: true })).toBeCloseTo(Math.PI / 2);
  });

  it('預設吸附到 15 度', () => {
    const delta = dragRotate({
      center: { x: 0, y: 0, z: 0 },
      axis: 'y',
      from: { x: 100, y: 0 },
      to: { x: 96, y: -26 },
      project: flatProject,
    });
    expect(Math.abs(delta)).toBeCloseTo(Math.PI / 12);
  });
});

describe('gizmo 縮放', () => {
  it('沿軸拖 100px 使倍率 +1', () => {
    const next = dragScale({
      origin: { x: 0, y: 0, z: 0 },
      axis: 'x',
      from: { x: 0, y: 0 },
      to: { x: 100, y: 0 },
      project: flatProject,
      base: 1,
    });
    expect(next).toBeCloseTo(2);
  });

  it('倍率被夾在 0.2~3', () => {
    const next = dragScale({
      origin: { x: 0, y: 0, z: 0 },
      axis: 'x',
      from: { x: 0, y: 0 },
      to: { x: 900, y: 0 },
      project: flatProject,
      base: 1,
    });
    expect(next).toBe(3);
  });
});

describe('輔助函式', () => {
  it('snapValue 在 step<=0 時原樣回傳', () => {
    expect(snapValue(1.234, 0)).toBe(1.234);
  });

  it('axisComponent／withAxis 只改指定軸', () => {
    const v = { x: 1, y: 2, z: 3 };
    expect(axisComponent(v, 'y')).toBe(2);
    const next = withAxis(v, 'z', 9);
    expect(next).toEqual({ x: 1, y: 2, z: 9 });
    expect(v.z).toBe(3);
  });

  it('projectDrag 取軸方向上的投影分量', () => {
    const projection = projectAxis({ x: 0, y: 0, z: 0 }, 'x', flatProject, 1);
    expect(projectDrag(projection, { x: 0, y: 0 }, { x: 30, y: 40 })).toBeCloseTo(30);
  });

  it('AXIS_VECTOR 是單位向量', () => {
    for (const axis of ['x', 'y', 'z'] as const) {
      const v = AXIS_VECTOR[axis];
      expect(Math.hypot(v.x, v.y, v.z)).toBeCloseTo(1);
    }
  });

  it('sphericalOffset 在 phi=0 時位於正上方', () => {
    const offset = sphericalOffset(0, 0, 3);
    expect(offset.y).toBeCloseTo(3);
    expect(offset.x).toBeCloseTo(0);
    expect(offset.z).toBeCloseTo(0);
  });

  it('六個視角預設都存在且 phi 在合法範圍', () => {
    for (const key of ['front', 'back', 'left', 'right', 'top', 'iso'] as const) {
      const angles = VIEW_ANGLES[key];
      expect(angles.phi).toBeGreaterThan(0);
      expect(angles.phi).toBeLessThanOrEqual(Math.PI / 2);
    }
  });
});
