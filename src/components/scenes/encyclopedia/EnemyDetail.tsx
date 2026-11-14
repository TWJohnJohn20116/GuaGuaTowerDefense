/**
 * 圖鑑 · 敵人詳情（HARDLINE 詳情欄）
 *
 * 336–376px 單欄：標籤 mono 10px、數值 mono tabular、間隔只有 1px 線。
 */
import { SegHead, StatCell, Segments } from '@/components/hl';
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

const panel = 'border border-[var(--hl-line)] bg-[var(--hl-deck)] p-2.5';

export default function EnemyDetail({ selectedEnemy, onOpenFile }: EnemyDetailProps) {
  const { t } = useTranslation();
  const mods = useModStore((s) => s.mods);

  if (!selectedEnemy) {
    return (
      <div className="flex min-h-[260px] h-full items-center justify-center px-4 text-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
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
      <div className="flex items-start gap-3 border-b border-[var(--hl-line)] pb-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
          <EnemyPreview enemyId={selectedEnemy.id} color={selectedEnemy.color} size={40} animate />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
            {selectedEnemy.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--hl-ink-3)]">
              {categoryLabel}
            </span>
            {selectedEnemy.isModContent && (
              <span className="border border-[var(--hl-signal-edge)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--hl-signal)]">
                mod
              </span>
            )}
          </div>
        </div>
      </div>

      {selectedEnemy.isModContent && (
        <div className={`${panel} flex flex-col gap-1.5`}>
          <span className="hl-label">{t.encyclopedia.fromMod}</span>
          <span className="truncate text-[12px] text-[var(--hl-ink)]">{selectedEnemy.modName}</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <EncyclopediaModEditorLink modId={selectedEnemy.modId} contentTab="enemies" itemId={selectedEnemy.id} />
            <EncyclopediaModWaveLink modId={selectedEnemy.modId} />
          </div>
        </div>
      )}

      <p className="text-[12px] leading-relaxed text-[var(--hl-ink-2)]">{selectedEnemy.description}</p>

      {/* 數值 */}
      <div className="flex flex-col gap-2">
        <SegHead label="stats" />
        <div className="grid grid-cols-2 gap-2">
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><HeartIcon className="h-3 w-3" />{t.encyclopedia.detailHealth}</span>}
              value={selectedEnemy.health}
              tone="alarm"
            />
          </div>
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><LightningIcon className="h-3 w-3" />{t.encyclopedia.detailMoveSpeed}</span>}
              value={`${selectedEnemy.speed}x`}
              tone="reach"
            />
          </div>
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><MoneyBagIcon className="h-3 w-3" />{t.encyclopedia.detailKillReward}</span>}
              value={selectedEnemy.reward}
              unit="$"
              tone="signal"
            />
          </div>
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><CrosshairIcon className="h-3 w-3" />{t.encyclopedia.detailBodySize}</span>}
              value={selectedEnemy.size}
              unit="px"
              tone="vital"
            />
          </div>
        </div>
      </div>

      {/* 行為預覽 */}
      <div className="flex flex-col gap-2">
        <SegHead label={t.encyclopedia.detailActionPreview} />
        <div className="overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
          <EnemyActionPreview enemyId={selectedEnemy.id} />
        </div>
      </div>

      {/* 3D 預覽 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={t.encyclopedia.detail3dPreview}
          right={<span className="font-mono text-[9.5px] text-[var(--hl-ink-4)]">{t.encyclopedia.detail3dEnemyDrag}</span>}
        />
        <div className="overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
          <Enemy3DPreview color={selectedEnemy.color} sizePx={selectedEnemy.size} height={190} />
        </div>
      </div>

      {/* 首次出現 / 威脅等級 */}
      <div className="flex flex-col gap-2">
        {firstWave && (
          <div className={`${panel} flex items-center gap-2`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-3)]">
              <ClipboardIcon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="hl-label">{t.encyclopedia.detailFirstAppearance}</span>
              <div className="mt-0.5 font-mono text-[12px] font-semibold tabular-nums text-[var(--hl-ink)]">
                {t.encyclopedia.detailWaveLabel.replace('{n}', String(firstWave))}
              </div>
            </div>
            {waveAppearance && <EncyclopediaWaveModLink appearance={waveAppearance} />}
          </div>
        )}
        <div className={`${panel} flex items-center gap-2`}>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-caution)]">
            <WarningIcon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="hl-label">{t.encyclopedia.detailThreatLevel}</span>
            <div className="mt-1">
              <Segments total={5} filled={threatLevel} tone="caution" size="sm" />
            </div>
          </div>
          <span className="font-mono text-[12px] font-semibold tabular-nums text-[var(--hl-caution)]">
            {threatLevel}/5
          </span>
        </div>
      </div>

      {/* 特殊能力 */}
      {selectedEnemy.ability && (
        <div className="flex flex-col gap-2">
          <SegHead label={t.encyclopedia.detailSpecialAbility} />
          <div className="flex items-start gap-2 border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2.5 py-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-signal)]">
              <AlienIcon className="h-3 w-3" />
            </span>
            <p className="min-w-0 flex-1 text-[11.5px] leading-relaxed text-[var(--hl-ink-2)]">
              {(() => {
                const k = getAbilityKey(selectedEnemy.ability);
                return k ? t.encyclopedia.abilities[k] : selectedEnemy.ability;
              })()}
            </p>
          </div>
        </div>
      )}

      {/* 推薦克制塔 */}
      <div className="flex flex-col gap-2">
        <SegHead label={t.encyclopedia.detailRecommendedCounters} />
        {counters.map((c, i) => (
          <div key={i} className="flex items-center gap-2 border border-[var(--hl-line)] px-2.5 py-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-reach)]">
              <TowerIcon className="h-3 w-3" />
            </span>
            <span className="shrink-0 border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--hl-ink-2)]">
              {t.towers.types[c.towerKey]}
            </span>
            <span className="min-w-0 flex-1 text-[10.5px] leading-snug text-[var(--hl-ink-3)]">
              {t.encyclopedia.counterReasons[c.reasonKey]}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-t border-[var(--hl-line)] pt-2 text-[var(--hl-ink-4)]">
        <BoxIcon className="h-3 w-3" />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.08em]">3d</span>
      </div>

      {onOpenFile && (
        <div className="border-t border-[var(--hl-line)] pt-3">
          <EncyclopediaSourceLinks tab="enemies" itemId={selectedEnemy.id} onOpenFile={onOpenFile} />
        </div>
      )}
    </div>
  );
}
