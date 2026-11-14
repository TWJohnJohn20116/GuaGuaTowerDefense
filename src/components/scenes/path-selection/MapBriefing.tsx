/**
 * 戰前簡報（CANDY · 主機式關卡選擇）
 *
 * 只有兩張卡：
 *   1. 地圖卡：大預覽 + 名稱 + 說明 + 四格數據
 *   2. 作戰卡：難度列 → 進階設定（預設收合：戰場參數／模式／自訂滑桿）→ 出擊列
 * 目標是「一屏看完、一鍵出擊」，參數不打擾人。
 */

import type { Dispatch, SetStateAction } from 'react';
import type { GameDifficulty, DifficultyModifiers } from '@/types/game';
import { useTranslation } from '@/i18n';
import { Btn, Deck, Segments, StatCell } from '@/components/hl';
import { SectionHeader, BriefingHero, EmptyBriefing, Badge } from './BriefingShared';
import { calculatePathStats } from './utils';
import { DifficultyRow, StatsGrid, CustomSliders, ModePanel, DIFFICULTY_META } from './briefing';
import { getPathDifficultyLabel, getDifficultyMeta } from './sidebar/difficulty';
import { gameDifficultyLabelsFromGameCopy } from '@/data/gameRecordLabels';
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
  const diffLabels = gameDifficultyLabelsFromGameCopy(t.game);

  const rewardCoins = Math.round(
    (endlessMode ? 100 : selectedWaves) *
      10 *
      mod.enemyRewardMult *
      (selectedDifficulty === 'custom' ? 1 : 1.5),
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-[1220px] flex-1 flex-col gap-3 overflow-y-auto p-3">
        {/* 地圖卡固定高度，作戰卡吃掉剩餘空間，避免下半留白 */}
        <div className="flex min-h-[280px] flex-1 flex-col">
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
            { label: c.expectedReward, value: rewardCoins, unit: 'coins' },
          ]}
        />
        </div>

        <Deck className="shrink-0 overflow-hidden">
          {/* 難度列 */}
          <div className="p-4">
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
          </div>

          {/* 進階設定：預設收合 */}
          <details className="group border-t-[3px] border-[var(--cn-line-soft)]">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[13px] font-extrabold text-[var(--cn-ink-2)] transition-colors hover:text-[var(--cn-ink)] [&::-webkit-details-marker]:hidden">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-[var(--cn-line-soft)] text-[11px] leading-none transition-transform group-open:rotate-90">
                ▸
              </span>
              {t.mainMenu.advancedSettings}
              <span className="ml-auto text-[11px] font-bold text-[var(--cn-ink-4)]">
                {c.sectionBattleParams} · {c.sectionGameMode}
              </span>
            </summary>

            <div className="flex flex-col gap-4 px-4 pb-4">
              <div>
                <div className="mb-2 text-[11px] font-extrabold tracking-[0.06em] text-[var(--cn-ink-3)]">
                  {c.sectionBattleParams}
                </div>
                <StatsGrid mod={mod} />
              </div>

              <div>
                <div className="mb-2 text-[11px] font-extrabold tracking-[0.06em] text-[var(--cn-ink-3)]">
                  {c.sectionGameMode}
                </div>
                <ModePanel
                  endlessMode={endlessMode}
                  setEndlessMode={setEndlessMode}
                  selectedWaves={selectedWaves}
                  setSelectedWaves={setSelectedWaves}
                  customWaveSetId={customWaveSetId}
                  setCustomWaveSetId={setCustomWaveSetId}
                />
              </div>

              {selectedDifficulty === 'custom' && (
                <CustomSliders custom={customModifiers} setCustom={setCustomModifiers} />
              )}
            </div>
          </details>

          {/* 出擊列 */}
          <div className="mt-auto flex items-center justify-between gap-3 border-t-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-4 py-3">
            <StatCell
              label={c.expectedReward}
              value={rewardCoins}
              unit="coins"
              tone="signal"
            />
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-bold text-[var(--cn-ink-3)]">
                {endlessMode ? '∞' : `${selectedWaves}`} · {diffLabels[selectedDifficulty] ?? selectedDifficulty}
              </span>
              <Btn variant="signal" size="lg" onClick={onStart}>
                {t.pathSelection.startBattle}
              </Btn>
            </div>
          </div>
        </Deck>
      </div>
    </div>
  );
}

export default MapBriefing;
