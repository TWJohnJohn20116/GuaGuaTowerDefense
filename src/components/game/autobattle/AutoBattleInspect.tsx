import { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { ALL_FACTORS, BASE_WEIGHTS, FACTOR_LABEL_KEYS } from '@/data/autobattle/scoreWeights';
import { qualityOf } from '@/store/autobattle/metrics';
import type {
  AutoBattleActionKind,
  AutoBattleCurvePoint,
  AutoBattleDecision,
  AutoBattleRule,
} from '@/types/autobattle';
import { formatNarration } from './formatNarration';

type Tab = 'live' | 'timeline' | 'curve' | 'rules' | 'report';

interface Props {
  tab: Exclude<Tab, 'live'>;
  decisions: AutoBattleDecision[];
  curve: AutoBattleCurvePoint[];
  stats: { decisions: number; executed: number; placed: number; upgraded: number; sold: number; skipped: number };
  rules: AutoBattleRule[];
  enabled: boolean;
}

const Timeline = ({ decisions }: { decisions: AutoBattleDecision[] }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);
  if (decisions.length === 0) {
    return <p className="p-3 text-xs text-[var(--hl-ink-3)]">{t.content.autoBattle.empty.noDecision}</p>;
  }
  return (
    <ul className="flex flex-col">
      {decisions.slice(0, 60).map((d) => {
        const key = d.narrationKey.split('.').pop() ?? '';
        const text = formatNarration(
          (t.content.autoBattle.narration as Record<string, string>)[key] ?? '',
          d.narrationParams,
        );
        const open = expanded === d.id;
        return (
          <li key={d.id} className="border-b border-[var(--hl-line)] px-2 py-1.5">
            <button
              type="button"
              onClick={() => setExpanded(open ? null : d.id)}
              className="flex w-full flex-col items-start gap-0.5 text-left"
            >
              <span className="flex items-center gap-1.5 text-[10px] text-[var(--hl-ink-3)]">
                <span className="font-mono">W{d.snapshot.wave}</span>
                <span>{t.content.autoBattle.verdict[d.verdict]}</span>
                <span className="font-mono">${d.snapshot.money}</span>
                <span>HP {d.snapshot.health}</span>
              </span>
              <span className="text-[11px] leading-snug text-[var(--hl-ink)]">{text}</span>
            </button>
            {open && (
              <ul className="mt-1 flex flex-col gap-1">
                {d.candidates.map((c) => (
                  <li key={c.id} className="rounded border border-[var(--hl-line)] px-1.5 py-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span>{t.content.autoBattle.action[c.kind]} {c.towerType ?? ''}</span>
                      <span className="font-mono">{Math.round(c.total * 100)}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                      {c.factors.map((f) => (
                        <span key={f.factor} className="text-[9px] text-[var(--hl-ink-3)]">
                          {t.content.autoBattle.factor[
                            (f.factor === 'economyROI' ? 'economyRoi' : f.factor === 'skipSafety' ? 'skipSafety' : f.factor) as keyof typeof t.content.autoBattle.factor
                          ] ?? f.factor}{' '}
                          {Math.round(f.contribution * 100)}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const Curve = ({ curve }: { curve: AutoBattleCurvePoint[] }) => {
  const { t } = useTranslation();
  if (curve.length < 2) {
    return <p className="p-3 text-xs text-[var(--hl-ink-3)]">{t.content.autoBattle.empty.noDecision}</p>;
  }
  const maxWave = Math.max(...curve.map((p) => p.wave));
  const line = (pick: (p: AutoBattleCurvePoint) => number, max: number) =>
    curve
      .map((p, i) => {
        const x = (i / (curve.length - 1)) * 100;
        const y = 100 - (max > 0 ? (pick(p) / max) * 100 : 0);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  const maxMoney = Math.max(1, ...curve.map((p) => p.money));
  const maxDps = Math.max(1, ...curve.map((p) => p.dps));
  const maxHp = Math.max(1, ...curve.map((p) => p.health));
  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-[10px] text-[var(--hl-ink-3)]">W1 → W{maxWave}</p>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-32 w-full border border-[var(--hl-line)]">
        <polyline points={line((p) => p.money, maxMoney)} fill="none" stroke="var(--hl-accent)" strokeWidth="1.2" />
        <polyline points={line((p) => p.dps, maxDps)} fill="none" stroke="var(--hl-ink-2)" strokeWidth="1" strokeDasharray="2 1.5" />
        <polyline points={line((p) => p.health, maxHp)} fill="none" stroke="var(--hl-danger)" strokeWidth="0.8" />
      </svg>
      <ul className="grid grid-cols-3 gap-1 text-[10px]">
        <li>{t.content.autoBattle.stats.executed} · {t.content.autoBattle.stats.decisions}</li>
        <li className="text-[var(--hl-ink-3)]">{t.content.autoBattle.rules.title}</li>
      </ul>
    </div>
  );
};

const RuleList = ({ rules }: { rules: AutoBattleRule[] }) => {
  const { t } = useTranslation();
  const toggle = useGameStore((s) => s.toggleAutoBattleRule);
  if (rules.length === 0) {
    return <p className="p-3 text-xs text-[var(--hl-ink-3)]">{t.content.autoBattle.empty.noRules}</p>;
  }
  return (
    <ul className="flex flex-col">
      {rules.map((r) => (
        <li key={r.id} className="flex items-start gap-2 border-b border-[var(--hl-line)] px-2 py-1.5">
          <input type="checkbox" checked={r.enabled} onChange={() => toggle(r.id)} aria-label={r.id} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] leading-snug text-[var(--hl-ink)]">{r.note ?? r.id}</p>
            <p className="font-mono text-[9px] text-[var(--hl-ink-3)]">
              {r.then.type} · {r.hardness === 'hard' ? t.content.autoBattle.rule.hardnessHard : t.content.autoBattle.rule.hardnessSoft}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

const KINDS: Exclude<AutoBattleActionKind, 'hold'>[] = ['place', 'upgrade', 'sell', 'skill', 'skip'];

const WeightSliders = () => {
  const { t } = useTranslation();
  const weights = useGameStore((s) => s.autoBattleWeights);
  const setWeight = useGameStore((s) => s.setAutoBattleWeight);
  const reset = useGameStore((s) => s.resetAutoBattleWeights);
  const [kind, setKind] = useState<Exclude<AutoBattleActionKind, 'hold'>>('place');
  const base = BASE_WEIGHTS[kind];
  const factors = ALL_FACTORS.filter((f) => base[f] != null);
  return (
    <div className="flex flex-col gap-1.5 p-2">
      <div className="flex flex-wrap items-center gap-1">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded px-1.5 py-0.5 text-[10px] ${kind === k ? 'bg-[var(--hl-line)] font-bold' : 'text-[var(--hl-ink-3)]'}`}
          >
            {t.content.autoBattle.action[k]}
          </button>
        ))}
        <button type="button" onClick={reset} className="ml-auto text-[10px] underline">
          {t.content.autoBattle.rule.reset}
        </button>
      </div>
      {factors.map((f) => {
        const value = weights[kind]?.[f] ?? base[f] ?? 0;
        return (
          <label key={f} className="flex items-center gap-2 text-[10px]">
            <span className="w-16 shrink-0 text-[var(--hl-ink-2)]">
              {t.content.autoBattle.factor[
                (f === 'economyROI' ? 'economyRoi' : f === 'skipSafety' ? 'skipSafety' : f) as keyof typeof t.content.autoBattle.factor
              ] ?? FACTOR_LABEL_KEYS[f]}
            </span>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={value}
              onChange={(e) => setWeight(kind, f, Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-8 text-right font-mono tabular-nums">{value.toFixed(2)}</span>
          </label>
        );
      })}
    </div>
  );
};

const Report = ({
  decisions,
  stats,
}: {
  decisions: AutoBattleDecision[];
  stats: Props['stats'];
}) => {
  const { t } = useTranslation();
  const quality = useMemo(() => qualityOf(decisions), [decisions]);
  if (decisions.length === 0) {
    return <p className="p-3 text-xs text-[var(--hl-ink-3)]">{t.content.autoBattle.empty.noReport}</p>;
  }
  const leaks = decisions.filter((d) => d.snapshot.health < (decisions[decisions.length - 1]?.snapshot.health ?? 0));
  const idle = decisions.filter((d) => d.verdict === 'hold' && d.snapshot.money > 400);
  const c = t.content.autoBattle;
  const advice =
    quality.jitter > 3
      ? c.report.adviceJitter
      : quality.idleHolds > 5
        ? c.report.adviceReserve
        : quality.blocked > 10
          ? c.report.adviceTypeMatch
          : c.report.noFailure;
  return (
    <div className="flex flex-col gap-2 p-2 text-[11px]">
      <p className="text-[var(--hl-ink-2)]">
        {c.report.summary
          .replace('{decisions}', String(stats.decisions))
          .replace('{executed}', String(stats.executed))}
      </p>
      <div className="grid grid-cols-3 gap-1">
        <Stat label={c.stats.placed} value={stats.placed} />
        <Stat label={c.stats.upgraded} value={stats.upgraded} />
        <Stat label={c.stats.sold} value={stats.sold} />
        <Stat label={c.quality.jitter} value={quality.jitter} />
        <Stat label={c.quality.idle} value={quality.idleHolds} />
        <Stat label={c.quality.blocked} value={quality.blocked} />
      </div>
      <section>
        <h3 className="mb-1 text-[10px] font-bold text-[var(--hl-ink-3)]">{c.report.failures}</h3>
        {leaks.length === 0 && idle.length === 0 ? (
          <p className="text-[10px] text-[var(--hl-ink-3)]">{c.report.noFailure}</p>
        ) : (
          <ul className="flex flex-col gap-0.5 text-[10px]">
            {leaks.slice(0, 4).map((d) => (
              <li key={`leak-${d.id}`}>
                {c.report.failLeak.replace('{wave}', String(d.snapshot.wave)).replace('{health}', String(d.snapshot.health))}
              </li>
            ))}
            {idle.slice(0, 4).map((d) => (
              <li key={`idle-${d.id}`}>
                {c.report.failIdle.replace('{wave}', String(d.snapshot.wave)).replace('{money}', String(d.snapshot.money))}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="mb-1 text-[10px] font-bold text-[var(--hl-ink-3)]">{c.report.advice}</h3>
        <p className="text-[10px] leading-snug">{advice}</p>
      </section>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded border border-[var(--hl-line)] px-1.5 py-1">
    <p className="text-[9px] text-[var(--hl-ink-3)]">{label}</p>
    <p className="font-mono text-xs tabular-nums">{value}</p>
  </div>
);

export const AutoBattleInspect = ({ tab, decisions, curve, stats, rules }: Props) => {
  if (tab === 'timeline') return <Timeline decisions={decisions} />;
  if (tab === 'curve') return <Curve curve={curve} />;
  if (tab === 'report') return <Report decisions={decisions} stats={stats} />;
  return (
    <div className="flex flex-col">
      <WeightSliders />
      <div className="border-t border-[var(--hl-line)]" />
      <RuleList rules={rules} />
    </div>
  );
};
