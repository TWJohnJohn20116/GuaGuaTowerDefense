/**
 * 3D 模型編輯器（模組塔自訂外形）
 *
 * 真正的部件級編輯：
 *  - 左側部件庫：分類陳列幾何件，點擊加入場景
 *  - 中央 3D 視口：左鍵點選部件 / 拖曳沿 XZ 移動（Shift+拖 = 上下移 Y）、
 *    拖空白處旋轉視角、滾輪縮放；地塊邊界（0.94）與半徑圈即時參考
 *  - 右側面板：部件列表 + 選中件屬性（材質 / 位置 / 旋轉 / 縮放 / 自轉）
 *  - 頂部：起手模板、撤銷（Ctrl+Z）、清空、取消、保存；Delete 刪除選中件
 *
 * 產出 Custom3DModel 存入 CustomTowerData.custom3d，
 * 遊戲 3D 視圖與所有 3D 預覽走 buildCustomTowerModel 同款管線。
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import type { Custom3DPart, Custom3DModel, CustomTowerData } from '@/types/game';
import { TOWER_PART_SHAPES } from '@/components/scenes/game-scene/three/towerModels3d';
import { createPart } from './shapeLibrary';
import { CustomNumberInput } from '@/components/ui/CustomNumberInput';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { getMaterialRoles, getShapeCategories, getModelTemplates, resolveShapeName } from './modEditorM3dI18n';
import {
  CrossIcon, TrashIcon, CopyIcon, CheckIcon, BoxIcon, SparklesIcon, RefreshIcon,
} from '@/components/ui/Icons';
import { Btn, IconBtn } from '@/components/hl';

const TILE_HALF = 0.47;

interface Model3DEditorProps {
  tower: CustomTowerData;
  onSave: (model: Custom3DModel) => void;
  onClose: () => void;
}

export function Model3DEditor({ tower, onSave, onClose }: Model3DEditorProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const materialRoles = getMaterialRoles(m);
  const shapeCategories = getShapeCategories(m);
  const modelTemplates = getModelTemplates(m);
  const [parts, setParts] = useState<Custom3DPart[]>(
    () => tower.custom3d?.parts?.map((pt) => ({ ...pt })) ?? modelTemplates[0].build().parts,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  // three 場景物件（單次建立，跨 render 持久）
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    modelGroup: THREE.Group;
    selectionBox: THREE.BoxHelper;
    materials: Record<string, THREE.Material>;
    raycaster: THREE.Raycaster;
  } | null>(null);
  // 相機軌道參數
  const orbitRef = useRef({ yaw: -Math.PI / 4, pitch: 0.42, dist: 3.2 });
  // 拖曳狀態（拖動部件期間直接改 mesh，pointerup 時提交 setState）
  const dragRef = useRef<{
    mode: 'orbit' | 'part' | null;
    partId: string | null;
    shift: boolean;
    lastX: number;
    lastY: number;
    moved: boolean;
  }>({ mode: null, partId: null, shift: false, lastX: 0, lastY: 0, moved: false });
  const partsRef = useRef(parts);
  partsRef.current = parts;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  // 撤銷歷史（快照棧，上限 60）
  const historyRef = useRef<Custom3DPart[][]>([]);

  const selected = parts.find((pt) => pt.id === selectedId) || null;

  const pushHistory = useCallback(() => {
    historyRef.current.push(partsRef.current.map((pt) => ({ ...pt })));
    if (historyRef.current.length > 60) historyRef.current.shift();
  }, []);

  const undo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (prev) {
      setParts(prev);
      setSelectedId((cur) => (prev.some((pt) => pt.id === cur) ? cur : null));
    }
  }, []);

  const updatePart = useCallback((id: string, patch: Partial<Custom3DPart>) => {
    pushHistory();
    setParts((prev) => prev.map((pt) => (pt.id === id ? { ...pt, ...patch } : pt)));
  }, [pushHistory]);

  const addPart = useCallback((shape: string) => {
    pushHistory();
    const pt = createPart(shape);
    setParts((prev) => [...prev, pt]);
    setSelectedId(pt.id);
  }, [pushHistory]);

  const removePart = useCallback((id: string) => {
    pushHistory();
    setParts((prev) => prev.filter((pt) => pt.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, [pushHistory]);

  const duplicatePart = useCallback((id: string) => {
    pushHistory();
    setParts((prev) => {
      const src = prev.find((pt) => pt.id === id);
      if (!src) return prev;
      const copy = { ...src, id: createPart(src.shape).id, x: src.x + 0.08, z: src.z + 0.08 };
      setSelectedId(copy.id);
      return [...prev, copy];
    });
  }, [pushHistory]);

  // 鍵盤快捷鍵：Ctrl+Z 撤銷 / Delete 刪除選中 / Esc 取消選中
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRef.current) {
        e.preventDefault();
        removePart(selectedRef.current);
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, removePart]);

  // ===== 場景初始化（一次） =====
  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 60);

    scene.add(new THREE.AmbientLight(0x8899bb, 0.9));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.5);
    sun.position.set(3, 6, 2.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x6688ff, 0.55);
    rim.position.set(-4, 3, -3);
    scene.add(rim);

    // 地面 + 地塊邊界參考
    const groundGeo = new THREE.CircleGeometry(2.4, 48);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x141821, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(2.4, 12, 0x2a3142, 0x1d2330);
    grid.position.y = 0.001;
    scene.add(grid);

    // 0.94 地塊框 + 0.47 半徑圈
    const tileEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.94, 0.001, 0.94)),
      new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.7 }),
    );
    tileEdges.position.y = 0.004;
    scene.add(tileEdges);
    const radiusRing = new THREE.Mesh(
      new THREE.TorusGeometry(TILE_HALF, 0.005, 6, 64),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 }),
    );
    radiusRing.rotation.x = Math.PI / 2;
    radiusRing.position.y = 0.006;
    scene.add(radiusRing);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const selectionBox = new THREE.BoxHelper(new THREE.Object3D(), 0xfde047);
    selectionBox.visible = false;
    scene.add(selectionBox);

    // 編輯器材質（持久共用；主題色取塔色）
    const accent = new THREE.Color(tower.color || '#4f8fe8').getHex();
    const glowHex = tower.glowColor ? new THREE.Color(tower.glowColor).getHex() : accent;
    const materials: Record<string, THREE.Material> = {
      metal: new THREE.MeshStandardMaterial({ color: 0x232936, roughness: 0.55, metalness: 0.5 }),
      trim: new THREE.MeshStandardMaterial({ color: 0x141821, roughness: 0.35, metalness: 0.8 }),
      accent: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.38, metalness: 0.35, emissive: accent, emissiveIntensity: 0.3 }),
      glow: new THREE.MeshStandardMaterial({ color: glowHex, roughness: 0.25, metalness: 0.1, emissive: glowHex, emissiveIntensity: 1.0 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.6, emissive: 0xf59e0b, emissiveIntensity: 0.3 }),
    };

    sceneRef.current = { renderer, scene, camera, modelGroup, selectionBox, materials, raycaster: new THREE.Raycaster() };

    let raf = 0;
    const loop = () => {
      const { yaw, pitch, dist } = orbitRef.current;
      const cy = 0.55;
      camera.position.set(
        Math.cos(pitch) * Math.cos(yaw) * dist,
        Math.sin(pitch) * dist + cy,
        Math.cos(pitch) * Math.sin(yaw) * dist,
      );
      camera.lookAt(0, cy, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      Object.values(materials).forEach((mm) => mm.dispose());
      groundGeo.dispose();
      groundMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
    // 空 deps 是正確的：這裡是命令式資源建立（renderer／scene／ResizeObserver），重跑等於
    // 重建整個場景；effect 內只碰 container ref 與模組常數，不讀 props／state（TD-17：非債）
  }, []);

  const syncSelectionBox = useCallback(() => {
    const sc = sceneRef.current;
    if (!sc) return;
    const mesh = sc.modelGroup.children.find((c) => c.userData.partId === selectedRef.current);
    if (mesh) {
      sc.selectionBox.setFromObject(mesh);
      sc.selectionBox.visible = true;
    } else {
      sc.selectionBox.visible = false;
    }
  }, []);

  // ===== parts → 場景同步（重建模型組） =====
  useEffect(() => {
    const sc = sceneRef.current;
    if (!sc) return;
    sc.modelGroup.clear();
    for (const pt of parts) {
      const geo = TOWER_PART_SHAPES[pt.shape];
      if (!geo) continue;
      const mesh = new THREE.Mesh(geo, sc.materials[pt.material] ?? sc.materials.accent);
      mesh.position.set(pt.x, pt.y, pt.z);
      mesh.rotation.set(pt.rx, pt.ry, pt.rz);
      mesh.scale.setScalar(pt.scale);
      mesh.castShadow = true;
      mesh.userData.partId = pt.id;
      sc.modelGroup.add(mesh);
    }
    syncSelectionBox();
  }, [parts, syncSelectionBox]);

  useEffect(() => {
    syncSelectionBox();
  }, [selectedId, syncSelectionBox]);

  // ===== 視口互動 =====
  const pickPart = (e: React.PointerEvent): string | null => {
    const sc = sceneRef.current;
    const container = viewportRef.current;
    if (!sc || !container) return null;
    const rect = container.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    sc.raycaster.setFromCamera(ndc, sc.camera);
    const hit = sc.raycaster.intersectObjects(sc.modelGroup.children, false)[0];
    return hit ? (hit.object.userData.partId as string) : null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const hitId = pickPart(e);
    dragRef.current = {
      mode: hitId ? 'part' : 'orbit',
      partId: hitId,
      shift: e.shiftKey,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
    };
    if (hitId) setSelectedId(hitId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const sc = sceneRef.current;
    if (!d.mode || !sc) return;
    const dx = e.clientX - d.lastX;
    const dy = e.clientY - d.lastY;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 0) d.moved = true;

    if (d.mode === 'orbit') {
      orbitRef.current.yaw += dx * 0.011;
      orbitRef.current.pitch = THREE.MathUtils.clamp(orbitRef.current.pitch + dy * 0.007, 0.05, 1.35);
      return;
    }
    // 拖動部件：直接改 mesh（流暢），pointerup 提交 state
    const mesh = sc.modelGroup.children.find((c) => c.userData.partId === d.partId) as THREE.Mesh | undefined;
    if (!mesh) return;
    if (d.shift || e.shiftKey) {
      mesh.position.y = THREE.MathUtils.clamp(mesh.position.y - dy * 0.005, 0, 2.4);
    } else {
      // 沿視角的水平面移動：螢幕右 = cross(視線, up)，螢幕下 = 朝相機方向
      const { yaw } = orbitRef.current;
      const right = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
      const toward = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
      mesh.position.addScaledVector(right, dx * 0.004);
      mesh.position.addScaledVector(toward, dy * 0.004);
      mesh.position.x = THREE.MathUtils.clamp(mesh.position.x, -0.6, 0.6);
      mesh.position.z = THREE.MathUtils.clamp(mesh.position.z, -0.6, 0.6);
    }
    sc.selectionBox.setFromObject(mesh);
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    const sc = sceneRef.current;
    if (d.mode === 'part' && d.partId && d.moved && sc) {
      const mesh = sc.modelGroup.children.find((c) => c.userData.partId === d.partId);
      if (mesh) {
        updatePart(d.partId, {
          x: Number(mesh.position.x.toFixed(3)),
          y: Number(mesh.position.y.toFixed(3)),
          z: Number(mesh.position.z.toFixed(3)),
        });
      }
    }
    dragRef.current = { mode: null, partId: null, shift: false, lastX: 0, lastY: 0, moved: false };
  };

  const onWheel = (e: React.WheelEvent) => {
    orbitRef.current.dist = THREE.MathUtils.clamp(orbitRef.current.dist + e.deltaY * 0.0025, 1.4, 6.5);
  };

  // ===== 越界提示 =====
  const maxRadius = parts.reduce((mx, pt) => {
    const r = Math.max(Math.abs(pt.x), Math.abs(pt.z)) + 0.25 * pt.scale;
    return Math.max(mx, r);
  }, 0);

  const deg = (radVal: number) => Math.round((radVal * 180) / Math.PI);
  const rad = (degVal: number) => (degVal * Math.PI) / 180;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100001] bg-[var(--cn-paper)]/97 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ===== 頂部工具列 ===== */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--cn-line-soft)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[rgba(111,140,255,0.12)] border border-[rgba(111,140,255,0.38)] flex items-center justify-center">
            <BoxIcon className="w-4 h-4 text-[var(--arc-reach)]" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest text-[var(--arc-ink)] uppercase">{m.m3dTitle}</h2>
            <p className="text-[9px] font-bold tracking-wider text-[var(--arc-ink-4)] uppercase">
              {fillTemplate(m.m3dSubtitle, { name: tower.name || m.m3dUnnamedTower, count: parts.length })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-44">
            <CustomSelect
              value=""
              placeholder={m.m3dTemplatePh}
              options={modelTemplates.map((tpl, i) => ({ value: String(i), label: tpl.name }))}
              onChange={(v) => {
                const tpl = modelTemplates[Number(v)];
                if (tpl) {
                  pushHistory();
                  setParts(tpl.build().parts);
                  setSelectedId(null);
                }
              }}
              size="sm"
            />
          </div>
          <Btn
            variant="line"
            size="sm"
            onClick={undo}
            title={m.m3dUndoTitle}
            className="gap-1.5 text-[10px] font-black tracking-widest uppercase"
          >
            <RefreshIcon className="w-3 h-3 -scale-x-100" /> {m.m3dUndo}
          </Btn>
          <Btn
            variant="danger"
            size="sm"
            onClick={() => { pushHistory(); setParts([]); setSelectedId(null); }}
            className="gap-1.5 text-[10px] font-black tracking-widest uppercase"
          >
            <TrashIcon className="w-3 h-3" /> {m.m3dClear}
          </Btn>
          <Btn
            variant="line"
            size="sm"
            onClick={onClose}
            className="gap-1.5 text-[10px] font-black tracking-widest uppercase"
          >
            <CrossIcon className="w-3 h-3" /> {m.m3dCancel}
          </Btn>
          <Btn
            variant="signal"
            size="sm"
            onClick={() => onSave({ parts })}
            disabled={parts.length === 0}
            className="gap-1.5 bg-[rgba(53,224,138,0.12)] text-[var(--arc-vital)] text-[10px] font-black tracking-widest uppercase"
          >
            <CheckIcon className="w-3 h-3" /> {m.m3dSave}
          </Btn>
        </div>
      </div>

      {/* ===== 主體三欄 ===== */}
      <div className="flex-1 flex min-h-0">
        {/* 左：部件庫 */}
        <div className="w-52 border-r border-[var(--cn-line-soft)] flex flex-col flex-shrink-0">
          <div className="flex flex-wrap gap-1 p-3 border-b border-[var(--cn-line-soft)]">
            {shapeCategories.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setActiveCat(i)}
                className={`px-2.5 py-1.5  text-[9px] font-black tracking-widest uppercase transition-all ${
                  activeCat === i ? 'bg-[rgba(111,140,255,0.12)] text-[var(--arc-reach)] border border-[rgba(111,140,255,0.38)]' : 'bg-[var(--arc-deck-2)] text-[var(--arc-ink-4)] border-[3px] border-[var(--cn-line-soft)] hover:text-[var(--arc-ink-2)]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
            {shapeCategories[activeCat].shapes.map((s) => (
              <button
                key={s.id}
                onClick={() => addPart(s.id)}
                className="px-2 py-2.5 bg-[var(--arc-deck-2)] border-[3px] border-[var(--cn-line-soft)] hover:bg-[rgba(111,140,255,0.12)] hover:border-[rgba(111,140,255,0.38)] text-[var(--arc-ink-3)] hover:text-[var(--arc-reach)] text-[10px] font-bold tracking-wider transition-all"
              >
                {s.name}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-[var(--cn-line-soft)] text-[8px] leading-relaxed font-bold tracking-wider text-[var(--arc-ink)]/25 uppercase">
            {m.m3dAddHint}
          </div>
        </div>

        {/* 中：3D 視口 */}
        <div className="flex-1 relative min-w-0">
          <div
            ref={viewportRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
          />
          {/* 操作提示 */}
          <div className="absolute left-4 bottom-4 flex flex-col gap-1 pointer-events-none border-[3px] border-[var(--cn-line-soft)] bg-[rgba(6,7,10,0.72)] px-2.5 py-2">
            <span className="text-[9px] font-bold tracking-wider text-[var(--arc-ink-4)] uppercase">{m.m3dControls1}</span>
            <span className="text-[9px] font-bold tracking-wider text-[var(--arc-ink-4)] uppercase">{m.m3dControls2}</span>
          </div>
          {/* 邊界狀態 */}
          <div className={`absolute right-4 top-4 px-3 py-1.5  border text-[9px] font-black tracking-widest uppercase pointer-events-none ${
            maxRadius > TILE_HALF
              ? 'bg-[rgba(255,182,39,0.12)] border-[rgba(255,182,39,0.38)] text-[var(--arc-caution)]'
              : 'bg-[rgba(53,224,138,0.12)] border-[rgba(53,224,138,0.38)] text-[var(--arc-vital)]/80'
          }`}>
            {maxRadius > TILE_HALF ? m.m3dOutOfTile : m.m3dInTile}
          </div>
        </div>

        {/* 右：部件列表 + 屬性 */}
        <div className="w-72 border-l border-[var(--cn-line-soft)] flex flex-col flex-shrink-0">
          {/* 列表 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
            {parts.length === 0 && (
              <div className="py-10 text-center text-[10px] font-bold tracking-widest text-[var(--arc-ink)]/25 uppercase">
                {m.m3dEmptyParts}
              </div>
            )}
            {parts.map((pt) => (
              <button
                key={pt.id}
                onClick={() => setSelectedId(pt.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2  border text-left transition-all ${
                  selectedId === pt.id
                    ? 'bg-[rgba(255,182,39,0.12)] border-[rgba(255,182,39,0.38)]'
                    : 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)] hover:bg-[var(--arc-deck-3)]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 flex-shrink-0 border border-[var(--arc-line-strong)]"
                  style={{ backgroundColor: materialRoles.find((mr) => mr.id === pt.material)?.chip }}
                />
                <span className={`flex-1 text-[11px] font-bold tracking-wider truncate ${selectedId === pt.id ? 'text-[var(--arc-caution)]' : 'text-[var(--arc-ink-2)]'}`}>
                  {resolveShapeName(m, pt.shape)}
                </span>
                {pt.spin && <SparklesIcon className="w-3 h-3 text-[var(--arc-reach)]/70 flex-shrink-0" />}
              </button>
            ))}
          </div>

          {/* 選中屬性 */}
          {selected && (
            <div className="border-t border-[var(--cn-line-soft)] p-4 space-y-4 flex-shrink-0 max-h-[55%] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-[var(--arc-ink)] uppercase">{resolveShapeName(m, selected.shape)}</span>
                <div className="flex gap-1">
                  <IconBtn
                    label={m.m3dCopyPart}
                    onClick={() => duplicatePart(selected.id)}
                    className="p-2 bg-[var(--arc-deck-2)] text-[var(--arc-ink-3)] hover:text-[var(--arc-ink)] hover:bg-[var(--arc-deck-3)] transition-all"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                  </IconBtn>
                  <IconBtn
                    label={m.m3dDeletePart}
                    onClick={() => removePart(selected.id)}
                    className="p-2 bg-[var(--arc-deck-2)] text-[var(--arc-ink-3)] hover:text-[var(--arc-alert)] hover:bg-[rgba(255,61,113,0.12)] transition-all"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </IconBtn>
                </div>
              </div>

              {/* 材質 */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black tracking-widest text-[var(--arc-ink-4)] uppercase">{m.m3dMaterialLabel}</label>
                <div className="flex gap-1.5">
                  {materialRoles.map((mr) => (
                    <button
                      key={mr.id}
                      onClick={() => updatePart(selected.id, { material: mr.id })}
                      className={`flex-1 flex flex-col items-center gap-1 py-1.5  border transition-all ${
                        selected.material === mr.id ? 'border-[var(--arc-line-hot)] bg-[var(--arc-deck-3)]' : 'border-[var(--cn-line-soft)] bg-[var(--arc-deck-2)] hover:bg-[var(--arc-deck-3)]'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 border border-[var(--arc-line-strong)]" style={{ backgroundColor: mr.chip }} />
                      <span className={`text-[8px] font-bold tracking-wider ${selected.material === mr.id ? 'text-[var(--arc-ink)]' : 'text-[var(--arc-ink-4)]'}`}>{mr.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 位置 */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black tracking-widest text-[var(--arc-ink-4)] uppercase">{m.m3dPositionLabel}</label>
                <div className="grid grid-cols-3 gap-2">
                  <CustomNumberInput value={selected.x} onChange={(v) => updatePart(selected.id, { x: v })} step={0.02} min={-0.6} max={0.6} label="X" />
                  <CustomNumberInput value={selected.y} onChange={(v) => updatePart(selected.id, { y: v })} step={0.02} min={0} max={2.4} label="Y" />
                  <CustomNumberInput value={selected.z} onChange={(v) => updatePart(selected.id, { z: v })} step={0.02} min={-0.6} max={0.6} label="Z" />
                </div>
              </div>

              {/* 旋轉（度） */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black tracking-widest text-[var(--arc-ink-4)] uppercase">{m.m3dRotationLabel}</label>
                <div className="grid grid-cols-3 gap-2">
                  <CustomNumberInput value={deg(selected.rx)} onChange={(v) => updatePart(selected.id, { rx: rad(v) })} step={15} label="RX" />
                  <CustomNumberInput value={deg(selected.ry)} onChange={(v) => updatePart(selected.id, { ry: rad(v) })} step={15} label="RY" />
                  <CustomNumberInput value={deg(selected.rz)} onChange={(v) => updatePart(selected.id, { rz: rad(v) })} step={15} label="RZ" />
                </div>
              </div>

              {/* 縮放 */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black tracking-widest text-[var(--arc-ink-4)] uppercase flex justify-between">
                  <span>{m.m3dScaleLabel}</span>
                  <span className="text-[var(--arc-ink)] font-mono normal-case">{selected.scale.toFixed(2)}x</span>
                </label>
                <input
                  type="range" min="0.2" max="3" step="0.05"
                  value={selected.scale}
                  onChange={(e) => updatePart(selected.id, { scale: Number(e.target.value) })}
                  className="w-full h-1.5 accent-sky-400 bg-[rgba(6,7,10,0.72)] appearance-none"
                />
              </div>

              {/* 自轉 */}
              <CustomCheckbox
                checked={!!selected.spin}
                onChange={(checked) => updatePart(selected.id, { spin: checked })}
                icon={<SparklesIcon />}
                label={m.m3dAutoSpinLabel}
                description={m.m3dAutoSpinDesc}
                color="cyan-500"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

export default Model3DEditor;
