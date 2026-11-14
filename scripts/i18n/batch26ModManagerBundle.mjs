/** batch26：modManager 完整區塊（9 語系 locale 注入） */
import { getBatch25MmDetail } from './batch25Extras.mjs';

const DETAIL_BASE = {
  selectHintLine1: 'Select a mod card on the left',
  selectHintLine2: 'to view details and actions',
  enabled: 'Enabled',
  disabled: 'Disabled',
  contentStats: 'Content stats',
  towers: 'Towers',
  enemies: 'Enemies',
  maps: 'Maps',
  waves: 'Waves',
  enable: 'Enable mod',
  disable: 'Disable mod',
  edit: 'Edit mod',
  exportJson: 'Export JSON',
  copiedJson: 'JSON copied',
  remove: 'Remove mod',
  confirmRemove: 'Confirm remove',
  cancel: 'Cancel',
  confirmRemovePrompt: 'Permanently remove this mod?',
};

const EN = {
  title: 'Mod Manager',
  subtitle: 'Manage and configure your game mods',
  importSuccess: 'Mod imported successfully!',
  importFailed: 'Import failed',
  toolbar: {
    searchPlaceholder: 'Search mod name, author, or tags…',
    importMod: 'Import mod',
    filterAll: 'All',
    filterEnabled: 'Enabled',
    filterDisabled: 'Disabled',
    sortLabel: 'Sort',
    sortAsc: 'Ascending',
    sortDesc: 'Descending',
    sortName: 'Name',
    sortScore: 'Score',
    sortType: 'Type',
    sortEnabled: 'Enabled',
    sortUpdated: 'Updated',
    clearSearch: 'Clear search',
    filterTags: 'Tags',
    tagAll: 'All tags',
  },
  grid: {
    emptyNone: 'No mods installed yet',
    emptyFilter: 'No mods match filters',
    importFirst: 'Import your first mod',
    clearFilters: 'Clear filters',
  },
  detail: { ...DETAIL_BASE },
};

const ZH_TW = {
  title: 'Mod 管理器',
  subtitle: '管理和配置你的遊戲模組',
  importSuccess: 'Mod 匯入成功！',
  importFailed: '匯入失敗',
  toolbar: {
    searchPlaceholder: '搜尋 Mod 名稱、作者或標籤…',
    importMod: '匯入 Mod',
    filterAll: '全部',
    filterEnabled: '已啟用',
    filterDisabled: '已停用',
    sortLabel: '排序',
    sortAsc: '升序',
    sortDesc: '降序',
    sortName: '名稱',
    sortScore: '評分',
    sortType: '類型',
    sortEnabled: '啟用',
    sortUpdated: '更新',
    clearSearch: '清除搜尋',
    filterTags: '標籤',
    tagAll: '全部標籤',
  },
  grid: {
    emptyNone: '尚未安裝任何 Mod',
    emptyFilter: '沒有符合條件的 Mod',
    importFirst: '匯入第一個 Mod',
    clearFilters: '清除篩選',
  },
  detail: {
    selectHintLine1: '點選左側 Mod 卡',
    selectHintLine2: '查看詳情與操作',
    enabled: '已啟用',
    disabled: '已停用',
    contentStats: '內容統計',
    towers: '防禦塔',
    enemies: '敵人',
    maps: '地圖',
    waves: '波次',
    enable: '啟用 Mod',
    disable: '停用 Mod',
    edit: '編輯 Mod',
    exportJson: '匯出 JSON',
    copiedJson: '已複製 JSON',
    remove: '移除 Mod',
    confirmRemove: '確認移除',
    cancel: '取消',
    confirmRemovePrompt: '確定要永久移除此 Mod 嗎？',
  },
};

const ZH_CN = {
  ...ZH_TW,
  subtitle: '管理和配置你的游戏模组',
  importSuccess: 'Mod 导入成功！',
  importFailed: '导入失败',
  toolbar: {
    ...ZH_TW.toolbar,
    searchPlaceholder: '搜索 Mod 名称、作者或标签…',
    importMod: '导入 Mod',
    filterEnabled: '已启用',
    filterDisabled: '已禁用',
    clearSearch: '清除搜索',
    tagAll: '全部标签',
  },
  grid: {
    emptyNone: '尚未安装任何 Mod',
    emptyFilter: '没有符合条件的 Mod',
    importFirst: '导入第一个 Mod',
    clearFilters: '清除筛选',
  },
  detail: {
    ...ZH_TW.detail,
    enabled: '已启用',
    disabled: '已禁用',
    enable: '启用 Mod',
    disable: '停用 Mod',
    confirmRemovePrompt: '确定要永久移除此 Mod 吗？',
  },
};

const JA = {
  ...EN,
  title: 'Mod マネージャー',
  subtitle: 'ゲーム Mod の管理と設定',
  importSuccess: 'Mod をインポートしました！',
  importFailed: 'インポート失敗',
  toolbar: {
    ...EN.toolbar,
    searchPlaceholder: 'Mod 名・作者・タグを検索…',
    importMod: 'Mod をインポート',
    filterEnabled: '有効',
    filterDisabled: '無効',
    sortAsc: '昇順',
    sortDesc: '降順',
    sortName: '名前',
    sortScore: 'スコア',
    sortType: '種類',
    sortEnabled: '有効',
    sortUpdated: '更新',
    clearSearch: '検索をクリア',
    filterTags: 'タグ',
    tagAll: 'すべてのタグ',
  },
  grid: {
    emptyNone: 'インストール済み Mod なし',
    emptyFilter: '条件に合う Mod なし',
    importFirst: '最初の Mod をインポート',
    clearFilters: 'フィルタをクリア',
  },
  detail: {
    ...DETAIL_BASE,
    selectHintLine1: '左の Mod カードを選択',
    selectHintLine2: '詳細と操作を表示',
    enabled: '有効',
    disabled: '無効',
    contentStats: 'コンテンツ統計',
    towers: 'タワー',
    enemies: '敵',
    maps: 'マップ',
    waves: 'ウェーブ',
    enable: 'Mod を有効化',
    disable: 'Mod を無効化',
    edit: 'Mod を編集',
    exportJson: 'JSON をエクスポート',
    copiedJson: 'JSON をコピーしました',
    remove: 'Mod を削除',
    confirmRemove: '削除を確認',
    cancel: 'キャンセル',
    confirmRemovePrompt: 'この Mod を完全に削除しますか？',
  },
};

const KO = {
  ...EN,
  title: 'Mod 관리자',
  subtitle: '게임 Mod 관리 및 설정',
  importSuccess: 'Mod 가져오기 성공!',
  importFailed: '가져오기 실패',
  toolbar: {
    ...EN.toolbar,
    searchPlaceholder: 'Mod 이름·작성자·태그 검색…',
    importMod: 'Mod 가져오기',
    filterEnabled: '활성',
    filterDisabled: '비활성',
    sortAsc: '오름차순',
    sortDesc: '내림차순',
    sortName: '이름',
    sortScore: '점수',
    sortType: '유형',
    sortEnabled: '활성',
    sortUpdated: '업데이트',
    clearSearch: '검색 지우기',
    filterTags: '태그',
    tagAll: '모든 태그',
  },
  grid: {
    emptyNone: '설치된 Mod 없음',
    emptyFilter: '조건에 맞는 Mod 없음',
    importFirst: '첫 Mod 가져오기',
    clearFilters: '필터 지우기',
  },
  detail: {
    ...DETAIL_BASE,
    selectHintLine1: '왼쪽 Mod 카드 선택',
    selectHintLine2: '상세 및 작업 보기',
    enabled: '활성',
    disabled: '비활성',
    contentStats: '콘텐츠 통계',
    towers: '타워',
    enemies: '적',
    maps: '맵',
    waves: '웨이브',
    enable: 'Mod 활성화',
    disable: 'Mod 비활성화',
    edit: 'Mod 편집',
    exportJson: 'JSON보내기',
    copiedJson: 'JSON 복사됨',
    remove: 'Mod 제거',
    confirmRemove: '제거 확인',
    cancel: '취소',
    confirmRemovePrompt: '이 Mod를 영구 삭제할까요?',
  },
};

const DE = {
  ...EN,
  title: 'Mod-Manager',
  subtitle: 'Spiel-Mods verwalten und konfigurieren',
  importSuccess: 'Mod erfolgreich importiert!',
  importFailed: 'Import fehlgeschlagen',
  toolbar: {
    ...EN.toolbar,
    searchPlaceholder: 'Mod-Name, Autor oder Tags suchen…',
    importMod: 'Mod importieren',
    filterAll: 'Alle',
    filterEnabled: 'Aktiv',
    filterDisabled: 'Inaktiv',
    sortLabel: 'Sortieren',
    sortAsc: 'Aufsteigend',
    sortDesc: 'Absteigend',
    sortName: 'Name',
    sortScore: 'Bewertung',
    sortType: 'Typ',
    sortEnabled: 'Aktiv',
    sortUpdated: 'Aktualisiert',
    clearSearch: 'Suche löschen',
    filterTags: 'Tags',
    tagAll: 'Alle Tags',
  },
  grid: {
    emptyNone: 'Noch keine Mods installiert',
    emptyFilter: 'Keine Mods entsprechen den Filtern',
    importFirst: 'Ersten Mod importieren',
    clearFilters: 'Filter löschen',
  },
  detail: {
    ...DETAIL_BASE,
    selectHintLine1: 'Mod-Karte links wählen',
    selectHintLine2: 'Details und Aktionen anzeigen',
    enabled: 'Aktiv',
    disabled: 'Inaktiv',
    contentStats: 'Inhaltsstatistik',
    towers: 'Türme',
    enemies: 'Gegner',
    maps: 'Karten',
    waves: 'Wellen',
    enable: 'Mod aktivieren',
    disable: 'Mod deaktivieren',
    edit: 'Mod bearbeiten',
    exportJson: 'JSON exportieren',
    copiedJson: 'JSON kopiert',
    remove: 'Mod entfernen',
    confirmRemove: 'Entfernen bestätigen',
    cancel: 'Abbrechen',
    confirmRemovePrompt: 'Diesen Mod dauerhaft entfernen?',
  },
};

const FR = {
  ...EN,
  title: 'Gestionnaire de Mods',
  subtitle: 'Gérer et configurer vos mods',
  importSuccess: 'Mod importé avec succès !',
  importFailed: 'Échec de l\'import',
  toolbar: {
    ...EN.toolbar,
    searchPlaceholder: 'Rechercher nom, auteur ou tags…',
    importMod: 'Importer un mod',
    filterEnabled: 'Activés',
    filterDisabled: 'Désactivés',
    sortLabel: 'Tri',
    sortAsc: 'Croissant',
    sortDesc: 'Décroissant',
    sortName: 'Nom',
    sortScore: 'Score',
    sortType: 'Type',
    sortEnabled: 'Activé',
    sortUpdated: 'Mis à jour',
    clearSearch: 'Effacer recherche',
    filterTags: 'Tags',
    tagAll: 'Tous les tags',
  },
  grid: {
    emptyNone: 'Aucun mod installé',
    emptyFilter: 'Aucun mod ne correspond',
    importFirst: 'Importer votre premier mod',
    clearFilters: 'Effacer les filtres',
  },
  detail: {
    ...DETAIL_BASE,
    selectHintLine1: 'Sélectionnez une carte mod à gauche',
    selectHintLine2: 'pour voir détails et actions',
    enabled: 'Activé',
    disabled: 'Désactivé',
    contentStats: 'Statistiques',
    towers: 'Tours',
    enemies: 'Ennemis',
    maps: 'Cartes',
    waves: 'Vagues',
    enable: 'Activer le mod',
    disable: 'Désactiver le mod',
    edit: 'Modifier le mod',
    exportJson: 'Exporter JSON',
    copiedJson: 'JSON copié',
    remove: 'Supprimer le mod',
    confirmRemove: 'Confirmer suppression',
    cancel: 'Annuler',
    confirmRemovePrompt: 'Supprimer définitivement ce mod ?',
  },
};

const ES = { ...EN };
const RU = { ...EN };
const PT = { ...EN };

const MAP = {
  'zh-TW': ZH_TW, 'zh-CN': ZH_CN, en: EN, ja: JA, ko: KO, de: DE, fr: FR, es: ES, ru: RU, pt: PT,
};

function q(s) {
  return JSON.stringify(s);
}

export function getModManagerBundle(loc) {
  const base = MAP[loc] ?? EN;
  const extra = getBatch25MmDetail(loc);
  return {
    ...base,
    detail: { ...base.detail, ...extra },
  };
}

function objLines(obj, indent) {
  const pad = ' '.repeat(indent);
  return Object.entries(obj)
    .map(([k, v]) => {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return `${pad}${k}: {\n${objLines(v, indent + 2)}\n${pad}},`;
      }
      return `${pad}${k}: ${q(v)},`;
    })
    .join('\n');
}

export function formatModManagerBlock(loc) {
  const b = getModManagerBundle(loc);
  return `  modManager: {\n${objLines(b, 4)}\n  },`;
}
