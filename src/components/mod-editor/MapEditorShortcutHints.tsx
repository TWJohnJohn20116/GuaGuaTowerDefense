/**
 * 地圖編輯器 · 快捷鍵說明列 — HARDLINE
 *
 * 鍵位用 `Key`（方框 mono 10px），說明用 mono 10px；沒有 8px 全大寫裝飾。
 */
import { useTranslation } from '@/i18n';
import { KeyboardIcon } from '@/components/ui/Icons';
import { Key, SegHead } from '@/components/hl';

const SHORTCUTS = [
  { key: '1', labelKey: 'mapFsToolSelect' as const },
  { key: '2', labelKey: 'mapFsToolBrush' as const },
  { key: '3', labelKey: 'mapFsToolErase' as const },
  { key: '4', labelKey: 'mapFsToolBlock' as const },
  { key: 'Ctrl+Z', labelKey: 'mapFsToolUndo' as const },
  { key: 'Ctrl+Y', labelKey: 'mapFsToolRedo' as const },
];

export function MapEditorShortcutHints({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const m = t.modEditorExt;

  return (
    <div className={`border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-3 py-2.5 ${className}`}>
      <SegHead
        label={
          <span className="flex items-center gap-1.5">
            <KeyboardIcon className="h-3 w-3" />
            {m.mapShortcutTitle}
          </span>
        }
        className="mb-2"
      />

      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {SHORTCUTS.map((sc) => (
          <span key={sc.key} className="flex items-center gap-1.5">
            <Key>{sc.key}</Key>
            <span className="font-mono text-[10px] text-[var(--hl-ink-3)]">{m[sc.labelKey]}</span>
          </span>
        ))}
      </div>

      <p className="mt-2 font-mono text-[10px] leading-snug text-[var(--hl-ink-4)]">
        {m.mapShortcutFsHint}
      </p>
    </div>
  );
}
