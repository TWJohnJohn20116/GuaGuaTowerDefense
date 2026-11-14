/**
 * 戰役結算 · 失敗關卡提示面板
 *
 * 只陳述事實：哪一關、停在第幾波、最佳星數、怎麼再戰。
 * 文案全部走 campaignFailCopy 與 i18n，面板本身只有 1px 線與資料色。
 */

import { findCampaignLevelById, findChapterByLevelId } from '@/data/campaignData';
import {
  formatCampaignFailBest,
  formatCampaignFailChapter,
  formatCampaignFailRetryHint,
  formatCampaignFailStopped,
} from '@/data/campaignFailCopy';
import { MapIcon, RefreshIcon } from '@/components/ui/Icons';
import { useCampaignStore } from '@/store/campaignStore';
import { useTranslation } from '@/i18n';
import { Deck, Segments } from '@/components/hl';

interface Props {
  levelId: string;
  wave: number;
}

export function GameOverCampaignPanel({ levelId, wave }: Props) {
  const { t } = useTranslation();
  const g = t.game;
  const level = findCampaignLevelById(levelId);
  const chapter = findChapterByLevelId(levelId);
  const bestStars = useCampaignStore((s) => s.getLevelStars(levelId));

  if (!level) return null;

  return (
    <Deck tone="sunken" className="relative flex flex-col gap-3 p-4 sm:p-5">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-[2px] bg-[var(--hl-alarm)]"
      />

      <div className="flex flex-wrap items-center gap-2 pl-1">
        <MapIcon className="h-3.5 w-3.5 text-[var(--hl-ink-3)]" />
        <span className="hl-label text-[var(--hl-alarm)]">{g.campaignFailTitle}</span>
        {chapter && (
          <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
            {formatCampaignFailChapter(g.campaignFailChapter, chapter.chapterNumber)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 pl-1">
        <span className="text-[15px] font-semibold leading-tight text-[var(--hl-ink)]">
          {level.title}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-[var(--hl-ink-2)]">
          {formatCampaignFailStopped(g.campaignFailStopped, wave)}
        </span>
      </div>

      {bestStars > 0 && (
        <div className="flex items-center gap-2.5 pl-1">
          <Segments total={3} filled={bestStars} tone="caution" size="sm" />
          <span className="font-mono text-[10px] tabular-nums text-[var(--hl-caution)]">
            {formatCampaignFailBest(g.campaignFailBest, bestStars)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-[var(--hl-line)] pl-1 pt-2.5 text-[var(--hl-ink-4)]">
        <RefreshIcon className="h-3.5 w-3.5" />
        <span className="font-mono text-[10px] leading-relaxed">
          {formatCampaignFailRetryHint(g.campaignFailRetryHint, g.retryCampaignLevel)}
        </span>
      </div>
    </Deck>
  );
}
