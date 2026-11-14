import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { getPendingSellIds } from '@/store/sellConfirm';
import { useSellConfirmStore } from '@/store/sellConfirmStore';
import { SceneModal } from '@/components/ui/SceneModal';
import { CoinIcon, WarningIcon } from '@/components/ui/Icons';
import { Btn } from '@/components/hl';

function confirmPendingSell() {
  const pending = useSellConfirmStore.getState().pending;
  if (!pending) return;
  useSellConfirmStore.getState().closeSellConfirm();
  const ids = getPendingSellIds(pending);
  const towers = useGameStore.getState().towers.filter((item) => ids.includes(item.id));
  for (const tower of towers) {
    useGameStore.getState().sellTower(tower);
  }
  if (ids.length > 1) {
    useGameStore.getState().clearMultiSelect();
  }
  const tutorial = useTutorialStore.getState();
  if (tutorial.isActive && ids.length === 1) {
    tutorial.checkAction('sell_tower', 'tutorial-target-sell-tower');
  }
}

export function SellConfirmModal() {
  const { t } = useTranslation();
  const pending = useSellConfirmStore((s) => s.pending);
  const closeSellConfirm = useSellConfirmStore((s) => s.closeSellConfirm);

  useEffect(() => {
    if (!pending) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' && e.key !== 'Enter') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.key === 'Escape') closeSellConfirm();
      else confirmPendingSell();
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [pending, closeSellConfirm]);

  return (
    <AnimatePresence>
      {pending && (
        <SceneModal
          onClose={closeSellConfirm}
          maxWidth="max-w-[420px]"
          zIndex="z-[120]"
          padding="p-4"
          variant="solid"
        >
          <header className="flex items-center gap-2.5 border-b border-[var(--hl-line)] px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[rgba(255,182,39,0.5)] text-[var(--hl-caution)]">
              <WarningIcon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <div className="hl-label text-[var(--hl-caution)]">tower / sell</div>
              <h3 className="mt-1 truncate text-[17px] font-semibold leading-tight text-[var(--hl-ink)]">
                {t.towers.sellConfirmTitle}
              </h3>
            </div>
          </header>

          <div className="px-4 py-3">
            <p className="text-[12.5px] text-[var(--hl-ink-2)]">
              {t.towers.sell}「{pending.name}」
            </p>

            <div className="mt-3 flex items-baseline justify-between border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-3 py-2">
              <span className="hl-label">{t.towers.sellPrice}</span>
              <span className="flex items-baseline gap-1.5 font-mono text-[17px] font-semibold tabular-nums text-[var(--hl-vital)]">
                <CoinIcon className="h-3.5 w-3.5 self-center" />
                +{pending.refund}
              </span>
            </div>

            <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--hl-ink-4)]">
              {getPendingSellIds(pending).length > 1
                ? t.towers.sellConfirmHintBatch
                : t.towers.sellConfirmHint}
            </p>
          </div>

          <footer className="flex flex-col gap-1.5 border-t border-[var(--hl-line)] p-3">
            <Btn variant="danger" block onClick={confirmPendingSell}>
              {t.towers.sell}
            </Btn>
            <Btn variant="line" block onClick={closeSellConfirm}>
              {t.common.cancel}
            </Btn>
          </footer>
        </SceneModal>
      )}
    </AnimatePresence>
  );
}
