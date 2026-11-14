/**
 * 圖鑑 · 波次組跳轉 Mod 編輯器
 */
import { EncyclopediaModEditorLink } from './EncyclopediaModEditorLink';
import type { WaveAppearanceRef } from './encyclopediaWaveLookup';
import { WaveIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';

interface EncyclopediaWaveModLinkProps {
  appearance: WaveAppearanceRef;
  className?: string;
}

export function EncyclopediaWaveModLink({ appearance, className = '' }: EncyclopediaWaveModLinkProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;

  if (appearance.source !== 'mod' || !appearance.modId || !appearance.waveSetId) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="inline-flex items-center gap-1  arc-chip px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--arc-reach)]">
        <WaveIcon className="h-3 w-3" />
        {e.editWaveInModEditor.replace('{n}', String(appearance.waveNumber))}
        {appearance.waveSetName ? ` · ${appearance.waveSetName}` : ''}
      </span>
      <EncyclopediaModEditorLink
        modId={appearance.modId}
        contentTab="waves"
        itemId={appearance.waveSetId}
      />
    </div>
  );
}
