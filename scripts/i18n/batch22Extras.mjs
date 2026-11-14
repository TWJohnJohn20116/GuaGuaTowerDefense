/** batch22：map-panel / balance-badge / validation key */
export const BATCH22_KEYS = [
  'mapEmptyPath', 'mapHoverToolsHint', 'mapBlockedCount',
  'mapQtMirrorH', 'mapQtMirrorV', 'mapQtDupPath', 'mapQtClearBlock',
  'mapValStart', 'mapValEnd', 'mapValPathLen', 'mapValValid', 'mapValInvalid',
  'balWaveThreatChart', 'balBadgeEasy', 'balBadgeMedium', 'balBadgeHard', 'balBadgeTitle',
];

const ZH = {
  mapEmptyPath: '尚未建立路徑', mapHoverToolsHint: '懸浮工具（滑入卡片頂部）', mapBlockedCount: '障礙 {count}',
  mapQtMirrorH: '水平對稱', mapQtMirrorV: '垂直對稱', mapQtDupPath: '複製路徑', mapQtClearBlock: '清空障礙',
  mapValStart: '起點', mapValEnd: '終點', mapValPathLen: '路徑 {len}/10+', mapValValid: '有效', mapValInvalid: '無效',
  balWaveThreatChart: '逐波威脅曲線',
  balBadgeEasy: '偏簡', balBadgeMedium: '中等', balBadgeHard: '偏難', balBadgeTitle: '平衡評分 {score} · {label}',
};

const EN = {
  mapEmptyPath: 'No path yet', mapHoverToolsHint: 'Hover tools (top of card)', mapBlockedCount: 'Blocks {count}',
  mapQtMirrorH: 'Mirror H', mapQtMirrorV: 'Mirror V', mapQtDupPath: 'Duplicate path', mapQtClearBlock: 'Clear blocks',
  mapValStart: 'Start', mapValEnd: 'End', mapValPathLen: 'Path {len}/10+', mapValValid: 'Valid', mapValInvalid: 'Invalid',
  balWaveThreatChart: 'Wave threat curve',
  balBadgeEasy: 'Easy', balBadgeMedium: 'Medium', balBadgeHard: 'Hard', balBadgeTitle: 'Balance {score} · {label}',
};

const JA = {
  ...EN,
  mapEmptyPath: '経路未作成', mapQtMirrorH: '左右対称', mapQtMirrorV: '上下対称', mapQtDupPath: '経路複製', mapQtClearBlock: '障害クリア',
  mapValStart: '開始', mapValEnd: '終了', balWaveThreatChart: 'ウェーブ脅威曲線',
  balBadgeEasy: '簡単', balBadgeMedium: '普通', balBadgeHard: '難しい',
};

const KO = {
  ...EN,
  mapEmptyPath: '경로 없음', mapQtMirrorH: '좌우 대칭', mapQtMirrorV: '상하 대칭', mapQtDupPath: '경로 복제', mapQtClearBlock: '장애물 지우기',
  mapValStart: '시작', mapValEnd: '끝', balWaveThreatChart: '웨이브 위협 곡선',
  balBadgeEasy: '쉬움', balBadgeMedium: '보통', balBadgeHard: '어려움',
};

const MAP = {
  'zh-TW': ZH, 'zh-CN': ZH, en: EN, ja: JA, ko: KO, de: EN, fr: EN, es: EN, ru: EN, pt: EN,
};

export function getBatch22Ui(loc) {
  return { ...EN, ...MAP[loc] };
}

export function formatBatch22Lines(loc) {
  const d = getBatch22Ui(loc);
  return BATCH22_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k] ?? EN[k])},`).join('\n');
}