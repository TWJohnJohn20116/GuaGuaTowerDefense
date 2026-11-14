/**
 * TowerDetail - 塔詳情（HARDLINE）
 * 右側 336-376px 詳情欄：標題、數值格、技能、分支升級。
 * 所有數值走 mono tabular，標籤走 mono 10px。 */

import { useEffect, useState } from 'react';
import { Deck, Num, SegHead, StatCell, Chip, Btn } from '@/components/hl';
import {
  SwordIcon, TargetIcon, LightningIcon, MoneyBagIcon, ChartIcon, SparklesIcon, ThemeIcon,
} from '@/components/ui/Icons';
import TowerPreview from '@/components/ui/TowerPreview';
import TowerShootPreview from '@/components/ui/TowerShootPreview';
import { Tower3DPreview } from '@/components/ui/Model3DPreview';
import type { TowerType } from '@/types/game';
import type { UnifiedTower } from './EncyclopediaTypes';
import { getEncyclopediaTowerSpecials, getTowerRecommendedEnemies } from './EncyclopediaTypes';
import { EncyclopediaSourceLinks } from './EncyclopediaSourceLinks';
import { EncyclopediaModEditorLink } from './EncyclopediaModEditorLink';
import { EncyclopediaModWaveLink } from './EncyclopediaModWaveLink';
import { TowerSynergyList } from './TowerSynergyList';
import { TOWER_UPGRADE_BRANCHES } from '@/data/upgradeBranches';
import { useTranslation } from '@/i18n';

interface TowerDetailProps {
  selectedTower: UnifiedTower | undefined;
  allTowers: UnifiedTower[];
  compareTowers: string[];
  onToggleCompare: (id: string) => void;
  onOpenFile?: (path: string) => void;
}

const calcDps = (t: UnifiedTower) => {
  if (t.damagePerSecond) return t.damagePerSecond;
  if (t.damage && t.fireRate) return Math.round(t.damage * t.fireRate * 10) / 10;
  return t.damage || 0;
};

const panel = 'p-2.5';

export default function TowerDetail({ selectedTower, allTowers, compareTowers, onToggleCompare, onOpenFile }: TowerDetailProps) {
  const { t } = useTranslation();
  const [previewLevel, setPreviewLevel] = useState(1);

  useEffect(() => {
    setPreviewLevel(1);
  }, [selectedTower?.id]);

  if (!selectedTower) {
    return (
      <div className="flex min-h-[260px] h-full items-center justify-center px-4 text-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
          {t.encyclopedia.selectTowerHint}
        </span>
      </div>
    );
  }

  const specials = getEncyclopediaTowerSpecials(selectedTower);
  const dps = calcDps(selectedTower);
  const recommendations = getTowerRecommendedEnemies(selectedTower);
  const branches = !selectedTower.isModContent && TOWER_UPGRADE_BRANCHES[selectedTower.id as TowerType]
    ? TOWER_UPGRADE_BRANCHES[selectedTower.id as TowerType] : null;
  const isComparing = compareTowers.includes(selectedTower.id);
  const compareTargets = compareTowers.filter(id => id !== selectedTower.id).map(id => allTowers.find(t => t.id === id)).filter(Boolean) as UnifiedTower[];

  const categoryLabel =
    selectedTower.category === 'basic' ? t.encyclopedia.filterBasic
      : selectedTower.category === 'special' ? t.encyclopedia.filterSpecial
        : t.encyclopedia.filterMod;

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="flex items-start gap-3 border-b border-[var(--cn-line-soft)] pb-3">
        <Deck tone="sunken" className="flex h-14 w-14 shrink-0 items-center justify-center">
          <TowerPreview
            towerId={selectedTower.id}
            color={selectedTower.isModContent ? selectedTower.color : undefined}
            size={40}
            animate
            autoCycleLevel
          />
        </Deck>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="arc-title truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--arc-ink)]">
            {selectedTower.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-ink-3)]">
              {categoryLabel}
            </span>
            {selectedTower.isModContent && (
              <span className="border border-[var(--arc-gold-edge)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-gold)]">
                mod
              </span>
            )}
            <Chip active={isComparing} onClick={() => onToggleCompare(selectedTower.id)}>
              {isComparing ? t.encyclopedia.inCompare : t.encyclopedia.addToCompare}
            </Chip>
          </div>
        </div>
      </div>

      {selectedTower.isModContent && (
        <Deck className={`${panel} flex flex-col gap-1.5`}>
          <span className="arc-label">{t.encyclopedia.fromMod}</span>
          <span className="truncate text-[12px] text-[var(--arc-ink)]">{selectedTower.modName}</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <EncyclopediaModEditorLink modId={selectedTower.modId} contentTab="towers" itemId={selectedTower.id} />
            <EncyclopediaModWaveLink modId={selectedTower.modId} />
          </div>
        </Deck>
      )}

      <p className="text-[12px] leading-relaxed text-[var(--arc-ink-2)]">{selectedTower.description}</p>

      {/* 基本資料 */}
      <div className="flex flex-col gap-2">
        <SegHead label="stats" />
        <div className="grid grid-cols-2 gap-2">
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><SwordIcon className="h-3 w-3" />{t.encyclopedia.sortDamage}</span>}
              value={selectedTower.damage || selectedTower.damagePerSecond || 0}
              unit={selectedTower.damagePerSecond ? '/s' : undefined}
              tone="alarm"
            />
          </Deck>
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><TargetIcon className="h-3 w-3" />{t.encyclopedia.sortRange}</span>}
              value={selectedTower.range}
              tone="vital"
            />
          </Deck>
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><LightningIcon className="h-3 w-3" />{t.towers.fireRate}</span>}
              value={selectedTower.fireRate ? `${selectedTower.fireRate}x` : '—'}
              tone="caution"
            />
          </Deck>
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><MoneyBagIcon className="h-3 w-3" />{t.encyclopedia.sortCost}</span>}
              value={selectedTower.cost}
              unit="$"
              tone="signal"
            />
          </Deck>
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><ChartIcon className="h-3 w-3" />{t.encyclopedia.detailDps}</span>}
              value={dps}
              tone="reach"
            />
          </Deck>
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><SparklesIcon className="h-3 w-3" />{t.encyclopedia.detailEfficiency}</span>}
              value={Math.round((dps / selectedTower.cost) * 100)}
              unit="%/$"
              tone="muted"
            />
          </Deck>
        </div>
      </div>

      {/* 對策與協同 */}
      <div className="flex flex-col gap-2">
        <SegHead label={t.encyclopedia.detailAttackPreview} />
        <div className="flex flex-wrap gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <Chip key={level} active={previewLevel === level} onClick={() => setPreviewLevel(level)}>
              lv.{level}
            </Chip>
          ))}
        </div>
        <Deck tone="sunken" className="overflow-hidden">
          <TowerShootPreview towerId={selectedTower.id} level={previewLevel} />
        </Deck>
      </div>

      {/* 3D 預覽 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={t.encyclopedia.detail3dPreview}
          right={
            <Num
              value={t.encyclopedia.detail3dPreviewSync.replace('{level}', String(previewLevel))}
              tone="muted"
              size="sm"
              className="font-mono tabular-nums"
            />
          }
        />
        <Deck tone="sunken" className="overflow-hidden">
          <Tower3DPreview
            towerId={selectedTower.id}
            color={selectedTower.isModContent ? selectedTower.color : undefined}
            level={previewLevel}
            height={200}
          />
        </Deck>
      </div>

      {!selectedTower.isModContent && <TowerSynergyList towerType={selectedTower.id} />}

      {/* 技能與特殊效果 */}
      {(specials.flagEffects.length > 0 || specials.identities.length > 0) && (
        <div className="flex flex-col gap-2">
          <SegHead label={t.encyclopedia.detailSpecialEffects} />
          {specials.flagEffects.map((effect, index) => {
            const effectName =
              effect.key === 'splash' ? t.encyclopedia.effects.splash :
                effect.key === 'slow' ? t.encyclopedia.effects.slow :
                  effect.key === 'poison' ? t.encyclopedia.effects.poison :
                    effect.key === 'chain' ? t.encyclopedia.effects.chain :
                      effect.key === 'flame' ? t.encyclopedia.effects.flame :
                        t.encyclopedia.knockback;
            const effectValue =
              effect.valueKind === 'cells' ? `${effect.rawValue} ${t.encyclopedia.cellUnit}` :
                effect.valueKind === 'targets' ? `${effect.rawValue} ${t.encyclopedia.targetUnit}` :
                  effect.valueKind === 'percent' ? `${effect.rawValue}%` :
                    effect.valueKind === 'rate' ? `${effect.rawValue}/s` :
                      effect.valueKind === 'duration' ? t.encyclopedia.duration :
                        String(effect.rawValue);
            return (
              <div key={`flag-${effect.key}-${index}`} className="flex items-center gap-2 border-[3px] border-[var(--cn-line-soft)] px-2.5 py-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)]">
                  <ThemeIcon icon={effect.icon} className="h-3 w-3" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[11.5px] text-[var(--arc-ink-2)]">{effectName}</span>
                <Num value={effectValue} tone="ink" size="sm" className="shrink-0 font-mono font-semibold tabular-nums" />
              </div>
            );
          })}
          {specials.identities.map((pill) => (
            <div key={`identity-${pill.label}`} className="flex items-center gap-2 border-[3px] border-[var(--cn-line-soft)] px-2.5 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)]">
                <SparklesIcon className="h-3 w-3" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-[var(--arc-ink-2)]">{pill.label}</span>
              <Num value={pill.current} tone="ink" size="sm" className="shrink-0 font-mono font-semibold tabular-nums" />
            </div>
          ))}
        </div>
      )}

      {/* 分支升級 */}
      {branches && (
        <div className="flex flex-col gap-2">
          <SegHead label={t.encyclopedia.detailUpgradeRoutes} />
          {[branches.pathA, branches.pathB].map((path, i) => (
            <Deck key={i} className={`${panel} flex flex-col gap-1.5`}>
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)]">
                  <ThemeIcon icon={path.icon} className="h-3 w-3" />
                </span>
                <span className="truncate text-[12px] font-medium text-[var(--arc-ink)]">{path.name}</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-[var(--arc-ink-3)]">{path.description}</p>
              {[path.level2, path.level3].map((lv, j) => (
                <div key={j} className="flex items-start gap-2 border-t border-[var(--cn-line-soft)] pt-1.5">
                  <span className="shrink-0 border-[3px] border-[var(--cn-line-soft)] px-1 py-0.5 font-mono text-[9px] leading-none text-[var(--arc-ink-3)]">
                    lv.{j + 2}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 text-[11px] text-[var(--arc-ink-2)]">
                      <ThemeIcon icon={lv.icon} className="h-3 w-3 shrink-0" />
                      <span className="truncate">{lv.name}</span>
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-snug text-[var(--arc-ink-4)]">{lv.description}</span>
                  </span>
                </div>
              ))}
            </Deck>
          ))}
        </div>
      )}

      {/* 推薦用法 */}
      <div className="flex flex-col gap-2">
        <SegHead label={t.encyclopedia.detailRecommended} />
        {recommendations.map((rec, i) => (
          <div key={i} className="flex items-center gap-2 border-[3px] border-[var(--cn-line-soft)] px-2.5 py-2">
            <span className="shrink-0 border border-[var(--arc-vital)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-vital)]">
              {t.encyclopedia.recommendTypes[rec.typeKey]}
            </span>
            <span className="min-w-0 flex-1 text-[10.5px] leading-snug text-[var(--arc-ink-3)]">
              {t.encyclopedia.recommendReasons[rec.reasonKey]}
            </span>
          </div>
        ))}
      </div>

      {/* 對照資料 */}
      {compareTargets.length > 0 && (
        <div className="flex flex-col gap-2">
          <SegHead label={t.encyclopedia.detailCompareTable} />
          <div className="overflow-x-auto border-[3px] border-[var(--cn-line-soft)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--cn-line-soft)]">
                  <th className="px-2 py-1.5 text-left">
                    <span className="arc-label">{t.encyclopedia.detailProperty}</span>
                  </th>
                  <th className="px-2 py-1.5 text-right">
                    <span className="font-mono text-[10px] font-semibold leading-none text-[var(--arc-ink)]">{selectedTower.name}</span>
                  </th>
                  {compareTargets.map((ct) => (
                    <th key={ct.id} className="px-2 py-1.5 text-right">
                      <span className="font-mono text-[10px] leading-none text-[var(--arc-ink-2)]">{ct.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'damage', label: t.encyclopedia.sortDamage, get: (tower: UnifiedTower) => tower.damage || tower.damagePerSecond || 0 },
                  { key: 'dps', label: t.encyclopedia.detailDps, get: (tower: UnifiedTower) => calcDps(tower) },
                  { key: 'range', label: t.encyclopedia.sortRange, get: (tower: UnifiedTower) => tower.range },
                  { key: 'fireRate', label: t.towers.fireRate, get: (tower: UnifiedTower) => tower.fireRate || 0 },
                  { key: 'cost', label: t.encyclopedia.sortCost, get: (tower: UnifiedTower) => tower.cost },
                  { key: 'efficiency', label: t.encyclopedia.detailEfficiency, get: (tower: UnifiedTower) => Math.round((calcDps(tower) / tower.cost) * 100) },
                ].map(({ key, label, get }) => {
                  const vals = [get(selectedTower), ...compareTargets.map(get)];
                  const max = Math.max(...vals);
                  return (
                    <tr key={key} className="border-b border-[var(--cn-line-soft)] last:border-b-0">
                      <td className="px-2 py-1.5">
                        <span className="arc-label">{label}</span>
                      </td>
                      {vals.map((v, i) => (
                        <td key={i} className="px-2 py-1.5 text-right">
                          <Num
                            value={key === 'cost' ? `$${v}` : key === 'efficiency' ? `${v}%` : v}
                            tone={v === max ? 'signal' : 'ink'}
                            size="sm"
                            className={`font-mono tabular-nums ${v === max ? 'font-semibold' : ''}`}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => onToggleCompare(selectedTower.id)}>
            {t.encyclopedia.addToCompare}
          </Btn>
        </div>
      )}

      {onOpenFile && (
        <div className="border-t border-[var(--cn-line-soft)] pt-3">
          <EncyclopediaSourceLinks tab="towers" itemId={selectedTower.id} onOpenFile={onOpenFile} />
        </div>
      )}
    </div>
  );
}
