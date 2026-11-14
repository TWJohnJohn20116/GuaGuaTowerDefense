/**
 * 皮膚預覽 · 等級 / 動畫 / 對比控制列（Chip 全部等寬方角）
 */
import type { SkinPreviewAnimMode } from './skinShared';
import { useTranslation } from '@/i18n';
import { Chip } from '@/components/hl';

interface SkinPreviewControlsProps {
  previewLevel: 1 | 2 | 3 | 4 | 5;
  animMode: SkinPreviewAnimMode;
  compareMode: boolean;
  onLevelChange: (lv: 1 | 2 | 3 | 4 | 5) => void;
  onAnimModeChange: (mode: SkinPreviewAnimMode) => void;
  onCompareModeChange: (enabled: boolean) => void;
}

const LEVELS = [1, 2, 3, 4, 5] as const;

export function SkinPreviewControls({
  previewLevel,
  animMode,
  compareMode,
  onLevelChange,
  onAnimModeChange,
  onCompareModeChange,
}: SkinPreviewControlsProps) {
  const { t } = useTranslation();
  const s = t.skins;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <span className="arc-label mr-1">lv</span>
        {LEVELS.map((lv) => (
          <Chip key={lv} active={previewLevel === lv} onClick={() => onLevelChange(lv)}>
            {lv}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Chip active={animMode === 'idle'} onClick={() => onAnimModeChange('idle')}>
          {s.previewIdle}
        </Chip>
        <Chip active={animMode === 'attack'} onClick={() => onAnimModeChange('attack')}>
          {s.previewAttack}
        </Chip>
        <span className="mx-0.5 h-4 w-px bg-[var(--arc-line)]" />
        <Chip active={compareMode} onClick={() => onCompareModeChange(!compareMode)}>
          {compareMode ? s.compareOn : s.compareOff}
        </Chip>
      </div>
    </div>
  );
}

export default SkinPreviewControls;
