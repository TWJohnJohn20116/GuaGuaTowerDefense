/** batch20：lp toggle + wave batch + LivePreview 剩餘 key */
export const BATCH20_KEYS = [
  'lpToggleCycle', 'lpToggleSingle', 'lpWaveRewardLine', 'lpEarnedTotal', 'lpNextWaveIn',
  'wvBatchSelected', 'wvBatchDup', 'wvBatchDel', 'wvBatchClear', 'wvBatchDupAll', 'wvBatchDupAllTitle', 'wvDragSort', 'wvBatchSelect',
];

const ZH = {
  lpToggleCycle: '循環', lpToggleSingle: '單波',
  lpWaveRewardLine: '本波 +{reward}', lpEarnedTotal: '累計 {total}', lpNextWaveIn: '下一波 {seconds}s',
  wvBatchSelected: '已選 {count} 波', wvBatchDup: '複製選取', wvBatchDel: '刪除選取', wvBatchClear: '清除選取',
  wvBatchDupAll: '批次複製', wvBatchDupAllTitle: '批次複製全部波次', wvDragSort: '拖曳排序', wvBatchSelect: '批次選取',
};

const EN = {
  lpToggleCycle: 'Cycle', lpToggleSingle: 'Single wave',
  lpWaveRewardLine: 'This wave +{reward}', lpEarnedTotal: 'Total {total}', lpNextWaveIn: 'Next wave in {seconds}s',
  wvBatchSelected: '{count} waves selected', wvBatchDup: 'Duplicate selected', wvBatchDel: 'Delete selected', wvBatchClear: 'Clear selection',
  wvBatchDupAll: 'Duplicate all', wvBatchDupAllTitle: 'Duplicate all waves', wvDragSort: 'Drag to reorder', wvBatchSelect: 'Batch select',
};

const JA = {
  ...EN,
  lpToggleCycle: 'ループ', lpToggleSingle: '単一波',
  lpWaveRewardLine: '今波 +{reward}', lpEarnedTotal: '累計 {total}', lpNextWaveIn: '次波 {seconds}秒',
  wvBatchSelected: '{count} 波選択中', wvBatchDup: '選択を複製', wvBatchDel: '選択を削除', wvBatchClear: '選択解除',
  wvBatchDupAll: '一括複製', wvBatchDupAllTitle: '全ウェーブを複製', wvDragSort: 'ドラッグで並べ替え', wvBatchSelect: '一括選択',
};

const KO = {
  ...EN,
  lpToggleCycle: '순환', lpToggleSingle: '단일 웨이브',
  lpWaveRewardLine: '이번 웨이브 +{reward}', lpEarnedTotal: '누적 {total}', lpNextWaveIn: '다음 웨이브 {seconds}초',
  wvBatchSelected: '{count}웨이브 선택', wvBatchDup: '선택 복제', wvBatchDel: '선택 삭제', wvBatchClear: '선택 해제',
  wvBatchDupAll: '일괄 복제', wvBatchDupAllTitle: '전체 웨이브 복제', wvDragSort: '드래그로 정렬', wvBatchSelect: '일괄 선택',
};

const DE = {
  ...EN,
  lpToggleCycle: 'Zyklus', lpToggleSingle: 'Einzelwelle',
  wvBatchSelected: '{count} Wellen gewaehlt', wvBatchDup: 'Auswahl duplizieren', wvBatchDel: 'Auswahl loeschen', wvBatchClear: 'Auswahl aufheben',
  wvBatchDupAll: 'Alle duplizieren', wvDragSort: 'Ziehen zum Sortieren',
};

const FR = {
  ...EN,
  lpToggleCycle: 'Boucle', lpToggleSingle: 'Vague unique',
  wvBatchSelected: '{count} vagues selectionnees', wvBatchDup: 'Dupliquer selection', wvBatchDel: 'Supprimer selection', wvBatchClear: 'Effacer selection',
  wvBatchDupAll: 'Tout dupliquer', wvDragSort: 'Glisser pour trier',
};

const ES = {
  ...EN,
  lpToggleCycle: 'Ciclo', lpToggleSingle: 'Ola unica',
  wvBatchSelected: '{count} olas seleccionadas', wvBatchDup: 'Duplicar seleccion', wvBatchDel: 'Eliminar seleccion', wvBatchClear: 'Limpiar seleccion',
  wvBatchDupAll: 'Duplicar todo', wvDragSort: 'Arrastrar para ordenar',
};

const RU = {
  ...EN,
  lpToggleCycle: 'Цикл', lpToggleSingle: 'Одна волна',
  wvBatchSelected: 'Выбрано волн: {count}', wvBatchDup: 'Дублировать выбранные', wvBatchDel: 'Удалить выбранные', wvBatchClear: 'Сбросить выбор',
  wvBatchDupAll: 'Дублировать все', wvDragSort: 'Перетащить для сортировки',
};

const PT = {
  ...EN,
  lpToggleCycle: 'Ciclo', lpToggleSingle: 'Onda unica',
  wvBatchSelected: '{count} ondas selecionadas', wvBatchDup: 'Duplicar selecao', wvBatchDel: 'Excluir selecao', wvBatchClear: 'Limpar selecao',
  wvBatchDupAll: 'Duplicar tudo', wvDragSort: 'Arrastar para ordenar',
};

const MAP = {
  'zh-TW': ZH, 'zh-CN': ZH, en: EN, ja: JA, ko: KO, de: DE, fr: FR, es: ES, ru: RU, pt: PT,
};

export function getBatch20Ui(loc) {
  return { ...EN, ...MAP[loc] };
}

export function formatBatch20Lines(loc) {
  const d = getBatch20Ui(loc);
  return BATCH20_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k] ?? EN[k])},`).join('\n');
}
