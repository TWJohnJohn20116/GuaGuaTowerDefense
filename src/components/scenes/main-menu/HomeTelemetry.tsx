import { version as APP_VERSION } from '../../../../package.json';
import { useTranslation } from '@/i18n';
import { useGameStore } from '@/store/gameStore';
import { Dot } from '@/components/hl';

/**
 * 主選單底部遙測條 — 一條 h-9 的儀表帶。
 * 存在目的：讓整個畫面有一條「基線」，不是浮在空中。
 */
export function HomeTelemetry() {
  const { t } = useTranslation();
  const scene = useGameStore((s) => s.scene);

  return (
    <footer className="flex h-9 shrink-0 items-center gap-4 border-t border-[var(--hl-line)] bg-[var(--hl-void)] pl-[84px] pr-5">
      <span className="flex items-center gap-1.5">
        <Dot tone="vital" />
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--hl-ink-3)]">
          ready
        </span>
      </span>

      <span className="h-3 w-px bg-[var(--hl-line)]" />

      <Cell label="scene" value={scene} />
      <Cell label="build" value={APP_VERSION} />
      <Cell label="mode" value="2d / 3d" />

      <span className="ml-auto font-mono text-[10px] text-[var(--hl-ink-4)]">
        {t.mainMenu.statusChips.campaignStars} · local
      </span>
    </footer>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1.5 font-mono text-[10px]">
      <span className="uppercase tracking-[0.1em] text-[var(--hl-ink-4)]">{label}</span>
      <span className="text-[var(--hl-ink-2)]">{value}</span>
    </span>
  );
}
