type DevSearchTab = 'state' | 'tools' | 'combat' | 'visual' | 'info';

interface DevSearchEntry {
  title: string;
  keywords?: string[];
}

const DEV_TAB_ORDER: DevSearchTab[] = ['state', 'tools', 'combat', 'visual', 'info'];

/** 與各 DevSection 的 title / keywords 對齊，供跨分頁搜尋跳轉。 */
export const DEV_TAB_SEARCH_ENTRIES: Record<DevSearchTab, DevSearchEntry[]> = {
  state: [
    { title: '金錢', keywords: ['money', 'gold', 'cash', 'coin', '金錢', '錢'] },
    { title: '生命', keywords: ['health', 'hp', 'life', '生命', '血量'] },
    { title: '分數', keywords: ['score', 'point', '分數', '積分'] },
    { title: '波次', keywords: ['wave', 'round', 'next', 'skip', '波次', '波', '回合'] },
    { title: '地圖', keywords: ['map', 'path', 'route', '地圖', '路徑'] },
    { title: '無盡', keywords: ['endless', 'infinite', 'survival', '無盡', '無限'] },
    { title: '難度', keywords: ['difficulty', 'easy', 'hard', 'nightmare', '難度', '簡單', '困難'] },
    { title: '預覽', keywords: ['preview', 'wave', 'enemy', 'next', '預覽', '波次', '敵人'] },
  ],
  tools: [
    { title: '快捷預設', keywords: ['preset', 'cheat', 'quick', '預設', '作弊', '快捷'] },
    { title: '遊戲速度', keywords: ['speed', 'fast', 'slow', '速度', '倍速'] },
    { title: '流程控制', keywords: ['pause', 'resume', 'reset', 'menu', '暫停', '重置', '返回', '繼續'] },
    { title: '場景測試', keywords: ['scene', 'test', 'preview', '場景', '測試', '預覽'] },
    { title: 'Overlay 測試', keywords: ['overlay', 'victory', 'gameover', 'win', 'lose', '勝利', '失敗'] },
    { title: '工坊', keywords: ['mod', 'workshop', 'editor', 'test', '工坊', '編輯器'] },
    { title: '狀態快照', keywords: ['snapshot', 'save', 'load', '快照', '儲存', '載入'] },
    { title: '匯出狀態', keywords: ['export', 'json', 'copy', 'clipboard', '匯出', '複製', '剪貼'] },
    { title: '天賦控制', keywords: ['talent', 'tree', 'skill', '天賦', '技能'] },
    { title: '商店金幣', keywords: ['shop', 'coin', 'gold', 'currency', '商店', '金幣'] },
    { title: '持久化資料', keywords: ['unlock', 'persistence', 'localstorage', 'tower', '解鎖', '塔', '存檔'] },
    { title: '場景快速跳轉', keywords: ['scene', 'jump', 'goto', '場景', '跳轉', '切換'] },
    { title: '存檔操作', keywords: ['save', 'storage', 'export', 'clear', '存檔', '匯出', '清除'] },
  ],
  combat: [
    { title: '生成敵人', keywords: ['enemy', 'spawn', 'monster', '敵人', '生成', '怪物'] },
    { title: '敵人', keywords: ['enemy', 'damage', 'kill', 'speed', '敵人', '消滅', '速度'] },
    { title: '生成塔', keywords: ['tower', 'spawn', 'build', '塔', '生成', '建造'] },
    { title: '升級塔', keywords: ['tower', 'upgrade', 'level', 'max', 'sell', '塔', '升級', '滿級'] },
    { title: '自動戰鬥', keywords: ['ai', 'auto', 'bot', 'robot', 'strategy', '自動', 'AI', '策略'] },
    { title: '作弊', keywords: ['cheat', 'god', 'infinite', '作弊', '無敵', '無限', '上帝'] },
  ],
  visual: [
    { title: '除錯疊圖', keywords: ['debug', 'fps', 'hitbox', 'overlay', '除錯', '幀率', '碰撞'] },
    { title: '網格與路徑', keywords: ['grid', 'path', 'map', '網格', '路徑', '地圖'] },
    { title: '效能監視', keywords: ['perf', 'performance', 'monitor', '效能', '監視'] },
  ],
  info: [
    { title: '場景狀態', keywords: ['scene', 'state', 'flow', 'speed', 'difficulty', '場景', '狀態'] },
    { title: '資源', keywords: ['resource', 'money', 'health', 'score', '資源', '金錢', '生命'] },
    { title: '波次', keywords: ['wave', 'active', '波次'] },
    { title: '實體計數', keywords: ['entity', 'count', 'enemy', 'tower', 'projectile', '實體', '計數', '數量'] },
    { title: '計時', keywords: ['timer', 'time', 'duration', '計時', '時長', '計時器'] },
    { title: '效能', keywords: ['perf', 'performance', 'fps', '效能', '幀率'] },
    { title: '即時效能', keywords: ['perf', 'fps', 'frame', '效能', '幀率', '取樣'] },
    { title: '塔分布', keywords: ['tower', 'distribution', 'stats', '塔', '分布', '統計'] },
  ],
};

const normalize = (s: string | undefined | null) => String(s ?? '').toLowerCase().replace(/\s+/g, '');

export function sectionMatches(title: string, keywords: string[] | undefined, query: string): boolean {
  if (!query.trim()) return true;
  const q = normalize(query);
  if (!q) return true;
  if (normalize(title).includes(q)) return true;
  if (!keywords || keywords.length === 0) return false;
  return keywords.some((kw) => normalize(kw).includes(q));
}

export function tabHasMatch(
  tab: DevSearchTab,
  query: string,
  catalog: Record<DevSearchTab, DevSearchEntry[]>,
): boolean {
  return (catalog[tab] || []).some((entry) => sectionMatches(entry.title, entry.keywords, query));
}

export function pickDevTabForQuery(
  query: string,
  current: DevSearchTab,
  catalog: Record<DevSearchTab, DevSearchEntry[]> = DEV_TAB_SEARCH_ENTRIES,
): DevSearchTab {
  if (!query.trim() || tabHasMatch(current, query, catalog)) return current;
  return DEV_TAB_ORDER.find((tab) => tabHasMatch(tab, query, catalog)) ?? current;
}
