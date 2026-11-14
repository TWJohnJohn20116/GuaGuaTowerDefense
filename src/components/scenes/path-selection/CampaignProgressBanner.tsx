/**
 * 戰役總進度（HARDLINE 左軌狀態帶）
 *
 * 一條計量條 + 一行等寬數字 + 下一個目標。沒有漸層橫幅、沒有陰影。
 */
import {
  getCampaignProgressSummary,
  getRecommendedCampaignLevelId,
  getRecommendedRetryLevelId,
  findCampaignLevelById,
} from '@/data/campaignData';
import { useCampaignStore } from '@/store/campaignStore';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Btn, Meter, SegHead } from '@/components/hl';

interface Props {
  onJumpToNext?: (levelId: string) => void;
}

export function CampaignProgressBanner({ onJumpToNext }: Props) {
  const { t } = useTranslation();
  const p = t.pathSelectionExt;
  const completedLevels = useCampaignStore((s) => s.completedLevels);
  const levelStars = useCampaignStore((s) => s.levelStars);
  const isLevelUnlocked = useCampaignStore((s) => s.isLevelUnlocked);
  const isLevelCompleted = useCampaignStore((s) => s.isLevelCompleted);

  const summary = getCampaignProgressSummary(completedLevels, levelStars);
  const nextId = getRecommendedCampaignLevelId(isLevelUnlocked, isLevelCompleted);
  const nextLevel = nextId ? findCampaignLevelById(nextId) : undefined;
  const retryId = getRecommendedRetryLevelId(isLevelUnlocked, isLevelCompleted, levelStars);
  const retryLevel = retryId ? findCampaignLevelById(retryId) : undefined;
  const allDone = summary.completedLevels >= summary.totalLevels && summary.totalLevels > 0;

  return (
    <div className="border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] px-3 py-2.5">
      <SegHead
        label={p.campaignProgressTitle}
        right={
          <span className="font-mono text-[10px] tabular-nums text-[var(--hl-caution)]">
            {summary.percent}%
          </span>
        }
      />

      <Meter value={summary.percent} max={100} tone="caution" className="mt-2" />

      <div className="mt-2 flex flex-col gap-0.5 font-mono text-[9.5px] tabular-nums leading-snug text-[var(--hl-ink-3)]">
        <span className="truncate">
          {fillTemplate(p.campaignLevelsLine, {
            done: String(summary.completedLevels),
            total: String(summary.totalLevels),
          })}
        </span>
        <span className="truncate">
          {fillTemplate(p.campaignChaptersLine, {
            done: String(summary.completedChapters),
            total: String(summary.totalChapters),
          })}
        </span>
        <span className="truncate text-[var(--hl-caution)]">
          {summary.totalStars}/{summary.maxStars}
        </span>
      </div>

      {allDone ? (
        <p className="mt-2 text-[11px] leading-snug text-[var(--hl-vital)]">{p.campaignAllDone}</p>
      ) : (
        <div className="mt-2 flex flex-col gap-1">
          {nextLevel && nextId && (
            <Btn size="sm" variant="line" block onClick={() => onJumpToNext?.(nextId)}>
              <span className="min-w-0 truncate">
                <span className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--hl-ink-4)]">
                  {p.campaignNextLevel}
                </span>
                {nextLevel.title}
              </span>
            </Btn>
          )}
          {retryLevel && retryId && retryId !== nextId && (
            <Btn size="sm" variant="ghost" block onClick={() => onJumpToNext?.(retryId)}>
              <span className="min-w-0 truncate">
                <span className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--hl-ink-4)]">
                  {p.campaignRetryStars}
                </span>
                {retryLevel.title}
              </span>
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}

export default CampaignProgressBanner;
