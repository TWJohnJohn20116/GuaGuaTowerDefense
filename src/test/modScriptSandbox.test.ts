import { describe, expect, it } from 'vitest';
import { checkScriptSyntax, compileScriptHandlers, createSandboxApi, runScriptHook } from '@/mod-script/sandbox';
import type {
  ModScriptCommand,
  ModScriptEventDetail,
  ModScriptPermission,
  ModScriptStateSnapshot,
} from '@/types/modScript';

const snapshot: ModScriptStateSnapshot = {
  scene: 'game',
  wave: 3,
  maxWaves: 20,
  endless: false,
  money: 500,
  health: 10,
  towerCount: 4,
  enemyCount: 6,
  enemiesByType: { tank: 2, normal: 4 },
  towerTypes: ['basic', 'frost'],
  difficulty: 'normal',
  pathName: 'ch1_lv1',
  elapsedMs: 1000,
  score: 0,
  kills: 0,
  leaks: 0,
  towerLevelSum: 0,
  bossHealth: 0,
  scriptState: {},
};

const ctx: ModScriptEventDetail = { hook: 'onWaveStart', wave: 3 };

function run(
  code: string,
  permissions: ModScriptPermission[],
  hook: ModScriptEventDetail['hook'] = 'onWaveStart',
) {
  const commands: ModScriptCommand[] = [];
  const warnings: string[] = [];
  const handlers = compileScriptHandlers(code);
  const api = createSandboxApi({
    permissions,
    snapshot,
    seed: 42,
    emit: (command) => {
      commands.push(command);
      return true;
    },
    warn: (text) => warnings.push(text),
  });
  const error = runScriptHook(handlers, hook, { ...ctx, hook }, api);
  return { commands, warnings, error };
}

describe('mod script sandbox', () => {
  it('只有宣告的 hook 會被編譯進來', () => {
    const handlers = compileScriptHandlers('function onWaveStart() {}');
    expect(typeof handlers.onWaveStart).toBe('function');
    expect(handlers.onTick).toBeUndefined();
  });

  it('有 economy 權限時才產生 addMoney 指令', () => {
    const code = 'function onWaveStart(ctx, api) { api.money.add(50); }';
    const allowed = run(code, ['economy']);
    expect(allowed.commands).toEqual([{ kind: 'addMoney', amount: 50 }]);
    expect(allowed.warnings).toEqual([]);

    const denied = run(code, ['log']);
    expect(denied.commands).toEqual([]);
    expect(denied.warnings[0]).toContain('economy');
  });

  it('金額與生成數量都被夾在上限內', () => {
    const code =
      'function onWaveStart(ctx, api) { api.money.add(99999999); api.spawn.enemy("tank", 999, -5); }';
    const { commands } = run(code, ['economy', 'enemy.spawn']);
    expect(commands[0]).toEqual({ kind: 'addMoney', amount: 100000 });
    expect(commands[1]).toEqual({ kind: 'spawnEnemy', enemyType: 'tank', count: 20, intervalMs: 0 });
  });

  it('單次事件超過指令上限就停止收指令', () => {
    const code = 'function onWaveStart(ctx, api) { for (let i = 0; i < 200; i += 1) api.log("x"); }';
    const { commands } = run(code, ['log']);
    expect(commands).toHaveLength(64);
  });

  it('腳本拋錯時回傳錯誤訊息而不是讓派發爆掉', () => {
    const { error, commands } = run('function onWaveStart() { throw new Error("boom"); }', ['log']);
    expect(error).toBe('boom');
    expect(commands).toEqual([]);
  });

  it('沒有對應權限時讀不到狀態以外的東西（狀態是唯讀快照）', () => {
    const code = 'function onWaveStart(ctx, api) { api.log(String(api.state.money)); }';
    const { commands } = run(code, ['log']);
    expect(commands[0]).toEqual({ kind: 'log', level: 'info', message: '500' });
  });

  it('語法檢查只編譯不執行', () => {
    expect(checkScriptSyntax('function onTick() {}')).toBeNull();
    expect(checkScriptSyntax('function onTick( {')).not.toBeNull();
  });
});
