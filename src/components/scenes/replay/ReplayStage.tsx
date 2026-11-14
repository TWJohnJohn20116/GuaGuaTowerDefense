/**
 * 回放 · 主區播放器（待機）
 * Console 的主區：還沒進入播放時，這裡就是播放器本身——畫布框、事件密度條、圖表。
 * HARDLINE：1px 線 + 半透明訊號色塊，沒有發光、沒有漸層。
 */
import type { Replay as ReplayData } from '@/store/replayStore';
import { useTranslation } from '@/i18n';
import { Btn, Deck, Field, SegHead } from '@/components/hl';
import { PlayIcon } from '@/components/ui/Icons';
import {
  formatGameRecordDifficulty,
  gameDifficultyLabelsFromDetail,
} from '@/data/gameRecordLabels';
import { getPathDisplayName } from './replayUtils';
import { EventLog, TimeChart } from './ReplayCharts';

interface ReplayStageProps {
  replay: ReplayData;
  formatTime: (s: number) => string;
  formatDate: (ts: number) => string;
  onPlay: () => void;
}

export function ReplayStage({ replay, formatTime, formatDate, onPlay }: ReplayStageProps) {
  const { t } = useTranslation();
  const r = t.replay;
  const diffLabels = gameDifficultyLabelsFromDetail(t.mutatorChallenge.detail);
  const mapName = getPathDisplayName(replay.mapId);

  return (
    <div className="space-y-3">
      <Deck notch className="p-4">
        <SegHead
          label={r.title}
          right={
            <span
              className={[
                'border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em]',
                replay.isVictory
                  ? 'border-[rgba(56,224,143,0.35)] text-[var(--hl-vital)]'
                  : 'border-[rgba(255,75,62,0.35)] text-[var(--hl-alarm)]',
              ].join(' ')}
            >
              {replay.isVictory ? r.victory : r.defeat}
            </span>
          }
        />

        <div className="mt-2 font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
          {formatDate(replay.timestamp)}
        </div>

        {/* 玩家待機：先給資料，再給唯一的行動 */}
        <div className="mt-3 grid gap-x-6 gap-y-0 sm:grid-cols-2">
          <Field label={r.browse.map}>
            <span className="text-[12.5px] text-[var(--hl-ink)]">{mapName}</span>
          </Field>
          <Field label={r.difficulty}>
            <span className="text-[12.5px] text-[var(--hl-ink-2)]">
              {formatGameRecordDifficulty(replay.difficulty, diffLabels)}
            </span>
          </Field>
          <Field label={r.wave}>
            <span className="hl-num text-[13px] leading-none">W{replay.finalWave}</span>
          </Field>
          <Field label={r.score}>
            <span className="hl-num text-[13px] leading-none text-[var(--hl-reach)]">
              {replay.finalScore.toLocaleString()}
            </span>
          </Field>
          <Field label={r.duration}>
            <span className="hl-num text-[13px] leading-none">{formatTime(replay.duration)}</span>
          </Field>
          <Field label={r.browse.replayInfo}>
            <span className="hl-num text-[13px] leading-none">{replay.snapshots.length}</span>
          </Field>
        </div>

        {/* 事件密度：靜態 1px 刻度，不是可拖動控制項 */}
        <div className="relative mt-3 h-9 overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
          {replay.events.map((evt, i) => (
            <span
              key={`${evt.time}-${i}`}
              className="absolute top-0 bottom-0 w-px bg-[var(--hl-ink-4)]"
              style={{ left: `${Math.min(100, (evt.time / Math.max(1, replay.duration)) * 100)}%` }}
              title={`${evt.type} @ ${formatTime(evt.time)}`}
            />
          ))}
          {replay.notes?.map((n) => (
            <span
              key={n.id}
              className="absolute bottom-0 h-1.5 w-1.5 bg-[var(--hl-caution)]"
              style={{ left: `calc(${Math.min(100, (n.time / Math.max(1, replay.duration)) * 100)}% - 3px)` }}
              title={n.text}
            />
          ))}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="hl-num text-[10px] leading-none text-[var(--hl-ink-4)]">
              {replay.events.length} events
            </span>
          </span>
        </div>

        <div className="mt-3">
          <Btn
            variant="signal"
            size="lg"
            block
            icon={<PlayIcon className="h-3.5 w-3.5" />}
            onClick={onPlay}
          >
            {r.view}
          </Btn>
        </div>
      </Deck>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <TimeChart title={r.moneyOverTime} snapshots={replay.snapshots} field="money" tone="caution" playhead={0} />
        <TimeChart title={r.healthOverTime} snapshots={replay.snapshots} field="health" tone="vital" playhead={0} />
        <TimeChart title={r.scoreOverTime} snapshots={replay.snapshots} field="score" tone="reach" playhead={0} />
      </div>

      <EventLog events={replay.events} formatTime={formatTime} />
    </div>
  );
}

export default ReplayStage;
