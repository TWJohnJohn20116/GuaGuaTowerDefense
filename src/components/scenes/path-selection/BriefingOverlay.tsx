/**
 * 選圖 · 全屏作戰簡報層（兩步流程的第二步）
 *
 * 版面順序＝決策順序：這是哪張圖 → 這局多難 → 這局多長 → 出擊。
 * 出擊列固定在底部：獎勵數字只出現在那一列，避免同一件事算兩次而不同步。
 * 這一層是覆蓋在主畫面上的獨立區塊，關掉就回到卡牌牆（不重進場景）。
 */

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useMemo } from 'react';
import type { DifficultyModifiers, GameDifficulty } from '@/types/game';
import { boundsOf } from '@/data/mapGeometry';
import { useTranslation } from '@/i18n';
import { Btn, IconBtn, Segments, StatCell } from '@/components/hl';
import { XIcon } from '@/components/ui/Icons';
import { findPlayableWaveSet } from '@/utils/waveSets';
import { PathPreview } from './PathPreview';
import { DifficultyPicker } from './DifficultyPicker';
import { CustomTuning } from './CustomTuning';
import { ParamGrid } from './ParamGrid';
import { ModeSection } from './ModeSection';
import { calculatePathStats } from './utils';
import {
  GAME_DIFFICULTY_META,
  getGameDifficultyLabel,
  getMapDifficultyLabel,
  getMapDifficultyMeta,
} from './difficultyMeta';
import type { MapItemData } from './mapLibrary';

interface BriefingOverlayProps {
  map: MapItemData;
  onClose: () => void;
  difficulty: GameDifficulty;
  setDifficulty: (difficulty: GameDifficulty) => void;
  customModifiers: DifficultyModifiers;
  setCustomModifiers: Dispatch<SetStateAction<DifficultyModifiers>>;
  /** 目前生效的修飾值（自訂＝customModifiers，其餘＝難度表） */
  modifiers: DifficultyModifiers;
  endlessMode: boolean;
  setEndlessMode: (endless: boolean) => void;
  selectedWaves: number;
  setSelectedWaves: (waves: number) => void;
  customWaveSetId: string;
  setCustomWaveSetId: (id: string) => void;
  onStart: () => void;
}

/** 卡內的區段頭：標題 + 右側資料。不導出，只有這一層用。 */
function PanelHead({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <span className="arc-title text-[15px]">{title}</span>
      {right && <span className="shrink-0">{right}</span>}
    </div>
  );
}

/** 出擊摘要的一格：標籤 + 等寬值 */
function SummaryChip({ label, value, signal = false }: { label: string; value: string; signal?: boolean }) {
  return (
    <span className="flex min-w-0 max-w-[240px] items-center gap-1.5 rounded-[var(--cn-r-pill)] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card)] py-1 pl-2.5 pr-3">
      <span className="shrink-0 text-[10px] font-extrabold tracking-[0.04em] text-[var(--cn-ink-3)]">
        {label}
      </span>
      <span
        className={`truncate font-mono text-[12px] font-extrabold tabular-nums ${
          signal ? 'text-[var(--cn-signal-text)]' : 'text-[var(--cn-ink)]'
        }`}
      >
        {value}
      </span>
    </span>
  );
}

export function BriefingOverlay({
  map,
  onClose,
  difficulty,
  setDifficulty,
  customModifiers,
  setCustomModifiers,
  modifiers,
  endlessMode,
  setEndlessMode,
  selectedWaves,
  setSelectedWaves,
  customWaveSetId,
  setCustomWaveSetId,
  onStart,
}: BriefingOverlayProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;

  const stats = useMemo(
    () => calculatePathStats(map.path.waypoints, map.path.segments),
    [map.path],
  );

  const waveCount = useMemo(() => {
    if (endlessMode) return 0;
    if (!customWaveSetId) return selectedWaves;
    const waveSet = findPlayableWaveSet(customWaveSetId);
    return waveSet ? waveSet.waves.length : selectedWaves;
  }, [endlessMode, customWaveSetId, selectedWaves]);

  const mapMeta = getMapDifficultyMeta(map.difficulty);
  const mapDifficultyLabel = getMapDifficultyLabel(map.difficulty, t);
  const diffMeta = GAME_DIFFICULTY_META[difficulty];
  const diffLabel = getGameDifficultyLabel(t, difficulty);
  const bounds = boundsOf(map.path);

  const rewardCoins = Math.round(
    (endlessMode ? 100 : waveCount) * 10 * modifiers.enemyRewardMult * (difficulty === 'custom' ? 1 : 1.5),
  );

  const locked = !!map.isLocked;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(46,36,64,0.52)] p-3 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={map.name}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-[1680px] flex-col overflow-hidden rounded-[28px] border-[3px] border-[var(--cn-line)] bg-[var(--cn-paper)] shadow-[0_28px_70px_-24px_rgba(46,36,64,0.55)] sm:max-h-[calc(100vh-3rem)]"
      >
      {/* 頂列：返回牆 + 地圖識別 + 原生難度 */}
      <header className="flex shrink-0 items-center gap-3 border-b-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] px-4 py-2.5 sm:px-5">
        <IconBtn
          label={t.common.close}
          onClick={onClose}
          className="h-9 w-9 shrink-0 border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_3px_0_var(--cn-line)] hover:bg-[var(--cn-card-2)] active:translate-y-px active:shadow-none"
        >
          <XIcon className="h-4 w-4" />
        </IconBtn>

        <h2 className="min-w-0 flex-1 truncate text-[19px] font-black leading-tight text-[var(--cn-ink)]">
          {map.name}
        </h2>

        {/* 窄版只留波次：原生難度在 hero 的資料列已經有一格，頂列不必擠滿 */}
        <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="arc-label">{c.nativeDifficulty}</span>
            <Segments total={5} filled={mapMeta.stars} size="sm" tone={mapMeta.tone} />
            <span className={`font-mono text-[11px] font-extrabold tabular-nums ${mapMeta.text}`}>
              {mapDifficultyLabel}
            </span>
          </span>
        </div>
        <span className="shrink-0 rounded-[var(--cn-r-pill)] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-2.5 py-1 font-mono text-[11px] font-extrabold tabular-nums text-[var(--cn-ink-2)]">
          {endlessMode ? '∞' : `${waveCount} ${t.pathSelection.waves}`}
        </span>
      </header>

      {/* 主體 */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 p-3">
          {/* 地圖 hero：左真渲染預覽，右識別與數據 */}
          <section className="arc-panel grid shrink-0 overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="flex flex-col justify-center gap-2 border-b-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] p-3 lg:border-b-0 lg:border-r-[3px]">
              <PathPreview pathConfig={map.path} size="normal" className="w-full shrink-0" />
              <div className="flex items-center justify-between rounded-[var(--cn-r-sm)] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2 py-1 text-[10px] font-extrabold text-[var(--cn-ink-3)]">
                <span>
                  {bounds.width} × {bounds.height}
                </span>
                <span className="font-mono uppercase tracking-[0.06em]">
                  {map.path.category ?? 'path'}
                </span>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="arc-label">{c.missionObjective}</span>
                  <h2 className="mt-1 text-[26px] font-black leading-[1.15] tracking-[-0.02em] text-[var(--cn-ink)]">
                    {map.name}
                  </h2>
                </div>
                {map.modName && (
                  <span className="shrink-0 rounded-[var(--cn-r-pill)] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--cn-ink-3)]">
                    {map.modName}
                  </span>
                )}
              </div>

              <p className="max-w-[68ch] text-[13px] font-medium leading-relaxed text-[var(--cn-ink-2)]">
                {map.description || t.pathSelection.defaultDescription}
              </p>

              <div className="mt-auto grid grid-cols-2 gap-2 border-t-[3px] border-[var(--cn-line-soft)] pt-3 sm:grid-cols-4">
                <StatCell label={t.pathSelection.pathLengthLabel} value={stats.length} />
                <StatCell label={t.pathSelection.turnCountLabel} value={stats.turns} />
                <StatCell label={c.wavesLabel} value={endlessMode ? '∞' : waveCount} />
                <StatCell label={t.pathSelection.difficultyLabel} value={diffLabel} tone="signal" />
              </div>
            </div>
          </section>

          {/* 難度 + 參數 */}
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <section className="arc-panel flex flex-col p-3.5">
              <PanelHead
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
              <DifficultyPicker selected={difficulty} onChange={setDifficulty} />
              {difficulty === 'custom' && (
                <div className="mt-3">
                  <CustomTuning custom={customModifiers} setCustom={setCustomModifiers} />
                </div>
              )}
            </section>

            <section className="arc-panel flex flex-col p-3.5">
              <PanelHead
                title={c.sectionBattleParams}
                right={
                  <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-[var(--cn-ink-4)]">
                    {c.paramsHint}
                  </span>
                }
              />
              <ParamGrid mod={modifiers} />
            </section>
          </div>

          {/* 模式 */}
          <section className="arc-panel shrink-0 p-3.5">
            <PanelHead title={c.sectionGameMode} />
            <ModeSection
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

      {/* 出擊列 */}
      <footer className="shrink-0 border-t-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] px-4 py-2.5 sm:px-5">
        <div className="mx-auto flex w-full max-w-[1680px] flex-wrap items-center gap-2.5">
          <div className="hidden min-w-0 flex-1 flex-wrap items-center gap-2 overflow-hidden sm:flex">
            <span className="arc-label shrink-0">{c.deploySummary}</span>
            <SummaryChip label={c.mapLabel} value={map.name} />
            <SummaryChip label={t.pathSelection.difficultyLabel} value={diffLabel} signal />
            <SummaryChip
              label={c.wavesLabel}
              value={endlessMode ? '∞' : String(waveCount)}
            />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-end">
            <StatCell
              label={c.expectedReward}
              value={rewardCoins}
              unit="coins"
              tone="signal"
            />
            <Btn variant="signal" size="lg" onClick={onStart} disabled={locked}>
              {locked ? c.locked : t.pathSelection.startBattle}
            </Btn>
          </div>
        </div>
      </footer>
      </section>
    </div>
  );
}

export default BriefingOverlay;
