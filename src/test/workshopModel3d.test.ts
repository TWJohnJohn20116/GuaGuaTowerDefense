/**
 * 自訂塔 3D 模型組裝（buildCustomTowerModel）行為測試
 *
 * 直接呼叫組裝函式，不經 React、不建立 WebGL renderer：
 * three.js 在 node 下可建立幾何／材質／場景圖，只有渲染需要 GPU。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  buildCustomTowerModel,
  disposeTowerModel,
} from '@/components/scenes/game-scene/three/towerModels3d';
import type { Custom3DPart } from '@/types/game';

/** 建立部件；未指定的欄位取編輯器預設值 */
const makePart = (over: Partial<Custom3DPart> & { id: string }): Custom3DPart => {
  const part: Custom3DPart = {
    id: over.id,
    shape: over.shape ?? 'base',
    material: over.material ?? 'metal',
    x: over.x ?? 0,
    y: over.y ?? 0,
    z: over.z ?? 0,
    rx: over.rx ?? 0,
    ry: over.ry ?? 0,
    rz: over.rz ?? 0,
    scale: over.scale ?? 1,
  };
  if (over.sx !== undefined) part.sx = over.sx;
  if (over.sy !== undefined) part.sy = over.sy;
  if (over.sz !== undefined) part.sz = over.sz;
  if (over.color !== undefined) part.color = over.color;
  if (over.emissive !== undefined) part.emissive = over.emissive;
  if (over.opacity !== undefined) part.opacity = over.opacity;
  if (over.hidden !== undefined) part.hidden = over.hidden;
  if (over.parentId !== undefined) part.parentId = over.parentId;
  if (over.spin !== undefined) part.spin = over.spin;
  return part;
};

/** 部件節點索引（越界收縮時 partNodes 會搬到最外層，這裡一律讀回傳值） */
const nodesOf = (root: THREE.Group): Record<string, THREE.Object3D> =>
  root.userData.partNodes as Record<string, THREE.Object3D>;

/** 節點是否（間接）掛在 root 底下 */
const isAttached = (root: THREE.Object3D, node: THREE.Object3D | undefined): boolean => {
  let cur: THREE.Object3D | null = node ?? null;
  for (let i = 0; i < 64 && cur; i++) {
    if (cur === root) return true;
    cur = cur.parent;
  }
  return false;
};

/** 取 Mesh 的標準材質；型別不符時直接拋錯，讓斷言失敗看得懂 */
const matOf = (node: THREE.Object3D | undefined): THREE.MeshStandardMaterial => {
  if (!(node instanceof THREE.Mesh)) throw new Error('部件節點不是 Mesh');
  if (!(node.material instanceof THREE.MeshStandardMaterial)) throw new Error('材質不是 MeshStandardMaterial');
  return node.material;
};

const countMeshes = (root: THREE.Object3D): number => {
  let n = 0;
  root.traverse((o) => {
    if (o instanceof THREE.Mesh) n++;
  });
  return n;
};

describe('buildCustomTowerModel', () => {
  it('依 parentId 建立階層：子件 parent 是父件節點', () => {
    const root = buildCustomTowerModel(
      {
        parts: [
          makePart({ id: 'body', shape: 'base' }),
          makePart({ id: 'head', shape: 'orb', y: 0.4, parentId: 'body' }),
        ],
      },
      0x6496ff,
    );
    const nodes = nodesOf(root);
    expect(nodes.head.parent).toBe(nodes.body);
    expect(isAttached(root, nodes.head)).toBe(true);
  });

  it('parentId 循環（A→B→A）不拋錯，兩個部件都掛在模型上', () => {
    const root = buildCustomTowerModel(
      {
        parts: [
          makePart({ id: 'a', shape: 'base', parentId: 'b' }),
          makePart({ id: 'b', shape: 'orb', y: 0.3, parentId: 'a' }),
        ],
      },
      0x6496ff,
    );
    const nodes = nodesOf(root);
    expect(isAttached(root, nodes.a)).toBe(true);
    expect(isAttached(root, nodes.b)).toBe(true);
    // 循環一律當根層：兩者掛在同一個父節點下，不會互為父件造成無限遞迴
    expect(nodes.a.parent).toBe(nodes.b.parent);
    expect(countMeshes(root)).toBe(2);
  });

  it('parentId 指向不存在的 id 或自己 → 當根層', () => {
    const root = buildCustomTowerModel(
      {
        parts: [
          makePart({ id: 'self', shape: 'base', parentId: 'self' }),
          makePart({ id: 'orphan', shape: 'orb', y: 0.3, parentId: 'missing' }),
        ],
      },
      0x6496ff,
    );
    const nodes = nodesOf(root);
    expect(isAttached(root, nodes.self)).toBe(true);
    expect(isAttached(root, nodes.orphan)).toBe(true);
    expect(nodes.self.parent).toBe(nodes.orphan.parent);
  });

  it('hidden 部件沒有 Mesh，但子部件照常渲染', () => {
    const root = buildCustomTowerModel(
      {
        parts: [
          makePart({ id: 'ghost', shape: 'base', hidden: true }),
          makePart({ id: 'child', shape: 'orb', y: 0.35, parentId: 'ghost' }),
        ],
      },
      0x6496ff,
    );
    const nodes = nodesOf(root);
    expect(nodes.ghost).toBeInstanceOf(THREE.Group);
    expect(nodes.ghost).not.toBeInstanceOf(THREE.Mesh);
    expect(nodes.child).toBeInstanceOf(THREE.Mesh);
    expect(nodes.child.parent).toBe(nodes.ghost);
    expect(countMeshes(root)).toBe(1);
  });

  it('sx／sy／sz 逐軸生效；只有舊欄位 scale 時仍等比', () => {
    const root = buildCustomTowerModel(
      {
        parts: [
          makePart({ id: 'axis', shape: 'base', scale: 1, sx: 2, sy: 0.5, sz: 1.5 }),
          makePart({ id: 'legacy', shape: 'orb', y: 0.5, scale: 1.8 }),
        ],
      },
      0x6496ff,
    );
    const nodes = nodesOf(root);
    expect(nodes.axis.scale.x).toBeCloseTo(2);
    expect(nodes.axis.scale.y).toBeCloseTo(0.5);
    expect(nodes.axis.scale.z).toBeCloseTo(1.5);
    expect(nodes.legacy.scale.x).toBeCloseTo(1.8);
    expect(nodes.legacy.scale.y).toBeCloseTo(1.8);
    expect(nodes.legacy.scale.z).toBeCloseTo(1.8);
  });

  it('color 覆蓋建立專屬材質，未覆蓋部件沿用角色材質', () => {
    const root = buildCustomTowerModel(
      {
        parts: [
          makePart({ id: 'plain', shape: 'base' }),
          makePart({ id: 'tinted', shape: 'orb', y: 0.4, color: '#ff0000' }),
        ],
      },
      0x6496ff,
    );
    const nodes = nodesOf(root);
    const plain = matOf(nodes.plain);
    const tinted = matOf(nodes.tinted);
    expect(tinted.color.getHex()).toBe(0xff0000);
    expect(tinted).not.toBe(plain);
    expect(tinted.userData.owned).toBe(true);
  });

  it('解析失敗的顏色字串回退材質預設色且不拋錯', () => {
    const root = buildCustomTowerModel(
      { parts: [makePart({ id: 'bad', shape: 'base', color: '#zzz' })] },
      0x6496ff,
    );
    const mat = matOf(nodesOf(root).bad);
    expect(mat.color.getHex()).toBe(0x232936); // metal 角色預設色
  });

  it('emissive／opacity 覆蓋寫入材質，透明度啟用透明混合', () => {
    const root = buildCustomTowerModel(
      {
        parts: [
          makePart({ id: 'glassy', shape: 'orb', material: 'glow', emissive: 2.5, opacity: 0.4 }),
        ],
      },
      0x6496ff,
    );
    const mat = matOf(nodesOf(root).glassy);
    expect(mat.emissiveIntensity).toBeCloseTo(2.5);
    expect(mat.transparent).toBe(true);
    expect(mat.opacity).toBeCloseTo(0.4);
    expect(mat.depthWrite).toBe(false);
  });

  it('兩個自轉部件收集到 userData.spinParts，spinPart 保留第一個', () => {
    const root = buildCustomTowerModel(
      {
        parts: [
          makePart({ id: 's1', shape: 'blade', spin: true }),
          makePart({ id: 's2', shape: 'ringThin', y: 0.4, spin: true }),
          makePart({ id: 'static', shape: 'base' }),
        ],
      },
      0x6496ff,
    );
    const spinParts = root.userData.spinParts as THREE.Object3D[];
    expect(spinParts).toHaveLength(2);
    expect(root.userData.spinPart).toBe(spinParts[0]);
    const nodes = nodesOf(root);
    expect(nodes.s1.parent).toBe(spinParts[0]);
    expect(nodes.s2.parent).toBe(spinParts[1]);
    expect(spinParts[0].userData.partId).toBe('s1');
    expect(spinParts[1].userData.partId).toBe('s2');
    expect(nodes.static.parent).not.toBe(spinParts[0]);
  });

  it('部件放到 x=2 時整體收縮回地塊半寬 0.47 內，partNodes 仍在最外層', () => {
    const root = buildCustomTowerModel(
      {
        parts: [
          makePart({ id: 'body', shape: 'base' }),
          makePart({ id: 'far', shape: 'orb', x: 2 }),
        ],
      },
      0x6496ff,
    );
    const box = new THREE.Box3().setFromObject(root);
    expect(box.max.x).toBeLessThanOrEqual(0.4701);
    expect(box.min.x).toBeGreaterThanOrEqual(-0.4701);
    expect(box.max.z).toBeLessThanOrEqual(0.4701);
    expect(nodesOf(root).far).toBeInstanceOf(THREE.Mesh);
  });

  it('disposeTowerModel 只釋放本模型材質，共享材質不受影響', () => {
    const root = buildCustomTowerModel(
      { parts: [makePart({ id: 'tinted', shape: 'base', color: '#00ff00' })] },
      0x6496ff,
    );
    const own = matOf(nodesOf(root).tinted);
    const shared = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const sharedGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const sharedMesh = new THREE.Mesh(sharedGeo, shared);
    root.add(sharedMesh);
    let ownDisposed = false;
    let sharedDisposed = false;
    own.addEventListener('dispose', () => {
      ownDisposed = true;
    });
    shared.addEventListener('dispose', () => {
      sharedDisposed = true;
    });
    disposeTowerModel(root);
    expect(ownDisposed).toBe(true);
    expect(sharedDisposed).toBe(false);
    sharedGeo.dispose();
  });
});
