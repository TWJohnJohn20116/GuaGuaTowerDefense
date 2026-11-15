import { memo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import type { HudUiScale } from '@/store/settingsStore';
import { TopStatsBar } from './sidebar/TopStatsBar';
import { BottomControls } from './sidebar/BottomControls';
import { TowerPanel } from './sidebar/TowerPanel';
import { IntelPanel } from './IntelPanel';
import { BD_LABEL, BD_PANEL } from './hudBoard';
import { ChevronUpIcon } from '@/components/ui/Icons';
import { ViewModeToggle } from '@/components/scenes/game-scene/three/ViewModeToggle';
import { HUD_BAND_HEIGHT } from './sidebar/hudStyle';

/**
 * 戰鬥 HUD — 四段棋盤佈局
 *
 *   上：狀態帶（生命／金錢／波次／分數）
 *   左：塔輪盤（分類 → 塔格 → 工具列）
 *   右：戰場資訊（波次進度、在場單位、選中單位、自動戰鬥）
 *   下：指揮帶（開始波次、跳波、速度、技能、暫停、離開）
 *
 * 所有面板都是棋盤的一塊：--bd-tile 底、--bd-line 線、3px 圓角、0 2px 0 硬投影。
 * 塔輪盤與資訊欄的左右位置仍由 hudLayout.towerPanel 決定（預設 left）。
 */

const SCALE_VALUE: Record<HudUiScale, number> = {
  compact: 0.9,
  normal: 1,
  large: 1.12,
};

/** 與視窗邊的間距 */
const EDGE = 12;
/** 儀表帶與側欄之間的縫（對應格子的 1.5px 縫，取整為 3px） */
const GAP = 3;
/** 單欄塔輪盤寬度；欄數由 hudLayout.towerListColumns 決定 */
const RAIL_UNIT = 84;
/** 右側資訊欄寬度 */
const INTEL_WIDTH = 264;
/** 折疊後的豎條寬度 */
const COLLAPSED_WIDTH = 30;

interface SidebarProps {
  /** 2D / 3D 視圖模式；不傳＝不顯示切換鍵（教學模式） */
  viewMode?: '2d' | '3d';
  onToggleView?: () => void;
}

const SidebarImpl = ({ viewMode, onToggleView }: SidebarProps) => {
  const { t } = useTranslation();
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const [towersCollapsed, setTowersCollapsed] = useState(false);
  const hudLayout = useSettingsStore((s) => s.hudLayout);

  const railOnLeft = hudLayout.towerPanel === 'left';
  const scale = SCALE_VALUE[hudLayout.uiScale];
  const railWidth = RAIL_UNIT * hudLayout.towerListColumns;
  /** 側欄上緣＝邊距＋帶高＋縫；下緣對稱 */
  const railEdge = EDGE + HUD_BAND_HEIGHT + GAP;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" style={{ opacity: hudLayout.opacity }}>
      {/* ============ 上：狀態帶 ============ */}
      {hudLayout.showStatsBar && (
        <div
          className={`pointer-events-auto absolute left-3 right-3 flex items-stretch overflow-hidden ${BD_PANEL}`}
          style={{ top: EDGE, height: HUD_BAND_HEIGHT }}
        >
          {viewMode && onToggleView && (
            <div className="flex items-center border-r border-[var(--bd-line)] px-1">
              <ViewModeToggle mode={viewMode} onToggle={onToggleView} />
            </div>
          )}
          <div className="flex min-w-0 flex-1 items-stretch">
            <AnimatePresence initial={false}>
              {!statsCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex min-w-0 items-stretch"
                >
                  <TopStatsBar />
                </motion.div>
              )}
            </AnimatePresence>
            {statsCollapsed && (
              <span className={`${BD_LABEL} self-center px-3`}>{t.game.statsOverview}</span>
            )}
          </div>
          <button
            type="button"
            aria-label={statsCollapsed ? t.game.expandStatsBar : t.game.collapseStatsBar}
            aria-expanded={!statsCollapsed}
            onClick={() => setStatsCollapsed((v) => !v)}
            className="flex w-9 shrink-0 items-center justify-center text-[var(--bd-ink-3)] transition-colors duration-100 hover:bg-[var(--bd-tile-2)] hover:text-[var(--bd-ink)]"
          >
            <ChevronUpIcon className={`h-4 w-4 transition-transform duration-200 ${statsCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* ============ 左：塔輪盤 ============ */}
      {hudLayout.showTowerPanel && (
        <div
          className="pointer-events-auto absolute flex flex-col"
          style={{
            top: railEdge,
            bottom: railEdge,
            left: railOnLeft ? EDGE : undefined,
            right: railOnLeft ? undefined : EDGE,
            width: towersCollapsed ? COLLAPSED_WIDTH : railWidth,
            transform: `scale(${scale})`,
            transformOrigin: railOnLeft ? 'top left' : 'top right',
          }}
        >
          <AnimatePresence initial={false}>
            {!towersCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: railOnLeft ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: railOnLeft ? -12 : 12 }}
                transition={{ duration: 0.16 }}
                className="flex min-h-0 flex-1"
              >
                <div className={`flex min-h-0 w-full flex-col overflow-hidden ${BD_PANEL}`}>
                  <TowerPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            aria-label={towersCollapsed ? t.game.expandTowerPanel : t.game.collapseTowerPanel}
            aria-expanded={!towersCollapsed}
            onClick={() => setTowersCollapsed((v) => !v)}
            className={`flex shrink-0 items-center justify-center border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] text-[11px] font-extrabold text-[var(--cn-ink-3)] shadow-[0_4px_0_var(--cn-line)] transition-colors duration-100 hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)] ${
              towersCollapsed ? 'h-full rounded-[var(--cn-r-sm)]' : 'mt-1.5 h-7 rounded-[var(--cn-r-sm)]'
            }`}
          >
            <span className={`transition-transform duration-200 ${towersCollapsed ? '-rotate-90' : 'rotate-90'}`}>▶</span>
          </button>
        </div>
      )}

      {/* ============ 右：戰場資訊（窄版隱藏，避免與輪盤擠壓） ============ */}
      {hudLayout.showIntelPanel && (
        <div
          className={`pointer-events-auto absolute hidden flex-col overflow-hidden md:flex ${BD_PANEL}`}
          style={{
            top: railEdge,
            bottom: railEdge,
            left: railOnLeft ? undefined : EDGE,
            right: railOnLeft ? EDGE : undefined,
            width: INTEL_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: railOnLeft ? 'top right' : 'top left',
          }}
        >
          <IntelPanel />
        </div>
      )}

      {/* ============ 下：指揮帶 ============ */}
      {hudLayout.showBottomControls && (
        <div
          className={`pointer-events-auto absolute left-3 right-3 flex items-stretch overflow-hidden ${BD_PANEL}`}
          style={{ bottom: EDGE, height: HUD_BAND_HEIGHT }}
        >
          <BottomControls />
        </div>
      )}
    </div>
  );
};

export const Sidebar = memo(SidebarImpl);
