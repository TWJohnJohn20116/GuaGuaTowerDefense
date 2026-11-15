/**
 * 內容頁 · 關卡內容編輯
 *
 * 一頁三塊：左邊是整場的波次時間軸（含累積 HP／獎勵曲線），右上是一波的細節，
 * 右下是可引用的塔／敵人陣容。所有寫入都走 workshopStore 的 updateLevel，
 * 這一頁不自己保存波次（世界資料只有 store 一份）。
 */
import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { useWorkshopStore } from '@/store/workshopStore';
import { Btn, Deck, Empty, Num, SegHead } from '@/components/hl';
import { WarningIcon } from '@/components/ui/Icons';
import { ENEMY_DATA } from '@/data/gameData';
import { RosterPanel, type RosterAsset } from '@/components/workshop/content/RosterPanel';
import { WaveInspector } from '@/components/workshop/content/WaveInspector';
import { WaveTimeline } from '@/components/workshop/content/WaveTimeline';
import {
  appendBlock,
  buildCurve,
  configsToTimelineWaves,
  createEnemyLookup,
  moveBlock,
  removeBlock,
  resizeBlock,
  setDelay,
  timelineWavesToConfigs,
  validateTimeline,
  waveConfigToTimeline,
  type TimelineIssue,
  type TimelineWave,
} from '@/workshop/content/timeline';

export interface ContentPageProps {
  projectId: string;
}

export function ContentPage({ projectId }: ContentPageProps) {
  const { t } = useTranslation();
  const c = t.studio.content;
  const s = t.studio;

  const project = useWorkshopStore((state) => state.getProject(projectId)) ?? null;
  const getLevel = useWorkshopStore((state) => state.getLevel);
  const updateLevel = useWorkshopStore((state) => state.updateLevel);
  const listAssets = useWorkshopStore((state) => state.listAssets);

  const levels = project?.levels ?? [];

  const [levelId, setLevelId] = useState<string | null>(null);
  const pickedLevelId =
    levelId && levels.some((item) => item.id === levelId) ? levelId : levels[0]?.id ?? null;

  const [waveIndex, setWaveIndex] = useState<number | null>(null);
  const [blockId, setBlockId] = useState<string | null>(null);

  const level = pickedLevelId ? getLevel(projectId, pickedLevelId) : null;
  const waves = useMemo(() => configsToTimelineWaves(level?.waves ?? []), [level?.waves]);

  /** 專案自訂敵人：只收 enemy 類資產，數值直接吃 WorkshopEnemyData */
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
    () =>
      listAssets('tower').flatMap((asset) => (asset.kind === 'tower' ? [{ id: asset.id, name: asset.name }] : [])),
    [listAssets],
  );
  const enemyNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const asset of enemyAssets) names[asset.id] = asset.name;
    return names;
  }, [enemyAssets]);

  /** 官方數值優先；專案敵人資產補自己的 health／reward；兩邊都沒有＝缺資產 */
  const lookup = useMemo(() => {
    const official = createEnemyLookup();
    const custom = new Map(
      enemyAssets.map((asset) => [asset.id, { health: asset.health, reward: asset.reward }]),
    );
    return (type: string) => official(type) ?? custom.get(type);
  }, [enemyAssets]);

  const curve = useMemo(() => buildCurve(waves, lookup), [waves, lookup]);
  const issues = useMemo(() => validateTimeline(waves, lookup), [waves, lookup]);

  const references = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const wave of waves) {
      for (const row of wave.rows) counts[row.type] = (counts[row.type] ?? 0) + row.blocks.length;
    }
    return counts;
  }, [waves]);

  const commit = (next: TimelineWave[]) => {
    if (!pickedLevelId) return;
    updateLevel(projectId, pickedLevelId, { waves: timelineWavesToConfigs(next) });
  };

  const patchWave = (index: number, patch: (wave: TimelineWave) => TimelineWave) => {
    commit(waves.map((wave, at) => (at === index ? patch(wave) : wave)));
  };

  const selectedWave = waveIndex !== null && waves[waveIndex] ? { ...waves[waveIndex], index: waveIndex } : null;

  const issueText = (issue: TimelineIssue): string => {
    const n = String(issue.waveIndex + 1);
    switch (issue.code) {
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
        return fillTemplate(c.issueUnknownEnemy, { n, type: issue.type ?? '' });
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

  const defaultType = Object.keys(ENEMY_DATA)[0] ?? 'normal';
  const targetWave = waveIndex !== null && waves[waveIndex] ? waveIndex : waves.length - 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <SegHead
        label={c.title}
        right={
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="arc-label">{s.levels.title}</span>
            {levels.map((item) => (
              <Btn
                key={item.id}
                size="sm"
                variant={item.id === pickedLevelId ? 'signal' : 'line'}
                onClick={() => {
                  setLevelId(item.id);
                  setWaveIndex(null);
                  setBlockId(null);
                }}
              >
                {item.name}
              </Btn>
            ))}
            <Num value={fillTemplate(c.waveCount, { count: String(waves.length) })} size="sm" tone="muted" />
          </div>
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Deck className="flex min-h-0 flex-col gap-2 p-3">
          <WaveTimeline
            waves={waves}
            curve={curve}
            selectedWaveIndex={waveIndex}
            selectedBlockId={blockId}
            enemyNames={enemyNames}
            onSelectWave={(index) => {
              setWaveIndex(index);
              setBlockId(null);
            }}
            onSelectBlock={(index, id) => {
              setWaveIndex(index);
              setBlockId(id);
            }}
            onMoveBlock={(index, id, startMs) => patchWave(index, (wave) => moveBlock(wave, id, startMs))}
            onResizeBlock={(index, id, count) => patchWave(index, (wave) => resizeBlock(wave, id, count))}
            onAddWave={() =>
              commit([
                ...waves,
                waveConfigToTimeline({ enemies: [{ type: defaultType, count: 5, delay: 0 }], reward: 50 }, waves.length),
              ])
            }
          />

          <div className="rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] p-2">
            <div className="flex items-center gap-1.5">
              <WarningIcon className="h-3.5 w-3.5 text-[var(--cn-caution-text)]" />
              <span className="arc-label">{c.issueTitle}</span>
              <Num value={String(issues.length)} size="sm" tone={issues.length > 0 ? 'caution' : 'muted'} />
              {issues.length === 0 && <span className="arc-label text-[var(--cn-vital-text)]">{s.rules.valid}</span>}
            </div>
            {issues.length > 0 && (
              <ul className="mt-1 flex max-h-24 flex-col gap-0.5 overflow-y-auto">
                {issues.map((issue, index) => (
                  <li key={`${issue.code}-${issue.waveIndex}-${index}`} className="font-mono text-[10.5px] text-[var(--cn-caution-text)]">
                    {issueText(issue)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Deck>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <WaveInspector
            wave={selectedWave}
            blockId={blockId}
            lookup={lookup}
            enemyNames={enemyNames}
            onSelectBlock={(id) => setBlockId(id)}
            onRewardChange={(reward) => {
              if (waveIndex === null) return;
              patchWave(waveIndex, (wave) => ({ ...wave, reward }));
            }}
            onCountChange={(id, count) => {
              if (waveIndex === null) return;
              patchWave(waveIndex, (wave) => resizeBlock(wave, id, count));
            }}
            onDelayChange={(id, delay) => {
              if (waveIndex === null) return;
              patchWave(waveIndex, (wave) => setDelay(wave, id, delay));
            }}
            onMoveBlock={(id, startMs) => {
              if (waveIndex === null) return;
              patchWave(waveIndex, (wave) => moveBlock(wave, id, startMs));
            }}
            onRemoveBlock={(id) => {
              if (waveIndex === null) return;
              patchWave(waveIndex, (wave) => removeBlock(wave, id));
            }}
            onAddGroup={() => {
              if (waveIndex === null) return;
              patchWave(waveIndex, (wave) => appendBlock(wave, defaultType, 5));
            }}
            onDeleteWave={() => {
              if (waveIndex === null) return;
              commit(waves.filter((_, at) => at !== waveIndex));
              setWaveIndex(null);
              setBlockId(null);
            }}
            className="min-h-[300px]"
          />

          <Deck className="flex min-h-0 flex-col gap-2 p-3">
            <RosterPanel
              enemyAssets={enemyAssets}
              towerAssets={towerAssets}
              references={references}
              onAddEnemy={(type) => {
                if (targetWave < 0) {
                  commit([waveConfigToTimeline({ enemies: [{ type, count: 1, delay: 0 }], reward: 50 }, 0)]);
                  setWaveIndex(0);
                  return;
                }
                patchWave(targetWave, (wave) => appendBlock(wave, type, 1));
                setWaveIndex(targetWave);
              }}
              onRemoveEnemy={(type) =>
                commit(
                  waves.map((wave) =>
                    wave.rows
                      .filter((row) => row.type === type)
                      .reduce((acc, row) => row.blocks.reduce((inner, block) => removeBlock(inner, block.id), acc), wave),
                  ),
                )
              }
            />
          </Deck>
        </div>
      </div>
    </div>
  );
}
