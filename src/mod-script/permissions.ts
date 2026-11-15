/**
 * 權限與指令對照（純函式）
 *
 * 三個問題都在這裡回答：這條指令要什麼權限、這段程式碼用了哪些 API、缺哪個權限。
 */
import type { ModScriptCommand, ModScriptPermission } from '@/types/modScript';

const COMMAND_PERMISSION: Record<ModScriptCommand['kind'], ModScriptPermission> = {
  log: 'log',
  addMoney: 'economy',
  healBase: 'base.health',
  damageBase: 'base.health',
  spawnEnemy: 'enemy.spawn',
  applyStatus: 'enemy.modify',
};

export function requiredPermission(kind: ModScriptCommand['kind']): ModScriptPermission {
  return COMMAND_PERMISSION[kind];
}

function hasPermission(
  permissions: readonly ModScriptPermission[],
  needed: ModScriptPermission,
): boolean {
  return permissions.includes(needed);
}

export function canRunCommand(
  permissions: readonly ModScriptPermission[],
  command: ModScriptCommand,
): boolean {
  return hasPermission(permissions, requiredPermission(command.kind));
}

interface ApiUsageRule {
  pattern: RegExp;
  permission: ModScriptPermission;
}

/** 靜態掃描：只認得 api.xxx 這幾種寫法，掃不到不代表不會用（只是少一個提示） */
const API_USAGE_RULES: ApiUsageRule[] = [
  { pattern: /api\s*\.\s*money\s*\./, permission: 'economy' },
  { pattern: /api\s*\.\s*base\s*\./, permission: 'base.health' },
  { pattern: /api\s*\.\s*spawn\s*\./, permission: 'enemy.spawn' },
  { pattern: /api\s*\.\s*status\s*\./, permission: 'enemy.modify' },
  { pattern: /api\s*\.\s*log\s*\(/, permission: 'log' },
  { pattern: /api\s*\.\s*state\b/, permission: 'state.read' },
];

/** 由程式碼推測需要的權限（順序固定，方便 UI 與測試比對） */
function scanApiUsage(code: string): ModScriptPermission[] {
  const found: ModScriptPermission[] = [];
  for (const rule of API_USAGE_RULES) {
    if (rule.pattern.test(code) && !found.includes(rule.permission)) {
      found.push(rule.permission);
    }
  }
  return found;
}

/** 程式碼有使用但沒勾選的權限 */
export function missingPermissions(
  code: string,
  permissions: readonly ModScriptPermission[],
): ModScriptPermission[] {
  return scanApiUsage(code).filter((permission) => !permissions.includes(permission));
}
