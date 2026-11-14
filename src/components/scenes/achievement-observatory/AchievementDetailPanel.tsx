/**
 * 檔案館 · 卷宗詳情（HARDLINE 右欄）
 *
 * 版面順序：識別牌 → 名稱與說明 → 完成度 → 條件清單 → 獎勵 → 行動。
 * 識別牌用稀有度代碼當主視覺，不用徽章插圖。
 */
import type { Achievement, AchievementStatus } from '@/types/achievement';
import { RARITY_CONFIG } from '@/types/achievement';
import { Btn, Deck, Dot, Empty, Meter, Num, SegHead } from '@/components/hl';
import {
  ProgressBlocks,
  RARITY_CODE,
  RARITY_RANK,
  RARITY_TONE,
  RarityBlocks,
  TONE_BORDER,
  TONE_TEXT,
  formatNum,
  getConditionLabel,
  isEarned,
} from './observatoryShared';
import { useTranslation } from '@/i18n';

interface AchievementDetailPanelProps {
  achievement: Achievement | null;
  status: AchievementStatus | null;
  pct: number;
  progress: number[];
  onClaim: (id: string) => void;
}

export function AchievementDetailPanel({
  achievement,
  status,
  pct,
  progress,
  onClaim,
}: AchievementDetailPanelProps) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;

  if (!achievement || status === null) {
    return <Empty title={o.emptyHint} className="m-3" />;
  }

  const cfg = RARITY_CONFIG[achievement.rarity];
  const tone = RARITY_TONE[achievement.rarity];
  const earned = isEarned(status);
  const claimable = status === 'completed';
  const secretLocked = (achievement.secret || achievement.hidden) && !earned;
  const shownPct = earned ? 100 : Math.round(pct);

  const doneConditions = achievement.conditions.filter(
    (cond, ci) => Math.min(progress[ci] ?? 0, cond.target) >= cond.target,
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 識別牌 */}
      <div className="flex items-start gap-3 border-b border-[var(--cn-line-soft)] px-4 py-3.5">
        <div
          className={`relative flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center border ${
            earned ? TONE_BORDER[tone] : 'border-[var(--arc-line-strong)]'
          }`}
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(236,239,242,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(236,239,242,0.04) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        >
          <span
            className={`font-mono text-[26px] font-bold leading-none ${
              earned ? TONE_TEXT[tone] : 'text-[var(--arc-ink-4)]'
            }`}
          >
            {secretLocked ? '?' : RARITY_CODE[achievement.rarity]}
          </span>
          <span className="mt-1.5">
            <RarityBlocks rank={secretLocked ? 0 : RARITY_RANK[achievement.rarity]} tone={tone} size={5} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[9.5px] uppercase tracking-[0.08em] ${earned ? TONE_TEXT[tone] : 'text-[var(--arc-ink-4)]'}`}>
              {cfg.label}
            </span>
            <Num value={`+${cfg.points}`} tone="muted" size="sm" className="font-mono tabular-nums" />
            {claimable && <Dot tone="caution" pulse />}
          </div>
          <h2 className="arc-title mt-1 text-[16px] font-semibold leading-tight tracking-[-0.01em] text-[var(--arc-ink)]">
            {secretLocked ? '?????' : achievement.name}
          </h2>
          <p className="mt-1.5 line-clamp-4 text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">
            {secretLocked ? o.secretLockedDesc : achievement.description}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* 完成度 */}
        <div className="border-b border-[var(--cn-line-soft)] px-4 py-3">
          <div className="flex items-end justify-between gap-3">
            <span className="arc-label">{o.detailProgress}</span>
            <span
              className={`font-mono text-[20px] font-semibold leading-none tabular-nums arc-num ${
                earned ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-ink)]'
              }`}
            >
              {shownPct}
              <span className="ml-0.5 text-[10px] font-normal text-[var(--arc-ink-3)]">%</span>
            </span>
          </div>
          <ProgressBlocks
            pct={shownPct}
            total={28}
            tone={earned ? 'vital' : claimable ? 'caution' : 'ink'}
            height={8}
            fill
            className="mt-2"
          />
        </div>

        {/* 條件 */}
        <div className="border-b border-[var(--cn-line-soft)] px-4 py-3">
          <SegHead
            label={o.detailCondition}
            right={
              <Num
                value={`${doneConditions}/${achievement.conditions.length}`}
                tone="muted"
                size="sm"
                className="font-mono tabular-nums"
              />
            }
          />
          <div className="mt-2 flex flex-col gap-2.5">
            {achievement.conditions.map((cond, ci) => {
              const cur = Math.min(progress[ci] ?? 0, cond.target);
              const condPct = cond.target > 0 ? (cur / cond.target) * 100 : 0;
              const done = condPct >= 100;
              return (
                <div key={ci}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className={`inline-block h-1.5 w-1.5 shrink-0 ${
                          done ? 'bg-[var(--arc-vital)]' : 'bg-[var(--arc-line-hot)]'
                        }`}
                      />
                      <span className="min-w-0 truncate text-[11.5px] text-[var(--arc-ink-2)]">
                        {secretLocked ? '?????' : getConditionLabel(t.achievements, cond.type)}
                      </span>
                    </span>
                    <Num
                      value={`${formatNum(cur)}/${formatNum(cond.target)}`}
                      tone="ink"
                      size="sm"
                      className="shrink-0 font-mono tabular-nums"
                    />
                  </div>
                  <Meter value={condPct} max={100} tone={done ? 'vital' : 'ink'} className="mt-1" />
                </div>
              );
            })}
          </div>
        </div>

        {/* 獎勵 */}
        {achievement.rewards.length > 0 && (
          <div className="px-4 py-3">
            <SegHead label={o.detailReward} />
            <div className="mt-2 flex flex-col gap-1.5">
              {achievement.rewards.map((r, ri) => (
                <Deck
                  key={ri}
                  tone="sunken"
                  className="flex items-center justify-between px-2.5 py-1.5"
                >
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
                    {r.type}
                  </span>
                  <Num
                    value={r.type === 'points' ? `${r.value} ${t.mainMenu.points}` : String(r.value)}
                    tone="ink"
                    size="sm"
                    className="font-mono tabular-nums"
                  />
                </Deck>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 行動 */}
      <div className="border-t border-[var(--cn-line-soft)] px-4 py-2.5">
        {claimable ? (
          <Btn variant="signal" size="md" block onClick={() => onClaim(achievement.id)}>
            {o.claimBtn}
          </Btn>
        ) : earned ? (
          <div className="flex items-center justify-center gap-2 py-1">
            <Dot tone="vital" />
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--arc-vital)]">
              {status === 'claimed' ? o.rewardClaimed : o.achievementDone}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            <Dot tone="ink" />
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
              {o.lockedBadge}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AchievementDetailPanel;
