// 商店 · 購買結果提示（方角、1px 線、mono 標籤）
import { useTranslation } from '@/i18n';
import { CheckIcon, WarningIcon } from '@/components/ui/Icons';

interface ShopPurchaseToastProps {
  result: { name: string; success: boolean } | null;
}

export function ShopPurchaseToast({ result }: ShopPurchaseToastProps) {
  const { t } = useTranslation();
  if (!result) return null;

  const ok = result.success;

  return (
    <div
      className={[
        'hl-enter pointer-events-none fixed left-1/2 top-[64px] z-[200] -translate-x-1/2',
        'flex items-center gap-2 border bg-[var(--hl-deck)] px-3.5 py-2',
        ok
          ? 'border-[var(--hl-vital)] text-[var(--hl-vital)]'
          : 'border-[var(--hl-alarm)] text-[var(--hl-alarm)]',
      ].join(' ')}
    >
      {ok ? <CheckIcon className="h-3.5 w-3.5" /> : <WarningIcon className="h-3.5 w-3.5" />}
      <span className="font-mono text-[10px] uppercase tracking-[0.08em]">
        {ok ? t.shop.successUnlocked.replace('{name}', result.name) : t.shop.coinShort}
      </span>
    </div>
  );
}

export default ShopPurchaseToast;
