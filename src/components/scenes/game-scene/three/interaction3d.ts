/**
 * 遊戲 3D 視圖 · 交互管理器（階段 3）
 *
 *  - Raycaster 將滑鼠位置投影到地面 → 格座標
 *  - 懸停高亮：可放置（青）/ 不可放置（紅）/ 懸停已有塔（白）
 *  - 放塔預覽射程圈、選中塔的射程圈 + 金色選中環
 *  - 左鍵點擊（按下/放開距離 < 6px 視為點擊，與 OrbitControls 拖拽旋轉自然區分）：
 *      點塔 → 選塔；選了塔種點空格 → 放塔；其他 → 取消選擇
 *
 * 遊戲邏輯全部走 gameStore 既有 action（placeTower / selectTower），與 2D 行為一致。
 */

import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { useTalentStore } from '@/store/talentStore';
import { GAME_CONSTANTS } from '@/data/gameData';
import { getTowerData, getTowerStatBonusFor } from '@/store/gameStoreUtils';
import type { UpgradePath } from '@/types/game';
import { previewPlacementSynergies, toTowerRef } from '@/data/towerSynergyData';
import { resolveFusionCanvasClick } from '@/data/fusionCanvasClick';
import { resolveGridTowerClick, resolveMarqueeAsClick } from '@/data/gridTowerClick';
import { shouldShowTowerRangeRing } from '@/data/towerRangeVisibility';
import { useSettingsStore } from '@/store/settingsStore';

const COLS = GAME_CONSTANTS.GRID_COLS;
const ROWS = GAME_CONSTANTS.GRID_ROWS;

interface Interaction3D {
  /** 每幀更新（高亮 / 射程圈 / 選中環） */
  update: (now: number) => void;
  /** 互動開關（操控小人模式時停用，避免拖視角誤觸放塔/選塔） */
  setEnabled: (enabled: boolean) => void;
  dispose: () => void;
}

export function createInteraction3D(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  dom: HTMLElement,
  toWorld: (col: number, row: number) => [number, number],
  options?: {
    /** 敵人本體 InstancedMesh（懸停提示用） */
    enemyBody?: THREE.InstancedMesh;
    /** 懸停敵人變化回調（enemyIndex 為 enemies 陣列索引，null 表示離開） */
    onHoverEnemy?: (enemyIndex: number | null, clientX: number, clientY: number) => void;
    /** OrbitControls（Ctrl 框選期間暫停視角操作） */
    controls?: { enabled: boolean };
    /** 框選矩形變化回調（container 本地座標；null 表示框選結束） */
    onMarquee?: (rect: { x1: number; y1: number; x2: number; y2: number } | null) => void;
  },
): Interaction3D {
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  // 地面拾取平面（與路徑格頂面同高）
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.12);
  const hitPoint = new THREE.Vector3();

  /** 目前懸停格（無效時為 null） */
  let hoverCell: { col: number; row: number } | null = null;

  // ===== 懸停高亮塊 =====
  const hoverMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.35,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.5,
    depthWrite: false,
  });
  const hoverMesh = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.1, 0.96), hoverMat);
  hoverMesh.visible = false;
  scene.add(hoverMesh);

  // ===== 射程圈（懸停放塔預覽 / 選中塔共用兩個實例）=====
  const makeRangeRing = (color: number) => {
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    // 半徑 1 的環，之後用 scale 設定實際射程
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 56), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    scene.add(mesh);
    return mesh;
  };
  const hoverRangeRing = makeRangeRing(0x22d3ee);
  const selectedRangeRing = makeRangeRing(0xf59e0b);

  // 選中塔的金色脈動環（緊貼塔底）
  const selectedHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 0.62, 40),
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  selectedHalo.rotation.x = -Math.PI / 2;
  selectedHalo.visible = false;
  scene.add(selectedHalo);

  // ===== 滑鼠 → 格座標 =====
  const pickCell = (clientX: number, clientY: number): { col: number; row: number } | null => {
    const rect = dom.getBoundingClientRect();
    pointerNdc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointerNdc, camera);
    if (!raycaster.ray.intersectPlane(groundPlane, hitPoint)) return null;
    const col = Math.round(hitPoint.x + COLS / 2 - 0.5);
    const row = Math.round(hitPoint.z + ROWS / 2 - 0.5);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    return { col, row };
  };

  // ===== 事件 =====
  /** Ctrl 框選狀態（client 座標） */
  let marqueeStart: { x: number; y: number } | null = null;
  /** 互動開關（操控小人模式時停用，避免拖視角誤觸放塔/選塔） */
  let enabled = true;

  const toLocal = (clientX: number, clientY: number) => {
    const rect = dom.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!enabled) return;
    // 框選進行中：更新矩形，不做格子/敵人拾取
    if (marqueeStart) {
      const a = toLocal(marqueeStart.x, marqueeStart.y);
      const b = toLocal(e.clientX, e.clientY);
      options?.onMarquee?.({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      return;
    }

    hoverCell = pickCell(e.clientX, e.clientY);

    const store = useGameStore.getState();
    const current = store.hoveredTile;
    if (hoverCell) {
      if (current?.col !== hoverCell.col || current?.row !== hoverCell.row) {
        store.setHoveredTile(hoverCell);
      }
    } else if (current) {
      store.setHoveredTile(null);
    }

    // 敵人懸停拾取（InstancedMesh raycast，instanceId 即陣列索引）
    if (options?.enemyBody && options.onHoverEnemy) {
      const hits = raycaster.intersectObject(options.enemyBody, false);
      const idx = hits.length > 0 && hits[0].instanceId !== undefined ? hits[0].instanceId : null;
      options.onHoverEnemy(idx, e.clientX, e.clientY);
    }
  };

  let downPos: { x: number; y: number } | null = null;
  let rightDownPos: { x: number; y: number } | null = null;

  const onPointerDown = (e: PointerEvent) => {
    if (!enabled) return;
    if (e.button === 0) {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+左鍵 → 開始框選（暫停視角操作）
        marqueeStart = { x: e.clientX, y: e.clientY };
        if (options?.controls) options.controls.enabled = false;
      } else {
        downPos = { x: e.clientX, y: e.clientY };
      }
    } else if (e.button === 2) {
      rightDownPos = { x: e.clientX, y: e.clientY };
    }
  };

  // 把塔的世界座標投影到 container 本地像素座標
  const projectTower = (col: number, row: number): { x: number; y: number } => {
    const [wx, wz] = toWorld(col, row);
    const v = new THREE.Vector3(wx, 0.4, wz).project(camera);
    const rect = dom.getBoundingClientRect();
    return { x: ((v.x + 1) / 2) * rect.width, y: ((1 - v.y) / 2) * rect.height };
  };

  const handleLeftClick = (e: PointerEvent) => {
    const cell = pickCell(e.clientX, e.clientY);
    if (!cell) return;
    const store = useGameStore.getState();
    const tile = store.grid[cell.row]?.[cell.col];
    if (!tile) return;

    const fusionClick = resolveFusionCanvasClick({
      fusionMode: store.fusionMode,
      fusionSourceId: store.fusionSourceId,
      clickedTowerId: tile.towerId ?? null,
    });
    if (fusionClick.kind === 'fuse') {
      store.fuseTowers(fusionClick.sourceId, fusionClick.targetId);
      return;
    }
    if (fusionClick.kind === 'cancel') {
      store.cancelFusion();
      return;
    }
    if (store.fusionMode) return;

    const tileTower = tile.towerId
      ? store.towers.find((t) => t.id === tile.towerId) ?? null
      : null;
    const kind = resolveGridTowerClick({
      hasTower: Boolean(tileTower),
      modifierSelect: e.shiftKey || e.ctrlKey || e.metaKey,
      doubleClick: e.detail === 2,
      canPlace: Boolean(store.selectedTowerType && tile.type === 'empty'),
    });
    if (kind === 'toggle_multi' && tileTower) {
      store.toggleTowerInMultiSelect(tileTower.id);
    } else if (kind === 'select_type' && tileTower) {
      store.selectAllTowersOfType(tileTower.type);
    } else if (kind === 'select' && tileTower) {
      store.selectTower(tileTower);
    } else if (kind === 'place') {
      store.placeTower({ col: cell.col, row: cell.row });
    } else {
      store.selectTower(null);
      store.clearMultiSelect();
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!enabled) return;
    // --- Ctrl 框選結束：投影所有塔，矩形內者進多選 ---
    if (e.button === 0 && marqueeStart) {
      const a = toLocal(marqueeStart.x, marqueeStart.y);
      const b = toLocal(e.clientX, e.clientY);
      marqueeStart = null;
      if (options?.controls) options.controls.enabled = true;
      options?.onMarquee?.(null);

      const minX = Math.min(a.x, b.x);
      const maxX = Math.max(a.x, b.x);
      const minY = Math.min(a.y, b.y);
      const maxY = Math.max(a.y, b.y);
      if (resolveMarqueeAsClick((maxX - minX) * (maxY - minY))) {
        handleLeftClick(e);
        return;
      }

      const store = useGameStore.getState();
      const ids: string[] = [];
      for (const t of store.towers) {
        const p = projectTower(t.gridPos.col, t.gridPos.row);
        if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) ids.push(t.id);
      }
      if (ids.length > 0) {
        useGameStore.setState({ multiSelectedTowerIds: ids, selectedTower: null, selectedTowerType: null });
      }
      return;
    }

    // --- 右鍵點擊（非拖拽平移）→ 切換塔鎖定（防誤出售，與 2D 一致）---
    if (e.button === 2 && rightDownPos) {
      const dx = e.clientX - rightDownPos.x;
      const dy = e.clientY - rightDownPos.y;
      rightDownPos = null;
      if (dx * dx + dy * dy > 36) return;
      const cell = pickCell(e.clientX, e.clientY);
      if (!cell) return;
      const store = useGameStore.getState();
      const tile = store.grid[cell.row]?.[cell.col];
      if (tile?.towerId) store.toggleTowerLock(tile.towerId);
      return;
    }

    if (e.button !== 0 || !downPos) return;
    const dx = e.clientX - downPos.x;
    const dy = e.clientY - downPos.y;
    downPos = null;
    // 拖拽旋轉視角時不觸發點擊
    if (dx * dx + dy * dy > 36) return;

    handleLeftClick(e);
  };

  // 右鍵選單交給鎖定功能，禁用瀏覽器預設選單
  const onContextMenu = (e: MouseEvent) => e.preventDefault();

  dom.addEventListener('pointermove', onPointerMove);
  dom.addEventListener('pointerdown', onPointerDown);
  dom.addEventListener('pointerup', onPointerUp);
  dom.addEventListener('contextmenu', onContextMenu);

  // ===== 射程計算（與 2D updateTowers 同公式）=====
  const towerRange = (type: string, level: number, upgradePath: UpgradePath = null): number => {
    const data = getTowerData(type as never);
    if (!data) return 0;
    const talentRangeMult = useTalentStore.getState().getModifiers().towerRangeMult;
    return data.range * getTowerStatBonusFor({
      type,
      level,
      upgradePath,
    }).rangeMultiplier * talentRangeMult;
  };

  // ===== 每幀更新 =====
  const update = (now: number) => {
    const store = useGameStore.getState();
    const { selectedTowerType, selectedTower, grid } = store;
    const showTowerRange = useSettingsStore.getState().visual.showTowerRange;

    // --- 懸停高亮與放塔預覽 ---
    if (hoverCell) {
      const tile = grid[hoverCell.row]?.[hoverCell.col];
      const [wx, wz] = toWorld(hoverCell.col, hoverCell.row);

      if (tile?.towerId) {
        // 懸停已有塔：白色微光
        hoverMesh.visible = true;
        hoverMesh.position.set(wx, 0.17, wz);
        hoverMat.color.setHex(0xffffff);
        hoverMat.emissive.setHex(0xffffff);
        hoverMat.opacity = 0.18;
        hoverRangeRing.visible = false;
      } else if (selectedTowerType) {
        const placeable = tile?.type === 'empty';
        hoverMesh.visible = true;
        hoverMesh.position.set(wx, 0.17, wz);
        const wouldSynergize = placeable && previewPlacementSynergies(
          selectedTowerType,
          hoverCell.col,
          hoverCell.row,
          store.towers.map(toTowerRef),
        ).length > 0;
        const tone = !placeable ? 0xef4444 : wouldSynergize ? 0x38bdf8 : 0x22d3ee;
        hoverMat.color.setHex(tone);
        hoverMat.emissive.setHex(tone);
        hoverMat.opacity = 0.35;

        // 放塔預覽射程圈
        if (placeable) {
          const r = towerRange(selectedTowerType, 1);
          hoverRangeRing.visible = shouldShowTowerRangeRing(showTowerRange, r);
          hoverRangeRing.position.set(wx, 0.14, wz);
          hoverRangeRing.scale.setScalar(Math.max(0.001, r));
        } else {
          hoverRangeRing.visible = false;
        }
      } else {
        hoverMesh.visible = false;
        hoverRangeRing.visible = false;
      }
    } else {
      hoverMesh.visible = false;
      hoverRangeRing.visible = false;
    }

    // --- 選中塔：金色脈動環 + 射程圈 ---
    if (selectedTower) {
      const live = store.towers.find((t) => t.id === selectedTower.id);
      if (live) {
        const [wx, wz] = toWorld(live.gridPos.col, live.gridPos.row);
        const pulse = 0.55 + Math.sin(now * 0.006) * 0.25;

        selectedHalo.visible = true;
        selectedHalo.position.set(wx, 0.15, wz);
        (selectedHalo.material as THREE.MeshBasicMaterial).opacity = pulse;

        const r = towerRange(live.type, live.level, live.upgradePath);
        selectedRangeRing.visible = shouldShowTowerRangeRing(showTowerRange, r);
        selectedRangeRing.position.set(wx, 0.13, wz);
        selectedRangeRing.scale.setScalar(Math.max(0.001, r));
        (selectedRangeRing.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(now * 0.006) * 0.1;
      } else {
        selectedHalo.visible = false;
        selectedRangeRing.visible = false;
      }
    } else {
      selectedHalo.visible = false;
      selectedRangeRing.visible = false;
    }
  };

  /** 操控小人模式時停用互動（拖視角不誤觸放塔/選塔/懸停） */
  const setEnabled = (v: boolean) => {
    enabled = v;
    if (!v) {
      marqueeStart = null;
      downPos = null;
      rightDownPos = null;
      hoverCell = null;
      options?.onMarquee?.(null);
      options?.onHoverEnemy?.(null, 0, 0);
    }
  };

  const dispose = () => {
    dom.removeEventListener('pointermove', onPointerMove);
    dom.removeEventListener('pointerdown', onPointerDown);
    dom.removeEventListener('pointerup', onPointerUp);
    dom.removeEventListener('contextmenu', onContextMenu);
    for (const m of [hoverMesh, hoverRangeRing, selectedRangeRing, selectedHalo]) {
      scene.remove(m);
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
  };

  return { update, dispose, setEnabled };
}
