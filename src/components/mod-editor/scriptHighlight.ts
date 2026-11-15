/**
 * 腳本語法高亮與自動完成（純函式，無外部依賴）
 *
 * 為什麼自己寫：專案規則是「新增 npm 依賴前先問」，而這裡只需要
 * 把一段 JS 切成 token 上色 + 一份 API 清單，用不到整包編輯器。
 */
export type ScriptTokenKind = 'comment' | 'string' | 'number' | 'keyword' | 'api' | 'func' | 'plain';

export interface ScriptToken {
  text: string;
  kind: ScriptTokenKind;
}

const KEYWORDS = new Set([
  'function', 'return', 'if', 'else', 'for', 'while', 'do', 'const', 'let', 'var',
  'typeof', 'new', 'true', 'false', 'null', 'undefined', 'break', 'continue',
  'switch', 'case', 'default', 'throw', 'try', 'catch', 'finally', 'of', 'in',
]);

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

/** 把原始碼切成「上色用」的 token（串接後必須等於原文） */
export function tokenizeScript(code: string): ScriptToken[] {
  const tokens: ScriptToken[] = [];
  let lastIndex = 0;
  TOKEN_RE.lastIndex = 0;
  let match = TOKEN_RE.exec(code);
  while (match !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: code.slice(lastIndex, match.index), kind: 'plain' });
    }
    const [raw, comment, str, num, ident] = match;
    if (comment) {
      tokens.push({ text: raw, kind: 'comment' });
    } else if (str) {
      tokens.push({ text: raw, kind: 'string' });
    } else if (num) {
      tokens.push({ text: raw, kind: 'number' });
    } else if (ident) {
      const prev = tokens.length > 0 ? tokens[tokens.length - 1] : null;
      const prevPrev = tokens.length > 1 ? tokens[tokens.length - 2] : null;
      if (KEYWORDS.has(ident)) {
        tokens.push({ text: raw, kind: 'keyword' });
      } else if (ident === 'api') {
        tokens.push({ text: raw, kind: 'api' });
      } else if (prev?.text === '.' && prevPrev?.kind === 'api') {
        tokens.push({ text: raw, kind: 'api' });
      } else if (prev?.kind === 'keyword' && prev.text === 'function') {
        tokens.push({ text: raw, kind: 'func' });
      } else {
        tokens.push({ text: raw, kind: 'plain' });
      }
    } else {
      tokens.push({ text: raw, kind: 'plain' });
    }
    lastIndex = match.index + raw.length;
    match = TOKEN_RE.exec(code);
  }
  if (lastIndex < code.length) {
    tokens.push({ text: code.slice(lastIndex), kind: 'plain' });
  }
  return tokens;
}

/** token 種類 → HARDLINE 色票 */
export const SCRIPT_TOKEN_CLASS: Record<ScriptTokenKind, string> = {
  // 一律用「淺底可讀」的 text token：arc-* 是深色介面色，放在奶油底只有 2.49:1
  comment: 'text-[var(--cn-ink-3)]',
  string: 'text-[var(--cn-vital-text)]',
  number: 'text-[var(--cn-caution-text)]',
  keyword: 'text-[var(--cn-reach-text)]',
  api: 'text-[var(--cn-signal-text)]',
  func: 'text-[var(--cn-ink)] font-semibold',
  plain: 'text-[var(--cn-ink-2)]',
};

export interface ScriptApiEntry {
  /** 顯示名稱（同時是過濾關鍵字） */
  label: string;
  /** 插入的程式碼 */
  insert: string;
  /** 需要勾選的權限（null = 免權限） */
  permission: string | null;
}

/** 自動完成清單：只列文件上真正存在的入口 */
export const SCRIPT_API_ENTRIES: ScriptApiEntry[] = [
  { label: 'api.log', insert: "api.log('訊息')", permission: 'log' },
  { label: 'api.state', insert: 'api.state.wave', permission: 'state.read' },
  { label: 'api.state.enemiesByType', insert: 'api.state.enemiesByType.tank || 0', permission: 'state.read' },
  { label: 'api.money.add', insert: 'api.money.add(50)', permission: 'economy' },
  { label: 'api.base.heal', insert: 'api.base.heal(1)', permission: 'base.health' },
  { label: 'api.base.damage', insert: 'api.base.damage(1)', permission: 'base.health' },
  { label: 'api.spawn.enemy', insert: "api.spawn.enemy('tank', 3, 400)", permission: 'enemy.spawn' },
  { label: 'api.status.apply', insert: "api.status.apply('slow', 2000, 0.5)", permission: 'enemy.modify' },
  { label: 'api.store.get', insert: "api.store.get('key')", permission: 'storage' },
  { label: 'api.store.set', insert: "api.store.set('key', 1)", permission: 'storage' },
  { label: 'api.rng', insert: 'api.rng()', permission: null },
  { label: 'api.rngInt', insert: 'api.rngInt(1, 6)', permission: null },
  { label: 'api.chance', insert: 'api.chance(0.5)', permission: null },
  { label: 'api.pick', insert: 'api.pick([1, 2, 3])', permission: null },
  { label: 'ctx.wave', insert: 'ctx.wave', permission: null },
  { label: 'ctx.killCount', insert: 'ctx.killCount || 0', permission: null },
  { label: 'ctx.towerType', insert: "ctx.towerType === 'frost'", permission: null },
  { label: 'ctx.enemyTypes', insert: 'ctx.enemyTypes || []', permission: null },
  { label: 'ctx.amount', insert: 'ctx.amount || 0', permission: null },
];

/** 依輸入前綴過濾自動完成（不分大小寫，空字串回全部） */
export function matchApiEntries(prefix: string): ScriptApiEntry[] {
  const needle = prefix.trim().toLowerCase();
  if (!needle) return SCRIPT_API_ENTRIES;
  return SCRIPT_API_ENTRIES.filter((entry) => entry.label.toLowerCase().includes(needle));
}

/** 找出游標所在的那個單字（自動完成用） */
export function wordAtCursor(code: string, cursor: number): { word: string; start: number } {
  let start = cursor;
  while (start > 0 && /[\w$.]/.test(code[start - 1])) start -= 1;
  return { word: code.slice(start, cursor), start };
}
