/**
 * 戰前簡報 · 任務板（CANDY POP）
 *
 * 版面分三層，順序就是決策順序：
 *   1. 地圖卡──「我要打哪張圖」（預覽 + 名稱 + 路徑數據 + 地圖原生難度）
 *   2. 設定區──「這局多難、多長」（難度｜戰場參數 兩欄並排，遊戲模式整列）
 *   3. 出擊列──「確認後開打」（sticky，唯一顯示獎勵與出擊摘要的地方）
 *
 * 獎勵數字只出現在出擊列：原本 hero 與底部各算一次，兩處數字一旦不同步就是錯誤訊息。
 */

import { useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameDifficulty, DifficultyModifiers } from '@/types/game';
import { useTranslation } from '@/i18n';
import { Btn, Segments, StatCell } from '@/components/hl';
import { SectionHeader, BriefingHero, EmptyBriefing, Badge } from './BriefingShared';
import { calculatePathStats } from './utils';
import {
  DifficultyRow,
  StatsGrid,
  CustomSliders,
  ModePanel,
  DIFFICULTY_META,
  getGameDifficultyLabel,
} from './briefing';
import { getDifficultyMeta } from './sidebar/difficulty';
import { findPlayableWaveSet } from '@/utils/waveSets';
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

type ChipTone = 'ink' | 'reach' | 'signal';

const CHIP_TONE: Record<ChipTone, string> = {
  ink: 'text-[var(--cn-ink)]',
  reach: 'text-[var(--cn-grape-deep)]',
  signal: 'text-[var(--cn-coral-deep)]',
};

/** 出擊摘要的一格：標籤 + 等寬值。 */
function SummaryChip({ label, value, tone = 'ink' }: { label: string; value: string; tone?: ChipTone }) {
  return (
    <span className="flex min-w-0 max-w-[240px] items-center gap-1.5 rounded-[var(--cn-r-pill)] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card)] py-1 pl-2.5 pr-3">
      <span className="shrink-0 text-[10px] font-extrabold tracking-[0.04em] text-[var(--cn-ink-3)]">
        {label}
      </span>
      <span className={`truncate font-mono text-[12px] font-extrabold tabular-nums ${CHIP_TONE[tone]}`}>
        {value}
      </span>
    </span>
  );
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

  const stats = useMemo(
    () =>
      selectedMap
        ? calculatePathStats(selectedMap.path.waypoints, selectedMap.path.segments)
        : { length: 0, turns: 0 },
    [selectedMap],
  );

  const waveCount = useMemo(() => {
    if (endlessMode) return 0;
    if (!customWaveSetId) return selectedWaves;
    const ws = findPlayableWaveSet(customWaveSetId);
    return ws ? ws.waves.length : selectedWaves;
  }, [endlessMode, customWaveSetId, selectedWaves]);

  if (!selectedMap) {
    return <EmptyBriefing title={t.pathSelection.selectMapPrompt} hint={t.pathSelection.selectMapHint} />;
  }

  const mapMeta = getDifficultyMeta(selectedMap.difficulty);
  const diffMeta = DIFFICULTY_META[selectedDifficulty];
  const diffLabel = getGameDifficultyLabel(t, selectedDifficulty);

  const rewardCoins = Math.round(
    (endlessMode ? 100 : selectedWaves) *
      10 *
      mod.enemyRewardMult *
      (selectedDifficulty === 'custom' ? 1 : 1.5),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1 pr-1">
        <BriefingHero
          path={selectedMap.path}
          eyebrow={c.missionObjective}
          title={selectedMap.name}
          description={selectedMap.description || t.pathSelection.defaultDescription}
          topBadges={
            selectedMap.type === 'mod' && selectedMap.modName ? (
              <Badge label={selectedMap.modName} tone="muted" />
            ) : undefined
          }
          stats={[
            { label: t.pathSelection.pathLengthLabel, value: stats.length },
            { label: t.pathSelection.turnCountLabel, value: stats.turns },
          ]}
          nativeDifficulty={{
            label: c.nativeDifficulty,
            filled: mapMeta.stars,
            tone: mapMeta.tone,
            caption: `${mapMeta.stars}/5`,
          }}
        />

        <div className="grid shrink-0 gap-3 lg:grid-cols-2">
          {/* 難度 */}
          <section className="arc-panel flex flex-col p-3.5">
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
            {selectedDifficulty === 'custom' && (
              <CustomSliders custom={customModifiers} setCustom={setCustomModifiers} />
            )}
          </section>

          {/* 戰場參數 */}
          <section className="arc-panel flex flex-col p-3.5">
            <SectionHeader
              title={c.sectionBattleParams}
              hint={c.paramsHint}
              right={
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-[var(--cn-ink-4)]">
                  {diffLabel}
                </span>
              }
            />
            <StatsGrid mod={mod} />
          </section>
        </div>

        {/* 遊戲模式 */}
        <section className="arc-panel shrink-0 p-3.5">
          <SectionHeader
            title={c.sectionGameMode}
            right={
              <span className="font-mono text-[11px] font-extrabold tabular-nums text-[var(--cn-ink-3)]">
                {endlessMode ? '∞' : `${waveCount} ${t.pathSelection.waves}`}
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

      {/* 出擊列 */}
      <footer className="arc-panel flex shrink-0 flex-wrap items-center gap-2.5 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 overflow-hidden">
          <span className="arc-label shrink-0">{c.deploySummary}</span>
          <SummaryChip label={c.mapLabel} value={selectedMap.name} />
          <SummaryChip label={t.pathSelection.difficultyLabel} value={diffLabel} tone="reach" />
          <SummaryChip label={c.wavesLabel} value={endlessMode ? '∞' : String(waveCount)} />
        </div>
        <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-end">
          <StatCell label={c.expectedReward} value={rewardCoins} unit="coins" tone="signal" />
          <Btn variant="signal" size="lg" onClick={onStart}>
            {t.pathSelection.startBattle}
          </Btn>
        </div>
      </footer>
    </div>
  );
}

export default MapBriefing;
