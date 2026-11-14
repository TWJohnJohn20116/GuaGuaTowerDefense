/**
 * 通用 3D 模型預覽元件（圖鑑 / 百科用）
 *
 * 以輕量 three.js 場景展示單一模型：
 *  - 光照與遊戲 3D 視圖一致（環境光 + 暖色主光 + 冷色輪緣光）
 *  - 圓形展示台接陰影，背景透明融入卡片底色
 *  - 滑鼠 / 觸控拖曳旋轉，閒置後自動緩轉
 *  - 支援 userData.spinPart（風塔葉片等持續旋轉部件）與 userData.floatPart（浮動動畫）
 *
 * 封裝元件：
 *  - Tower3DPreview：依 towerId + level 用遊戲同款 buildTowerModel 建模
 *  - Enemy3DPreview：重現遊戲 3D 視圖的發光球體敵人（依 size 縮放 + 浮動）
 */

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { buildTowerModel, disposeTowerModel, type TowerModelOptions } from '@/components/scenes/game-scene/three/towerModels3d';
import { TOWER_DATA } from '@/data/gameData';

/** 把 CSS 顏色字串轉 three 色碼，失敗回退 */
const cssToHex = (c: string | undefined, fallback: number): number => {
  try {
    return c ? new THREE.Color(c).getHex() : fallback;
  } catch {
    return fallback;
  }
};

/** 通用銷毀：遍歷釋放幾何體與材質（僅用於非共享幾何的模型） */
const disposeObject3D = (root: THREE.Object3D): void => {
  root.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      const m = o.material as THREE.Material | THREE.Material[];
      if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
      else m?.dispose();
    }
  });
};

interface Model3DPreviewProps {
  /** 建立模型；用 useCallback 包裹，依賴變化時自動重建場景模型 */
  buildModel: () => THREE.Group;
  /** 銷毀模型（塔共享幾何體只銷毀材質；自建幾何用 disposeObject3D） */
  disposeModel?: (g: THREE.Group) => void;
  /** 畫布高度（寬度自適應容器） */
  height?: number;
  /** 閒置時自動旋轉 */
  autoRotate?: boolean;
  className?: string;
}

export function Model3DPreview({
  buildModel,
  disposeModel,
  height = 260,
  autoRotate = true,
  className = '',
}: Model3DPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ===== 渲染器（透明背景，融入外層卡片）=====
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || 300, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, (container.clientWidth || 300) / height, 0.1, 60);

    // ===== 光照（與 GameScene3D 同風格）=====
    scene.add(new THREE.AmbientLight(0x8899bb, 0.9));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.6);
    sun.position.set(3, 6, 2.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -3;
    sun.shadow.camera.right = 3;
    sun.shadow.camera.top = 3;
    sun.shadow.camera.bottom = -3;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x6688ff, 0.6);
    rim.position.set(-4, 3, -3);
    scene.add(rim);

    // ===== 展示台 + 模型 =====
    const pivot = new THREE.Group();
    scene.add(pivot);

    const groundGeo = new THREE.CircleGeometry(1.35, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x171a22,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    pivot.add(ground);

    const ringGeo = new THREE.TorusGeometry(1.35, 0.018, 8, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    pivot.add(ring);

    const model = buildModel();
    pivot.add(model);

    // ===== 自動取景（依模型包圍球決定相機距離）=====
    const sphere = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
    const r = Math.max(0.85, sphere.radius);
    const cy = Math.max(0.4, sphere.center.y);
    camera.position.set(r * 1.9, r * 1.5 + cy * 0.5, r * 1.9);
    camera.lookAt(new THREE.Vector3(0, cy * 0.85, 0));

    // ===== 拖曳旋轉 =====
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let yaw = -Math.PI / 5;
    let pitch = 0;
    let idleTime = 0;
    const el = renderer.domElement;
    el.style.touchAction = 'none';
    el.style.cursor = 'grab';
    el.style.display = 'block';

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      yaw += (e.clientX - lastX) * 0.011;
      pitch = THREE.MathUtils.clamp(pitch + (e.clientY - lastY) * 0.006, -0.5, 0.35);
      lastX = e.clientX;
      lastY = e.clientY;
      idleTime = 0;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      el.style.cursor = 'grab';
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    // ===== 渲染迴圈 =====
    const clock = new THREE.Clock();
    let raf = 0;
    const spinPart = model.userData?.spinPart as THREE.Object3D | undefined;
    const floatPart = model.userData?.floatPart as THREE.Object3D | undefined;
    const floatBaseY = floatPart?.position.y ?? 0;

    const loop = () => {
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;
      if (!dragging) {
        idleTime += dt;
        if (autoRotate && idleTime > 0.8) yaw += dt * 0.45;
      }
      pivot.rotation.y = yaw;
      pivot.rotation.x = pitch;
      if (spinPart) spinPart.rotation.y += dt * ((spinPart.userData?.spin as number) ?? 1);
      if (floatPart) floatPart.position.y = floatBaseY + Math.sin(t * 2.2) * 0.05;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    // ===== 寬度自適應 =====
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      if (w <= 0) return;
      renderer.setSize(w, height);
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      if (disposeModel) disposeModel(model);
      else disposeObject3D(model);
      groundGeo.dispose();
      groundMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (el.parentElement === container) container.removeChild(el);
    };
  }, [buildModel, disposeModel, height, autoRotate]);

  return <div ref={containerRef} className={className} style={{ height }} />;
}

// ===================== 塔 3D 預覽 =====================

export function Tower3DPreview({
  towerId,
  color,
  level = 1,
  height = 260,
  className,
  modelScale,
  barrelLength,
  glowColor,
  glowIntensity,
  custom3d,
}: {
  towerId: string;
  /** Mod 塔或自訂顏色覆蓋 */
  color?: string;
  level?: number;
  height?: number;
  className?: string;
  /** Mod 塔 3D 自訂參數（模組編輯器實時預覽用） */
  modelScale?: number;
  barrelLength?: number;
  glowColor?: string;
  glowIntensity?: number;
  /** 自訂部件模型（存在且非空時優先於 towerId 外形） */
  custom3d?: import('@/types/game').Custom3DModel;
}) {
  const build = useCallback(() => {
    const data = TOWER_DATA[towerId as keyof typeof TOWER_DATA];
    const hex = cssToHex(color || data?.color, 0x6496ff);
    const opts: TowerModelOptions = {
      modelScale,
      barrelLength,
      glowColor: glowColor ? cssToHex(glowColor, hex) : undefined,
      glowIntensity: glowColor ? glowIntensity : undefined,
      custom3d,
    };
    return buildTowerModel(towerId, hex, level, opts);
  }, [towerId, color, level, modelScale, barrelLength, glowColor, glowIntensity, custom3d]);

  return (
    <Model3DPreview
      buildModel={build}
      disposeModel={disposeTowerModel}
      height={height}
      className={className}
    />
  );
}

// ===================== 敵人 3D 預覽 =====================

/** 重現遊戲 3D 視圖的敵人外觀：發光球體，依 size 縮放（instanced3d 同款視覺） */
const buildEnemyModel = (colorHex: number, sizePx: number): THREE.Group => {
  const g = new THREE.Group();
  const s = Math.max(0.5, sizePx / 50);
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 28, 20),
    new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.45,
      emissive: colorHex,
      emissiveIntensity: 0.18,
    }),
  );
  body.castShadow = true;
  body.scale.setScalar(s);
  body.position.y = 0.32 * s + 0.08;
  g.add(body);
  g.userData.floatPart = body;
  return g;
};

export function Enemy3DPreview({
  color,
  sizePx = 50,
  height = 260,
  className,
}: {
  /** 敵人主色（UnifiedEnemy.color） */
  color: string;
  /** 敵人體型 px（UnifiedEnemy.size），對應遊戲內縮放 */
  sizePx?: number;
  height?: number;
  className?: string;
}) {
  const build = useCallback(
    () => buildEnemyModel(cssToHex(color, 0xef4444), sizePx),
    [color, sizePx],
  );

  return <Model3DPreview buildModel={build} height={height} className={className} />;
}
