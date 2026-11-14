// 天賦樹 · 縮放控制（Btn 方角列）
import { useTranslation } from '@/i18n';
import { TargetIcon, PlusIcon, MinusIcon } from '@/components/ui/Icons';
import { Btn, Num } from '@/components/hl';

interface TalentZoomControlsProps {
  scale: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onReset: () => void;
  onCenter: () => void;
}

export function TalentZoomControls({
  scale, onIncrease, onDecrease, onReset, onCenter,
}: TalentZoomControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-3 right-3 z-40 flex items-center gap-1 border border-[var(--hl-line)] bg-[var(--hl-deck)] p-1">
      <Btn size="sm" variant="ghost" onClick={onDecrease} aria-label={t.talent.zoomReset}>
        <MinusIcon className="h-3.5 w-3.5" />
      </Btn>
      <span className="w-12 text-center">
        <Num value={`${Math.round(scale * 100)}%`} size="sm" tone="muted" />
      </span>
      <Btn size="sm" variant="ghost" onClick={onIncrease}>
        <PlusIcon className="h-3.5 w-3.5" />
      </Btn>
      <span className="mx-1 h-4 w-px bg-[var(--hl-line)]" />
      <Btn size="sm" variant="line" onClick={onReset}>
        {t.talent.zoomReset}
      </Btn>
      <Btn size="sm" variant="ghost" onClick={onCenter}>
        <TargetIcon className="h-3.5 w-3.5" />
      </Btn>
    </div>
  );
}

export default TalentZoomControls;
