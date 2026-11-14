/** batch21：map-fs / balance / sidebar / diff 擴充 key */
export const BATCH21_KEYS = [
  'mapFsToolDupBlocked', 'mapFsToolMirrorHBlocked', 'mapFsToolMirrorVBlocked', 'mapFsToolClearBlocks',
  'mapFsNodeCount', 'mapFsExit', 'mapFsSaveReturn', 'mapFsTabProps', 'mapFsTabPoints', 'mapFsTabHistory',
  'mapFsMapNameLabel', 'mapFsMapDescLabel', 'mapFsDiffLabel', 'mapFsEditTipsTitle',
  'mapFsTipBrush', 'mapFsTipConnect', 'mapFsTipBlock', 'mapFsTipStartEnd', 'mapFsTipMinNodes',
  'mapFsPointsTotal', 'mapFsClearAll', 'mapFsNoPoints', 'mapFsNoPointsHint', 'mapFsSetStart', 'mapFsSetEnd', 'mapFsHistLabel',
  'modUnnamedMod', 'modTowerFxAnim', 'modEnemyAbilityAnim', 'modPreviewSuffix', 'modPathPointCount', 'modWaveEnemySummary',
  'diffSaveToCompare', 'diffSameAsInstalled', 'diffVersionTitle', 'diffMetaChanged', 'diffMetaName', 'diffMetaVersion', 'diffMetaDesc',
  'diffAdded', 'diffRemoved', 'diffChanged',
  'balAddContentHint', 'balDpsCompare', 'balEffCompare', 'balTowerEffHigh', 'balTowerEffHighTip', 'balTowerEffLow', 'balTowerEffLowTip',
  'balTowerDpsHigh', 'balTowerDpsHighTip', 'balTowerEffectsMany', 'balTowerEffectsManyTip', 'balTowerRangeFar', 'balTowerRangeFarTip',
  'balTowerFireRateHigh', 'balTowerFireRateHighTip', 'balTowerGood', 'balEnemyHpRewardHigh', 'balEnemyHpRewardHighTip',
  'balEnemyHpRewardLow', 'balEnemyHpRewardLowTip', 'balEnemySpeedHigh', 'balEnemySpeedHighTip', 'balEnemyHpVeryHigh', 'balEnemyHpVeryHighTip', 'balEnemyGood',
  'balAiTitle', 'balCopyReport', 'balDownloadJson', 'balTotalDps', 'balTotalThreat', 'balKillEstimate', 'balScoreEasy', 'balScoreGood', 'balScoreMedium', 'balScoreHard',
  'balSuggestNoTowers', 'balSuggestTowersReady', 'balSuggestTooEasy', 'balSuggestBalanced', 'balSuggestTooHard', 'balSuggestVeryHard',
  'balSuggestPeakWave', 'balSuggestHighEff', 'balSuggestLowEff', 'balSuggestManyBoss', 'balSuggestPhaseNoAoe',
];

const ZH = {
  mapFsToolDupBlocked: '複製路徑（下移，含障礙）', mapFsToolMirrorHBlocked: '水平對稱（含障礙）', mapFsToolMirrorVBlocked: '垂直對稱（含障礙）', mapFsToolClearBlocks: '清空障礙格子',
  mapFsNodeCount: '{count} 個節點', mapFsExit: '退出', mapFsSaveReturn: '儲存並返回', mapFsTabProps: '屬性', mapFsTabPoints: '節點', mapFsTabHistory: '歷史',
  mapFsMapNameLabel: '地圖名稱', mapFsMapDescLabel: '地圖描述', mapFsDiffLabel: '難度設定', mapFsEditTipsTitle: '編輯提示',
  mapFsTipBrush: '使用「筆刷」在網格上拖曳以快速繪製路徑', mapFsTipConnect: '路徑必須連貫，相鄰的點才能自動連接',
  mapFsTipBlock: '使用「障礙」模式點擊格子繪製不可建造區', mapFsTipStartEnd: '起點為綠色，終點為紅色；節點面板可設為起/終點', mapFsTipMinNodes: '最少需要 2 個節點才能儲存',
  mapFsPointsTotal: '總計: {count} 點', mapFsClearAll: '清空全部', mapFsNoPoints: '尚無路徑點', mapFsNoPointsHint: '請使用左側工具開始繪製',
  mapFsSetStart: '設為起點', mapFsSetEnd: '設為終點', mapFsHistLabel: '操作記錄',
  modUnnamedMod: '未命名 Mod', modTowerFxAnim: '塔效果動畫', modEnemyAbilityAnim: '敵人能力動畫', modPreviewSuffix: '預覽',
  modPathPointCount: '{count} 個路徑點', modWaveEnemySummary: '{waves} 波 · {enemies} 敵',
  diffSaveToCompare: '儲存後可與已安裝版本對比差異', diffSameAsInstalled: '與已安裝版本內容一致', diffVersionTitle: '版本差異',
  diffMetaChanged: '元資料變更：', diffMetaName: ' 名稱', diffMetaVersion: ' 版本', diffMetaDesc: ' 描述',
  diffAdded: '+ 新增 {names}', diffRemoved: '− 移除 {names}', diffChanged: '~ 修改 {names}',
  balAddContentHint: '添加塔或敵人後，這裡會顯示平衡性分析', balDpsCompare: 'DPS 比較', balEffCompare: '成本效益比較',
  balTowerEffHigh: '性價比過高 ({eff} vs 基準 {avg})', balTowerEffHighTip: '考慮增加花費或降低傷害',
  balTowerEffLow: '性價比過低 ({eff} vs 基準 {avg})', balTowerEffLowTip: '考慮降低花費或提升傷害',
  balTowerDpsHigh: 'DPS 非常高 ({dps})', balTowerDpsHighTip: '這可能讓遊戲變得太簡單',
  balTowerEffectsMany: '擁有 {count} 種特殊效果', balTowerEffectsManyTip: '太多效果可能使塔過於強大',
  balTowerRangeFar: '射程非常遠', balTowerRangeFarTip: '可能需要降低傷害或攻速來平衡',
  balTowerFireRateHigh: '攻速過高可能導致性能問題', balTowerFireRateHighTip: '建議保持在 10 以下',
  balTowerGood: '平衡性良好！', balEnemyHpRewardHigh: '生命/獎勵比過高 ({ratio})', balEnemyHpRewardHighTip: '敵人可能太難打，考慮增加獎勵或降低生命',
  balEnemyHpRewardLow: '生命/獎勵比過低 ({ratio})', balEnemyHpRewardLowTip: '敵人可能太容易打，考慮降低獎勵或增加生命',
  balEnemySpeedHigh: '速度非常快', balEnemySpeedHighTip: '可能難以被塔攻擊到',
  balEnemyHpVeryHigh: '生命值非常高', balEnemyHpVeryHighTip: '確保有足夠的獎勵來平衡', balEnemyGood: '平衡性良好！',
  balAiTitle: '平衡 AI 評分', balCopyReport: '複製文字報告', balDownloadJson: '下載 JSON 報告',
  balTotalDps: '總 DPS', balTotalThreat: '威脅量', balKillEstimate: '清場估計',
  balScoreEasy: '偏簡單', balScoreGood: '平衡良好', balScoreMedium: '中等偏難', balScoreHard: '偏困難',
  balSuggestNoTowers: '有敵人/波次但沒有防禦塔，玩家將無法反擊',
  balSuggestTowersReady: '塔已就緒，可加入敵人或波次測試難度',
  balSuggestTooEasy: '整體偏簡單：考慮提高敵人血量或加入相位/隱身能力',
  balSuggestBalanced: '難度適中：可微調波次間隔或獎勵金',
  balSuggestTooHard: '整體偏難：建議提升塔 DPS 或降低波次敵人數',
  balSuggestVeryHard: '威脅量遠高於火力：需加強塔傷害或削減 Boss 波',
  balSuggestPeakWave: '{label} 威脅峰值偏高（{peak}），建議拉長前後波間隔',
  balSuggestHighEff: '平均性價比偏高，長期經濟可能過強',
  balSuggestLowEff: '塔性價比偏低，玩家可能不願購買',
  balSuggestManyBoss: '含 {count} 個 Boss 波，建議拉長間隔或降低護盾敵人比例',
  balSuggestPhaseNoAoe: '有相位敵人但缺少 AOE/毒傷塔，建議提示玩家用法術類塔',
};

const EN = {
  mapFsToolDupBlocked: 'Duplicate path down (incl. blocks)', mapFsToolMirrorHBlocked: 'Mirror horizontal (incl. blocks)', mapFsToolMirrorVBlocked: 'Mirror vertical (incl. blocks)', mapFsToolClearBlocks: 'Clear blocked tiles',
  mapFsNodeCount: '{count} nodes', mapFsExit: 'Exit', mapFsSaveReturn: 'Save & return', mapFsTabProps: 'Properties', mapFsTabPoints: 'Nodes', mapFsTabHistory: 'History',
  mapFsMapNameLabel: 'Map name', mapFsMapDescLabel: 'Map description', mapFsDiffLabel: 'Difficulty', mapFsEditTipsTitle: 'Editing tips',
  mapFsTipBrush: 'Use Brush to drag on grid for quick paths', mapFsTipConnect: 'Path must be contiguous; adjacent points connect',
  mapFsTipBlock: 'Use Block mode to mark non-buildable tiles', mapFsTipStartEnd: 'Start green, end red; set in node panel', mapFsTipMinNodes: 'Need at least 2 nodes to save',
  mapFsPointsTotal: 'Total: {count} pts', mapFsClearAll: 'Clear all', mapFsNoPoints: 'No path points yet', mapFsNoPointsHint: 'Use left tools to start drawing',
  mapFsSetStart: 'Set as start', mapFsSetEnd: 'Set as end', mapFsHistLabel: 'History',
  modUnnamedMod: 'Unnamed mod', modTowerFxAnim: 'Tower effect preview', modEnemyAbilityAnim: 'Enemy ability preview', modPreviewSuffix: 'Preview',
  modPathPointCount: '{count} waypoints', modWaveEnemySummary: '{waves} waves · {enemies} enemies',
  diffSaveToCompare: 'Save to compare with installed version', diffSameAsInstalled: 'Matches installed version', diffVersionTitle: 'Version diff',
  diffMetaChanged: 'Metadata changed:', diffMetaName: ' name', diffMetaVersion: ' version', diffMetaDesc: ' description',
  diffAdded: '+ Added {names}', diffRemoved: '− Removed {names}', diffChanged: '~ Changed {names}',
  balAddContentHint: 'Add towers or enemies for balance analysis', balDpsCompare: 'DPS comparison', balEffCompare: 'Cost efficiency',
  balTowerEffHigh: 'Efficiency too high ({eff} vs avg {avg})', balTowerEffHighTip: 'Consider raising cost or lowering damage',
  balTowerEffLow: 'Efficiency too low ({eff} vs avg {avg})', balTowerEffLowTip: 'Consider lowering cost or raising damage',
  balTowerDpsHigh: 'Very high DPS ({dps})', balTowerDpsHighTip: 'May make the game too easy',
  balTowerEffectsMany: '{count} special effects', balTowerEffectsManyTip: 'Too many effects may overpower the tower',
  balTowerRangeFar: 'Very long range', balTowerRangeFarTip: 'May need lower damage or fire rate',
  balTowerFireRateHigh: 'Fire rate may hurt performance', balTowerFireRateHighTip: 'Keep below 10 if possible',
  balTowerGood: 'Balance looks good!', balEnemyHpRewardHigh: 'HP/reward ratio high ({ratio})', balEnemyHpRewardHighTip: 'May be too tanky; raise reward or lower HP',
  balEnemyHpRewardLow: 'HP/reward ratio low ({ratio})', balEnemyHpRewardLowTip: 'May be too easy; lower reward or raise HP',
  balEnemySpeedHigh: 'Very fast', balEnemySpeedHighTip: 'Hard for towers to hit',
  balEnemyHpVeryHigh: 'Very high HP', balEnemyHpVeryHighTip: 'Ensure reward balances HP', balEnemyGood: 'Balance looks good!',
  balAiTitle: 'Balance AI score', balCopyReport: 'Copy text report', balDownloadJson: 'Download JSON report',
  balTotalDps: 'Total DPS', balTotalThreat: 'Threat', balKillEstimate: 'Clear estimate',
  balScoreEasy: 'Too easy', balScoreGood: 'Balanced', balScoreMedium: 'Medium-hard', balScoreHard: 'Too hard',
  balSuggestNoTowers: 'Enemies/waves but no towers — players cannot fight back',
  balSuggestTowersReady: 'Towers ready; add enemies or waves to test difficulty',
  balSuggestTooEasy: 'Overall easy: raise enemy HP or add phase/stealth',
  balSuggestBalanced: 'Fair difficulty: tweak wave spacing or rewards',
  balSuggestTooHard: 'Overall hard: raise tower DPS or reduce wave counts',
  balSuggestVeryHard: 'Threat far exceeds DPS: buff towers or trim boss waves',
  balSuggestPeakWave: '{label} threat spike ({peak}); space waves more evenly',
  balSuggestHighEff: 'High avg efficiency; economy may snowball',
  balSuggestLowEff: 'Low tower efficiency; players may skip buying',
  balSuggestManyBoss: '{count} boss waves; space them out or reduce shields',
  balSuggestPhaseNoAoe: 'Phase enemies but no AOE/poison towers; suggest magic towers',
};

const JA = {
  ...EN,
  mapFsExit: '終了', mapFsSaveReturn: '保存して戻る', mapFsTabProps: '属性', mapFsTabPoints: 'ノード', mapFsTabHistory: '履歴',
  modTowerFxAnim: 'タワー効果アニメ', modEnemyAbilityAnim: '敵能力アニメ', modPreviewSuffix: 'プレビュー',
  balAiTitle: 'バランスAIスコア', balScoreGood: 'バランス良好', balTotalDps: '総DPS', balTotalThreat: '脅威量',
};

const KO = {
  ...EN,
  mapFsExit: '종료', mapFsSaveReturn: '저장 후 돌아가기', mapFsTabProps: '속성', mapFsTabPoints: '노드', mapFsTabHistory: '기록',
  modTowerFxAnim: '타워 효과 애니', modEnemyAbilityAnim: '적 능력 애니', modPreviewSuffix: '미리보기',
  balAiTitle: '밸런스 AI 점수', balScoreGood: '밸런스 양호', balTotalDps: '총 DPS', balTotalThreat: '위협량',
};

const MAP = {
  'zh-TW': ZH, 'zh-CN': ZH, en: EN, ja: JA, ko: KO, de: EN, fr: EN, es: EN, ru: EN, pt: EN,
};

export function getBatch21Ui(loc) {
  return { ...EN, ...MAP[loc] };
}

export function formatBatch21Lines(loc) {
  const d = getBatch21Ui(loc);
  return BATCH21_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k] ?? EN[k])},`).join('\n');
}
