/**
 * 開發面板 · Mod 快速測試跳轉
 */
import { useMemo } from 'react';
import { useModStore } from '@/store/modStore';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { PaletteIcon, PlayIcon } from '@/components/ui/Icons';
import { DevButton, DevInfoRow } from './common';

export function ModTestSection() {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const mods = useModStore((s) => s.mods);
  const setEditingMod = useModStore((s) => s.setEditingMod);
  const setWorkshopTab = useModStore((s) => s.setWorkshopTab);
  const setScene = useGameStore((s) => s.setScene);

  const sorted = useMemo(
    () => [...mods].sort((a, b) => a.loadOrder - b.loadOrder),
    [mods],
  );

  const openModEditor = (modId: string) => {
    const mod = mods.find((m) => m.metadata.id === modId);
    if (!mod) return;
    setEditingMod(mod);
    setWorkshopTab('modEditor');
    setScene('workshop');
  };

  return (
    <div className="space-y-2">
      <DevInfoRow
        label={u.devModCount}
        value={String(mods.length)}
        color="violet"
      />
      {sorted.length === 0 ? (
        <p className="text-[10px] text-[var(--hl-ink-4)] px-1">{u.devModEmpty}</p>
      ) : (
        <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
          {sorted.map((mod) => (
            <div
              key={mod.metadata.id}
              className="flex items-center gap-1  border border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2 py-1.5"
            >
              <span className={`flex-1 truncate text-[10px] font-bold ${mod.enabled ? 'text-[var(--hl-ink-2)]' : 'text-[var(--hl-ink-4)]'}`}>
                {mod.metadata.name}
              </span>
              <button
                type="button"
                onClick={() => openModEditor(mod.metadata.id)}
                className=" border border-[var(--hl-line-strong)] bg-violet-500/10 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-[var(--hl-ink-2)] hover:bg-violet-500/20"
                title={u.devModOpenEditor}
              >
                <PaletteIcon className="inline h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <DevButton
        icon={<PlayIcon className="w-3.5 h-3.5" />}
        label={u.devModOpenWorkshop}
        onClick={() => {
          setWorkshopTab('modManager');
          setScene('workshop');
        }}
        variant="primary"
      />
    </div>
  );
}
