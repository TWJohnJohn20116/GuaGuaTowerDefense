import type { AutoBattleDecision } from '@/types/autobattle';
import type { TowerType } from '@/types/game';

/** 執行層只依賴這組注入的回呼，方便測試與模擬器共用 */
export interface AutoBattleExecuteApi {
  place: (type: TowerType, col: number, row: number) => boolean;
  upgrade: (towerId: string) => boolean;
  sell: (towerId: string) => boolean;
  activateSkill: (towerId: string) => boolean;
  skip: () => void;
}

export interface ExecuteOutcome {
  executed: boolean;
  kind: AutoBattleDecision['candidates'][number]['kind'] | null;
  targetKey: string | null;
  reason?: 'no-chosen' | 'denied' | 'api-failed';
}

/**
 * 把決策落地。只有 verdict='executed' 且 chosen 有值才會動作。
 * 回傳實際結果給記錄層（記錄「意圖 vs 結果」，避免 UI 顯示假成功）。
 */
export const executeDecision = (decision: AutoBattleDecision, api: AutoBattleExecuteApi): ExecuteOutcome => {
  const chosen = decision.chosen;
  if (!chosen || decision.verdict !== 'executed') {
    return { executed: false, kind: null, targetKey: null, reason: 'no-chosen' };
  }
  switch (chosen.kind) {
    case 'place': {
      if (!chosen.towerType || chosen.col == null || chosen.row == null) {
        return { executed: false, kind: chosen.kind, targetKey: null, reason: 'api-failed' };
      }
      const ok = api.place(chosen.towerType, chosen.col, chosen.row);
      return { executed: ok, kind: chosen.kind, targetKey: chosen.id, reason: ok ? undefined : 'api-failed' };
    }
    case 'upgrade': {
      if (!chosen.towerId) return { executed: false, kind: chosen.kind, targetKey: null, reason: 'api-failed' };
      const ok = api.upgrade(chosen.towerId);
      return { executed: ok, kind: chosen.kind, targetKey: chosen.id, reason: ok ? undefined : 'api-failed' };
    }
    case 'sell': {
      if (!chosen.towerId) return { executed: false, kind: chosen.kind, targetKey: null, reason: 'api-failed' };
      const ok = api.sell(chosen.towerId);
      return { executed: ok, kind: chosen.kind, targetKey: chosen.id, reason: ok ? undefined : 'api-failed' };
    }
    case 'skill': {
      if (!chosen.towerId) return { executed: false, kind: chosen.kind, targetKey: null, reason: 'api-failed' };
      const ok = api.activateSkill(chosen.towerId);
      return { executed: ok, kind: chosen.kind, targetKey: chosen.id, reason: ok ? undefined : 'api-failed' };
    }
    case 'skip': {
      api.skip();
      return { executed: true, kind: chosen.kind, targetKey: chosen.id };
    }
    default:
      // fusion / playerSkill 目前由各自既有流程處理，這裡不代為執行
      return { executed: false, kind: chosen.kind, targetKey: chosen.id, reason: 'denied' };
  }
};
