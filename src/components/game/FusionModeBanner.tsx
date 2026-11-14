/**
 * 合體模式提示條（2D 畫布與 3D 場景共用）
 * HARDLINE：1px 線 + 左緣訊號條，mono 標籤，不用圓角與光暈。
 */

import { SparklesIcon } from '@/components/ui/Icons';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { resolveFusionModeHint } from '@/data/fusionModeHint';

export function FusionModeBanner() {
  const fusionMode = useGameStore((s) => s.fusionMode);
  const fusionFundsShort = useGameStore((s) => s.fusionFundsShort);
  const { t } = useTranslation();

  if (!fusionMode) return null;

  const hint = resolveFusionModeHint({
    fundsShort: fusionFundsShort,
    modeHint: t.towers.fusion.modeHint,
    needFunds: t.game.needFunds,
  });

  return (
    <div className="arc-panel--flat absolute left-1/2 top-12 z-[101] flex max-w-[min(92vw,560px)] -translate-x-1/2 items-center gap-3 border-l-2 border-l-[var(--arc-caution)] px-3 py-2">
      <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-[var(--arc-caution)]" />
      <span className="arc-micro truncate text-[11.5px] text-[var(--arc-ink-2)]">{hint}</span>
      <button
        type="button"
        className="arc-btn arc-btn--ghost h-7 shrink-0 px-2 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--arc-ink-2)] hover:text-[var(--arc-ink)]"
        onClick={() => useGameStore.getState().cancelFusion()}
      >
        {t.towers.fusion.cancel}
      </button>
    </div>
  );
}

export default FusionModeBanner;
