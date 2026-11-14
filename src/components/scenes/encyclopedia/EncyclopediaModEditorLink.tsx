/**
 * 圖鑑 · 跳轉 Mod 編輯器
 */
import { useModStore, type ModEditorFocusTab } from '@/store/modStore';
import { useGameStore } from '@/store/gameStore';
import { PaletteIcon } from '@/components/ui/Icons';
import { Btn } from '@/components/hl';
import { useTranslation } from '@/i18n';

interface EncyclopediaModEditorLinkProps {
  modId?: string;
  contentTab: ModEditorFocusTab;
  itemId?: string;
  className?: string;
}

export function EncyclopediaModEditorLink({
  modId,
  contentTab,
  itemId,
  className = '',
}: EncyclopediaModEditorLinkProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const mods = useModStore((s) => s.mods);
  const setEditingMod = useModStore((s) => s.setEditingMod);
  const setModEditorFocus = useModStore((s) => s.setModEditorFocus);
  const setWorkshopTab = useModStore((s) => s.setWorkshopTab);
  const setScene = useGameStore((s) => s.setScene);

  if (!modId) return null;
  const mod = mods.find((m) => m.metadata.id === modId);
  if (!mod) return null;

  return (
    <Btn
      variant="ghost"
      size="sm"
      onClick={() => {
        setModEditorFocus({ tab: contentTab, itemId });
        setEditingMod(mod);
        setWorkshopTab('modEditor');
        setScene('workshop');
      }}
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--arc-reach)] ${className}`}
    >
      <PaletteIcon className="h-3 w-3" />
      {e.editInModEditor}
    </Btn>
  );
}
