/**
 * 關卡設定 — 勝負條件、初始資源、塔白名單、規則集
 *
 * 這些欄位編譯器（compileProject）已經全部吃得下，這裡只是把它們接上 UI。
 */
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { useWorkshopStore } from '@/store/workshopStore';
import type { AssetRef, WorkshopLevel, WorkshopScoreRule } from '@/types/workshop';
import { Btn, Deck, Empty, Input, SegHead, Toggle } from '@/components/hl';
import { useWorkshopProgressStore } from '@/store/workshopProgressStore';

interface LevelSettingsPanelProps {
  projectId: string;
  levelId: string;
}

function NumRow({ label, value, onChange, step = 1 }: { label: string; value: number | undefined; onChange: (next: number | undefined) => void; step?: number }) {
  return (
    <label className="flex items-center justify-between gap-2 border-b border-[var(--cn-line-soft)] py-1">
      <span className="text-[11.5px] text-[var(--cn-ink-2)]">{label}</span>
      <Input
        type="number"
        step={step}
        value={value ?? ''}
        placeholder="—"
        onChange={(event) => {
          const raw = event.target.value;
          if (raw.trim() === '') {
            onChange(undefined);
            return;
          }
          const parsed = Number(raw);
          onChange(Number.isFinite(parsed) ? parsed : undefined);
        }}
        className="h-7 w-24 px-1.5 text-right font-mono text-[11px]"
      />
    </label>
  );
}

export function LevelSettingsPanel({ projectId, levelId }: LevelSettingsPanelProps) {
  const { t } = useTranslation();
  const s = t.studio.levels.settings;
  const level = useWorkshopStore((state) => state.getLevel(projectId, levelId));
  const updateLevel = useWorkshopStore((state) => state.updateLevel);
  const listAssets = useWorkshopStore((state) => state.listAssets);
  const project = useWorkshopStore((state) => state.getProject(projectId));
  const completedIds = useWorkshopProgressStore((state) => state.completed[projectId] ?? []);
  const markCompleted = useWorkshopProgressStore((state) => state.markCompleted);
  const unmarkCompleted = useWorkshopProgressStore((state) => state.unmarkCompleted);
  const resetProject = useWorkshopProgressStore((state) => state.resetProject);
  const towerAssets = listAssets('tower');
  const ruleSetAssets = listAssets('ruleSet');

  if (!level) return <Empty title={s.noLevel} />;

  const patch = (next: Partial<WorkshopLevel>): void => updateLevel(projectId, levelId, next);
  const win = level.winConditions;
  const patchWin = (next: Partial<typeof win>): void => patch({ winConditions: { ...win, ...next } });
  const resources = level.startingResources ?? {};
  const towerRefs = level.towerRefs ?? [];
  const patchResources = (next: Partial<typeof resources>): void => patch({ startingResources: { ...resources, ...next } });

  const toggleTower = (assetId: string): void => {
    const exists = towerRefs.some((ref) => ref.assetId === assetId);
    const next: AssetRef[] = exists
      ? towerRefs.filter((ref) => ref.assetId !== assetId)
      : [...towerRefs, { assetId, version: towerAssets.find((asset) => asset.id === assetId)?.version ?? '1.0.0' }];
    patch({ towerRefs: next });
  };

  const scoreRules: WorkshopScoreRule[] = win.scoreRules ?? [];
  const setScoreRules = (next: WorkshopScoreRule[]): void => patchWin({ scoreRules: next.length > 0 ? next : undefined });

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-3">
      <SegHead label={s.title} />
      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-2 flex flex-col gap-1">
          <span className="arc-label">{s.name}</span>
          <Input value={level.name} onChange={(event) => patch({ name: event.target.value })} className="h-7 w-full px-1.5 text-[11.5px]" />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span className="arc-label">{s.description}</span>
          <Input value={level.description ?? ''} onChange={(event) => patch({ description: event.target.value })} className="h-7 w-full px-1.5 text-[11.5px]" />
        </label>
      </div>

      <SegHead label={s.unlockAfter} />
      <select
        value={level.requiresLevelId ?? ''}
        onChange={(event) => patch({ requiresLevelId: event.target.value || null })}
        className="h-7 w-full border border-[var(--cn-line)] bg-[var(--cn-card)] px-1.5 font-mono text-[11.5px] text-[var(--cn-ink)]"
      >
        <option value="">{s.noneUnlock}</option>
        {(project?.levels ?? [])
          .filter((item) => item.id !== level.id)
          .map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
      </select>

      <SegHead label={s.winConditions} />
      <div className="flex flex-col">
        <NumRow label={s.surviveWaves} value={win.surviveWaves} onChange={(value) => patchWin({ surviveWaves: value })} />
        <NumRow label={s.surviveSeconds} value={win.surviveSeconds} onChange={(value) => patchWin({ surviveSeconds: value })} />
        <NumRow label={s.baseHealth} value={win.baseHealth} onChange={(value) => patchWin({ baseHealth: value })} />
        <NumRow label={s.initialMoney} value={win.initialMoney} onChange={(value) => patchWin({ initialMoney: value })} />
        <NumRow label={s.waveInterval} value={win.waveIntervalSeconds} step={0.5} onChange={(value) => patchWin({ waveIntervalSeconds: value })} />
        <NumRow label={s.maxLeaks} value={win.maxLeaks} onChange={(value) => patchWin({ maxLeaks: value })} />
        <NumRow label={s.timeLimit} value={win.timeLimitSeconds} onChange={(value) => patchWin({ timeLimitSeconds: value })} />
        <div className="flex items-center justify-between py-1">
          <span className="text-[11.5px] text-[var(--cn-ink-2)]">{s.bossKill}</span>
          <Toggle on={win.bossKillRequired === true} onChange={(on) => patchWin({ bossKillRequired: on || undefined })} />
        </div>
      </div>

      <SegHead label={s.scoreRules} right={<Btn size="sm" variant="line" onClick={() => setScoreRules([...scoreRules, { id: 'score_' + Date.now(), label: s.newRule, weight: 1 }])}>{s.addRule}</Btn>} />
      {scoreRules.length === 0 ? (
        <p className="font-mono text-[10.5px] text-[var(--cn-ink-3)]">{s.noScoreRules}</p>
      ) : (
        <div className="flex flex-col gap-1">
          {scoreRules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-1.5">
              <Input
                value={rule.label}
                onChange={(event) => setScoreRules(scoreRules.map((item) => (item.id === rule.id ? { ...item, label: event.target.value } : item)))}
                className="h-7 min-w-0 flex-1 px-1.5 text-[11px]"
              />
              <Input
                type="number"
                value={rule.weight}
                onChange={(event) => setScoreRules(scoreRules.map((item) => (item.id === rule.id ? { ...item, weight: Number(event.target.value) || 0 } : item)))}
                className="h-7 w-16 px-1.5 text-right font-mono text-[11px]"
              />
              <Btn size="sm" variant="ghost" onClick={() => setScoreRules(scoreRules.filter((item) => item.id !== rule.id))}>{s.remove}</Btn>
            </div>
          ))}
        </div>
      )}

      <SegHead label={s.startingResources} />
      <div className="flex flex-col">
        <NumRow label={s.money} value={resources.money} onChange={(value) => patchResources({ money: value })} />
        <NumRow label={s.health} value={resources.health} onChange={(value) => patchResources({ health: value })} />
        <NumRow label={s.waveDelayMult} value={resources.waveDelayMult} step={0.1} onChange={(value) => patchResources({ waveDelayMult: value })} />
      </div>

      <SegHead label={s.ruleSetRef} />
      <select
        value={level.ruleSetRef?.assetId ?? ''}
        onChange={(event) => {
          const assetId = event.target.value;
          if (!assetId) {
            patch({ ruleSetRef: null });
            return;
          }
          const asset = ruleSetAssets.find((item) => item.id === assetId);
          patch({ ruleSetRef: { assetId, version: asset?.version ?? '1.0.0' } });
        }}
        className="h-7 w-full border border-[var(--cn-line)] bg-[var(--cn-card)] px-1.5 font-mono text-[11.5px] text-[var(--cn-ink)]"
      >
        <option value="">{s.none}</option>
        {ruleSetAssets.map((asset) => (
          <option key={asset.id} value={asset.id}>{asset.name}</option>
        ))}
      </select>

      <SegHead label={s.towerRefs} />
      {towerAssets.length === 0 ? (
        <p className="font-mono text-[10.5px] text-[var(--cn-ink-3)]">{s.noTowerAssets}</p>
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {towerAssets.map((asset) => {
            const active = towerRefs.some((ref) => ref.assetId === asset.id);
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => toggleTower(asset.id)}
                className={`border px-1.5 py-1 text-left text-[11px] ${active ? 'border-[var(--cn-signal-text)] text-[var(--cn-signal-text)]' : 'border-[var(--cn-line)] text-[var(--cn-ink-3)]'}`}
              >
                {asset.name}
              </button>
            );
          })}
        </div>
      )}

      <Deck tone="sunken" className="p-2 font-mono text-[10px] text-[var(--cn-ink-3)]">
        {fillTemplate(s.hint, { count: String(towerRefs.length) })}
      </Deck>

      <SegHead label={s.progressTitle} />
      <div className="flex flex-wrap items-center gap-2">
        <Btn
          size="sm"
          variant={completedIds.includes(level.id) ? 'signal' : 'line'}
          onClick={() => {
            if (completedIds.includes(level.id)) unmarkCompleted(projectId, level.id);
            else markCompleted(projectId, level.id);
          }}
        >
          {completedIds.includes(level.id) ? s.unmarkDone : s.markDone}
        </Btn>
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => {
            if (window.confirm(s.resetConfirm)) resetProject(projectId);
          }}
        >
          {s.resetProgress}
        </Btn>
        <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
          {fillTemplate(s.progressCount, { done: String(completedIds.length), total: String(project?.levels.length ?? 0) })}
        </span>
      </div>
    </div>
  );
}
