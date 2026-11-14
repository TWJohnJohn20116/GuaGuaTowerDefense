import { motion } from 'framer-motion';
import { HeartIcon, SnowflakeIcon, SkullIcon, SparklesIcon, Tornado2Icon, EyeIcon, ShieldIcon, FlameIcon } from '@/components/ui/Icons';
import { ENEMY_DATA } from '@/data/gameData';
import { isEnemyStealthed, isEnemyPhased } from '@/store/gameStoreUtils';
import type { Enemy } from '@/types/game';
import EnemyPreview from '@/components/ui/EnemyPreview';
import { useTranslation } from '@/i18n';

export const EnemyTooltip = ({ enemy, x, y }: { enemy: Enemy | null; x: number; y: number }) => {
  const { t } = useTranslation();
  if (!enemy) return null;

  const enemyData = ENEMY_DATA[enemy.type];
  const healthPercent = (enemy.health / enemyData.health) * 100;

  const slowEffect = enemy.effects.find(e => e.type === 'slow');
  const poisonEffect = enemy.effects.find(e => e.type === 'poison');
  const berserkEffect = enemy.effects.find(e => e.type === 'berserk');
  const windEffect = enemy.isDisplaced ? true : false;
  const now = Date.now();
  const stealthed = isEnemyStealthed(enemy, now);
  const phased = isEnemyPhased(enemy, now);
  const shieldValue = enemy.shield ?? 0;

  const chip = 'border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--hl-ink-2)]';

  return (
    <motion.div
      className="pointer-events-none absolute z-50"
      style={{ left: x + 15, top: y - 10 }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12 }}
    >
      <div className="min-w-[196px] border border-[var(--hl-line)] bg-[var(--hl-deck)] p-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--hl-line)]">
            <EnemyPreview enemyId={enemy.type} color={enemyData.color} size={26} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold text-[var(--hl-ink)]">{enemyData.name}</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--hl-ink-4)]">{enemy.type}</div>
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline justify-between">
            <span className="hl-label flex items-center gap-1"><HeartIcon className="h-2.5 w-2.5 text-[var(--hl-alarm)]" /> {t.game.enemyTooltipHealth}</span>
            <span className="font-mono text-[10.5px] font-semibold tabular-nums text-[var(--hl-ink)]">
              {Math.ceil(enemy.health)} / {enemyData.health}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
            <motion.div
              className="h-full"
              style={{
                width: `${healthPercent}%`,
                backgroundColor: healthPercent > 50 ? 'var(--hl-vital)' : healthPercent > 25 ? 'var(--hl-caution)' : 'var(--hl-alarm)',
              }}
              initial={false}
              animate={{ width: `${healthPercent}%` }}
            />
          </div>
          {enemy.maxShield ? (
            <div className="mt-1.5">
              <div className="flex items-baseline justify-between">
                <span className="hl-label flex items-center gap-1"><ShieldIcon className="h-2.5 w-2.5 text-[var(--hl-reach)]" /> {t.game.enemyTooltipShield}</span>
                <span className="font-mono text-[10.5px] tabular-nums text-[var(--hl-ink)]">
                  {Math.ceil(shieldValue)} / {enemy.maxShield}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
                <motion.div
                  className="h-full bg-[var(--hl-reach)]"
                  initial={false}
                  animate={{ width: `${Math.min(100, (shieldValue / enemy.maxShield) * 100)}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-px bg-[var(--hl-line)]">
          {[
            { label: t.game.enemyTooltipSpeed, value: `${enemyData.speed.toFixed(1)}x`, tone: 'text-[var(--hl-reach)]' },
            { label: t.game.enemyTooltipReward, value: `$${enemyData.reward}`, tone: 'text-[var(--hl-caution)]' },
            { label: t.game.enemyTooltipSize, value: String(enemyData.size), tone: 'text-[var(--hl-ink)]' },
            { label: t.game.enemyTooltipProgress, value: `${Math.floor(enemy.progress * 100)}%`, tone: 'text-[var(--hl-ink)]' },
          ].map((cell) => (
            <div key={cell.label} className="flex items-baseline justify-between gap-1.5 bg-[var(--hl-deck)] px-1.5 py-1">
              <span className="font-mono text-[8.5px] uppercase tracking-[0.06em] text-[var(--hl-ink-4)]">{cell.label}</span>
              <span className={`font-mono text-[10px] font-semibold tabular-nums ${cell.tone}`}>{cell.value}</span>
            </div>
          ))}
        </div>

        {(enemy.effects.length > 0 || windEffect || stealthed || phased) && (
          <div className="mt-2 border-t border-[var(--hl-line)] pt-2">
            <div className="hl-label mb-1.5">{t.game.enemyTooltipStatusEffects}</div>
            <div className="flex flex-wrap gap-1">
              {stealthed && (
                <span className={chip}><EyeIcon className="mr-1 inline h-2.5 w-2.5" />{t.game.enemyTooltipStealthActive}</span>
              )}
              {phased && (
                <span className={chip}><SparklesIcon className="mr-1 inline h-2.5 w-2.5 text-[var(--hl-reach)]" />{t.game.enemyTooltipPhaseActive}</span>
              )}
              {berserkEffect && (
                <span className={`${chip} text-[var(--hl-alarm)]`}><FlameIcon className="mr-1 inline h-2.5 w-2.5" />{t.game.enemyTooltipBerserkActive}</span>
              )}
              {windEffect && (
                <span className={chip}><Tornado2Icon className="mr-1 inline h-2.5 w-2.5 text-[var(--hl-reach)]" />{t.game.enemyTooltipKnockback}</span>
              )}
              {slowEffect && (
                <span className={`${chip} text-[var(--hl-reach)]`}><SnowflakeIcon className="mr-1 inline h-2.5 w-2.5" />{t.game.enemyTooltipSlowPct.replace('{pct}', String(Math.round((1 - (slowEffect.value || 0.5)) * 100)))}</span>
              )}
              {poisonEffect && (
                <span className={`${chip} text-[var(--hl-vital)]`}><SkullIcon className="mr-1 inline h-2.5 w-2.5" />{t.game.enemyTooltipPoison}</span>
              )}
            </div>
          </div>
        )}

        {enemyData.ability && (
          <div className="mt-2 border-t border-[var(--hl-line)] pt-2">
            <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--hl-ink-3)]">
              <SparklesIcon className="h-2.5 w-2.5" />
              {t.encyclopedia.abilities[enemyData.ability as keyof typeof t.encyclopedia.abilities] || enemyData.ability}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
