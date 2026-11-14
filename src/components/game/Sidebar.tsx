import { memo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import type { HudHorizontalPosition, HudUiScale } from '@/store/settingsStore';
import { TopStatsBar } from './sidebar/TopStatsBar';
import { BottomControls } from './sidebar/BottomControls';
import { TowerPanel } from './sidebar/TowerPanel';
import { Deck } from '@/components/hl';
import { ChevronUpIcon } from '@/components/ui/Icons';
import { HUD_BAND_HEIGHT } from './sidebar/hudStyle';

const HORIZONTAL_TO_JUSTIFY: Record<HudHorizontalPosition, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const SCALE_VALUE: Record<HudUiScale, number> = {
  compact: 0.9,
  normal: 1,
  large: 1.12,
};

/**
 * Theater HUD — 上下兩條 h-11 儀表帶 + 右側浮動塔塢。
 * 儀表帶用 1px 分隔線切成方塊格，每格＝mono 標籤 + mono 數值。
 * 塔塢是一張浮在畫布上的 Deck，不佔版面。
 */
const SidebarImpl = () => {
  const { t } = useTranslation();
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const [towersCollapsed, setTowersCollapsed] = useState(false);
  const hudLayout = useSettingsStore((s) => s.hudLayout);

  const towerOnLeft = hudLayout.towerPanel === 'left';
  const scale = SCALE_VALUE[hudLayout.uiScale];
  const opacity = hudLayout.opacity;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" style={{ opacity }}>
      {/* ============ 上儀表帶 ============ */}
      {hudLayout.showStatsBar && (
        <div
          className="pointer-events-auto absolute inset-x-0 top-0 flex items-stretch border-b border-[var(--hl-line)] bg-[var(--hl-void-2)]"
          style={{ height: HUD_BAND_HEIGHT }}
        >
          <div className={`flex min-w-0 flex-1 items-stretch ${HORIZONTAL_TO_JUSTIFY[hudLayout.statsBar]}`}>
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
              <span className="hl-label self-center px-3">{t.game.statsOverview}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setStatsCollapsed(!statsCollapsed)}
            className="flex w-9 shrink-0 items-center justify-center border-l border-[var(--hl-line)] text-[var(--hl-ink-3)] transition-colors hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]"
            title={statsCollapsed ? t.game.expandStatsBar : t.game.collapseStatsBar}
            aria-expanded={!statsCollapsed}
          >
            <ChevronUpIcon
              className={`h-3.5 w-3.5 transition-transform duration-200 ${statsCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}

      {/* ============ 右側浮動塔塢（Deck，絕對定位，不佔版面） ============ */}
      {hudLayout.showTowerPanel && (
        <div
          className={[
            'pointer-events-none absolute top-11 bottom-11 flex items-stretch gap-0',
            towerOnLeft ? 'left-0' : 'right-0',
          ].join(' ')}
          style={{ transform: `scale(${scale})`, transformOrigin: towerOnLeft ? 'top left' : 'top right' }}
        >
          <AnimatePresence initial={false}>
            {!towersCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: towerOnLeft ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: towerOnLeft ? -16 : 16 }}
                transition={{ duration: 0.16 }}
                className="pointer-events-auto flex min-h-0"
              >
                <Deck
                  notch
                  className="flex max-h-full min-h-0 w-[300px] flex-col overflow-hidden"
                >
                  <TowerPanel />
                </Deck>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setTowersCollapsed(!towersCollapsed)}
            className="pointer-events-auto flex w-6 shrink-0 flex-col items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-deck-2)] font-mono text-[10px] text-[var(--hl-ink-3)] transition-colors hover:bg-[var(--hl-deck-3)] hover:text-[var(--hl-ink)]"
            title={towersCollapsed ? t.game.expandTowerPanel : t.game.collapseTowerPanel}
            aria-expanded={!towersCollapsed}
          >
            <span
              className={`transition-transform duration-200 ${
                towersCollapsed
                  ? towerOnLeft ? 'rotate-0' : 'rotate-180'
                  : towerOnLeft ? 'rotate-180' : 'rotate-0'
              }`}
            >
              ▶
            </span>
          </button>
        </div>
      )}

      {/* ============ 下儀表帶 ============ */}
      {hudLayout.showBottomControls && (
        <div
          className="pointer-events-auto absolute inset-x-0 bottom-0 flex items-stretch border-t border-[var(--hl-line)] bg-[var(--hl-void-2)]"
          style={{ height: HUD_BAND_HEIGHT }}
        >
          <div className={`flex min-w-0 flex-1 items-stretch ${HORIZONTAL_TO_JUSTIFY[hudLayout.bottomControls]}`}>
            <BottomControls />
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar = memo(SidebarImpl);
