/**
 * 資產編輯器 — 六類資產的編輯面板
 *
 * 為什麼自己寫而不重用舊的 TowerEditor／EnemyEditor：
 * 那些是 HARDLINE（--arc-*）語彙的元件，放進奶油主題會有對比度回歸；
 * 這裡只需要「數值 + 效果開關 + 顏色」，用 --cn-* 與 hl 原語即可。
 */
import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { useWorkshopStore } from '@/store/workshopStore';
import type {
  WorkshopAsset,
  WorkshopArtData,
  WorkshopEnemyData,
  WorkshopScriptData,
  WorkshopTowerData,
} from '@/types/workshop';
import { TOWER_DATA } from '@/data/gameData';
import { MOD_SCRIPT_HOOKS, MOD_SCRIPT_PERMISSIONS } from '@/mod-script/limits';
import { Btn, Deck, Empty, Input, SegHead, Toggle } from '@/components/hl';
import { ScriptCodeEditor } from '@/components/mod-editor/ScriptCodeEditor';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';

const ABILITIES = ['none', 'flying', 'healing', 'spawning', 'shield', 'stealth', 'berserk', 'armored', 'teleport', 'miniboss', 'swarm', 'phase', 'explode', 'jam', 'escort'] as const;
const TOWER_BASE_TYPES = Object.keys(TOWER_DATA);

interface AssetEditorPanelProps {
  assetId: string;
  /** 地圖／規則集／3D 模型要回各自的頁面編輯 */
  onNavigate?: (page: 'levels' | 'rules' | 'models') => void;
}

function NumField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (next: number) => void; step?: number }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="arc-label">{label}</span>
      <Input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
        className="h-7 w-full px-1.5 font-mono text-[11.5px]"
      />
    </label>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="arc-label">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="h-7 w-full px-1.5 text-[11.5px]" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (next: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="arc-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 w-full border border-[var(--cn-line)] bg-[var(--cn-card)] px-1.5 font-mono text-[11.5px] text-[var(--cn-ink)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function AssetEditorPanel({ assetId, onNavigate }: AssetEditorPanelProps) {
  const { t } = useTranslation();
  const s = t.studio.assets.editor;
  const asset = useWorkshopStore((state) => state.assets.find((item) => item.id === assetId));
  const upsertAsset = useWorkshopStore((state) => state.upsertAsset);
  const [saved, setSaved] = useState(false);

  const write = (next: WorkshopAsset): void => {
    upsertAsset({ ...next, updatedAt: Date.now() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  const patchMeta = (patch: { name?: string; version?: string; description?: string }): void => {
    if (!asset) return;
    write({ ...asset, ...patch } as unknown as WorkshopAsset);
  };

  const patchData = (patch: Record<string, unknown>): void => {
    if (!asset) return;
    write({
      ...asset,
      data: { ...(asset.data as unknown as Record<string, unknown>), ...patch },
    } as unknown as WorkshopAsset);
  };

  const usage = useMemo(() => {
    if (!asset) return 0;
    return useWorkshopStore.getState().projects.reduce(
      (sum, project) => sum + (project.assetRefs ?? []).filter((ref) => ref.assetId === asset.id).length,
      0,
    );
  }, [asset]);

  if (!asset) return <Empty title={s.empty} />;

  const meta = (
    <div className="grid grid-cols-2 gap-2">
      <TextField label={s.name} value={asset.name} onChange={(name) => patchMeta({ name })} />
      <TextField label={s.version} value={asset.version} onChange={(version) => patchMeta({ version })} />
      <div className="col-span-2">
        <TextField label={s.description} value={asset.description ?? ''} onChange={(description) => patchMeta({ description })} />
      </div>
    </div>
  );

  const towerData = asset.kind === 'tower' ? (asset.data as WorkshopTowerData) : null;
  const enemyData = asset.kind === 'enemy' ? (asset.data as WorkshopEnemyData) : null;
  const scriptData = asset.kind === 'script' ? (asset.data as WorkshopScriptData) : null;
  const artData = asset.kind === 'art' ? (asset.data as WorkshopArtData) : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-2.5">
      <SegHead
        label={asset.name}
        right={(
          <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
            {saved ? s.saved : fillTemplate(s.usedBy, { count: String(usage) })}
          </span>
        )}
      />
      {meta}

      {towerData && (
        <>
          <SegHead label={s.towerStats} />
          <div className="grid grid-cols-2 gap-2">
            <SelectField label={s.baseType} value={towerData.baseType} options={TOWER_BASE_TYPES} onChange={(baseType) => patchData({ baseType })} />
            <NumField label={s.damage} value={towerData.damage} onChange={(damage) => patchData({ damage })} />
            <NumField label={s.range} value={towerData.range} onChange={(range) => patchData({ range })} />
            <NumField label={s.fireRate} value={towerData.fireRate ?? 1} step={0.1} onChange={(fireRate) => patchData({ fireRate })} />
            <NumField label={s.cost} value={towerData.cost} onChange={(cost) => patchData({ cost })} />
            <TextField label={s.color} value={towerData.color} onChange={(color) => patchData({ color })} />
          </div>
          <SegHead label={s.effects} />
          <div className="flex flex-col gap-1.5">
            {([
              ['splash', s.splash],
              ['slowEffect', s.slow],
              ['poisonEffect', s.poison],
              ['lightningEffect', s.chain],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between border-b border-[var(--cn-line-soft)] pb-1">
                <span className="text-[11.5px] text-[var(--cn-ink-2)]">{label}</span>
                <Toggle on={Boolean((towerData as unknown as Record<string, unknown>)[key])} onChange={(on) => patchData({ [key]: on })} />
              </div>
            ))}
            {towerData.splash && <NumField label={s.splashRadius} value={towerData.splashRadius ?? 50} onChange={(splashRadius) => patchData({ splashRadius })} />}
            {towerData.slowEffect && (
              <div className="grid grid-cols-2 gap-2">
                <NumField label={s.slowAmount} value={towerData.slowAmount ?? 0.5} step={0.05} onChange={(slowAmount) => patchData({ slowAmount })} />
                <NumField label={s.slowDuration} value={towerData.slowDuration ?? 2000} step={100} onChange={(slowDuration) => patchData({ slowDuration })} />
              </div>
            )}
            {towerData.poisonEffect && (
              <div className="grid grid-cols-2 gap-2">
                <NumField label={s.poisonDamage} value={towerData.poisonDamage ?? 5} onChange={(poisonDamage) => patchData({ poisonDamage })} />
                <NumField label={s.poisonDuration} value={towerData.poisonDuration ?? 3000} step={100} onChange={(poisonDuration) => patchData({ poisonDuration })} />
              </div>
            )}
            {towerData.lightningEffect && (
              <NumField label={s.chainCount} value={towerData.chainCount ?? 3} onChange={(chainCount) => patchData({ chainCount })} />
            )}
          </div>

          <SegHead label={s.model3d} />
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 flex-1 font-mono text-[10.5px] leading-relaxed text-[var(--cn-ink-3)]">
              {(towerData.custom3d?.parts.length ?? 0) > 0
                ? t.studio.models.partCount.replace('{count}', String(towerData.custom3d?.parts.length ?? 0))
                : s.noParts}
            </span>
            <Btn size="sm" variant="line" onClick={() => onNavigate?.('models')}>{s.gotoEdit}</Btn>
          </div>
        </>
      )}

      {enemyData && (
        <>
          <SegHead label={s.enemyStats} />
          <div className="grid grid-cols-2 gap-2">
            <SelectField label={s.baseType} value={enemyData.baseType} options={ABILITIES.length ? ['normal', 'fast', 'tank', 'boss', 'flyer', 'shield', 'healer', 'spawner', 'stealth', 'swarm', 'ghost', 'miniboss'] : ['normal']} onChange={(baseType) => patchData({ baseType })} />
            <NumField label={s.health} value={enemyData.health} onChange={(health) => patchData({ health })} />
            <NumField label={s.speed} value={enemyData.speed} step={0.1} onChange={(speed) => patchData({ speed })} />
            <NumField label={s.reward} value={enemyData.reward} onChange={(reward) => patchData({ reward })} />
            <NumField label={s.size} value={enemyData.size} onChange={(size) => patchData({ size })} />
            <TextField label={s.color} value={enemyData.color} onChange={(color) => patchData({ color })} />
            <SelectField label={s.ability} value={enemyData.ability ?? 'none'} options={ABILITIES} onChange={(ability) => patchData({ ability })} />
            <NumField label={s.armor} value={enemyData.armorValue ?? 0} onChange={(armorValue) => patchData({ armorValue })} />
            <NumField label={s.shield} value={enemyData.shieldAmount ?? 0} onChange={(shieldAmount) => patchData({ shieldAmount })} />
            <NumField label={s.slowResist} value={enemyData.slowResistance ?? 0} onChange={(slowResistance) => patchData({ slowResistance })} />
            <NumField label={s.poisonResist} value={enemyData.poisonResistance ?? 0} onChange={(poisonResistance) => patchData({ poisonResistance })} />
          </div>
        </>
      )}

      {scriptData && (
        <>
          <SegHead label={s.hooks} />
          <div className="grid grid-cols-2 gap-1">
            {MOD_SCRIPT_HOOKS.map((hook) => {
              const active = scriptData.hooks.includes(hook);
              return (
                <button
                  key={hook}
                  type="button"
                  onClick={() => patchData({ hooks: active ? scriptData.hooks.filter((item) => item !== hook) : [...scriptData.hooks, hook] })}
                  className={`border px-1.5 py-1 text-left font-mono text-[10px] ${active ? 'border-[var(--cn-signal-text)] text-[var(--cn-signal-text)]' : 'border-[var(--cn-line)] text-[var(--cn-ink-3)]'}`}
                >
                  {hook}
                </button>
              );
            })}
          </div>
          <SegHead label={s.permissions} />
          <div className="grid grid-cols-2 gap-1">
            {MOD_SCRIPT_PERMISSIONS.map((permission) => {
              const active = scriptData.permissions.includes(permission);
              return (
                <button
                  key={permission}
                  type="button"
                  onClick={() => patchData({ permissions: active ? scriptData.permissions.filter((item) => item !== permission) : [...scriptData.permissions, permission] })}
                  className={`border px-1.5 py-1 text-left font-mono text-[10px] ${active ? 'border-[var(--cn-signal-text)] text-[var(--cn-signal-text)]' : 'border-[var(--cn-line)] text-[var(--cn-ink-3)]'}`}
                >
                  {permission}
                </button>
              );
            })}
          </div>
          <SegHead label={s.code} />
          <ScriptCodeEditor
            value={scriptData.code}
            onChange={(code) => patchData({ code })}
            placeholder={s.codePlaceholder}
            hint={s.codeHint}
          />
        </>
      )}

      {artData && (
        <>
          <SegHead label={s.art} />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  patchData({ payload: reader.result, mime: file.type || 'image/png', artKind: 'icon' });
                }
              };
              reader.readAsDataURL(file);
            }}
            className="font-mono text-[10.5px] text-[var(--cn-ink-2)]"
          />
          {artData.payload && (
            <img src={artData.payload} alt={asset.name} className="max-h-40 w-auto border border-[var(--cn-line)] object-contain" />
          )}
        </>
      )}

      {(asset.kind === 'map' || asset.kind === 'ruleSet') && (
        <Deck tone="sunken" className="flex flex-col items-start gap-2 p-2 text-[11px] text-[var(--cn-ink-2)]">
          <span>{asset.kind === 'map' ? s.editInLevels : s.editInRules}</span>
          {onNavigate && (
            <Btn
              size="sm"
              variant="line"
              onClick={() => onNavigate(asset.kind === 'map' ? 'levels' : 'rules')}
            >
              {s.gotoEdit}
            </Btn>
          )}
        </Deck>
      )}

      <div className="mt-auto flex justify-end">
        <Btn size="sm" variant="line" onClick={() => write(asset)}>{s.save}</Btn>
      </div>
    </div>
  );
}
