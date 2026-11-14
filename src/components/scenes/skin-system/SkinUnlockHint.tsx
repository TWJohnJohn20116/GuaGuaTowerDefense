/**
 * 皮膚詳情 · 解鎖條件進度（Meter + mono 數值）
 */
import { LockIcon, CheckIcon, InfoIcon } from '@/components/ui/Icons';
import { Deck, SegHead, Meter, Num } from '@/components/hl';
import { useTranslation } from '@/i18n';
import type { SkinUnlockProgress } from './skinUnlockProgress';

interface SkinUnlockHintProps {
  progress: SkinUnlockProgress;
}

export function SkinUnlockHint({ progress }: SkinUnlockHintProps) {
  const { t } = useTranslation();
  const { description, current, target, percent, trackable, complete } = progress;
  const tracked = trackable && target > 0;

  return (
    <Deck tone="sunken" className="px-3 py-2.5">
      <SegHead
        label={t.skins.unlockConditions}
        right={
          <span className="flex items-center gap-1.5">
            {complete
              ? <CheckIcon className="h-3 w-3 text-[var(--arc-vital)]" />
              : <LockIcon className="h-3 w-3 text-[var(--arc-ink-4)]" />}
            {tracked && (
              <Num value={`${current.toLocaleString()}/${target.toLocaleString()}`} size="sm" tone="muted" />
            )}
          </span>
        }
      />

      {tracked ? (
        <>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--arc-ink-2)]">{description}</p>
          <div className="mt-2 flex items-center gap-2.5">
            <Meter value={percent} max={100} tone={complete ? 'vital' : 'caution'} className="flex-1" />
            <Num value={`${percent}%`} size="sm" tone={complete ? 'vital' : 'caution'} />
          </div>
        </>
      ) : (
        <div className="mt-2 flex items-start gap-1.5 border-[3px] border-[var(--cn-line-soft)] px-2 py-1.5">
          <InfoIcon className="mt-0.5 h-3 w-3 shrink-0 text-[var(--arc-ink-4)]" />
          <span className="font-mono text-[10px] leading-relaxed text-[var(--arc-ink-3)]">
            {description}
          </span>
        </div>
      )}
    </Deck>
  );
}

export default SkinUnlockHint;
