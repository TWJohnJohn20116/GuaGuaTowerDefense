import type {
  AutoBattleActionKind,
  AutoBattleConfig,
  AutoBattleCurvePoint,
  AutoBattleDecision,
  AutoBattlePreset,
  AutoBattleRule,
  AutoBattleWeights,
} from '@/types/autobattle';
import type { GameStore } from '@/store/gameStoreTypes';
import { PATHS } from '@/data/gameData';
import { GAME_CONSTANTS } from '@/data/gameData/waveData';
import { DEFAULT_AUTO_BATTLE_RULES } from '@/data/autobattle/defaultRules';
import { getPreset } from '@/data/autobattle/presets';
import { DECISION_LIMITS } from '@/data/autobattle/scoreWeights';
import { buildContext } from './context';
import { buildLookahead } from './plan';
import { decide, trimDecisions } from './decide';
import { executeDecision } from './execute';
import { pollTriggers, resetTriggers } from './triggers';
import { mergeCurve, sampleCurve } from './metrics';

type GetState = () => GameStore;
type SetState = (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void;

/** 自動戰鬥的初始狀態（startGame 與 resetGame 共用） */
export const AUTO_BATTLE_INITIAL = {
  autoBattleEnabled: false,
  autoBattleMode: 'coach' as const,
  autoBattlePresetId: 'balanced',
  autoBattleWeights: {},
  autoBattleRules: DEFAULT_AUTO_BATTLE_RULES,
  autoBattleDecisions: [] as AutoBattleDecision[],
  autoBattleCurve: [] as AutoBattleCurvePoint[],
  autoBattleLockedTargets: [] as string[],
  autoBattleAllowedTiles: [] as string[],
  autoBattleAiUntilWave: 10,
  autoBattleShowOverlay: false,
  autoBattleDryRun: false,
  autoBattlePanelOpen: false,
  autoBattleLastDecision: 0,
  autoBattleLastActionAt: {} as Record<string, number>,
  autoBattleStats: { decisions: 0, executed: 0, placed: 0, upgraded: 0, sold: 0, skipped: 0 },
};

const buildConfig = (state: GameStore): AutoBattleConfig => ({
  mode: state.autoBattleMode,
  presetId: state.autoBattlePresetId,
  weights: state.autoBattleWeights,
  rules: state.autoBattleRules,
  allowedTiles: state.autoBattleAllowedTiles,
  aiUntilWave: state.autoBattleAiUntilWave,
  lockedTargets: state.autoBattleLockedTargets,
  showOverlay: state.autoBattleShowOverlay,
  dryRun: state.autoBattleDryRun,
});

export const createAutoBattleSlice = (get: GetState, set: SetState) => ({
  ...AUTO_BATTLE_INITIAL,

  toggleAutoBattle: () => set((state) => ({
    autoBattleEnabled: !state.autoBattleEnabled,
    autoBattleLastDecision: 0,
    autoBattleLockedTargets: state.autoBattleEnabled ? state.autoBattleLockedTargets : [],
  })),

  setAutoBattleMode: (mode: GameStore['autoBattleMode']) => set(() => ({ autoBattleMode: mode })),

  setAutoBattlePreset: (presetId: string) => set(() => ({ autoBattlePresetId: presetId })),

  setAutoBattleWeight: (kind: AutoBattleActionKind, factor: keyof AutoBattleWeights, value: number) =>
    set((state) => ({
      autoBattleWeights: {
        ...state.autoBattleWeights,
        [kind]: { ...(state.autoBattleWeights[kind] ?? {}), [factor]: Math.max(0, Math.min(1, value)) },
      },
    })),

  resetAutoBattleWeights: () => set(() => ({ autoBattleWeights: {} })),

  upsertAutoBattleRule: (rule: AutoBattleRule) =>
    set((state) => {
      const exists = state.autoBattleRules.some((r) => r.id === rule.id);
      return {
        autoBattleRules: exists
          ? state.autoBattleRules.map((r) => (r.id === rule.id ? rule : r))
          : [...state.autoBattleRules, rule],
      };
    }),

  removeAutoBattleRule: (id: string) =>
    set((state) => ({ autoBattleRules: state.autoBattleRules.filter((r) => r.id !== id) })),

  toggleAutoBattleRule: (id: string) =>
    set((state) => ({
      autoBattleRules: state.autoBattleRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    })),

  lockAutoBattleTarget: (key: string) =>
    set((state) => ({
      autoBattleLockedTargets: state.autoBattleLockedTargets.includes(key)
        ? state.autoBattleLockedTargets
        : [...state.autoBattleLockedTargets, key],
    })),

  unlockAutoBattleTarget: (key: string) =>
    set((state) => ({ autoBattleLockedTargets: state.autoBattleLockedTargets.filter((k) => k !== key) })),

  clearAutoBattleLocks: () => set(() => ({ autoBattleLockedTargets: [] })),

  setAutoBattleAllowedTiles: (tiles: string[]) => set(() => ({ autoBattleAllowedTiles: tiles })),

  setAutoBattleAiUntilWave: (wave: number) => set(() => ({ autoBattleAiUntilWave: Math.max(1, Math.round(wave)) })),

  setAutoBattleOverlay: (show: boolean) => set(() => ({ autoBattleShowOverlay: show })),

  setAutoBattleDryRun: (dryRun: boolean) => set(() => ({ autoBattleDryRun: dryRun })),

  setAutoBattlePanelOpen: (open: boolean) => set(() => ({ autoBattlePanelOpen: open })),

  clearAutoBattleDecisions: () => set(() => ({ autoBattleDecisions: [] })),

  /**
   * 主迴圈每幀呼叫。事件驅動：沒有值得決策的變化就只做 200ms 兜底輪詢。
   */
  runAutoBattleLogic: () => {
    const state = get();
    if (!state.autoBattleEnabled) return;
    if (!state.isPlaying || state.isPaused || state.isGameOver) return;

    const costMult = state.difficultyModifiers.towerCostMult;
    const config = buildConfig(state);
    const lookahead = buildLookahead({
      wave: state.currentWave + 1,
      money: state.money,
      health: state.health,
      maxHealth: GAME_CONSTANTS.INITIAL_HEALTH,
      towerCount: state.towers.length,
      costMult,
      presetId: config.presetId,
    });
    const ctx = buildContext(state, [], config, lookahead);
    const triggers = pollTriggers(ctx);

    if (triggers.length === 0 && ctx.time - state.autoBattleLastDecision < DECISION_LIMITS.fallbackTickMs) {
      return;
    }

    const pathConfig = PATHS[state.selectedPath];
    const decision = decide({
      ctx,
      pathConfig,
      costMult,
      rules: config.rules,
      triggers,
      lastActionAt: new Map(Object.entries(state.autoBattleLastActionAt)),
    });

    const towerById = new Map(state.towers.map((t) => [t.id, t]));
    const outcome = executeDecision(decision, {
      place: (type, col, row) => get().placeTowerAs(type, { x: col, y: row }),
      upgrade: (towerId) => {
        const tower = towerById.get(towerId);
        if (!tower) return false;
        return get().upgradeTower(tower, tower.upgradePath ?? 'A');
      },
      sell: (towerId) => {
        const tower = towerById.get(towerId);
        if (!tower) return false;
        get().sellTower(tower);
        return true;
      },
      activateSkill: (towerId) => get().activateSkill(towerId),
      skip: () => get().skipWave(),
    });

    set((s) => {
      const last = s.autoBattleCurve[s.autoBattleCurve.length - 1];
      const curve = !last || last.wave !== ctx.wave ? mergeCurve(s.autoBattleCurve, sampleCurve(ctx)) : s.autoBattleCurve;
      const targetKey = outcome.targetKey ?? '';
      const lastActionAt = outcome.executed
        ? { ...s.autoBattleLastActionAt, [targetKey]: ctx.time }
        : s.autoBattleLastActionAt;
      return {
        autoBattleDecisions: trimDecisions([decision, ...s.autoBattleDecisions]),
        autoBattleLastDecision: ctx.time,
        autoBattleLastActionAt: lastActionAt,
        autoBattleCurve: curve,
        autoBattleStats: {
          decisions: s.autoBattleStats.decisions + 1,
          executed: s.autoBattleStats.executed + (outcome.executed ? 1 : 0),
          placed: s.autoBattleStats.placed + (outcome.executed && outcome.kind === 'place' ? 1 : 0),
          upgraded: s.autoBattleStats.upgraded + (outcome.executed && outcome.kind === 'upgrade' ? 1 : 0),
          sold: s.autoBattleStats.sold + (outcome.executed && outcome.kind === 'sell' ? 1 : 0),
          skipped: s.autoBattleStats.skipped + (outcome.executed && outcome.kind === 'skip' ? 1 : 0),
        },
      };
    });
  },

  /** 建議模式：採納最新一筆 suggestion（乾跑與 assist 共用） */
  acceptAutoBattleSuggestion: () => {
    const state = get();
    const suggestion = state.autoBattleDecisions.find((d) => d.verdict === 'suggested');
    if (!suggestion || !suggestion.chosen) return false;
    const towerById = new Map(state.towers.map((t) => [t.id, t]));
    const outcome = executeDecision({ ...suggestion, verdict: 'executed' }, {
      place: (type, col, row) => get().placeTowerAs(type, { x: col, y: row }),
      upgrade: (towerId) => {
        const tower = towerById.get(towerId);
        return tower ? get().upgradeTower(tower, tower.upgradePath ?? 'A') : false;
      },
      sell: (towerId) => {
        const tower = towerById.get(towerId);
        if (!tower) return false;
        get().sellTower(tower);
        return true;
      },
      activateSkill: (towerId) => get().activateSkill(towerId),
      skip: () => get().skipWave(),
    });
    return outcome.executed;
  },

  resetAutoBattleState: () => {
    resetTriggers();
    set(() => ({ ...AUTO_BATTLE_INITIAL, autoBattleRules: DEFAULT_AUTO_BATTLE_RULES }));
  },

  /** 給 UI 顯示目前生效的預設檔（找不到回退 balanced） */
  currentAutoBattlePreset: () => getPreset(get().autoBattlePresetId),
});
