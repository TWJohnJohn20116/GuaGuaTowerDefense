/** 將 plain object 格式化成 TypeScript 物件字面量字串 */
export function formatTsObject(obj, indent = 4) {
  const sp = ' '.repeat(indent);
  const lines = [];
  for (const [key, value] of Object.entries(obj)) {
    lines.push(`${sp}${/^[a-zA-Z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)}: ${formatTsValue(value, indent + 2)},`);
  }
  return lines.join('\n');
}

function formatTsValue(value, indent) {
  if (value === null || value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.every((v) => typeof v === 'string')) {
      return `[\n${' '.repeat(indent)}${value.map((v) => JSON.stringify(v)).join(`,\n${' '.repeat(indent)}`)}\n${' '.repeat(indent - 2)}]`;
    }
    return `[${value.map((v) => formatTsValue(v, indent)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const inner = formatTsObject(value, indent);
    return `{\n${inner}\n${' '.repeat(indent - 2)}}`;
  }
  return JSON.stringify(value);
}
