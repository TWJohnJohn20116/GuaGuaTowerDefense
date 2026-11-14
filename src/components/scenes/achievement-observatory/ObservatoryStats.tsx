/**
 * 成就觀測站 · 總覽（HARDLINE：計量 + 稀有度分佈，稀有度只走資料色）
 */
import { useTranslation } from '@/i18n';
import { RARITY_CONFIG } from '@/types/achievement';
import { Meter, SegHead, StatCell } from '@/components/hl';
import { RARITY_ORDER, RARITY_TONE, TONE_TEXT, TONE_FILL, formatNum } from './observatoryShared';

interface Props {
  earnedCount: number;
  totalCount: number;
  points: number;
  claimableCount: number;
  distribution: { rarity: (typeof RARITY_ORDER)[number]; earned: number; total: number }[];
}

export function ObservatoryStats({
  earnedCount,
  totalCount,
  points,
  claimableCount,
  distribution,
}: Props) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;
  const pct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 border border-[var(--hl-line)] p-3">
      <div className="flex items-end justify-between gap-3">
        <StatCell label={o.statUnlocked} value={`${earnedCount}/${totalCount}`} tone="signal" />
        <span className="w-[120px] pb-1">
          <Meter value={pct} max={100} tone="signal" />
        </span>
        <span className="font-mono text-[11px] tabular-nums text-[var(--hl-ink-2)]">{`${pct}%`}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-[var(--hl-line)] pt-2">
        <StatCell label={o.statPoints} value={formatNum(points)} tone="reach" />
        <StatCell
          label={o.statClaimable}
          value={claimableCount}
          tone={claimableCount > 0 ? 'caution' : 'muted'}
        />
      </div>

      <div>
        <SegHead label={o.detailRarity} />
        <div className="mt-1.5 flex flex-col gap-1.5">
          {distribution.map(({ rarity, earned, total }) => {
            const barPct = total > 0 ? (earned / total) * 100 : 0;
            return (
              <div key={rarity} className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 shrink-0 ${TONE_FILL[RARITY_TONE[rarity]]}`} />
                <span
                  className={`w-12 shrink-0 font-mono text-[9.5px] uppercase tracking-[0.06em] ${TONE_TEXT[RARITY_TONE[rarity]]}`}
                >
                  {RARITY_CONFIG[rarity].label}
                </span>
                <span className="min-w-0 flex-1">
                  <Meter value={barPct} max={100} tone={RARITY_TONE[rarity]} />
                </span>
                <span className="w-10 shrink-0 text-right font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-3)]">
                  {`${earned}/${total}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function RarityStrip({
  distribution,
}: {
  distribution: Props['distribution'];
}) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;
  return (
    <div className="flex flex-wrap items-center gap-3 border border-[var(--hl-line)] px-3 py-1.5">
      <span className="hl-label">{o.detailRarity}</span>
      {distribution.map(({ rarity, earned, total }) => (
        <span key={rarity} className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 ${TONE_FILL[RARITY_TONE[rarity]]}`} />
          <span
            className={`font-mono text-[9.5px] uppercase tracking-[0.06em] ${TONE_TEXT[RARITY_TONE[rarity]]}`}
          >
            {RARITY_CONFIG[rarity].label}
          </span>
          <span className="font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-3)]">
            {`${earned}/${total}`}
          </span>
        </span>
      ))}
    </div>
  );
}

export default ObservatoryStats;
