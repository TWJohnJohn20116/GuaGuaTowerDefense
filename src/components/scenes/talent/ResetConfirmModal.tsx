/**
 * 天賦樹 - 重置確認 Modal（HARDLINE Modal：遮罩 + 置中 Deck notch）
 */

import { useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { WarningIcon, RefreshIcon } from '@/components/ui/Icons';
import { Deck, Btn, Num } from '@/components/hl';

interface ResetConfirmModalProps {
  open: boolean;
  totalSpentPoints: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetConfirmModal({ open, totalSpentPoints, onConfirm, onCancel }: ResetConfirmModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      else if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(6,7,10,0.82)] p-4"
      onClick={onCancel}
    >
      <div className="w-full max-w-[400px]" onClick={(e) => e.stopPropagation()}>
        <Deck notch className="arc-enter flex w-full flex-col gap-4 p-5" as="section">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[rgba(255,61,113,0.4)] text-[var(--arc-alert)]">
              <WarningIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[17px] font-semibold leading-tight text-[var(--arc-ink)]">
                {t.talent.resetTitle}
              </h3>
              <p className="mt-1 arc-micro">{t.talent.resetDescription}</p>
            </div>
          </div>

          <div className="flex items-baseline justify-between border-y border-[var(--cn-line-soft)] py-2.5">
            <span className="arc-label">{t.talent.resetWillReturn}</span>
            <Num value={`+${totalSpentPoints}`} size="lg" tone="vital" />
          </div>

          <p className="font-mono text-[10px] leading-relaxed text-[var(--arc-ink-4)]">
            {t.talent.resetIrreversible}
          </p>

          <div className="flex flex-col gap-2">
            <Btn
              variant="signal"
              size="lg"
              block
              icon={<RefreshIcon className="h-3.5 w-3.5" />}
              onClick={onConfirm}
            >
              {t.talent.resetConfirm}
            </Btn>
            <Btn variant="line" size="md" block onClick={onCancel}>
              {t.common.cancel}
            </Btn>
          </div>
        </Deck>
      </div>
    </div>
  );
}

export default ResetConfirmModal;
