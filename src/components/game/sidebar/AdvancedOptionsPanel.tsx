import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { GAME_CONSTANTS } from '@/data/gameData';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import {
  CoinIcon, BrainIcon, UpArrowIcon, RobotIcon,
  ScalesIcon, SwordsIcon, ShieldIcon, ConstructionIcon,
  LightningIcon, SkipForwardIcon, TrashIcon, SparklesIcon,
} from '@/components/ui/Icons';
import { Btn, SegHead } from '@/components/hl';

interface AdvancedOptionsPanelProps {
  show: boolean;
}

const ROW =
  'flex items-center justify-between gap-2 border-b border-[var(--hl-line)] py-1.5 last:border-b-0';

export const AdvancedOptionsPanel = ({ show }: AdvancedOptionsPanelProps) => {
  const { t } = useTranslation();
  const batchUpgrade = useGameStore((s) => s.batchUpgrade);
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const setAutoBattleStrategy = useGameStore((s) => s.setAutoBattleStrategy);
  const autoBattleStrategy = useGameStore((s) => s.autoBattleStrategy);
  const autoBattleConfig = useGameStore((s) => s.autoBattleConfig);
  const setAutoBattleConfig = useGameStore((s) => s.setAutoBattleConfig);
  const autoBattleLogs = useGameStore((s) => s.autoBattleLogs);
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
          className="overflow-hidden border-t border-[var(--hl-line)] bg-[var(--hl-void-2)]"
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
                        ? 'border-[var(--hl-vital)] text-[var(--hl-vital)]'
                        : 'border-[var(--hl-line-strong)] text-[var(--hl-ink-3)]'
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
              <SegHead label={t.game.aiStrategy} right={<RobotIcon className="h-3.5 w-3.5 text-[var(--hl-ink-3)]" />} />
              <div className="mt-1.5 grid grid-cols-4 gap-px bg-[var(--hl-line)]">
                {([
                  { id: 'balanced', icon: <ScalesIcon className="h-3.5 w-3.5" />, tip: t.game.balanced },
                  { id: 'economy', icon: <CoinIcon className="h-3.5 w-3.5" />, tip: t.game.economy },
                  { id: 'aggressive', icon: <SwordsIcon className="h-3.5 w-3.5" />, tip: t.game.aggressive },
                  { id: 'defensive', icon: <ShieldIcon className="h-3.5 w-3.5" />, tip: t.game.defensive },
                ] as const).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`flex h-8 items-center justify-center transition-colors duration-[110ms] ${
                      autoBattleStrategy === s.id
                        ? 'bg-[var(--hl-signal-veil)] text-[var(--hl-signal)]'
                        : 'bg-[var(--hl-deck-2)] text-[var(--hl-ink-3)] hover:bg-[var(--hl-deck-3)] hover:text-[var(--hl-ink)]'
                    }`}
                    onClick={() => setAutoBattleStrategy(s.id)}
                    title={s.tip}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>

              <div className="mt-1.5">
                <label className={`${ROW} cursor-pointer text-[var(--hl-ink-3)] hover:text-[var(--hl-ink)]`}>
                  <span className="hl-label flex items-center gap-1.5"><ConstructionIcon className="h-3 w-3" />{t.game.aiAutoPlace}</span>
                  <ToggleSwitch enabled={autoBattleConfig.autoPlace} onToggle={() => setAutoBattleConfig({ autoPlace: !autoBattleConfig.autoPlace })} size="sm" activeColor="green" />
                </label>
                <label className={`${ROW} cursor-pointer text-[var(--hl-ink-3)] hover:text-[var(--hl-ink)]`}>
                  <span className="hl-label flex items-center gap-1.5"><UpArrowIcon className="h-3 w-3" />{t.game.aiAutoUpgrade}</span>
                  <ToggleSwitch enabled={autoBattleConfig.autoUpgrade} onToggle={() => setAutoBattleConfig({ autoUpgrade: !autoBattleConfig.autoUpgrade })} size="sm" activeColor="blue" />
                </label>
                <label className={`${ROW} cursor-pointer text-[var(--hl-ink-3)] hover:text-[var(--hl-ink)]`}>
                  <span className="hl-label flex items-center gap-1.5"><LightningIcon className="h-3 w-3" />{t.game.aiAutoSkill}</span>
                  <ToggleSwitch enabled={autoBattleConfig.useSkills} onToggle={() => setAutoBattleConfig({ useSkills: !autoBattleConfig.useSkills })} size="sm" activeColor="yellow" />
                </label>
                <label className={`${ROW} cursor-pointer text-[var(--hl-ink-3)] hover:text-[var(--hl-ink)]`}>
                  <span className="hl-label flex items-center gap-1.5"><SkipForwardIcon className="h-3 w-3" />{t.game.aiAutoSkip}</span>
                  <ToggleSwitch enabled={autoBattleConfig.autoSkip} onToggle={() => setAutoBattleConfig({ autoSkip: !autoBattleConfig.autoSkip })} size="sm" activeColor="purple" />
                </label>
                <label className={`${ROW} cursor-pointer text-[var(--hl-ink-3)] hover:text-[var(--hl-ink)]`}>
                  <span className="hl-label flex items-center gap-1.5"><TrashIcon className="h-3 w-3" />{t.game.aiAutoSell}</span>
                  <ToggleSwitch enabled={autoBattleConfig.autoSell} onToggle={() => setAutoBattleConfig({ autoSell: !autoBattleConfig.autoSell })} size="sm" activeColor="orange" />
                </label>
                {/* 融合：預設關閉（會吃掉兩座塔），但必須有入口，否則 AI 的融合評分永遠不會執行 */}
                <label className={`${ROW} cursor-pointer text-[var(--hl-ink-3)] hover:text-[var(--hl-ink)]`}>
                  <span className="hl-label flex items-center gap-1.5"><SparklesIcon className="h-3 w-3" />{t.game.aiAutoFusion}</span>
                  <ToggleSwitch enabled={autoBattleConfig.autoFusion} onToggle={() => setAutoBattleConfig({ autoFusion: !autoBattleConfig.autoFusion })} size="sm" activeColor="cyan" />
                </label>
              </div>
            </div>

            {autoBattleEnabled && autoBattleLogs.length > 0 && (
              <div>
                <SegHead
                  label={t.game.aiLog}
                  right={<span className="flex items-center gap-1.5"><BrainIcon className="h-3.5 w-3.5 text-[var(--hl-ink-3)]" /><span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">{autoBattleLogs.length}</span></span>}
                />
                <div className="mt-1.5 max-h-32 space-y-px overflow-y-auto bg-[var(--hl-line)]">
                  {autoBattleLogs.slice(0, 8).map((log) => (
                    <div
                      key={log.id}
                      className={`border-l-2 bg-[var(--hl-deck)] px-2 py-1 font-mono text-[9.5px] ${
                        log.type === 'place' ? 'border-[var(--hl-vital)] text-[var(--hl-vital)]'
                        : log.type === 'upgrade' ? 'border-[var(--hl-reach)] text-[var(--hl-reach)]'
                        : log.type === 'skill' ? 'border-[var(--hl-caution)] text-[var(--hl-caution)]'
                        : log.type === 'skip' ? 'border-[var(--hl-ink-3)] text-[var(--hl-ink-2)]'
                        : log.type === 'sell' ? 'border-[var(--hl-alarm)] text-[var(--hl-alarm)]'
                        : 'border-[var(--hl-line)] text-[var(--hl-ink-2)]'
                      }`}
                    >
                      <span className="block truncate">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className={`${ROW} cursor-pointer text-[var(--hl-ink-3)] hover:text-[var(--hl-ink)]`}>
                <span className="hl-label flex items-center gap-1.5"><SkipForwardIcon className="h-3 w-3" />{t.game.autoStartNextWave}</span>
                <ToggleSwitch enabled={autoSkipWave} onToggle={toggleAutoSkipWave} size="sm" activeColor="orange" />
              </label>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
