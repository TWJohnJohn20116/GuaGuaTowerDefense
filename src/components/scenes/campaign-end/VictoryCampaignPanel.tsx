/**
 * 戰役勝利 · 關卡結算資訊面板
 *
 * 星等用 Segments，生命用 Meter（門檻是 1px 刻線），獎勵是一行 mono。
 * 文案與數值來源完全不變，只換表達方式。
 */

import { useMemo, useRef } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import {
  findCampaignLevelById,
  findChapterByLevelId,
} from '@/data/campaignData';
import { TOWER_DATA } from '@/data/gameData';
import type { TowerType } from '@/types/game';
import {
  calculateCampaignStars,
  getStarRequirementPercents,
  STAR_THRESHOLDS,
} from '@/utils/campaignStars';
import {
  HeartIcon, CoinIcon, SparklesIcon, MapIcon, TowerIcon,
} from '@/components/ui/Icons';
import { Deck, Meter, Segments } from '@/components/hl';

interface Props {
  levelId: string;
  health: number;
  startingHealth: number;
  coinsGranted: number;
  talentGranted: number;
  unlockedTowers: TowerType[];
}

export function VictoryCampaignPanel({
  levelId,
  health,
  startingHealth,
  coinsGranted,
  talentGranted,
  unlockedTowers,
}: Props) {
  const level = findCampaignLevelById(levelId);
  const chapter = findChapterByLevelId(levelId);
  const isLevelCompleted = useCampaignStore((s) => s.isLevelCompleted);
  const getLevelStars = useCampaignStore((s) => s.getLevelStars);

  const prevBestRef = useRef(getLevelStars(levelId));
  const prevBest = prevBestRef.current;

  const stars = calculateCampaignStars(health, startingHealth);
  const isNewRecord = stars > prevBest;
  const displayBest = Math.max(prevBest, stars);
  const { twoStarPercent, threeStarPercent } = getStarRequirementPercents();

  const healthRatio = useMemo(() => {
    const denom = startingHealth > 0 ? startingHealth : 1;
    return Math.min(100, Math.round((Math.max(0, health) / denom) * 100));
  }, [health, startingHealth]);

  const chapterProgress = useMemo(() => {
    if (!chapter) return null;
    const done = chapter.levels.filter(
      (lv) => isLevelCompleted(lv.id) || lv.id === levelId,
    ).length;
    return { done, total: chapter.levels.length };
  }, [chapter, isLevelCompleted, levelId]);

  const nextStarHint = useMemo(() => {
    if (stars >= 3) return null;
    const denom = startingHealth > 0 ? startingHealth : 1;
    const targetRatio = stars === 1 ? STAR_THRESHOLDS.two : STAR_THRESHOLDS.three;
    const targetHealth = Math.ceil(denom * targetRatio);
    const targetStars = stars === 1 ? 2 : 3;
    if (health >= targetHealth) return null;
    return `再保留 ${targetHealth - health} 點生命（≥${stars === 1 ? twoStarPercent : threeStarPercent}%）可衝 ${targetStars} 星`;
  }, [stars, health, startingHealth, twoStarPercent, threeStarPercent]);

  if (!level) return null;

  return (
    <Deck tone="sunken" className="flex flex-col gap-4 p-4 sm:p-5">
      {/* 關卡 + 星等 */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <MapIcon className="h-3.5 w-3.5 text-[var(--hl-ink-3)]" />
            <span className="hl-label text-[var(--hl-ink-2)]">戰役通關</span>
            {chapter && (
              <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
                · 第 {chapter.chapterNumber} 章
              </span>
            )}
          </div>
          <div className="mt-1.5 truncate text-[15px] font-semibold leading-tight text-[var(--hl-ink)]">
            {level.title}
          </div>
          {chapterProgress && chapterProgress.done >= chapterProgress.total ? (
            <div className="mt-1 font-mono text-[10px] font-semibold text-[var(--hl-vital)]">
              本章全部通關！
            </div>
          ) : chapterProgress ? (
            <div className="mt-1 font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
              章節進度 {chapterProgress.done}/{chapterProgress.total}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Segments total={3} filled={stars} tone="caution" />
          <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-2)]">
            本次 {stars} 星
            {(prevBest > 0 || isNewRecord) && (
              <span className="text-[var(--hl-ink-4)]">
                {' '}
                · 歷史最佳 {displayBest} 星
                {isNewRecord && <span className="text-[var(--hl-vital)]">（新紀錄）</span>}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* 生命與星等門檻 */}
      <div className="flex flex-col gap-2 border-t border-[var(--hl-line)] pt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]">
            <HeartIcon className="h-3 w-3" />
            剩餘生命
            <span className="tabular-nums text-[var(--hl-ink-2)]">
              {health} / {startingHealth}
            </span>
          </span>
          <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--hl-vital)]">
            {healthRatio}%
          </span>
        </div>

        <div className="relative">
          <Meter value={healthRatio} max={100} tone="vital" />
          <span
            aria-hidden="true"
            className="absolute -top-1 h-3 w-px bg-[var(--hl-reach)]"
            style={{ left: `${twoStarPercent}%` }}
            title={`${twoStarPercent}% 兩星`}
          />
          <span
            aria-hidden="true"
            className="absolute -top-1 h-3 w-px bg-[var(--hl-caution)]"
            style={{ left: `${threeStarPercent}%` }}
            title={`${threeStarPercent}% 三星`}
          />
        </div>

        <div className="flex justify-between font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-4)]">
          <span>1 星 · 通關即可</span>
          <span>{twoStarPercent}% 兩星</span>
          <span>{threeStarPercent}% 三星</span>
        </div>

        {nextStarHint && (
          <div className="font-mono text-[10px] leading-relaxed text-[var(--hl-caution)]">
            {nextStarHint}
          </div>
        )}
      </div>

      {/* 獎勵 */}
      <div className="flex flex-col gap-1.5 border-t border-[var(--hl-line)] pt-3 font-mono text-[11px] tabular-nums text-[var(--hl-ink-2)]">
        <span className="flex items-center gap-2">
          <CoinIcon className="h-3.5 w-3.5 text-[var(--hl-signal)]" />
          本局結算 <span className="font-semibold text-[var(--hl-signal)]">+{coinsGranted}</span> 金幣
        </span>
        <span className="flex items-center gap-2">
          <SparklesIcon className="h-3.5 w-3.5 text-[var(--hl-ink-3)]" />+{talentGranted} 天賦點
        </span>
        {unlockedTowers.length > 0 && (
          <span className="flex items-center gap-2">
            <TowerIcon className="h-3.5 w-3.5 text-[var(--hl-ink-3)]" />
            解鎖 {unlockedTowers.map((type) => TOWER_DATA[type]?.name ?? type).join('、')}
          </span>
        )}
      </div>
    </Deck>
  );
}
