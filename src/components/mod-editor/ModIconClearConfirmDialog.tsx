/**
 * 模組圖示編輯器 · 清空畫布確認（取代 window.confirm）
 */
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n';
import {
  SceneModal,
  SceneModalHeader,
  SceneModalBody,
  SceneModalFooter,
} from '@/components/ui/SceneModal';
import { TrashIcon, WarningIcon } from '@/components/ui/Icons';
import { Btn } from '@/components/hl';
import { getModIconClearCopy, resolveModIconClearHotkey } from '@/data/modIconEditorDialogs';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ModIconClearConfirmDialog({ open, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const copy = getModIconClearCopy(t.modEditorExt);
  const c = t.common;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const action = resolveModIconClearHotkey(e.key);
      if (action === 'ignore') return;
      e.preventDefault();
      e.stopPropagation();
      if (action === 'cancel') onClose();
      else onConfirm();
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [open, onClose, onConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <SceneModal onClose={onClose} maxWidth="max-w-md" zIndex="z-[100010]" variant="solid">
          <SceneModalHeader
            title={copy.title}
            icon={<WarningIcon className="h-4 w-4 text-[var(--arc-alert)]" />}
            onClose={onClose}
            borderClass="border-[rgba(255,61,113,0.4)]"
          />
          <SceneModalBody className="space-y-3">
            {/* 1px 警示線 + 說明：不用底色塊，不用圓角 */}
            <p className="border-l-2 border-[var(--arc-alert)] pl-3 text-[12.5px] leading-relaxed text-[var(--arc-ink-2)]">
              {copy.description}
            </p>
          </SceneModalBody>
          <SceneModalFooter borderClass="border-[var(--cn-line-soft)]">
            <Btn variant="line" size="md" block onClick={onClose} className="flex-1">
              {c.cancel}
            </Btn>
            <Btn
              variant="danger"
              size="md"
              block
              onClick={onConfirm}
              className="flex-1"
              icon={<TrashIcon className="h-4 w-4" />}
            >
              {copy.confirm}
            </Btn>
          </SceneModalFooter>
        </SceneModal>
      )}
    </AnimatePresence>
  );
}

export default ModIconClearConfirmDialog;
