/**
 * 結算畫面 · 回放區段
 *
 * 沒有回放也要保留區段，用 Empty 說明狀態，不做「整段消失」。
 */

import { useTranslation } from '@/i18n';
import { useReplayStore } from '@/store/replayStore';
import { useGameStore } from '@/store/gameStore';
import { ChartIcon, ChevronRightIcon, PlayIcon } from '@/components/ui/Icons';
import { Btn, Deck, Empty, SegHead } from '@/components/hl';

export function GameEndReplayPanel() {
  const { t } = useTranslation();
  const g = t.gameEnd;
  const replayId = useReplayStore((s) => s.lastSessionReplayId);
  const getReplay = useReplayStore((s) => s.getReplay);
  const setScene = useGameStore((s) => s.setScene);

  const replay = replayId ? getReplay(replayId) : undefined;

  return (
    <section className="flex flex-col gap-3">
      <SegHead label="replay" />

      {replay ? (
        <Deck className="flex flex-wrap items-center gap-3 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-2)]">
            <PlayIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="arc-label">{g.replaySaved}</div>
            <div className="mt-1.5 truncate text-[13px] text-[var(--arc-ink)]">{replay.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tabular-nums arc-num text-[var(--arc-ink-4)]">
              <span>
                {g.waveLabel} {replay.finalWave}
              </span>
              <span>
                {Math.floor(replay.duration)} {g.secondsUnit}
              </span>
              <span className={replay.isVictory ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-alert)]'}>
                {replay.isVictory ? g.cleared : g.failed}
              </span>
            </div>
          </div>
          <Btn
            variant="line"
            size="sm"
            icon={<ChartIcon className="h-3.5 w-3.5" />}
            onClick={() => setScene('replay')}
          >
            {g.viewReplay}
            <ChevronRightIcon className="h-3 w-3" />
          </Btn>
        </Deck>
      ) : (
        <Empty title={t.replay.noReplays} />
      )}
    </section>
  );
}
