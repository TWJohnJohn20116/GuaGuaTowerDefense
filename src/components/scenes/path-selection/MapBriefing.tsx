/**
 * 戰前簡報 · 主入口（HARDLINE Console 主區）
 *
 * Hero → 難度分段 → 戰場參數 → 自訂滑桿 → 遊戲模式 → 出擊列。
 * 難度是方塊分段，不是彩色漸層 chip。
 */

import type { Dispatch, SetStateAction } from 'react';
import type { GameDifficulty, DifficultyModifiers } from '@/types/game';
import { useTranslation } from '@/i18n';
import { Segments } from '@/components/hl';
import { SectionHeader, BriefingHero, BriefingFooter, EmptyBriefing, Badge } from './BriefingShared';
import { calculatePathStats } from './utils';
import { DifficultyRow, StatsGrid, CustomSliders, ModePanel, DIFFICULTY_META } from './briefing';
import { getPathDifficultyLabel, getDifficultyMeta } from './sidebar/difficulty';

export interface MapBriefingProps {
  selectedMap: any;
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
      <div className="min-h-0 flex-1 overflow-y-auto">
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
            {
              label: t.pathSelection.pathLengthLabel,
              value: stats.length,
            },
            { label: t.pathSelection.turnCountLabel, value: stats.turns },
            {
              label: c.sectionDifficulty,
              value: getPathDifficultyLabel(selectedMap.difficulty, t),
            },
            { label: c.expectedReward, value: rewardCoins, unit: 'coins' },
          ]}
        />

        <div className="flex flex-col gap-5 p-4 lg:p-5">
          <section>
            <SectionHeader
              title={c.sectionDifficulty}
              right={
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
                    {diffMeta.stars > 0 ? `${diffMeta.stars}/5` : '—'}
                  </span>
                  <Segments total={5} filled={diffMeta.stars} size="sm" tone={diffMeta.tone} />
                </span>
              }
            />
            <DifficultyRow selected={selectedDifficulty} onChange={setSelectedDifficulty} />
          </section>

          <section>
            <SectionHeader title={c.sectionBattleParams} />
            <StatsGrid mod={mod} />
          </section>

          {selectedDifficulty === 'custom' && (
            <CustomSliders custom={customModifiers} setCustom={setCustomModifiers} />
          )}

          <section>
            <SectionHeader
              title={c.sectionGameMode}
              right={
                <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
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
          </section>
        </div>
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
