/**
 * 回放 · 重新命名（取代 prompt）
 * HARDLINE：Modal + hl-input + 直向全寬按鈕。
 */
import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';
import { Btn } from '@/components/hl';
import { resolveReplayDialogHotkey, resolveReplayRenameDraft } from '@/data/replayDialogs';
import { ReplayModal } from './ReplayModal';

interface Props {
  open: boolean;
  originalName: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export function ReplayRenameDialog({ open, originalName, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const r = t.replay;
  const c = t.common;
  const [draft, setDraft] = useState(originalName);

  useEffect(() => {
    if (open) setDraft(originalName);
  }, [open, originalName]);

  const submit = () => {
    if (resolveReplayRenameDraft({ draft, original: originalName }) !== 'apply') {
      onClose();
      return;
    }
    onConfirm(draft.trim());
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (resolveReplayDialogHotkey(e.key) !== 'cancel') return;
      e.preventDefault();
      onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <ReplayModal open={open} title={r.rename} onClose={onClose}>
      <div className="px-4 py-4">
        <label className="hl-label mb-1.5 block">{r.enterNewName}</label>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            submit();
          }}
          placeholder={r.enterNewName}
          className="hl-input"
        />
      </div>
      <div className="flex flex-col gap-1.5 border-t border-[var(--hl-line)] p-3">
        <Btn variant="signal" size="md" block onClick={submit}>
          {r.save}
        </Btn>
        <Btn variant="ghost" size="md" block onClick={onClose}>
          {c.cancel}
        </Btn>
      </div>
    </ReplayModal>
  );
}

export default ReplayRenameDialog;
