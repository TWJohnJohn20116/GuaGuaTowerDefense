// 皮膚工坊 · 解鎖建議（一行資料，文案沿用原本字串）
import { Deck, Dot } from '@/components/hl';

interface SkinSuggestionBannerProps {
  label: string;
  nearUnlock: boolean;
}

export function SkinSuggestionBanner({ label, nearUnlock }: SkinSuggestionBannerProps) {
  return (
    <Deck className="mt-3 flex items-center gap-2.5 px-3 py-2">
      <Dot tone={nearUnlock ? 'signal' : 'ink'} />
      <span className="font-mono text-[10px] tracking-[0.06em] text-[var(--arc-ink-2)]">
        {nearUnlock
          ? `下一個目標「${label}」— 完成條件即可解鎖`
          : `繼續挑戰關卡與成就，解鎖「${label}」`}
      </span>
    </Deck>
  );
}

export default SkinSuggestionBanner;
