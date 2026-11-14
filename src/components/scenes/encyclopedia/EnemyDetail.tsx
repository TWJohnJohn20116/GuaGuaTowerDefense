/**
 * 圖鑑 · 敵人詳情（HARDLINE 詳情欄）
 *
 * 336–376px 單欄：標籤 mono 10px、數值 mono tabular、間隔只有 1px 線。
 */
import { Deck, Num, SegHead, StatCell, Segments } from '@/components/hl';
import {
  HeartIcon, MoneyBagIcon, AlienIcon, ClipboardIcon, WarningIcon, LightningIcon,
  CrosshairIcon, TowerIcon, BoxIcon,
} from '@/components/ui/Icons';
import EnemyPreview from '@/components/ui/EnemyPreview';
import EnemyActionPreview from '@/components/ui/EnemyActionPreview';
import { Enemy3DPreview } from '@/components/ui/Model3DPreview';
import type { UnifiedEnemy } from './EncyclopediaTypes';
import { getEnemyCounterTowers, getAbilityKey } from './EncyclopediaTypes';
import { EncyclopediaSourceLinks } from './EncyclopediaSourceLinks';
import { EncyclopediaModEditorLink } from './EncyclopediaModEditorLink';
import { EncyclopediaModWaveLink } from './EncyclopediaModWaveLink';
import { EncyclopediaWaveModLink } from './EncyclopediaWaveModLink';
import { findEnemyWaveAppearance } from './encyclopediaWaveLookup';
import { useModStore } from '@/store/modStore';
import { useTranslation } from '@/i18n';

interface EnemyDetailProps {
  selectedEnemy: UnifiedEnemy | undefined;
  onOpenFile?: (path: string) => void;
}

const panel = 'p-2.5';

export default function EnemyDetail({ selectedEnemy, onOpenFile }: EnemyDetailProps) {
  const { t } = useTranslation();
  const mods = useModStore((s) => s.mods);

  if (!selectedEnemy) {
    return (
      <div className="flex min-h-[260px] h-full items-center justify-center px-4 text-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
          {t.encyclopedia.selectEnemyHint}
        </span>
      </div>
    );
  }

  const counters = getEnemyCounterTowers(selectedEnemy);
  const waveAppearance = findEnemyWaveAppearance(selectedEnemy.id, selectedEnemy.modId, mods);
  const firstWave = waveAppearance?.waveNumber ?? null;
  const threatLevel = Math.min(5, Math.ceil(selectedEnemy.health / 100 + selectedEnemy.speed));

  const categoryLabel =
    selectedEnemy.category === 'normal' ? t.encyclopedia.filterNormal
      : selectedEnemy.category === 'special' ? t.encyclopedia.filterSpecial
        : t.encyclopedia.filterMod;

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="flex items-start gap-3 border-b border-[var(--cn-line-soft)] pb-3">
        <Deck tone="sunken" className="flex h-14 w-14 shrink-0 items-center justify-center">
          <EnemyPreview enemyId={selectedEnemy.id} color={selectedEnemy.color} size={40} animate />
        </Deck>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="arc-title truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--arc-ink)]">
            {selectedEnemy.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-ink-3)]">
              {categoryLabel}
            </span>
            {selectedEnemy.isModContent && (
              <span className="border border-[var(--arc-gold-edge)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-gold)]">
                mod
              </span>
            )}
          </div>
        </div>
      </div>

      {selectedEnemy.isModContent && (
        <Deck className={`${panel} flex flex-col gap-1.5`}>
          <span className="arc-label">{t.encyclopedia.fromMod}</span>
          <span className="truncate text-[12px] text-[var(--arc-ink)]">{selectedEnemy.modName}</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <EncyclopediaModEditorLink modId={selectedEnemy.modId} contentTab="enemies" itemId={selectedEnemy.id} />
            <EncyclopediaModWaveLink modId={selectedEnemy.modId} />
          </div>
        </Deck>
      )}

      <p className="text-[12px] leading-relaxed text-[var(--arc-ink-2)]">{selectedEnemy.description}</p>

      {/* 數值 */}
      <div className="flex flex-col gap-2">
        <SegHead label="stats" />
        <div className="grid grid-cols-2 gap-2">
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><HeartIcon className="h-3 w-3" />{t.encyclopedia.detailHealth}</span>}
              value={selectedEnemy.health}
              tone="alarm"
            />
          </Deck>
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><LightningIcon className="h-3 w-3" />{t.encyclopedia.detailMoveSpeed}</span>}
              value={`${selectedEnemy.speed}x`}
              tone="reach"
            />
          </Deck>
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><MoneyBagIcon className="h-3 w-3" />{t.encyclopedia.detailKillReward}</span>}
              value={selectedEnemy.reward}
              unit="$"
              tone="signal"
            />
          </Deck>
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><CrosshairIcon className="h-3 w-3" />{t.encyclopedia.detailBodySize}</span>}
              value={selectedEnemy.size}
              unit="px"
              tone="vital"
            />
          </Deck>
        </div>
      </div>

      {/* 行為預覽 */}
      <div className="flex flex-col gap-2">
        <SegHead label={t.encyclopedia.detailActionPreview} />
        <Deck tone="sunken" className="overflow-hidden">
          <EnemyActionPreview enemyId={selectedEnemy.id} />
        </Deck>
      </div>

      {/* 3D 預覽 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={t.encyclopedia.detail3dPreview}
          right={<span className="font-mono text-[9.5px] text-[var(--arc-ink-4)]">{t.encyclopedia.detail3dEnemyDrag}</span>}
        />
        <Deck tone="sunken" className="overflow-hidden">
          <Enemy3DPreview color={selectedEnemy.color} sizePx={selectedEnemy.size} height={190} />
        </Deck>
      </div>

      {/* 首次出現 / 威脅等級 */}
      <div className="flex flex-col gap-2">
        {firstWave && (
          <Deck className={`${panel} flex items-center gap-2`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)]">
              <ClipboardIcon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="arc-label">{t.encyclopedia.detailFirstAppearance}</span>
              <Num value={t.encyclopedia.detailWaveLabel.replace('{n}', String(firstWave))} tone="ink" size="sm" className="mt-0.5 block" />
            </div>
            {waveAppearance && <EncyclopediaWaveModLink appearance={waveAppearance} />}
          </Deck>
        )}
        <Deck className={`${panel} flex items-center gap-2`}>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-caution)]">
            <WarningIcon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="arc-label">{t.encyclopedia.detailThreatLevel}</span>
            <div className="mt-1">
              <Segments total={5} filled={threatLevel} tone="caution" size="sm" />
            </div>
          </div>
          <Num value={`${threatLevel}/5`} tone="caution" size="sm" />
        </Deck>
      </div>

      {/* 特殊能力 */}
      {selectedEnemy.ability && (
        <div className="flex flex-col gap-2">
          <SegHead label={t.encyclopedia.detailSpecialAbility} />
          <Deck tone="sunken" className="flex items-start gap-2 px-2.5 py-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-gold)]">
              <AlienIcon className="h-3 w-3" />
            </span>
            <p className="min-w-0 flex-1 text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">
              {(() => {
                const k = getAbilityKey(selectedEnemy.ability);
                return k ? t.encyclopedia.abilities[k] : selectedEnemy.ability;
              })()}
            </p>
          </Deck>
        </div>
      )}

      {/* 推薦克制塔 */}
      <div className="flex flex-col gap-2">
        <SegHead label={t.encyclopedia.detailRecommendedCounters} />
        {counters.map((c, i) => (
          <div key={i} className="flex items-center gap-2 border-[3px] border-[var(--cn-line-soft)] px-2.5 py-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-reach)]">
              <TowerIcon className="h-3 w-3" />
            </span>
            <span className="shrink-0 border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-ink-2)]">
              {t.towers.types[c.towerKey]}
            </span>
            <span className="min-w-0 flex-1 text-[10.5px] leading-snug text-[var(--arc-ink-3)]">
              {t.encyclopedia.counterReasons[c.reasonKey]}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-t border-[var(--cn-line-soft)] pt-2 text-[var(--arc-ink-4)]">
        <BoxIcon className="h-3 w-3" />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.08em]">3d</span>
      </div>

      {onOpenFile && (
        <div className="border-t border-[var(--cn-line-soft)] pt-3">
          <EncyclopediaSourceLinks tab="enemies" itemId={selectedEnemy.id} onOpenFile={onOpenFile} />
        </div>
      )}
    </div>
  );
}
