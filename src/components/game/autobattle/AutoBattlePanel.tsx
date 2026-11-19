import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { AUTO_BATTLE_PRESETS } from '@/data/autobattle/presets';
import { PATHS, TOWER_DATA } from '@/data/gameData';
import { collectPathPoints, gridSizeOf } from '@/data/autobattle/mapInfo';
import type { AutoBattleDecision, AutoBattleMode } from '@/types/autobattle';
import { AutoBattleInspect } from './AutoBattleInspect';
import { formatNarration } from './formatNarration';

type Tab = 'live' | 'timeline' | 'curve' | 'rules' | 'report';

const MODES: AutoBattleMode[] = ['coach', 'assist', 'zones', 'phases', 'full'];

const VerdictBadge = ({ verdict }: { verdict: AutoBattleDecision['verdict'] }) => {
  const { t } = useTranslation();
  const tone =
    verdict === 'executed'
      ? 'bg-[var(--hl-accent)] text-[var(--hl-accent-ink)]'
      : verdict === 'suggested'
        ? 'bg-[var(--hl-line)] text-[var(--hl-ink)]'
        : verdict === 'hold'
          ? 'bg-[var(--hl-surface-2)] text-[var(--hl-ink-2)]'
          : 'bg-[var(--hl-danger)] text-white';
  return (
    <span className={`rounded-[var(--hl-r-xs)] px-1.5 py-0.5 text-[10px] font-bold ${tone}`}>
      {t.content.autoBattle.verdict[verdict]}
    </span>
  );
};

/** 戰區縮略圖：路徑、塔位、敵人與選中候選的射程圈（疊加層的平面版本） */
const BattlefieldMiniMap = ({ decision }: { decision: AutoBattleDecision | undefined }) => {
  const towers = useGameStore((s) => s.towers);
  const enemies = useGameStore((s) => s.enemies);
  const pathId = useGameStore((s) => s.selectedPath);
  const pathConfig = PATHS[pathId];
  const points = collectPathPoints(pathConfig);
  const { cols, rows } = gridSizeOf(pathConfig);
  const chosen = decision?.chosen;
  // 射程圈要顯示「這個塔種的實際射程」，不是固定值
  const range = chosen?.towerType ? (TOWER_DATA[chosen.towerType]?.range ?? 0) : 0;
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} className="h-24 w-full rounded border border-[var(--hl-line)] bg-[var(--hl-surface-2)]">
      {points.map((p, i) => (
        <circle key={`p${i}`} cx={p.col + 0.5} cy={p.row + 0.5} r={0.16} fill="var(--hl-ink-4)" />
      ))}
      {chosen?.col != null && chosen.row != null && (
        <circle cx={chosen.col + 0.5} cy={chosen.row + 0.5} r={range} fill="var(--hl-accent)" fillOpacity={0.14} stroke="var(--hl-accent)" strokeWidth={0.08} />
      )}
      {towers.map((tw) => (
        <rect key={tw.id} x={tw.pos.x + 0.2} y={tw.pos.y + 0.2} width={0.6} height={0.6} fill="var(--hl-ink-2)" />
      ))}
      {enemies.map((e) => (
        <circle key={e.id} cx={e.x + 0.5} cy={e.y + 0.5} r={0.24} fill="var(--hl-danger)" />
      ))}
    </svg>
  );
};

const LiveView = ({ decision }: { decision: AutoBattleDecision | undefined }) => {
  const { t } = useTranslation();
  const acceptSuggestion = useGameStore((s) => s.acceptAutoBattleSuggestion);
  if (!decision) {
    return <p className="p-3 text-xs text-[var(--hl-ink-3)]">{t.content.autoBattle.empty.noDecision}</p>;
  }
  const narration = formatNarration(t.content.autoBattle.narration[
    decision.narrationKey.split('.').pop() as keyof typeof t.content.autoBattle.narration
  ] ?? '', decision.narrationParams);
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <VerdictBadge verdict={decision.verdict} />
        <span className="font-mono text-[10px] text-[var(--hl-ink-3)]">
          W{decision.snapshot.wave} · ${decision.snapshot.money} · HP {decision.snapshot.health}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-[var(--hl-ink)]">{narration}</p>
      <BattlefieldMiniMap decision={decision} />
      {decision.verdict === 'suggested' && (
        <button
          type="button"
          onClick={() => acceptSuggestion()}
          className="self-start rounded-[var(--hl-r-xs)] border border-[var(--hl-line)] bg-[var(--hl-accent)] px-2 py-1 text-[11px] font-bold text-[var(--hl-accent-ink)]"
        >
          {t.content.autoBattle.accept}
        </button>
      )}
      <ul className="flex flex-col gap-1">
        {decision.candidates.map((c) => {
          const pct = Math.round(c.total * 100);
          const chosen = decision.chosen?.id === c.id;
          return (
            <li
              key={c.id}
              className={`rounded-[var(--hl-r-xs)] border px-2 py-1 ${chosen ? 'border-[var(--hl-accent)] bg-[var(--hl-surface-2)]' : 'border-[var(--hl-line)]'}`}
            >
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="font-semibold text-[var(--hl-ink)]">
                  {t.content.autoBattle.action[c.kind]} · {c.towerType ?? ''}
                </span>
                <span className="font-mono tabular-nums text-[var(--hl-ink-2)]">{pct}</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded bg-[var(--hl-line)]">
                <div className="h-full bg-[var(--hl-accent)]" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              {c.vetoedBy.length > 0 && (
                <p className="mt-1 text-[10px] text-[var(--hl-danger)]">
                  {c.vetoedBy.map((v) => t.content.autoBattle.vetoBy.replace('{rule}', v.reason)).join(' / ')}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Impl = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('live');
  const open = useGameStore((s) => s.autoBattlePanelOpen);
  const setOpen = useGameStore((s) => s.setAutoBattlePanelOpen);
  const enabled = useGameStore((s) => s.autoBattleEnabled);
  const mode = useGameStore((s) => s.autoBattleMode);
  const setMode = useGameStore((s) => s.setAutoBattleMode);
  const presetId = useGameStore((s) => s.autoBattlePresetId);
  const setPreset = useGameStore((s) => s.setAutoBattlePreset);
  const decisions = useGameStore((s) => s.autoBattleDecisions);
  const curve = useGameStore((s) => s.autoBattleCurve);
  const stats = useGameStore((s) => s.autoBattleStats);
  const rules = useGameStore((s) => s.autoBattleRules);
  const locked = useGameStore((s) => s.autoBattleLockedTargets);
  const clearLocks = useGameStore((s) => s.clearAutoBattleLocks);
  const dryRun = useGameStore((s) => s.autoBattleDryRun);
  const setDryRun = useGameStore((s) => s.setAutoBattleDryRun);
  const overlay = useGameStore((s) => s.autoBattleShowOverlay);
  const setOverlay = useGameStore((s) => s.setAutoBattleOverlay);
  const aiUntilWave = useGameStore((s) => s.autoBattleAiUntilWave);
  const setAiUntilWave = useGameStore((s) => s.setAutoBattleAiUntilWave);

  if (!open) return null;
  const c = t.content.autoBattle;

  return (
    <div className="pointer-events-auto fixed inset-y-0 right-0 z-30 flex w-[380px] flex-col border-l-[3px] border-[var(--hl-line)] bg-[var(--hl-surface)] text-[var(--hl-ink)] shadow-[-4px_0_0_var(--hl-line)]">
      <header className="flex items-start justify-between gap-2 border-b border-[var(--hl-line)] p-3">
        <div>
          <h2 className="text-sm font-bold">{c.title}</h2>
          <p className="mt-0.5 text-[10px] leading-snug text-[var(--hl-ink-3)]">{c.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-[var(--hl-r-xs)] border border-[var(--hl-line)] px-2 py-1 text-[11px]"
        >
          {c.close}
        </button>
      </header>

      <div className="flex flex-wrap gap-1 border-b border-[var(--hl-line)] p-2">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            title={c.mode[`hint${m[0].toUpperCase()}${m.slice(1)}` as keyof typeof c.mode] ?? ''}
            className={`rounded-[var(--hl-r-xs)] border px-2 py-1 text-[11px] ${mode === m ? 'border-[var(--hl-accent)] bg-[var(--hl-accent)] text-[var(--hl-accent-ink)]' : 'border-[var(--hl-line)]'}`}
          >
            {c.mode[m]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--hl-line)] px-2 py-1.5">
        <label className="text-[10px] text-[var(--hl-ink-3)]" htmlFor="ab-preset">
          {c.presetLabel}
        </label>
        <select
          id="ab-preset"
          value={presetId}
          onChange={(e) => setPreset(e.target.value)}
          className="flex-1 rounded-[var(--hl-r-xs)] border border-[var(--hl-line)] bg-transparent px-1 py-1 text-[11px]"
        >
          {AUTO_BATTLE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {t.content.autoBattle.presetLabel} · {p.id}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--hl-line)] px-2 py-1.5 text-[10px]">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} />
          {c.overlay}
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
          {c.dryRun}
        </label>
        {mode === 'phases' && (
          <span className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={30}
              value={aiUntilWave}
              onChange={(e) => setAiUntilWave(Number(e.target.value))}
              className="w-12 rounded border border-[var(--hl-line)] bg-transparent px-1"
            />
            {c.aiUntilWave.replace('{wave}', '')}
          </span>
        )}
        {locked.length > 0 && (
          <button type="button" onClick={clearLocks} className="underline">
            {c.lockedCount.replace('{count}', String(locked.length))}
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-[var(--hl-line)] px-2 py-1.5">
        {(Object.keys(c.tabs) as Tab[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-[var(--hl-r-xs)] px-2 py-1 text-[11px] ${tab === k ? 'bg-[var(--hl-line)] font-bold' : 'text-[var(--hl-ink-3)]'}`}
          >
            {c.tabs[k]}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'live' && <LiveView decision={decisions[0]} />}
        {tab !== 'live' && (
          <AutoBattleInspect
            tab={tab}
            decisions={decisions}
            curve={curve}
            stats={stats}
            rules={rules}
            enabled={enabled}
          />
        )}
      </div>
    </div>
  );
};

export const AutoBattlePanel = Impl;
