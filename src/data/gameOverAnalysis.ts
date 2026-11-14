/** 失敗分析認定的控制塔：緩速、毒素、閃電弱化、風塔擊退。 */

export const CONTROL_TOWER_TYPES = ['frost', 'poison', 'lightning', 'wind'] as const;

type FailureAnalysisKey = 'fewTowers' | 'lowUpgrades' | 'noSpecial';

const SUGGESTION_KEY: Record<FailureAnalysisKey, 'buildMore' | 'upgradeMore' | 'useSpecial'> = {
  fewTowers: 'buildMore',
  lowUpgrades: 'upgradeMore',
  noSpecial: 'useSpecial',
};

export function resolveFailureAnalysisKeys(input: {
  towerCount: number;
  upgradeCount: number;
  towerTypes: readonly string[];
}): FailureAnalysisKey[] {
  const keys: FailureAnalysisKey[] = [];
  if (input.towerCount < 5) keys.push('fewTowers');
  if (input.upgradeCount < 3) keys.push('lowUpgrades');
  const hasControl = input.towerTypes.some((type) =>
    (CONTROL_TOWER_TYPES as readonly string[]).includes(type),
  );
  if (input.towerCount > 0 && !hasControl) keys.push('noSpecial');
  return keys;
}

export function failureAnalysisSuggestionKey(
  key: FailureAnalysisKey,
): 'buildMore' | 'upgradeMore' | 'useSpecial' {
  return SUGGESTION_KEY[key];
}
