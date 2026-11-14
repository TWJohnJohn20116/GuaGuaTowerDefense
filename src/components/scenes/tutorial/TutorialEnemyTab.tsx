/**
 * 敵人教學 — HARDLINE 規格文件版
 * 左側編號清單、右側規格欄位；危險度用 mono 標籤，血量用 1px 計量條。
 */
import { TOWER_DATA, ENEMY_DATA } from '@/data/gameData';
import EnemyPreview from '@/components/ui/EnemyPreview';
import { ThemeIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { Meter, Num, SegHead } from '@/components/hl';
import {
  buildEnemyRoles,
  buildEnemyGuides,
  type EnemyRole,
} from './TutorialPageData';
import { SpecCell, SpecGrid, SpecRow, SpecSection } from './TutorialPageComponents';

interface TutorialEnemyTabProps {
  selectedEnemy: string;
  setSelectedEnemy: (id: string) => void;
  enemyRoleFilter: EnemyRole | null;
  setEnemyRoleFilter: (role: EnemyRole | null) => void;
}

const DANGER_TONE: Record<string, string> = {
  S: 'text-[var(--arc-caution)] border-[rgba(255,182,39,0.35)]',
  A: 'text-[var(--arc-alert)] border-[rgba(255,61,113,0.35)]',
  B: 'text-[var(--arc-caution)] border-[rgba(255,182,39,0.28)]',
  C: 'text-[var(--arc-ink-3)] border-[var(--arc-line-strong)]',
};

export const TutorialEnemyTab = ({
  selectedEnemy,
  setSelectedEnemy,
  enemyRoleFilter,
  setEnemyRoleFilter,
}: TutorialEnemyTabProps) => {
  const { t } = useTranslation();
  const ENEMY_ROLES = buildEnemyRoles(t);
  const ENEMY_GUIDES = buildEnemyGuides(t);
  const ui = t.tutorial.enemyGuidesUi;

  return (
    <div className="space-y-5">
      {/* 角色定位 */}
      <SpecSection label={ui.eduTitle}>
        <p className="arc-title mb-2.5">{ui.eduSubtitle}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(Object.entries(ENEMY_ROLES) as [EnemyRole, typeof ENEMY_ROLES[EnemyRole]][]).map(([key, role]) => {
            const active = enemyRoleFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setEnemyRoleFilter(active ? null : key)}
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
        {/* 敵人清單 */}
        <div>
          <SegHead
            label={enemyRoleFilter ? ENEMY_ROLES[enemyRoleFilter].label : ui.allEnemies}
            right={<Num value={ENEMY_GUIDES.length} tone="muted" size="sm" className="leading-none" />}
          />
          <div className="mt-2 border-[3px] border-[var(--cn-line-soft)]">
            {ENEMY_GUIDES
              .filter((g) => !enemyRoleFilter || g.role === enemyRoleFilter)
              .map((guide, i) => {
                const data = ENEMY_DATA[guide.id as keyof typeof ENEMY_DATA];
                if (!data) return null;
                const active = selectedEnemy === guide.id;
                return (
                  <button
                    key={guide.id}
                    type="button"
                    onClick={() => setSelectedEnemy(guide.id)}
                    className={[
                      'relative flex w-full items-center gap-2.5 border-b border-[var(--cn-line-soft)] px-2.5 py-2 text-left last:border-b-0 transition-colors duration-150',
                      active ? 'bg-[var(--arc-deck-2)]' : 'hover:bg-[var(--arc-deck-2)]',
                    ].join(' ')}
                  >
                    {active && <span className="absolute left-0 top-0 h-full w-[2px] bg-[var(--arc-gold)]" />}
                    <span className="w-[18px] shrink-0 font-mono text-[9.5px] tabular-nums text-[var(--arc-ink-4)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <EnemyPreview
                      enemyId={guide.id}
                      color={data.color}
                      size={Math.min(20, Math.max(14, data.size * 0.5))}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-[var(--arc-ink)]">{data.name}</span>
                      <span className="mt-0.5 block font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                        {data.health} · {data.speed}x · ${data.reward}
                      </span>
                    </span>
                    <span className={`shrink-0 border px-1 py-0.5 font-mono text-[9px] ${DANGER_TONE[guide.danger]}`}>
                      {guide.danger}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* 敵人詳情 */}
        <div className="min-w-0 space-y-4">
          {(() => {
            const guide = ENEMY_GUIDES.find((g) => g.id === selectedEnemy);
            const data = ENEMY_DATA[selectedEnemy as keyof typeof ENEMY_DATA];
            if (!guide || !data) return null;
            const roleInfo = ENEMY_ROLES[guide.role];
            const dangerLabel: Record<string, string> = {
              S: ui.dangerSLabel,
              A: ui.dangerALabel,
              B: ui.dangerBLabel,
              C: ui.dangerCLabel,
            };

            return (
              <>
                <SpecSection
                  label={data.name}
                  right={(
                    <span className={`border px-1.5 py-0.5 font-mono text-[9.5px] ${DANGER_TONE[guide.danger]}`}>
                      {dangerLabel[guide.danger]}
                    </span>
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
                      <EnemyPreview
                        enemyId={guide.id}
                        color={data.color}
                        size={Math.min(52, Math.max(32, data.size * 1.2))}
                        animate
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] leading-relaxed text-[var(--arc-ink-2)]">{data.description}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-[var(--arc-ink-3)]">
                        <span className="flex items-center gap-1">
                          <ThemeIcon icon={roleInfo.icon} className="h-3 w-3" />
                          {roleInfo.label}
                        </span>
                        <span>{ui.spawnWaveLabel}{guide.spawnWave}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <SpecGrid cols={4}>
                      <SpecCell label={ui.healthLabel} value={data.health} tone="alarm" />
                      <SpecCell label={ui.speedLabel} value={`${data.speed}x`} tone="reach" />
                      <SpecCell label={ui.rewardLabel} value={`$${data.reward}`} tone="caution" />
                      <SpecCell label={ui.sizeLabel} value={data.size} tone="muted" />
                    </SpecGrid>
                  </div>
                </SpecSection>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SpecSection label={ui.ability}>
                    <p className="text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{guide.abilityDesc}</p>
                    {data.ability && (
                      <div className="mt-2 border-[3px] border-[var(--cn-line-soft)] px-2 py-1 font-mono text-[10.5px] text-[var(--arc-ink-3)]">
                        {ui.abilityTag}{data.ability}
                      </div>
                    )}
                  </SpecSection>

                  <SpecSection label={ui.weakness}>
                    <p className="text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{guide.weakness}</p>
                  </SpecSection>
                </div>

                <SpecSection label={ui.counterStrategy}>
                  <div className="border-t border-[var(--cn-line-soft)]">
                    {guide.tips.map((tip, i) => (
                      <SpecRow key={i} index={i + 1} title={tip} />
                    ))}
                  </div>
                </SpecSection>

                <SpecSection label={ui.recommendedCounters}>
                  <div className="border-t border-[var(--cn-line-soft)]">
                    {guide.counters.map((counter, i) => {
                      const tData = TOWER_DATA[counter.towerId as keyof typeof TOWER_DATA];
                      return (
                        <div
                          key={counter.towerId}
                          className="grid grid-cols-[26px_16px_1fr] items-center gap-2.5 border-b border-[var(--cn-line-soft)] py-2 last:border-b-0"
                        >
                          <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span
                            className="h-4 w-4 border border-[var(--arc-line-strong)]"
                            style={{ backgroundColor: tData?.color || '#4a515b' }}
                          />
                          <div className="min-w-0">
                            <span className="block text-[12px] font-medium text-[var(--arc-ink)]">{counter.towerName}</span>
                            <p className="mt-0.5 text-[10.5px] leading-relaxed text-[var(--arc-ink-3)]">{counter.reason}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SpecSection>
              </>
            );
          })()}
        </div>
      </div>

      {/* 危險度排行 */}
      <SpecSection label={ui.threatRank}>
        <div className="space-y-1.5">
          {(() => {
            const sorted = [...ENEMY_GUIDES].sort((a, b) => {
              const o: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 };
              return (o[b.danger] - o[a.danger])
                || ((ENEMY_DATA[b.id as keyof typeof ENEMY_DATA]?.health || 0)
                  - (ENEMY_DATA[a.id as keyof typeof ENEMY_DATA]?.health || 0));
            });
            const maxHp = Math.max(...sorted.map((g) => ENEMY_DATA[g.id as keyof typeof ENEMY_DATA]?.health || 0));
            return sorted.map((guide, i) => {
              const d = ENEMY_DATA[guide.id as keyof typeof ENEMY_DATA];
              if (!d) return null;
              return (
                <div key={guide.id} className="flex items-center gap-2.5">
                  <span className="w-5 shrink-0 text-right font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <EnemyPreview enemyId={guide.id} color={d.color} size={18} />
                  <span className="w-[86px] shrink-0 truncate text-[11.5px] text-[var(--arc-ink-2)]">{d.name}</span>
                  <Meter
                    value={d.health}
                    max={Math.max(1, maxHp)}
                    tone={guide.danger === 'S' ? 'alarm' : guide.danger === 'A' ? 'caution' : 'reach'}
                    className="h-1"
                  />
                  <span className="w-9 shrink-0 text-right font-mono text-[10.5px] tabular-nums text-[var(--arc-alert)]">
                    {d.health}
                  </span>
                </div>
              );
            });
          })()}
        </div>
        <p className="mt-2 arc-label">{ui.threatRankNote}</p>
      </SpecSection>
    </div>
  );
};
