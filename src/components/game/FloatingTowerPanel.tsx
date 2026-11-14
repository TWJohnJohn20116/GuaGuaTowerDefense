import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, CrossIcon, UpArrowIcon, SkullIcon, SwordsIcon, EditIcon, LockIcon, ShieldLockIcon, StarIcon, LinkIcon2, EmpIcon, ThemeIcon } from '@/components/ui/Icons';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { SKILL_DATA, getSkillCooldownPercent, getSkillRemainingCooldown } from '@/data/skillData';
import { ENEMY_DATA, GAME_CONSTANTS } from '@/data/gameData';
import { TOWER_UPGRADE_BRANCHES } from '@/data/upgradeBranches';
import { useTranslation } from '@/i18n';
import { useGetTowerData } from './hooks';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from '@/store/tutorialStore';
import type { TowerType, UpgradePath } from '@/types/game';
import { isFusionTower, getFusionPartners, computeFusionCost } from '@/data/fusionRecipes';
import { getSynergyModsForTower, toTowerRef } from '@/data/towerSynergyData';
import { getProtocolWaveMods } from '@/data/tacticalProtocolData';
import { collectJammerAurasCached, getTowerJamFireRateMult } from '@/data/jammerAura';
import { getMoneyAuraRange, MONEY_KILL_BONUS_MULT } from '@/data/moneyAura';
import { getTowerCombatIdentityPills } from '@/data/towerCombatIdentity';
import { getTowerStatBonus } from '@/data/towerCombatStats';
import { getTowerUpgradeCost } from '@/data/towerUpgradeCost';
import { getTowerSellRefund, requestSellTower } from '@/store/sellConfirm';
import { getTowerLockTitle } from '@/data/towerLockTitle';
import { formatCurrentPathCaption, formatUpgradePathTag } from '@/data/upgradePathLabel';
import { formatTowerLevelBadge } from '@/data/towerLevelLabel';
import TowerPreview from '@/components/ui/TowerPreview';
import { Btn, Deck, IconBtn, Input, SegHead } from '@/components/hl';

/** 上方儀表帶高度：面板定位要扣掉，否則會跑到帶子上 */
const TOP_BAND = 44;

type Tone = 'ink' | 'signal' | 'vital' | 'alarm' | 'caution' | 'reach' | 'muted';

const TONE_TEXT: Record<Tone, string> = {
  ink: 'text-[var(--arc-ink)]',
  signal: 'text-[var(--arc-gold)]',
  vital: 'text-[var(--arc-vital)]',
  alarm: 'text-[var(--arc-alert)]',
  caution: 'text-[var(--arc-caution)]',
  reach: 'text-[var(--arc-reach)]',
  muted: 'text-[var(--arc-ink-2)]',
};

export const FloatingTowerPanel = ({
  tileSize,
  offsetX,
  offsetY,
  dock = false,
}: {
  tileSize: number;
  offsetX: number;
  offsetY: number;
  /** 停靠模式：固定在畫面左側（3D 視圖用，無 2D 格座標可定位） */
  dock?: boolean;
}) => {
  const { t } = useTranslation();
  const tutorialActive = useTutorialStore((s) => s.isActive);
  const currentStep = useTutorialStore((s) => INTERACTIVE_TUTORIAL_STEPS[s.currentStepIndex]);
  const selectedTower = useGameStore((s) => s.selectedTower);
  const upgradeTower = useGameStore((s) => s.upgradeTower);
  const sellTower = useGameStore((s) => s.sellTower);
  const selectTower = useGameStore((s) => s.selectTower);
  const setTowerPriority = useGameStore((s) => s.setTowerPriority);
  const activateSkill = useGameStore((s) => s.activateSkill);
  const undoUpgrade = useGameStore((s) => s.undoUpgrade);
  const renameTower = useGameStore((s) => s.renameTower);
  const toggleTowerLock = useGameStore((s) => s.toggleTowerLock);
  const money = useGameStore((s) => s.money);
  const fusionMode = useGameStore((s) => s.fusionMode);
  const fusionSourceId = useGameStore((s) => s.fusionSourceId);
  const towers = useGameStore((s) => s.towers);
  const enemies = useGameStore((s) => s.enemies);
  const activeProtocol = useGameStore((s) => s.activeProtocol);
  const enterFusionMode = useGameStore((s) => s.enterFusionMode);
  const cancelFusion = useGameStore((s) => s.cancelFusion);
  const canUndoForCurrentTower = useGameStore((s) =>
    s.selectedTower ? s.upgradeHistory.some(h => h.towerId === s.selectedTower!.id) : false
  );
  const confirmSell = useSettingsStore((s) => s.gameplay.confirmSell);
  const checkAction = useTutorialStore((s) => s.checkAction);
  const getTowerData = useGetTowerData();
  const [, forceUpdate] = useState(0);
  const [showPathSelection, setShowPathSelection] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelTop, setPanelTop] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(x => x + 1), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setShowPathSelection(false);
    setIsRenaming(false);
  }, [selectedTower?.id]);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const handleStartRename = useCallback(() => {
    if (!selectedTower) return;
    setRenameValue(selectedTower.customName || '');
    setIsRenaming(true);
  }, [selectedTower]);

  const handleConfirmRename = useCallback(() => {
    if (!selectedTower) return;
    renameTower(selectedTower.id, renameValue);
    setIsRenaming(false);
  }, [selectedTower, renameValue, renameTower]);

  const handleCancelRename = useCallback(() => {
    setIsRenaming(false);
  }, []);

  // 動態計算面板位置，防止超出容器
  useLayoutEffect(() => {
    if (dock || !selectedTower || !tileSize) return;
    const el = panelRef.current;
    if (!el) return;
    const parent = el.offsetParent as HTMLElement | null;
    const containerH = parent?.clientHeight || window.innerHeight;
    const panelH = el.scrollHeight;
    const ty = offsetY + selectedTower.gridPos.row * tileSize;
    const idealTop = Math.max(TOP_BAND + 8, ty - 20);
    const maxTop = containerH - panelH - 8;
    setPanelTop(Math.max(TOP_BAND + 8, Math.min(idealTop, maxTop)));
  });

  if (!selectedTower || (!tileSize && !dock)) return null;

  const data = getTowerData(selectedTower.type);
  if (!data) return null;
  const currentLevel = selectedTower.level;
  const nextLevel = currentLevel + 1;
  const maxLevel = GAME_CONSTANTS.MAX_TOWER_LEVEL;
  const upgradeCost = getTowerUpgradeCost(data.cost, currentLevel);
  const sellPrice = getTowerSellRefund(data.cost);
  const canUpgrade = currentLevel < maxLevel && money >= upgradeCost;

  const fusionPartners = !isFusionTower(selectedTower.type)
    ? getFusionPartners(selectedTower.type)
    : [];
  const hasFusionPartner = fusionPartners.length > 0 &&
    towers.some(t => t.id !== selectedTower.id && fusionPartners.includes(t.type));
  const fusionPartnerOnField = towers.find(
    t => t.id !== selectedTower.id && fusionPartners.includes(t.type),
  );
  const partnerData = fusionPartnerOnField ? getTowerData(fusionPartnerOnField.type) : null;
  const fusionCost = computeFusionCost(
    data.cost,
    partnerData?.cost || 0,
    useGameStore.getState().difficultyModifiers?.towerCostMult ?? 1,
  );
  const canAffordFusion = money >= fusionCost;
  const isFusionSource = fusionMode && fusionSourceId === selectedTower.id;
  const canUndo = canUndoForCurrentTower;
  const synergyMods = getSynergyModsForTower(toTowerRef(selectedTower), towers.map(toTowerRef));
  const protocolMods = getProtocolWaveMods(activeProtocol);
  const jamFireRateMult = getTowerJamFireRateMult(
    selectedTower.gridPos.col,
    selectedTower.gridPos.row,
    collectJammerAurasCached(enemies, ENEMY_DATA, Date.now()),
  );
  const isJammed = jamFireRateMult < 1;

  const baseDmg = data.damage || data.damagePerSecond || 0;
  const isFlame = !!data.flameEffect;

  const statBonus = getTowerStatBonus(selectedTower);
  const nextBonus = getTowerStatBonus({
    type: selectedTower.type,
    level: nextLevel,
    upgradePath: selectedTower.upgradePath,
  });

  const getCurrentStats = () => ({
    damage: Math.floor(baseDmg * statBonus.damageMultiplier * synergyMods.damageMult * protocolMods.damageMult),
    range: Math.floor(data.range * statBonus.rangeMultiplier * synergyMods.rangeMult * protocolMods.rangeMult),
    fireRate: (data.fireRate || 1) * statBonus.fireRateMultiplier * synergyMods.fireRateMult * jamFireRateMult * protocolMods.fireRateMult,
  });

  const getNextStats = () => ({
    damage: Math.floor(baseDmg * nextBonus.damageMultiplier),
    range: Math.floor(data.range * nextBonus.rangeMultiplier),
    fireRate: (data.fireRate || 1) * nextBonus.fireRateMultiplier,
  });

  const currentStats = getCurrentStats();
  const nextStats = getNextStats();

  const priorityOptions = [
    { value: 'first', label: t.towers.priority.first },
    { value: 'threat', label: t.towers.priority.threat },
    { value: 'last', label: t.towers.priority.last },
    { value: 'strongest', label: t.towers.priority.strongest },
    { value: 'weakest', label: t.towers.priority.weakest },
    { value: 'closest', label: t.towers.priority.closest },
    { value: 'fastest', label: t.towers.priority.fastest },
    { value: 'highestPercent', label: t.towers.priority.highestPercent },
    { value: 'lowestPercent', label: t.towers.priority.lowestPercent },
  ] as const;

  const towerX = offsetX + selectedTower.gridPos.col * tileSize + tileSize / 2;
  const panelWidth = 304;
  const showOnRight = selectedTower.gridPos.col < GAME_CONSTANTS.GRID_COLS / 2;
  const panelX = dock ? 16 : (showOnRight ? towerX + tileSize : towerX - panelWidth - tileSize / 2);
  const panelTopFinal = dock ? TOP_BAND + 32 : panelTop;

  const branches = TOWER_UPGRADE_BRANCHES[selectedTower.type as TowerType];
  const needsPathSelection = currentLevel === 1 && branches && !selectedTower.upgradePath;
  const chosenPath = selectedTower.upgradePath === 'A' || selectedTower.upgradePath === 'B'
    ? selectedTower.upgradePath
    : null;
  const currentPathCaption = formatCurrentPathCaption(
    chosenPath,
    t.towers.currentPath,
    t.towers.pathTag,
    chosenPath === 'A' ? branches?.pathA.name : chosenPath === 'B' ? branches?.pathB.name : undefined,
  );
  const handleUpgrade = (path?: UpgradePath) => {
    if (needsPathSelection && !path) {
      setShowPathSelection(true);
      checkAction('upgrade_tower', 'tutorial-target-upgrade-tower');
      return;
    }
    const upgradePath = path || selectedTower.upgradePath || undefined;
    upgradeTower(selectedTower, upgradePath);
    setShowPathSelection(false);
    if (path) {
      checkAction('select_path', 'tutorial-target-path-a');
    } else {
      checkAction('upgrade_tower', 'tutorial-target-upgrade-tower');
    }
  };

  // 單一屬性格：mono 標籤 + mono 數值（+ 升級後數值）
  const StatPill = ({ label, current, next, showUpgrade, tone }: {
    label: string;
    current: number | string;
    next?: number | string;
    showUpgrade: boolean;
    tone: Tone;
  }) => (
    <Deck tone="sunken" className="flex flex-col gap-1 px-1.5 py-1.5">
      <span className="arc-label truncate">{label}</span>
      <span className={`arc-num font-mono text-[13px] font-semibold tabular-nums leading-none ${TONE_TEXT[tone]}`}>
        {current}
      </span>
      {showUpgrade && next !== undefined && (
        <span className="font-mono text-[9.5px] tabular-nums text-[var(--arc-vital)]">→ {next}</span>
      )}
    </Deck>
  );

  // ===== 標題 =====
  const renderHeader = () => (
    <div className="flex items-start gap-2.5">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)]">
        <TowerPreview towerId={selectedTower.type} size={34} />
      </span>
      <div className="min-w-0 flex-1">
        {isRenaming ? (
          <div className="flex items-center gap-1">
            <Input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmRename();
                if (e.key === 'Escape') handleCancelRename();
                e.stopPropagation();
              }}
              onKeyUp={(e) => e.stopPropagation()}
              maxLength={20}
              placeholder={data.name}
              className="h-7 px-1.5 text-[12px] text-[var(--arc-ink)]"
            />
            <IconBtn
              label={t.game.confirm}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm px-0 text-[var(--arc-vital)]"
              onClick={handleConfirmRename}
            >
              <CheckIcon className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn
              label={t.game.cancel}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm px-0 text-[var(--arc-alert)]"
              onClick={handleCancelRename}
            >
              <CrossIcon className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        ) : (
          <div
            className={`group/name flex items-center gap-1.5 ${tutorialActive ? 'cursor-default' : 'cursor-pointer'}`}
            onClick={() => !tutorialActive && handleStartRename()}
            title={tutorialActive ? undefined : t.game.clickToRename}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold leading-tight text-[var(--arc-ink)]">
                {selectedTower.customName || data.name}
              </span>
              {selectedTower.customName && (
                <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
                  {data.name}
                </span>
              )}
            </span>
            {!tutorialActive && (
              <EditIcon className="h-3 w-3 shrink-0 text-[var(--arc-ink-4)] opacity-0 transition-opacity group-hover/name:opacity-100" />
            )}
          </div>
        )}

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-2)]">
            {formatTowerLevelBadge({
              currentLevel,
              maxLevel,
              maxLabel: t.towers.maxLevel,
            })}
          </span>
          {currentLevel < maxLevel && (
            <span className={`font-mono text-[10px] tabular-nums ${canUpgrade ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-ink-4)]'}`}>
              → {nextLevel}
            </span>
          )}
          {currentPathCaption && (
            <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.06em] text-[var(--arc-reach)]">
              {currentPathCaption}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // ===== 屬性網格 =====
  const renderStatsGrid = () => {
    if (selectedTower.type === 'money') {
      const cur = ((data as typeof data & { moneyPerSecond?: number }).moneyPerSecond || 0) * (1 + (currentLevel - 1) * 0.2) * synergyMods.incomeMult;
      const nxt = ((data as typeof data & { moneyPerSecond?: number }).moneyPerSecond || 0) * (1 + (nextLevel - 1) * 0.2) * synergyMods.incomeMult;
      const auraNow = getMoneyAuraRange(currentLevel);
      const auraNext = getMoneyAuraRange(nextLevel);
      const bountyPct = Math.round(MONEY_KILL_BONUS_MULT * 100);
      return (
        <div className="grid grid-cols-2 gap-1">
          <StatPill label={t.game.incomePerSecond} current={`$${cur}/s`} next={canUpgrade ? `$${nxt}/s` : undefined} showUpgrade={canUpgrade} tone="vital" />
          <StatPill label={t.game.totalIncome} current={`$${Math.floor(selectedTower.moneyGenerated || 0)}`} showUpgrade={false} tone="signal" />
          <StatPill label="金庫光環" current={`${auraNow} 格`} next={canUpgrade ? `${auraNext} 格` : undefined} showUpgrade={canUpgrade} tone="caution" />
          <StatPill label="擊殺賞金" current={`+${bountyPct}%`} showUpgrade={false} tone="caution" />
        </div>
      );
    }
    const identityPills = getTowerCombatIdentityPills(selectedTower.type);
    return (
      <>
        <div className="grid grid-cols-3 gap-1">
          <StatPill
            label={isFlame ? t.game.damagePerSecond : t.towers.damage}
            current={isFlame ? `${currentStats.damage}` : currentStats.damage}
            next={canUpgrade ? (isFlame ? `${nextStats.damage}` : nextStats.damage) : undefined}
            showUpgrade={canUpgrade}
            tone="alarm"
          />
          <StatPill
            label={t.towers.range}
            current={currentStats.range}
            next={canUpgrade ? nextStats.range : undefined}
            showUpgrade={canUpgrade}
            tone="reach"
          />
          {!isFlame ? (
            <StatPill
              label={t.towers.fireRate}
              current={currentStats.fireRate.toFixed(1)}
              next={canUpgrade ? nextStats.fireRate.toFixed(1) : undefined}
              showUpgrade={canUpgrade}
              tone="caution"
            />
          ) : (
            <StatPill label={t.towers.fireRate} current="∞" showUpgrade={false} tone="caution" />
          )}
        </div>
        {identityPills.length > 0 && (
          <div className="mt-1 grid grid-cols-2 gap-1">
            {identityPills.map((pill) => (
              <StatPill
                key={`${pill.label}-${pill.current}`}
                label={pill.label}
                current={pill.current}
                showUpgrade={false}
                tone="muted"
              />
            ))}
          </div>
        )}
      </>
    );
  };

  const renderSynergy = () => {
    if (synergyMods.linkNames.length === 0) return null;
    return (
      <Deck className="arc-panel--flat flex items-start gap-2 border-l-2 border-l-[var(--arc-reach)] px-2 py-1.5">
        <LinkIcon2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--arc-reach)]" />
        <div className="min-w-0">
          <div className="arc-label">{t.game.towerSynergy.title}</div>
          <div className="mt-0.5 truncate text-[10.5px] text-[var(--arc-ink-2)]">{synergyMods.linkNames.join(' · ')}</div>
        </div>
      </Deck>
    );
  };

  const renderJammed = () => {
    if (!isJammed) return null;
    return (
      <Deck className="arc-panel--flat flex items-center gap-2 border-l-2 border-l-[var(--arc-alert)] px-2 py-1.5">
        <EmpIcon className="h-3 w-3 shrink-0 text-[var(--arc-alert)]" />
        <span className="arc-label flex-1">{t.game.jammedHud}</span>
        <span className="font-mono text-[11px] tabular-nums text-[var(--arc-alert)]">
          ×{jamFireRateMult.toFixed(2)}
        </span>
      </Deck>
    );
  };

  const renderCombatStats = () => {
    if (selectedTower.type === 'money') return null;
    const totalDmgDisplay = selectedTower.totalDamage >= 1000
      ? `${(selectedTower.totalDamage / 1000).toFixed(1)}K`
      : Math.floor(selectedTower.totalDamage);
    return (
      <Deck className="arc-panel--flat flex items-stretch">
        <div className="flex flex-1 items-center gap-1.5 border-r border-[var(--cn-line-soft)] px-2 py-1.5">
          <SkullIcon className="h-3 w-3 text-[var(--arc-ink-3)]" />
          <span className="arc-label flex-1 truncate">{t.game.killCount}</span>
          <span className="font-mono text-[12px] font-semibold tabular-nums text-[var(--arc-ink)]">
            {selectedTower.kills}
          </span>
        </div>
        <div className="flex flex-1 items-center gap-1.5 px-2 py-1.5">
          <SwordsIcon className="h-3 w-3 text-[var(--arc-ink-3)]" />
          <span className="arc-label flex-1 truncate">{t.game.totalDamageLabel}</span>
          <span className="font-mono text-[12px] font-semibold tabular-nums text-[var(--arc-ink)]">
            {totalDmgDisplay}
          </span>
        </div>
      </Deck>
    );
  };

  const renderPriority = () => {
    if (selectedTower.type === 'money') return null;
    return (
      <div>
        <SegHead label={t.towers.targetPriority} />
        <div className="mt-1.5 grid grid-cols-3 gap-px bg-[var(--arc-line)]">
          {priorityOptions.map(option => {
            const isActive = selectedTower.targetPriority === option.value;
            const disabled = tutorialActive && currentStep?.action !== 'change_priority';
            return (
              <button
                key={option.value}
                id={option.value === 'strongest' ? 'tutorial-target-priority' : undefined}
                type="button"
                className={`h-7 truncate px-1 font-mono text-[9.5px] transition-colors duration-[110ms] ${
                  isActive
                    ? 'bg-[var(--arc-gold-veil)] font-semibold text-[var(--arc-gold)]'
                    : disabled
                      ? 'cursor-not-allowed bg-[var(--arc-void-2)] text-[var(--arc-ink-4)] opacity-60'
                      : 'bg-[var(--arc-deck-2)] text-[var(--arc-ink-3)] hover:bg-[var(--arc-deck-3)] hover:text-[var(--arc-ink)]'
                }`}
                onClick={() => {
                  if (!tutorialActive || currentStep?.action === 'change_priority') {
                    setTowerPriority(selectedTower.id, option.value);
                    if (tutorialActive && option.value === 'strongest') {
                      useTutorialStore.getState().checkAction('change_priority', 'tutorial-target-priority');
                    }
                  }
                }}
                disabled={disabled}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSkill = () => {
    if (!selectedTower.skill) return null;
    const skillData = SKILL_DATA[selectedTower.skill.skillId];
    if (!skillData) return null;

    let cooldownPercent = getSkillCooldownPercent(selectedTower.skill.lastUsedTime, skillData.cooldown);
    let remainingCooldown = getSkillRemainingCooldown(selectedTower.skill.lastUsedTime, skillData.cooldown);
    let isReady = cooldownPercent >= 1;
    const isActive = selectedTower.skill.isActive;
    if (tutorialActive && currentStep?.action === 'use_skill') {
      isReady = true;
      cooldownPercent = 1;
      remainingCooldown = 0;
    }
    const clickable = isReady && !isActive && (!tutorialActive || currentStep?.action === 'use_skill');

    return (
      <button
        id="tutorial-target-use-skill"
        type="button"
        className={`arc-btn relative flex h-auto w-full items-center gap-2 overflow-hidden px-2 py-2 text-left ${
          isActive
            ? 'border-[var(--arc-gold)] bg-[var(--arc-gold-veil)]'
            : clickable
              ? 'border-[var(--arc-line-strong)] bg-[var(--arc-deck-2)] hover:border-[var(--arc-line-hot)]'
              : 'cursor-not-allowed border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] opacity-70'
        }`}
        onClick={() => {
          if (clickable) {
            activateSkill(selectedTower.id);
            if (tutorialActive) useTutorialStore.getState().checkAction('use_skill', 'tutorial-target-use-skill');
          }
        }}
        disabled={!clickable}
      >
        {!isReady && (
          <span
            className="pointer-events-none absolute inset-y-0 left-0 bg-[var(--arc-deck-3)]"
            style={{ width: `${cooldownPercent * 100}%` }}
          />
        )}
        <ThemeIcon icon={skillData.icon} className="relative h-4 w-4 shrink-0" />
        <span className="relative min-w-0 flex-1">
          <span className="block truncate text-[11.5px] font-medium text-[var(--arc-ink)]">{skillData.name}</span>
          <span className="mt-0.5 block truncate text-[9.5px] text-[var(--arc-ink-3)]">{skillData.description}</span>
        </span>
        <span
          className={`relative shrink-0 font-mono text-[10px] tabular-nums ${
            isReady ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-ink-3)]'
          }`}
        >
          {isReady ? t.game.skillReady : `${remainingCooldown}s`}
        </span>
      </button>
    );
  };

  const renderPathPicker = () => {
    if (!(showPathSelection && needsPathSelection && canUpgrade && branches)) return null;
    return (
      <motion.div className="space-y-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="flex items-center justify-between">
          <span className="arc-label">{t.towers.selectUpgradePath}</span>
          <button
            type="button"
            className="font-mono text-[10px] text-[var(--arc-ink-4)] hover:text-[var(--arc-ink)]"
            onClick={() => setShowPathSelection(false)}
          >
            {t.common.cancel}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {(['A', 'B'] as const).map((pathKey) => {
            const branch = pathKey === 'A' ? branches.pathA : branches.pathB;
            const levelBonus = branch.level2;
            return (
              <button
                key={pathKey}
                id={pathKey === 'A' ? 'tutorial-target-path-a' : undefined}
                type="button"
                className="group relative flex items-center gap-2 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-deck-2)] px-2 py-1.5 text-left transition-colors hover:border-[var(--arc-gold)] hover:bg-[var(--arc-gold-veil)]"
                onClick={() => handleUpgrade(pathKey)}
              >
                <span className="absolute right-1 top-1 font-mono text-[8.5px] uppercase text-[var(--arc-ink-4)]">
                  {formatUpgradePathTag(pathKey, t.towers.pathTag)}
                </span>
                <ThemeIcon icon={branch.icon} className="h-5 w-5 shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col pr-5">
                  <span className="truncate text-[11.5px] font-medium text-[var(--arc-ink)]">{branch.name}</span>
                  <span className="mt-0.5 flex items-center gap-1">
                    <ThemeIcon icon={levelBonus.icon} className="h-3 w-3 shrink-0 opacity-70" />
                    <span className="truncate text-[9.5px] text-[var(--arc-ink-3)]">{levelBonus.description}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="border-l-2 border-[var(--arc-caution)] px-2 py-1 font-mono text-[9.5px] text-[var(--arc-caution)]">
          {t.game.needFunds.replace('{cost}', String(upgradeCost))}
        </div>
      </motion.div>
    );
  };

  const renderUpgradeButton = () => {
    if (currentLevel >= maxLevel) {
      return (
        <Deck tone="sunken" className="flex items-center justify-center gap-2 py-2">
          <StarIcon className="h-3.5 w-3.5 text-[var(--arc-gold)]" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--arc-gold)]">
            {t.towers.maxLevel}
          </span>
        </Deck>
      );
    }
    if (showPathSelection && needsPathSelection) return null;
    const tutorialDisabled = tutorialActive && currentStep?.action !== 'upgrade_tower';
    return (
      <Btn
        id="tutorial-target-upgrade-tower"
        variant="signal"
        size="sm"
        block
        className={`flex items-center justify-center gap-2 font-semibold ${
          tutorialDisabled || !canUpgrade
            ? 'cursor-not-allowed border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] text-[var(--arc-ink-4)]'
            : 'border-[var(--arc-gold)] bg-[var(--arc-gold)] text-[var(--arc-gold-ink)] hover:brightness-110'
        }`}
        onClick={() => !tutorialDisabled && handleUpgrade()}
        disabled={!canUpgrade || tutorialDisabled}
      >
        <UpArrowIcon className="h-3.5 w-3.5" />
        <span className="text-[11.5px] uppercase tracking-[0.06em]">{t.towers.upgrade}</span>
        <span className="font-mono text-[11px] tabular-nums">${upgradeCost}</span>
      </Btn>
    );
  };

  const renderSecondaryActions = () => {
    const sellTutorialDisabled = tutorialActive && currentStep?.action !== 'sell_tower';
    const sellBlocked = selectedTower.locked || sellTutorialDisabled;
    return (
      <div className="grid gap-1">
        {!isFusionTower(selectedTower.type) && hasFusionPartner && !isFusionSource && (
          <Btn
            variant="line"
            size="sm"
            className={`flex items-center justify-center gap-1.5 font-mono uppercase tracking-[0.06em] ${
              canAffordFusion
                ? 'border-[var(--arc-line-strong)] text-[var(--arc-ink-2)] hover:brightness-110 hover:border-[var(--arc-caution)] hover:text-[var(--arc-caution)]'
                : 'cursor-not-allowed border-[var(--cn-line-soft)] text-[var(--arc-ink-4)]'
            }`}
            onClick={() => canAffordFusion && enterFusionMode(selectedTower.id)}
            disabled={!canAffordFusion}
          >
            <LinkIcon2 className="h-3 w-3" />
            <span>{t.towers.fusion.button}</span>
            <span className="tabular-nums">-${fusionCost}</span>
          </Btn>
        )}
        {isFusionSource && (
          <Btn
            variant="line"
            size="sm"
            className="flex items-center justify-center gap-1.5 border-[var(--arc-caution)] bg-[rgba(255,166,43,0.14)] font-mono uppercase tracking-[0.06em] text-[var(--arc-caution)] hover:brightness-110"
            onClick={() => cancelFusion()}
          >
            <LinkIcon2 className="h-3 w-3" />
            <span>{t.towers.fusion.cancel}</span>
          </Btn>
        )}

        <div className="grid gap-1" style={{ gridTemplateColumns: canUndo ? '1fr 1fr auto' : '1fr auto' }}>
          <Btn
            id="tutorial-target-sell-tower"
            variant="danger"
            size="sm"
            className={`flex items-center justify-center gap-1 font-mono uppercase tracking-[0.06em] ${
              sellBlocked
                ? 'cursor-not-allowed border-[var(--cn-line-soft)] bg-transparent text-[var(--arc-ink-4)] shadow-none'
                : ''
            }`}
            onClick={() => {
              if (sellBlocked) return;
              const intent = requestSellTower({
                towerId: selectedTower.id,
                name: selectedTower.customName || data.name,
                cost: data.cost,
                confirmSell,
                locked: selectedTower.locked,
              });
              if (intent !== 'sell_now') return;
              sellTower(selectedTower);
              if (tutorialActive) useTutorialStore.getState().checkAction('sell_tower', 'tutorial-target-sell-tower');
            }}
            disabled={sellBlocked}
          >
            {selectedTower.locked ? <ShieldLockIcon className="h-3 w-3" /> : null}
            <span>{t.towers.sell}</span>
            <span className="tabular-nums">+${sellPrice}</span>
          </Btn>
          {canUndo && (
            <Btn
              variant="line"
              size="sm"
              className={`flex items-center justify-center gap-1 font-mono uppercase tracking-[0.06em] ${
                tutorialActive
                  ? 'cursor-not-allowed border-[var(--cn-line-soft)] text-[var(--arc-ink-4)] opacity-60'
                  : 'border-[var(--arc-line-strong)] text-[var(--arc-ink-2)] hover:brightness-110 hover:border-[var(--arc-line-hot)] hover:text-[var(--arc-ink)]'
              }`}
              onClick={() => !tutorialActive && undoUpgrade()}
              disabled={tutorialActive}
            >
              <UpArrowIcon className="h-3 w-3 rotate-180" />
              <span>{t.towers.undoUpgrade}</span>
            </Btn>
          )}
          <IconBtn
            label={getTowerLockTitle(Boolean(selectedTower.locked), t.towers.lock, t.towers.unlock)}
            className={`flex h-8 w-8 items-center justify-center rounded-sm px-0 ${
              selectedTower.locked
                ? 'border-[var(--arc-caution)] bg-[rgba(255,166,43,0.14)] text-[var(--arc-caution)]'
                : 'border-[var(--cn-line-soft)] text-[var(--arc-ink-3)] hover:brightness-110 hover:border-[var(--arc-line-hot)] hover:text-[var(--arc-ink)]'
            }`}
            onClick={() => toggleTowerLock(selectedTower.id)}
          >
            <LockIcon className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>
    );
  };

  return createPortal(
    <motion.div
      ref={panelRef}
      className="fixed z-[100] w-[304px]"
      style={{ left: panelX, top: panelTopFinal, width: panelWidth }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Deck notch className="flex max-h-[calc(100vh-96px)] flex-col overflow-hidden">
        <header className="flex items-start gap-2 border-b border-[var(--cn-line-soft)] px-2.5 py-2">
          <div className="min-w-0 flex-1">
            <div className="arc-label">tower / inspect</div>
            <div className="mt-1.5">{renderHeader()}</div>
          </div>
          <IconBtn
            label={t.common.close}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm px-0 text-[var(--arc-ink-3)] hover:text-[var(--arc-alert)]"
            onClick={() => selectTower(null)}
          >
            <CrossIcon className="h-3 w-3" />
          </IconBtn>
        </header>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2.5 py-2">
          {renderStatsGrid()}
          {renderJammed()}
          {renderSynergy()}
          {renderCombatStats()}
          {renderPriority()}
          {selectedTower.skill && renderSkill()}

          <AnimatePresence>
            {showPathSelection && needsPathSelection && canUpgrade && branches && renderPathPicker()}
          </AnimatePresence>
        </div>

        <footer className="space-y-1 border-t border-[var(--cn-line-soft)] p-2">
          {renderUpgradeButton()}
          {renderSecondaryActions()}
        </footer>
      </Deck>
    </motion.div>,
    document.body
  );
};
