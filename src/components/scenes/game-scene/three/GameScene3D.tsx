/**
 * 遊戲 3D 視圖（three.js 渲染器）
 *
 * 與 2D Canvas 渲染器並存的另一個「視圖」：
 *  - 遊戲邏輯零改動，每幀直接從 gameStore 讀取敵人/塔/投射物狀態同步到 3D 場景
 *  - 後處理管線：EffectComposer → RenderPass → UnrealBloomPass → OutputPass
 *  - 攻擊閃光：塔開火時產生短暫 PointLight（池化，Bloom 加持）
 *  - GPU 粒子：死亡爆炸、命中火花等使用 InstancedMesh 粒子系統
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSkinStore } from '@/store/skinStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDevStore } from '@/store/devStore';
import { GAME_CONSTANTS, PATHS } from '@/data/gameData';
import { getTowerData, getTowerVisuals } from '@/store/gameStoreUtils';
import { EnemyTooltip } from '@/components/game/EnemyTooltip';
import { calculateTacticalScores } from '@/components/game/TacticalUtils';
import { createEffects3D } from './effects3d';
import { createInteraction3D } from './interaction3d';
import { createSkillFx3D } from './skillFx3d';
import { createEnvironment3D } from './environment3d';
import {
  applyOrbitControlSpeeds,
  resolveWalkLookDelta,
  resolveWalkZoomDelta,
} from '@/data/cameraControlSpeeds';
import { resolveDisplayedTileType, shouldShowEnemyPathFx } from '@/data/enemyPathVisibility';
import { createRenderSnapshot, towerLevelScale, writeRenderSnapshot } from '@/data/renderSnapshot';
import { createFrameLoopGuard } from '@/utils/frameLoopGuard';
import { createWalkers3D, createPlayerWalker, type Walkers3D, type PlayerWalker } from './walker3d';
import { buildTowerModel, disposeTowerModel } from './towerModels3d';
import { createAttackLights3D } from './attackLights3d';
import { createGpuParticleSystem } from './gpuParticles3d';
import {
  createEnemyInstances,
  createProjectileInstances,
  createParticleInstances,
} from './instanced3d';
import { createTowerHealthBars3D } from './towerHealthBars3d';

const COLS = GAME_CONSTANTS.GRID_COLS;
const ROWS = GAME_CONSTANTS.GRID_ROWS;

// 把格座標 (col,row) 轉為 3D 世界座標（1 格 = 1 單位，地圖置中）
const toWorld = (col: number, row: number): [number, number] => [
  col - COLS / 2 + 0.5,
  row - ROWS / 2 + 0.5,
];

// tile 類型 → 顏色與高度
const TILE_STYLE: Record<string, { color: number; height: number; emissive?: number }> = {
  empty: { color: 0x171a22, height: 0.12 },
  path: { color: 0x2c3344, height: 0.06, emissive: 0x11151f },
  start: { color: 0x14532d, height: 0.1, emissive: 0x064e3b },
  end: { color: 0x7f1d1d, height: 0.1, emissive: 0x450a0a },
  blocked: { color: 0x0b0d12, height: 0.4 },
  fork: { color: 0x3b3454, height: 0.06, emissive: 0x1e1b31 },
};

/** 把 #rrggbb 字串轉 three 色碼，失敗回退白 */
const cssColor = (c: string | undefined): number => {
  try {
    return new THREE.Color(c || '#ffffff').getHex();
  } catch {
    return 0xffffff;
  }
};

// 相機預設位姿
type CameraPreset = 'free' | 'angle' | 'top';
const CAMERA_PRESETS: Record<Exclude<CameraPreset, 'free'>, { pos: [number, number, number] }> = {
  angle: { pos: [0, 13, 11] },
  top: { pos: [0, 22, 0.01] },
};

export function GameScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<{ camera: THREE.PerspectiveCamera; controls: OrbitControls } | null>(null);
  const walkersRef = useRef<Walkers3D | null>(null);
  // 操控小人模式：enter/exit 由主 effect 提供（three 世界內建立/銷毀）
  const walkCtlRef = useRef<{ enter: () => void; exit: () => void } | null>(null);
  const [walkMode, setWalkMode] = useState(false);
  const [activePreset, setActivePreset] = useState<CameraPreset>('angle');

  // 敵人懸停提示
  const [hoveredEnemyId, setHoveredEnemyId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const hoveredEnemy = useGameStore(
    useCallback((s) => (hoveredEnemyId ? s.enemies.find((e) => e.id === hoveredEnemyId) ?? null : null), [hoveredEnemyId]),
  );

  // Ctrl+拖拽框選矩形（container 本地座標）
  const [marquee, setMarquee] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const applyPreset = (p: CameraPreset) => {
    setActivePreset(p);
    if (p === 'free' || !threeRef.current) return;
    const { camera, controls } = threeRef.current;
    const { pos } = CAMERA_PRESETS[p];
    camera.position.set(pos[0], pos[1], pos[2]);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ===== 基礎場景 =====
    const initVisual = useSettingsStore.getState().visual;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = initVisual.shadowQuality !== 'off';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e14);
    scene.fog = new THREE.Fog(0x0c0e14, 28, 60);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      200,
    );
    camera.position.set(0, 13, 11);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.46;   // 不允許穿到地面以下
    controls.minDistance = 6;
    controls.maxDistance = 34;
    controls.target.set(0, 0, 0);
    threeRef.current = { camera, controls };
    // 玩家手動拖拽視角 → 自動切回「自由」預設
    const onControlsStart = () => setActivePreset('free');
    controls.addEventListener('start', onControlsStart);

    // ===== 後處理管線（Bloom + Output）=====
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.5,   // strength
      0.4,   // radius
      0.7,   // threshold
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    // 依初始設定決定 bloom 開關
    bloomPass.enabled = initVisual.bloomEnabled;
    // 陰影品質對應 shadow map 大小
    const SHADOW_MAP_SIZES: Record<string, number> = { low: 512, medium: 2048, high: 4096 };

    // ===== 光照（半球光：天藍頂光 + 暗地反光，層次優於純環境光） =====
    scene.add(new THREE.HemisphereLight(0x8fa8d8, 0x1a1410, 1.0));
    scene.add(new THREE.AmbientLight(0x8899bb, 0.35));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.6);
    sun.position.set(8, 16, 6);
    sun.castShadow = true;
    const smSize = SHADOW_MAP_SIZES[initVisual.shadowQuality] ?? 2048;
    sun.shadow.mapSize.set(smSize, smSize);
    sun.shadow.camera.left = -14;
    sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -14;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x6688ff, 0.5);
    rim.position.set(-10, 8, -8);
    scene.add(rim);

    // ===== 地面與地圖 =====
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // 大地面（接陰影）
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0c11, roughness: 1 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    mapGroup.add(ground);

    // 依 grid 建立立體格（empty 地塊棋盤格交替色打破單調；材質按 type+奇偶共用）
    const tileGeoCache = new Map<string, THREE.BoxGeometry>();
    const tileMatCache = new Map<string, THREE.MeshStandardMaterial>();
    const pathSensitiveTiles: { mesh: THREE.Mesh; type: string; row: number; col: number }[] = [];
    const styleOf = (type: string) => TILE_STYLE[type] || TILE_STYLE.empty;
    const ensureTileGeo = (type: string) => {
      let geo = tileGeoCache.get(type);
      if (!geo) {
        geo = new THREE.BoxGeometry(0.94, styleOf(type).height, 0.94);
        tileGeoCache.set(type, geo);
      }
      return geo;
    };
    const ensureTileMat = (type: string, row: number, col: number) => {
      const style = styleOf(type);
      const checker = type === 'empty' && (row + col) % 2 === 1;
      const matKey = type + (checker ? '-alt' : '');
      let mat = tileMatCache.get(matKey);
      if (!mat) {
        mat = new THREE.MeshStandardMaterial({
          color: checker ? 0x1b1f29 : style.color,
          roughness: 0.85,
          metalness: 0.1,
          emissive: style.emissive ?? 0x000000,
          emissiveIntensity: style.emissive ? 0.6 : 0,
        });
        tileMatCache.set(matKey, mat);
      }
      return mat;
    };
    const applyTileDisplay = (
      mesh: THREE.Mesh,
      type: string,
      row: number,
      col: number,
      showEnemyPath: boolean,
    ) => {
      const display = resolveDisplayedTileType(type, showEnemyPath);
      const style = styleOf(display);
      mesh.geometry = ensureTileGeo(display);
      mesh.material = ensureTileMat(display, row, col);
      mesh.position.y = style.height / 2;
    };
    const buildMapTiles = () => {
      const { grid } = useGameStore.getState();
      const showEnemyPath = useSettingsStore.getState().gameplay.showEnemyPath;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tile = grid[r]?.[c];
          const type = tile?.type || 'empty';
          const mesh = new THREE.Mesh();
          const [wx, wz] = toWorld(c, r);
          mesh.position.set(wx, 0, wz);
          applyTileDisplay(mesh, type, r, c, showEnemyPath);
          mesh.receiveShadow = true;
          if (type === 'blocked') mesh.castShadow = true;
          mapGroup.add(mesh);
          if (resolveDisplayedTileType(type, false) === 'empty' && type !== 'empty') {
            pathSensitiveTiles.push({ mesh, type, row: r, col: c });
          }
        }
      }

      // 路徑中心導引線（沿 waypoints 畫發光線段；可由開發者面板 showPath 開關）
      const { selectedPath } = useGameStore.getState();
      const path = PATHS[selectedPath];
      const lineMat = new THREE.LineBasicMaterial({ color: 0x66aaff, transparent: true, opacity: 0.5 });
      const drawWaypointLine = (wps: { col: number; row: number }[]) => {
        if (!wps || wps.length < 2) return;
        const pts = wps.map((w) => {
          const [wx, wz] = toWorld(w.col, w.row);
          return new THREE.Vector3(wx, 0.1, wz);
        });
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        pathLinesGroup.add(new THREE.Line(lineGeo, lineMat));
      };
      if (path.segments && path.segments.length > 0) {
        for (const seg of path.segments) drawWaypointLine(seg.waypoints);
      } else {
        drawWaypointLine(path.waypoints);
      }
    };
    const pathLinesGroup = new THREE.Group();
    mapGroup.add(pathLinesGroup);
    buildMapTiles();

    // ===== 出怪口 / 基地光柱標記（綠=入口、紅=基地；基地受擊時爆閃）=====
    const beaconGeo = new THREE.CylinderGeometry(0.3, 0.38, 3, 14, 1, true);
    const beacons: { mesh: THREE.Mesh; kind: 'start' | 'end' }[] = [];
    const beaconTiles: { kind: 'start' | 'end'; col: number; row: number }[] = [];
    {
      const { grid } = useGameStore.getState();
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const t = grid[r]?.[c];
          if (t?.type !== 'start' && t?.type !== 'end') continue;
          const mat = new THREE.MeshBasicMaterial({
            color: t.type === 'start' ? 0x34d399 : 0xef4444,
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(beaconGeo, mat);
          const [wx, wz] = toWorld(c, r);
          mesh.position.set(wx, 1.5, wz);
          mapGroup.add(mesh);
          beacons.push({ mesh, kind: t.type });
          beaconTiles.push({ kind: t.type, col: c, row: r });
        }
      }
    }

    // ===== 環境氛圍（路徑流光 / 邊界發光框 / 星空塵埃 / 信標旋轉光環）=====
    const envPath = PATHS[useGameStore.getState().selectedPath];
    const envSegments =
      envPath?.segments && envPath.segments.length > 0
        ? envPath.segments.map((s) => s.waypoints)
        : [envPath?.waypoints ?? []];
    const environment = createEnvironment3D(scene, {
      cols: COLS,
      rows: ROWS,
      toWorld,
      pathSegments: envSegments,
      beaconTiles,
    });

    // ===== 漫步小人（觀賞互動：沿敵人路徑行走的 Q 版小人）=====
    const walkers = createWalkers3D(scene, {
      toWorld,
      pathSegments: envSegments,
      groundY: TILE_STYLE.path.height,
      maxCount: 12,
    });
    walkersRef.current = walkers;

    // ===== 玩家操控小人（相對相機方向移動 + 滑鼠軌道視角 + 跳躍）=====
    let player: PlayerWalker | null = null;
    let walkModeOn = false;
    const savedCam = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
    const camTargetTmp = new THREE.Vector3();
    const camPosTmp = new THREE.Vector3();
    // 圍繞小人的軌道視角參數（滑鼠拖曳 / 滾輪控制）
    const camOrbit = { yaw: Math.PI / 4, pitch: 0.55, dist: 4.6 };

    const enterWalkMode = () => {
      if (walkModeOn) return;
      walkModeOn = true;
      // 出生點：出怪口（無則地圖中心）
      const startTile = beaconTiles.find((b) => b.kind === 'start');
      const [sx, sz] = startTile ? toWorld(startTile.col, startTile.row) : [0, 0];
      player = createPlayerWalker(scene, {
        spawnAt: { x: sx, y: TILE_STYLE.path.height, z: sz },
        bounds: {
          minX: -COLS / 2 + 0.3,
          maxX: COLS / 2 - 0.3,
          minZ: -ROWS / 2 + 0.3,
          maxZ: ROWS / 2 - 0.3,
        },
      });
      // 保存相機位姿並由目前機位反推軌道角（鏡頭平滑銜接過去）
      savedCam.pos.copy(camera.position);
      savedCam.target.copy(controls.target);
      const dx = camera.position.x - sx;
      const dy = camera.position.y - TILE_STYLE.path.height;
      const dz = camera.position.z - sz;
      const horiz = Math.hypot(dx, dz);
      camOrbit.dist = THREE.MathUtils.clamp(Math.hypot(horiz, dy), 2.6, 9);
      camOrbit.pitch = THREE.MathUtils.clamp(Math.atan2(dy, horiz || 0.001), 0.15, 1.25);
      camOrbit.yaw = Math.atan2(-dz, dx);
      // 操控期間停用 OrbitControls 與場景互動（拖視角不誤觸放塔）
      controls.enabled = false;
      interaction.setEnabled(false);
      setWalkMode(true);
    };

    const exitWalkMode = () => {
      if (!walkModeOn) return;
      walkModeOn = false;
      player?.dispose();
      player = null;
      heldKeys.clear();
      // 還原相機與互動
      camera.position.copy(savedCam.pos);
      controls.target.copy(savedCam.target);
      controls.enabled = true;
      interaction.setEnabled(true);
      controls.update();
      setWalkMode(false);
      setActivePreset('free');
    };

    walkCtlRef.current = { enter: enterWalkMode, exit: exitWalkMode };

    // --- 鍵盤：WASD/方向鍵 相對相機方向移動、Space 跳躍、Esc 退出 ---
    const WALK_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);
    const heldKeys = new Set<string>();
    const onWalkKeyDown = (e: KeyboardEvent) => {
      if (!walkModeOn) return;
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        exitWalkMode();
        return;
      }
      if (WALK_KEYS.has(e.code)) {
        // 攔截移動鍵避免觸發遊戲快捷鍵
        e.preventDefault();
        e.stopPropagation();
        if (e.code === 'Space') {
          if (!e.repeat) player?.jump();
        } else {
          heldKeys.add(e.code);
        }
      }
    };
    const onWalkKeyUp = (e: KeyboardEvent) => {
      if (WALK_KEYS.has(e.code)) heldKeys.delete(e.code);
    };
    window.addEventListener('keydown', onWalkKeyDown, true);
    window.addEventListener('keyup', onWalkKeyUp, true);

    // --- 滑鼠：拖曳旋轉視角、滾輪縮放距離（操控模式時生效） ---
    let camDragging = false;
    let camLastX = 0;
    let camLastY = 0;
    const onWalkPointerDown = (e: PointerEvent) => {
      if (!walkModeOn || (e.button !== 0 && e.button !== 2)) return;
      camDragging = true;
      camLastX = e.clientX;
      camLastY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onWalkPointerMove = (e: PointerEvent) => {
      if (!walkModeOn || !camDragging) return;
      const look = resolveWalkLookDelta(
        e.clientX - camLastX,
        e.clientY - camLastY,
        useSettingsStore.getState().controls.mouseSensitivity,
      );
      camOrbit.yaw += look.yaw;
      camOrbit.pitch = THREE.MathUtils.clamp(camOrbit.pitch + look.pitch, 0.12, 1.3);
      camLastX = e.clientX;
      camLastY = e.clientY;
    };
    const onWalkPointerUp = (e: PointerEvent) => {
      camDragging = false;
      if (renderer.domElement.hasPointerCapture(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }
    };
    const onWalkWheel = (e: WheelEvent) => {
      if (!walkModeOn) return;
      e.preventDefault();
      const zoomDelta = resolveWalkZoomDelta(
        e.deltaY,
        useSettingsStore.getState().controls.zoomSpeed,
      );
      camOrbit.dist = THREE.MathUtils.clamp(camOrbit.dist + zoomDelta, 2.2, 9);
    };
    renderer.domElement.addEventListener('pointerdown', onWalkPointerDown);
    renderer.domElement.addEventListener('pointermove', onWalkPointerMove);
    renderer.domElement.addEventListener('pointerup', onWalkPointerUp);
    renderer.domElement.addEventListener('pointercancel', onWalkPointerUp);
    renderer.domElement.addEventListener('wheel', onWalkWheel, { passive: false });
    // 基地受擊偵測（血量下降 → 紅柱爆閃 450ms）
    let lastHealth = useGameStore.getState().health;
    let baseHitFlashUntil = 0;

    // ===== 戰術建議熱力圖（T 鍵切換，與 2D 共用 calculateTacticalScores）=====
    const TACTICAL_COLORS: Record<string, number> = {
      best: 0x22c55e,
      good: 0xa3e635,
      fair: 0xfacc15,
      poor: 0x6b7280,
    };
    const tacticalGeo = new THREE.PlaneGeometry(0.88, 0.88);
    const tacticalMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const tacticalMesh = new THREE.InstancedMesh(tacticalGeo, tacticalMat, COLS * ROWS);
    tacticalMesh.frustumCulled = false;
    tacticalMesh.count = 0;
    scene.add(tacticalMesh);

    // 節流重算：只在 grid / 塔種 / 開關變化時重新計算
    let tacticalCacheKey: unknown[] = [];
    const tacticalDummy = new THREE.Object3D();
    const tacticalColor = new THREE.Color();
    const syncTactical = () => {
      const s = useGameStore.getState();
      if (!s.showTacticalView) {
        tacticalMesh.count = 0;
        return;
      }
      const key = [s.grid, s.selectedTowerType, s.showTacticalView];
      if (key.every((v, i) => v === tacticalCacheKey[i])) return;
      tacticalCacheKey = key;

      const wps = PATHS[s.selectedPath]?.waypoints || [];
      const scores = calculateTacticalScores({
        grid: s.grid,
        waypoints: wps,
        tileSize: 60,
        selectedTowerType: s.selectedTowerType,
        getTowerData: (type) => getTowerData(type as never),
      });
      const n = Math.min(scores.length, COLS * ROWS);
      for (let i = 0; i < n; i++) {
        const sc = scores[i];
        const [wx, wz] = toWorld(sc.col, sc.row);
        tacticalDummy.position.set(wx, 0.16, wz);
        tacticalDummy.rotation.set(-Math.PI / 2, 0, 0);
        tacticalDummy.scale.setScalar(1);
        tacticalDummy.updateMatrix();
        tacticalMesh.setMatrixAt(i, tacticalDummy.matrix);
        tacticalMesh.setColorAt(i, tacticalColor.setHex(TACTICAL_COLORS[sc.recommendation] ?? 0x6b7280));
      }
      tacticalMesh.count = n;
      tacticalMesh.instanceMatrix.needsUpdate = true;
      if (tacticalMesh.instanceColor) tacticalMesh.instanceColor.needsUpdate = true;
    };

    // ===== 實體同步池 =====
    // 敵人/投射物/粒子走 InstancedMesh（單 draw call）；塔需獨立砲管旋轉與差異化外形，維持 Group 池
    const towerGroups = new Map<string, THREE.Group>();

    const enemyInstances = createEnemyInstances(scene);
    const projectileInstances = createProjectileInstances(scene);
    const particleInstances = createParticleInstances(scene);
    const towerHealthBars = createTowerHealthBars3D(scene);

    // 每幀渲染 snapshot：純函式層產出「這一幀」的實體視覺欄位，2D 用同一份契約。
    // 緩衝只建立一次、逐幀原地寫入（每幀零配置，見 data/renderSnapshot.ts 的說明）。
    const frameSnapshot = createRenderSnapshot();

    // 每幀同步 store → 場景
    const syncEntities = (dtSec: number) => {
      const { enemies, towers, projectiles } = useGameStore.getState();
      const visualSettings = useSettingsStore.getState().visual;
      const nowMs = Date.now();

      // --- 敵人 / 塔 / 投射物：一次投影成同一份每幀資料，三個實例池都吃它 ---
      writeRenderSnapshot({ enemies, towers, projectiles }, frameSnapshot, nowMs);
      enemyInstances.sync(frameSnapshot, toWorld, camera.quaternion, visualSettings.showHealthBars);

      // --- 塔（差異化模型；等級變化時重建以更新等級環）---
      const towerFrames = frameSnapshot.towers;
      const aliveTower = new Set<string>();
      for (let ti = 0; ti < frameSnapshot.towerCount; ti++) {
        const t = towerFrames[ti];
        aliveTower.add(t.id);
        let g = towerGroups.get(t.id);
        // 等級變化 → 重建模型（模型本體隨等級進化）
        if (g && g.userData.level !== t.level) {
          scene.remove(g);
          disposeTowerModel(g);
          towerGroups.delete(t.id);
          g = undefined;
        }
        if (!g) {
          // 顏色優先取裝備皮膚主色，無皮膚回退塔種預設色
          const skinColor = useSkinStore.getState().getSkinVisuals(t.type)?.color;
          const color = cssColor(skinColor || getTowerData(t.type)?.color);
          // Mod 塔自訂 3D 外觀（自訂部件模型 / 模型種類 / 縮放 / 砲管 / 光暈），原生塔回傳預設值
          const visuals = getTowerVisuals(t.type);
          g = buildTowerModel(t.type, color, t.level, {
            modelType: visuals.modelType !== t.type ? visuals.modelType : undefined,
            modelScale: visuals.modelScale,
            barrelLength: visuals.barrelLength,
            glowColor: visuals.glowColor ? cssColor(visuals.glowColor) : undefined,
            glowIntensity: visuals.glowColor ? visuals.glowIntensity : undefined,
            custom3d: visuals.custom3d ?? undefined,
          });
          const [wx, wz] = toWorld(t.gridPos.col, t.gridPos.row);
          g.position.set(wx, TILE_STYLE.empty.height, wz);
          scene.add(g);
          towerGroups.set(t.id, g);
        }
        // 砲塔朝向（2D rotation → 3D Y 軸；canvas 角度順時針，3D 逆時針取負）
        g.rotation.y = -t.rotation;
        // 等級越高越高大：高度全幅增長，XZ 不放大以確保不超出 0.94 地塊（模型基礎半徑 ≤ 0.47）
        const levelScale = towerLevelScale(t.level);
        g.scale.set(1, levelScale, 1);
        // 持續旋轉部件（風塔葉片 / 雷射懸浮環 / 冰晶）
        const spinPart = g.userData.spinPart as THREE.Object3D | undefined;
        if (spinPart) spinPart.rotation.y += (spinPart.userData.spin || 1) * dtSec;
      }
      for (const [id, g] of towerGroups) {
        if (!aliveTower.has(id)) {
          scene.remove(g);
          disposeTowerModel(g);
          towerGroups.delete(id);
        }
      }

      // --- 投射物（InstancedMesh 單 draw call）---
      projectileInstances.sync(frameSnapshot, toWorld);

      // --- 塔血條（受傷才顯示，跟 2D 同一把 showHealthBars）---
      towerHealthBars.sync(frameSnapshot, toWorld, camera.quaternion, visualSettings.showHealthBars);
    };

    // ===== 戰鬥特效（命中粒子 + 死亡碎片，消費 store 同一資料源）=====
    const effects = createEffects3D(scene);

    // ===== 玩家技能演出 + 火焰塔噴射束 =====
    const skillFx = createSkillFx3D(scene);

    // ===== 攻擊閃光（PointLight 池化，Bloom 加持）=====
    const attackLights = createAttackLights3D(scene);
    // 追蹤每座塔上次攻擊時間，偵測新攻擊觸發閃光
    const towerLastAttack = new Map<string, number>();

    // ===== GPU 粒子系統 =====
    const gpuParticles = createGpuParticleSystem(scene, initVisual.particleDensity);

    // ===== 交互（raycaster 放塔/選塔、懸停高亮、射程圈、敵人懸停提示、框選、右鍵鎖定）=====
    const interaction = createInteraction3D(scene, camera, renderer.domElement, toWorld, {
      enemyBody: enemyInstances.bodyMesh,
      onHoverEnemy: (idx, cx, cy) => {
        const { enemies } = useGameStore.getState();
        const id = idx !== null ? enemies[idx]?.id ?? null : null;
        setHoveredEnemyId(id);
        if (id) {
          const rect = container.getBoundingClientRect();
          setTooltipPos({ x: cx - rect.left, y: cy - rect.top });
        }
      },
      controls,
      onMarquee: setMarquee,
    });

    // ===== 渲染迴圈 =====
    let rafId = 0;
    const shakeOffset = new THREE.Vector3();
    let lastFrameTime = performance.now();
    const frameGuard = createFrameLoopGuard({ label: '3d-scene' });
    const drawFrame = () => {
      const frameNow = performance.now();
      const dtSec = Math.min(0.1, (frameNow - lastFrameTime) / 1000);
      lastFrameTime = frameNow;

      syncEntities(dtSec);

      const now = Date.now();
      const state = useGameStore.getState();
      const settings = useSettingsStore.getState().visual;
      applyOrbitControlSpeeds(controls, useSettingsStore.getState().controls);
      const { impactParticles, deathAnimations, damageTexts, shakeIntensity } = state;
      effects.sync(deathAnimations, toWorld, now);
      // 傷害數字受「顯示傷害數字」設定控制
      effects.syncDamageTexts(settings.showDamageNumbers ? damageTexts : [], toWorld, now);
      particleInstances.sync(impactParticles, toWorld, camera.quaternion);

      // ===== 攻擊閃光偵測：塔的 lastAttackTime 變化時觸發閃光 =====
      for (const t of state.towers) {
        const prevTime = towerLastAttack.get(t.id) ?? 0;
        if (t.lastAttackTime && t.lastAttackTime > prevTime) {
          const [wx, wz] = toWorld(t.gridPos.col, t.gridPos.row);
          attackLights.flash(wx, wz, t.type);
          towerLastAttack.set(t.id, t.lastAttackTime);
        }
      }
      attackLights.update(frameNow);

      // ===== GPU 粒子：為新增的死亡動畫噴發粒子 =====
      for (const d of deathAnimations) {
        // 只在動畫剛建立的第一幀噴發（startTime 近似 now）
        if (now - d.startTime < 80) {
          const [wx, wz] = toWorld(d.x, d.y);
          const preset = d.isBoss ? 'meteorImpact' as const : 'deathBurst' as const;
          const color = new THREE.Color(d.color).getHex();
          gpuParticles.burst(wx, 0.3, wz, preset, color);
        }
      }
      // 為新增的命中粒子噴發火花
      for (const p of impactParticles) {
        if (now - p.startTime < 80) {
          const [wx, wz] = toWorld(p.x, p.y);
          const color = new THREE.Color(p.color).getHex();
          gpuParticles.burst(wx, 0.3, wz, 'hitSpark', color);
        }
      }
      gpuParticles.update(dtSec);

      // ===== 動態設定同步（Bloom / 陰影 / 粒子密度）=====
      bloomPass.enabled = settings.bloomEnabled;
      const curShadowQ = settings.shadowQuality;
      renderer.shadowMap.enabled = curShadowQ !== 'off';
      gpuParticles.setDensity(settings.particleDensity);

      // 戰術建議熱力圖（T 鍵）與路徑導引線（開發者面板 + 玩家「顯示敵人路徑」）
      syncTactical();
      const showEnemyPath = useSettingsStore.getState().gameplay.showEnemyPath;
      const pathFx = shouldShowEnemyPathFx(showEnemyPath);
      pathLinesGroup.visible = useDevStore.getState().showPath && pathFx;
      environment.setPathFlowVisible(pathFx);
      for (const rec of pathSensitiveTiles) {
        applyTileDisplay(rec.mesh, rec.type, rec.row, rec.col, showEnemyPath);
      }

      // 環境氛圍動畫（路徑流光 / 塵埃 / 信標環 / 邊界呼吸）
      environment.update(now, dtSec);

      // 漫步小人（行走 / 擺動 / 終點消失）
      walkers.update(now, dtSec);

      // 玩家操控小人：WASD 相對相機方向移動；軌道相機（拖曳視角 / 滾輪距離）平滑跟隨
      if (walkModeOn && player) {
        // 相機水平 forward / right（W = 朝畫面前方走）
        const fwdX = -Math.cos(camOrbit.yaw);
        const fwdZ = Math.sin(camOrbit.yaw);
        const rightX = -Math.sin(camOrbit.yaw);
        const rightZ = -Math.cos(camOrbit.yaw);
        const mF = (heldKeys.has('KeyW') || heldKeys.has('ArrowUp') ? 1 : 0) - (heldKeys.has('KeyS') || heldKeys.has('ArrowDown') ? 1 : 0);
        const mR = (heldKeys.has('KeyD') || heldKeys.has('ArrowRight') ? 1 : 0) - (heldKeys.has('KeyA') || heldKeys.has('ArrowLeft') ? 1 : 0);
        player.setMoveVector(fwdX * mF + rightX * mR, fwdZ * mF + rightZ * mR);
        player.update(now, dtSec);

        const p = player.position;
        const cosP = Math.cos(camOrbit.pitch);
        camPosTmp.set(
          p.x + Math.cos(camOrbit.yaw) * cosP * camOrbit.dist,
          p.y + Math.sin(camOrbit.pitch) * camOrbit.dist,
          p.z - Math.sin(camOrbit.yaw) * cosP * camOrbit.dist,
        );
        const k = 1 - Math.pow(0.0004, dtSec);
        camera.position.lerp(camPosTmp, k);
        camTargetTmp.set(p.x, p.y + 0.45, p.z);
        controls.target.lerp(camTargetTmp, k);
        camera.lookAt(controls.target);
      }

      // 出怪口/基地光柱脈動；基地受擊紅柱爆閃
      if (state.health < lastHealth) baseHitFlashUntil = now + 450;
      lastHealth = state.health;
      const pulse = 0.14 + Math.sin(now * 0.003) * 0.06;
      for (const b of beacons) {
        const mat = b.mesh.material as THREE.MeshBasicMaterial;
        if (b.kind === 'end' && now < baseHitFlashUntil) {
          const flash = (baseHitFlashUntil - now) / 450;
          mat.opacity = 0.2 + flash * 0.55;
        } else {
          mat.opacity = pulse;
        }
        b.mesh.rotation.y += 0.004;
      }

      // 升級/出售動畫：渲染 + 過期清理（2D 視圖時由 GameCanvas 負責，3D 視圖在此接手）
      // 升級/出售的過期清理已搬回 store（updateVisualEffects），這裡只負責畫
      effects.syncTowerFx(state.upgradeAnimations, state.sellAnimations, toWorld, now);

      // 玩家技能演出 + 火焰塔噴射束
      skillFx.syncSkills(state.playerSkillAnimations, toWorld, now);
      skillFx.syncFlames(frameSnapshot, toWorld, now);

      interaction.update(now);

      // 操控小人時相機由跟隨邏輯接管，跳過 OrbitControls 更新避免互相覆蓋
      if (!walkModeOn) controls.update();

      // 相機震動：渲染前加偏移、渲染後還原（不干擾 OrbitControls 狀態；受「螢幕震動」設定控制）
      if (settings.screenShake && shakeIntensity > 0.1) {
        const amp = shakeIntensity * 0.02;
        shakeOffset.set(
          (Math.random() - 0.5) * amp,
          (Math.random() - 0.5) * amp * 0.6,
          (Math.random() - 0.5) * amp,
        );
        camera.position.add(shakeOffset);
        composer.render();
        camera.position.sub(shakeOffset);
      } else {
        composer.render();
      }
    };

    // 單幀異常只掉一幀：guard 接住並節流上報，避免整個 3D 場景安靜停住（§4.5）
    const loop = () => {
      frameGuard.run(drawFrame);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    // ===== 尺寸自適應 =====
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // ===== 清理 =====
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      threeRef.current = null;
      walkersRef.current = null;
      walkCtlRef.current = null;
      window.removeEventListener('keydown', onWalkKeyDown, true);
      window.removeEventListener('keyup', onWalkKeyUp, true);
      renderer.domElement.removeEventListener('pointerdown', onWalkPointerDown);
      renderer.domElement.removeEventListener('pointermove', onWalkPointerMove);
      renderer.domElement.removeEventListener('pointerup', onWalkPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onWalkPointerUp);
      renderer.domElement.removeEventListener('wheel', onWalkWheel);
      player?.dispose();
      controls.removeEventListener('start', onControlsStart);
      interaction.dispose();
      effects.dispose();
      skillFx.dispose();
      attackLights.dispose();
      gpuParticles.dispose();
      environment.dispose();
      walkers.dispose();
      scene.remove(tacticalMesh);
      tacticalGeo.dispose();
      tacticalMat.dispose();
      tacticalMesh.dispose();
      beaconGeo.dispose();
      for (const b of beacons) (b.mesh.material as THREE.Material).dispose();
      for (const [, g] of towerGroups) disposeTowerModel(g);
      towerGroups.clear();
      enemyInstances.dispose();
      projectileInstances.dispose();
      particleInstances.dispose();
      towerHealthBars.dispose();
      composer.dispose();
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          obj.geometry?.dispose();
          const m = obj.material as THREE.Material | THREE.Material[];
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
          else m?.dispose();
        }
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // 相機預設按鈕（左下角浮動，SVG 圖標）
  const presetButtons: { id: CameraPreset; label: string; icon: React.ReactNode }[] = [
    {
      id: 'angle',
      label: '斜視',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M3 17l9-11 9 11" />
          <path d="M3 17h18" />
        </svg>
      ),
    },
    {
      id: 'top',
      label: '俯視',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      id: 'free',
      label: '自由',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M12 3v18M3 12h18" />
          <path d="M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4" />
        </svg>
      ),
    },
  ];

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* 相機預設切換 + 漫步小人 */}
      <div className="absolute bottom-3 left-3 z-20 flex gap-1">
        {presetButtons.map((b) => (
          <button
            key={b.id}
            onClick={() => applyPreset(b.id)}
            className={`inline-flex h-8 items-center gap-1.5 border px-2.5 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors duration-[110ms] ${
              activePreset === b.id
                ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)] text-[var(--hl-signal)]'
                : 'border-[var(--hl-line)] bg-[var(--hl-deck)] text-[var(--hl-ink-3)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]'
            }`}
            title={`相機：${b.label}`}
          >
            {b.icon}
            {b.label}
          </button>
        ))}
        <button
          onClick={() => walkersRef.current?.spawn()}
          className="inline-flex h-8 items-center gap-1.5 border border-[var(--hl-line)] bg-[var(--hl-deck)] px-2.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--hl-ink-2)] transition-colors hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]"
          title="生成一個小人沿路徑自動漫步（最多 12 個）"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <circle cx="12" cy="5" r="2.4" />
            <path d="M12 7.5v5M12 12.5l-2.8 6M12 12.5l2.8 6M12 9l-3.4 2M12 9l3.4 2" />
          </svg>
          漫步
        </button>
        <button
          onClick={() => (walkMode ? walkCtlRef.current?.exit() : walkCtlRef.current?.enter())}
          className={`inline-flex h-8 items-center gap-1.5 border px-2.5 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors duration-[110ms] ${
            walkMode
              ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)] text-[var(--hl-signal)]'
              : 'border-[var(--hl-line)] bg-[var(--hl-deck)] text-[var(--hl-ink-2)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]'
          }`}
          title={walkMode ? '退出操控（Esc）' : '操控小人下場行走（WASD / 方向鍵）'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <circle cx="12" cy="4.6" r="2.2" />
            <path d="M12 7v4.5M12 11.5l-3 6.5M12 11.5l3 6.5M12 8.5l-3.6 1.6M12 8.5l3.6 1.6" />
            <path d="M4 21h16" />
          </svg>
          {walkMode ? '退出操控' : '操控'}
        </button>
      </div>

      {/* 操控模式提示 */}
      {walkMode && (
        <div className="pointer-events-none absolute bottom-14 left-3 z-20 border border-[var(--hl-line)] bg-[var(--hl-deck)] px-2.5 py-1.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-[var(--hl-ink-3)]">
            WASD 移動 · 滑鼠拖曳視角 · 滾輪縮放 · Space 跳躍 · Esc 退出
          </span>
        </div>
      )}

      {/* 敵人懸停提示框 */}
      <AnimatePresence>
        {hoveredEnemy && (
          <EnemyTooltip enemy={hoveredEnemy} x={tooltipPos.x} y={tooltipPos.y} />
        )}
      </AnimatePresence>

      {/* Ctrl+拖拽框選矩形 */}
      {marquee && (
        <div
          className="pointer-events-none absolute z-20 border border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]"
          style={{
            left: Math.min(marquee.x1, marquee.x2),
            top: Math.min(marquee.y1, marquee.y2),
            width: Math.abs(marquee.x2 - marquee.x1),
            height: Math.abs(marquee.y2 - marquee.y1),
          }}
        />
      )}
    </div>
  );
}

export default GameScene3D;
