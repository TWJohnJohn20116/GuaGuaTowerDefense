import { memo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import type { HudHorizontalPosition, HudUiScale } from '@/store/settingsStore';
import { TopStatsBar } from './sidebar/TopStatsBar';
import { BottomControls } from './sidebar/BottomControls';
import { TowerPanel } from './sidebar/TowerPanel';
import { Deck, IconBtn } from '@/components/hl';
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

/** 儀表帶外框：浮動白卡 + 3px 墨線 + 貼紙投影 */
const BAND =
  'pointer-events-auto absolute inset-x-3 flex items-stretch rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_4px_0_-1px_rgba(46,36,64,0.18)]';

/**
 * 戰鬥 HUD — 上下兩條浮動儀表帶 + 右側浮動塔塢卡片。
 * 儀表帶是圓角白卡（不再貼邊），塔塢是一張獨立卡片，不佔版面。
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
        <div className={`${BAND} top-3`} style={{ height: HUD_BAND_HEIGHT }}>
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
              <span className="arc-label self-center px-3">{t.game.statsOverview}</span>
            )}
          </div>

          <IconBtn
            label={statsCollapsed ? t.game.expandStatsBar : t.game.collapseStatsBar}
            onClick={() => setStatsCollapsed(!statsCollapsed)}
            className="my-1 mr-1 flex w-9 shrink-0 items-center justify-center rounded-[12px] text-[var(--cn-ink-3)] transition-colors hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]"
            aria-expanded={!statsCollapsed}
          >
            <ChevronUpIcon
              className={`h-4 w-4 transition-transform duration-200 ${statsCollapsed ? 'rotate-180' : ''}`}
            />
          </IconBtn>
        </div>
      )}

      {/* ============ 右側浮動塔塢（卡片，絕對定位，不佔版面） ============ */}
      {hudLayout.showTowerPanel && (
        <div
          className={[
            'pointer-events-none absolute bottom-16 top-16 flex items-stretch gap-2',
            towerOnLeft ? 'left-3' : 'right-3',
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
            className="pointer-events-auto flex w-8 shrink-0 flex-col items-center justify-center rounded-[var(--cn-r-sm)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] text-[11px] font-extrabold text-[var(--cn-ink-3)] shadow-[0_4px_0_-1px_rgba(46,36,64,0.18)] transition-colors hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]"
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
        <div className={`${BAND} bottom-3`} style={{ height: HUD_BAND_HEIGHT }}>
          <div className={`flex min-w-0 flex-1 items-stretch ${HORIZONTAL_TO_JUSTIFY[hudLayout.bottomControls]}`}>
            <BottomControls />
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar = memo(SidebarImpl);
