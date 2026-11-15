/**
 * 規則圖畫布（GraphCanvas）
 *
 * 純 SVG／DOM 實作，沒有第三方畫布套件：
 * - 節點、埠、連線全部由 graph 投影出來；畫布不持有規則狀態（唯一真相在外殼）
 * - 拖曳位移只存在本地 preview state（指標狀態放 ref），放手才透過 onMoveNodes 提交
 * - 縮放／平移只改 <g> 的 transform，節點座標永遠是圖座標
 * - 文案一律走 studioText(t, 'studio.graph.*')，畫布不寫死任何中文
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useTranslation } from '@/i18n';
import type {
  GraphEdge,
  GraphNode,
  GraphNodeCategory,
  GraphNodeSpec,
  GraphParamValue,
  GraphPortKind,
  RuleGraph,
} from '@/workshop/graph/model';
import { studioText } from '@/workshop/graph/model';
import { nodeSpec } from '@/workshop/graph/nodeLibrary';
import { portsCompatible } from '@/workshop/graph/validate';

/* ------------------------------------------------------------ 幾何常數 */

const NODE_W = 176;
const NODE_HEADER = 34;
const NODE_ROW = 20;
const PORT_TOP = NODE_HEADER + 8;
const NODE_SUMMARY = 24;
const PORT_HIT_RADIUS = 15;
const PORT_VISUAL = 5.5;
const FRAME_OFFSET = 5;
const NODE_RADIUS = 14;
const GRID_SIZE = 24;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2;
const ZOOM_FACTOR = 1.12;
const BEZIER_MIN = 36;
const BOX_MIN_SIZE = 2;

/** 標題列：上緣圓角、下緣切平 */
const HEADER_PATH =
  'M 0 ' + NODE_RADIUS +
  ' Q 0 0 ' + NODE_RADIUS + ' 0 L ' + (NODE_W - NODE_RADIUS) + ' 0' +
  ' Q ' + NODE_W + ' 0 ' + NODE_W + ' ' + NODE_RADIUS +
  ' L ' + NODE_W + ' ' + NODE_HEADER + ' L 0 ' + NODE_HEADER + ' Z';

/**
 * 語意色：--cn-signal／--cn-caution 目前只有 -text 變體（themes.css 沒定義本體），
 * 一律帶既有 token 當 fallback；主題層補上本體後會自動接上。
 */
const COLOR_SIGNAL = 'var(--cn-signal, var(--cn-signal-text))';
const COLOR_ALERT = 'var(--cn-alert, var(--cn-alarm-text))';
const COLOR_CAUTION = 'var(--cn-caution, var(--cn-caution-text))';

const PORT_COLOR: Record<GraphPortKind, string> = {
  flow: 'var(--cn-ink-2)',
  number: 'var(--cn-sky)',
  boolean: 'var(--cn-grape)',
  string: 'var(--cn-mint)',
};

const CATEGORY_TINT: Record<GraphNodeCategory | 'unknown', string> = {
  event: 'var(--cn-coral-soft)',
  condition: 'var(--cn-grape-soft)',
  action: 'var(--cn-mint-soft)',
  flow: 'var(--cn-sky-soft)',
  value: 'var(--cn-sun-soft)',
  js: 'var(--cn-alert-soft)',
  unknown: 'var(--cn-card-2)',
};

/* ---------------------------------------------------------------- 型別 */

export interface GraphSelection {
  nodes: string[];
  edges: string[];
}

export interface GraphCanvasProps {
  graph: RuleGraph;
  selection: GraphSelection;
  /** nodeId → 'error' | 'warning'，畫布標紅／標黃 */
  issuesByNode: Readonly<Record<string, 'error' | 'warning'>>;
  onSelectionChange: (selection: GraphSelection) => void;
  onMoveNodes: (moves: ReadonlyArray<{ id: string; x: number; y: number }>) => void;
  onConnect: (edge: { from: string; fromPort: string; to: string; toPort: string }) => void;
  onDeleteSelection: (nodeIds: string[], edgeIds: string[]) => void;
  /** 雙擊空白：外殼開節點選擇器 */
  onRequestAddNode: (point: { x: number; y: number }) => void;
  /** 雙擊節點：外殼開檢視器 */
  onOpenNode: (nodeId: string) => void;
}

interface Point { x: number; y: number }
interface GraphView { x: number; y: number; k: number }
interface BoxRect { x: number; y: number; w: number; h: number }

interface PortRow {
  portId: string;
  kind: GraphPortKind;
  labelKey: string;
  /** 節點內部座標 */
  y: number;
}

interface NodeBox {
  nodeId: string;
  /** 圖座標（已含拖曳預覽位移） */
  x: number;
  y: number;
  height: number;
  glyph: string;
  label: string;
  summary: string;
  category: GraphNodeCategory | 'unknown';
  issue: 'error' | 'warning' | null;
  disabled: boolean;
  inputs: PortRow[];
  outputs: PortRow[];
}

interface PortAnchor {
  nodeId: string;
  portId: string;
  dir: 'in' | 'out';
  kind: GraphPortKind;
  x: number;
  y: number;
}

interface EdgeShape { edge: GraphEdge; d: string }

interface CanvasScene {
  boxes: NodeBox[];
  edges: EdgeShape[];
  anchors: PortAnchor[];
  anchorIndex: Map<string, PortAnchor>;
}

interface PreviewShift { ids: Set<string>; dx: number; dy: number }

interface LinkSource {
  nodeId: string;
  portId: string;
  dir: 'in' | 'out';
  kind: GraphPortKind;
}

interface LinkDrag {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dir: 'in' | 'out';
  kind: GraphPortKind;
  hoverKey: string | null;
  hoverOk: boolean;
}

type DragState =
  | { mode: 'pan'; startX: number; startY: number; originX: number; originY: number }
  | { mode: 'move'; idSet: Set<string>; startX: number; startY: number; dx: number; dy: number }
  | { mode: 'box'; startX: number; startY: number; additive: boolean; rect: BoxRect }
  | { mode: 'connect'; source: LinkSource; start: Point; target: PortAnchor | null };

/* -------------------------------------------------------------- 純函式 */

function portKey(nodeId: string, dir: 'in' | 'out', portId: string): string {
  return nodeId + '|' + dir + '|' + portId;
}

function rowY(index: number): number {
  return PORT_TOP + index * NODE_ROW + NODE_ROW / 2;
}

function r1(value: number): number {
  return Math.round(value * 10) / 10;
}

function nodeHeight(inputCount: number, outputCount: number): number {
  const rows = Math.max(inputCount, outputCount, 1);
  return PORT_TOP + rows * NODE_ROW + NODE_SUMMARY;
}

function clipText(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max - 1) + '\u2026';
}

function formatNumber(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '0';
}

function formatParamValue(value: GraphParamValue): string {
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'boolean') return value ? 'on' : 'off';
  return value;
}

/** 參數摘要：只用資料（數字／符號／鍵名），不放任何 UI 文案 */
function paramSummary(node: GraphNode, spec: GraphNodeSpec | null): string {
  if (spec === null) return '';
  const parts: string[] = [];
  for (const param of spec.params) {
    const value = node.params[param.key];
    if (value === undefined) continue;
    if (param.key === 'op' && typeof value === 'string') {
      parts.push(value);
    } else if (typeof value === 'string' && value.length === 0) {
      continue;
    } else {
      parts.push(param.key + '=' + formatParamValue(value));
    }
    if (parts.length >= 3) break;
  }
  if (spec.unanalyzable) parts.push('js');
  return clipText(parts.join(' \u00b7 '), 30);
}

/** 連線曲線：M x1 y1 C x1+dx y1, x2-dx y2, x2 y2（出發埠在右、目標埠在左） */
function bezierPath(from: Point, to: Point): string {
  const dx = Math.max(BEZIER_MIN, Math.abs(to.x - from.x) * 0.5);
  return 'M ' + r1(from.x) + ' ' + r1(from.y) + ' C ' + r1(from.x + dx) + ' ' + r1(from.y) +
    ', ' + r1(to.x - dx) + ' ' + r1(to.y) + ', ' + r1(to.x) + ' ' + r1(to.y);
}

function linkPath(link: LinkDrag): string {
  const forward = link.dir === 'out';
  const ax = forward ? link.x1 : link.x2;
  const ay = forward ? link.y1 : link.y2;
  const bx = forward ? link.x2 : link.x1;
  const by = forward ? link.y2 : link.y1;
  const dx = Math.max(BEZIER_MIN, Math.abs(bx - ax) * 0.5);
  return 'M ' + r1(ax) + ' ' + r1(ay) + ' C ' + r1(ax + dx) + ' ' + r1(ay) +
    ', ' + r1(bx - dx) + ' ' + r1(by) + ', ' + r1(bx) + ' ' + r1(by);
}

function normalizeRect(x1: number, y1: number, x2: number, y2: number): BoxRect {
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

function rectsIntersect(a: BoxRect, b: BoxRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function readIssue(value: 'error' | 'warning' | undefined): 'error' | 'warning' | null {
  if (value === 'error') return 'error';
  if (value === 'warning') return 'warning';
  return null;
}

function unionIds(base: readonly string[], extra: readonly string[]): string[] {
  const out = base.slice();
  for (const id of extra) {
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.closest('input, textarea, select, [contenteditable="true"]') !== null;
}

/* ---------------------------------------------------------------- 元件 */

export function GraphCanvas({
  graph,
  selection,
  issuesByNode,
  onSelectionChange,
  onMoveNodes,
  onConnect,
  onDeleteSelection,
  onRequestAddNode,
  onOpenNode,
}: GraphCanvasProps): React.ReactElement {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const spaceRef = useRef(false);

  const [view, setView] = useState<GraphView>({ x: 48, y: 48, k: 1 });
  const [preview, setPreview] = useState<PreviewShift | null>(null);
  const [boxRect, setBoxRect] = useState<BoxRect | null>(null);
  const [link, setLink] = useState<LinkDrag | null>(null);
  const [panning, setPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);

  const gridId = 'graph-grid-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const selectionNodeSet = useMemo(() => new Set(selection.nodes), [selection.nodes]);
  const selectionEdgeSet = useMemo(() => new Set(selection.edges), [selection.edges]);

  /** 全部幾何：節點框、埠錨點、連線曲線。預覽位移只疊加在這裡，圖資料不動。 */
  const scene = useMemo<CanvasScene>(() => {
    const boxes: NodeBox[] = [];
    const anchors: PortAnchor[] = [];
    const anchorIndex = new Map<string, PortAnchor>();

    for (const node of graph.nodes) {
      const spec = nodeSpec(node.type);
      const shift = preview !== null && preview.ids.has(node.id) ? preview : null;
      const x = node.x + (shift === null ? 0 : shift.dx);
      const y = node.y + (shift === null ? 0 : shift.dy);
      const inputs = spec === null ? [] : spec.inputs;
      const outputs = spec === null ? [] : spec.outputs;
      const box: NodeBox = {
        nodeId: node.id,
        x,
        y,
        height: spec === null ? NODE_HEADER + NODE_SUMMARY + 10 : nodeHeight(inputs.length, outputs.length),
        glyph: spec === null ? '?' : spec.glyph,
        label: spec === null ? node.type : studioText(t, spec.labelKey),
        summary: paramSummary(node, spec),
        category: spec === null ? 'unknown' : spec.category,
        issue: readIssue(issuesByNode[node.id]),
        disabled: node.enabled === false,
        inputs: [],
        outputs: [],
      };

      inputs.forEach((port, index) => {
        const localY = rowY(index);
        box.inputs.push({ portId: port.id, kind: port.kind, labelKey: port.labelKey, y: localY });
        const anchor: PortAnchor = { nodeId: node.id, portId: port.id, dir: 'in', kind: port.kind, x, y: y + localY };
        anchors.push(anchor);
        anchorIndex.set(portKey(node.id, 'in', port.id), anchor);
      });

      outputs.forEach((port, index) => {
        const localY = rowY(index);
        box.outputs.push({ portId: port.id, kind: port.kind, labelKey: port.labelKey, y: localY });
        const anchor: PortAnchor = {
          nodeId: node.id,
          portId: port.id,
          dir: 'out',
          kind: port.kind,
          x: x + NODE_W,
          y: y + localY,
        };
        anchors.push(anchor);
        anchorIndex.set(portKey(node.id, 'out', port.id), anchor);
      });

      boxes.push(box);
    }

    const edges: EdgeShape[] = [];
    for (const edge of graph.edges) {
      const from = anchorIndex.get(portKey(edge.from, 'out', edge.fromPort));
      const to = anchorIndex.get(portKey(edge.to, 'in', edge.toPort));
      if (from === undefined || to === undefined) continue;
      edges.push({ edge, d: bezierPath(from, to) });
    }

    return { boxes, edges, anchors, anchorIndex };
  }, [graph.nodes, graph.edges, preview, issuesByNode, t]);

  /* ------------------------------------------------------------- 座標 */

  function toGraphPoint(clientX: number, clientY: number): Point {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect === undefined) return { x: 0, y: 0 };
    return { x: (clientX - rect.left - view.x) / view.k, y: (clientY - rect.top - view.y) / view.k };
  }

  function focusCanvas(): void {
    containerRef.current?.focus({ preventScroll: true });
  }

  /* ------------------------------------------------- 縮放（非 passive） */

  useEffect(() => {
    const element = containerRef.current;
    if (element === null) return;
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const sx = event.clientX - rect.left;
      const sy = event.clientY - rect.top;
      const factor = event.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      setView((prev) => {
        const k = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev.k * factor));
        if (k === prev.k) return prev;
        // 以游標為中心：游標下的圖座標在縮放前後保持不動
        return { k, x: sx - ((sx - prev.x) / prev.k) * k, y: sy - ((sy - prev.y) / prev.k) * k };
      });
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, []);

  /* ------------------------------------------- 空白鍵平移（全域監聽） */

  useEffect(() => {
    const down = (event: KeyboardEvent): void => {
      if (event.code !== 'Space' || isEditableTarget(event.target)) return;
      spaceRef.current = true;
      setSpaceHeld(true);
      event.preventDefault();
    };
    const up = (event: KeyboardEvent): void => {
      if (event.code !== 'Space') return;
      spaceRef.current = false;
      setSpaceHeld(false);
    };
    const blur = (): void => {
      spaceRef.current = false;
      setSpaceHeld(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  /* --------------------------------------------------------- 指標事件 */

  function handleCanvasPointerDown(event: React.PointerEvent<SVGSVGElement>): void {
    if (event.button === 1 || spaceRef.current || event.altKey) {
      event.preventDefault();
      focusCanvas();
      dragRef.current = {
        mode: 'pan', startX: event.clientX, startY: event.clientY, originX: view.x, originY: view.y,
      };
      setPanning(true);
      svgRef.current?.setPointerCapture(event.pointerId);
      return;
    }
    if (event.button !== 0) return;
    event.preventDefault();
    focusCanvas();
    const point = toGraphPoint(event.clientX, event.clientY);
    const rect = { x: point.x, y: point.y, w: 0, h: 0 };
    dragRef.current = { mode: 'box', startX: point.x, startY: point.y, additive: event.shiftKey, rect };
    setBoxRect(rect);
    if (!event.shiftKey) onSelectionChange({ nodes: [], edges: [] });
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function handleNodePointerDown(event: React.PointerEvent<SVGGElement>, nodeId: string): void {
    if (event.button !== 0) return;
    // 空白鍵／Alt 按住時不攔事件 → 冒泡到畫布做平移
    if (spaceRef.current || event.altKey) return;
    event.stopPropagation();
    event.preventDefault();
    focusCanvas();

    const additive = event.shiftKey;
    const already = selection.nodes.includes(nodeId);
    if (additive && already) {
      onSelectionChange({ nodes: selection.nodes.filter((id) => id !== nodeId), edges: selection.edges });
      return;
    }
    const nodes = additive ? unionIds(selection.nodes, [nodeId]) : already ? selection.nodes.slice() : [nodeId];
    onSelectionChange({ nodes, edges: additive ? selection.edges : [] });

    dragRef.current = { mode: 'move', idSet: new Set(nodes), startX: event.clientX, startY: event.clientY, dx: 0, dy: 0 };
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function handleEdgePointerDown(event: React.PointerEvent<SVGPathElement>, edgeId: string): void {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    focusCanvas();
    onSelectionChange({ nodes: [], edges: [edgeId] });
  }

  function handlePortPointerDown(
    event: React.PointerEvent<SVGGElement>,
    nodeId: string,
    row: PortRow,
    dir: 'in' | 'out',
  ): void {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    focusCanvas();

    const anchor = scene.anchorIndex.get(portKey(nodeId, dir, row.portId));
    const start = anchor === undefined ? toGraphPoint(event.clientX, event.clientY) : { x: anchor.x, y: anchor.y };
    dragRef.current = {
      mode: 'connect',
      source: { nodeId, portId: row.portId, dir, kind: row.kind },
      start,
      target: null,
    };
    setLink({
      x1: start.x, y1: start.y, x2: start.x, y2: start.y, dir, kind: row.kind, hoverKey: null, hoverOk: false,
    });
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  /** 找游標附近「方向相反」的埠（不檢查相容性，讓不合法的目標也能高亮成錯誤色） */
  function findPortNear(point: Point, source: LinkSource): PortAnchor | null {
    let best: PortAnchor | null = null;
    let bestDist = PORT_HIT_RADIUS + 4;
    for (const anchor of scene.anchors) {
      if (anchor.nodeId === source.nodeId || anchor.dir === source.dir) continue;
      const dx = anchor.x - point.x;
      const dy = anchor.y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= bestDist) {
        best = anchor;
        bestDist = dist;
      }
    }
    return best;
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>): void {
    const drag = dragRef.current;
    if (drag === null) return;

    if (drag.mode === 'pan') {
      setView((prev) => ({
        ...prev,
        x: drag.originX + (event.clientX - drag.startX),
        y: drag.originY + (event.clientY - drag.startY),
      }));
      return;
    }

    if (drag.mode === 'move') {
      const dx = (event.clientX - drag.startX) / view.k;
      const dy = (event.clientY - drag.startY) / view.k;
      drag.dx = dx;
      drag.dy = dy;
      setPreview({ ids: drag.idSet, dx, dy });
      return;
    }

    if (drag.mode === 'box') {
      const point = toGraphPoint(event.clientX, event.clientY);
      const rect = normalizeRect(drag.startX, drag.startY, point.x, point.y);
      drag.rect = rect;
      setBoxRect(rect);
      return;
    }

    const point = toGraphPoint(event.clientX, event.clientY);
    const target = findPortNear(point, drag.source);
    drag.target = target;
    setLink({
      x1: drag.start.x, y1: drag.start.y,
      x2: target === null ? point.x : target.x, y2: target === null ? point.y : target.y,
      dir: drag.source.dir, kind: drag.source.kind,
      hoverKey: target === null ? null : portKey(target.nodeId, target.dir, target.portId),
      hoverOk: target !== null && portsCompatible(drag.source.kind, target.kind),
    });
  }

  function handlePointerUp(event: React.PointerEvent<SVGSVGElement>): void {
    const drag = dragRef.current;
    dragRef.current = null;
    const svg = svgRef.current;
    if (svg !== null && svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    setPanning(false);
    if (drag === null) return;

    if (drag.mode === 'move') {
      setPreview(null);
      if (drag.dx !== 0 || drag.dy !== 0) {
        const moves: { id: string; x: number; y: number }[] = [];
        for (const node of graph.nodes) {
          if (!drag.idSet.has(node.id)) continue;
          moves.push({ id: node.id, x: Math.round(node.x + drag.dx), y: Math.round(node.y + drag.dy) });
        }
        if (moves.length > 0) onMoveNodes(moves);
      }
      return;
    }

    if (drag.mode === 'box') {
      const rect = drag.rect;
      setBoxRect(null);
      if (rect.w < BOX_MIN_SIZE && rect.h < BOX_MIN_SIZE) return;
      const hit: string[] = [];
      for (const box of scene.boxes) {
        if (rectsIntersect(rect, { x: box.x, y: box.y, w: NODE_W, h: box.height })) hit.push(box.nodeId);
      }
      onSelectionChange({
        nodes: drag.additive ? unionIds(selection.nodes, hit) : hit,
        edges: drag.additive ? selection.edges : [],
      });
      return;
    }

    if (drag.mode !== 'connect') return;
    const target = drag.target;
    setLink(null);
    if (target === null) return;
    if (!portsCompatible(drag.source.kind, target.kind)) return;
    const payload =
      drag.source.dir === 'out'
        ? { from: drag.source.nodeId, fromPort: drag.source.portId, to: target.nodeId, toPort: target.portId }
        : { from: target.nodeId, fromPort: target.portId, to: drag.source.nodeId, toPort: drag.source.portId };
    const duplicate = graph.edges.some(
      (edge) =>
        edge.from === payload.from &&
        edge.fromPort === payload.fromPort &&
        edge.to === payload.to &&
        edge.toPort === payload.toPort,
    );
    if (!duplicate) onConnect(payload);
  }

  function handleCanvasDoubleClick(event: React.MouseEvent<SVGSVGElement>): void {
    if (dragRef.current !== null) return;
    const point = toGraphPoint(event.clientX, event.clientY);
    onRequestAddNode({ x: Math.round(point.x), y: Math.round(point.y) });
  }

  function handleNodeDoubleClick(event: React.MouseEvent<SVGGElement>, nodeId: string): void {
    event.stopPropagation();
    event.preventDefault();
    dragRef.current = null;
    onOpenNode(nodeId);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (isEditableTarget(event.target)) return;
    if ((event.ctrlKey || event.metaKey) && (event.key === 'a' || event.key === 'A')) {
      event.preventDefault();
      onSelectionChange({
        nodes: graph.nodes.map((node) => node.id),
        edges: graph.edges.map((edge) => edge.id),
      });
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selection.nodes.length === 0 && selection.edges.length === 0) return;
      event.preventDefault();
      onDeleteSelection(selection.nodes.slice(), selection.edges.slice());
      return;
    }
    if (event.key === 'Escape') onSelectionChange({ nodes: [], edges: [] });
  }

  /* ---------------------------------------------------------------- 繪製 */

  function renderPort(box: NodeBox, row: PortRow, dir: 'in' | 'out'): React.ReactElement {
    const key = portKey(box.nodeId, dir, row.portId);
    const hovered = link !== null && link.hoverKey === key;
    const hoverOk = hovered && link !== null && link.hoverOk;
    const stroke = hovered ? (hoverOk ? COLOR_SIGNAL : COLOR_ALERT) : PORT_COLOR[row.kind];
    const cx = dir === 'in' ? 0 : NODE_W;
    return (
      <g
        key={dir + '-' + row.portId}
        style={{ cursor: 'crosshair' }}
        onPointerDown={(event) => handlePortPointerDown(event, box.nodeId, row, dir)}
      >
        <title>{studioText(t, row.labelKey)}</title>
        <circle cx={cx} cy={row.y} r={PORT_HIT_RADIUS} fill="transparent" />
        {row.kind === 'flow' ? (
          <rect x={cx - PORT_VISUAL} y={row.y - PORT_VISUAL} width={PORT_VISUAL * 2}
            height={PORT_VISUAL * 2} rx={2} fill="var(--cn-card)" stroke={stroke}
            strokeWidth={hovered ? 3.5 : 2.5} pointerEvents="none" />
        ) : (
          <circle cx={cx} cy={row.y} r={PORT_VISUAL} fill="var(--cn-card)" stroke={stroke}
            strokeWidth={hovered ? 3.5 : 2.5} pointerEvents="none" />
        )}
        {hovered ? (
          <circle cx={cx} cy={row.y} r={PORT_HIT_RADIUS - 3} fill="none" stroke={stroke}
            strokeWidth={1.5} strokeDasharray="4 3" pointerEvents="none" />
        ) : null}
      </g>
    );
  }

  function renderNode(box: NodeBox): React.ReactElement {
    const selected = selectionNodeSet.has(box.nodeId);
    const frame =
      box.issue === 'error'
        ? COLOR_ALERT
        : box.issue === 'warning'
          ? COLOR_CAUTION
          : selected
            ? COLOR_SIGNAL
            : 'transparent';
    return (
      <g
        key={box.nodeId}
        transform={'translate(' + r1(box.x) + ' ' + r1(box.y) + ')'}
        opacity={box.disabled ? 0.55 : 1}
        style={{ cursor: 'grab' }}
        onPointerDown={(event) => handleNodePointerDown(event, box.nodeId)}
        onDoubleClick={(event) => handleNodeDoubleClick(event, box.nodeId)}
      >
        <rect x={-FRAME_OFFSET} y={-FRAME_OFFSET} width={NODE_W + FRAME_OFFSET * 2}
          height={box.height + FRAME_OFFSET * 2} rx={NODE_RADIUS + FRAME_OFFSET} fill="none"
          stroke={frame} strokeWidth={3} pointerEvents="none"
          strokeDasharray={box.issue === 'warning' ? '8 5' : undefined} />
        <rect width={NODE_W} height={box.height} rx={NODE_RADIUS} fill="var(--cn-card)" pointerEvents="none" />
        <path d={HEADER_PATH} fill={CATEGORY_TINT[box.category]} pointerEvents="none" />
        <line x1={0} y1={NODE_HEADER} x2={NODE_W} y2={NODE_HEADER} stroke="var(--cn-line-soft)"
          strokeWidth={1.5} pointerEvents="none" />
        <rect width={NODE_W} height={box.height} rx={NODE_RADIUS} fill="none"
          stroke={selected ? COLOR_SIGNAL : 'var(--cn-line)'} strokeWidth={selected ? 3 : 2.5}
          pointerEvents="none" />

        <rect x={8} y={7} width={20} height={20} rx={7} fill="var(--cn-card)" stroke="var(--cn-line)"
          strokeWidth={1.5} pointerEvents="none" />
        <text x={18} y={21} textAnchor="middle" fontSize={9} fontWeight={800} fill="var(--cn-ink)"
          pointerEvents="none">
          {box.glyph}
        </text>
        <text x={34} y={22} fontSize={11.5} fontWeight={800} fill="var(--cn-ink)" pointerEvents="none">
          {clipText(box.label, 12)}
        </text>

        {box.inputs.map((row) => renderPort(box, row, 'in'))}
        {box.outputs.map((row) => renderPort(box, row, 'out'))}

        {box.summary.length > 0 ? (
          <text x={10} y={box.height - 8} fontSize={9.5} fontFamily="var(--cn-mono)" fill="var(--cn-ink-3)"
            pointerEvents="none">
            {box.summary}
          </text>
        ) : null}

        {box.issue !== null ? (
          <g pointerEvents="none">
            <circle cx={NODE_W - 13} cy={12} r={8} fill={box.issue === 'error' ? COLOR_ALERT : COLOR_CAUTION} />
            <text x={NODE_W - 13} y={15.5} textAnchor="middle" fontSize={10} fontWeight={900}
              fill="var(--cn-on-fill)">
              !
            </text>
          </g>
        ) : null}
      </g>
    );
  }

  const cursor = panning ? 'grabbing' : spaceHeld ? 'grab' : 'default';
  const zoomLabel = Math.round(view.k * 100) + '%';

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label={studioText(t, 'studio.graph.canvas.label')}
      onKeyDown={handleKeyDown}
      className="relative h-full min-h-[420px] w-full overflow-hidden rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] outline-hidden focus-visible:ring-3 focus-visible:ring-[var(--cn-signal-text)]"
      style={{ touchAction: 'none' }}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full select-none"
        style={{ cursor }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleCanvasDoubleClick}
        onContextMenu={(event) => event.preventDefault()}
      >
        <defs>
          <pattern id={gridId} width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <circle cx={1.5} cy={1.5} r={1.3} fill="var(--cn-line-soft)" />
          </pattern>
        </defs>

        <g transform={'translate(' + r1(view.x) + ' ' + r1(view.y) + ') scale(' + view.k + ')'}>
          <rect x={-4000} y={-4000} width={8000} height={8000} fill={'url(#' + gridId + ')'}
            pointerEvents="none" />

          {scene.edges.map((shape) => {
            const selected = selectionEdgeSet.has(shape.edge.id);
            return (
              <g key={shape.edge.id}>
                <path d={shape.d} fill="none" stroke="transparent" strokeWidth={16}
                  vectorEffect="non-scaling-stroke" pointerEvents="stroke"
                  style={{ cursor: 'pointer' }}
                  onPointerDown={(event) => handleEdgePointerDown(event, shape.edge.id)} />
                <path d={shape.d} fill="none" stroke={selected ? COLOR_SIGNAL : 'var(--cn-ink-3)'}
                  strokeWidth={selected ? 3.2 : 2.2} strokeLinecap="round"
                  vectorEffect="non-scaling-stroke" pointerEvents="none" />
              </g>
            );
          })}

          {link !== null ? (
            <path d={linkPath(link)} fill="none" strokeWidth={2.6} strokeLinecap="round"
              stroke={link.hoverKey !== null && !link.hoverOk ? COLOR_ALERT : PORT_COLOR[link.kind]}
              strokeDasharray={link.hoverOk ? undefined : '6 4'}
              vectorEffect="non-scaling-stroke" pointerEvents="none" />
          ) : null}

          {scene.boxes.map((box) => renderNode(box))}

          {boxRect !== null ? (
            <rect x={boxRect.x} y={boxRect.y} width={boxRect.w} height={boxRect.h}
              fill={COLOR_SIGNAL} fillOpacity={0.08} stroke={COLOR_SIGNAL} strokeWidth={1.5}
              strokeDasharray="6 4" vectorEffect="non-scaling-stroke" pointerEvents="none" />
          ) : null}
        </g>
      </svg>

      <div className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-2 rounded-[10px] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2 py-0.5">
        <span className="arc-label text-[10px] text-[var(--cn-ink-3)]">{zoomLabel}</span>
      </div>

      {graph.nodes.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="arc-label max-w-[70%] text-center text-[12px] text-[var(--cn-ink-3)]">
            {studioText(t, 'studio.graph.canvas.empty')}
          </span>
        </div>
      ) : null}
    </div>
  );
}
