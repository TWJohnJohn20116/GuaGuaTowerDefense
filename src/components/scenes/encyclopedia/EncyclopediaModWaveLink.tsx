/**
 * 圖鑑 · 跳轉 Mod 編輯器波次分頁
 */
import { useModStore } from '@/store/modStore';
import { useGameStore } from '@/store/gameStore';
import { WaterWaveIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';

interface EncyclopediaModWaveLinkProps {
  modId?: string;
  waveSetId?: string;
  className?: string;
}

export function EncyclopediaModWaveLink({ modId, waveSetId, className = '' }: EncyclopediaModWaveLinkProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const mods = useModStore((s) => s.mods);
  const setEditingMod = useModStore((s) => s.setEditingMod);
  const setModEditorFocus = useModStore((s) => s.setModEditorFocus);
  const setWorkshopTab = useModStore((s) => s.setWorkshopTab);
  const setScene = useGameStore((s) => s.setScene);

  if (!modId) return null;
  const mod = mods.find((item) => item.metadata.id === modId);
  if (!mod?.content.waves?.length) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setModEditorFocus({ tab: 'waves', itemId: waveSetId });
        setEditingMod(mod);
        setWorkshopTab('modEditor');
        setScene('workshop');
      }}
      className={`inline-flex items-center gap-1.5  border border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--hl-reach)] transition-colors hover:bg-[var(--hl-deck-2)] ${className}`}
    >
      <WaterWaveIcon className="h-3 w-3" />
      {m.ecLinkWaves}
    </button>
  );
}
