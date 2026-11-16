import type { AutoBattleCandidate, AutoBattleContext } from '@/types/autobattle';

export interface Narration {
  key: string;
  params: Record<string, string | number>;
}

/**
 * 一句話結論。刻意只寫「做了什麼 + 關鍵理由」，
 * 完整推理留在 candidates 的因子分解裡（UI 展開才看）。
 */
export const buildNarration = (
  chosen: AutoBattleCandidate | null,
  ctx: AutoBattleContext,
): Narration => {
  if (!chosen) {
    const blocked = ctx.config.rules.length > 0;
    return {
      key: blocked ? 'content.autoBattle.narration.noActionBlocked' : 'content.autoBattle.narration.noAction',
      params: { wave: ctx.wave, money: ctx.money },
    };
  }
  const top = [...chosen.factors].sort((a, b) => b.contribution - a.contribution)[0];
  const topFactor = top?.factor ?? 'coverage';
  switch (chosen.kind) {
    case 'place':
      return {
        key: 'content.autoBattle.narration.place',
        params: { tower: chosen.towerType ?? '', col: chosen.col ?? 0, row: chosen.row ?? 0, cost: chosen.cost, factor: topFactor },
      };
    case 'upgrade':
      return {
        key: 'content.autoBattle.narration.upgrade',
        params: { tower: chosen.towerType ?? '', level: chosen.labelParams?.level ?? 0, cost: chosen.cost, factor: topFactor },
      };
    case 'sell':
      return {
        key: 'content.autoBattle.narration.sell',
        params: { tower: chosen.towerType ?? '', refund: -chosen.cost, factor: topFactor },
      };
    case 'skill':
      return {
        key: 'content.autoBattle.narration.skill',
        params: { tower: chosen.towerType ?? '', factor: topFactor },
      };
    case 'skip':
      return {
        key: 'content.autoBattle.narration.skip',
        params: { wave: ctx.wave, factor: topFactor },
      };
    case 'fusion':
      return {
        key: 'content.autoBattle.narration.fusion',
        params: { cost: chosen.cost, factor: topFactor },
      };
    default:
      return {
        key: 'content.autoBattle.narration.noAction',
        params: { wave: ctx.wave, money: ctx.money },
      };
  }
};
