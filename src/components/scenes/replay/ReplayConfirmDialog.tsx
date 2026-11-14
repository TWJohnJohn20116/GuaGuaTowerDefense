/**
 * 回放 · 刪除／清空／重打／刪註記確認（取代 confirm）
 * HARDLINE：Modal + 直向全寬按鈕，危險動作用 danger。
 */
import { useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { Btn } from '@/components/hl';
import { RefreshIcon, TrashIcon } from '@/components/ui/Icons';
import {
  getReplayConfirmCopy,
  resolveReplayDialogHotkey,
  type ReplayConfirmKind,
} from '@/data/replayDialogs';
import { ReplayModal } from './ReplayModal';

interface Props {
  open: boolean;
  kind: ReplayConfirmKind;
  onClose: () => void;
  onConfirm: () => void;
}

export function ReplayConfirmDialog({ open, kind, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const copy = getReplayConfirmCopy(kind, t.replay);
  const c = t.common;
  const danger = kind !== 'replayThis';

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const action = resolveReplayDialogHotkey(e.key);
      if (action === 'ignore') return;
      e.preventDefault();
      if (action === 'cancel') onClose();
      else onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, onConfirm]);

  return (
    <ReplayModal open={open} title={copy.title} onClose={onClose}>
      <div className="px-4 py-4">
        <p className="text-[12.5px] leading-relaxed text-[var(--arc-ink-2)]">{copy.description}</p>
      </div>
      <div className="flex flex-col gap-1.5 border-t border-[var(--cn-line-soft)] p-3">
        <Btn variant={danger ? 'danger' : 'signal'} size="md" block onClick={onConfirm}
          icon={danger ? <TrashIcon className="h-3.5 w-3.5" /> : <RefreshIcon className="h-3.5 w-3.5" />}>
          {copy.confirm}
        </Btn>
        <Btn variant="ghost" size="md" block onClick={onClose}>
          {c.cancel}
        </Btn>
      </div>
    </ReplayModal>
  );
}

export default ReplayConfirmDialog;
