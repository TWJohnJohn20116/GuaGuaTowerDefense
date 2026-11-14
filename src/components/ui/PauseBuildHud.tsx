import { PauseIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { Btn } from '@/components/hl';

interface PauseBuildHudProps {
  onOpenMenu: () => void;
  onResume: () => void;
}

/**
 * 暫停建塔精簡條 — HARDLINE
 * 掛在上儀表帶底下，1px 線 + 左緣警示色，不遮住儀表帶與可點區域。
 */
export function PauseBuildHud({ onOpenMenu, onResume }: PauseBuildHudProps) {
  const { t } = useTranslation();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[52px] z-30 flex justify-center px-3">
      <div className="pointer-events-auto flex items-center gap-2 border border-[var(--hl-line)] border-l-2 border-l-[var(--hl-caution)] bg-[var(--hl-deck)] px-2.5 py-1.5">
        <PauseIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-caution)]" />
        <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-caution)]">
          {t.game.pauseBuildHud}
        </span>
        <span className="mx-1 h-4 w-px bg-[var(--hl-line)]" />
        <Btn variant="line" size="sm" onClick={onOpenMenu}>
          {t.game.pauseMenu}
        </Btn>
        <Btn variant="signal" size="sm" onClick={onResume}>
          {t.game.continueGame}
        </Btn>
      </div>
    </div>
  );
}
