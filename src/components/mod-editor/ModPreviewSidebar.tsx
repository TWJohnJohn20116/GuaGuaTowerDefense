/**
 * Mod 編輯器 · 右側預覽欄 — HARDLINE 376px
 *
 * 每一段都是 1px 線分隔的區塊標頭 + 內容；預覽畫布一律深底外框，不加陰影。
 */
import { useState } from 'react';
import type React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CustomTowerData, CustomEnemyData, CustomMapData, CustomWaveData } from '@/types/game';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import {
  LivePreview,
  DPSChart,
  EfficiencyChart,
  BalanceReport,
} from '@/components/mod-editor';
import { MapPathPreview } from '@/components/mod-editor/MapPathPreview';
import { WaveTimelinePreview } from '@/components/mod-editor/WaveTimelinePreview';
import { WaveTypeLegend } from '@/components/mod-editor/WaveTypeLegend';
import { ModValidationPanel } from '@/components/mod-editor/ModValidationPanel';
import { ModBalanceAdvisor } from '@/components/mod-editor/ModBalanceAdvisor';
import { ModDiffPreview } from '@/components/mod-editor/ModDiffPreview';
import type { Mod } from '@/types/game';
import { EnemyAbilityCanvasPreview } from '@/components/mod-editor/EnemyAbilityCanvasPreview';
import { TowerAbilityCanvasPreview } from '@/components/mod-editor/TowerAbilityCanvasPreview';
import { towerHasEffectPreview } from '@/components/mod-editor/TowerAbilityCanvasPreview';
import type { ModValidationResult } from '@/types/game';
import { SegHead, Num, Chip, IconBtn } from '@/components/hl';
import {
  TowerIcon,
  AlienIcon,
  MapIcon,
  WaveIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/components/ui/Icons';

export interface ModPreviewSidebarProps {
  open: boolean;
  onToggle: () => void;
  modName: string;
  modDescription: string;
  modVersion: string;
  modAuthor: string;
  towers: CustomTowerData[];
  enemies: CustomEnemyData[];
  maps: CustomMapData[];
  waves: CustomWaveData[];
  validation: ModValidationResult;
  draftMod?: Mod | null;
  baselineMod?: Mod | null;
}

/** 區段：標頭 + 內容，1px 底線分隔 */
function Sec({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--cn-line-soft)] px-3 py-2.5">
      <SegHead label={label} className="mb-2" />
      {children}
    </section>
  );
}

/** 深底外框：所有畫布／圖表都用這一個框，不加陰影 */
function CanvasFrame({ children }: { children: React.ReactNode }) {
  return <div className="border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] p-2">{children}</div>;
}

export function ModPreviewSidebar({
  open,
  onToggle,
  modName,
  modDescription,
  modVersion,
  modAuthor,
  towers,
  enemies,
  maps,
  waves,
  validation,
  draftMod,
  baselineMod,
}: ModPreviewSidebarProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const [selectedTowerIndex, setSelectedTowerIndex] = useState<number | null>(null);
  const [selectedEnemyIndex, setSelectedEnemyIndex] = useState<number | null>(null);
  const [selectedMapIndex, setSelectedMapIndex] = useState(0);
  const [selectedWaveIndex, setSelectedWaveIndex] = useState(0);

  const activeMap = maps.length > 0
    ? maps[Math.min(selectedMapIndex, maps.length - 1)]
    : null;

  const activeWaveSet = waves.length > 0
    ? waves[Math.min(selectedWaveIndex, waves.length - 1)]
    : null;

  return (
    <>
      {/* 收合時的展開把手 */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-1 arc-panel px-1.5 py-3 text-[var(--arc-ink-3)] transition-colors hover:border-[var(--arc-gold)] hover:text-[var(--arc-gold)]"
            title={m.showAnalysis}
          >
            <EyeIcon className="h-3.5 w-3.5" />
            <ChevronLeftIcon className="h-3 w-3" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 376, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 flex h-full shrink-0 flex-col overflow-hidden border-l border-[var(--cn-line-soft)] bg-[var(--arc-deck)]"
          >
            {/* 區段頭 */}
            <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--cn-line-soft)] px-3">
              <EyeIcon className="h-3.5 w-3.5 text-[var(--arc-ink-3)]" />
              <span className="arc-label whitespace-nowrap">{m.livePreview}</span>
              <span className="h-px flex-1 bg-[var(--arc-line)]" />
              <IconBtn
                label={m.hideAnalysis}
                onClick={onToggle}
                className="flex h-6 w-6 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)] transition-colors hover:border-[var(--arc-line-hot)] hover:text-[var(--arc-ink)]"
              >
                <ChevronRightIcon className="h-3 w-3" />
              </IconBtn>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* Mod 摘要 */}
              <Sec label="mod">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[var(--arc-ink)]">
                    {modName || m.modUnnamedMod}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--arc-ink-3)]">{modDescription}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
                    <span>v{modVersion}</span>
                    <span className="text-[var(--arc-line-hot)]">·</span>
                    <span className="truncate">{modAuthor}</span>
                  </p>
                </div>
              </Sec>

              {/* 內容統計 */}
              <Sec label={m.contentList}>
                <div className="grid grid-cols-4 gap-px bg-[var(--arc-line)]">
                  {[
                    { count: towers.length, label: m.tabTowers, tone: 'text-[var(--arc-reach)]', icon: <TowerIcon className="h-3 w-3" /> },
                    { count: enemies.length, label: m.tabEnemies, tone: 'text-[var(--arc-alert)]', icon: <AlienIcon className="h-3 w-3" /> },
                    { count: maps.length, label: m.tabMaps, tone: 'text-[var(--arc-vital)]', icon: <MapIcon className="h-3 w-3" /> },
                    { count: waves.length, label: m.tabWaves, tone: 'text-[var(--arc-ink-2)]', icon: <WaveIcon className="h-3 w-3" /> },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[var(--arc-void-2)] px-1.5 py-1.5">
                      <span className={`flex items-center gap-1 ${stat.tone}`}>
                        {stat.icon}
                        <Num value={String(stat.count).padStart(2, '0')} size="sm" />
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--arc-ink-4)]">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Sec>

              {/* 驗證 */}
              <Sec label="validation">
                <ModValidationPanel result={validation} />
                {draftMod && <div className="mt-2"><ModDiffPreview draft={draftMod} baseline={baselineMod ?? null} /></div>}
              </Sec>

              {/* 平衡建議 */}
              <Sec label={m.balAiTitle}>
                <ModBalanceAdvisor towers={towers} enemies={enemies} waves={waves} />
              </Sec>

              {/* 即時預覽 */}
              {(towers.length > 0 || enemies.length > 0) && (
                <Sec label={m.livePreview}>
                  <CanvasFrame>
                    <LivePreview
                      towers={towers}
                      enemies={enemies}
                      maps={maps}
                      waves={waves}
                      selectedTowerIndex={selectedTowerIndex}
                      selectedEnemyIndex={selectedEnemyIndex}
                      onSelectTower={setSelectedTowerIndex}
                      onSelectEnemy={setSelectedEnemyIndex}
                    />
                  </CanvasFrame>
                </Sec>
              )}

              {selectedTowerIndex !== null && towers[selectedTowerIndex] && towerHasEffectPreview(towers[selectedTowerIndex]) && (
                <Sec label={m.modTowerFxAnim}>
                  <p className="mb-1.5 truncate text-[11.5px] text-[var(--arc-ink-2)]">{towers[selectedTowerIndex].name}</p>
                  <CanvasFrame>
                    <TowerAbilityCanvasPreview tower={towers[selectedTowerIndex]} />
                  </CanvasFrame>
                </Sec>
              )}

              {selectedEnemyIndex !== null && enemies[selectedEnemyIndex]?.ability && (
                <Sec label={m.modEnemyAbilityAnim}>
                  <p className="mb-1.5 truncate text-[11.5px] text-[var(--arc-ink-2)]">{enemies[selectedEnemyIndex].name}</p>
                  <CanvasFrame>
                    <EnemyAbilityCanvasPreview enemy={enemies[selectedEnemyIndex]} />
                  </CanvasFrame>
                </Sec>
              )}

              {/* 地圖路徑 */}
              {maps.length > 0 && activeMap && (
                <Sec label={`${m.tabMaps} ${m.modPreviewSuffix}`}>
                  {maps.length > 1 && (
                    <div className="mb-1.5 flex flex-wrap gap-1">
                      {maps.map((map, idx) => (
                        <Chip key={map.id} active={selectedMapIndex === idx} onClick={() => setSelectedMapIndex(idx)}>
                          {map.name.slice(0, 4)}
                        </Chip>
                      ))}
                    </div>
                  )}
                  <p className="mb-1.5 truncate text-[11.5px] text-[var(--arc-ink-2)]">{activeMap.name}</p>
                  <MapPathPreview map={activeMap} />
                  <p className="mt-1.5 font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
                    {fillTemplate(m.modPathPointCount, { count: String(activeMap.waypoints.length) })}
                  </p>
                </Sec>
              )}

              {/* 波次時間軸 */}
              {waves.length > 0 && activeWaveSet && (
                <Sec label={`${m.tabWaves} ${m.modPreviewSuffix}`}>
                  {waves.length > 1 && (
                    <div className="mb-1.5 flex flex-wrap gap-1">
                      {waves.map((ws, idx) => (
                        <Chip key={ws.id} active={selectedWaveIndex === idx} onClick={() => setSelectedWaveIndex(idx)}>
                          {ws.name.slice(0, 4)}
                        </Chip>
                      ))}
                    </div>
                  )}
                  <p className="mb-1.5 truncate text-[11.5px] text-[var(--arc-ink-2)]">{activeWaveSet.name}</p>
                  <CanvasFrame>
                    <WaveTimelinePreview waveSet={activeWaveSet} height={140} />
                  </CanvasFrame>
                  <div className="mt-2">
                    <WaveTypeLegend waveSet={activeWaveSet} />
                  </div>
                  <p className="mt-1.5 font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
                    {fillTemplate(m.modWaveEnemySummary, {
                      waves: String(activeWaveSet.waves.length),
                      enemies: String(activeWaveSet.waves.reduce((s, w) => s + w.enemies.reduce((a, e) => a + e.count, 0), 0)),
                    })}
                  </p>
                </Sec>
              )}

              {/* 圖表 */}
              {towers.length > 1 && (
                <Sec label="dps">
                  <CanvasFrame>
                    <DPSChart towers={towers} />
                  </CanvasFrame>
                </Sec>
              )}

              {towers.length > 0 && (
                <Sec label="efficiency">
                  <CanvasFrame>
                    <EfficiencyChart towers={towers} />
                  </CanvasFrame>
                </Sec>
              )}

              {(towers.length > 0 || enemies.length > 0) && (
                <Sec label="balance">
                  <CanvasFrame>
                    <BalanceReport towers={towers} enemies={enemies} />
                  </CanvasFrame>
                </Sec>
              )}

              {/* 內容清單 */}
              {(towers.length > 0 || enemies.length > 0 || maps.length > 0) && (
                <Sec label={m.contentList}>
                  {towers.length > 0 && (
                    <ContentChipRow
                      label={`${m.tabTowers} (${towers.length})`}
                      items={towers.map((tower) => ({ id: tower.id, name: tower.name, color: tower.color }))}
                    />
                  )}
                  {enemies.length > 0 && (
                    <ContentChipRow
                      label={`${m.tabEnemies} (${enemies.length})`}
                      items={enemies.map((enemy) => ({ id: enemy.id, name: enemy.name, color: enemy.color }))}
                    />
                  )}
                  {maps.length > 0 && (
                    <div className="mt-2">
                      <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
                        {m.tabMaps} ({maps.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {maps.map((map, idx) => (
                          <button
                            key={map.id}
                            type="button"
                            onClick={() => setSelectedMapIndex(idx)}
                            className="flex items-center gap-1 border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--arc-ink-2)] transition-colors hover:border-[var(--arc-line-hot)] hover:text-[var(--arc-ink)]"
                          >
                            <MapIcon className="h-2.5 w-2.5 text-[var(--arc-vital)]" />
                            <span className="max-w-[72px] truncate">{map.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Sec>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function ContentChipRow({
  label,
  items,
}: {
  label: string;
  items: { id: string; name: string; color: string }[];
}) {
  return (
    <div className="mt-2 first:mt-0">
      <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-1 border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--arc-ink-2)]"
          >
            <span className="h-2 w-2 border border-[var(--arc-line-strong)]" style={{ backgroundColor: item.color }} />
            <span className="max-w-[72px] truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
