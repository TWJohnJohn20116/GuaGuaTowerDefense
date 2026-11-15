// 自訂 3D 塔模型的文件層（純資料）：正規化、部件樹編輯、序列化、復原歷史。
//
// 約束：不碰 React、不碰 store、不讀時鐘、不寫檔；每個操作都回傳新物件，不改動輸入。
//
// reparent 語意（與編輯器拖放一致）：
//   - reparent(model, childId, newParentId)：把 childId 掛到 newParentId 底下；
//     newParentId 傳 null 表示升為根層。
//   - 新父是自己或自己的子孫（會成環）→ 拒絕，回 { ok: false, reason }，model 完全不動。
//   - childId 不存在、newParentId 不存在、newParentId === childId → 同樣拒絕。
//   - 成功時只換 parentId，不動任何座標：部件座標一律以「父件的局部座標系」解讀（相對座標），
//     所以換父件後位置會跟著父件跑。這是刻意的編輯器語意，不做世界座標換算。

import type { Custom3DModel, Custom3DPart } from '@/types/game';

/** 縮放下限（與 towerModels3d 的自訂模型渲染一致） */
const MIN_SCALE = 0.2;
/** 縮放上限 */
const MAX_SCALE = 3;
/** 自發光強度上限 */
const MAX_EMISSIVE = 3;
/** 部件缺少 shape 時的退回值（TOWER_PART_SHAPES 的 key） */
const DEFAULT_SHAPE = 'base';
/** 部件缺少 material 時的退回值 */
const DEFAULT_MATERIAL: Custom3DPart['material'] = 'metal';
/** 地塊視覺半寬：半徑超過此值就會穿到隔壁地塊 */
const TILE_HALF_WIDTH = 0.47;
/** 復原歷史上限（步） */
const HISTORY_LIMIT = 100;
/** 序列化格式版本（parts 結構變動時 +1） */
const MODEL_FORMAT_VERSION = 1;
/** 序列化檔頭標記，用來認出「這是塔模型檔」 */
const MODEL_KIND = 'ggtower-model';

const MATERIAL_ROLES: ReadonlyArray<Custom3DPart['material']> = [
  'metal',
  'trim',
  'accent',
  'glow',
  'gold',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMaterial(value: unknown): value is Custom3DPart['material'] {
  return MATERIAL_ROLES.some((role) => role === value);
}

/** 夾限：非數字或 NaN 一律回退預設 */
function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/** 只擋 NaN／Infinity，不做範圍夾限（位置與角度不該被範圍限制） */
function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * 補齊單一部件預設值並夾限數值；不改動輸入。
 * fallbackIndex 只用在「沒有 id」時產生穩定可預期的 part_N。
 */
export function normalizePart(
  part: Partial<Custom3DPart> | null | undefined,
  fallbackIndex = 0,
): Custom3DPart {
  const src: Partial<Custom3DPart> = part ?? {};
  const scale = clampNumber(src.scale, MIN_SCALE, MAX_SCALE, 1);
  const emissive = typeof src.emissive === 'number' && Number.isFinite(src.emissive)
    ? Math.min(MAX_EMISSIVE, Math.max(0, src.emissive))
    : undefined;
  return {
    id: optionalText(src.id) ?? `part_${fallbackIndex + 1}`,
    shape: optionalText(src.shape) ?? DEFAULT_SHAPE,
    material: isMaterial(src.material) ? src.material : DEFAULT_MATERIAL,
    x: finiteNumber(src.x, 0),
    y: finiteNumber(src.y, 0),
    z: finiteNumber(src.z, 0),
    rx: finiteNumber(src.rx, 0),
    ry: finiteNumber(src.ry, 0),
    rz: finiteNumber(src.rz, 0),
    scale,
    // 舊資料只有 scale：sx/sy/sz 缺省時一律回退 scale
    sx: clampNumber(src.sx, MIN_SCALE, MAX_SCALE, scale),
    sy: clampNumber(src.sy, MIN_SCALE, MAX_SCALE, scale),
    sz: clampNumber(src.sz, MIN_SCALE, MAX_SCALE, scale),
    color: optionalText(src.color),
    emissive,
    opacity: clampNumber(src.opacity, 0, 1, 1),
    name: optionalText(src.name),
    hidden: src.hidden === true,
    locked: src.locked === true,
    parentId: optionalText(src.parentId) ?? null,
    spin: src.spin === true,
  };
}

/** 從 used 集合配置一個不重複的 id（prefix_1、prefix_2 …） */
function allocateId(used: ReadonlySet<string>, prefix: string): string {
  const base = optionalText(prefix) ?? 'part';
  let n = 1;
  while (used.has(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

/** 依現有 id 產生不重複的新 id（例如 part_1、part_2） */
export function nextPartId(model: Custom3DModel, prefix = 'part'): string {
  const used = new Set(model.parts.map((part) => part.id));
  return allocateId(used, prefix);
}

/** 建立 id → 直屬子件清單（保持 parts 陣列順序） */
function buildChildIndex(parts: ReadonlyArray<Custom3DPart>): Map<string, string[]> {
  const children = new Map<string, string[]>();
  for (const part of parts) {
    const parent = part.parentId;
    if (!parent) continue;
    const list = children.get(parent);
    if (list) list.push(part.id);
    else children.set(parent, [part.id]);
  }
  return children;
}

/** 收集子樹 id（含自己，DFS 前序） */
function collectSubtreeIds(parts: ReadonlyArray<Custom3DPart>, rootId: string): string[] {
  const children = buildChildIndex(parts);
  const order: string[] = [];
  const stack: string[] = [rootId];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) break;
    order.push(current);
    const kids = children.get(current);
    if (kids) {
      for (let i = kids.length - 1; i >= 0; i -= 1) stack.push(kids[i]);
    }
  }
  return order;
}

/** 把循環鏈上的成員一律升為根層（原地改傳入的 parts，呼叫端保證那是副本） */
function breakCycles(parts: Custom3DPart[]): void {
  const byId = new Map(parts.map((part) => [part.id, part]));
  for (const start of parts) {
    const path: string[] = [];
    const seen = new Set<string>();
    let cursor: Custom3DPart | undefined = start;
    while (cursor) {
      if (seen.has(cursor.id)) {
        const cycleStart = path.indexOf(cursor.id);
        for (const id of path.slice(cycleStart)) {
          const member = byId.get(id);
          if (member) member.parentId = null;
        }
        break;
      }
      seen.add(cursor.id);
      path.push(cursor.id);
      const parentId: string | null | undefined = cursor.parentId;
      cursor = parentId ? byId.get(parentId) : undefined;
    }
  }
}

/** 正規化整個模型：補預設、去重複 id、修掉指向不存在 id 的 parentId、斷開循環。 */
export function normalizeModel(
  model: { parts?: ReadonlyArray<Partial<Custom3DPart>> | null } | null | undefined,
): Custom3DModel {
  const raw = model?.parts;
  const source: ReadonlyArray<Partial<Custom3DPart>> = Array.isArray(raw) ? raw : [];
  const parts: Custom3DPart[] = [];
  const used = new Set<string>();
  for (let index = 0; index < source.length; index += 1) {
    const part = normalizePart(source[index], index);
    if (used.has(part.id)) part.id = allocateId(used, 'part');
    used.add(part.id);
    parts.push(part);
  }
  const ids = new Set(parts.map((part) => part.id));
  for (const part of parts) {
    const parent = part.parentId;
    if (parent && (parent === part.id || !ids.has(parent))) part.parentId = null;
  }
  breakCycles(parts);
  return { parts };
}

/** 新增部件；parentId 不存在時退回根層，id 撞號時自動配新 id */
export function addPart(
  model: Custom3DModel,
  part: Partial<Custom3DPart>,
  parentId: string | null = null,
): Custom3DModel {
  const base = normalizeModel(model);
  const existing = new Set(base.parts.map((item) => item.id));
  const draft = normalizePart(part, base.parts.length);
  const id = existing.has(draft.id) ? allocateId(existing, 'part') : draft.id;
  const parent = parentId && existing.has(parentId) ? parentId : null;
  return { parts: [...base.parts, { ...draft, id, parentId: parent }] };
}

/** 移除部件；直屬子件升到被移除部件的父層（不連坐刪除整棵子樹） */
export function removePart(model: Custom3DModel, id: string): Custom3DModel {
  const base = normalizeModel(model);
  const target = base.parts.find((part) => part.id === id);
  if (!target) return base;
  const parentId = target.parentId ?? null;
  const parts = base.parts
    .filter((part) => part.id !== id)
    .map((part) => (part.parentId === id ? { ...part, parentId } : part));
  return { parts };
}

/** 把整棵子樹的副本插回來源子樹之後（維持群組相鄰） */
function insertAfterSubtree(
  parts: Custom3DPart[],
  subtreeIds: ReadonlyArray<string>,
  copies: Custom3DPart[],
): Custom3DModel {
  const subtree = new Set(subtreeIds);
  let insertAt = parts.length;
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (subtree.has(parts[i].id)) {
      insertAt = i + 1;
      break;
    }
  }
  const next = [...parts];
  next.splice(insertAt, 0, ...copies);
  return { parts: next };
}

/** 深拷貝部件與其整棵子樹（新 id），插在來源子樹之後；父件沿用原父層 */
export function duplicatePart(model: Custom3DModel, id: string): Custom3DModel {
  const base = normalizeModel(model);
  const source = base.parts.find((part) => part.id === id);
  if (!source) return base;
  const subtreeIds = collectSubtreeIds(base.parts, id);
  const used = new Set(base.parts.map((part) => part.id));
  const mapping = new Map<string, string>();
  for (const oldId of subtreeIds) {
    const newId = allocateId(used, 'part');
    used.add(newId);
    mapping.set(oldId, newId);
  }
  const copies: Custom3DPart[] = [];
  for (const oldId of subtreeIds) {
    const original = base.parts.find((part) => part.id === oldId);
    if (!original) continue;
    const originalParent = original.parentId ?? null;
    const parentId = oldId === id ? originalParent : mapping.get(originalParent ?? '') ?? originalParent;
    copies.push({
      ...original,
      id: mapping.get(oldId) ?? allocateId(used, 'part'),
      parentId,
      name: original.name ? `${original.name} copy` : original.name,
    });
  }
  return insertAfterSubtree(base.parts, subtreeIds, copies);
}

/** 鏡像軸：x → 對側（x 取負）、z → 對側（z 取負） */
export type MirrorAxis = 'x' | 'z';

/**
 * 產生對側部件（保留原部件），子樹一併複製。
 * x 軸鏡像：x 取負、ry 與 rz 取負；z 軸鏡像：z 取負、rx 與 ry 取負。
 * 註：子件沿用同一組規則（局部座標近似鏡像）；純平移的父件鏈結果精確。
 */
export function mirrorPart(model: Custom3DModel, id: string, axis: MirrorAxis): Custom3DModel {
  const base = normalizeModel(model);
  const source = base.parts.find((part) => part.id === id);
  if (!source) return base;
  const subtreeIds = collectSubtreeIds(base.parts, id);
  const used = new Set(base.parts.map((part) => part.id));
  const mapping = new Map<string, string>();
  for (const oldId of subtreeIds) {
    const newId = allocateId(used, 'part');
    used.add(newId);
    mapping.set(oldId, newId);
  }
  const copies: Custom3DPart[] = [];
  for (const oldId of subtreeIds) {
    const original = base.parts.find((part) => part.id === oldId);
    if (!original) continue;
    const originalParent = original.parentId ?? null;
    const parentId = oldId === id ? originalParent : mapping.get(originalParent ?? '') ?? originalParent;
    const mirrored: Custom3DPart = axis === 'x'
      ? { ...original, x: -original.x, ry: -original.ry, rz: -original.rz }
      : { ...original, z: -original.z, rx: -original.rx, ry: -original.ry };
    copies.push({
      ...mirrored,
      id: mapping.get(oldId) ?? allocateId(used, 'part'),
      parentId,
      name: original.name ? `${original.name} mirror` : original.name,
    });
  }
  return insertAfterSubtree(base.parts, subtreeIds, copies);
}

/** reparent 結果：成功帶新 model，失敗帶原因代碼（UI 自己接 i18n） */
export type ReparentResult =
  | { ok: true; model: Custom3DModel }
  | { ok: false; reason: string };

/** 換父件；成環、自指、找不到節點一律拒絕（見檔頭語意） */
export function reparent(
  model: Custom3DModel,
  childId: string,
  newParentId: string | null,
): ReparentResult {
  const base = normalizeModel(model);
  const child = base.parts.find((part) => part.id === childId);
  if (!child) return { ok: false, reason: 'child-not-found' };
  if (newParentId === null) {
    if (!child.parentId) return { ok: true, model: base };
    return {
      ok: true,
      model: { parts: base.parts.map((part) => (part.id === childId ? { ...part, parentId: null } : part)) },
    };
  }
  if (newParentId === childId) return { ok: false, reason: 'self-parent' };
  if (!base.parts.some((part) => part.id === newParentId)) {
    return { ok: false, reason: 'parent-not-found' };
  }
  if (collectSubtreeIds(base.parts, childId).includes(newParentId)) {
    return { ok: false, reason: 'cycle' };
  }
  return {
    ok: true,
    model: { parts: base.parts.map((part) => (part.id === childId ? { ...part, parentId: newParentId } : part)) },
  };
}

/** 調整根層順序；父部件與其整棵子樹一起移動，子件保持相鄰 */
export function reorder(model: Custom3DModel, fromIndex: number, toIndex: number): Custom3DModel {
  const base = normalizeModel(model);
  const roots = base.parts.filter((part) => !part.parentId);
  if (fromIndex < 0 || fromIndex >= roots.length) return base;
  const target = Math.max(0, Math.min(roots.length - 1, toIndex));
  if (target === fromIndex) return base;
  const order = roots.map((part) => part.id);
  const moved = order.splice(fromIndex, 1)[0];
  order.splice(target, 0, moved);
  const parts: Custom3DPart[] = [];
  for (const rootId of order) {
    const block = new Set(collectSubtreeIds(base.parts, rootId));
    for (const part of base.parts) {
      if (block.has(part.id)) parts.push(part);
    }
  }
  const placed = new Set(parts.map((part) => part.id));
  for (const part of base.parts) {
    if (!placed.has(part.id)) parts.push(part);
  }
  return { parts };
}

/** 區域更新單一部件；patch 內的 parentId 會先驗證（不合法就沿用原父件） */
export function updatePart(
  model: Custom3DModel,
  id: string,
  patch: Partial<Custom3DPart>,
): Custom3DModel {
  const base = normalizeModel(model);
  const current = base.parts.find((part) => part.id === id);
  if (!current) return base;
  const merged: Partial<Custom3DPart> = { ...current, ...patch, id };
  if (patch.scale !== undefined) {
    // scale 變了但沒指定 sx/sy/sz 時，讓三者回退新的 scale，而不是留在舊值
    if (patch.sx === undefined) delete merged.sx;
    if (patch.sy === undefined) delete merged.sy;
    if (patch.sz === undefined) delete merged.sz;
  }
  const next = normalizePart(merged);
  let parentId: string | null = next.parentId ?? null;
  if (patch.parentId !== undefined) {
    const valid = parentId === null
      || (parentId !== id
        && base.parts.some((part) => part.id === parentId)
        && !collectSubtreeIds(base.parts, id).includes(parentId));
    if (!valid) parentId = current.parentId ?? null;
  }
  return {
    parts: base.parts.map((part) => (part.id === id ? { ...next, parentId } : part)),
  };
}

/** 全部 parentId 設 null。刻意保留每個部件的本地座標值（不做世界座標換算）：
 *  編輯器欄位顯示的就是本地值，攤平後數值不變、所見即所得；要還原成世界位置是另一支工具的事。 */
export function flattenModel(model: Custom3DModel): Custom3DModel {
  const base = normalizeModel(model);
  return { parts: base.parts.map((part) => ({ ...part, parentId: null })) };
}

/** 模型統計（給編輯器狀態列用） */
export interface ModelStats {
  partCount: number;
  visibleCount: number;
  drawCalls: number;
  spinCount: number;
}

/** 部件數、可見部件數、draw call 數（= 可見部件數）、自轉部件數 */
export function modelStats(model: Custom3DModel): ModelStats {
  const base = normalizeModel(model);
  let visibleCount = 0;
  let spinCount = 0;
  for (const part of base.parts) {
    if (part.hidden) continue;
    visibleCount += 1;
    if (part.spin) spinCount += 1;
  }
  return { partCount: base.parts.length, visibleCount, drawCalls: visibleCount, spinCount };
}

/** 越界估計結果 */
export interface ModelBounds {
  maxRadius: number;
  exceeded: boolean;
}

/**
 * 部件半徑估計係數。
 *
 * TOWER_PART_SHAPES 裡最大的幾何（base 0.42、skirt 0.44、halo 0.33）半徑都小於 0.5，
 * 用 0.5 會讓「置中、scale=1」的預設部件一律被判越界，警告永遠亮著就等於沒有警告。
 * 取 0.35 當典型部件半徑：置中部件不會誤報，真的推到邊緣（|x| 超過約 0.12）才會亮。
 */
const PART_RADIUS_FACTOR = 0.35;

/** 越界估計：用 |x| + 0.35*scale 與 |z| + 0.35*scale 取大者，超過地塊半寬即算越界 */
export function outOfBounds(model: Custom3DModel): ModelBounds {
  const base = normalizeModel(model);
  let maxRadius = 0;
  for (const part of base.parts) {
    if (part.hidden) continue;
    const radius = Math.max(
      Math.abs(part.x) + PART_RADIUS_FACTOR * part.scale,
      Math.abs(part.z) + PART_RADIUS_FACTOR * part.scale,
    );
    if (radius > maxRadius) maxRadius = radius;
  }
  return { maxRadius, exceeded: maxRadius > TILE_HALF_WIDTH };
}

/** 序列化：含 formatVersion 與 kind 的 JSON 字串（parts 先正規化） */
export function serializeModel(model: Custom3DModel): string {
  const base = normalizeModel(model);
  return JSON.stringify({
    formatVersion: MODEL_FORMAT_VERSION,
    kind: MODEL_KIND,
    parts: base.parts,
  });
}

/** 解析結果：壞 JSON／缺 parts／parts 非陣列都回 reason，不拋錯 */
export type ParseModelResult =
  | { ok: true; model: Custom3DModel }
  | { ok: false; reason: string };

function readStringField(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function readNumberField(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' ? value : undefined;
}

function readBooleanField(record: Record<string, unknown>, key: string): boolean | undefined {
  const value = record[key];
  return typeof value === 'boolean' ? value : undefined;
}

/** 把任意 JSON 值收斂成 Partial<Custom3DPart>，型別不合的欄位直接丟掉 */
function toPartInput(value: unknown): Partial<Custom3DPart> {
  if (!isRecord(value)) return {};
  const material = MATERIAL_ROLES.find((role) => role === value.material);
  return {
    id: readStringField(value, 'id'),
    shape: readStringField(value, 'shape'),
    material,
    x: readNumberField(value, 'x'),
    y: readNumberField(value, 'y'),
    z: readNumberField(value, 'z'),
    rx: readNumberField(value, 'rx'),
    ry: readNumberField(value, 'ry'),
    rz: readNumberField(value, 'rz'),
    scale: readNumberField(value, 'scale'),
    sx: readNumberField(value, 'sx'),
    sy: readNumberField(value, 'sy'),
    sz: readNumberField(value, 'sz'),
    color: readStringField(value, 'color'),
    emissive: readNumberField(value, 'emissive'),
    opacity: readNumberField(value, 'opacity'),
    name: readStringField(value, 'name'),
    hidden: readBooleanField(value, 'hidden'),
    locked: readBooleanField(value, 'locked'),
    parentId: readStringField(value, 'parentId') ?? null,
    spin: readBooleanField(value, 'spin'),
  };
}

/** 守衛式解析：不拋錯，任何結構問題都回 ok:false 與原因代碼 */
export function parseModel(text: string): ParseModelResult {
  if (typeof text !== 'string' || !text.trim()) return { ok: false, reason: 'empty' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }
  if (!isRecord(parsed)) return { ok: false, reason: 'not-an-object' };
  if (parsed.kind !== undefined && parsed.kind !== MODEL_KIND) {
    return { ok: false, reason: 'kind-mismatch' };
  }
  const rawParts = parsed.parts;
  if (rawParts === undefined || rawParts === null) return { ok: false, reason: 'missing-parts' };
  if (!Array.isArray(rawParts)) return { ok: false, reason: 'parts-not-array' };
  const items: unknown[] = rawParts;
  return { ok: true, model: normalizeModel({ parts: items.map(toPartInput) }) };
}

/** 復原歷史（上限 100 步；push 相同內容不記錄，push 會清空 redo） */
export interface ModelHistory {
  current(): Custom3DModel;
  push(next: Custom3DModel): void;
  undo(): Custom3DModel;
  redo(): Custom3DModel;
  canUndo(): boolean;
  canRedo(): boolean;
  reset(model: Custom3DModel): void;
}

function signatureOf(model: Custom3DModel): string {
  return JSON.stringify(model.parts);
}

/** 建立復原歷史；每次 push 先正規化，內容與當前相同就忽略 */
export function createModelHistory(initial: Custom3DModel): ModelHistory {
  const states: Custom3DModel[] = [normalizeModel(initial)];
  let index = 0;
  return {
    current: () => states[index],
    push(next) {
      const normalized = normalizeModel(next);
      if (signatureOf(normalized) === signatureOf(states[index])) return;
      states.splice(index + 1);
      states.push(normalized);
      if (states.length > HISTORY_LIMIT) states.shift();
      index = states.length - 1;
    },
    undo() {
      if (index > 0) index -= 1;
      return states[index];
    },
    redo() {
      if (index < states.length - 1) index += 1;
      return states[index];
    },
    canUndo: () => index > 0,
    canRedo: () => index < states.length - 1,
    reset(model) {
      states.length = 0;
      states.push(normalizeModel(model));
      index = 0;
    },
  };
}
