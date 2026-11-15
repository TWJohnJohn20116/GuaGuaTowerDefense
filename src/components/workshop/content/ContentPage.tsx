/**
 * 內容頁 · 波次工作台
 *
 * 三欄，對應剪輯軟體的心智模型：
 *   左 ＝ 波次清單（順序、多選、批次、章節）
 *   中 ＝ 單軌時間軸（時間、順序、數量、播放頭）
 *   右 ＝ 檢視器 / 分析 / 陣容（單波細節、曲線與評分、可引用的資產）
 *
 * 所有寫入都經過 useWaveHistory 的 commit → workshopStore.updateLevel，
 * 這一頁不自己保存波次（世界資料只有 store 一份），撤銷也只記波次這一層。
 */
import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { useWorkshopStore } from '@/store/workshopStore';
import { Btn, Chip, Deck, Empty, IconBtn, Input, Num, SegHead } from '@/components/hl';
import { RedoIcon, UndoIcon, WarningIcon } from '@/components/ui/Icons';
import { ENEMY_DATA } from '@/data/gameData';
import { RosterPanel, type RosterAsset } from '@/components/workshop/content/RosterPanel';
import { WaveAnalysisPanel } from '@/components/workshop/content/WaveAnalysisPanel';
import { WaveFormulaPanel } from '@/components/workshop/content/WaveFormulaPanel';
import { WaveInspector, type WaveFieldPatch } from '@/components/workshop/content/WaveInspector';
import { WaveListPanel, type WaveBatchPatch } from '@/components/workshop/content/WaveListPanel';
import { WaveTrack, type SegmentRef } from '@/components/workshop/content/WaveTrack';
import { useWaveHistory } from '@/components/workshop/content/useWaveHistory';
import type { WaveConfig } from '@/types/game';
import {
  configsToTimelineWaves,
  createEnemyLookup,
  flattenWave,
  moveBlock,
  setDelay,
  timelineWavesToConfigs,
  validateTimeline,
  waveConfigToTimeline,
  type TimelineWave,
} from '@/workshop/content/timeline';
import {
  DEFAULT_ANALYSIS_PARAMS,
  analyzeWaves,
  snapshotAt,
  type AnalysisParams,
  type WaveBar,
} from '@/workshop/content/waveAnalysis';
import {
  batchMultiplyCount,
  batchPatchWaves,
  countSegments,
  duplicateWaves,
  insertSegment,
  insertWave,
  moveSegmentToWave,
  patchWave,
  removeSegment,
  removeWaves,
  reorderSegments,
  reorderWaves,
  resizeSegment,
  shiftSegment,
} from '@/workshop/content/waveModel';
import {
  DEFAULT_CURVE_FORMULA,
  DEFAULT_WAVE_FORMULA,
  type CurveFormula,
  type WaveFormula,
} from '@/workshop/content/waveFormula';

export interface ContentPageProps {
  projectId: string;
}

type RightTab = 'inspector' | 'analysis' | 'roster';

export function ContentPage({ projectId }: ContentPageProps) {
  const { t } = useTranslation();
  const c = t.studio.content;
  const w = c.wave;
  const s = t.studio;

  const project = useWorkshopStore((state) => state.getProject(projectId)) ?? null;
  const getLevel = useWorkshopStore((state) => state.getLevel);
  const updateLevel = useWorkshopStore((state) => state.updateLevel);
  const listAssets = useWorkshopStore((state) => state.listAssets);

  const levels = project?.levels ?? [];

  const [levelId, setLevelId] = useState<string | null>(null);
  const pickedLevelId = levelId && levels.some((item) => item.id === levelId) ? levelId : levels[0]?.id ?? null;
  const level = pickedLevelId ? getLevel(projectId, pickedLevelId) : null;

  const [selectedWaves, setSelectedWaves] = useState<number[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<SegmentRef[]>([]);
  const [playheadMs, setPlayheadMs] = useState(0);
  const [rightTab, setRightTab] = useState<RightTab>('inspector');
  const [analysisParams, setAnalysisParams] = useState<Partial<AnalysisParams>>(DEFAULT_ANALYSIS_PARAMS);
  const [formula, setFormula] = useState<WaveFormula>(DEFAULT_WAVE_FORMULA);
  const [curve, setCurve] = useState<CurveFormula>(DEFAULT_CURVE_FORMULA);
  const [jsonText, setJsonText] = useState('');
  const [jsonNote, setJsonNote] = useState('');

  const waves = useMemo(() => configsToTimelineWaves(level?.waves ?? []), [level?.waves]);

  const history = useWaveHistory({
    waves: level?.waves ?? [],
    apply: (next) => {
      if (!pickedLevelId) return;
      updateLevel(projectId, pickedLevelId, { waves: next });
    },
    signature: `${projectId}:${pickedLevelId ?? ''}`,
  });

  const enemyAssets = useMemo(
    () =>
      listAssets('enemy').flatMap((asset) =>
        asset.kind === 'enemy'
          ? [{ id: asset.id, name: asset.name, health: asset.data.health, reward: asset.data.reward }]
          : [],
      ),
    [listAssets],
  );
  const towerAssets: RosterAsset[] = useMemo(
    () => listAssets('tower').flatMap((asset) => (asset.kind === 'tower' ? [{ id: asset.id, name: asset.name }] : [])),
    [listAssets],
  );
  const enemyNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const asset of enemyAssets) names[asset.id] = asset.name;
    return names;
  }, [enemyAssets]);

  const lookup = useMemo(() => {
    const official = createEnemyLookup();
    const custom = new Map(enemyAssets.map((asset) => [asset.id, { health: asset.health, reward: asset.reward }]));
    return (type: string) => official(type) ?? custom.get(type);
  }, [enemyAssets]);

  const enemyOptions = useMemo(
    () => [
      ...Object.entries(ENEMY_DATA).flatMap(([id, data]) =>
        data ? [{ id, name: data.name, health: data.health }] : [],
      ),
      ...enemyAssets.map((asset) => ({ id: asset.id, name: asset.name, health: asset.health })),
    ],
    [enemyAssets],
  );

  const analysis = useMemo(() => analyzeWaves(waves, lookup, analysisParams), [waves, lookup, analysisParams]);
  const snapshot = useMemo(() => snapshotAt(waves, lookup, playheadMs, analysisParams), [waves, lookup, playheadMs, analysisParams]);
  const issues = useMemo(() => validateTimeline(waves, lookup), [waves, lookup]);

  const references = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const wave of waves) {
      for (const row of wave.rows) counts[row.type] = (counts[row.type] ?? 0) + row.blocks.length;
    }
    return counts;
  }, [waves]);

  const commitWaves = (next: TimelineWave[]) => {
    history.commit(timelineWavesToConfigs(next));
  };

  const defaultType = Object.keys(ENEMY_DATA)[0] ?? 'normal';
  const activeWaveIndex = selectedWaves[0] ?? null;
  const activeWave = activeWaveIndex !== null ? waves[activeWaveIndex] ?? null : null;
  const activeBar: WaveBar | null = activeWaveIndex !== null ? analysis.bars[activeWaveIndex] ?? null : null;
  const activeSegment = activeWave && selectedSegments[0]
    ? flattenWave(activeWave).find((block) => block.id === selectedSegments[0].blockId) ?? null
    : null;

  const selectWaves = (indices: number[]) => {
    setSelectedWaves(indices);
    setSelectedSegments([]);
    setRightTab('inspector');
  };

  const selectSegments = (segments: SegmentRef[]) => {
    setSelectedSegments(segments);
    if (segments.length > 0) setSelectedWaves([segments[0].waveIndex]);
  };

  const issueText = (code: string, waveIndex: number, type: string | null): string => {
    const n = String(waveIndex + 1);
    switch (code) {
      case 'emptyWave':
        return fillTemplate(c.issueEmptyWave, { n });
      case 'zeroCount':
        return fillTemplate(c.issueZeroCount, { n });
      case 'negativeDelay':
        return fillTemplate(c.issueNegativeDelay, { n });
      case 'negativeReward':
        return fillTemplate(c.issueNegativeReward, { n });
      case 'overlap':
        return fillTemplate(c.issueOverlap, { n });
      case 'unknownEnemy':
        return fillTemplate(c.issueUnknownEnemy, { n, type: type ?? '' });
      default:
        return '';
    }
  };

  if (!project) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <Empty title={s.dashboard.noProjects} hint={c.noLevelsHint} />
      </div>
    );
  }

  if (levels.length === 0 || !pickedLevelId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <SegHead label={c.title} />
        <Empty title={c.noLevels} hint={c.noLevelsHint} />
      </div>
    );
  }

  const batch = (patch: WaveBatchPatch) => {
    let next = waves;
    if (patch.rewardAdd !== undefined || patch.hpScaleMul !== undefined || patch.intervalMs !== undefined) {
      next = batchPatchWaves(next, selectedWaves, {
        rewardAdd: patch.rewardAdd,
        hpScaleMul: patch.hpScaleMul,
        intervalMs: patch.intervalMs,
      });
    }
    if (patch.countMul !== undefined && patch.countMul !== 1) {
      next = batchMultiplyCount(next, selectedWaves, patch.countMul);
    }
    commitWaves(next);
  };

  const waveAction = (index: number, action: 'insert' | 'duplicate' | 'delete') => {
    if (action === 'insert') {
      commitWaves(insertWave(waves, index + 1, { enemies: [{ type: defaultType, count: 5, delay: 0 }], reward: 50 }));
      return;
    }
    if (action === 'duplicate') {
      commitWaves(duplicateWaves(waves, [index], 1));
      return;
    }
    commitWaves(removeWaves(waves, [index]));
    selectWaves([]);
  };

  const importJson = () => {
    try {
      const parsed: unknown = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setJsonNote(w.jsonError);
        return;
      }
      const configs: WaveConfig[] = [];
      for (const item of parsed) {
        if (!item || typeof item !== 'object') continue;
        const record = item as Record<string, unknown>;
        const enemies = Array.isArray(record.enemies) ? record.enemies : [];
        const groups: WaveConfig['enemies'] = [];
        for (const group of enemies) {
          if (!group || typeof group !== 'object') continue;
          const entry = group as Record<string, unknown>;
          if (typeof entry.type !== 'string') continue;
          groups.push({
            type: entry.type,
            count: Math.max(0, Math.round(Number(entry.count) || 0)),
            delay: Math.max(0, Math.round(Number(entry.delay) || 0)),
          });
        }
        const wave: WaveConfig = { enemies: groups, reward: Math.max(0, Math.round(Number(record.reward) || 0)) };
        if (typeof record.hpScale === 'number' && record.hpScale > 0) wave.hpScale = record.hpScale;
        if (typeof record.intervalMs === 'number' && record.intervalMs > 0) wave.intervalMs = record.intervalMs;
        if (record.enabled === false) wave.enabled = false;
        if (typeof record.chapter === 'string' && record.chapter) wave.chapter = record.chapter;
        if (typeof record.name === 'string' && record.name) wave.name = record.name;
        configs.push(wave);
      }
      history.commit(configs);
      setJsonNote('');
      setJsonText('');
    } catch {
      setJsonNote(w.jsonError);
    }
  };

  const exportJson = () => {
    const payload = JSON.stringify(level?.waves ?? [], null, 2);
    setJsonText(payload);
    void navigator.clipboard?.writeText(payload).then(
      () => setJsonNote(w.jsonCopied),
      () => setJsonNote(''),
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
      <SegHead
        label={c.title}
        right={
          <div className="flex shrink-0 items-center gap-1">
            <IconBtn label={w.undo} className="h-7 w-7" onClick={history.undo} disabled={!history.canUndo}>
              <UndoIcon className="h-4 w-4" />
            </IconBtn>
            <IconBtn label={w.redo} className="h-7 w-7" onClick={history.redo} disabled={!history.canRedo}>
              <RedoIcon className="h-4 w-4" />
            </IconBtn>
            <Btn size="sm" variant="ghost" onClick={exportJson}>
              {w.jsonExport}
            </Btn>
          </div>
        }
      />

      {/* 關卡切換自己一列：塞在 SegHead 右側時，窄版會換行並壓到標題列 */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="arc-label shrink-0">{s.levels.title}</span>
        {levels.map((item) => (
          <Btn
            key={item.id}
            size="sm"
            variant={item.id === pickedLevelId ? 'signal' : 'line'}
            onClick={() => {
              setLevelId(item.id);
              setSelectedWaves([]);
              setSelectedSegments([]);
              setPlayheadMs(0);
            }}
          >
            {item.name}
          </Btn>
        ))}
        <Num value={fillTemplate(c.waveCount, { count: String(waves.length) })} size="sm" tone="muted" />
      </div>

      <WaveFormulaPanel
        formula={formula}
        curve={curve}
        enemyOptions={enemyOptions}
        onFormula={(patch) => setFormula((prev) => ({ ...prev, ...patch }))}
        onCurve={(patch) => setCurve((prev) => ({ ...prev, ...patch }))}
        onGenerate={(configs, mode) => {
          const next = configsToTimelineWaves(configs);
          commitWaves(mode === 'append' ? [...waves, ...next] : next);
          setSelectedWaves([]);
          setSelectedSegments([]);
        }}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 xl:grid-cols-[290px_minmax(0,1fr)_380px]">
        <WaveListPanel
          waves={waves}
          rows={analysis.bars}
          selected={selectedWaves}
          onSelect={selectWaves}
          onAddWave={() => {
            commitWaves(insertWave(waves, waves.length, { enemies: [{ type: defaultType, count: 5, delay: 0 }], reward: 50 }));
            selectWaves([waves.length]);
          }}
          onDuplicate={(times) => commitWaves(duplicateWaves(waves, selectedWaves, times))}
          onDelete={() => {
            commitWaves(removeWaves(waves, selectedWaves));
            selectWaves([]);
          }}
          onReorder={(from, to) => commitWaves(reorderWaves(waves, from, to))}
          onToggleEnabled={(index) =>
            commitWaves(patchWave(waves, index, { enabled: waves[index]?.enabled === false }))
          }
          onBatch={batch}
          onSetChapter={(indices, chapter) => commitWaves(batchPatchWaves(waves, indices, { chapter }))}
          className="min-h-[420px] xl:min-h-0"
        />

        <Deck className="flex min-h-0 flex-col gap-1.5 overflow-hidden p-2.5">
          <WaveTrack
            className="min-h-0 flex-1"
            waves={waves}
            enemyNames={enemyNames}
            selected={selectedSegments}
            playheadMs={playheadMs}
            snapshot={snapshot}
            onSelect={selectSegments}
            onSelectWave={(index) => selectWaves([index])}
            onShift={(waveIndex, blockId, deltaMs) => commitWaves(shiftSegment(waves, waveIndex, blockId, deltaMs))}
            onResize={(waveIndex, blockId, count) => commitWaves(resizeSegment(waves, waveIndex, blockId, count))}
            onReorder={(waveIndex, blockId, toIndex) => commitWaves(reorderSegments(waves, waveIndex, blockId, toIndex))}
            onDeleteSegment={(waveIndex, blockId) => commitWaves(removeSegment(waves, waveIndex, blockId))}
            onDuplicateSegment={(waveIndex, blockId) => {
              const wave = waves[waveIndex];
              const block = wave ? flattenWave(wave).find((item) => item.id === blockId) : null;
              if (!block) return;
              commitWaves(insertSegment(waves, waveIndex, block.type, block.count));
            }}
            onMoveSegmentToWave={(waveIndex, blockId, toWave) =>
              commitWaves(moveSegmentToWave(waves, waveIndex, blockId, toWave, Number.MAX_SAFE_INTEGER))
            }
            onWaveAction={waveAction}
            onSeek={setPlayheadMs}
          />

          <div className="shrink-0 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-2 py-1">
            <div className="flex items-center gap-1.5">
              <WarningIcon className="h-3.5 w-3.5 text-[var(--cn-caution-text)]" />
              <span className="arc-label">{w.issues}</span>
              <Num value={String(issues.length)} size="sm" tone={issues.length > 0 ? 'caution' : 'muted'} />
              {issues.length === 0 && <span className="arc-label text-[var(--cn-vital-text)]">{s.rules.valid}</span>}
              <span className="ml-auto font-mono text-[9.5px] text-[var(--cn-ink-3)]">
                {fillTemplate(w.statusSegments, { n: String(countSegments(waves)) })}
              </span>
            </div>
            {issues.length > 0 && (
              <ul className="mt-0.5 flex max-h-20 flex-col gap-0.5 overflow-y-auto">
                {issues.map((issue, index) => (
                  <li key={`${issue.code}-${issue.waveIndex}-${index}`}>
                    <button
                      type="button"
                      onClick={() => selectWaves([issue.waveIndex])}
                      className="w-full text-left font-mono text-[10px] text-[var(--cn-caution-text)] hover:underline"
                    >
                      {issueText(issue.code, issue.waveIndex, issue.type)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Input
              value={jsonText}
              placeholder={w.jsonPlaceholder}
              onChange={(event) => setJsonText(event.target.value)}
              className="h-7 flex-1 px-1.5 font-mono text-[10px]"
              aria-label={w.jsonPlaceholder}
            />
            <Btn size="sm" variant="line" onClick={importJson}>
              {w.jsonImport}
            </Btn>
            {jsonNote && <span className="arc-label text-[var(--cn-vital-text)]">{jsonNote}</span>}
          </div>
        </Deck>

        <div className="flex min-h-0 flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <Chip active={rightTab === 'inspector'} onClick={() => setRightTab('inspector')} className="px-2 py-0.5 text-[10px]">
              {w.tabInspector}
            </Chip>
            <Chip active={rightTab === 'analysis'} onClick={() => setRightTab('analysis')} className="px-2 py-0.5 text-[10px]">
              {w.tabAnalysis}
            </Chip>
            <Chip active={rightTab === 'roster'} onClick={() => setRightTab('roster')} className="px-2 py-0.5 text-[10px]">
              {w.tabRoster}
            </Chip>
          </div>

          {rightTab === 'inspector' && (
            <WaveInspector
              wave={activeWave}
              waveIndex={activeWaveIndex}
              segment={activeSegment}
              bar={activeBar}
              lookup={lookup}
              enemyNames={enemyNames}
              onSelectSegment={(blockId) => {
                if (activeWaveIndex === null) return;
                setSelectedSegments([{ waveIndex: activeWaveIndex, blockId }]);
              }}
              onPatchWave={(patch: WaveFieldPatch) => {
                if (activeWaveIndex === null) return;
                commitWaves(patchWave(waves, activeWaveIndex, patch));
              }}
              onSegmentCount={(blockId, count) => {
                if (activeWaveIndex === null) return;
                commitWaves(resizeSegment(waves, activeWaveIndex, blockId, count));
              }}
              onSegmentGap={(blockId, delayMs) => {
                if (activeWaveIndex === null) return;
                const wave = waves[activeWaveIndex];
                if (!wave) return;
                commitWaves(waves.map((item, index) => (index === activeWaveIndex ? setDelay(wave, blockId, delayMs) : item)));
              }}
              onSegmentShift={(blockId, startMs) => {
                if (activeWaveIndex === null) return;
                const wave = waves[activeWaveIndex];
                if (!wave) return;
                commitWaves(waves.map((item, index) => (index === activeWaveIndex ? moveBlock(wave, blockId, startMs) : item)));
              }}
              onRemoveSegment={(blockId) => {
                if (activeWaveIndex === null) return;
                commitWaves(removeSegment(waves, activeWaveIndex, blockId));
                setSelectedSegments([]);
              }}
              onAddSegment={() => {
                if (activeWaveIndex === null) return;
                commitWaves(insertSegment(waves, activeWaveIndex, defaultType, 5));
              }}
              onDeleteWave={() => {
                if (activeWaveIndex === null) return;
                commitWaves(removeWaves(waves, [activeWaveIndex]));
                selectWaves([]);
              }}
              onMoveSegmentToWave={(toWave) => {
                if (activeWaveIndex === null || !activeSegment) return;
                commitWaves(moveSegmentToWave(waves, activeWaveIndex, activeSegment.id, toWave, Number.MAX_SAFE_INTEGER));
                setSelectedSegments([]);
              }}
              className="min-h-0 flex-1"
            />
          )}

          {rightTab === 'analysis' && (
            <WaveAnalysisPanel
              analysis={analysis}
              selectedWave={activeWaveIndex}
              onParams={(patch) => setAnalysisParams((prev) => ({ ...prev, ...patch }))}
              onSelectWave={(index) => selectWaves([index])}
              className="min-h-0 flex-1"
            />
          )}

          {rightTab === 'roster' && (
            <Deck className="flex min-h-0 flex-col gap-2 p-3">
              <RosterPanel
                enemyAssets={enemyAssets}
                towerAssets={towerAssets}
                references={references}
                onAddEnemy={(type) => {
                  const target = activeWaveIndex ?? waves.length - 1;
                  if (target < 0) {
                    commitWaves([waveConfigToTimeline({ enemies: [{ type, count: 1, delay: 0 }], reward: 50 }, 0)]);
                    selectWaves([0]);
                    return;
                  }
                  commitWaves(insertSegment(waves, target, type, 1));
                  selectWaves([target]);
                }}
                onRemoveEnemy={(type) => {
                  let next = waves;
                  waves.forEach((wave, index) => {
                    const blocks = wave.rows.filter((row) => row.type === type).flatMap((row) => row.blocks);
                    for (const block of blocks) next = removeSegment(next, index, block.id);
                  });
                  commitWaves(next);
                }}
              />
            </Deck>
          )}
        </div>
      </div>
    </div>
  );
}
