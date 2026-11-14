/**
 * 回放 · 批量匯出確認對話框
 * HARDLINE：Modal + Field 列 + Chip 範圍選擇；匯出流程不變。
 */
import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import type { Replay } from '@/store/replayStore';
import { Btn, Chip, Field, Num, SegHead } from '@/components/hl';
import {
  buildReplayBatchSummary,
  downloadReplayBatch,
  type ReplayExportScope,
} from './replayBatchExport';
import { DownloadIcon } from '@/components/ui/Icons';
import { ReplayModal } from './ReplayModal';

interface Props {
  open: boolean;
  onClose: () => void;
  allReplays: Replay[];
  filteredReplays: Replay[];
  favoriteReplays: Replay[];
  usingFilters: boolean;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ReplayBatchExportDialog({
  open,
  onClose,
  allReplays,
  filteredReplays,
  favoriteReplays,
  usingFilters,
}: Props) {
  const { t } = useTranslation();
  const d = t.replay.batchExportDialog;
  const c = t.common;

  const [scope, setScope] = useState<ReplayExportScope>(usingFilters ? 'filtered' : 'all');
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  const target = scope === 'all'
    ? allReplays
    : scope === 'favorites'
      ? favoriteReplays
      : filteredReplays;

  const summary = useMemo(() => buildReplayBatchSummary(target), [target]);

  const handleExport = () => {
    if (!confirmed || target.length === 0) return;
    const ok = downloadReplayBatch(target, 'json');
    setResult(ok ? 'success' : 'fail');
    if (ok) window.setTimeout(onClose, 1200);
  };

  return (
    <ReplayModal open={open} title={d.title} onClose={onClose} width="max-w-[460px]">
      <div className="space-y-3 px-4 py-3.5">
        <SegHead label={d.exportCount} />

        <div>
          <Field label={d.exportCount}>
            <Num value={d.countUnit.replace('{count}', String(summary.count))} size="sm" />
          </Field>
          <Field label={d.winLoss}>
            <span className="arc-num text-[12px] leading-none">
              {summary.victories} / {summary.defeats}
            </span>
          </Field>
          <Field label={d.totalDuration}>
            <Num value={formatDuration(summary.totalDuration)} size="sm" />
          </Field>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(summary.maps).map(([map, n]) => (
            <span key={map} className="border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--arc-ink-3)]">
              {map} ×{n}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Chip active={scope === 'all'} onClick={() => setScope('all')}>
            {d.scopeAll} ({allReplays.length})
          </Chip>
          <Chip active={scope === 'filtered'} onClick={() => setScope('filtered')}>
            {d.scopeFiltered} ({filteredReplays.length})
          </Chip>
          <Chip active={scope === 'favorites'} onClick={() => setScope('favorites')}>
            {d.scopeFavorites} ({favoriteReplays.length})
          </Chip>
        </div>

        <label className="flex cursor-pointer items-start gap-2 border border-[rgba(255,182,39,0.28)] bg-[rgba(255,182,39,0.06)] p-2.5">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 shrink-0 accent-[var(--arc-caution)]"
          />
          <span className="text-[11px] leading-relaxed text-[var(--arc-ink-2)]">
            {d.confirmText.replace('{count}', String(summary.count))}
          </span>
        </label>

        {result === 'success' && (
          <p className="arc-label text-[var(--arc-vital)]">{d.success}</p>
        )}
        {result === 'fail' && (
          <p className="arc-label text-[var(--arc-alert)]">{d.fail}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-[var(--cn-line-soft)] p-3">
        <Btn
          variant="signal"
          size="md"
          block
          disabled={!confirmed || target.length === 0}
          onClick={handleExport}
          icon={<DownloadIcon className="h-3.5 w-3.5" />}
        >
          {d.confirm}
        </Btn>
        <Btn variant="ghost" size="md" block onClick={onClose}>
          {c.cancel}
        </Btn>
      </div>
    </ReplayModal>
  );
}

export default ReplayBatchExportDialog;
