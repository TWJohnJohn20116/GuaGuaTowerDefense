/**
 * 3D 塔模型編輯視窗
 *
 * 這不是預覽圖，是編輯視窗。行為契約：
 *  - 滑鼠：左鍵選取／拖 gizmo／空白拖框選、右鍵旋轉視角、中鍵平移、滾輪縮放
 *  - 工具：移動 / 旋轉 / 縮放三種 gizmo；拖曳時即時改場景節點，放手才提交（不逐幀重建模型）
 *  - 視角：前 / 後 / 左 / 右 / 頂 / 等角，正交與透視可切
 *  - 場景輔助：地塊邊界框（0.94×0.94）、網格地面、世界軸指示
 *  - 著色：實體 / 線框 / 法線
 *
 * 效能與正確性：
 *  - 幀迴圈包 createFrameLoopGuard（AGENTS §4.5）
 *  - 拖曳中只改 Object3D transform；只有模型／顏色／著色模式變動才重建
 *  - 著色模式用共享覆蓋材質；重建前先還原原材質再交給 disposeTowerModel，避免材質洩漏
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildCustomTowerModel, disposeTowerModel } from '@/components/scenes/game-scene/three/towerModels3d';
import { createFrameLoopGuard } from '@/utils/frameLoopGuard';
import type { Custom3DModel, Custom3DPart } from '@/types/game';
import {
  dragRotate,
  dragScale,
  dragTranslate,
  sphericalOffset,
  VIEW_ANGLES,
  type GizmoAxis,
  type GizmoTool,
  type ViewPreset,
} from '@/workshop/model/gizmo';

export type ShadingMode = 'solid' | 'wireframe' | 'normals';
export type TransformPhase = 'live' | 'commit';

export interface ModelViewportProps {
  model: Custom3DModel;
  /** 塔主色（accent／glow 材質用） */
  towerColor?: string;
  selectedIds: string[];
  tool: GizmoTool;
  /** 鎖定單軸（X/Y/Z 鍵切換）：非該軸的 gizmo 手柄隱藏 */
  axisLock?: GizmoAxis | null;
  shading: ShadingMode;
  ortho: boolean;
  showGrid: boolean;
  showBounds: boolean;
  snap: boolean;
  background: string;
  ambient: number;
  viewPreset: { id: ViewPreset; nonce: number };
  focusNonce: number;
  onSelect: (ids: string[], additive: boolean) => void;
  onTransform: (id: string, patch: Partial<Custom3DPart>, phase: TransformPhase) => void;
}

const AXIS_COLOR: Record<GizmoAxis, number> = { x: 0xe5484d, y: 0x46a758, z: 0x3b82f6 };
const AXES: GizmoAxis[] = ['x', 'y', 'z'];
const TILE_HALF = 0.47;
const SNAP_STEP = 0.05;
const ROTATE_SNAP = Math.PI / 12;

interface Rig {
  theta: number;
  phi: number;
  dist: number;
  target: THREE.Vector3;
}

interface DragState {
  mode: 'orbit' | 'pan' | 'gizmo' | 'marquee';
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  axis?: GizmoAxis;
  partId?: string;
  startPart?: Custom3DPart;
  node?: THREE.Object3D;
  parentQuat?: THREE.Quaternion;
  originWorld?: THREE.Vector3;
}

interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  persp: THREE.PerspectiveCamera;
  ortho: THREE.OrthographicCamera;
  rig: Rig;
  ambient: THREE.AmbientLight;
  grid: THREE.GridHelper;
  bounds: THREE.LineSegments;
  floor: THREE.Mesh;
  axes: THREE.AxesHelper;
  gizmo: THREE.Group;
  modelGroup: THREE.Group | null;
  partNodes: Map<string, THREE.Object3D>;
  helpers: THREE.BoxHelper[];
  wireMat: THREE.MeshBasicMaterial;
  normalMat: THREE.MeshNormalMaterial;
  width: number;
  height: number;
  drag: DragState | null;
  marquee: { x0: number; y0: number; x1: number; y1: number } | null;
  rebuild: () => void;
  syncHelpers: () => void;
  project: (world: { x: number; y: number; z: number }) => { x: number; y: number };
  camera: () => THREE.Camera;
}

const hexOf = (css: string | undefined, fallback: number): number => {
  try {
    return css ? new THREE.Color(css).getHex() : fallback;
  } catch {
    return fallback;
  }
};

/** 把圓柱／立方體手柄轉到指定軸向（幾何預設沿 +Y） */
const orientToAxis = (object: THREE.Object3D, axis: GizmoAxis): void => {
  object.rotation.set(0, 0, 0);
  if (axis === 'x') object.rotation.z = -Math.PI / 2;
  else if (axis === 'z') object.rotation.x = Math.PI / 2;
};

const buildGizmo = (): THREE.Group => {
  const root = new THREE.Group();
  root.name = 'gizmo';

  for (const axis of AXES) {
    const color = AXIS_COLOR[axis];

    const moveMat = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.95 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8), moveMat);
    shaft.position.y = 0.15;
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 12), moveMat);
    head.position.y = 0.345;
    const moveGroup = new THREE.Group();
    moveGroup.add(shaft, head);
    orientToAxis(moveGroup, axis);
    moveGroup.traverse((child) => {
      child.userData.gizmoTool = 'translate';
      child.userData.gizmoAxis = axis;
    });
    root.add(moveGroup);

    const rotMat = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.9 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.007, 8, 64), rotMat);
    if (axis === 'x') ring.rotation.y = Math.PI / 2;
    else if (axis === 'y') ring.rotation.x = Math.PI / 2;
    ring.userData.gizmoTool = 'rotate';
    ring.userData.gizmoAxis = axis;
    root.add(ring);

    const scaleMat = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.95 });
    const sShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8), scaleMat);
    sShaft.position.y = 0.15;
    const sBox = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), scaleMat);
    sBox.position.y = 0.33;
    const scaleGroup = new THREE.Group();
    scaleGroup.add(sShaft, sBox);
    orientToAxis(scaleGroup, axis);
    scaleGroup.traverse((child) => {
      child.userData.gizmoTool = 'scale';
      child.userData.gizmoAxis = axis;
    });
    root.add(scaleGroup);
  }

  return root;
};

export function ModelViewport(props: ModelViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  // ===== 建立場景（只做一次）=====
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'default';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(hexOf(propsRef.current.background, 0x10141c));

    const persp = new THREE.PerspectiveCamera(40, width / height, 0.02, 60);
    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 60);
    const rig: Rig = {
      theta: VIEW_ANGLES.iso.theta,
      phi: VIEW_ANGLES.iso.phi,
      dist: 2.1,
      target: new THREE.Vector3(0, 0.6, 0),
    };

    const ambient = new THREE.AmbientLight(0x8899bb, 1);
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.8);
    sun.position.set(2.4, 4.2, 2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -2;
    sun.shadow.camera.right = 2;
    sun.shadow.camera.top = 2;
    sun.shadow.camera.bottom = -2;
    const rim = new THREE.DirectionalLight(0x6688ff, 0.7);
    rim.position.set(-3, 2.4, -2.6);
    scene.add(ambient, sun, rim);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(TILE_HALF * 2, TILE_HALF * 2),
      new THREE.MeshStandardMaterial({ color: 0x1b2130, roughness: 0.95, metalness: 0.05 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(2.4, 24, 0x3a4356, 0x252b38);
    grid.position.y = 0.002;
    scene.add(grid);

    const bounds = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(TILE_HALF * 2, 1.5, TILE_HALF * 2)),
      new THREE.LineBasicMaterial({ color: 0x6b7a99, transparent: true, opacity: 0.45 }),
    );
    bounds.position.y = 0.75;
    scene.add(bounds);

    const axes = new THREE.AxesHelper(0.42);
    axes.position.set(-TILE_HALF - 0.12, 0, -TILE_HALF - 0.12);
    scene.add(axes);

    const gizmo = buildGizmo();
    scene.add(gizmo);

    const wireMat = new THREE.MeshBasicMaterial({ color: 0x9fb3d1, wireframe: true });
    const normalMat = new THREE.MeshNormalMaterial();

    const camera = (): THREE.Camera => (propsRef.current.ortho ? ortho : persp);

    const project = (world: { x: number; y: number; z: number }): { x: number; y: number } => {
      const v = new THREE.Vector3(world.x, world.y, world.z).project(camera());
      return { x: (v.x * 0.5 + 0.5) * stage.width, y: (-v.y * 0.5 + 0.5) * stage.height };
    };

    const stage: Stage = {
      renderer, scene, persp, ortho, rig, ambient, grid, bounds, floor, axes, gizmo,
      modelGroup: null,
      partNodes: new Map(),
      helpers: [],
      wireMat,
      normalMat,
      width,
      height,
      drag: null,
      marquee: null,
      rebuild: () => {},
      syncHelpers: () => {},
      project,
      camera,
    };
    stageRef.current = stage;

    const syncCamera = (): void => {
      const offset = sphericalOffset(rig.theta, rig.phi, rig.dist);
      const position = new THREE.Vector3(
        rig.target.x + offset.x,
        rig.target.y + offset.y,
        rig.target.z + offset.z,
      );
      persp.position.copy(position);
      persp.lookAt(rig.target);
      ortho.position.copy(position);
      ortho.lookAt(rig.target);
      const halfH = rig.dist * 0.42;
      const halfW = halfH * (stage.width / Math.max(1, stage.height));
      ortho.left = -halfW;
      ortho.right = halfW;
      ortho.top = halfH;
      ortho.bottom = -halfH;
      ortho.updateProjectionMatrix();
      gizmo.scale.setScalar(rig.dist * 0.42);
    };

    const clearHelpers = (): void => {
      for (const helper of stage.helpers) {
        scene.remove(helper);
        helper.geometry.dispose();
      }
      stage.helpers = [];
    };

    const clearModel = (): void => {
      clearHelpers();
      if (stage.modelGroup) {
        stage.modelGroup.traverse((object) => {
          const original = object.userData.originalMaterial as THREE.Material | THREE.Material[] | undefined;
          if (original && object instanceof THREE.Mesh) {
            object.material = original;
            object.userData.originalMaterial = undefined;
          }
        });
        scene.remove(stage.modelGroup);
        disposeTowerModel(stage.modelGroup);
        stage.modelGroup = null;
      }
      stage.partNodes = new Map();
    };

    const syncHelpers = (): void => {
      clearHelpers();
      for (const id of propsRef.current.selectedIds) {
        const node = stage.partNodes.get(id);
        if (!node) continue;
        const helper = new THREE.BoxHelper(node, 0xffd166);
        scene.add(helper);
        stage.helpers.push(helper);
      }
    };

    const syncGizmo = (): void => {
      const ids = propsRef.current.selectedIds;
      const first = ids.length > 0 ? stage.partNodes.get(ids[0]) : undefined;
      if (!first) {
        gizmo.visible = false;
        return;
      }
      const world = new THREE.Vector3();
      first.getWorldPosition(world);
      gizmo.position.copy(world);
      gizmo.visible = true;
      const lock = propsRef.current.axisLock ?? null;
      for (const child of gizmo.children) {
        const tool = child.userData.gizmoTool as GizmoTool | undefined;
        const axis = child.userData.gizmoAxis as GizmoAxis | undefined;
        child.visible = tool === propsRef.current.tool && (lock === null || axis === lock);
      }
    };

    const rebuild = (): void => {
      clearModel();
      const { model, towerColor, shading } = propsRef.current;
      if (model.parts.length === 0) return;
      const group = buildCustomTowerModel(model, hexOf(towerColor, 0x6496ff));
      stage.modelGroup = group;
      scene.add(group);

      const nodes = group.userData.partNodes as Record<string, THREE.Object3D> | undefined;
      if (nodes) {
        for (const [id, node] of Object.entries(nodes)) stage.partNodes.set(id, node);
      } else {
        group.traverse((object) => {
          const id = object.userData.partId as string | undefined;
          if (id && !stage.partNodes.has(id)) stage.partNodes.set(id, object);
        });
      }

      if (shading !== 'solid') {
        const override = shading === 'wireframe' ? wireMat : normalMat;
        group.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.userData.originalMaterial = object.material;
            object.material = override;
          }
        });
      }

      syncHelpers();
    };

    stage.rebuild = rebuild;
    stage.syncHelpers = syncHelpers;

    // ===== 事件 =====
    const canvas = renderer.domElement;

    const pointerToScreen = (event: PointerEvent): { x: number; y: number } => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const raycast = (event: PointerEvent): THREE.Intersection[] => {
      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(ndc, camera());
      const targets: THREE.Object3D[] = [gizmo];
      if (stage.modelGroup) targets.push(stage.modelGroup);
      return raycaster.intersectObjects(targets, true);
    };

    const pickPartId = (hit: THREE.Intersection): string | null => {
      let object: THREE.Object3D | null = hit.object;
      while (object) {
        const id = object.userData.partId as string | undefined;
        if (id) return id;
        object = object.parent;
      }
      return null;
    };

    const onPointerDown = (event: PointerEvent): void => {
      const point = pointerToScreen(event);
      canvas.setPointerCapture(event.pointerId);

      if (event.button === 2) {
        stage.drag = { mode: 'orbit', startX: point.x, startY: point.y, lastX: point.x, lastY: point.y };
        canvas.style.cursor = 'grabbing';
        return;
      }
      if (event.button === 1) {
        stage.drag = { mode: 'pan', startX: point.x, startY: point.y, lastX: point.x, lastY: point.y };
        canvas.style.cursor = 'move';
        return;
      }
      if (event.button !== 0) return;

      const hits = raycast(event);
      const gizmoHit = hits.find((hit) => {
        let object: THREE.Object3D | null = hit.object;
        while (object) {
          if (object.userData.gizmoAxis) return true;
          object = object.parent;
        }
        return false;
      });
      if (gizmoHit) {
        let object: THREE.Object3D | null = gizmoHit.object;
        let axis: GizmoAxis | undefined;
        while (object && !axis) {
          axis = object.userData.gizmoAxis as GizmoAxis | undefined;
          object = object.parent;
        }
        const selectedId = propsRef.current.selectedIds[0];
        const node = selectedId ? stage.partNodes.get(selectedId) : undefined;
        const part = selectedId
          ? propsRef.current.model.parts.find((item) => item.id === selectedId)
          : undefined;
        if (axis && node && part && selectedId) {
          const origin = new THREE.Vector3();
          node.getWorldPosition(origin);
          const parentQuat = new THREE.Quaternion();
          if (node.parent) node.parent.getWorldQuaternion(parentQuat);
          stage.drag = {
            mode: 'gizmo',
            startX: point.x,
            startY: point.y,
            lastX: point.x,
            lastY: point.y,
            axis,
            partId: selectedId,
            startPart: { ...part },
            node,
            parentQuat,
            originWorld: origin,
          };
          canvas.style.cursor = 'crosshair';
          return;
        }
      }

      const partHit = hits
        .map((hit) => ({ hit, id: pickPartId(hit) }))
        .find((entry) => entry.id !== null);
      if (partHit && partHit.id) {
        propsRef.current.onSelect([partHit.id], event.shiftKey);
        stage.drag = { mode: 'marquee', startX: point.x, startY: point.y, lastX: point.x, lastY: point.y };
        stage.marquee = null;
        return;
      }

      propsRef.current.onSelect([], false);
      stage.drag = { mode: 'marquee', startX: point.x, startY: point.y, lastX: point.x, lastY: point.y };
      stage.marquee = { x0: point.x, y0: point.y, x1: point.x, y1: point.y };
    };

    const onPointerMove = (event: PointerEvent): void => {
      const drag = stage.drag;
      if (!drag) {
        const overPart = raycast(event).some((hit) => pickPartId(hit) !== null);
        canvas.style.cursor = overPart ? 'pointer' : 'default';
        return;
      }
      const point = pointerToScreen(event);
      const dx = point.x - drag.lastX;
      const dy = point.y - drag.lastY;
      drag.lastX = point.x;
      drag.lastY = point.y;

      if (drag.mode === 'orbit') {
        rig.theta -= dx * 0.006;
        rig.phi = THREE.MathUtils.clamp(rig.phi - dy * 0.005, 0.04, Math.PI * 0.49);
        return;
      }
      if (drag.mode === 'pan') {
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        camera().matrixWorld.extractBasis(right, up, new THREE.Vector3());
        const scale = rig.dist * 0.0016;
        rig.target.addScaledVector(right, -dx * scale);
        rig.target.addScaledVector(up, dy * scale);
        return;
      }
      if (drag.mode === 'marquee') {
        if (stage.marquee) {
          stage.marquee = { ...stage.marquee, x1: point.x, y1: point.y };
          const overlay = marqueeRef.current;
          if (overlay) {
            overlay.style.display = 'block';
            overlay.style.left = Math.min(stage.marquee.x0, point.x) + 'px';
            overlay.style.top = Math.min(stage.marquee.y0, point.y) + 'px';
            overlay.style.width = Math.abs(point.x - stage.marquee.x0) + 'px';
            overlay.style.height = Math.abs(point.y - stage.marquee.y0) + 'px';
          }
        }
        return;
      }

      const { axis, startPart, node, partId } = drag;
      if (!axis || !startPart || !node || !partId) return;
      const current = propsRef.current;
      const parentQuat = drag.parentQuat ?? new THREE.Quaternion();
      const origin = drag.originWorld ?? new THREE.Vector3();
      const from = { x: drag.startX, y: drag.startY };
      const axisLenWorld = rig.dist * 0.42;

      if (current.tool === 'translate') {
        const delta = dragTranslate({
          origin,
          axis,
          from,
          to: point,
          project,
          axisLenWorld,
          snap: current.snap ? SNAP_STEP : 0,
        });
        const worldDelta = new THREE.Vector3();
        if (axis === 'x') worldDelta.x = delta;
        else if (axis === 'y') worldDelta.y = delta;
        else worldDelta.z = delta;
        worldDelta.applyQuaternion(parentQuat.clone().invert());
        node.position.set(
          startPart.x + worldDelta.x,
          startPart.y + worldDelta.y,
          startPart.z + worldDelta.z,
        );
      } else if (current.tool === 'rotate') {
        const axisWorld = new THREE.Vector3();
        if (axis === 'x') axisWorld.x = 1;
        else if (axis === 'y') axisWorld.y = 1;
        else axisWorld.z = 1;
        const cameraDir = new THREE.Vector3();
        camera().getWorldDirection(cameraDir);
        const delta = dragRotate({
          center: origin,
          axis,
          from,
          to: point,
          project,
          invert: axisWorld.dot(cameraDir) > 0,
          snap: current.snap ? ROTATE_SNAP : 0,
        });
        const base = axis === 'x' ? startPart.rx : axis === 'y' ? startPart.ry : startPart.rz;
        node.rotation.set(
          axis === 'x' ? base + delta : startPart.rx,
          axis === 'y' ? base + delta : startPart.ry,
          axis === 'z' ? base + delta : startPart.rz,
        );
      } else {
        const base =
          axis === 'x'
            ? startPart.sx ?? startPart.scale
            : axis === 'y'
              ? startPart.sy ?? startPart.scale
              : startPart.sz ?? startPart.scale;
        const next = dragScale({ origin, axis, from, to: point, project, axisLenWorld, base });
        node.scale.set(
          axis === 'x' ? next : startPart.sx ?? startPart.scale,
          axis === 'y' ? next : startPart.sy ?? startPart.scale,
          axis === 'z' ? next : startPart.sz ?? startPart.scale,
        );
      }
    };

    const onPointerUp = (event: PointerEvent): void => {
      const drag = stage.drag;
      stage.drag = null;
      canvas.style.cursor = 'default';
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      const overlay = marqueeRef.current;
      if (overlay) overlay.style.display = 'none';
      if (!drag) return;

      if (drag.mode === 'marquee' && stage.marquee) {
        const marquee = stage.marquee;
        stage.marquee = null;
        const x0 = Math.min(marquee.x0, marquee.x1);
        const x1 = Math.max(marquee.x0, marquee.x1);
        const y0 = Math.min(marquee.y0, marquee.y1);
        const y1 = Math.max(marquee.y0, marquee.y1);
        if (x1 - x0 < 4 && y1 - y0 < 4) return;
        const inside: string[] = [];
        const world = new THREE.Vector3();
        for (const [id, node] of stage.partNodes) {
          node.getWorldPosition(world);
          const screen = project({ x: world.x, y: world.y, z: world.z });
          if (screen.x >= x0 && screen.x <= x1 && screen.y >= y0 && screen.y <= y1) inside.push(id);
        }
        if (inside.length > 0) propsRef.current.onSelect(inside, event.shiftKey);
        return;
      }

      if (drag.mode === 'gizmo' && drag.partId && drag.startPart && drag.node) {
        const node = drag.node;
        const patch: Partial<Custom3DPart> =
          propsRef.current.tool === 'translate'
            ? { x: node.position.x, y: node.position.y, z: node.position.z }
            : propsRef.current.tool === 'rotate'
              ? { rx: node.rotation.x, ry: node.rotation.y, rz: node.rotation.z }
              : { sx: node.scale.x, sy: node.scale.y, sz: node.scale.z };
        propsRef.current.onTransform(drag.partId, patch, 'commit');
      }
    };

    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      rig.dist = THREE.MathUtils.clamp(rig.dist * (1 + event.deltaY * 0.0012), 0.6, 8);
    };

    const onContextMenu = (event: MouseEvent): void => {
      event.preventDefault();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);

    const guard = createFrameLoopGuard({ label: 'model-viewport' });
    let raf = 0;
    const draw = (): void => {
      syncCamera();
      syncGizmo();
      for (const helper of stage.helpers) helper.update();
      renderer.render(scene, camera());
    };
    const tick = (): void => {
      guard.run(draw);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const observer = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      stage.width = w;
      stage.height = h;
      renderer.setSize(w, h);
      persp.aspect = w / h;
      persp.updateProjectionMatrix();
    });
    observer.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      clearModel();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      bounds.geometry.dispose();
      (bounds.material as THREE.Material).dispose();
      gizmo.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      wireMat.dispose();
      normalMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentElement === container) container.removeChild(canvas);
      stageRef.current = null;
    };
  }, []);

  // 模型／顏色／著色模式變動 → 重建
  useEffect(() => {
    stageRef.current?.rebuild();
  }, [props.model, props.towerColor, props.shading]);

  // 選取變動 → 更新選取框
  useEffect(() => {
    stageRef.current?.syncHelpers();
  }, [props.selectedIds]);

  // 視角預設
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const angles = VIEW_ANGLES[props.viewPreset.id];
    stage.rig.theta = angles.theta;
    stage.rig.phi = angles.phi;
  }, [props.viewPreset.id, props.viewPreset.nonce]);

  // 聚焦
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const id = props.selectedIds[0];
    const node = id ? stage.partNodes.get(id) : undefined;
    if (node) {
      const world = new THREE.Vector3();
      node.getWorldPosition(world);
      stage.rig.target.copy(world);
    } else {
      stage.rig.target.set(0, 0.6, 0);
      stage.rig.dist = 2.1;
    }
  }, [props.focusNonce]);

  // 場景顯示與燈光
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.grid.visible = props.showGrid;
    stage.bounds.visible = props.showBounds;
    stage.axes.visible = props.showBounds;
    stage.ambient.intensity = props.ambient;
    stage.scene.background = new THREE.Color(hexOf(props.background, 0x10141c));
  }, [props.showGrid, props.showBounds, props.ambient, props.background]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />
      <div
        ref={marqueeRef}
        className="pointer-events-none absolute border border-[var(--cn-signal)] bg-[var(--cn-signal)]/10"
        style={{ display: 'none' }}
      />
    </div>
  );
}
