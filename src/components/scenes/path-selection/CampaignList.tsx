/**
 * 戰役章節清單（HARDLINE 左軌）
 *
 * 章節是一段 mono 標頭 + 進度刻度，關卡是一列 RailItem：
 * 編號、名稱、右側星等。鎖住的關卡只留一行解鎖提示。
 */

import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import {
  CAMPAIGN_CHAPTERS,
  getCampaignLevelUnlockHint,
  getRecommendedCampaignLevelId,
} from '@/data/campaignData';
import { useCampaignStore } from '@/store/campaignStore';
import { PATHS } from '@/data/gameData';
import { getPathDisplayName } from '@/data/gameData/pathData';
import { isHiddenCampaignMap } from '@/data/gameData/hiddenCampaignMaps';
import { CampaignProgressBanner } from './CampaignProgressBanner';
import { Badge } from './BriefingShared';
import { Dot, Empty, RailItem, Segments } from '@/components/hl';
import type { CampaignLevel, CampaignChapter } from '@/types/campaign';

interface CampaignListProps {
  selectedId: string | null;
  onSelect: (levelId: string) => void;
}

interface CampaignNode extends CampaignLevel {
  status: 'locked' | 'available' | 'completed';
  isBoss: boolean;
  stars: number;
  isNextTarget: boolean;
}

// ──────────────────────────────────────────────────────────────────────────
// 單一章節
// ──────────────────────────────────────────────────────────────────────────

interface ChapterSectionProps {
  chapter: CampaignChapter;
  nodes: CampaignNode[];
  selectedId: string | null;
  nextTargetId: string | undefined;
  onSelect: (levelId: string) => void;
  isFinalChapter: boolean;
}

function ChapterSection({
  chapter,
  nodes,
  selectedId,
  nextTargetId,
  onSelect,
  isFinalChapter,
}: ChapterSectionProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;

  const totalCompleted = nodes.filter((n) => n.status === 'completed').length;
  const chapterCompleted = nodes.length > 0 && totalCompleted === nodes.length;
  const chapterHasUnlocked = nodes.some((n) => n.status !== 'locked');
  const chapterStars = nodes.reduce((sum, n) => sum + n.stars, 0);
  const chapterMaxStars = nodes.length * 3;
  const isHiddenChapter = chapter.chapterNumber === 9;

  return (
    <div className="border-b border-[var(--hl-line)]">
      {/* 章節頭 */}
      <div className="bg-[var(--hl-deck-2)] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] tabular-nums text-[var(--hl-ink-4)]">
            ch.{String(chapter.chapterNumber).padStart(2, '0')}
          </span>
          <span
            className={`font-mono text-[9.5px] tabular-nums ${
              chapterCompleted ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-ink-3)]'
            }`}
          >
            {totalCompleted}/{nodes.length}
          </span>
        </div>
        <div
          className={`mt-1 truncate text-[12px] font-semibold ${
            chapterHasUnlocked ? 'text-[var(--hl-ink)]' : 'text-[var(--hl-ink-4)]'
          }`}
          title={chapter.title}
        >
          {chapter.title}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 overflow-hidden">
          <Segments
            total={Math.max(nodes.length, 1)}
            filled={totalCompleted}
            size="sm"
            tone={chapterCompleted ? 'vital' : 'caution'}
          />
          <span className="shrink-0 font-mono text-[9px] tabular-nums text-[var(--hl-ink-4)]">
            {chapterStars}/{chapterMaxStars}
          </span>
        </div>
        {isHiddenChapter && (
          <p className="mt-1.5 text-[9.5px] leading-snug text-[var(--hl-caution)]/80">
            {c.hiddenMapHint}
          </p>
        )}
      </div>

      {/* 關卡列 */}
      {nodes.length === 0 ? (
        <Empty title={c.noLevels} className="m-2" />
      ) : (
        nodes.map((node, idx) => {
          const selected = selectedId === node.id;
          const isNext = node.isNextTarget && node.id === nextTargetId;
          const locked = node.status === 'locked';

          return (
            <div key={node.id}>
              <RailItem
                index={idx + 1}
                active={selected}
                onClick={locked ? undefined : () => onSelect(node.id)}
                label={
                  <span className={locked ? 'text-[var(--hl-ink-4)]' : undefined}>
                    {node.title}
                  </span>
                }
                right={
                  <span className="flex shrink-0 items-center gap-1.5">
                    {isNext && <Dot tone="signal" />}
                    {node.isBoss && <Dot tone="alarm" />}
                    <span
                      className={`font-mono text-[9.5px] tabular-nums ${
                        locked
                          ? 'text-[var(--hl-ink-4)]'
                          : node.stars >= 3
                            ? 'text-[var(--hl-caution)]'
                            : 'text-[var(--hl-ink-3)]'
                      }`}
                      title={c.sectionStarChallenge}
                    >
                      {node.stars}/3
                    </span>
                  </span>
                }
              />
              {locked && (
                <p className="truncate border-b border-[var(--hl-line)] px-3 pb-1.5 text-[9.5px] leading-snug text-[var(--hl-ink-4)]">
                  {getCampaignLevelUnlockHint(node.id)}
                </p>
              )}
              {!locked && PATHS[node.mapId] && (
                <div className="flex items-center justify-between gap-2 border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] px-3 py-1">
                  <span className="min-w-0 truncate font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
                    {getPathDisplayName(node.mapId)}
                  </span>
                  {isHiddenCampaignMap(node.mapId) && (
                    <Badge label={c.badgeHidden} tone="caution" />
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {isFinalChapter && chapterCompleted && (
        <div className="border-b border-[var(--hl-line)] bg-[var(--hl-signal-veil)] px-3 py-2.5">
          <Badge label={c.badgeCompleted} tone="signal" />
          <p className="mt-1.5 text-[10px] leading-snug text-[var(--hl-ink-2)]">
            {t.pathSelection.campaignDefaultDesc}
          </p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 主元件
// ──────────────────────────────────────────────────────────────────────────

export function CampaignList({ selectedId, onSelect }: CampaignListProps) {
  const completedLevels = useCampaignStore((s) => s.completedLevels);
  const unlockedLevels = useCampaignStore((s) => s.unlockedLevels);
  const levelStars = useCampaignStore((s) => s.levelStars);

  const nextTargetId = useMemo(
    () =>
      getRecommendedCampaignLevelId(
        (id) => unlockedLevels.includes(id),
        (id) => completedLevels.includes(id),
      ),
    [unlockedLevels, completedLevels],
  );

  const chapterSections = useMemo(() => {
    return CAMPAIGN_CHAPTERS.map((chapter) => {
      const nodes: CampaignNode[] = chapter.levels
        .filter((lv) => PATHS[lv.mapId])
        .map((lv) => {
          const completed = completedLevels.includes(lv.id);
          const unlocked = unlockedLevels.includes(lv.id);
          const status = completed
            ? ('completed' as const)
            : unlocked
              ? ('available' as const)
              : ('locked' as const);
          return {
            ...lv,
            status,
            isBoss: !!lv.isBossLevel,
            stars: levelStars[lv.id] ?? 0,
            isNextTarget: lv.id === nextTargetId && status === 'available',
          };
        });
      return { chapter, nodes };
    });
  }, [completedLevels, unlockedLevels, levelStars, nextTargetId]);

  const lastChapterIdx = chapterSections.length - 1;

  return (
    <div className="flex flex-col">
      <CampaignProgressBanner onJumpToNext={onSelect} />
      {chapterSections.map(({ chapter, nodes }, idx) => (
        <ChapterSection
          key={chapter.id}
          chapter={chapter}
          nodes={nodes}
          selectedId={selectedId}
          nextTargetId={nextTargetId}
          onSelect={onSelect}
          isFinalChapter={idx === lastChapterIdx}
        />
      ))}
    </div>
  );
}

export default CampaignList;
