/**
 * 將巢狀物件序列化為 locale TS 片段（使用 JSON.stringify 避免引號問題）
 */

function serializeValue(value, indent) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const inner = value.map((item) => {
      if (typeof item === 'string') return JSON.stringify(item);
      if (typeof item === 'object' && item !== null) {
        return serializeObject(item, indent + 2, true);
      }
      return JSON.stringify(item);
    });
    if (value.every((v) => typeof v === 'string')) {
      return `[${inner.join(', ')}]`;
    }
    const pad = ' '.repeat(indent + 2);
    return `[\n${inner.map((l) => `${pad}${l},`).join('\n')}\n${' '.repeat(indent)}]`;
  }
  if (typeof value === 'object') {
    return serializeObject(value, indent, true);
  }
  return JSON.stringify(value);
}

export function serializeObject(obj, baseIndent = 4, nested = false) {
  const pad = ' '.repeat(baseIndent);
  const innerPad = ' '.repeat(baseIndent + 2);
  const lines = Object.entries(obj).map(([key, val]) => {
    const serialized = serializeValue(val, baseIndent + 2);
    return `${innerPad}${key}: ${serialized},`;
  });
  if (nested) {
    return `{\n${lines.join('\n')}\n${pad}}`;
  }
  return `{\n${lines.join('\n')}\n${pad}}`;
}

/** 產生 `key: { ... },` 區塊（含縮排） */
export function block(key, obj, indent = 4) {
  const pad = ' '.repeat(indent);
  const body = serializeObject(obj, indent + 2);
  const innerLines = body.split('\n').slice(1, -1);
  return `${pad}${key}: {\n${innerLines.join('\n')}\n${pad}},`;
}

/** 產生 tutorial 子區塊（6 空格縮排） */
export function tutorialBlock(key, obj) {
  return block(key, obj, 4);
}
