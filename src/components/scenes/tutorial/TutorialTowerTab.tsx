/**
 * 防禦塔教學 — HARDLINE 規格文件版
 * 區段用 SegHead，清單用編號列，數值用 mono，星等用方塊。
 */
import { TOWER_DATA } from '@/data/gameData';
import TowerPreview from '@/components/ui/TowerPreview';
import TowerShootPreview from '@/components/ui/TowerShootPreview';
import { ThemeIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { Meter, Num, SegHead, Segments } from '@/components/hl';
import {
  buildTowerRoles,
  buildTowerGuides,
  buildTowerCombos,
  type TowerRole,
} from './TutorialPageData';
import { SpecCell, SpecGrid, SpecRow, SpecSection } from './TutorialPageComponents';

interface TutorialTowerTabProps {
  selectedTower: string;
  setSelectedTower: (id: string) => void;
  towerRoleFilter: TowerRole | null;
  setTowerRoleFilter: (role: TowerRole | null) => void;
}

const TIER_TONE: Record<string, string> = {
  S: 'text-[var(--arc-caution)] border-[rgba(255,182,39,0.35)]',
  A: 'text-[var(--arc-vital)] border-[rgba(53,224,138,0.35)]',
  B: 'text-[var(--arc-reach)] border-[rgba(111,140,255,0.35)]',
  C: 'text-[var(--arc-ink-3)] border-[var(--arc-line-strong)]',
};

export const TutorialTowerTab = ({
  selectedTower,
  setSelectedTower,
  towerRoleFilter,
  setTowerRoleFilter,
}: TutorialTowerTabProps) => {
  const { t } = useTranslation();
  const TOWER_ROLES = buildTowerRoles(t);
  const TOWER_GUIDES = buildTowerGuides(t);
  const TOWER_COMBOS = buildTowerCombos(t);
  const ui = t.tutorial.towerGuidesUi;
  const currentTower = TOWER_DATA[selectedTower as keyof typeof TOWER_DATA];

  return (
    <div className="space-y-5">
      {/* 角色定位 */}
      <SpecSection label={ui.eduTitle}>
        <p className="arc-title mb-2.5">{ui.eduSubtitle}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.entries(TOWER_ROLES) as [TowerRole, typeof TOWER_ROLES[TowerRole]][]).map(([key, role]) => {
            const active = towerRoleFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTowerRoleFilter(active ? null : key)}
                className={[
                  'flex flex-col gap-1.5 border px-2.5 py-2 text-left transition-colors duration-150',
                  active
                    ? 'border-[var(--arc-gold)] bg-[var(--arc-gold-veil)]'
                    : 'border-[var(--cn-line-soft)] bg-[var(--arc-deck)] hover:border-[var(--arc-line-hot)]',
                ].join(' ')}
              >
                <span className="flex items-center gap-1.5">
                  <ThemeIcon icon={role.icon} className="h-3.5 w-3.5" />
                  <span className="text-[12px] font-medium text-[var(--arc-ink)]">{role.label}</span>
                </span>
                <span className="text-[10.5px] leading-snug text-[var(--arc-ink-3)]">{role.description}</span>
              </button>
            );
          })}
        </div>
      </SpecSection>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        {/* 塔清單 */}
        <div>
          <SegHead
            label={
              towerRoleFilter
                ? TOWER_ROLES[towerRoleFilter].label
                : ui.allTowers
            }
            right={<Num value={TOWER_GUIDES.length} tone="muted" size="sm" className="leading-none" />}
          />
          <div className="mt-2 border-[3px] border-[var(--cn-line-soft)]">
            {TOWER_GUIDES
              .filter((g) => !towerRoleFilter || g.role === towerRoleFilter)
              .map((guide, i) => {
                const data = TOWER_DATA[guide.id as keyof typeof TOWER_DATA];
                if (!data) return null;
                const active = selectedTower === guide.id;
                return (
                  <button
                    key={guide.id}
                    type="button"
                    onClick={() => setSelectedTower(guide.id)}
                    className={[
                      'relative flex w-full items-center gap-2.5 border-b border-[var(--cn-line-soft)] px-2.5 py-2 text-left last:border-b-0 transition-colors duration-150',
                      active ? 'bg-[var(--arc-deck-2)]' : 'hover:bg-[var(--arc-deck-2)]',
                    ].join(' ')}
                  >
                    {active && <span className="absolute left-0 top-0 h-full w-[2px] bg-[var(--arc-gold)]" />}
                    <span className="w-[18px] shrink-0 font-mono text-[9.5px] tabular-nums text-[var(--arc-ink-4)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <TowerPreview towerId={guide.id} size={22} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-[var(--arc-ink)]">{data.name}</span>
                      <span className="mt-0.5 block font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                        ${data.cost}
                      </span>
                    </span>
                    <span className={`shrink-0 border px-1 py-0.5 font-mono text-[9px] ${TIER_TONE[guide.tier]}`}>
                      {guide.tier}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* 塔詳情 */}
        <div className="min-w-0 space-y-4">
          {(() => {
            const guide = TOWER_GUIDES.find((g) => g.id === selectedTower);
            if (!guide || !currentTower) return null;
            const roleInfo = TOWER_ROLES[guide.role];
            const tierLabel: Record<string, string> = {
              S: ui.tierSLabel,
              A: ui.tierALabel,
              B: ui.tierBLabel,
              C: ui.tierCLabel,
            };

            return (
              <>
                <SpecSection
                  label={currentTower.name}
                  right={(
                    <span className={`border px-1.5 py-0.5 font-mono text-[9.5px] ${TIER_TONE[guide.tier]}`}>
                      {tierLabel[guide.tier]}
                    </span>
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
                      <TowerPreview towerId={guide.id} size={52} animate />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] leading-relaxed text-[var(--arc-ink-2)]">{currentTower.description}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-[var(--arc-ink-3)]">
                        <span className="flex items-center gap-1">
                          <ThemeIcon icon={roleInfo.icon} className="h-3 w-3" />
                          {roleInfo.label}
                        </span>
                        <span>{ui.buildingTiming}{guide.timing}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 overflow-hidden border-[3px] border-[var(--cn-line-soft)]">
                    <TowerShootPreview towerId={guide.id} />
                  </div>

                  <div className="mt-3">
                    <SpecGrid cols={5}>
                      <SpecCell
                        label={currentTower.damagePerSecond ? ui.damagePerSecond : ui.damageLabel}
                        value={currentTower.damage || currentTower.damagePerSecond || 0}
                        tone="alarm"
                      />
                      <SpecCell label={ui.rangeLabel} value={currentTower.range || '-'} tone="reach" />
                      <SpecCell label={ui.fireRateLabel} value={currentTower.fireRate || '-'} tone="vital" />
                      <SpecCell label={ui.costLabel} value={`$${currentTower.cost}`} tone="caution" />
                      <SpecCell label={ui.dpsLabel} value={guide.dps} tone="signal" />
                    </SpecGrid>
                  </div>
                </SpecSection>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SpecSection label={`${ui.skillLabel}${guide.skill.name}`}>
                    <p className="text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{guide.skill.description}</p>
                    <div className="mt-2 border-[3px] border-[var(--cn-line-soft)] px-2 py-1 font-mono text-[10.5px] text-[var(--arc-ink-3)]">
                      {ui.cooldownLabel}{guide.skill.cooldown}
                    </div>
                  </SpecSection>

                  <SpecSection label={ui.bestPlacement}>
                    <p className="text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{guide.placement}</p>
                  </SpecSection>
                </div>

                <SpecSection label={ui.usageTips}>
                  <div className="border-t border-[var(--cn-line-soft)]">
                    {guide.tips.map((tip, i) => (
                      <SpecRow key={i} index={i + 1} title={tip} />
                    ))}
                  </div>
                </SpecSection>

                <SpecSection label={ui.recommendedPairs}>
                  <div className="border-t border-[var(--cn-line-soft)]">
                    {guide.synergies.map((syn, i) => (
                      <div
                        key={syn.towerId}
                        className="grid grid-cols-[26px_32px_1fr] items-center gap-2.5 border-b border-[var(--cn-line-soft)] py-2 last:border-b-0"
                      >
                        <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <TowerPreview towerId={syn.towerId} size={24} />
                        <div className="min-w-0">
                          <span className="block text-[12px] font-medium text-[var(--arc-ink)]">{syn.towerName}</span>
                          <p className="mt-0.5 text-[10.5px] leading-relaxed text-[var(--arc-ink-3)]">{syn.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SpecSection>
              </>
            );
          })()}
        </div>
      </div>

      {/* 組合 */}
      <SpecSection label={ui.comboTitle}>
        <div className="border-t border-[var(--cn-line-soft)]">
          {TOWER_COMBOS.map((combo) => (
            <div key={combo.name} className="border-b border-[var(--cn-line-soft)] py-2.5 last:border-b-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] font-medium text-[var(--arc-ink)]">{combo.name}</span>
                <Segments total={5} filled={combo.rating} tone="caution" size="sm" />
                <span className="ml-auto flex flex-wrap items-center gap-1.5">
                  {combo.towers.map((tw) => (
                    <span
                      key={tw.id}
                      className="flex items-center gap-1.5 border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--arc-ink-2)]"
                    >
                      <TowerPreview towerId={tw.id} size={14} />
                      {tw.name}
                    </span>
                  ))}
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{combo.description}</p>
              <p className="mt-1 font-mono text-[10px] text-[var(--arc-ink-3)]">
                {ui.comboSituationLabel}{combo.situation}
              </p>
            </div>
          ))}
        </div>
      </SpecSection>

      {/* DPS 排行 */}
      <SpecSection label={ui.dpsRankTitle}>
        <div className="space-y-1.5">
          {[...TOWER_GUIDES]
            .sort((a, b) => b.dps - a.dps)
            .map((guide, index) => {
              const data = TOWER_DATA[guide.id as keyof typeof TOWER_DATA];
              if (!data) return null;
              const maxDps = Math.max(...TOWER_GUIDES.map((g) => g.dps));
              return (
                <div key={guide.id} className="flex items-center gap-2.5">
                  <span className="w-5 shrink-0 text-right font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <TowerPreview towerId={guide.id} size={18} />
                  <span className="w-[86px] shrink-0 truncate text-[11.5px] text-[var(--arc-ink-2)]">{data.name}</span>
                  <Meter value={guide.dps} max={Math.max(1, maxDps)} tone="signal" className="h-1" />
                  <span className="w-9 shrink-0 text-right font-mono text-[10.5px] tabular-nums text-[var(--arc-ink-2)]">
                    {guide.dps}
                  </span>
                </div>
              );
            })}
        </div>
        <p className="mt-2 arc-label">{ui.dpsRankNote}</p>
      </SpecSection>
    </div>
  );
};
