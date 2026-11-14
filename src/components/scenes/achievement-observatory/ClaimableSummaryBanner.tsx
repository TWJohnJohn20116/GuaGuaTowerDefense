/**
 * 檔案館 · 待領取狀態條
 *
 * 只在有待領取時出現：左緣訊號條 + 一行字 + 兩顆按鈕。不抢版面。
 */
import { Btn, Dot } from '@/components/hl';
import { useTranslation } from '@/i18n';

interface ClaimableSummaryBannerProps {
  claimableCount: number;
  onClaimAll: () => void;
  onShowClaimable: () => void;
}

export function ClaimableSummaryBanner({
  claimableCount,
  onClaimAll,
  onShowClaimable,
}: ClaimableSummaryBannerProps) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;

  if (claimableCount <= 0) return null;

  return (
    <div className="relative flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--hl-line)] bg-[var(--hl-deck-2)] py-1.5 pl-4 pr-3">
      <span aria-hidden="true" className="absolute left-0 top-0 h-full w-[2px] bg-[var(--hl-caution)]" />
      <Dot tone="caution" pulse />
      <span className="hl-label">{o.statClaimable}</span>
      <span className="font-mono text-[15px] font-semibold leading-none tabular-nums text-[var(--hl-caution)]">
        {claimableCount}
      </span>
      <span className="ml-auto flex items-center gap-2">
        <Btn size="sm" variant="ghost" onClick={onShowClaimable}>
          {o.filterClaimable}
        </Btn>
        <Btn size="sm" variant="signal" onClick={onClaimAll}>
          {`${o.claimBtn} · ${claimableCount}`}
        </Btn>
      </span>
    </div>
  );
}

export default ClaimableSummaryBanner;
