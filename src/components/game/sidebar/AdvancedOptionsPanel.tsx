import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { GAME_CONSTANTS } from '@/data/gameData';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { BrainIcon, RobotIcon, SparklesIcon, UpArrowIcon } from '@/components/ui/Icons';
import { Btn, SegHead } from '@/components/hl';
import { AUTO_BATTLE_PRESETS } from '@/data/autobattle/presets';
import { formatNarration } from '@/components/game/autobattle/formatNarration';

interface AdvancedOptionsPanelProps {
  show: boolean;
}

const ROW =
  'flex items-center justify-between gap-2 border-b border-[var(--arc-line)] py-1.5 last:border-b-0';

export const AdvancedOptionsPanel = ({ show }: AdvancedOptionsPanelProps) => {
  const { t } = useTranslation();
  const batchUpgrade = useGameStore((s) => s.batchUpgrade);
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const autoBattlePresetId = useGameStore((s) => s.autoBattlePresetId);
  const setAutoBattlePreset = useGameStore((s) => s.setAutoBattlePreset);
  const autoBattleDecisions = useGameStore((s) => s.autoBattleDecisions);
  const autoBattleDryRun = useGameStore((s) => s.autoBattleDryRun);
  const setAutoBattleDryRun = useGameStore((s) => s.setAutoBattleDryRun);
  const autoBattleShowOverlay = useGameStore((s) => s.autoBattleShowOverlay);
  const setAutoBattleOverlay = useGameStore((s) => s.setAutoBattleOverlay);
  const setAutoBattlePanelOpen = useGameStore((s) => s.setAutoBattlePanelOpen);
  const canBatchUpgrade = useGameStore((s) => s.towers.some(t => t.level >= 2 && t.level < GAME_CONSTANTS.MAX_TOWER_LEVEL));
  const autoSkipWave = useGameStore((s) => s.autoSkipWave);
  const toggleAutoSkipWave = useGameStore((s) => s.toggleAutoSkipWave);
  const [batchUpgradeResult, setBatchUpgradeResult] = useState<{ upgraded: number; cost: number } | null>(null);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-t border-[var(--arc-line)] bg-[var(--arc-void-2)]"
        >
          <div className="max-h-64 space-y-3 overflow-y-auto p-2.5">

            <div className="space-y-1.5">
              <AnimatePresence>
                {batchUpgradeResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`border-l-2 px-2 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.06em] ${
                      batchUpgradeResult.upgraded > 0
                        ? 'border-[var(--arc-vital)] text-[var(--arc-vital)]'
                        : 'border-[var(--arc-line-strong)] text-[var(--arc-ink-3)]'
                    }`}
                  >
                    {batchUpgradeResult.upgraded > 0 ? t.game.batchUpgradeSimple.replace('{count}', String(batchUpgradeResult.upgraded)) : t.game.noUpgradeable}
                  </motion.div>
                )}
              </AnimatePresence>

              <Btn
                variant="line"
                size="sm"
                block
                icon={<UpArrowIcon className="h-3.5 w-3.5" />}
                onClick={() => { const result = batchUpgrade(); setBatchUpgradeResult(result); setTimeout(() => setBatchUpgradeResult(null), 2500); }}
                disabled={!canBatchUpgrade}
              >
                {t.towers.batchUpgrade}
              </Btn>
            </div>

            <div>
              <SegHead label={t.game.aiStrategy} right={<RobotIcon className="h-3.5 w-3.5 text-[var(--arc-ink-3)]" />} />
              <div className="mt-1.5 grid grid-cols-3 gap-px overflow-hidden rounded-sm bg-[var(--arc-line)]">
                {AUTO_BATTLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`flex h-8 items-center justify-center font-mono text-[10px] uppercase tracking-[0.06em] transition-colors duration-[110ms] ${
                      autoBattlePresetId === preset.id
                        ? 'bg-[var(--arc-gold-veil)] font-semibold text-[var(--arc-gold)]'
                        : 'bg-[var(--arc-deck-2)] text-[var(--arc-ink-3)] hover:bg-[var(--arc-deck-3)] hover:text-[var(--arc-ink)]'
                    }`}
                    onClick={() => setAutoBattlePreset(preset.id)}
                    title={t.content.autoBattle.presetLabel}
                  >
                    {preset.id}
                  </button>
                ))}
              </div>

              <div className="mt-1.5">
                <label className={`${ROW} cursor-pointer text-[var(--arc-ink-3)] hover:text-[var(--arc-ink)]`}>
                  <span className="arc-label flex items-center gap-1.5"><SparklesIcon className="h-3 w-3" />{t.content.autoBattle.overlay}</span>
                  <ToggleSwitch enabled={autoBattleShowOverlay} onToggle={() => setAutoBattleOverlay(!autoBattleShowOverlay)} size="sm" activeColor="cyan" />
                </label>
                <label className={`${ROW} cursor-pointer text-[var(--arc-ink-3)] hover:text-[var(--arc-ink)]`}>
                  <span className="arc-label flex items-center gap-1.5"><BrainIcon className="h-3 w-3" />{t.content.autoBattle.dryRun}</span>
                  <ToggleSwitch enabled={autoBattleDryRun} onToggle={() => setAutoBattleDryRun(!autoBattleDryRun)} size="sm" activeColor="purple" />
                </label>
              </div>

              <Btn
                variant="line"
                size="sm"
                block
                icon={<RobotIcon className="h-3.5 w-3.5" />}
                onClick={() => setAutoBattlePanelOpen(true)}
              >
                {t.content.autoBattle.open}
              </Btn>
            </div>

            {autoBattleEnabled && autoBattleDecisions.length > 0 && (
              <div>
                <SegHead
                  label={t.content.autoBattle.tabs.timeline}
                  right={<span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">{autoBattleDecisions.length}</span>}
                />
                <div className="mt-1.5 max-h-32 space-y-px overflow-y-auto rounded-sm bg-[var(--arc-line)]">
                  {autoBattleDecisions.slice(0, 6).map((decision) => (
                    <div key={decision.id} className="border-l-2 border-[var(--arc-line)] bg-[var(--arc-deck)] px-2 py-1 font-mono text-[9.5px] text-[var(--arc-ink-2)]">
                      <span className="block truncate">
                        {formatNarration(
                          (t.content.autoBattle.narration as Record<string, string>)[decision.narrationKey.split('.').pop() ?? ''] ?? '',
                          decision.narrationParams,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className={`${ROW} cursor-pointer text-[var(--arc-ink-3)] hover:text-[var(--arc-ink)]`}>
                <span className="arc-label flex items-center gap-1.5"><SkipForwardIcon className="h-3 w-3" />{t.game.autoStartNextWave}</span>
                <ToggleSwitch enabled={autoSkipWave} onToggle={toggleAutoSkipWave} size="sm" activeColor="orange" />
              </label>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
