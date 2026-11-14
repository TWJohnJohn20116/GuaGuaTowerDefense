/**
 * 戰前簡報 · 主入口（CANDY）
 *
 * 版面是「一疊卡片」：Hero → 難度 → 戰場參數 → 遊戲模式 → 出擊列。
 * 每個區塊都是一張獨立白卡，區段標題在卡內，不靠細線分隔。
 */

import type { Dispatch, SetStateAction } from 'react';
import type { GameDifficulty, DifficultyModifiers } from '@/types/game';
import { useTranslation } from '@/i18n';
import { Deck, Segments } from '@/components/hl';
import { SectionHeader, BriefingHero, BriefingFooter, EmptyBriefing, Badge } from './BriefingShared';
import { calculatePathStats } from './utils';
import { DifficultyRow, StatsGrid, CustomSliders, ModePanel, DIFFICULTY_META } from './briefing';
import { getPathDifficultyLabel, getDifficultyMeta } from './sidebar/difficulty';
import type { MapItemData } from './sidebar/MapRow';

export interface MapBriefingProps {
  selectedMap: MapItemData | undefined;
  selectedDifficulty: GameDifficulty;
  setSelectedDifficulty: (d: GameDifficulty) => void;
  endlessMode: boolean;
  setEndlessMode: (e: boolean) => void;
  selectedWaves: number;
  setSelectedWaves: (w: number) => void;
  customModifiers: DifficultyModifiers;
  setCustomModifiers: Dispatch<SetStateAction<DifficultyModifiers>>;
  mod: DifficultyModifiers;
  onStart: () => void;
  customWaveSetId: string;
  setCustomWaveSetId: (id: string) => void;
}

export function MapBriefing({
  selectedMap,
  selectedDifficulty,
  setSelectedDifficulty,
  endlessMode,
  setEndlessMode,
  selectedWaves,
  setSelectedWaves,
  customModifiers,
  setCustomModifiers,
  mod,
  onStart,
  customWaveSetId,
  setCustomWaveSetId,
}: MapBriefingProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;

  if (!selectedMap) {
    return <EmptyBriefing title={t.pathSelection.selectMapPrompt} hint={t.pathSelection.selectMapHint} />;
  }

  const stats = calculatePathStats(selectedMap.path.waypoints, selectedMap.path.segments);
  const mapMeta = getDifficultyMeta(selectedMap.difficulty);
  const diffMeta = DIFFICULTY_META[selectedDifficulty];

  const rewardCoins = Math.round(
    (endlessMode ? 100 : selectedWaves) *
      10 *
      mod.enemyRewardMult *
      (selectedDifficulty === 'custom' ? 1 : 1.5),
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-3">
        <BriefingHero
          path={selectedMap.path}
          eyebrow={c.missionObjective}
          title={selectedMap.name}
          description={selectedMap.description || t.pathSelection.defaultDescription}
          topBadges={
            <>
              <Badge label={getPathDifficultyLabel(selectedMap.difficulty, t)} tone="muted" />
              <Badge label={`${mapMeta.stars}/5`} tone="muted" />
            </>
          }
          stats={[
            { label: t.pathSelection.pathLengthLabel, value: stats.length },
            { label: t.pathSelection.turnCountLabel, value: stats.turns },
            { label: c.sectionDifficulty, value: getPathDifficultyLabel(selectedMap.difficulty, t) },
            { label: c.expectedReward, value: rewardCoins, unit: 'coins' },
          ]}
        />

        <Deck className="mx-3 p-4">
          <SectionHeader
            title={c.sectionDifficulty}
            right={
              <span className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-extrabold tabular-nums text-[var(--cn-ink-3)]">
                  {diffMeta.stars > 0 ? `${diffMeta.stars}/5` : '—'}
                </span>
                <Segments total={5} filled={diffMeta.stars} size="sm" tone={diffMeta.tone} />
              </span>
            }
          />
          <DifficultyRow selected={selectedDifficulty} onChange={setSelectedDifficulty} />
        </Deck>

        <Deck className="mx-3 p-4">
          <SectionHeader title={c.sectionBattleParams} />
          <StatsGrid mod={mod} />
        </Deck>

        {selectedDifficulty === 'custom' && (
          <Deck className="mx-3 p-4">
            <CustomSliders custom={customModifiers} setCustom={setCustomModifiers} />
          </Deck>
        )}

        <Deck className="mx-3 p-4">
          <SectionHeader
            title={c.sectionGameMode}
            right={
              <span className="rounded-full bg-[var(--cn-card-2)] px-2.5 py-0.5 text-[11px] font-extrabold tabular-nums text-[var(--cn-ink-2)]">
                {endlessMode ? '∞' : selectedWaves}
              </span>
            }
          />
          <ModePanel
            endlessMode={endlessMode}
            setEndlessMode={setEndlessMode}
            selectedWaves={selectedWaves}
            setSelectedWaves={setSelectedWaves}
            customWaveSetId={customWaveSetId}
            setCustomWaveSetId={setCustomWaveSetId}
          />
        </Deck>
      </div>

      <BriefingFooter
        unlocked
        rewardCoins={rewardCoins}
        rewardLabel={t.pathSelection.expectedReward}
        buttonLabel={t.pathSelection.startBattle}
        onStart={onStart}
      />
    </div>
  );
}

export default MapBriefing;
