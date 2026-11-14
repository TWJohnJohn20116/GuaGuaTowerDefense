import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameTowerData } from './types';
import TowerPreview from '@/components/ui/TowerPreview';
import {
  LockIcon, CoinIcon, PuzzleIcon,
} from '@/components/ui/Icons';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from '@/store/tutorialStore';
import { useShopStore } from '@/store/shopStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { TowerButtonSize, TowerDisplayMode } from '@/store/settingsStore';
import type { TowerType } from '@/types/game';
import { useTranslation } from '@/i18n';
import { getDiscountedTowerCost } from '@/data/tacticalProtocolData';

const SIZE_TO_BUTTON: Record<TowerButtonSize, {
  container: string;
  preview: number;
  nameSize: string;
  costSize: string;
  compactCost: string;
}> = {
  small: {
    container: 'min-h-[68px] p-1.5',
    preview: 26,
    nameSize: 'text-[9px]',
    costSize: 'text-[9px]',
    compactCost: 'text-[9px]',
  },
  medium: {
    container: 'min-h-[96px] p-2',
    preview: 34,
    nameSize: 'text-[10.5px]',
    costSize: 'text-[10px]',
    compactCost: 'text-[10px]',
  },
  large: {
    container: 'min-h-[128px] p-2.5',
    preview: 48,
    nameSize: 'text-[11.5px]',
    costSize: 'text-[11px]',
    compactCost: 'text-[11px]',
  },
};

/** 造價：mono 方框，買不起＝alarm 線 */
function CostBadge({
  cost,
  cannotAfford,
  sizeClass,
  className = '',
}: {
  cost: number;
  cannotAfford: boolean;
  sizeClass: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1 py-0.5 font-mono tabular-nums leading-none ${
        cannotAfford
          ? 'border-[rgba(255,75,62,0.45)] text-[var(--hl-alarm)]'
          : 'border-[var(--hl-line-strong)] text-[var(--hl-caution)]'
      } ${sizeClass} ${className}`}
    >
      <CoinIcon className="h-2.5 w-2.5 shrink-0" />
      {cost}
    </span>
  );
}

export const TowerButton = ({
  towerId,
  towerData,
  isModContent,
}: {
  towerId: string;
  towerData: GameTowerData;
  isModContent: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const money = useGameStore((s) => s.money);
  const selectedTowerType = useGameStore((s) => s.selectedTowerType);
  const selectTowerType = useGameStore((s) => s.selectTowerType);
  const mutatorRules = useGameStore((s) => s.mutatorRules);
  const towerCostMult = useGameStore((s) => s.difficultyModifiers.towerCostMult);
  const protocolDiscount = useGameStore((s) => s.protocolNextTowerDiscount);
  const displayCost = getDiscountedTowerCost(
    Math.round(towerData.cost * towerCostMult),
    protocolDiscount,
  );
  const unlockedTowers = useShopStore((s) => s.unlockedTowers);
  const buttonSize: TowerButtonSize = useSettingsStore((s) => s.hudLayout.towerButtonSize);
  const displayMode: TowerDisplayMode = useSettingsStore((s) => s.hudLayout.towerDisplayMode);
  const sizeCfg = SIZE_TO_BUTTON[buttonSize];
  const { t } = useTranslation();

  const { isActive, currentStepIndex, checkAction } = useTutorialStore();
  const currentStep = INTERACTIVE_TUTORIAL_STEPS[currentStepIndex];

  const isTemporarilyUnlocked = isActive && (towerId === 'sniper' || towerId === 'frost');
  const isLocked = !isModContent && !unlockedTowers.includes(towerId as TowerType) && !isTemporarilyUnlocked;
  const isBanned = mutatorRules?.bannedTowerTypes?.includes(towerId as TowerType) ?? false;
  const cannotAfford = !isLocked && !isBanned && money < displayCost;

  const selected = selectedTowerType === towerId;
  const disabled = isLocked || isBanned || cannotAfford;

  let isTutorialLocked = false;
  if (isActive) {
    isTutorialLocked = currentStep?.targetId !== `tutorial-target-tower-${towerId}`;
  }

  const isInteractive = !disabled && !isTutorialLocked;

  const onClick = () => {
    if (isInteractive) {
      selectTowerType(selectedTowerType === towerId ? null : towerId as TowerType);
      if (isActive && currentStep?.targetId === `tutorial-target-tower-${towerId}`) {
        checkAction('click', `tutorial-target-tower-${towerId}`);
      }
    }
  };

  const handleMouseEnter = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const tooltipWidth = 224;
      const tooltipHeight = 280;
      const tooltipGap = 12;
      const leftPos = rect.left - tooltipWidth - tooltipGap;
      const finalLeft = leftPos > 8 ? leftPos : rect.right + tooltipGap;
      const preferredTop = rect.top;
      const finalTop = preferredTop + tooltipHeight > window.innerHeight - 12
        ? Math.max(12, window.innerHeight - tooltipHeight - 12)
        : Math.max(12, preferredTop);
      setTooltipPos({ top: finalTop, left: finalLeft });
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const dps = towerData.fireRate
    ? (towerData.damage * towerData.fireRate).toFixed(1)
    : towerData.damagePerSecond?.toFixed(1) ?? '—';

  const lockReason = isBanned
    ? t.game.towerTooltipBanned
    : isLocked
      ? t.game.towerTooltipLocked
      : cannotAfford
        ? t.game.towerTooltipNoMoney
        : null;

  const buttonClass = [
    'tower-btn relative w-full',
    sizeCfg.container,
    selected ? 'selected' : '',
    isBanned ? '!border-[var(--hl-alarm)]' : '',
    isLocked ? 'disabled' : '',
    cannotAfford && !isLocked && !isBanned ? 'disabled' : '',
    isTutorialLocked ? 'cursor-not-allowed opacity-30' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <button
        ref={buttonRef}
        id={`tutorial-target-tower-${towerId}`}
        type="button"
        className={buttonClass}
        onClick={onClick}
        disabled={disabled || isTutorialLocked}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`flex h-full flex-col items-center justify-between gap-1 ${displayMode === 'compact' ? 'relative' : ''}`}>
          <TowerPreview towerId={towerId} size={sizeCfg.preview} />

          {displayMode === 'compact' && (
            <div className="absolute bottom-0 right-0">
              <CostBadge
                cost={displayCost}
                cannotAfford={cannotAfford}
                sizeClass={sizeCfg.compactCost}
              />
            </div>
          )}

          {displayMode !== 'compact' && (
            <>
              <div className={`${sizeCfg.nameSize} w-full truncate text-center font-medium leading-tight text-[var(--hl-ink)]`}>
                {towerData.name}
              </div>
              <CostBadge
                cost={displayCost}
                cannotAfford={cannotAfford}
                sizeClass={sizeCfg.costSize}
              />
            </>
          )}

          {displayMode === 'detailed' && (
            <div className="grid w-full grid-cols-3 gap-px bg-[var(--hl-line)]">
              {[
                { label: t.game.towerTooltipDamage, value: String(towerData.damage) },
                { label: t.game.towerTooltipRange, value: String(towerData.range) },
                { label: t.game.towerTooltipDps, value: dps },
              ].map((cell) => (
                <span key={cell.label} className="flex flex-col items-center bg-[var(--hl-void-2)] px-0.5 py-0.5">
                  <span className="font-mono text-[7.5px] uppercase tracking-[0.06em] text-[var(--hl-ink-4)]">
                    {cell.label}
                  </span>
                  <span className="font-mono text-[9px] font-semibold tabular-nums text-[var(--hl-ink-2)]">
                    {cell.value}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {isModContent && (
          <span
            className="absolute -right-px -top-px flex h-4 items-center border border-[var(--hl-line-strong)] bg-[var(--hl-void-2)] px-1 font-mono text-[8px] uppercase tracking-[0.06em] text-[var(--hl-ink-3)]"
            title={towerData.modName ?? 'MOD'}
          >
            <PuzzleIcon className="h-2 w-2" />
          </span>
        )}

        {isLocked && (
          <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[rgba(6,7,10,0.72)]">
            <LockIcon className="h-4 w-4 text-[var(--hl-ink-3)]" />
            <span className="hl-label">{t.game.towerTooltipLocked}</span>
          </span>
        )}

        {isBanned && !isLocked && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[rgba(6,7,10,0.72)]">
            <span className="border border-[rgba(255,75,62,0.5)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--hl-alarm)]">
              {t.game.towerBanned}
            </span>
          </span>
        )}

        {cannotAfford && !isLocked && !isBanned && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[rgba(255,75,62,0.5)]" />
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {isHovered && (
            <motion.div
              key={`tooltip-${towerId}`}
              className="pointer-events-none fixed z-[9999] w-56 border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3"
              style={{ top: tooltipPos.top, left: tooltipPos.left }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <div className="mb-2 flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--hl-line)]">
                  <TowerPreview towerId={towerId} size={26} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[var(--hl-ink)]">{towerData.name}</div>
                  {isModContent && towerData.modName && (
                    <div className="mt-0.5 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--hl-ink-3)]">
                      <PuzzleIcon className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{towerData.modName}</span>
                    </div>
                  )}
                </div>
              </div>

              {lockReason && (
                <p
                  className={`mb-2 border-l-2 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.06em] ${
                    cannotAfford
                      ? 'border-[var(--hl-caution)] text-[var(--hl-caution)]'
                      : 'border-[var(--hl-alarm)] text-[var(--hl-alarm)]'
                  }`}
                >
                  {lockReason}
                </p>
              )}

              {towerData.description && (
                <p className="mb-2.5 text-[10.5px] leading-relaxed text-[var(--hl-ink-3)]">{towerData.description}</p>
              )}

              <div className="border-t border-[var(--hl-line)]">
                {[
                  { label: t.game.towerTooltipDamage, value: String(towerData.damage) },
                  { label: t.game.towerTooltipRange, value: String(towerData.range) },
                  { label: t.game.towerTooltipFireRate, value: `${towerData.fireRate?.toFixed(1) ?? '—'}/s` },
                  { label: t.game.towerTooltipDps, value: dps },
                  { label: t.game.towerTooltipPrice, value: `$${displayCost}` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-baseline justify-between border-b border-[var(--hl-line)] py-1 last:border-b-0"
                  >
                    <span className="hl-label">{stat.label}</span>
                    <span
                      className={`font-mono text-[11px] font-semibold tabular-nums ${
                        stat.label === t.game.towerTooltipPrice && cannotAfford
                          ? 'text-[var(--hl-alarm)]'
                          : 'text-[var(--hl-ink)]'
                      }`}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {(towerData.slowEffect || towerData.poisonEffect || towerData.splash || towerData.lightningEffect) && (
                <div className="mt-2 border-t border-[var(--hl-line)] pt-2">
                  <div className="hl-label mb-1.5">{t.game.towerTooltipSpecialEffects}</div>
                  <div className="flex flex-wrap gap-1">
                    {towerData.slowEffect && (
                      <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--hl-reach)]">
                        {t.game.slow}
                      </span>
                    )}
                    {towerData.poisonEffect && (
                      <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--hl-vital)]">
                        {t.game.poisonDmg}
                      </span>
                    )}
                    {towerData.splash && (
                      <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--hl-caution)]">
                        {t.game.splashDmg}
                      </span>
                    )}
                    {towerData.lightningEffect && (
                      <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--hl-caution)]">
                        {t.game.chainTargets}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};
