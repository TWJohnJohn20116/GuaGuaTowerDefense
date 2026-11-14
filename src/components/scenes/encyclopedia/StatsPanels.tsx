/**
 * 圖鑑 · 統計捷徑（完整統計已移至獨立 Statistics 場景）
 * HARDLINE：一張 Deck、一段說明、一個 line 按鈕。
 */
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { ChartIcon, PlayIcon } from '@/components/ui/Icons';
import { Deck, Btn } from '@/components/hl';

export function StatsShortcut() {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const setScene = useGameStore((s) => s.setScene);

  return (
    <Deck notch className="flex w-full max-w-2xl flex-col items-center gap-4 p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-reach)]">
        <ChartIcon className="h-5 w-5" />
      </span>
      <h2 className="arc-title">{e.statsOverview}</h2>
      <p className="arc-micro max-w-md">{e.statsOverviewDesc}</p>
      <Btn
        variant="signal"
        size="md"
        icon={<PlayIcon className="h-3.5 w-3.5" />}
        onClick={() => setScene('statistics')}
      >
        {e.statsGoToPage}
      </Btn>
    </Deck>
  );
}
