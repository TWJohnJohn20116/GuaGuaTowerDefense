import { describe, it, expect } from 'vitest';
import type { Custom3DModel, Custom3DPart } from '@/types/game';
import {
  addPart,
  createModelHistory,
  duplicatePart,
  flattenModel,
  mirrorPart,
  modelStats,
  nextPartId,
  normalizeModel,
  normalizePart,
  outOfBounds,
  parseModel,
  removePart,
  reorder,
  reparent,
  serializeModel,
  updatePart,
} from '@/workshop/model/doc';
import {
  basicTowerModel,
  cannonTowerModel,
  crystalTowerModel,
  sniperTowerModel,
  TOWER_MODEL_TEMPLATES,
} from '@/workshop/model/templates';

function part(overrides: Partial<Custom3DPart> & Pick<Custom3DPart, 'id'>): Custom3DPart {
  return {
    shape: 'base',
    material: 'metal',
    x: 0,
    y: 0,
    z: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 1,
    ...overrides,
  };
}

function model(parts: Custom3DPart[]): Custom3DModel {
  return { parts };
}

function treeModel(): Custom3DModel {
  return model([
    part({ id: 'root' }),
    part({ id: 'mid', parentId: 'root' }),
    part({ id: 'leaf', parentId: 'mid' }),
  ]);
}

describe('normalizePart', () => {
  it('fills defaults for a bare part', () => {
    const normalized = normalizePart({ id: 'a' });
    expect(normalized.scale).toBe(1);
    expect(normalized.sx).toBe(1);
    expect(normalized.sy).toBe(1);
    expect(normalized.sz).toBe(1);
    expect(normalized.opacity).toBe(1);
    expect(normalized.hidden).toBe(false);
    expect(normalized.locked).toBe(false);
    expect(normalized.parentId).toBeNull();
    expect(normalized.shape).toBe('base');
    expect(normalized.material).toBe('metal');
  });

  it('turns NaN into defaults and clamps out-of-range numbers', () => {
    const nan = normalizePart({ id: 'b', scale: Number.NaN, x: Number.NaN, opacity: Number.NaN });
    expect(nan.scale).toBe(1);
    expect(nan.x).toBe(0);
    expect(nan.opacity).toBe(1);

    const high = normalizePart({ ...part({ id: 'c' }), scale: 9, opacity: 5, emissive: 9 });
    expect(high.scale).toBe(3);
    expect(high.opacity).toBe(1);
    expect(high.emissive).toBe(3);

    const low = normalizePart({ ...part({ id: 'd' }), scale: 0.01, opacity: -1 });
    expect(low.scale).toBe(0.2);
    expect(low.opacity).toBe(0);
  });

  it('falls back sx/sy/sz to scale for legacy parts', () => {
    const scaled = normalizePart({ ...part({ id: 'e' }), scale: 2 });
    expect(scaled.sx).toBe(2);
    expect(scaled.sy).toBe(2);
    expect(scaled.sz).toBe(2);
    const axis = normalizePart({ ...part({ id: 'f' }), scale: 1.5, sx: 2.5 });
    expect(axis.sx).toBe(2.5);
    expect(axis.sy).toBe(1.5);
  });
});

describe('normalizeModel', () => {
  it('dedupes ids and drops parents that point nowhere, without mutating input', () => {
    const input = model([part({ id: 'a', parentId: 'ghost' }), part({ id: 'a' })]);
    const fixed = normalizeModel(input);
    expect(fixed.parts).toHaveLength(2);
    expect(fixed.parts[0].id).toBe('a');
    expect(fixed.parts[1].id).not.toBe('a');
    expect(fixed.parts[0].parentId).toBeNull();
    expect(input.parts[0].parentId).toBe('ghost');
  });

  it('breaks parent cycles by promoting every member to root', () => {
    const cyclic = model([
      part({ id: 'a', parentId: 'b' }),
      part({ id: 'b', parentId: 'a' }),
      part({ id: 'c' }),
    ]);
    const fixed = normalizeModel(cyclic);
    expect(fixed.parts.every((item) => item.parentId === null)).toBe(true);
    expect(cyclic.parts[0].parentId).toBe('b');
  });
});

describe('nextPartId / addPart', () => {
  it('generates the next free id with a prefix', () => {
    expect(nextPartId(model([]))).toBe('part_1');
    expect(nextPartId(model([part({ id: 'part_1' })]))).toBe('part_2');
    expect(nextPartId(model([part({ id: 'part_1' })]), 'node')).toBe('node_1');
  });

  it('appends a normalized part under an existing parent', () => {
    const added = addPart(model([part({ id: 'base' })]), { id: 'part_1', shape: 'turret', name: 'turret' }, 'base');
    expect(added.parts).toHaveLength(2);
    expect(added.parts[1].parentId).toBe('base');
    expect(added.parts[1].material).toBe('metal');
    expect(added.parts[1].scale).toBe(1);

    const orphan = addPart(model([part({ id: 'base' })]), { id: 'extra' }, 'nope');
    expect(orphan.parts[1].parentId).toBeNull();
  });
});

describe('removePart', () => {
  it('promotes children to the removed part parent instead of deleting the subtree', () => {
    const after = removePart(treeModel(), 'mid');
    expect(after.parts.map((item) => item.id)).toEqual(['root', 'leaf']);
    expect(after.parts[1].parentId).toBe('root');
    expect(removePart(treeModel(), 'ghost').parts).toHaveLength(3);
  });
});

describe('duplicatePart', () => {
  it('deep copies the subtree with fresh ids and the same parent', () => {
    const after = duplicatePart(treeModel(), 'mid');
    expect(after.parts).toHaveLength(5);
    const ids = after.parts.map((item) => item.id);
    expect(new Set(ids).size).toBe(5);
    const copyRoot = after.parts[3];
    const copyLeaf = after.parts[4];
    expect(copyRoot.parentId).toBe('root');
    expect(copyLeaf.parentId).toBe(copyRoot.id);
    expect(copyRoot).not.toBe(after.parts[1]);
  });

  it('leaves the model untouched for an unknown id', () => {
    const after = duplicatePart(treeModel(), 'ghost');
    expect(after.parts).toHaveLength(3);
  });
});

describe('mirrorPart', () => {
  it('negates x, ry and rz on the x axis and keeps the original', () => {
    const source = model([part({ id: 'a', x: 0.3, z: 0.1, rx: 0.1, ry: 0.4, rz: 0.2 })]);
    const mirrored = mirrorPart(source, 'a', 'x');
    expect(mirrored.parts).toHaveLength(2);
    expect(mirrored.parts[0].x).toBeCloseTo(0.3);
    expect(mirrored.parts[0].ry).toBeCloseTo(0.4);
    expect(mirrored.parts[1].x).toBeCloseTo(-0.3);
    expect(mirrored.parts[1].z).toBeCloseTo(0.1);
    expect(mirrored.parts[1].rx).toBeCloseTo(0.1);
    expect(mirrored.parts[1].ry).toBeCloseTo(-0.4);
    expect(mirrored.parts[1].rz).toBeCloseTo(-0.2);
    expect(mirrored.parts[1].id).not.toBe('a');
  });

  it('negates z, rx and ry on the z axis', () => {
    const source = model([part({ id: 'a', x: 0.3, z: 0.1, rx: 0.1, ry: 0.4, rz: 0.2 })]);
    const mirrored = mirrorPart(source, 'a', 'z');
    expect(mirrored.parts[1].x).toBeCloseTo(0.3);
    expect(mirrored.parts[1].z).toBeCloseTo(-0.1);
    expect(mirrored.parts[1].rx).toBeCloseTo(-0.1);
    expect(mirrored.parts[1].ry).toBeCloseTo(-0.4);
    expect(mirrored.parts[1].rz).toBeCloseTo(0.2);
  });
});

describe('reparent', () => {
  it('rejects a new parent that is a descendant of the child', () => {
    const rejected = reparent(treeModel(), 'root', 'leaf');
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason).toBe('cycle');
  });

  it('rejects self parenting and unknown nodes', () => {
    expect(reparent(treeModel(), 'root', 'root').ok).toBe(false);
    expect(reparent(treeModel(), 'ghost', 'root').ok).toBe(false);
    expect(reparent(treeModel(), 'root', 'ghost').ok).toBe(false);
  });

  it('moves a part to the root layer or under a valid parent', () => {
    const promoted = reparent(treeModel(), 'leaf', null);
    expect(promoted.ok).toBe(true);
    if (promoted.ok) {
      expect(promoted.model.parts.find((item) => item.id === 'leaf')?.parentId).toBeNull();
    }
    const moved = reparent(treeModel(), 'leaf', 'root');
    expect(moved.ok).toBe(true);
    if (moved.ok) {
      expect(moved.model.parts.find((item) => item.id === 'leaf')?.parentId).toBe('root');
    }
  });
});

describe('reorder', () => {
  it('moves a root block together with its children', () => {
    const source = model([
      part({ id: 'A' }),
      part({ id: 'A1', parentId: 'A' }),
      part({ id: 'B' }),
      part({ id: 'B1', parentId: 'B' }),
    ]);
    const after = reorder(source, 0, 1);
    expect(after.parts.map((item) => item.id)).toEqual(['B', 'B1', 'A', 'A1']);
    const unchanged = reorder(source, 0, 0);
    expect(unchanged.parts.map((item) => item.id)).toEqual(['A', 'A1', 'B', 'B1']);
  });
});

describe('updatePart', () => {
  it('merges a patch and clamps it like normalizePart', () => {
    const source = model([part({ id: 'a' })]);
    const updated = updatePart(source, 'a', { x: 0.5, scale: 9, name: 'top' });
    expect(updated.parts[0].x).toBe(0.5);
    expect(updated.parts[0].scale).toBe(3);
    expect(updated.parts[0].sx).toBe(3);
    expect(updated.parts[0].name).toBe('top');
    expect(updatePart(source, 'ghost', { x: 1 }).parts[0].x).toBe(0);
  });
});

describe('flattenModel / modelStats / outOfBounds', () => {
  it('flattens every part to root while keeping local coordinates', () => {
    const source = model([part({ id: 'a', y: 0.4 }), part({ id: 'b', parentId: 'a', y: 0.2 })]);
    const flat = flattenModel(source);
    expect(flat.parts.every((item) => item.parentId === null)).toBe(true);
    expect(flat.parts[1].y).toBe(0.2);
    expect(source.parts[1].parentId).toBe('a');
  });

  it('counts parts, visible parts and spinning parts', () => {
    const stats = modelStats(model([
      part({ id: 'a' }),
      part({ id: 'b', hidden: true }),
      part({ id: 'c', spin: true }),
      part({ id: 'd', hidden: true, spin: true }),
    ]));
    expect(stats).toEqual({ partCount: 4, visibleCount: 2, drawCalls: 2, spinCount: 1 });
  });

  it('estimates the XZ radius and reports overflow past the tile', () => {
    // 公式為 |x| + 0.35*scale（典型部件半徑）：置中的 scale=1 部件不算越界，
    // 否則預設模型會永遠亮警告，警告就失去意義。
    const centered = outOfBounds(model([part({ id: 'a' })]));
    expect(centered.maxRadius).toBeCloseTo(0.35);
    expect(centered.exceeded).toBe(false);

    const small = outOfBounds(model([part({ id: 'a', x: 0.2, z: -0.2, scale: 0.5 })]));
    expect(small.maxRadius).toBeCloseTo(0.375);
    expect(small.exceeded).toBe(false);

    const wide = outOfBounds(model([part({ id: 'a', x: 0.5 })]));
    expect(wide.maxRadius).toBeCloseTo(0.85);
    expect(wide.exceeded).toBe(true);

    const hiddenOutside = outOfBounds(model([part({ id: 'a', x: 2, hidden: true })]));
    expect(hiddenOutside.maxRadius).toBe(0);
    expect(hiddenOutside.exceeded).toBe(false);
  });
});

describe('serializeModel / parseModel', () => {
  it('round trips a template model with the format header', () => {
    const source = basicTowerModel();
    const text = serializeModel(source);
    expect(text).toContain('"formatVersion":1');
    expect(text).toContain('"kind":"ggtower-model"');
    const parsed = parseModel(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error(parsed.reason);
    expect(parsed.model.parts).toEqual(normalizeModel(source).parts);
    expect(serializeModel(parsed.model)).toBe(text);
  });

  it('returns reasons instead of throwing for broken payloads', () => {
    expect(parseModel('{oops').ok).toBe(false);
    expect(parseModel('')).toEqual({ ok: false, reason: 'empty' });
    expect(parseModel('{"kind":"ggtower-model"}')).toEqual({ ok: false, reason: 'missing-parts' });
    expect(parseModel('{"parts":3}')).toEqual({ ok: false, reason: 'parts-not-array' });
    expect(parseModel('{"kind":"other","parts":[]}')).toEqual({ ok: false, reason: 'kind-mismatch' });
    expect(parseModel('[1,2,3]')).toEqual({ ok: false, reason: 'not-an-object' });
  });

  it('skips non-object entries and normalizes the rest', () => {
    const parsed = parseModel('{"parts":[1,null,{"id":"a","scale":9}]}');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error(parsed.reason);
    expect(parsed.model.parts).toHaveLength(3);
    expect(parsed.model.parts[2].id).toBe('a');
    expect(parsed.model.parts[2].scale).toBe(3);
  });
});

describe('createModelHistory', () => {
  it('undoes and redoes, and clears redo after a push', () => {
    const history = createModelHistory(model([part({ id: 'a' })]));
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);

    history.push(model([part({ id: 'a' }), part({ id: 'b' })]));
    expect(history.current().parts).toHaveLength(2);
    expect(history.canUndo()).toBe(true);
    expect(history.undo().parts).toHaveLength(1);
    expect(history.canRedo()).toBe(true);
    expect(history.redo().parts).toHaveLength(2);

    history.undo();
    history.push(model([part({ id: 'c' })]));
    expect(history.canRedo()).toBe(false);
    expect(history.current().parts[0].id).toBe('c');
  });

  it('ignores a push with identical content', () => {
    const history = createModelHistory(model([part({ id: 'c' })]));
    const sameRef = history.current();
    history.push(model([part({ id: 'c' })]));
    expect(history.current()).toBe(sameRef);
  });

  it('caps the stack at 100 steps and resets', () => {
    const history = createModelHistory(model([]));
    for (let i = 0; i < 150; i += 1) {
      history.push(model([part({ id: `p${i}` })]));
    }
    let steps = 0;
    while (history.canUndo()) {
      history.undo();
      steps += 1;
    }
    expect(steps).toBe(99);
    history.reset(model([part({ id: 'z' })]));
    expect(history.canUndo()).toBe(false);
    expect(history.current().parts[0].id).toBe('z');
  });
});

describe('tower model templates', () => {
  const builders = [
    { id: 'basic', build: basicTowerModel },
    { id: 'sniper', build: sniperTowerModel },
    { id: 'cannon', build: cannonTowerModel },
    { id: 'crystal', build: crystalTowerModel },
  ];

  for (const builder of builders) {
    it(`${builder.id} has at least 8 uniquely named parts`, () => {
      const built = builder.build();
      expect(built.parts.length).toBeGreaterThanOrEqual(8);
      const ids = built.parts.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const item of built.parts) {
        expect(item.name ?? '').toMatch(/^[a-z][a-z ]*$/);
        expect(item.shape.length).toBeGreaterThan(0);
      }
      const again = builder.build();
      expect(again).not.toBe(built);
      expect(again.parts).not.toBe(built.parts);
      expect(again.parts).toEqual(built.parts);
    });
  }

  it('exposes the four ids the UI expects', () => {
    expect(TOWER_MODEL_TEMPLATES.map((template) => template.id)).toEqual([
      'basic',
      'sniper',
      'cannon',
      'crystal',
    ]);
    for (const template of TOWER_MODEL_TEMPLATES) {
      expect(template.label.length).toBeGreaterThan(0);
      expect(template.build().parts.length).toBeGreaterThanOrEqual(8);
    }
  });
});
