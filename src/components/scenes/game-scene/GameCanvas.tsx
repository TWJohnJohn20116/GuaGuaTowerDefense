import { memo, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSkinStore } from '@/store/skinStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDevStore } from '@/store/devStore';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from '@/store/tutorialStore';
import { PATHS, GAME_CONSTANTS } from '@/data/gameData';
import type { Enemy, Tower } from '@/types/game';
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
import { renderStaticLayer } from './GameCanvasStatic';
import { renderDynamicLayer } from './GameCanvasDynamic';

// 游戏画布

/**
 * 靜態層依賴的「塔結構簽章」。
 *
 * 靜態層畫的是地板、射程圈、多選高亮、協同預覽——只跟塔的位置/種類/等級/鎖定狀態有關，
 * 跟 rotation / lastFireTime / target 這些每幀都會變的欄位無關。
 * 但 updateTowers 每幀都產生新的 towers 陣列，直接訂閱陣列會讓靜態層每秒重繪 60 次
 * （等於整張畫面畫兩遍）。這裡改訂閱一個便宜的字串簽章，結構沒變就不重繪。
 */
export const towerLayoutKeySelector = (s: GameStore): string => {
  const towers = s.towers;
  let key = '';
  for (let i = 0; i < towers.length; i++) {
    const t = towers[i];
    key += `${t.id},${t.type},${t.level},${t.upgradePath ?? ''},${t.locked ? 1 : 0},${t.gridPos.col},${t.gridPos.row};`;
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

// 用 memo 包裝：GameCanvas 沒有 props，可有效阻斷父組件 (GameScene) re-render 時的連鎖渲染
// 自身仍會在訂閱的 store 值變動時 re-render，這是預期行為
const GameCanvasImpl = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dynamicCanvasRef = useRef<HTMLCanvasElement>(null);
  const grid = useGameStore((s) => s.grid);
  const selectedPath = useGameStore((s) => s.selectedPath);
  const selectedTowerType = useGameStore((s) => s.selectedTowerType);
  const selectedTower = useGameStore((s) => s.selectedTower);
  const multiSelectedTowerIds = useGameStore((s) => s.multiSelectedTowerIds);
  const hoveredTile = useGameStore((s) => s.hoveredTile);
  // 只訂閱「結構簽章」與「買不買得起」，不訂閱每幀都會換參考的 towers / money
  const towerLayoutKey = useGameStore(towerLayoutKeySelector);
  const canAffordSelected = useGameStore(canAffordSelectedSelector);
  const { t } = useTranslation();
  const placeTower = useGameStore((s) => s.placeTower);
  const selectTower = useGameStore((s) => s.selectTower);
  const setHoveredTile = useGameStore((s) => s.setHoveredTile);
  const showTacticalView = useGameStore((s) => s.showTacticalView);
  const showTowerRange = useSettingsStore((s) => s.visual.showTowerRange);
  const getTowerData = useGetTowerData();
  
  // 皮膚系統
  const getSkinVisuals = useSkinStore((s) => s.getSkinVisuals);
  const getSkinModelSet = useSkinStore((s) => s.getEquippedSkinModelSet);
  
  // 調適工具顯示
  const showGrid = useDevStore((s) => s.showGrid);
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

  // 計算互動教學模式的特定網格目標 (動態尋找一個靠近中央的空格)
  const tutorialActive = useTutorialStore((s) => s.isActive);
  const currentStepIndex = useTutorialStore((s) => s.currentStepIndex);
  
  const tutorialTarget = useMemo(() => {
    if (!tutorialActive) return null;
    const action = INTERACTIVE_TUTORIAL_STEPS[currentStepIndex]?.action;

    // 如果是要選擇已放置的塔：直接從 towers 找（不必再逐格掃描）
    if (action === 'select_placed_tower') {
      const placed = useGameStore.getState().towers;
      const foundTower: Tower | null = placed.find((t) => t.type === 'basic') ?? placed[0] ?? null;
      if (foundTower) {
        return { col: foundTower.gridPos.col, row: foundTower.gridPos.row };
      }
    }

    const centerRow = Math.floor(GAME_CONSTANTS.GRID_ROWS / 2);
    const centerCol = Math.floor(GAME_CONSTANTS.GRID_COLS / 2);
    for (let r = centerRow - 2; r <= centerRow + 2; r++) {
      for (let c = centerCol - 2; c <= centerCol + 2; c++) {
        if (grid[r]?.[c]?.type === 'empty') return { col: c, row: r };
      }
    }
    return { col: 5, row: 5 }; // Fallback
  }, [tutorialActive, grid, currentStepIndex]);
  
  // 計算路徑坐標
  const waypoints = useMemo(() => {
    return PATHS[selectedPath || 'zigzag']?.waypoints || [];
  }, [selectedPath]);
  
  // 計算戰術建議
  const tacticalScores = useMemo(() => {
    if (!showTacticalView || !waypoints.length) return [];
    return calculateTacticalScores({
      grid,
      waypoints,
      tileSize:
        Math.min(
          (dimensions.width - 40) / GAME_CONSTANTS.GRID_COLS,
          (dimensions.height - 40) / GAME_CONSTANTS.GRID_ROWS
        ) || 40,
      selectedTowerType,
      getTowerData,
    });
  }, [showTacticalView, grid, waypoints, dimensions, selectedTowerType, getTowerData]);

  const tileSize = Math.max(0, Math.min(
    (dimensions.width - 40) / GAME_CONSTANTS.GRID_COLS,
    (dimensions.height - 40) / GAME_CONSTANTS.GRID_ROWS
  ));

  const gridWidth = tileSize * GAME_CONSTANTS.GRID_COLS;
  const gridHeight = tileSize * GAME_CONSTANTS.GRID_ROWS;
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

    const UPGRADE_DURATION = 1500;
    const SELL_DURATION = 600;
    const FUSION_DURATION = 1400;
    
    let frameCount = 0;
    let lastTime = performance.now();
    let currentFps = 0;
    
    const loop = () => {
      const now = performance.now();
      frameCount++;
      
      if (now - lastTime >= 1000) {
        currentFps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;
      }
      
      const state = useGameStore.getState();
      
      // 更新動畫狀態
      const activeUpgrade = state.upgradeAnimations.filter(a => Date.now() - a.startTime < UPGRADE_DURATION);
      const activeSell = state.sellAnimations.filter(a => Date.now() - a.startTime < SELL_DURATION);
      const activeFusion = state.fusionAnimations.filter(a => Date.now() - a.startTime < FUSION_DURATION);
      const changed = activeUpgrade.length !== state.upgradeAnimations.length || activeSell.length !== state.sellAnimations.length || activeFusion.length !== state.fusionAnimations.length;
      if (changed) {
        useGameStore.setState({ upgradeAnimations: activeUpgrade, sellAnimations: activeSell, fusionAnimations: activeFusion });
      }

      // 渲染動態層
      renderDynamicLayer(ctx, canvas.width, canvas.height, {
        upgradeAnimations: activeUpgrade,
        sellAnimations: activeSell,
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

  // ===== 靜態層：地板 + 戰術 + 範圍圈（塔身由動態層每幀繪製）=====
  // 依賴全部換成「低頻」值：towers 陣列每幀都會換參考，改看結構簽章 towerLayoutKey；
  // money 每殺一隻就變，改看 canAffordSelected。這樣靜態層只在真的需要時才重繪。
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tileSize) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderStaticLayer(ctx, canvas.width, canvas.height, {
      grid, hoveredTile, selectedTower, selectedTowerType,
      canAffordSelected, tileSize, offsetX, offsetY,
      getSkinVisuals, getTowerData, showTacticalView, tacticalScores, showTowerRange,
      showGrid, showPath, showHitboxes,
      showEnemyPath,
      multiSelectedTowerIds,
      // 繪製當下取最新塔清單（結構變更時本 effect 才會被觸發）
      towers: useGameStore.getState().towers,
    });
    // deps 已列齊實際會變的欄位（含 towerLayoutKey）；towers 由 getState() 當下取，
    // 是為了避免每殺一隻就重繪整層，不是漏列（TD-17 判定：非債）
  }, [grid, hoveredTile, selectedTower, selectedTowerType, canAffordSelected, tileSize, offsetX, offsetY, getSkinVisuals, showTacticalView, tacticalScores, getTowerData, showTowerRange, showGrid, showPath, showHitboxes, showEnemyPath, multiSelectedTowerIds, towerLayoutKey]);



  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
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

    const x = rawX - offsetX;
    const y = rawY - offsetY;

    // 更新滑鼠位置（用於提示框）
    setMousePos({ x: rawX, y: rawY });

    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);

    // 教學模式：游標預覽控制
    if (tutorialActive) {
      const step = useTutorialStore.getState();
      const action = INTERACTIVE_TUTORIAL_STEPS[step.currentStepIndex]?.action;
      if (action === 'place_tower' || action === 'select_placed_tower') {
        if (!tutorialTarget || col !== tutorialTarget.col || row !== tutorialTarget.row) {
          setHoveredTile(null); // 不在目標格子上，不顯示預覽
        } else {
          setHoveredTile({ col, row }); // 在目標格子上，顯示預覽
        }
      } else {
        setHoveredTile(null); // 其他教學步驟，不顯示畫布預覽
      }
    } else {
      // 正常模式
      if (col >= 0 && col < GAME_CONSTANTS.GRID_COLS && row >= 0 && row < GAME_CONSTANTS.GRID_ROWS) {
        setHoveredTile({ col, row });
      } else {
        setHoveredTile(null);
      }
    }
    
    // 檢測滑鼠是否懸浮在敵人上
    let foundEnemy: Enemy | null = null;
    const { enemies } = useGameStore.getState();
    for (const enemy of enemies) {
      const enemyX = offsetX + enemy.x * tileSize + tileSize / 2;
      const enemyY = offsetY + enemy.y * tileSize + tileSize / 2;
      const hitRadius = (enemy.size / 50) * tileSize * 0.4 + 5;
      
      const dx = rawX - enemyX;
      const dy = rawY - enemyY;
      const distSq = dx * dx + dy * dy;
      
      if (distSq <= hitRadius * hitRadius) {
        foundEnemy = enemy;
        break;
      }
    }
    setHoveredEnemy(foundEnemy);
  }, [tileSize, offsetX, offsetY, setHoveredTile]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !tileSize) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - offsetX;
    const y = e.clientY - rect.top - offsetY;

    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);

    if (col >= 0 && col < GAME_CONSTANTS.GRID_COLS && row >= 0 && row < GAME_CONSTANTS.GRID_ROWS) {
      const tile = grid[row]?.[col];
      
      // 教學模式鎖定邏輯
      if (tutorialActive) {
        const step = useTutorialStore.getState();
        const action = INTERACTIVE_TUTORIAL_STEPS[step.currentStepIndex]?.action;
        if (action === 'place_tower' || action === 'select_placed_tower') {
          if (!tutorialTarget || col !== tutorialTarget.col || row !== tutorialTarget.row) {
            return; // 鎖定點擊：只允許點擊目標網格
          }
        } else {
          return; // 教學中其他步驟不允許與畫布互動
        }
      }

      // 融合模式：點擊第二座塔執行合體
      const g = useGameStore.getState();
      const fusionClick = resolveFusionCanvasClick({
        fusionMode: g.fusionMode,
        fusionSourceId: g.fusionSourceId,
        clickedTowerId: tile?.towerId ?? null,
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

      const tileTower = tile?.towerId
        ? g.towers.find((t) => t.id === tile.towerId) ?? null
        : null;
      if (tileTower) {
        const kind = resolveGridTowerClick({
          hasTower: true,
          modifierSelect: e.shiftKey || e.ctrlKey || e.metaKey,
          doubleClick: e.detail === 2,
          canPlace: false,
        });
        if (kind === 'toggle_multi') {
          useGameStore.getState().toggleTowerInMultiSelect(tileTower.id);
        } else if (kind === 'select_type') {
          useGameStore.getState().selectAllTowersOfType(tileTower.type);
        } else {
          selectTower(tileTower);
        }
        useTutorialStore.getState().checkAction('select_placed_tower', 'tutorial-target-specific-grid');
      } else if (selectedTowerType && tile?.type === 'empty') {
        placeTower({ col, row });
        // 因為 setState 非同步，這裡稍微延遲以確保組件拿到最新狀態
        setTimeout(() => {
          useTutorialStore.getState().checkAction('place_tower', 'tutorial-target-specific-grid');
        }, 50);
      } else {
        selectTower(null);
        useGameStore.getState().clearMultiSelect();
      }
    }
  }, [tileSize, offsetX, offsetY, grid, selectedTowerType, placeTower, selectTower, tutorialActive, tutorialTarget]);

  // 右鍵 → 切換塔鎖定/解鎖 (防誤出售)
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !tileSize) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - offsetX;
    const y = e.clientY - rect.top - offsetY;
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    if (col >= 0 && col < GAME_CONSTANTS.GRID_COLS && row >= 0 && row < GAME_CONSTANTS.GRID_ROWS) {
      const tile = grid[row]?.[col];
      if (tile?.towerId) {
        useGameStore.getState().toggleTowerLock(tile.towerId);
      }
    }
  }, [tileSize, offsetX, offsetY, grid]);

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
      const minX = Math.min(marquee.x1, marquee.x2) - offsetX;
      const minY = Math.min(marquee.y1, marquee.y2) - offsetY;
      const maxX = Math.max(marquee.x1, marquee.x2) - offsetX;
      const maxY = Math.max(marquee.y1, marquee.y2) - offsetY;
      const startCol = Math.floor(minX / tileSize);
      const endCol = Math.floor(maxX / tileSize);
      const startRow = Math.floor(minY / tileSize);
      const endRow = Math.floor(maxY / tileSize);
      const ids: string[] = [];
      for (let r = Math.max(0, startRow); r <= Math.min(GAME_CONSTANTS.GRID_ROWS - 1, endRow); r++) {
        for (let c = Math.max(0, startCol); c <= Math.min(GAME_CONSTANTS.GRID_COLS - 1, endCol); c++) {
          const tile = grid[r]?.[c];
          if (tile?.towerId) ids.push(tile.towerId);
        }
      }
      if (ids.length > 0) {
        useGameStore.setState({ multiSelectedTowerIds: ids, selectedTower: null, selectedTowerType: null });
      }
    }
    dragStartRef.current = null;
    setMarquee(null);
  }, [marquee, tileSize, offsetX, offsetY, grid]);

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
      {/* 靜態層：地板 + 塔 */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      />

      {/* 教學模式精確高亮目標區塊 */}
      {tutorialActive && tutorialTarget && (
        <div
          id="tutorial-target-specific-grid"
          className="absolute z-[99] pointer-events-none"
          style={{
            left: offsetX + tutorialTarget.col * tileSize,
            top: offsetY + tutorialTarget.row * tileSize,
            width: tileSize,
            height: tileSize,
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
          setHoveredTile(null);
          setHoveredEnemy(null);
          if (dragStartRef.current) {
            dragStartRef.current = null;
            setMarquee(null);
          }
        }}
      />
      {marquee && (
        <div
          className="pointer-events-none absolute border border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]"
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
