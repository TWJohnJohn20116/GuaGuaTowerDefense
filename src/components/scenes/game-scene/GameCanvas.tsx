import { memo, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSkinStore } from '@/store/skinStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDevStore } from '@/store/devStore';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from '@/store/tutorialStore';
import type { Enemy, MapPoint, Tower } from '@/types/game';
import type { GameStore } from '@/store/gameStoreTypes';
import { getTowerData as getTowerDataRaw } from '@/store/gameStoreUtils';
import { calculateTacticalScores } from '@/components/game/TacticalUtils';
import { useGetTowerData } from '@/components/game/hooks';
import { useTranslation } from '@/i18n';
import { FloatingTowerPanel } from '@/components/game/FloatingTowerPanel';
import { FusionModeBanner } from '@/components/game/FusionModeBanner';
import { MultiSelectPanel } from '@/components/game/MultiSelectPanel';
import { BossWarning } from '@/components/game/BossWarning';
import { EnemyTooltip } from '@/components/game/EnemyTooltip';
import { resolveFusionCanvasClick } from '@/data/fusionCanvasClick';
import { resolveGridTowerClick } from '@/data/gridTowerClick';
import { resolveCanvasShakeIntensity, visibleDamageTexts } from '@/data/hudVisualVisibility';
import { createRenderSnapshot, writeRenderSnapshot } from '@/data/renderSnapshot';
import { createFrameLoopGuard } from '@/utils/frameLoopGuard';
import {
  DEFAULT_TOWER_RADIUS,
  boundsOf,
  circlesOverlap,
  isInsideBounds,
} from '@/data/mapGeometry';
import { renderStaticLayer } from './GameCanvasStatic';
import { renderDynamicLayer } from './GameCanvasDynamic';

// 游戏画布

/**
 * 靜態層依賴的「塔結構簽章」。
 *
 * 靜態層畫的是場地、射程圈、多選高亮、協同預覽——只跟塔的位置/種類/等級/鎖定狀態有關，
 * 跟 rotation / lastFireTime / target 這些每幀都會變的欄位無關。
 * 但 updateTowers 每幀都產生新的 towers 陣列，直接訂閱陣列會讓靜態層每秒重繪 60 次
 * （等於整張畫面畫兩遍）。這裡改訂閱一個便宜的字串簽章，結構沒變就不重繪。
 */
export const towerLayoutKeySelector = (s: GameStore): string => {
  const towers = s.towers;
  let key = '';
  for (let i = 0; i < towers.length; i++) {
    const t = towers[i];
    key += `${t.id},${t.type},${t.level},${t.upgradePath ?? ''},${t.locked ? 1 : 0},${t.pos.x},${t.pos.y};`;
  }
  return key;
};

/**
 * 放置預覽只需要知道「買不買得起」，不需要金額本身（金額每殺一隻就變一次）。
 * 回傳布林 → 只有跨過門檻時才觸發靜態層重繪。
 */
export const canAffordSelectedSelector = (s: GameStore): boolean => {
  if (!s.selectedTowerType) return false;
  const cost = getTowerDataRaw(s.selectedTowerType)?.cost ?? 0;
  return s.money >= cost;
};

/** 指標落在哪座塔上（圓形命中，容忍度略大於塔半徑，避免小塔很難點） */
const findTowerAt = (towers: Tower[], point: MapPoint): Tower | null => {
  for (const tower of towers) {
    if (circlesOverlap(point, tower.radius + 0.08, tower.pos, 0)) return tower;
  }
  return null;
};

// 用 memo 包裝：GameCanvas 沒有 props，可有效阻斷父組件 (GameScene) re-render 時的連鎖渲染
// 自身仍會在訂閱的 store 值變動時 re-render，這是預期行為
const GameCanvasImpl = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dynamicCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeMap = useGameStore((s) => s.activeMap);
  const selectedTowerType = useGameStore((s) => s.selectedTowerType);
  const selectedTower = useGameStore((s) => s.selectedTower);
  const multiSelectedTowerIds = useGameStore((s) => s.multiSelectedTowerIds);
  const hoverPoint = useGameStore((s) => s.hoverPoint);
  // 只訂閱「結構簽章」與「買不買得起」，不訂閱每幀都會換參考的 towers / money
  const towerLayoutKey = useGameStore(towerLayoutKeySelector);
  const canAffordSelected = useGameStore(canAffordSelectedSelector);
  const { t } = useTranslation();
  const placeTower = useGameStore((s) => s.placeTower);
  const selectTower = useGameStore((s) => s.selectTower);
  const setHoverPoint = useGameStore((s) => s.setHoverPoint);
  const showTacticalView = useGameStore((s) => s.showTacticalView);
  const showTowerRange = useSettingsStore((s) => s.visual.showTowerRange);
  const getTowerData = useGetTowerData();

  // 皮膚系統
  const getSkinVisuals = useSkinStore((s) => s.getSkinVisuals);
  const getSkinModelSet = useSkinStore((s) => s.getEquippedSkinModelSet);

  // 調適工具顯示（格線已移除，showGrid 不再有作用）
  const showPath = useDevStore((s) => s.showPath);
  const showHitboxes = useDevStore((s) => s.showHitboxes);
  const showEnemyPath = useSettingsStore((s) => s.gameplay.showEnemyPath);
  const screenShake = useSettingsStore((s) => s.visual.screenShake);

  // 畫面震動
  const shakeIntensity = useGameStore((s) => s.shakeIntensity);

  // 動畫系統
  const animFrameRef = useRef<number>(0);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredEnemy, setHoveredEnemy] = useState<Enemy | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 地圖尺寸（自由制：每張圖可以有自己的 bounds，不再固定 15×11）
  const bounds = boundsOf(activeMap);

  // 計算互動教學模式的目標位置（找一個靠近中央的可建造點）
  const tutorialActive = useTutorialStore((s) => s.isActive);
  const currentStepIndex = useTutorialStore((s) => s.currentStepIndex);

  const tutorialTarget = useMemo<MapPoint | null>(() => {
    if (!tutorialActive) return null;
    const action = INTERACTIVE_TUTORIAL_STEPS[currentStepIndex]?.action;

    // 如果是要選擇已放置的塔：直接從 towers 找
    if (action === 'select_placed_tower') {
      const placed = useGameStore.getState().towers;
      const foundTower: Tower | null = placed.find((tw) => tw.type === 'basic') ?? placed[0] ?? null;
      if (foundTower) return { x: foundTower.pos.x, y: foundTower.pos.y };
    }

    return { x: Math.round(bounds.width / 2), y: Math.round(bounds.height / 2) };
  }, [tutorialActive, currentStepIndex, bounds.width, bounds.height]);

  // 計算戰術建議
  const tacticalScores = useMemo(() => {
    if (!showTacticalView || !activeMap) return [];
    return calculateTacticalScores({
      path: activeMap,
      towers: useGameStore.getState().towers,
      selectedTowerType,
      getTowerData,
    });
  }, [showTacticalView, activeMap, selectedTowerType, getTowerData]);

  // 四周各留半格：路徑帶的圓角端點半徑約 0.45 格，留 0.5 格才不會頂到場地邊緣
  // （之前用固定 40px 邊距，格很大時路徑帶會貼邊，看起來像被裁切）
  const tileSize = Math.max(0, Math.min(
    dimensions.width / (bounds.width + 1),
    dimensions.height / (bounds.height + 1)
  ));

  const gridWidth = tileSize * bounds.width;
  const gridHeight = tileSize * bounds.height;
  const offsetX = (dimensions.width - gridWidth) / 2;
  const offsetY = (dimensions.height - gridHeight) / 2;

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();

    // 使用 ResizeObserver 確保在容器大小改變時也能更新
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  // 動畫與渲染迴圈
  useEffect(() => {
    const canvas = dynamicCanvasRef.current;
    if (!canvas || !tileSize) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 渲染 snapshot 緩衝：與 3D 視圖共用同一份純函式契約，只建立一次、逐幀原地寫入
    const snapshot = createRenderSnapshot();
    const frameGuard = createFrameLoopGuard({ label: '2d-canvas' });

    let frameCount = 0;
    let lastTime = performance.now();
    let currentFps = 0;

    const drawFrame = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        currentFps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;
      }

      const state = useGameStore.getState();
      // 這一幀的實體視覺資料：寫一次，2D 圖層與（切到 3D 時）3D 實例池吃同一份契約
      writeRenderSnapshot(state, snapshot, Date.now());

      // 升級 / 出售 / 融合的過期清理已搬回 store（updateVisualEffects 是唯一擁有者），
      // 繪製層只負責畫；避免 2D 與 3D 互相清掉對方還沒播完的動畫。

      // 渲染動態層
      renderDynamicLayer(ctx, canvas.width, canvas.height, {
        snapshot,
        upgradeAnimations: state.upgradeAnimations,
        sellAnimations: state.sellAnimations,
        playerSkillAnimations: state.playerSkillAnimations,
        towers: state.towers,
        enemies: state.enemies,
        projectiles: state.projectiles,
        damageTexts: visibleDamageTexts(state.damageTexts, useSettingsStore.getState().visual.showDamageNumbers),
        impactParticles: state.impactParticles,
        deathAnimations: state.deathAnimations,
        fusionAnimations: state.fusionAnimations,
        tileSize, offsetX, offsetY, getSkinVisuals, getSkinModelSet,
        showDebugInfo: useDevStore.getState().showDebugInfo,
        showHitboxes: useDevStore.getState().showHitboxes,
        showHealthBars: useSettingsStore.getState().visual.showHealthBars,
        showFPS: useDevStore.getState().showFPS,
        fps: currentFps,
        fusionBurstLabel: t.towers.fusion.burst,
        maxLevelLabel: t.towers.maxLevel,
      });
    };

    // 單幀異常只掉一幀：guard 接住並節流上報，不會讓繪製層安靜停住（§4.5）
    const loop = () => {
      frameGuard.run(drawFrame);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = 0;
      }
    };
  }, [tileSize, offsetX, offsetY, getSkinVisuals, getSkinModelSet, t]);

  // ===== 靜態層：場地 + 戰術 + 範圍圈（塔身由動態層每幀繪製）=====
  // 依賴全部換成「低頻」值：towers 陣列每幀都會換參考，改看結構簽章 towerLayoutKey；
  // money 每殺一隻就變，改看 canAffordSelected。這樣靜態層只在真的需要時才重繪。
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tileSize) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderStaticLayer(ctx, canvas.width, canvas.height, {
      map: activeMap, hoverPoint, selectedTower, selectedTowerType,
      canAffordSelected, tileSize, offsetX, offsetY,
      getSkinVisuals, getTowerData, showTacticalView, tacticalScores, showTowerRange,
      showPath: showPath || showEnemyPath, showHitboxes,
      multiSelectedTowerIds,
      // 繪製當下取最新塔清單（結構變更時本 effect 才會被觸發）
      towers: useGameStore.getState().towers,
    });
    // deps 已列齊實際會變的欄位（含 towerLayoutKey）；towers 由 getState() 當下取，
    // 是為了避免每殺一隻就重繪整層，不是漏列（TD-17 判定：非債）
  }, [activeMap, hoverPoint, selectedTower, selectedTowerType, canAffordSelected, tileSize, offsetX, offsetY, getSkinVisuals, showTacticalView, tacticalScores, getTowerData, showTowerRange, showPath, showHitboxes, showEnemyPath, multiSelectedTowerIds, towerLayoutKey]);

  /** 畫布像素 → 世界座標（格單位，連續；不取整） */
  const toWorldPoint = useCallback((clientX: number, clientY: number, rect: DOMRect): MapPoint => {
    return {
      x: (clientX - rect.left - offsetX) / tileSize,
      y: (clientY - rect.top - offsetY) / tileSize,
    };
  }, [offsetX, offsetY, tileSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = dynamicCanvasRef.current;
    if (!canvas || !tileSize) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // 更新拖拽矩形
    if (dragStartRef.current) {
      setMarquee({
        x1: dragStartRef.current.x,
        y1: dragStartRef.current.y,
        x2: rawX,
        y2: rawY,
      });
    }

    // 更新滑鼠位置（用於提示框）
    setMousePos({ x: rawX, y: rawY });

    const point = toWorldPoint(e.clientX, e.clientY, rect);

    // 教學模式：游標預覽控制
    if (tutorialActive) {
      const step = useTutorialStore.getState();
      const action = INTERACTIVE_TUTORIAL_STEPS[step.currentStepIndex]?.action;
      if (action === 'place_tower' || action === 'select_placed_tower') {
        if (!tutorialTarget || Math.hypot(point.x - tutorialTarget.x, point.y - tutorialTarget.y) > 0.6) {
          setHoverPoint(null); // 不在目標附近，不顯示預覽
        } else {
          setHoverPoint(point);
        }
      } else {
        setHoverPoint(null); // 其他教學步驟，不顯示畫布預覽
      }
    } else {
      // 正常模式
      if (isInsideBounds(activeMap, point)) {
        setHoverPoint(point);
      } else {
        setHoverPoint(null);
      }
    }

    // 敵人懸停偵測
    const state = useGameStore.getState();
    const x = rawX - offsetX;
    const y = rawY - offsetY;
    let foundEnemy: Enemy | null = null;
    const hitRadius = Math.max(tileSize * 0.4, 12);
    for (const enemy of state.enemies) {
      const ex = offsetX + enemy.x * tileSize + tileSize / 2;
      const ey = offsetY + enemy.y * tileSize + tileSize / 2;
      const dx = x - ex;
      const dy = y - ey;
      const distSq = dx * dx + dy * dy;

      if (distSq <= hitRadius * hitRadius) {
        foundEnemy = enemy;
        break;
      }
    }
    setHoveredEnemy(foundEnemy);
  }, [tileSize, offsetX, offsetY, activeMap, tutorialActive, tutorialTarget, setHoverPoint, toWorldPoint]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !tileSize) return;

    const rect = canvas.getBoundingClientRect();
    const point = toWorldPoint(e.clientX, e.clientY, rect);

    if (!isInsideBounds(activeMap, point)) return;

    // 教學模式鎖定邏輯
    if (tutorialActive) {
      const step = useTutorialStore.getState();
      const action = INTERACTIVE_TUTORIAL_STEPS[step.currentStepIndex]?.action;
      if (action === 'place_tower' || action === 'select_placed_tower') {
        if (!tutorialTarget || Math.hypot(point.x - tutorialTarget.x, point.y - tutorialTarget.y) > 0.6) {
          return; // 鎖定點擊：只允許點擊目標附近
        }
      } else {
        return; // 教學中其他步驟不允許與畫布互動
      }
    }

    const g = useGameStore.getState();
    const hitTower = findTowerAt(g.towers, point);

    // 融合模式：點擊第二座塔執行合體
    const fusionClick = resolveFusionCanvasClick({
      fusionMode: g.fusionMode,
      fusionSourceId: g.fusionSourceId,
      clickedTowerId: hitTower?.id ?? null,
    });
    if (fusionClick.kind === 'fuse') {
      g.fuseTowers(fusionClick.sourceId, fusionClick.targetId);
      return;
    }
    if (fusionClick.kind === 'cancel') {
      g.cancelFusion();
      return;
    }
    if (g.fusionMode) return;

    if (hitTower) {
      const kind = resolveGridTowerClick({
        hasTower: true,
        modifierSelect: e.shiftKey || e.ctrlKey || e.metaKey,
        doubleClick: e.detail === 2,
        canPlace: false,
      });
      if (kind === 'toggle_multi') {
        g.toggleTowerInMultiSelect(hitTower.id);
      } else if (kind === 'select_type') {
        g.selectAllTowersOfType(hitTower.type);
      } else {
        selectTower(hitTower);
      }
      useTutorialStore.getState().checkAction('select_placed_tower', 'tutorial-target-specific-grid');
    } else if (selectedTowerType) {
      placeTower(point);
      // 因為 setState 非同步，這裡稍微延遲以確保組件拿到最新狀態
      setTimeout(() => {
        useTutorialStore.getState().checkAction('place_tower', 'tutorial-target-specific-grid');
      }, 50);
    } else {
      selectTower(null);
      useGameStore.getState().clearMultiSelect();
    }
  }, [tileSize, offsetX, offsetY, activeMap, selectedTowerType, placeTower, selectTower, tutorialActive, tutorialTarget, toWorldPoint]);

  // 右鍵 → 切換塔鎖定/解鎖 (防誤出售)
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !tileSize) return;
    const rect = canvas.getBoundingClientRect();
    const point = toWorldPoint(e.clientX, e.clientY, rect);
    const hitTower = findTowerAt(useGameStore.getState().towers, point);
    if (hitTower) useGameStore.getState().toggleTowerLock(hitTower.id);
  }, [tileSize, toWorldPoint]);

  // 拖拽矩形多選 (Ctrl+拖)
  // （Ctrl+A 全選 / Esc 取消多選的快捷鍵已上移至 GameScene，2D/3D 視圖共用）
  const [marquee, setMarquee] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setMarquee({
      x1: dragStartRef.current.x,
      y1: dragStartRef.current.y,
      x2: dragStartRef.current.x,
      y2: dragStartRef.current.y,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (marquee && tileSize) {
      // 框選改成世界座標：直接比對塔的圓心落在矩形內
      const minX = (Math.min(marquee.x1, marquee.x2) - offsetX) / tileSize;
      const minY = (Math.min(marquee.y1, marquee.y2) - offsetY) / tileSize;
      const maxX = (Math.max(marquee.x1, marquee.x2) - offsetX) / tileSize;
      const maxY = (Math.max(marquee.y1, marquee.y2) - offsetY) / tileSize;
      const ids = useGameStore.getState().towers
        .filter((tw) => tw.pos.x >= minX && tw.pos.x <= maxX && tw.pos.y >= minY && tw.pos.y <= maxY)
        .map((tw) => tw.id);
      if (ids.length > 0) {
        useGameStore.setState({ multiSelectedTowerIds: ids, selectedTower: null, selectedTowerType: null });
      }
    }
    dragStartRef.current = null;
    setMarquee(null);
  }, [marquee, tileSize, offsetX, offsetY]);

  // 計算震動偏移
  const appliedShake = resolveCanvasShakeIntensity(shakeIntensity, screenShake);
  const shaking = appliedShake > 0;
  const shakeX = shaking ? (Math.random() - 0.5) * appliedShake * 2 : 0;
  const shakeY = shaking ? (Math.random() - 0.5) * appliedShake * 2 : 0;

  return (
    <div 
      id="tutorial-target-grid"
      ref={containerRef} 
      className="w-full h-full relative"
      style={{
        transform: shaking ? `translate(${shakeX}px, ${shakeY}px)` : 'none'
      }}
    >
      {/* 靜態層：場地 + 路徑帶 */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      />

      {/* 教學模式精確高亮目標區塊（圓形，對應塔的佔位半徑） */}
      {tutorialActive && tutorialTarget && (
        <div
          id="tutorial-target-specific-grid"
          className="absolute z-[99] pointer-events-none rounded-full"
          style={{
            left: offsetX + (tutorialTarget.x - DEFAULT_TOWER_RADIUS) * tileSize,
            top: offsetY + (tutorialTarget.y - DEFAULT_TOWER_RADIUS) * tileSize,
            width: DEFAULT_TOWER_RADIUS * 2 * tileSize,
            height: DEFAULT_TOWER_RADIUS * 2 * tileSize,
          }}
        />
      )}

      {/* 動態層：敵人 + 子彈 + 動畫（接收滑鼠事件）*/}
      <canvas
        ref={dynamicCanvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoverPoint(null);
          setHoveredEnemy(null);
          if (dragStartRef.current) {
            dragStartRef.current = null;
            setMarquee(null);
          }
        }}
      />
      {marquee && (
        <div
          className="pointer-events-none absolute border border-[var(--arc-gold)] bg-[var(--arc-gold-veil)]"
          style={{
            left: Math.min(marquee.x1, marquee.x2),
            top: Math.min(marquee.y1, marquee.y2),
            width: Math.abs(marquee.x2 - marquee.x1),
            height: Math.abs(marquee.y2 - marquee.y1),
          }}
        />
      )}
      {/* 敵人提示框 */}
      <AnimatePresence>
        {hoveredEnemy && (
          <EnemyTooltip enemy={hoveredEnemy} x={mousePos.x} y={mousePos.y} />
        )}
      </AnimatePresence>
      <FusionModeBanner />
      {/* 浮動塔升級面板 */}
      <FloatingTowerPanel 
        tileSize={tileSize} 
        offsetX={offsetX} 
        offsetY={offsetY} 
      />
      {/* 群選批次操作面板 */}
      <MultiSelectPanel />
      {/* Boss 警告遮層 */}
      <BossWarning />
    </div>
  );
};

export const GameCanvas = memo(GameCanvasImpl);
