/**
 * 突變挑戰 · 右側詳情（HARDLINE Console 右欄 336px）
 *
 * Field 列 + mono 標籤；規則標籤只用文字，不做紅色發光框。
 */
import type { MutatorChallenge } from '@/types/mutatorChallenge';
import type { MutatorChallengeRecord } from '@/types/mutatorChallenge';
import { PATHS } from '@/data/gameData';
import { useTranslation } from '@/i18n';
import { Btn, Empty, Field, SegHead } from '@/components/hl';
import { getAccentTone, getTierLabel, formatMutatorWaveLine } from './mutatorShared';

const TONE_TEXT = {
  vital: 'text-[var(--hl-vital)]',
  reach: 'text-[var(--hl-reach)]',
  caution: 'text-[var(--hl-caution)]',
  alarm: 'text-[var(--hl-alarm)]',
} as const;

interface MutatorDetailPanelProps {
  challenge: MutatorChallenge | null;
  record?: MutatorChallengeRecord;
  onStart: (c: MutatorChallenge) => void;
  onClaim: (c: MutatorChallenge) => void;
}

export function MutatorDetailPanel({ challenge, record, onStart, onClaim }: MutatorDetailPanelProps) {
  const { t } = useTranslation();
  const d = t.mutatorChallenge.detail;

  if (!challenge) {
    return (
      <Empty
        title={d.selectHintLine1}
        hint={d.selectHintLine2}
        className="m-3"
      />
    );
  }

  const tone = getAccentTone(challenge.accent);
  const completed = record?.completed ?? false;
  const claimed = record?.claimed ?? false;
  const bestScore = record?.bestScore ?? 0;
  const mapName = PATHS[challenge.mapId]?.name ?? challenge.mapId;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start gap-2.5 border-b border-[var(--hl-line)] px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[var(--hl-ink-2)]">
          {challenge.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-[14px] tracking-[0.08em] ${TONE_TEXT[tone]}`}
            >
              {getTierLabel(t, challenge.tier)}
            </span>
            {completed && (
              <span className="border border-[var(--hl-vital)]/40 px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-[14px] tracking-[0.08em] text-[var(--hl-vital)]">
                {t.mutatorChallenge.completed}
              </span>
            )}
          </div>
          <h2 className="mt-1 truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
            {challenge.name}
          </h2>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <p className="text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]">
          {challenge.description}
        </p>

        <div className="mt-3">
          <Field label={d.mapLabel}>
            <span className="text-[12px] text-[var(--hl-ink)]">{mapName}</span>
          </Field>
          <Field label={d.difficultyLabel}>
            <span className="font-mono text-[11.5px] tabular-nums text-[var(--hl-ink)]">
              {formatMutatorWaveLine(t, challenge)}
            </span>
          </Field>
          <Field label={d.rewardLabel}>
            <span className="flex items-center gap-3 font-mono text-[11.5px] tabular-nums">
              {challenge.rewards.coins != null && (
                <span className="text-[var(--hl-signal)]">+{challenge.rewards.coins}</span>
              )}
              {challenge.rewards.talentPoints != null && (
                <span className="text-[var(--hl-reach)]">+{challenge.rewards.talentPoints}</span>
              )}
            </span>
          </Field>
          {bestScore > 0 && (
            <Field label={t.mutatorChallenge.bestScore}>
              <span className="font-mono text-[11.5px] tabular-nums text-[var(--hl-ink)]">
                {bestScore}
              </span>
            </Field>
          )}
        </div>

        <div className="mt-3">
          <SegHead label={d.rulesLabel} />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {challenge.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[var(--hl-alarm)]/35 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-[var(--hl-alarm)]/90"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {challenge.tips && (
          <p className="mt-3 border-l-2 border-[var(--hl-caution)] pl-2.5 text-[11.5px] leading-relaxed text-[var(--hl-ink-3)]">
            {challenge.tips}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-1.5 border-t border-[var(--hl-line)] px-4 py-2.5">
        <Btn variant="signal" size="lg" onClick={() => onStart(challenge)} className="flex-1">
          {t.mutatorChallenge.start}
        </Btn>
        {completed && !claimed && (
          <Btn
            variant="line"
            size="lg"
            onClick={() => onClaim(challenge)}
            className="text-[var(--hl-caution)] hover:text-[var(--hl-caution)]"
          >
            {t.mutatorChallenge.claim}
          </Btn>
        )}
      </div>
    </div>
  );
}

export default MutatorDetailPanel;
