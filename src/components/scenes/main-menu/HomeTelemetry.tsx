import { version as APP_VERSION } from '../../../../package.json';
import { useGameStore } from '@/store/gameStore';
import { Dot } from '@/components/hl';

/**
 * 主選單 · 底部基線
 *
 * 只是讓整片拼貼「落地」的一條細帶（h-7），不是第二個內容區。
 * 舊版是 h-9 並塞了四個 cell；新骨架把主行動抬到中央後，這條只剩狀態碼。
 */
export function HomeTelemetry() {
  const scene = useGameStore((s) => s.scene);

  return (
    <footer className="flex h-7 shrink-0 items-center gap-3 border-t-2 border-[var(--cn-line-soft)] bg-[var(--cn-paper-2)] px-3">
      <span className="flex items-center gap-1.5">
        <Dot tone="vital" />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--cn-ink-3)]">ready</span>
      </span>

      <span className="h-3 w-px bg-[var(--cn-line-soft)]" />

      <Cell label="scene" value={scene} />
      <Cell label="build" value={APP_VERSION} />

      <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--cn-ink-3)]">
        local save
      </span>
    </footer>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1.5 font-mono text-[9px]">
      <span className="uppercase tracking-[0.12em] text-[var(--cn-ink-3)]">{label}</span>
      <span className="text-[var(--cn-ink-2)]">{value}</span>
    </span>
  );
}