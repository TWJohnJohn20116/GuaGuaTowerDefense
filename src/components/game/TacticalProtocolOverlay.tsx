/**
 * 波間戰術協議三選一面板（HARDLINE Modal）
 *
 * 選定一張後由 store 立即開下一波；背景點擊不會關閉。
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { SceneModal } from '@/components/ui/SceneModal';
import type { ProtocolIconKey } from '@/data/tacticalProtocolData';
import {
  CoinIcon, HeartIcon, ZapIcon, CrosshairIcon, SnowflakeIcon,
  MoneyBagIcon, EyeIcon, ConstructionIcon, TargetIcon, SparklesIcon, ShieldIcon,
} from '@/components/ui/Icons';

function ProtocolGlyph({ icon, className }: { icon: ProtocolIconKey; className?: string }) {
  switch (icon) {
    case 'coin':
      return <CoinIcon className={className} />;
    case 'heart':
      return <HeartIcon className={className} />;
    case 'zap':
      return <ZapIcon className={className} />;
    case 'crosshair':
      return <CrosshairIcon className={className} />;
    case 'snowflake':
      return <SnowflakeIcon className={className} />;
    case 'moneyBag':
      return <MoneyBagIcon className={className} />;
    case 'eye':
      return <EyeIcon className={className} />;
    case 'construction':
      return <ConstructionIcon className={className} />;
    case 'target':
      return <TargetIcon className={className} />;
    case 'shield':
      return <ShieldIcon className={className} />;
    default:
      return <TargetIcon className={className} />;
  }
}

export function TacticalProtocolOverlay() {
  const { t } = useTranslation();
  const offers = useGameStore((s) => s.pendingProtocolChoices);
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const chooseProtocol = useGameStore((s) => s.chooseProtocol);
  const currentWave = useGameStore((s) => s.currentWave);
  const isPaused = useGameStore((s) => s.isPaused);
  const visible = Boolean(offers && offers.length > 0 && !autoBattleEnabled && !isPaused);

  useEffect(() => {
    if (!visible || !offers) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey || e.ctrlKey || e.metaKey) return;
      const match = e.code.match(/^Digit([1-3])$/);
      if (!match) return;
      const picked = offers[Number(match[1]) - 1];
      if (!picked) return;
      e.preventDefault();
      e.stopPropagation();
      chooseProtocol(picked.id);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [visible, offers, chooseProtocol]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {visible && offers && (
        <SceneModal onClose={() => undefined} maxWidth="max-w-3xl" zIndex="z-[80]" variant="solid">
          <header className="flex items-start gap-2.5 border-b border-[var(--hl-line)] px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--hl-line-strong)] text-[var(--hl-signal)]">
              <SparklesIcon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <div className="hl-label">
                {t.game.tacticalProtocol.subtitle.replace('{wave}', String(currentWave))}
              </div>
              <h3 className="mt-1 text-[17px] font-semibold leading-tight text-[var(--hl-ink)]">
                {t.game.tacticalProtocol.title}
              </h3>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <p className="hl-micro mb-3">{t.game.tacticalProtocol.pickHint}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {offers.map((protocol, index) => (
                <button
                  key={protocol.id}
                  type="button"
                  onClick={() => chooseProtocol(protocol.id)}
                  className="group flex min-h-[168px] flex-col gap-2 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] p-3 text-left transition-colors hover:border-[var(--hl-signal)] hover:bg-[var(--hl-signal-veil)] focus-visible:border-[var(--hl-signal)]"
                >
                  <span className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center border border-[var(--hl-line-strong)] text-[var(--hl-ink-2)]">
                      <ProtocolGlyph icon={protocol.icon} className="h-4 w-4" />
                    </span>
                    <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-3)]">
                      {t.game.tacticalProtocol.hotkey.replace('{n}', String(index + 1))}
                    </span>
                  </span>
                  <span className="text-[13px] font-semibold text-[var(--hl-ink)]">{protocol.name}</span>
                  <span className="text-[11px] leading-snug text-[var(--hl-ink-2)]">{protocol.description}</span>
                  <span className="mt-auto font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
                    {protocol.duration === 'instant'
                      ? t.game.tacticalProtocol.instant
                      : t.game.tacticalProtocol.nextWave}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </SceneModal>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default TacticalProtocolOverlay;
