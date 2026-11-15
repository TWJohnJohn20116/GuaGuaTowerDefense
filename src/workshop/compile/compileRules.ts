// 規則表 → Mod 腳本的編譯器。
//
// 合併語意（規則集資產為基底、關卡 ruleOverrides 疊上去）：
// - 有 ruleId 且 rule 非 null → 取代該條
// - rule 為 null → 刪除該條
// - 沒有 ruleId → 新增
// 重複 id 只留第一條並回 duplicateRuleId。
//
// 產生程式碼只用 ModScriptCommand 真正支援的通道（addMoney／setScriptState）
// 與 runtime 真的有的 ctx（killCount／amount／enemyTypes）＋ api.state：
// enemyHealthScale／enemySpeedScale／waveRewardBonus／grantTower／runScript 一律回
// unsupportedRuleAction，不產生半殘程式碼（寧缺勿錯）。

import type { CustomScriptData, ModScriptHook, ModScriptPermission } from '@/types/modScript';
import type {
  WorkshopCompileIssue,
  WorkshopCompileWarningCode,
  WorkshopLevel,
  WorkshopRule,
  WorkshopRuleSetAsset,
  WorkshopRuleTrigger,
} from '@/types/workshop';
import { runtimeAssetId } from '@/workshop/ids';
import { readRuleOverrides } from './assetGraph';

interface RuleCompileInput {
  projectId: string;
  level: WorkshopLevel;
  /** 專案層規則集（levelRuleSet 為 null 時當基底） */
  baseRuleSet: WorkshopRuleSetAsset | null;
  /** 關卡指定規則集（優先於專案層） */
  levelRuleSet: WorkshopRuleSetAsset | null;
}

interface RuleCompileResult {
  scripts: CustomScriptData[];
  issues: WorkshopCompileIssue[];
}

/** 規則觸發點 → 腳本 hook（只用 mod-script 既有的 hook 名） */
const HOOK_BY_TRIGGER = new Map<WorkshopRuleTrigger, ModScriptHook>([
  ['waveStart', 'onWaveStart'],
  ['waveComplete', 'onWaveClear'],
  ['bossSpawn', 'onBossSpawn'],
  ['bossKilled', 'onEnemyKilled'],
  ['killCount', 'onEnemyKilled'],
  ['moneyChanged', 'onMoneyChanged'],
  ['baseDamaged', 'onTick'],
]);

function createIssue(
  code: WorkshopCompileWarningCode,
  extra: Pick<WorkshopCompileIssue, 'levelId' | 'assetId' | 'params'> = {},
): WorkshopCompileIssue {
  const issue: WorkshopCompileIssue = { code, key: `studio.compile.${code}` };
  if (extra.levelId !== undefined) issue.levelId = extra.levelId;
  if (extra.assetId !== undefined) issue.assetId = extra.assetId;
  if (extra.params !== undefined) issue.params = extra.params;
  return issue;
}

function positiveInt(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return fallback;
  return Math.max(1, Math.round(value));
}

function numericLiteral(value: number): string {
  return String(Math.round(value));
}

/** 把敘述句縮排後塞進目前區塊 */
function appendBody(lines: string[], statements: string[], spaces: number): void {
  const pad = ' '.repeat(spaces);
  for (const statement of statements) lines.push(pad + statement);
}

/**
 * 產生單一 hook 的函式。
 * 需要累計或差異比較的觸發點（killCount／moneyChanged／baseDamaged）在外層加守衛，
 * 動作敘述句放在守衛內，避免每次事件都動作。
 */
function renderRuleCode(
  hook: ModScriptHook,
  rule: WorkshopRule,
  statements: string[],
  permissions: Set<ModScriptPermission>,
): string {
  const lines: string[] = [`function ${hook}(ctx, api) {`];
  const step = positiveInt(rule.condition.threshold, 1);

  switch (rule.condition.trigger) {
    case 'killCount': {
      permissions.add('storage');
      lines.push(`  var step = ${numericLiteral(step)};`);
      lines.push("  var previous = Number(api.store.get('kills') ?? 0);");
      lines.push(
        "  var total = previous + (ctx && typeof ctx.killCount === 'number' ? ctx.killCount : 1);",
      );
      lines.push("  api.store.set('kills', total);");
      lines.push('  if (Math.floor((total - 1) / step) < Math.floor(total / step)) {');
      appendBody(lines, statements, 4);
      lines.push('  }');
      break;
    }
    case 'moneyChanged': {
      lines.push(
        "  var amount = ctx && typeof ctx.amount === 'number' ? Math.abs(ctx.amount) : 0;",
      );
      lines.push(`  if (amount >= ${numericLiteral(step)}) {`);
      appendBody(lines, statements, 4);
      lines.push('  }');
      break;
    }
    case 'baseDamaged': {
      permissions.add('storage');
      permissions.add('state.read');
      lines.push("  var previous = Number(api.store.get('baseHealth') ?? -1);");
      lines.push('  var current = api.state.health;');
      lines.push("  api.store.set('baseHealth', current);");
      lines.push(`  if (previous >= 0 && previous - current >= ${numericLiteral(step)}) {`);
      appendBody(lines, statements, 4);
      lines.push('  }');
      break;
    }
    case 'bossKilled': {
      lines.push("  var types = ctx && ctx.enemyTypes ? ctx.enemyTypes : [];");
      lines.push("  if (types.indexOf('boss') >= 0) {");
      appendBody(lines, statements, 4);
      lines.push('  }');
      break;
    }
    default: {
      appendBody(lines, statements, 2);
      break;
    }
  }

  lines.push('}');
  return lines.join('\n') + '\n';
}

/** 單條規則 → 一支腳本；無法表達的 action 回 issue 並跳過，全部被跳過就不產生腳本 */
function buildRuleScript(
  projectId: string,
  rule: WorkshopRule,
  levelId: string,
  issues: WorkshopCompileIssue[],
): CustomScriptData | null {
  const hook = HOOK_BY_TRIGGER.get(rule.condition.trigger) ?? null;
  if (!hook) {
    issues.push(
      createIssue('unsupportedRuleAction', {
        levelId,
        params: { ruleId: rule.id, action: rule.condition.trigger },
      }),
    );
    return null;
  }

  const permissions = new Set<ModScriptPermission>();
  const statements: string[] = [];

  for (const action of rule.actions ?? []) {
    if (action.kind === 'addMoney') {
      const value = typeof action.value === 'number' ? action.value : Number.NaN;
      if (!Number.isFinite(value) || Math.round(value) === 0) {
        issues.push(
          createIssue('unsupportedRuleAction', {
            levelId,
            params: { ruleId: rule.id, action: action.kind },
          }),
        );
        continue;
      }
      statements.push(`api.money.add(${numericLiteral(value)});`);
      permissions.add('economy');
      continue;
    }
    if (
      action.kind === 'runScript' &&
      typeof action.inlineCode === 'string' &&
      action.inlineCode.trim().length > 0
    ) {
      // 內嵌 JS 不可靜態分析；而且腳本之間無法互相呼叫，這裡一併跳過
      issues.push(createIssue('inlineJsNotAnalyzable', { levelId, params: { ruleId: rule.id } }));
      continue;
    }
    issues.push(
      createIssue('unsupportedRuleAction', {
        levelId,
        params: { ruleId: rule.id, action: action.kind },
      }),
    );
  }

  if (statements.length === 0) return null;

  return {
    id: runtimeAssetId(projectId, `rule.${rule.id}`),
    modId: projectId,
    name: rule.name,
    description: '',
    hooks: [hook],
    permissions: [...permissions],
    code: renderRuleCode(hook, rule, statements, permissions),
  };
}

export function compileLevelRules(input: RuleCompileInput): RuleCompileResult {
  const issues: WorkshopCompileIssue[] = [];
  const levelId = input.level.id;
  const baseAsset = input.levelRuleSet ?? input.baseRuleSet;

  const order: string[] = [];
  const rulesById = new Map<string, WorkshopRule>();

  const addRule = (rule: WorkshopRule): void => {
    if (rulesById.has(rule.id)) {
      issues.push(createIssue('duplicateRuleId', { levelId, params: { ruleId: rule.id } }));
      return;
    }
    rulesById.set(rule.id, rule);
    order.push(rule.id);
  };

  const removeRule = (ruleId: string): void => {
    if (!rulesById.has(ruleId)) return;
    rulesById.delete(ruleId);
    const index = order.indexOf(ruleId);
    if (index >= 0) order.splice(index, 1);
  };

  const replaceRule = (targetId: string, rule: WorkshopRule): void => {
    if (!rulesById.has(targetId)) {
      addRule(rule);
      return;
    }
    if (rule.id === targetId) {
      rulesById.set(targetId, rule);
      return;
    }
    // 覆寫時改了 id：舊條目退場，新條目照新增規則處理（仍要過重複 id 檢查）
    removeRule(targetId);
    addRule(rule);
  };

  if (baseAsset) {
    for (const rule of baseAsset.data.rules ?? []) addRule(rule);
  }

  for (const override of readRuleOverrides(input.level.ruleOverrides ?? [])) {
    if (override.rule === null) {
      if (override.ruleId) removeRule(override.ruleId);
      continue;
    }
    const rule = override.rule;
    if (!rule) continue;
    if (override.ruleId) replaceRule(override.ruleId, rule);
    else addRule(rule);
  }

  const scripts: CustomScriptData[] = [];
  for (const ruleId of order) {
    const rule = rulesById.get(ruleId);
    if (!rule || !rule.enabled) continue;
    const script = buildRuleScript(input.projectId, rule, levelId, issues);
    if (script) scripts.push(script);
  }

  return { scripts, issues };
}
