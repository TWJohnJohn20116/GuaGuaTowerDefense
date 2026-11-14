/** batch27：grep-sweep6 + modManager.batch + es/ru/pt 在地化 */
export const BATCH27_SHOP_KEYS = ['detailSelectHint1', 'detailSelectHint2', 'suggestionAffordable', 'suggestionNeedCoins'];
export const BATCH27_MEM_DETAIL_KEYS = ['selectHintLine1', 'selectHintLine2'];
export const BATCH27_PATH_KEYS = [
  'campaignProgressTitle', 'campaignLevelsLine', 'campaignChaptersLine',
  'campaignAllDone', 'campaignNextLevel', 'campaignRetryStars', 'customWaveLabel',
];
export const BATCH27_MM_BATCH_KEYS = [
  'selectedCount', 'filteredCount', 'enableSelected', 'disableSelected',
  'enableFiltered', 'disableFiltered', 'clearSelection', 'ctrlHint',
];

const ZH_SHOP = {
  detailSelectHint1: '點選左側商品',
  detailSelectHint2: '查看詳情與購買',
  suggestionAffordable: '現在就買得起「{label}」',
  suggestionNeedCoins: '離下一個目標「{label}」還差一點金幣 — 打幾場關卡賺取獎勵吧',
};
const EN_SHOP = {
  detailSelectHint1: 'Select an item on the left',
  detailSelectHint2: 'to view details and purchase',
  suggestionAffordable: 'You can afford "{label}" now',
  suggestionNeedCoins: 'A bit more gold for "{label}" — clear a few stages for rewards',
};

const ZH_MEM = {
  selectHintLine1: '點選左側紀念卡',
  selectHintLine2: '閱讀英雄故事',
};
const EN_MEM = {
  selectHintLine1: 'Select a memorial card on the left',
  selectHintLine2: 'to read their story',
};

const ZH_PATH = {
  campaignProgressTitle: '戰役總進度',
  campaignLevelsLine: '關卡 {done}/{total}',
  campaignChaptersLine: '章節 {done}/{total}',
  campaignAllDone: '戰役已全部通關，感謝你的守護。',
  campaignNextLevel: '下一關',
  campaignRetryStars: '推薦補星',
  customWaveLabel: '自訂波次組',
};
const EN_PATH = {
  campaignProgressTitle: 'Campaign progress',
  campaignLevelsLine: 'Levels {done}/{total}',
  campaignChaptersLine: 'Chapters {done}/{total}',
  campaignAllDone: 'Campaign complete — thank you for defending the realm.',
  campaignNextLevel: 'Next level',
  campaignRetryStars: 'Retry for stars',
  customWaveLabel: 'Custom wave set',
};

const ZH_BATCH = {
  selectedCount: '已選 {count} 個 Mod',
  filteredCount: '篩選結果 {count} 個',
  enableSelected: '啟用選取',
  disableSelected: '停用選取',
  enableFiltered: '啟用全部篩選',
  disableFiltered: '停用全部篩選',
  clearSelection: '清除選取',
  ctrlHint: 'Ctrl+點擊卡片可多選',
};
const EN_BATCH = {
  selectedCount: '{count} selected',
  filteredCount: '{count} in filter',
  enableSelected: 'Enable selected',
  disableSelected: 'Disable selected',
  enableFiltered: 'Enable all filtered',
  disableFiltered: 'Disable all filtered',
  clearSelection: 'Clear selection',
  ctrlHint: 'Ctrl+click cards to multi-select',
};

const JA_BATCH = {
  ...EN_BATCH,
  selectedCount: '{count} 件選択',
  filteredCount: '絞込 {count} 件',
  enableSelected: '選択を有効化',
  disableSelected: '選択を無効化',
  ctrlHint: 'Ctrl+クリックで複数選択',
};
const KO_BATCH = {
  ...EN_BATCH,
  selectedCount: '{count}개 선택',
  filteredCount: '필터 {count}개',
  enableSelected: '선택 활성화',
  disableSelected: '선택 비활성화',
  ctrlHint: 'Ctrl+클릭으로 다중 선택',
};
const DE_BATCH = {
  ...EN_BATCH,
  selectedCount: '{count} ausgewählt',
  filteredCount: '{count} im Filter',
  enableSelected: 'Auswahl aktivieren',
  disableSelected: 'Auswahl deaktivieren',
  ctrlHint: 'Strg+Klick für Mehrfachauswahl',
};
const FR_BATCH = {
  ...EN_BATCH,
  selectedCount: '{count} sélectionnés',
  filteredCount: '{count} filtrés',
  enableSelected: 'Activer la sélection',
  disableSelected: 'Désactiver la sélection',
  ctrlHint: 'Ctrl+clic pour multi-sélection',
};

export const ES_MOD_MANAGER = {
  title: 'Gestor de Mods',
  subtitle: 'Administra y configura tus mods',
  importSuccess: '¡Mod importado con éxito!',
  importFailed: 'Error al importar',
  toolbar: {
    searchPlaceholder: 'Buscar nombre, autor o etiquetas…',
    importMod: 'Importar mod',
    filterAll: 'Todos',
    filterEnabled: 'Activos',
    filterDisabled: 'Inactivos',
    sortLabel: 'Ordenar',
    sortAsc: 'Ascendente',
    sortDesc: 'Descendente',
    sortName: 'Nombre',
    sortScore: 'Puntuación',
    sortType: 'Tipo',
    sortEnabled: 'Activo',
    sortUpdated: 'Actualizado',
    clearSearch: 'Borrar búsqueda',
    filterTags: 'Etiquetas',
    tagAll: 'Todas las etiquetas',
  },
  grid: {
    emptyNone: 'Aún no hay mods instalados',
    emptyFilter: 'Ningún mod coincide con los filtros',
    importFirst: 'Importa tu primer mod',
    clearFilters: 'Borrar filtros',
  },
  batch: {
    selectedCount: '{count} seleccionados',
    filteredCount: '{count} en filtro',
    enableSelected: 'Activar selección',
    disableSelected: 'Desactivar selección',
    enableFiltered: 'Activar todos filtrados',
    disableFiltered: 'Desactivar todos filtrados',
    clearSelection: 'Limpiar selección',
    ctrlHint: 'Ctrl+clic para selección múltiple',
  },
  detail: {
    selectHintLine1: 'Selecciona una tarjeta mod a la izquierda',
    selectHintLine2: 'para ver detalles y acciones',
    enabled: 'Activo',
    disabled: 'Inactivo',
    contentStats: 'Estadísticas',
    towers: 'Torres',
    enemies: 'Enemigos',
    maps: 'Mapas',
    waves: 'Oleadas',
    enable: 'Activar mod',
    disable: 'Desactivar mod',
    edit: 'Editar mod',
    exportJson: 'Exportar JSON',
    copiedJson: 'JSON copiado',
    remove: 'Eliminar mod',
    confirmRemove: 'Confirmar eliminación',
    cancel: 'Cancelar',
    confirmRemovePrompt: '¿Eliminar este mod permanentemente?',
    sectionAddTowers: 'Torres personalizadas',
    sectionAddEnemies: 'Enemigos personalizados',
    sectionAddMaps: 'Mapas personalizados',
    sectionAddWaves: 'Oleadas personalizadas',
    towerStatLine: 'DMG: {damage} • Alcance: {range}',
    enemyStatLine: 'HP: {hp} • Vel.: {speed}x',
    mapDifficulty: 'Dificultad: {difficulty}',
    mapWaypointCount: '{count} puntos de ruta',
    waveCountBadge: '{count} oleadas',
    waveEnemyBadge: '{count} enemigos',
    metaGameVersion: 'Versión del juego',
    metaCreatedAt: 'Creado',
    metaUpdatedAt: 'Actualizado',
  },
};

export const RU_MOD_MANAGER = {
  title: 'Менеджер модов',
  subtitle: 'Управление и настройка модов',
  importSuccess: 'Мод успешно импортирован!',
  importFailed: 'Ошибка импорта',
  toolbar: {
    searchPlaceholder: 'Поиск по имени, автору или тегам…',
    importMod: 'Импорт мода',
    filterAll: 'Все',
    filterEnabled: 'Включены',
    filterDisabled: 'Выключены',
    sortLabel: 'Сортировка',
    sortAsc: 'По возрастанию',
    sortDesc: 'По убыванию',
    sortName: 'Имя',
    sortScore: 'Оценка',
    sortType: 'Тип',
    sortEnabled: 'Включён',
    sortUpdated: 'Обновлён',
    clearSearch: 'Очистить поиск',
    filterTags: 'Теги',
    tagAll: 'Все теги',
  },
  grid: {
    emptyNone: 'Моды ещё не установлены',
    emptyFilter: 'Нет модов по фильтру',
    importFirst: 'Импортируйте первый мод',
    clearFilters: 'Сбросить фильтры',
  },
  batch: {
    selectedCount: 'Выбрано: {count}',
    filteredCount: 'В фильтре: {count}',
    enableSelected: 'Включить выбранные',
    disableSelected: 'Выключить выбранные',
    enableFiltered: 'Включить все в фильтре',
    disableFiltered: 'Выключить все в фильтре',
    clearSelection: 'Снять выбор',
    ctrlHint: 'Ctrl+клик для множественного выбора',
  },
  detail: {
    selectHintLine1: 'Выберите карточку мода слева',
    selectHintLine2: 'для просмотра деталей и действий',
    enabled: 'Включён',
    disabled: 'Выключен',
    contentStats: 'Статистика контента',
    towers: 'Башни',
    enemies: 'Враги',
    maps: 'Карты',
    waves: 'Волны',
    enable: 'Включить мод',
    disable: 'Выключить мод',
    edit: 'Редактировать мод',
    exportJson: 'Экспорт JSON',
    copiedJson: 'JSON скопирован',
    remove: 'Удалить мод',
    confirmRemove: 'Подтвердить удаление',
    cancel: 'Отмена',
    confirmRemovePrompt: 'Удалить этот мод навсегда?',
    sectionAddTowers: 'Свои башни',
    sectionAddEnemies: 'Свои враги',
    sectionAddMaps: 'Свои карты',
    sectionAddWaves: 'Свои волны',
    towerStatLine: 'Урон: {damage} • Дальн.: {range}',
    enemyStatLine: 'HP: {hp} • Скор.: {speed}x',
    mapDifficulty: 'Сложность: {difficulty}',
    mapWaypointCount: '{count} точек пути',
    waveCountBadge: '{count} волн',
    waveEnemyBadge: '{count} врагов',
    metaGameVersion: 'Версия игры',
    metaCreatedAt: 'Создан',
    metaUpdatedAt: 'Обновлён',
  },
};

export const PT_MOD_MANAGER = {
  title: 'Gerenciador de Mods',
  subtitle: 'Gerencie e configure seus mods',
  importSuccess: 'Mod importado com sucesso!',
  importFailed: 'Falha na importação',
  toolbar: {
    searchPlaceholder: 'Buscar nome, autor ou tags…',
    importMod: 'Importar mod',
    filterAll: 'Todos',
    filterEnabled: 'Ativos',
    filterDisabled: 'Inativos',
    sortLabel: 'Ordenar',
    sortAsc: 'Crescente',
    sortDesc: 'Decrescente',
    sortName: 'Nome',
    sortScore: 'Pontuação',
    sortType: 'Tipo',
    sortEnabled: 'Ativo',
    sortUpdated: 'Atualizado',
    clearSearch: 'Limpar busca',
    filterTags: 'Tags',
    tagAll: 'Todas as tags',
  },
  grid: {
    emptyNone: 'Nenhum mod instalado',
    emptyFilter: 'Nenhum mod corresponde aos filtros',
    importFirst: 'Importe seu primeiro mod',
    clearFilters: 'Limpar filtros',
  },
  batch: {
    selectedCount: '{count} selecionados',
    filteredCount: '{count} no filtro',
    enableSelected: 'Ativar selecionados',
    disableSelected: 'Desativar selecionados',
    enableFiltered: 'Ativar todos filtrados',
    disableFiltered: 'Desativar todos filtrados',
    clearSelection: 'Limpar seleção',
    ctrlHint: 'Ctrl+clique para seleção múltipla',
  },
  detail: {
    selectHintLine1: 'Selecione um card de mod à esquerda',
    selectHintLine2: 'para ver detalhes e ações',
    enabled: 'Ativo',
    disabled: 'Inativo',
    contentStats: 'Estatísticas',
    towers: 'Torres',
    enemies: 'Inimigos',
    maps: 'Mapas',
    waves: 'Ondas',
    enable: 'Ativar mod',
    disable: 'Desativar mod',
    edit: 'Editar mod',
    exportJson: 'Exportar JSON',
    copiedJson: 'JSON copiado',
    remove: 'Remover mod',
    confirmRemove: 'Confirmar remoção',
    cancel: 'Cancelar',
    confirmRemovePrompt: 'Remover este mod permanentemente?',
    sectionAddTowers: 'Torres personalizadas',
    sectionAddEnemies: 'Inimigos personalizados',
    sectionAddMaps: 'Mapas personalizados',
    sectionAddWaves: 'Ondas personalizadas',
    towerStatLine: 'DMG: {damage} • Alcance: {range}',
    enemyStatLine: 'HP: {hp} • Vel.: {speed}x',
    mapDifficulty: 'Dificuldade: {difficulty}',
    mapWaypointCount: '{count} waypoints',
    waveCountBadge: '{count} ondas',
    waveEnemyBadge: '{count} inimigos',
    metaGameVersion: 'Versão do jogo',
    metaCreatedAt: 'Criado',
    metaUpdatedAt: 'Atualizado',
  },
};

const MAP_SHOP = {
  'zh-TW': ZH_SHOP, 'zh-CN': ZH_SHOP, en: EN_SHOP,
  ja: { ...EN_SHOP, detailSelectHint1: '左の商品を選択', detailSelectHint2: '詳細と購入を表示' },
  ko: { ...EN_SHOP, detailSelectHint1: '왼쪽 상품 선택', detailSelectHint2: '상세 및 구매 보기' },
  de: EN_SHOP, fr: EN_SHOP, es: EN_SHOP, ru: EN_SHOP, pt: EN_SHOP,
};
const MAP_MEM = {
  'zh-TW': ZH_MEM, 'zh-CN': ZH_MEM, en: EN_MEM,
  ja: { selectHintLine1: '左の記念カードを選択', selectHintLine2: '物語を読む' },
  ko: { selectHintLine1: '왼쪽 기념 카드 선택', selectHintLine2: '이야기 읽기' },
  de: EN_MEM, fr: EN_MEM, es: EN_MEM, ru: EN_MEM, pt: EN_MEM,
};
const MAP_PATH = {
  'zh-TW': ZH_PATH, 'zh-CN': ZH_PATH, en: EN_PATH,
  ja: { ...EN_PATH, campaignProgressTitle: '戦役進捗', campaignNextLevel: '次のステージ', campaignRetryStars: '星再挑戦' },
  ko: { ...EN_PATH, campaignProgressTitle: '캠페인 진행', campaignNextLevel: '다음 스테이지', campaignRetryStars: '별 재도전' },
  de: EN_PATH, fr: EN_PATH, es: EN_PATH, ru: EN_PATH, pt: EN_PATH,
};
const MAP_BATCH = {
  'zh-TW': ZH_BATCH, 'zh-CN': ZH_BATCH, en: EN_BATCH,
  ja: JA_BATCH, ko: KO_BATCH, de: DE_BATCH, fr: FR_BATCH, es: ES_MOD_MANAGER.batch,
  ru: RU_MOD_MANAGER.batch, pt: PT_MOD_MANAGER.batch,
};

export function getBatch27Shop(loc) {
  return { ...EN_SHOP, ...MAP_SHOP[loc] };
}
export function getBatch27MemDetail(loc) {
  return { ...EN_MEM, ...MAP_MEM[loc] };
}
export function getBatch27Path(loc) {
  return { ...EN_PATH, ...MAP_PATH[loc] };
}
export function getBatch27MmBatch(loc) {
  return { ...EN_BATCH, ...MAP_BATCH[loc] };
}

export function formatBatch27ShopLines(loc) {
  const d = getBatch27Shop(loc);
  return BATCH27_SHOP_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k])},`).join('\n');
}
export function formatBatch27MemDetailLines(loc) {
  const d = getBatch27MemDetail(loc);
  return BATCH27_MEM_DETAIL_KEYS.map((k) => `      ${k}: ${JSON.stringify(d[k])},`).join('\n');
}
export function formatBatch27PathLines(loc) {
  const d = getBatch27Path(loc);
  return BATCH27_PATH_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k])},`).join('\n');
}
export function formatBatch27MmBatchLines(loc) {
  const d = getBatch27MmBatch(loc);
  return BATCH27_MM_BATCH_KEYS.map((k) => `      ${k}: ${JSON.stringify(d[k])},`).join('\n');
}

function q(s) { return JSON.stringify(s); }
function objLines(obj, indent) {
  const pad = ' '.repeat(indent);
  return Object.entries(obj).map(([k, v]) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return `${pad}${k}: {\n${objLines(v, indent + 2)}\n${pad}},`;
    }
    return `${pad}${k}: ${q(v)},`;
  }).join('\n');
}

export function formatModManagerBlockLocalized(loc, bundle) {
  return `  modManager: {\n${objLines(bundle, 4)}\n  },`;
}

export const LOCALIZED_MM = { es: ES_MOD_MANAGER, ru: RU_MOD_MANAGER, pt: PT_MOD_MANAGER };
