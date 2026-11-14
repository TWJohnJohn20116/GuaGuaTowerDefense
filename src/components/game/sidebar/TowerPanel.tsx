import { useState, useMemo } from 'react';
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
import { AIStatusHeader } from './AIStatusHeader';
import { AdvancedOptionsPanel } from './AdvancedOptionsPanel';
import { PlayerSkillBar } from '../PlayerSkillBar';
import { canRedoPlacement, canUndoPlacement } from '@/store/placementHistory';
import { Chip, SegHead } from '@/components/hl';

const BASIC_TOWER_TYPES: TowerType[] = ['basic', 'sniper', 'cannon', 'machine', 'shotgun', 'ballista'];
const SPECIAL_TOWER_TYPES: TowerType[] = ['frost', 'poison', 'laser', 'lightning', 'flame', 'money', 'wind', 'pulse'];
const ALL_BASE_TOWER_TYPES: TowerType[] = [
  'basic', 'sniper', 'cannon', 'machine', 'shotgun', 'ballista',
  'frost', 'poison', 'laser', 'lightning', 'flame', 'money', 'wind', 'pulse',
];

/** 塔塢工具列按鈕：方角、1px 線 */
const TOOL_BTN =
  'flex h-8 w-8 items-center justify-center border transition-colors duration-[110ms]';

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
  const showSkillBar = hudLayout.showTowerSkillBar;
  const showToolbar = hudLayout.showTowerToolbar;

  const gridColsClass =
    towerListColumns === 1 ? 'grid-cols-1' : towerListColumns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  const gridGapClass =
    towerListSpacing === 'tight' ? 'gap-1' : towerListSpacing === 'wide' ? 'gap-3' : 'gap-1.5';

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
      <AIStatusHeader />

      {showCategories && (
        <div className="border-b border-[var(--hl-line)] px-2.5 py-2">
          <div className="flex items-stretch gap-1">
            {([
              { id: 'basic' as const, label: t.game.basicTowers },
              { id: 'special' as const, label: t.game.specialTowers },
              ...(hasModTowers ? [{ id: 'mod' as const, label: t.game.modTowers }] : []),
            ]).map((tab) => (
              <Chip
                key={tab.id}
                active={towerCategory === tab.id}
                onClick={() => {
                  if (categoryLocked(tab.id)) return;
                  setTowerCategory(tab.id);
                }}
                className={`flex-1 justify-center ${categoryLocked(tab.id) ? 'pointer-events-none opacity-40' : ''}`}
              >
                {tab.label}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className={`grid min-h-0 flex-1 auto-rows-min overflow-y-auto p-2.5 content-start ${gridColsClass} ${gridGapClass}`}>
        {filteredTowers.map((tower) => (
          <div key={tower.id} className="relative h-full">
            <TowerButton
              towerId={tower.id}
              towerData={tower}
              isModContent={tower.isModContent}
            />
          </div>
        ))}
        {filteredTowers.length === 0 && (
          <div
            className="flex flex-col items-center gap-2 py-8 text-center"
            style={{ gridColumn: `span ${towerListColumns}` }}
          >
            <span className="hl-label">{t.game.noTowersInCategory}</span>
          </div>
        )}
      </div>

      {showSkillBar && <PlayerSkillBar />}

      {showToolbar && (
        <div className="border-t border-[var(--hl-line)] px-2.5 py-2">
          <SegHead label={t.game.moreOptions} className="mb-2" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={`${TOOL_BTN} ${
                  tutorialActive
                    ? 'cursor-not-allowed border-transparent text-[var(--hl-ink-4)] opacity-40'
                    : quickPlaceMode
                      ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)] text-[var(--hl-signal)]'
                      : 'border-[var(--hl-line)] text-[var(--hl-ink-3)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]'
                }`}
                onClick={() => !tutorialActive && toggleQuickPlaceMode()}
                disabled={tutorialActive}
                title={t.game.quickPlace}
              >
                <PinIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={`${TOOL_BTN} ${
                  tutorialActive
                    ? 'cursor-not-allowed border-transparent text-[var(--hl-ink-4)] opacity-40'
                    : showTacticalView
                      ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)] text-[var(--hl-signal)]'
                      : 'border-[var(--hl-line)] text-[var(--hl-ink-3)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]'
                }`}
                onClick={() => !tutorialActive && toggleTacticalView()}
                disabled={tutorialActive}
                title={t.game.tacticalView}
              >
                <TargetIcon className="h-3.5 w-3.5" />
              </button>

              <span className="mx-0.5 h-6 w-px bg-[var(--hl-line)]" />

              <button
                id="tutorial-target-undo"
                type="button"
                className={`${TOOL_BTN} ${
                  tutorialActive && tutorialStep?.action !== 'undo_action'
                    ? 'cursor-not-allowed border-transparent text-[var(--hl-ink-4)] opacity-40'
                    : canUndoPlacement(placementHistoryIndex) || (tutorialActive && tutorialStep?.action === 'undo_action')
                      ? 'border-[var(--hl-line)] text-[var(--hl-ink-2)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]'
                      : 'cursor-not-allowed border-transparent text-[var(--hl-ink-4)]'
                }`}
                onClick={() => {
                  if (!tutorialActive || tutorialStep?.action === 'undo_action') {
                    undoPlacement();
                    if (tutorialActive) checkAction('undo_action', 'tutorial-target-undo');
                  }
                }}
                disabled={(tutorialActive && tutorialStep?.action !== 'undo_action') || (!tutorialActive && !canUndoPlacement(placementHistoryIndex))}
                title={t.game.undoAction}
              >
                <UndoIcon className="h-3.5 w-3.5" />
              </button>
              <button
                id="tutorial-target-redo"
                type="button"
                className={`${TOOL_BTN} ${
                  tutorialActive && tutorialStep?.action !== 'redo_action'
                    ? 'cursor-not-allowed border-transparent text-[var(--hl-ink-4)] opacity-40'
                    : canRedoPlacement(placementHistoryIndex, placementHistoryLength) || (tutorialActive && tutorialStep?.action === 'redo_action')
                      ? 'border-[var(--hl-line)] text-[var(--hl-ink-2)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]'
                      : 'cursor-not-allowed border-transparent text-[var(--hl-ink-4)]'
                }`}
                onClick={() => {
                  if (!tutorialActive || tutorialStep?.action === 'redo_action') {
                    redoPlacement();
                    if (tutorialActive) checkAction('redo_action', 'tutorial-target-redo');
                  }
                }}
                disabled={(tutorialActive && tutorialStep?.action !== 'redo_action') || (!tutorialActive && !canRedoPlacement(placementHistoryIndex, placementHistoryLength))}
                title={t.game.redoAction}
              >
                <RedoIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {/* 自動戰鬥：方塊開關 */}
              <button
                type="button"
                role="switch"
                aria-checked={autoBattleEnabled}
                className={`flex h-8 w-12 items-center border px-0.5 transition-colors duration-[110ms] ${
                  tutorialActive
                    ? 'cursor-not-allowed border-transparent opacity-40'
                    : autoBattleEnabled
                      ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
                      : 'border-[var(--hl-line)] hover:border-[var(--hl-line-hot)]'
                }`}
                onClick={() => !tutorialActive && toggleAutoBattle()}
                disabled={tutorialActive}
                title={t.game.aiAutoBattle}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center transition-transform duration-[170ms] ${
                    autoBattleEnabled
                      ? 'translate-x-[22px] bg-[var(--hl-signal)] text-[var(--hl-signal-ink)]'
                      : 'translate-x-0 bg-[var(--hl-deck-3)] text-[var(--hl-ink-3)]'
                  }`}
                >
                  <RobotIcon className="h-3 w-3" />
                </span>
              </button>
              <button
                type="button"
                className={`${TOOL_BTN} ${
                  tutorialActive
                    ? 'cursor-not-allowed border-transparent text-[var(--hl-ink-4)] opacity-40'
                    : showAdvanced
                      ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)] text-[var(--hl-signal)]'
                      : 'border-[var(--hl-line)] text-[var(--hl-ink-3)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]'
                }`}
                onClick={() => !tutorialActive && setShowAdvanced(!showAdvanced)}
                disabled={tutorialActive}
                title={t.game.moreOptions}
              >
                <GearIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showToolbar && <AdvancedOptionsPanel show={showAdvanced} />}
    </>
  );
};
