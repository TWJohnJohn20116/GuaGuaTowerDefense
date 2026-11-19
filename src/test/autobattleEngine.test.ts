import { describe, expect, it } from 'vitest';
import type { AutoBattleContext, AutoBattleRule } from '@/types/autobattle';
import { clamp01, resolveWeights } from '@/store/autobattle/scoring';
import { decide } from '@/store/autobattle/decide';
import { PATHS } from '@/data/gameData';
import { BASE_WEIGHTS } from '@/data/autobattle/scoreWeights';

const ctx = (over: Partial<AutoBattleContext> = {}): AutoBattleContext => ({
  time: 1000,
  wave: 3,
  money: 300,
  health: 5,
  maxHealth: 10,
  enemies: [],
  towers: [],
  waveActive: false,
  allEnemiesSpawned: false,
  playerSkills: [],
  lookahead: { moneyReserve: 120, expectedAbilities: [], expectedEnemyCount: 0, pressure: 0, nextWaveTypes: [] },
  config: {
    mode: 'coach',
    presetId: 'balanced',
    weights: {},
    rules: [],
    allowedTiles: [],
    aiUntilWave: 10,
    lockedTargets: [],
    showOverlay: false,
    dryRun: false,
  },
  trigger: [],
  ...over,
});

describe('autobattle scoring', () => {
  it('clamp01 夾住邊界', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(9)).toBe(1);
  });

  it('resolveWeights 以 BASE 為底、使用者覆寫優先', () => {
    const merged = resolveWeights('place', { presetId: 'balanced', weights: { place: { coverage: 0.9 } } });
    expect(merged.coverage).toBeCloseTo(0.9);
    expect(merged.threatFit).toBeCloseTo(BASE_WEIGHTS.place.threatFit ?? 0);
  });
});

describe('autobattle rules', () => {
  it('硬規則 veto 把動作歸零並記錄原因', async () => {
    const { applyRules, matchCondition } = await import('@/store/autobattle/rules');
    const rule: AutoBattleRule = {
      id: 'test.no-sell',
      enabled: true,
      hardness: 'hard',
      when: { maxWave: 5 },
      then: { type: 'veto', kinds: ['sell'] },
      source: 'user',
    };
    expect(matchCondition(rule.when, ctx())).toBe(true);
    expect(matchCondition(rule.when, ctx({ wave: 9 }))).toBe(false);
    const out = applyRules(
      [
        { id: 'sell:1', kind: 'sell', labelKey: 'x', cost: -10, factors: [], softBonus: 0, penalties: 0, total: 0.5, vetoedBy: [] },
        { id: 'place:basic:1,1', kind: 'place', labelKey: 'x', cost: 100, factors: [], softBonus: 0, penalties: 0, total: 0.4, vetoedBy: [] },
      ],
      ctx(),
      [rule],
    );
    const sell = out.candidates.find((c) => c.kind === 'sell');
    expect(sell?.vetoedBy[0]?.ruleId).toBe('test.no-sell');
    expect(sell?.total).toBe(0);
    expect(out.candidates.find((c) => c.kind === 'place')?.total).toBeCloseTo(0.4);
  });

  it('軟規則加分只作用在對應動作', async () => {
    const { applyRules } = await import('@/store/autobattle/rules');
    const rule: AutoBattleRule = {
      id: 'test.bonus',
      enabled: true,
      hardness: 'soft',
      when: {},
      then: { type: 'bonus', kinds: ['upgrade'], amount: 0.1 },
      source: 'user',
    };
    const out = applyRules(
      [{ id: 'upgrade:1', kind: 'upgrade', labelKey: 'x', cost: 50, factors: [], softBonus: 0, penalties: 0, total: 0.2, vetoedBy: [] }],
      ctx(),
      [rule],
    );
    expect(out.candidates[0].softBonus).toBeCloseTo(0.1);
    expect(out.candidates[0].total).toBeCloseTo(0.3);
  });
});

describe('autobattle counters', () => {
  it('對位契合度依順位遞減', async () => {
    const { counterAffinity } = await import('@/data/enemyCounters');
    const flying = [{ type: 'flyer' as const, weight: 1 }];
    expect(counterAffinity(flying, 'laser')).toBeGreaterThan(counterAffinity(flying, 'sniper'));
    expect(counterAffinity(flying, 'sniper')).toBeGreaterThan(counterAffinity(flying, 'basic'));
  });
});

describe('autobattle quality', () => {
  it('同目標 10 秒內重複動作算一次抖動', async () => {
    const { qualityOf } = await import('@/store/autobattle/metrics');
    const base = {
      wave: 1,
      triggers: [],
      candidates: [],
      narrationKey: 'x',
      snapshot: { money: 500, health: 10, wave: 1, enemyCount: 2, towerCount: 3, threat: 0.2 },
    };
    const chosen = { id: 'k', kind: 'place' as const, labelKey: 'x', cost: 100, factors: [], softBonus: 0, penalties: 0, total: 0.5, vetoedBy: [] };
    const q = qualityOf([
      { ...base, id: 'a', time: 1000, chosen, verdict: 'executed' },
      { ...base, id: 'b', time: 3000, chosen, verdict: 'executed' },
    ]);
    expect(q.jitter).toBe(1);
    expect(q.executed).toBe(2);
  });
});

describe('autobattle decision modes', () => {
  const pathConfig = PATHS.zigzag ?? Object.values(PATHS)[0];

  const makeCtx = (over: Partial<AutoBattleContext> = {}): AutoBattleContext => ({
    time: 10000,
    wave: 5,
    money: 2000,
    health: 10,
    maxHealth: 10,
    enemies: [],
    towers: [
      { id: 'tw1', type: 'sniper', level: 1, col: 3, row: 3, skillReady: false, upgradePath: null },
      { id: 'tw2', type: 'cannon', level: 1, col: 5, row: 5, skillReady: false, upgradePath: null },
    ],
    waveActive: false,
    allEnemiesSpawned: false,
    playerSkills: [],
    lookahead: { moneyReserve: 100, expectedAbilities: [], expectedEnemyCount: 5, pressure: 0.2, nextWaveTypes: [] },
    config: {
      mode: 'coach',
      presetId: 'balanced',
      weights: {},
      rules: [],
      allowedTiles: [],
      aiUntilWave: 10,
      lockedTargets: [],
      showOverlay: false,
      dryRun: false,
      firepower: null,
    },
    trigger: ['cooldown'],
    ...over,
  });

  const run = (ctx: AutoBattleContext) =>
    decide({ ctx, pathConfig, costMult: 1, rules: ctx.config.rules, triggers: ['cooldown'], lastActionAt: new Map() });

  it('assist 模式只出建議，不執行', () => {
    const ctx = makeCtx({ config: { ...makeCtx().config, mode: 'assist' } });
    const d = run(ctx);
    expect(d.verdict).toBe('suggested');
    expect(d.chosen).not.toBeNull();
  });

  it('乾跑同樣只出建議', () => {
    const ctx = makeCtx({ config: { ...makeCtx().config, dryRun: true } });
    expect(run(ctx).verdict).toBe('suggested');
  });

  it('階段模式超過指定波次後不再執行', () => {
    const ctx = makeCtx({ wave: 12, config: { ...makeCtx().config, mode: 'phases', aiUntilWave: 10 } });
    expect(run(ctx).verdict).toBe('suggested');
  });

  it('鎖定的塔不會被升級', () => {
    const ctx = makeCtx({ config: { ...makeCtx().config, lockedTargets: ['tw1'] } });
    const d = run(ctx);
    const upgrades = d.candidates.filter((c) => c.kind === 'upgrade');
    expect(upgrades.every((c) => c.towerId !== 'tw1')).toBe(true);
  });

  it('硬規則全數否決時不執行任何動作', () => {
    const ctx = makeCtx({
      config: {
        ...makeCtx().config,
        rules: [{
          id: 'test.veto-all',
          enabled: true,
          hardness: 'hard',
          when: {},
          then: { type: 'veto', kinds: ['place', 'upgrade', 'sell', 'fusion', 'skill', 'playerSkill', 'skip'] },
          source: 'user',
        }],
      },
    });
    const d = run(ctx);
    expect(d.chosen).toBeNull();
    expect(d.verdict === 'blocked' || d.verdict === 'hold').toBe(true);
  });
});
