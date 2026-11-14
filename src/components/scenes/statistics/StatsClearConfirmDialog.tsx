/**
 * 戰績 · 清空紀錄確認（HARDLINE Modal：遮罩 + 置中 Deck notch，按鈕直向全寬）
 */
import { useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { TrashIcon, WarningIcon } from '@/components/ui/Icons';
import { Deck, Btn } from '@/components/hl';
import { resolveStatsClearHotkey } from '@/data/statsClearConfirm';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function StatsClearConfirmDialog({ open, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const d = t.statistics.clearDialog;
  const c = t.common;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const action = resolveStatsClearHotkey(e.key);
      if (action === 'ignore') return;
      e.preventDefault();
      if (action === 'cancel') onClose();
      else onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(6,7,10,0.82)] p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-[400px]" onClick={(e) => e.stopPropagation()}>
        <Deck notch className="hl-enter flex w-full flex-col gap-4 p-5" as="section">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[rgba(255,75,62,0.4)] text-[var(--hl-alarm)]">
              <WarningIcon className="h-4 w-4" />
            </span>
            <h3 className="min-w-0 text-[17px] font-semibold leading-tight text-[var(--hl-ink)]">
              {d.title}
            </h3>
          </div>

          <p className="hl-sub">{d.description}</p>

          <div className="flex flex-col gap-2">
            <Btn
              variant="danger"
              size="lg"
              block
              icon={<TrashIcon className="h-3.5 w-3.5" />}
              onClick={onConfirm}
            >
              {d.confirm}
            </Btn>
            <Btn variant="line" size="md" block onClick={onClose}>
              {c.cancel}
            </Btn>
          </div>
        </Deck>
      </div>
    </div>
  );
}

export default StatsClearConfirmDialog;
