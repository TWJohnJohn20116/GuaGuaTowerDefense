import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { SceneShell } from '@/components/ui/SceneShell';
import { Btn, Chip, Key, SegHead, TopBar } from '@/components/hl';
import { LightbulbIcon } from '@/components/ui/Icons';

// 導入拆分的數據
import type {
  TutorialCategory,
  GameTab,
  ModTab,
  TowerRole,
  EnemyRole,
} from './tutorial/TutorialPageData';
import {
  buildGameTabs,
  buildModTabs,
  buildQuickStartSteps,
  buildTips,
  buildStrategyGuides,
  buildUpgradeGuides,
  buildAutoBattleGuides,
  buildKeybinds,
} from './tutorial/TutorialPageData';

/** 遊戲教學分三組，讓單欄目錄仍然讀得下去 */
type GameTabGroup = {
  key: 'basics' | 'combat' | 'systems';
  labelKey: 'basics' | 'combat' | 'systems';
  tabIds: GameTab[];
};

const GAME_TAB_GROUPS: GameTabGroup[] = [
  { key: 'basics', labelKey: 'basics', tabIds: ['quickstart', 'tips', 'keys'] },
  { key: 'combat', labelKey: 'combat', tabIds: ['towers', 'enemies', 'strategy', 'upgrade', 'autobattle'] },
  {
    key: 'systems',
    labelKey: 'systems',
    tabIds: ['playerSkills', 'talentTree', 'advancedTactics', 'waveEconomy', 'gameModes', 'metaHub'],
  },
];

import {
  KeybindCard,
  TipCard,
  StepIndicator,
  StrategyCard,
  UpgradeCard,
  AutoBattleCard,
  SpecSection,
  SpecRow,
  SpecNote,
  SpecGrid,
  SpecCell,
} from './tutorial/TutorialPageComponents';

// 導入模組教學內容元件
import {
  ModIntroContent,
  ModTowerContent,
  ModEnemyContent,
  ModMapContent, ModExportContent
} from './tutorial/TutorialContent';

// 導入遊戲教學分頁元件
import { TutorialTowerTab } from './tutorial/TutorialTowerTab';
import { TutorialEnemyTab } from './tutorial/TutorialEnemyTab';

// 教學分頁元件（主動技能 / 天賦樹 / 進階戰術 / 波次與經濟 / 模式 / 元進度）
import { TutorialPlayerSkills } from './tutorial/TutorialPlayerSkills';
import { TutorialTalentTree } from './tutorial/TutorialTalentTree';
import { TutorialAdvancedTactics } from './tutorial/TutorialAdvancedTactics';
import { TutorialWaveEconomy } from './tutorial/TutorialWaveEconomy';
import { TutorialGameModes } from './tutorial/TutorialGameModes';
import { TutorialMetaHub } from './tutorial/TutorialMetaHub';

export default function Tutorial() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<TutorialCategory>('game');
  const [gameTab, setGameTab] = useState<GameTab>('quickstart');
  const [modTab, setModTab] = useState<ModTab>('intro');
  const [selectedTower, setSelectedTower] = useState<string>('basic');
  const [towerRoleFilter, setTowerRoleFilter] = useState<TowerRole | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<string>('normal');
  const [enemyRoleFilter, setEnemyRoleFilter] = useState<EnemyRole | null>(null);
  const [quickStartStep, setQuickStartStep] = useState(0);
  const [modStep, setModStep] = useState(0);

  const startGame = useGameStore((s) => s.startGame);
  const setScene = useGameStore((s) => s.setScene);
  const startTutorial = useTutorialStore((s) => s.startTutorial);

  const handleStartInteractiveTutorial = () => {
    // 開始一局普通地圖，並啟動互動式教學
    startGame('zigzag', 'normal', false, 15);
    setScene('game');
    startTutorial();
  };

  // 從 i18n 翻譯產生教學資料
  const GAME_TABS = buildGameTabs(t);
  const MOD_TABS = buildModTabs(t);
  const QUICK_START_STEPS = buildQuickStartSteps(t);
  const TIPS = buildTips(t);
  const STRATEGY_GUIDES = buildStrategyGuides(t);
  const UPGRADE_GUIDES = buildUpgradeGuides(t);
  const AUTO_BATTLE_GUIDES = buildAutoBattleGuides(t);
  const KEYBINDS = buildKeybinds(t);

  const currentTabs = category === 'game' ? GAME_TABS : MOD_TABS;
  const activeTab = category === 'game' ? gameTab : modTab;
  const activeLabel = currentTabs.find((tab) => tab.id === activeTab)?.label ?? '';

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={t.tutorial.title}
          meta={t.tutorial.subtitle}
          glyph={<LightbulbIcon className="h-4 w-4" />}
          back={{ to: 'mainMenu' }}
          right={(
            <Btn variant="signal" size="sm" onClick={handleStartInteractiveTutorial}>
              {t.tutorial.startInteractive}
            </Btn>
          )}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1080px] px-6 py-5">
            {/* 目錄：兩本手冊，各自分組 */}
            <nav className="space-y-3">
              <SegHead
                label={t.tutorial.gameTutorial}
                right={<span className="hl-num text-[10px] leading-none text-[var(--hl-ink-4)]">{String(GAME_TABS.length).padStart(2, '0')}</span>}
              />
              <div className="space-y-1.5">
                {GAME_TAB_GROUPS.map((group) => {
                  const groupTabs = GAME_TABS.filter((tab) => (group.tabIds as string[]).includes(tab.id));
                  if (groupTabs.length === 0) return null;
                  return (
                    <div key={group.key} className="flex flex-wrap items-center gap-1.5">
                      <span className="w-[52px] shrink-0 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
                        {t.tutorial.gameTabGroups[group.labelKey]}
                      </span>
                      {groupTabs.map((tab) => (
                        <Chip
                          key={tab.id}
                          active={category === 'game' && gameTab === tab.id}
                          onClick={() => {
                            setCategory('game');
                            setGameTab(tab.id as GameTab);
                          }}
                        >
                          {tab.label}
                        </Chip>
                      ))}
                    </div>
                  );
                })}
              </div>

              <SegHead
                label={t.tutorial.modTutorial}
                right={<span className="hl-num text-[10px] leading-none text-[var(--hl-ink-4)]">{String(MOD_TABS.length).padStart(2, '0')}</span>}
              />
              <div className="flex flex-wrap items-center gap-1.5">
                {MOD_TABS.map((tab) => (
                  <Chip
                    key={tab.id}
                    active={category === 'mod' && modTab === tab.id}
                    onClick={() => {
                      setCategory('mod');
                      setModTab(tab.id as ModTab);
                    }}
                  >
                    {tab.label}
                  </Chip>
                ))}
              </div>
            </nav>

            <div className="mt-5 border-t border-[var(--hl-line)] pt-4">
              {/* 章節頭 */}
              <div className="mb-4 flex flex-wrap items-baseline gap-3">
                <span className="hl-label">{category === 'game' ? t.tutorial.gameTutorial : t.tutorial.modTutorial}</span>
                <span className="h-px flex-1 bg-[var(--hl-line)]" />
                <h1 className="hl-title">{activeLabel}</h1>
              </div>

              <div className="space-y-5">
                {/* 快速入門 */}
                {activeTab === 'quickstart' && (
                  <SpecSection
                    label={`${String(quickStartStep + 1).padStart(2, '0')} / ${String(QUICK_START_STEPS.length).padStart(2, '0')}`}
                    right={(
                      <StepIndicator
                        current={quickStartStep}
                        total={QUICK_START_STEPS.length}
                        onSelect={setQuickStartStep}
                      />
                    )}
                  >
                    <h2 className="hl-title">{QUICK_START_STEPS[quickStartStep].title}</h2>
                    <p className="hl-sub mt-1.5">{QUICK_START_STEPS[quickStartStep].description}</p>

                    <div className="mt-3">
                      <SpecNote label={t.tutorial.hintLabel} tone="caution">
                        {QUICK_START_STEPS[quickStartStep].tip}
                      </SpecNote>
                    </div>

                    <div className="mt-4 border-t border-[var(--hl-line)]">
                      {QUICK_START_STEPS.map((step, i) => (
                        <button
                          key={step.title}
                          type="button"
                          onClick={() => setQuickStartStep(i)}
                          className="block w-full text-left"
                        >
                          <div className={i === quickStartStep ? 'bg-[var(--hl-deck-2)]' : ''}>
                            <SpecRow
                              index={i + 1}
                              title={step.title}
                              right={
                                i === quickStartStep
                                  ? <span className="h-1.5 w-1.5 bg-[var(--hl-signal)]" />
                                  : undefined
                              }
                            />
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <Btn
                        variant="line"
                        size="md"
                        onClick={() => setQuickStartStep(Math.max(0, quickStartStep - 1))}
                        disabled={quickStartStep === 0}
                      >
                        {t.tutorial.prevStep}
                      </Btn>
                      <Btn
                        variant="line"
                        size="md"
                        onClick={() => setQuickStartStep(Math.min(QUICK_START_STEPS.length - 1, quickStartStep + 1))}
                        disabled={quickStartStep === QUICK_START_STEPS.length - 1}
                      >
                        {t.tutorial.nextStep}
                      </Btn>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
                        <div className="hl-label">{t.tutorial.sectionGoal}</div>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--hl-ink-2)]">{t.tutorial.sectionGoalDesc}</p>
                      </div>
                      <div className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
                        <div className="hl-label">{t.tutorial.sectionMeans}</div>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--hl-ink-2)]">{t.tutorial.sectionMeansDesc}</p>
                      </div>
                      <div className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
                        <div className="hl-label">{t.tutorial.sectionWin}</div>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--hl-ink-2)]">{t.tutorial.sectionWinDesc}</p>
                      </div>
                    </div>
                  </SpecSection>
                )}

                {activeTab === 'towers' && (
                  <TutorialTowerTab
                    selectedTower={selectedTower}
                    setSelectedTower={setSelectedTower}
                    towerRoleFilter={towerRoleFilter}
                    setTowerRoleFilter={setTowerRoleFilter}
                  />
                )}

                {activeTab === 'enemies' && (
                  <TutorialEnemyTab
                    selectedEnemy={selectedEnemy}
                    setSelectedEnemy={setSelectedEnemy}
                    enemyRoleFilter={enemyRoleFilter}
                    setEnemyRoleFilter={setEnemyRoleFilter}
                  />
                )}

                {/* 進階技巧 */}
                {activeTab === 'tips' && (
                  <SpecSection label={t.tutorial.advancedTips} right={<span className="hl-num text-[10px] leading-none text-[var(--hl-ink-4)]">{String(TIPS.length).padStart(2, '0')}</span>}>
                    <p className="hl-sub mb-3">{t.tutorial.advancedTipsDesc}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {TIPS.map((tip) => (
                        <TipCard key={tip.title} {...tip} />
                      ))}
                    </div>
                  </SpecSection>
                )}

                {/* 快捷鍵：全部用 <Key> */}
                {activeTab === 'keys' && (
                  <SpecSection label={t.tutorial.keyboardShortcuts}>
                    <p className="hl-sub mb-3">{t.tutorial.keyboardShortcutsDesc}</p>
                    <div className="border-t border-[var(--hl-line)]">
                      {KEYBINDS.map((keybind) => (
                        <KeybindCard
                          key={keybind.action}
                          action={keybind.action}
                          keyName={keybind.key}
                          icon={keybind.icon}
                        />
                      ))}
                    </div>
                    <div className="mt-3">
                      <SpecNote label={t.tutorial.hintLabel} tone="reach">
                        {t.tutorial.keyboardHint}
                      </SpecNote>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="hl-label">space</span>
                      <Key>SPACE</Key>
                      <span className="hl-label">esc</span>
                      <Key>ESC</Key>
                    </div>
                  </SpecSection>
                )}

                {/* 戰術策略 */}
                {activeTab === 'strategy' && (
                  <>
                    <SpecSection label={t.tutorial.strategy}>
                      <p className="hl-sub mb-3">{t.tutorial.strategyDesc}</p>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {STRATEGY_GUIDES.map((guide, index) => (
                          <StrategyCard key={guide.title} guide={guide} index={index} />
                        ))}
                      </div>
                    </SpecSection>

                    <SpecSection label={t.tutorial.recommendedCombos}>
                      <div className="border-t border-[var(--hl-line)]">
                        <SpecRow index={1} title={`${t.towers.types.frost} + ${t.towers.types.sniper}`} desc={t.tutorial.comboFrostSniperDesc} />
                        <SpecRow index={2} title={`${t.towers.types.cannon} + ${t.towers.types.lightning}`} desc={t.tutorial.comboCannonLightningDesc} />
                        <SpecRow index={3} title={`${t.towers.types.poison} + ${t.towers.types.machine}`} desc={t.tutorial.comboPoisonMachineDesc} />
                      </div>
                    </SpecSection>
                  </>
                )}

                {/* 升級系統 */}
                {activeTab === 'upgrade' && (
                  <>
                    <SpecSection label={t.tutorial.upgradeSystem}>
                      <p className="hl-sub mb-3">{t.tutorial.upgradeSystemDesc}</p>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {UPGRADE_GUIDES.map((guide, index) => (
                          <UpgradeCard key={guide.title} guide={guide} index={index} />
                        ))}
                      </div>
                    </SpecSection>

                    <SpecSection label={t.tutorial.upgradeCost}>
                      <p className="mb-2.5 border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-3 py-2 font-mono text-[11px] leading-relaxed text-[var(--hl-ink-2)]">
                        {t.tutorial.upgradeCostFormula}
                      </p>
                      <SpecGrid cols={4}>
                        <SpecCell label="lv1 → lv2" value="75%" tone="caution" />
                        <SpecCell label="lv2 → lv3" value="100%" tone="caution" />
                        <SpecCell label="lv3 → lv4" value="125%" tone="caution" />
                        <SpecCell label="lv4 → lv5" value="150%" tone="caution" />
                      </SpecGrid>
                      <div className="mt-3">
                        <SpecNote label={t.tutorial.hintLabel} tone="caution">
                          {t.tutorial.upgradeTip}
                        </SpecNote>
                      </div>
                    </SpecSection>
                  </>
                )}

                {/* 自動戰鬥 */}
                {activeTab === 'autobattle' && (
                  <>
                    <SpecSection label={t.tutorial.autoBattleSystem}>
                      <p className="hl-sub mb-3">{t.tutorial.autoBattleSystemDesc}</p>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {AUTO_BATTLE_GUIDES.map((guide, index) => (
                          <AutoBattleCard key={guide.title} guide={guide} index={index} />
                        ))}
                      </div>
                    </SpecSection>

                    <SpecSection label={t.tutorial.autoBattleStrategyDetail}>
                      <div className="border-t border-[var(--hl-line)]">
                        <SpecRow index="A" title={t.tutorial.strategyBalanced} desc={t.tutorial.strategyBalancedDesc} />
                        <SpecRow index="B" title={t.tutorial.strategyEconomy} desc={t.tutorial.strategyEconomyDesc} />
                        <SpecRow index="C" title={t.tutorial.strategyAggressive} desc={t.tutorial.strategyAggressiveDesc} />
                        <SpecRow index="D" title={t.tutorial.strategyDefensive} desc={t.tutorial.strategyDefensiveDesc} />
                      </div>
                    </SpecSection>
                  </>
                )}

                {/* ========== 系統教學分頁 ========== */}
                {activeTab === 'playerSkills' && category === 'game' && <TutorialPlayerSkills />}
                {activeTab === 'talentTree' && category === 'game' && <TutorialTalentTree />}
                {activeTab === 'advancedTactics' && category === 'game' && <TutorialAdvancedTactics />}
                {activeTab === 'waveEconomy' && category === 'game' && <TutorialWaveEconomy />}
                {activeTab === 'gameModes' && category === 'game' && <TutorialGameModes />}
                {activeTab === 'metaHub' && category === 'game' && <TutorialMetaHub />}

                {/* ========== 模組教學 ========== */}
                {activeTab === 'intro' && category === 'mod' && <ModIntroContent modStep={modStep} setModStep={setModStep} />}
                {activeTab === 'tower' && category === 'mod' && <ModTowerContent />}
                {activeTab === 'enemy' && category === 'mod' && <ModEnemyContent />}
                {activeTab === 'map' && category === 'mod' && <ModMapContent />}
                {activeTab === 'export' && category === 'mod' && <ModExportContent />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SceneShell>
  );
}
