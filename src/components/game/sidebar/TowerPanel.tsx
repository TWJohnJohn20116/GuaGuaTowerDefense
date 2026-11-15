import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FADE_OUT, SPRING_SOFT, STAGGER_STEP } from '@/utils/motionTokens';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from '@/store/tutorialStore';
import { useModStore } from '@/store/modStore';
import { useSettingsStore } from '@/store/settingsStore';
import { TOWER_DATA } from '@/data/gameData';
import { useTranslation } from '@/i18n';
import type { TowerType } from '@/types/game';
import { TowerButton } from '../TowerButton';
import type { GameTowerData } from '../types';
import {
  TargetIcon,
  RobotIcon, GearIcon, UndoIcon, RedoIcon, PinIcon,
} from '@/components/ui/Icons';
import { AdvancedOptionsPanel } from './AdvancedOptionsPanel';
import { canRedoPlacement, canUndoPlacement } from '@/store/placementHistory';
import { BD_LABEL, BD_SHEET } from '../hudBoard';

/**
 * 左側塔輪盤（棋盤語彙）
 *
 * 分類是直排三列小標籤，塔格是單欄的棋盤格（列數仍由 hudLayout.towerListColumns 決定），
 * 底部是工具列（快速放置／戰術視圖／撤銷／重做／自動戰鬥／更多）。
 * 技能條暫時仍掛在這裡，下一步移到下方指揮帶。
 */

const BASIC_TOWER_TYPES: TowerType[] = ['basic', 'sniper', 'cannon', 'machine', 'shotgun', 'ballista'];
const SPECIAL_TOWER_TYPES: TowerType[] = ['frost', 'poison', 'laser', 'lightning', 'flame', 'money', 'wind', 'pulse'];
const ALL_BASE_TOWER_TYPES: TowerType[] = [
  'basic', 'sniper', 'cannon', 'machine', 'shotgun', 'ballista',
  'frost', 'poison', 'laser', 'lightning', 'flame', 'money', 'wind', 'pulse',
];

/** 工具列圖示鍵：棋盤格，選中＝路徑導引色 */
const TOOL_BTN =
  'flex h-8 w-full items-center justify-center rounded-[10px] border-[2px] border-[var(--cn-line)] bg-[var(--cn-card)] text-[var(--cn-ink-3)] transition-[background-color,color,transform] duration-100 hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)] active:translate-y-px disabled:cursor-not-allowed disabled:border-transparent disabled:bg-transparent disabled:text-[var(--cn-ink-4)] disabled:opacity-50';
const TOOL_BTN_ON =
  'border-[var(--cn-line)] bg-[var(--cn-sun-soft)] text-[var(--cn-ink)]';

export const TowerPanel = () => {
  const { t } = useTranslation();
  const mods = useModStore((s) => s.mods);
  const [towerCategory, setTowerCategory] = useState<'basic' | 'special' | 'mod'>('basic');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickPlaceMode = useGameStore((s) => s.quickPlaceMode);
  const toggleQuickPlaceMode = useGameStore((s) => s.toggleQuickPlaceMode);
  const undoPlacement = useGameStore((s) => s.undoPlacement);
  const redoPlacement = useGameStore((s) => s.redoPlacement);
  const placementHistoryLength = useGameStore((s) => s.placementHistory.length);
  const placementHistoryIndex = useGameStore((s) => s.placementHistoryIndex);
  const showTacticalView = useGameStore((s) => s.showTacticalView);
  const toggleTacticalView = useGameStore((s) => s.toggleTacticalView);
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const toggleAutoBattle = useGameStore((s) => s.toggleAutoBattle);

  const tutorialActive = useTutorialStore((s) => s.isActive);
  const checkAction = useTutorialStore((s) => s.checkAction);
  const tutorialStep = useTutorialStore((s) => INTERACTIVE_TUTORIAL_STEPS[s.currentStepIndex]);

  const hudLayout = useSettingsStore((s) => s.hudLayout);
  const towerListColumns = hudLayout.towerListColumns;
  const towerListSpacing = hudLayout.towerListSpacing;
  const showCategories = hudLayout.showTowerCategories;
  const showToolbar = hudLayout.showTowerToolbar;

  const gridColsClass =
    towerListColumns === 1 ? 'grid-cols-1' : towerListColumns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  const gridGapClass =
    towerListSpacing === 'tight' ? 'gap-1' : towerListSpacing === 'wide' ? 'gap-2' : 'gap-1.5';

  const canUndo = canUndoPlacement(placementHistoryIndex);
  const canRedo = canRedoPlacement(placementHistoryIndex, placementHistoryLength);

  const allTowers = useMemo(() => {
    const towersList: GameTowerData[] = [];

    ALL_BASE_TOWER_TYPES.forEach((type) => {
      towersList.push({
        ...TOWER_DATA[type],
        id: type,
        isModContent: false,
      });
    });

    mods.filter(m => m.enabled).forEach((mod) => {
      mod.content.towers?.forEach((tower) => {
        towersList.push({
          name: tower.name,
          description: tower.description || '',
          color: tower.color,
          highlightColor: tower.highlightColor || tower.color + '80',
          damage: tower.damage,
          damagePerSecond: tower.damagePerSecond,
          range: tower.range,
          fireRate: tower.fireRate || 1,
          cost: tower.cost,
          projectileColor: tower.projectileColor || '#ffffff',
          projectileSpeed: tower.projectileSpeed || 400,
          projectileSize: tower.projectileSize || 4,
          splash: tower.splash,
          splashRadius: tower.splashRadius,
          slowEffect: tower.slowEffect,
          slowAmount: tower.slowAmount,
          slowDuration: tower.slowDuration,
          poisonEffect: tower.poisonEffect,
          poisonDamage: tower.poisonDamage,
          poisonDuration: tower.poisonDuration,
          lightningEffect: tower.lightningEffect,
          chainCount: tower.chainCount,
          id: tower.id,
          isModContent: true,
          modName: mod.metadata.name,
        });
      });
    });

    return towersList;
  }, [mods]);

  const filteredTowers = useMemo(() => {
    if (towerCategory === 'basic') {
      return allTowers.filter(t => BASIC_TOWER_TYPES.includes(t.id as TowerType));
    } else if (towerCategory === 'special') {
      return allTowers.filter(t => SPECIAL_TOWER_TYPES.includes(t.id as TowerType));
    } else {
      return allTowers.filter(t => t.isModContent);
    }
  }, [allTowers, towerCategory]);

  const hasModTowers = allTowers.some(t => t.isModContent);

  const categoryLocked = (id: 'basic' | 'special' | 'mod') =>
    tutorialActive &&
    tutorialStep?.action === 'click' &&
    !!tutorialStep?.targetId?.startsWith('tutorial-target-tower-') &&
    id !== 'basic';

  return (
    <>
      {showCategories && (
        <div className="mb-1 grid grid-rows-3 gap-px rounded-[var(--cn-r-sm)] bg-[var(--cn-line-soft)] p-px">
          {([
            { id: 'basic' as const, label: t.game.basicTowers },
            { id: 'special' as const, label: t.game.specialTowers },
            ...(hasModTowers ? [{ id: 'mod' as const, label: t.game.modTowers }] : []),
          ]).map((tab) => {
            const active = towerCategory === tab.id;
            const locked = categoryLocked(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  if (locked) return;
                  setTowerCategory(tab.id);
                }}
                className={[
                  'flex h-[22px] items-center justify-center rounded-[5px] px-0.5 font-mono text-[8.5px] font-extrabold uppercase tracking-[0.02em] transition-colors duration-100',
                  active
                    ? 'bg-[var(--cn-sun-soft)] text-[var(--cn-ink)]'
                    : 'bg-[var(--cn-card)] text-[var(--cn-ink-3)] hover:text-[var(--cn-ink)]',
                  locked ? 'pointer-events-none opacity-40' : '',
                ].join(' ')}
              >
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className={`grid min-h-0 flex-1 auto-rows-min content-start overflow-y-auto p-1.5 ${gridColsClass} ${gridGapClass}`}>
        <AnimatePresence initial={false}>
        {filteredTowers.map((tower, i) => (
          <motion.div
            key={tower.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6, transition: FADE_OUT }}
            transition={{ ...SPRING_SOFT, delay: Math.min(i, 10) * STAGGER_STEP }}
            className="relative h-full"
          >
            <TowerButton
              towerId={tower.id}
              towerData={tower}
              isModContent={tower.isModContent}
            />
          </motion.div>
        ))}
        </AnimatePresence>
        {filteredTowers.length === 0 && (
          <div
            className="flex flex-col items-center gap-2 px-1 py-6 text-center"
            style={{ gridColumn: `span ${towerListColumns}` }}
          >
            <span className={`${BD_LABEL} whitespace-normal`}>{t.game.noTowersInCategory}</span>
          </div>
        )}
      </div>

      {showToolbar && (
        <div className="border-t border-[var(--bd-line)] p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              aria-label={t.game.quickPlace}
              title={t.game.quickPlace}
              disabled={tutorialActive}
              onClick={() => !tutorialActive && toggleQuickPlaceMode()}
              className={`${TOOL_BTN} ${!tutorialActive && quickPlaceMode ? TOOL_BTN_ON : ''}`}
            >
              <PinIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={t.game.tacticalView}
              title={t.game.tacticalView}
              disabled={tutorialActive}
              onClick={() => !tutorialActive && toggleTacticalView()}
              className={`${TOOL_BTN} ${!tutorialActive && showTacticalView ? TOOL_BTN_ON : ''}`}
            >
              <TargetIcon className="h-3.5 w-3.5" />
            </button>
            <button
              id="tutorial-target-undo"
              type="button"
              aria-label={t.game.undoAction}
              title={t.game.undoAction}
              disabled={(tutorialActive && tutorialStep?.action !== 'undo_action') || (!tutorialActive && !canUndo)}
              onClick={() => {
                if (!tutorialActive || tutorialStep?.action === 'undo_action') {
                  undoPlacement();
                  if (tutorialActive) checkAction('undo_action', 'tutorial-target-undo');
                }
              }}
              className={`${TOOL_BTN} ${canUndo || (tutorialActive && tutorialStep?.action === 'undo_action') ? 'text-[var(--bd-ink-2)]' : ''}`}
            >
              <UndoIcon className="h-3.5 w-3.5" />
            </button>
            <button
              id="tutorial-target-redo"
              type="button"
              aria-label={t.game.redoAction}
              title={t.game.redoAction}
              disabled={(tutorialActive && tutorialStep?.action !== 'redo_action') || (!tutorialActive && !canRedo)}
              onClick={() => {
                if (!tutorialActive || tutorialStep?.action === 'redo_action') {
                  redoPlacement();
                  if (tutorialActive) checkAction('redo_action', 'tutorial-target-redo');
                }
              }}
              className={`${TOOL_BTN} ${canRedo || (tutorialActive && tutorialStep?.action === 'redo_action') ? 'text-[var(--bd-ink-2)]' : ''}`}
            >
              <RedoIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={autoBattleEnabled}
              aria-label={t.game.aiAutoBattle}
              title={t.game.aiAutoBattle}
              disabled={tutorialActive}
              onClick={() => !tutorialActive && toggleAutoBattle()}
              className={`${TOOL_BTN} ${!tutorialActive && autoBattleEnabled ? TOOL_BTN_ON : ''}`}
            >
              <RobotIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={t.game.moreOptions}
              title={t.game.moreOptions}
              disabled={tutorialActive}
              onClick={() => !tutorialActive && setShowAdvanced(!showAdvanced)}
              className={`${TOOL_BTN} ${!tutorialActive && showAdvanced ? TOOL_BTN_ON : ''}`}
            >
              <GearIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 進階選項：輪盤放不下，改成彈出的紙卡（點歯輪開啟） */}
      {createPortal(
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              key="advanced-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: FADE_OUT }}
              className="fixed inset-0 z-[9998] flex items-center justify-center bg-[rgba(46,36,64,0.45)] p-4"
              onClick={() => setShowAdvanced(false)}
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={SPRING_SOFT}
              className={`${BD_SHEET} flex max-h-[80vh] w-full max-w-[360px] flex-col overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="flex items-center justify-between gap-2 border-b-[3px] border-[var(--cn-line-soft)] px-3 py-2">
                <span className={BD_LABEL}>{t.game.moreOptions}</span>
                <button
                  type="button"
                  aria-label={t.common.close}
                  onClick={() => setShowAdvanced(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-[2px] border-[var(--cn-line)] text-[var(--cn-ink-3)] transition-colors hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]"
                >
                  <span className="text-[11px] font-extrabold leading-none">×</span>
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <AdvancedOptionsPanel show />
              </div>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};
