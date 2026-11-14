/**
 * Mod 內容驗證（編輯器 / 匯入 / Store 共用）
 */
import type { Mod, ModValidationResult, ModValidationFlag } from '@/types/game';
import type { Translations } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { ENEMY_DATA } from '@/data/gameData';

const BOSS_TYPES = new Set(['boss', 'miniboss']);

type ValM = Translations['modEditorExt'];

const ZH_FALLBACK: Partial<ValM> = {
  valMissingModId: '缺少 Mod ID',
  valMissingModName: '缺少 Mod 名稱',
  valMissingVersion: '缺少版本號',
  valVersionFormat: '版本號「{version}」建議使用 x.y.z 格式',
  valMissingAuthor: '缺少作者資訊',
  valNoContent: 'Mod 沒有任何內容',
  valIdConflict: 'Mod ID「{id}」與已安裝 Mod 衝突',
  valDupId: '{label} ID 重複：「{id}」（第 {first} 與 {second} 項）',
  valDupName: '{label}名稱重複：「{name}」（第 {first} 與 {second} 項）',
  valLabelTower: '防禦塔',
  valLabelEnemy: '敵人',
  valLabelMap: '地圖',
  valLabelWaveSet: '波次組',
  valTowerMissingId: '塔 #{index} 缺少 ID',
  valTowerMissingName: '塔 #{index} 缺少名稱',
  valTowerZeroDamage: '塔「{name}」傷害為 0',
  valTowerHighDamage: '塔「{name}」傷害偏高（>{max}）',
  valTowerNoCost: '塔「{name}」未設定價格',
  valTowerHighCost: '塔「{name}」價格偏高',
  valTowerRange: '塔「{name}」射程建議 10–500',
  valEnemyMissingId: '敵人 #{index} 缺少 ID',
  valEnemyMissingName: '敵人 #{index} 缺少名稱',
  valEnemyZeroHp: '敵人「{name}」生命值必須大於 0',
  valEnemyHighHp: '敵人「{name}」生命值偏高',
  valEnemySpeed: '敵人「{name}」速度建議 0.1–20',
  valMapMissingId: '地圖 #{index} 缺少 ID',
  valMapMissingName: '地圖 #{index} 缺少名稱',
  valMapWaypoints: '地圖「{name}」需要至少 2 個路徑點',
  valMapBlockOverlap: '地圖「{name}」障礙格子與路徑重疊',
  valWaveSetMissingId: '波次組 #{index} 缺少 ID',
  valWaveSetMissingName: '波次組 #{index} 缺少名稱',
  valWaveSetNoWaves: '波次組「{name}」需要至少 1 個波次',
  valWaveNoEnemies: '波次組「{name}」第 {wave} 波無敵人',
  valWaveUnknownEnemy: '波次組「{name}」第 {wave} 波第 {group} 組：未知敵人類型「{type}」（非內建且非自訂敵人 ID）',
  valWaveCustomEnemy: '波次組「{name}」第 {wave} 波使用自訂敵人「{type}」',
  valWaveEnemyCount: '波次組「{name}」第 {wave} 波敵人數量須大於 0',
  valErrorsPrefix: '錯誤：',
  valWarningsPrefix: '警告：',
};

function v(m: ValM | undefined, key: keyof ValM): string {
  const raw = m?.[key] ?? ZH_FALLBACK[key];
  return typeof raw === 'string' ? raw : String(raw ?? '');
}

function findDuplicateIds(
  items: { id: string; name?: string }[],
  label: string,
  m?: ValM,
): string[] {
  const seen = new Map<string, number>();
  const errors: string[] = [];
  items.forEach((item, i) => {
    if (!item.id) return;
    if (seen.has(item.id)) {
      errors.push(fillTemplate(v(m, 'valDupId'), {
        label,
        id: item.id,
        first: String(seen.get(item.id)! + 1),
        second: String(i + 1),
      }));
    } else {
      seen.set(item.id, i);
    }
  });
  return errors;
}

interface ValidateModOptions {
  installedModIds?: string[];
  editingModId?: string | null;
}

function findDuplicateNames(
  items: { name?: string }[],
  label: string,
  m?: ValM,
): string[] {
  const seen = new Map<string, number>();
  const warnings: string[] = [];
  items.forEach((item, i) => {
    const name = item.name?.trim();
    if (!name) return;
    if (seen.has(name)) {
      warnings.push(fillTemplate(v(m, 'valDupName'), {
        label,
        name,
        first: String(seen.get(name)! + 1),
        second: String(i + 1),
      }));
    } else {
      seen.set(name, i);
    }
  });
  return warnings;
}

function isValidVersion(ver: string): boolean {
  return /^\d+\.\d+(\.\d+)?$/.test(ver.trim());
}

function resolveEnemyType(type: string, enemyIds: Set<string>): boolean {
  if (ENEMY_DATA[type as keyof typeof ENEMY_DATA]) return true;
  return enemyIds.has(type);
}

export function validateModContent(
  mod: Mod,
  options: ValidateModOptions = {},
  m?: ValM,
): ModValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const flags: ModValidationFlag[] = [];
  const { installedModIds = [], editingModId = null } = options;

  const pushError = (msg: string, flag?: Omit<ModValidationFlag, 'level'>) => {
    errors.push(msg);
    if (flag) flags.push({ ...flag, level: 'error' });
  };
  const pushWarning = (msg: string, flag?: Omit<ModValidationFlag, 'level'>) => {
    warnings.push(msg);
    if (flag) flags.push({ ...flag, level: 'warning' });
  };

  if (!mod.metadata?.id) pushError(v(m, 'valMissingModId'), { tab: 'settings' });
  if (!mod.metadata?.name) pushError(v(m, 'valMissingModName'), { tab: 'settings' });
  if (!mod.metadata?.version) pushError(v(m, 'valMissingVersion'), { tab: 'settings' });
  else if (!isValidVersion(mod.metadata.version)) {
    pushWarning(fillTemplate(v(m, 'valVersionFormat'), { version: mod.metadata.version }), { tab: 'settings' });
  }
  if (!mod.metadata?.author) pushError(v(m, 'valMissingAuthor'), { tab: 'settings' });

  const hasContent =
    (mod.content.towers?.length ?? 0) > 0 ||
    (mod.content.enemies?.length ?? 0) > 0 ||
    (mod.content.maps?.length ?? 0) > 0 ||
    (mod.content.waves?.length ?? 0) > 0;
  if (!hasContent) pushError(v(m, 'valNoContent'), { tab: 'settings' });

  if (
    mod.metadata?.id &&
    installedModIds.includes(mod.metadata.id) &&
    mod.metadata.id !== editingModId
  ) {
    pushError(fillTemplate(v(m, 'valIdConflict'), { id: mod.metadata.id }), { tab: 'settings' });
  }

  const towers = mod.content.towers ?? [];
  const enemies = mod.content.enemies ?? [];
  const maps = mod.content.maps ?? [];
  const waveSets = mod.content.waves ?? [];

  const lblTower = v(m, 'valLabelTower');
  const lblEnemy = v(m, 'valLabelEnemy');
  const lblMap = v(m, 'valLabelMap');
  const lblWaveSet = v(m, 'valLabelWaveSet');

  errors.push(...findDuplicateIds(towers, lblTower, m));
  errors.push(...findDuplicateIds(enemies, lblEnemy, m));
  errors.push(...findDuplicateIds(maps, lblMap, m));
  errors.push(...findDuplicateIds(waveSets, lblWaveSet, m));

  warnings.push(...findDuplicateNames(towers, lblTower, m));
  warnings.push(...findDuplicateNames(enemies, lblEnemy, m));

  const enemyIds = new Set(enemies.map((e) => e.id));

  towers.forEach((tower, i) => {
    const name = tower.name || String(i + 1);
    const tabFlag = { tab: 'towers' as const, index: i };
    if (!tower.id) pushError(fillTemplate(v(m, 'valTowerMissingId'), { index: String(i + 1) }), tabFlag);
    if (!tower.name) pushError(fillTemplate(v(m, 'valTowerMissingName'), { index: String(i + 1) }), tabFlag);
    if (tower.damage <= 0 && !tower.damagePerSecond) {
      pushWarning(fillTemplate(v(m, 'valTowerZeroDamage'), { name }), tabFlag);
    }
    if (tower.damage > 9999) {
      pushWarning(fillTemplate(v(m, 'valTowerHighDamage'), { name, max: '9999' }), tabFlag);
    }
    if (tower.cost <= 0) pushWarning(fillTemplate(v(m, 'valTowerNoCost'), { name }), tabFlag);
    if (tower.cost > 99999) pushWarning(fillTemplate(v(m, 'valTowerHighCost'), { name }), tabFlag);
    if (tower.range < 10 || tower.range > 500) {
      pushWarning(fillTemplate(v(m, 'valTowerRange'), { name }), tabFlag);
    }
  });

  enemies.forEach((enemy, i) => {
    const name = enemy.name || String(i + 1);
    const tabFlag = { tab: 'enemies' as const, index: i };
    if (!enemy.id) pushError(fillTemplate(v(m, 'valEnemyMissingId'), { index: String(i + 1) }), tabFlag);
    if (!enemy.name) pushError(fillTemplate(v(m, 'valEnemyMissingName'), { index: String(i + 1) }), tabFlag);
    if (enemy.health <= 0) pushError(fillTemplate(v(m, 'valEnemyZeroHp'), { name }), tabFlag);
    if (enemy.health > 999999) pushWarning(fillTemplate(v(m, 'valEnemyHighHp'), { name }), tabFlag);
    if (enemy.speed < 0.1 || enemy.speed > 20) {
      pushWarning(fillTemplate(v(m, 'valEnemySpeed'), { name }), tabFlag);
    }
  });

  maps.forEach((map, i) => {
    const name = map.name || String(i + 1);
    const tabFlag = { tab: 'maps' as const, index: i };
    if (!map.id) pushError(fillTemplate(v(m, 'valMapMissingId'), { index: String(i + 1) }), tabFlag);
    if (!map.name) pushError(fillTemplate(v(m, 'valMapMissingName'), { index: String(i + 1) }), tabFlag);
    if (!map.waypoints || map.waypoints.length < 2) {
      pushError(fillTemplate(v(m, 'valMapWaypoints'), { name }), tabFlag);
    }
    const blocked = map.blockedCells ?? [];
    if (blocked.length > 0 && map.waypoints.length > 0) {
      const onPath = blocked.some((cell) =>
        map.waypoints.some((wp) => wp.col === cell.col && wp.row === cell.row),
      );
      if (onPath) pushWarning(fillTemplate(v(m, 'valMapBlockOverlap'), { name }), tabFlag);
    }
  });

  waveSets.forEach((waveSet, i) => {
    const wsName = waveSet.name || String(i + 1);
    const tabFlag = { tab: 'waves' as const, index: i };
    if (!waveSet.id) pushError(fillTemplate(v(m, 'valWaveSetMissingId'), { index: String(i + 1) }), tabFlag);
    if (!waveSet.name) pushError(fillTemplate(v(m, 'valWaveSetMissingName'), { index: String(i + 1) }), tabFlag);
    if (!waveSet.waves?.length) {
      pushError(fillTemplate(v(m, 'valWaveSetNoWaves'), { name: wsName }), tabFlag);
      return;
    }
    waveSet.waves.forEach((wave, wi) => {
      const waveNum = String(wi + 1);
      if (!wave.enemies?.length) {
        pushWarning(fillTemplate(v(m, 'valWaveNoEnemies'), { name: wsName, wave: waveNum }), tabFlag);
        return;
      }
      wave.enemies.forEach((eg, gi) => {
        if (!resolveEnemyType(eg.type, enemyIds)) {
          pushError(fillTemplate(v(m, 'valWaveUnknownEnemy'), {
            name: wsName, wave: waveNum, group: String(gi + 1), type: eg.type,
          }), tabFlag);
        } else if (!ENEMY_DATA[eg.type as keyof typeof ENEMY_DATA]) {
          pushWarning(fillTemplate(v(m, 'valWaveCustomEnemy'), {
            name: wsName, wave: waveNum, type: eg.type,
          }), tabFlag);
        }
        if (eg.count <= 0) {
          pushError(fillTemplate(v(m, 'valWaveEnemyCount'), { name: wsName, wave: waveNum }), tabFlag);
        }
      });
    });
  });

  return { valid: errors.length === 0, errors, warnings, flags };
}

export function formatValidationMessage(result: ModValidationResult, m?: ValM): string {
  const parts: string[] = [];
  if (result.errors.length) {
    parts.push(`${v(m, 'valErrorsPrefix')}${result.errors.join('；')}`);
  }
  if (result.warnings.length) {
    parts.push(`${v(m, 'valWarningsPrefix')}${result.warnings.join('；')}`);
  }
  return parts.join('\n');
}

export function isBossEnemyType(type: string): boolean {
  return BOSS_TYPES.has(type);
}

export function enemyTypeColor(type: string): string {
  const data = ENEMY_DATA[type as keyof typeof ENEMY_DATA];
  return data?.color ?? '#94a3b8';
}
