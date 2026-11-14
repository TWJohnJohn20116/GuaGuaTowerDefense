// 天賦樹 · 畫布上方狀態列（操作提示，等寬鍵位）
import { Key, SegHead } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { LightbulbIcon } from '@/components/ui/Icons';

interface TalentToolbarProps {
  totalRank: number;
}

export function TalentToolbar({ totalRank }: TalentToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="shrink-0 border-b border-[var(--cn-line-soft)] bg-[var(--arc-void)] px-4 py-2">
      <SegHead
        label={t.talent.hintTitle}
        right={
          <span className="flex shrink-0 items-center gap-1.5">
            <LightbulbIcon className="h-3 w-3 text-[var(--arc-ink-4)]" />
            <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
              {totalRank}
            </span>
          </span>
        }
      />
      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5">
          <Key>drag</Key>
          <span className="arc-label">{t.talent.hintDrag}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Key>click</Key>
          <span className="arc-label">{t.talent.hintClick}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Key>rmb</Key>
          <span className="arc-label">{t.talent.hintRightClick}</span>
        </span>
      </div>
    </div>
  );
}

export default TalentToolbar;
