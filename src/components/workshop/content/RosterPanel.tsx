/**
 * 內容頁 · 陣容面板
 *
 * 左半是官方資料（TOWER_DATA / ENEMY_DATA，唯讀），右半是專案資產庫裡的塔與敵人。
 * 敵人可以被「加入引用」（在目前選取的波次尾端多一組）或「移除引用」（把這一關
 * 所有同型方塊清掉）；塔目前只讀——波次格式（WaveConfig）只描述敵人。
 * 被波次引用、但官方與專案資產都找不到的型別會標成「缺資產」。
 */
import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Btn, Empty, IconBtn, Num, SegHead, Toggle } from '@/components/hl';
import { PlusIcon, TrashIcon, WarningIcon } from '@/components/ui/Icons';
import { ENEMY_DATA, TOWER_DATA } from '@/data/gameData';
import { enemyLabel } from '@/workshop/content/timeline';

export interface RosterAsset {
  id: string;
  name: string;
}

interface RosterPanelProps {
  enemyAssets: RosterAsset[];
  towerAssets: RosterAsset[];
  /** 這一關每種敵人類型被引用幾組 */
  references: Readonly<Record<string, number>>;
  onAddEnemy: (type: string) => void;
  onRemoveEnemy: (type: string) => void;
  className?: string;
}

export function RosterPanel({
  enemyAssets,
  towerAssets,
  references,
  onAddEnemy,
  onRemoveEnemy,
  className = '',
}: RosterPanelProps) {
  const { t } = useTranslation();
  const c = t.studio.content;
  const assets = t.studio.assets;
  const [onlyReferenced, setOnlyReferenced] = useState(false);

  const customNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const asset of enemyAssets) names[asset.id] = asset.name;
    return names;
  }, [enemyAssets]);

  const officialEnemies = useMemo(
    () =>
      Object.entries(ENEMY_DATA)
        .filter((entry) => Boolean(entry[1]))
        .map(([type, data]) => ({
          type,
          health: data?.health ?? 0,
          reward: data?.reward ?? 0,
        })),
    [],
  );

  const projectEnemies = enemyAssets.map((asset) => ({
    type: asset.id,
    label: asset.name,
    references: references[asset.id] ?? 0,
  }));

  const missingTypes = useMemo(
    () =>
      Object.keys(references).filter(
        (type) => !ENEMY_DATA[type] && !enemyAssets.some((asset) => asset.id === type),
      ),
    [references, enemyAssets],
  );

  const officialTowers = useMemo(
    () =>
      Object.entries(TOWER_DATA).map(([type, data]) => ({
        type,
        label: data.name,
        cost: data.cost,
        damage: data.damage,
      })),
    [],
  );

  const visibleOfficial = onlyReferenced
    ? officialEnemies.filter((enemy) => (references[enemy.type] ?? 0) > 0)
    : officialEnemies;

  return (
    <div className={`flex min-h-0 flex-col gap-2 ${className}`}>
      <SegHead
        label={c.roster}
        right={
          <label className="flex items-center gap-1.5">
            <span className="arc-label">{c.onlyReferenced}</span>
            <Toggle on={onlyReferenced} onChange={setOnlyReferenced} label={c.onlyReferenced} />
          </label>
        }
      />

      {missingTypes.length > 0 && (
        <ul className="flex flex-col gap-1">
          {missingTypes.map((type) => (
            <li
              key={type}
              className="flex items-center gap-1.5 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-alert)] bg-[var(--cn-card)] px-2 py-1"
            >
              <WarningIcon className="h-3.5 w-3.5 shrink-0 text-[var(--cn-alert-deep)]" />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--cn-ink)]">{type}</span>
              <span className="arc-label text-[var(--cn-alert-deep)]">{c.missingAsset}</span>
              <Btn
                size="sm"
                variant="ghost"
                icon={<TrashIcon className="h-3.5 w-3.5" />}
                onClick={() => onRemoveEnemy(type)}
                aria-label={c.removeReference}
                title={c.removeReference}
              />
            </li>
          ))}
        </ul>
      )}

      {/* 面板固定 380px 寬，兩欄會把敵人名壓成一個字（實測 21px）→ 一律單欄 */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="arc-label">{assets.official}</span>
            <Num value={String(visibleOfficial.length)} size="sm" tone="muted" />
          </div>
          {visibleOfficial.length === 0 ? (
            <Empty title={c.noReferencedEnemies} />
          ) : (
            visibleOfficial.map((enemy) => {
              const count = references[enemy.type] ?? 0;
              return (
                <div
                  key={enemy.type}
                  className="flex items-center gap-1.5 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2 py-1"
                >
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[var(--cn-ink)]">
                    {enemyLabel(enemy.type, customNames)}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
                    {c.hp} <Num value={String(enemy.health)} size="sm" tone="muted" />
                  </span>
                  <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
                    {fillTemplate(c.references, { count: String(count) })}
                  </span>
                  <IconBtn
                    label={count > 0 ? c.removeReference : c.addReference}
                    title={count > 0 ? c.removeReference : c.addReference}
                    className={count > 0 ? 'h-6 w-6 shrink-0' : 'h-6 w-6 shrink-0 border border-[var(--cn-line)]'}
                    onClick={() => (count > 0 ? onRemoveEnemy(enemy.type) : onAddEnemy(enemy.type))}
                  >
                    {count > 0 ? <TrashIcon className="h-3.5 w-3.5" /> : <PlusIcon className="h-3.5 w-3.5" />}
                  </IconBtn>
                </div>
              );
            })
          )}

          <div className="mt-1 flex items-center justify-between">
            <span className="arc-label">{c.projectAssets}</span>
            <Num value={String(projectEnemies.length)} size="sm" tone="muted" />
          </div>
          {projectEnemies.length === 0 ? (
            <p className="arc-label text-[var(--cn-ink-3)]">{assets.empty}</p>
          ) : (
            projectEnemies.map((enemy) => {
              const count = enemy.references;
              return (
                <div
                  key={enemy.type}
                  className="flex items-center gap-1.5 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2 py-1"
                >
                  <span className="arc-label text-[var(--cn-reach-text)]">{assets.custom}</span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[var(--cn-ink)]">
                    {enemy.label}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
                    {fillTemplate(c.references, { count: String(count) })}
                  </span>
                  <IconBtn
                    label={count > 0 ? c.removeReference : c.addReference}
                    title={count > 0 ? c.removeReference : c.addReference}
                    className={count > 0 ? 'h-6 w-6 shrink-0' : 'h-6 w-6 shrink-0 border border-[var(--cn-line)]'}
                    onClick={() => (count > 0 ? onRemoveEnemy(enemy.type) : onAddEnemy(enemy.type))}
                  >
                    {count > 0 ? <TrashIcon className="h-3.5 w-3.5" /> : <PlusIcon className="h-3.5 w-3.5" />}
                  </IconBtn>
                </div>
              );
            })
          )}
        </section>

        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="arc-label">{assets.towers}</span>
            <Num value={String(officialTowers.length)} size="sm" tone="muted" />
          </div>
          {officialTowers.map((tower) => (
            <div
              key={tower.type}
              className="flex items-center gap-1.5 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2 py-1"
            >
              <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[var(--cn-ink)]">
                {tower.label}
              </span>
              <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
                {c.damage} <Num value={String(tower.damage)} size="sm" tone="muted" />
              </span>
              <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
                {c.cost} <Num value={String(tower.cost)} size="sm" tone="muted" />
              </span>
            </div>
          ))}

          <div className="mt-1 flex items-center justify-between">
            <span className="arc-label">{c.projectAssets}</span>
            <Num value={String(towerAssets.length)} size="sm" tone="muted" />
          </div>
          {towerAssets.length === 0 ? (
            <p className="arc-label text-[var(--cn-ink-3)]">{assets.empty}</p>
          ) : (
            towerAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center gap-1.5 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2 py-1"
              >
                <span className="arc-label text-[var(--cn-reach-text)]">{assets.custom}</span>
                <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[var(--cn-ink)]">
                  {asset.name}
                </span>
              </div>
            ))
          )}
          <p className="arc-label mt-1 text-[var(--cn-ink-3)]">{c.towerReadonlyHint}</p>
        </section>
      </div>
    </div>
  );
}
