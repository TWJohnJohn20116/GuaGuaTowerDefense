// 商店 · 購買建議（一行資料，不是卡片）
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Dot } from '@/components/hl';

interface ShopSuggestionBannerProps {
  label: string;
  affordable: boolean;
}

export function ShopSuggestionBanner({ label, affordable }: ShopSuggestionBannerProps) {
  const { t } = useTranslation();
  const text = affordable
    ? fillTemplate(t.shop.suggestionAffordable, { label })
    : fillTemplate(t.shop.suggestionNeedCoins, { label });

  return (
    <div className="mt-3 flex items-center gap-2.5 border border-[var(--hl-line)] bg-[var(--hl-deck)] px-3 py-2">
      <Dot tone={affordable ? 'signal' : 'ink'} />
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--hl-ink-2)]">
        {text}
      </span>
    </div>
  );
}

export default ShopSuggestionBanner;
