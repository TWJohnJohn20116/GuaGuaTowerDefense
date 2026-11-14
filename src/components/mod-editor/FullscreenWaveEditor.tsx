// 全螢幕波次編輯器 - 大尺寸詳細編輯體驗
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CustomWaveData, WaveConfig, EnemyType } from '@/types/game';
import { ENEMY_DATA, GAME_CONSTANTS, WAVE_CONFIGS } from '@/data/gameData';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import {
  TrashIcon, CopyIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon,
  WaveIcon, AlienMonsterIcon, CoinIcon, SparklesIcon, BombIcon,
  DownloadIcon, HeartIcon, ClockIcon, XIcon, CrossIcon, SlidersIcon,
} from '@/components/ui/Icons';
import { EnemyTypeSelector } from './EnemyTypeSelector';
import { WaveTimelinePreview } from './WaveTimelinePreview';
import { WaveTypeLegend } from './WaveTypeLegend';
import { reorderWaves, duplicateAllWaves, adjustFocusedIndexAfterReorder } from './waveEditorWaveOps';
import { TopBar, Btn, Rule, SegHead, Num, Empty } from '@/components/hl';

function templateBoss(): WaveConfig {
  return {
    enemies: [
      { type: 'boss', count: 1, delay: 0 },
      { type: 'shield', count: 4, delay: 500 },
    ],
    reward: 200,
  };
}

function templateSwarm(): WaveConfig {
  return {
    enemies: [
      { type: 'swarm', count: 20, delay: 0 },
      { type: 'fast', count: 5, delay: 800 },
    ],
    reward: 100,
  };
}

function templateMixed(): WaveConfig {
  return {
    enemies: [
      { type: 'normal', count: 8, delay: 0 },
      { type: 'tank', count: 2, delay: 800 },
      { type: 'flyer', count: 4, delay: 800 },
    ],
    reward: 120,
  };
}

interface FullscreenWaveEditorProps {
  waveSet: CustomWaveData;
  onChange: (data: CustomWaveData) => void;
  onClose: () => void;
  focusedWaveIdx?: number;
  onFocusedWaveChange?: (idx: number) => void;
}

export function FullscreenWaveEditor({
  waveSet,
  onChange,
  onClose,
  focusedWaveIdx,
  onFocusedWaveChange,
}: FullscreenWaveEditorProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const [selectedWaveIdx, setSelectedWaveIdx] = useState<number>(focusedWaveIdx ?? 0);
  const [dragWaveIdx, setDragWaveIdx] = useState<number | null>(null);
  const [batchSelected, setBatchSelected] = useState<Set<number>>(new Set());

  // ESC 鍵關閉
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (focusedWaveIdx != null && focusedWaveIdx !== selectedWaveIdx) {
      setSelectedWaveIdx(focusedWaveIdx);
    }
  }, [focusedWaveIdx]); // TD-17：deps 刻意只列 focusedWaveIdx

  const selectWave = (idx: number) => {
    setSelectedWaveIdx(idx);
    onFocusedWaveChange?.(idx);
  };

  const updateWave = (idx: number, wave: WaveConfig) => {
    const next = [...waveSet.waves];
    next[idx] = wave;
    onChange({ ...waveSet, waves: next });
  };

  const removeWave = (idx: number) => {
    const next = waveSet.waves.filter((_, i) => i !== idx);
    onChange({ ...waveSet, waves: next });
    if (selectedWaveIdx >= next.length) setSelectedWaveIdx(Math.max(0, next.length - 1));
  };

  const duplicateWave = (idx: number) => {
    const next = [...waveSet.waves];
    next.splice(idx + 1, 0, JSON.parse(JSON.stringify(waveSet.waves[idx])));
    onChange({ ...waveSet, waves: next });
  };

  const moveWave = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= waveSet.waves.length) return;
    const next = [...waveSet.waves];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange({ ...waveSet, waves: next });
    if (selectedWaveIdx === idx) setSelectedWaveIdx(target);
    else if (selectedWaveIdx === target) setSelectedWaveIdx(idx);
  };

  const addWave = (template?: WaveConfig) => {
    const newWave: WaveConfig = template || {
      enemies: [{ type: 'normal', count: 5, delay: 0 }],
      reward: 50,
    };
    onChange({ ...waveSet, waves: [...waveSet.waves, newWave] });
    setSelectedWaveIdx(waveSet.waves.length);
  };

  const reorderWave = (from: number, to: number) => {
    onChange({ ...waveSet, waves: reorderWaves(waveSet.waves, from, to) });
    setSelectedWaveIdx((idx) => adjustFocusedIndexAfterReorder(idx, from, to) ?? idx);
  };

  const duplicateAllWavesHandler = () => {
    onChange({ ...waveSet, waves: duplicateAllWaves(waveSet.waves) });
  };

  const toggleBatchWave = (idx: number) => {
    setBatchSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const batchDeleteWaves = () => {
    if (batchSelected.size === 0) return;
    onChange({ ...waveSet, waves: waveSet.waves.filter((_, i) => !batchSelected.has(i)) });
    setBatchSelected(new Set());
    setSelectedWaveIdx(0);
  };

  const batchDuplicateWaves = () => {
    if (batchSelected.size === 0) return;
    const sorted = [...batchSelected].sort((a, b) => a - b);
    const cloned = sorted.map((i) => JSON.parse(JSON.stringify(waveSet.waves[i])) as WaveConfig);
    onChange({ ...waveSet, waves: [...waveSet.waves, ...cloned] });
  };

  const importFromDefault = (count: number) => {
    const newWaves: WaveConfig[] = WAVE_CONFIGS.slice(0, count).map((wc) => ({
      enemies: wc.enemies.map((e) => ({ type: e.type, count: e.count, delay: 0 })),
      reward: 50,
    }));
    onChange({ ...waveSet, waves: [...waveSet.waves, ...newWaves] });
  };

  const totalEnemies = waveSet.waves.reduce(
    (sum, w) => sum + w.enemies.reduce((s, e) => s + e.count, 0),
    0
  );

  const stats = useMemo(() => {
    let totalHP = 0;
    let totalReward = 0;
    let totalDuration = 0;
    waveSet.waves.forEach((w) => {
      let waveDur = 0;
      w.enemies.forEach((eg) => {
        const eData = ENEMY_DATA[eg.type as keyof typeof ENEMY_DATA];
        if (eData) totalHP += (eData.health || 50) * eg.count;
        if (eg.delay) waveDur += eg.delay;
        waveDur += eg.count * GAME_CONSTANTS.ENEMY_SPAWN_DELAY;
      });
      totalDuration += waveDur;
      totalReward += w.reward || 0;
    });
    return { totalHP, totalReward, totalDuration };
  }, [waveSet.waves]);

  const selectedWave = waveSet.waves[selectedWaveIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200000] flex flex-col bg-[var(--hl-void)]"
    >
      {/* 頂列 */}
      <TopBar
        back={false}
        glyph={<WaveIcon className="h-3.5 w-3.5" />}
        meta={m.tabWaves}
        title={
          <input
            value={waveSet.name}
            onChange={(e) => onChange({ ...waveSet, name: e.target.value })}
            className="w-[260px] max-w-full bg-transparent text-[15px] font-semibold tracking-[-0.01em] text-[var(--hl-ink)] outline-none placeholder:text-[var(--hl-ink-4)]"
            placeholder={m.waveNamePh}
          />
        }
        right={
          <Btn
            size="sm"
            variant="line"
            onClick={onClose}
            kbd="Esc"
            title={m.closeEditor}
            icon={<XIcon className="h-3.5 w-3.5" />}
          >
            {m.closeEditor}
          </Btn>
        }
      />

      {/* 說明 + 統計帶：h-11，分組之間 1px 垂直線 */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-4">
        <input
          value={waveSet.description}
          onChange={(e) => onChange({ ...waveSet, description: e.target.value })}
          className="h-7 min-w-[140px] flex-1 border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 text-[11.5px] text-[var(--hl-ink-2)] outline-none transition-colors placeholder:text-[var(--hl-ink-4)] focus:border-[var(--hl-signal)]"
          placeholder={m.waveDescPh}
        />

        <Rule vertical className="h-5" />

        <div className="flex shrink-0 items-center gap-3">
          <StatInline icon={<WaveIcon className="h-3 w-3" />} label={m.waveCount} value={waveSet.waves.length} tone="signal" />
          <StatInline icon={<AlienMonsterIcon className="h-3 w-3" />} label={m.waveTotalEnemies} value={totalEnemies} tone="alarm" />
          <StatInline icon={<HeartIcon className="h-3 w-3" />} label={m.waveStatHpLabel} value={stats.totalHP.toLocaleString()} />
          <StatInline icon={<CoinIcon className="h-3 w-3" />} label={m.waveReward} value={`$${stats.totalReward}`} tone="caution" />
          <StatInline icon={<ClockIcon className="h-3 w-3" />} label={m.waveStatDuration} value={`~${(stats.totalDuration / 1000).toFixed(0)}s`} tone="reach" />
        </div>

        <Rule vertical className="h-5" />

        <div className="flex shrink-0 items-center gap-1.5">
          <Btn
            size="sm"
            variant="line"
            className="text-[var(--hl-vital)]"
            onClick={() => importFromDefault(5)}
            icon={<DownloadIcon className="h-3.5 w-3.5" />}
          >
            {m.wvImport5Default}
          </Btn>
          <Btn
            size="sm"
            variant="line"
            className="text-[var(--hl-vital)]"
            onClick={() => importFromDefault(10)}
            icon={<DownloadIcon className="h-3.5 w-3.5" />}
          >
            {m.wvImport10Default}
          </Btn>
        </div>
      </div>

      {/* 主內容區：左清單 + 右詳情 */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 左側 wave 清單 */}
        <aside className="flex w-[252px] shrink-0 flex-col border-r border-[var(--hl-line)] bg-[var(--hl-deck)]">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--hl-line)] px-3">
            <span className="hl-label">{m.tabWaves}</span>
            <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
              {String(waveSet.waves.length).padStart(2, '0')}
            </span>
            <span className="h-px flex-1 bg-[var(--hl-line)]" />
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => addWave()}
              title={m.addWave}
              aria-label={m.addWave}
              icon={<PlusIcon className="h-3.5 w-3.5" />}
            />
            <Btn
              size="sm"
              variant="ghost"
              onClick={duplicateAllWavesHandler}
              disabled={waveSet.waves.length === 0}
              title={m.wvBatchDupAllTitle}
              aria-label={m.wvBatchDupAllTitle}
              icon={<CopyIcon className="h-3.5 w-3.5" />}
            />
          </div>

          {batchSelected.size > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 py-1.5">
              <span className="font-mono text-[10px] text-[var(--hl-reach)]">
                {fillTemplate(m.wvBatchSelected, { count: String(batchSelected.size) })}
              </span>
              <Btn size="sm" variant="line" onClick={batchDuplicateWaves}>
                {m.wvBatchDup}
              </Btn>
              <Btn size="sm" variant="danger" onClick={batchDeleteWaves}>
                {m.wvBatchDel}
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => setBatchSelected(new Set())}>
                {m.wvBatchClear}
              </Btn>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence>
              {waveSet.waves.length === 0 && (
                <p className="px-3 py-4 font-mono text-[10px] text-[var(--hl-ink-4)]">{m.noWaves}</p>
              )}
              {waveSet.waves.map((wave, idx) => {
                const wTotal = wave.enemies.reduce((s, e) => s + e.count, 0);
                const isSelected = selectedWaveIdx === idx;
                return (
                  <WaveListItem
                    key={`fs-wave-${idx}-${wave.reward}`}
                    waveIndex={idx}
                    wave={wave}
                    selected={isSelected}
                    enemyTotal={wTotal}
                    isBatchSelected={batchSelected.has(idx)}
                    onToggleBatch={() => toggleBatchWave(idx)}
                    isDragging={dragWaveIdx === idx}
                    onSelect={() => selectWave(idx)}
                    onMoveUp={() => moveWave(idx, -1)}
                    onMoveDown={() => moveWave(idx, 1)}
                    onDuplicate={() => duplicateWave(idx)}
                    onDelete={() => removeWave(idx)}
                    onDragStart={() => setDragWaveIdx(idx)}
                    onDragEnd={() => setDragWaveIdx(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragWaveIdx != null) reorderWave(dragWaveIdx, idx);
                      setDragWaveIdx(null);
                    }}
                    isFirst={idx === 0}
                    isLast={idx === waveSet.waves.length - 1}
                    label={m.waveLabel.replace('{n}', String(idx + 1))}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          {/* 範本快選 */}
          <div className="shrink-0 space-y-1.5 border-t border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 py-2">
            <span className="hl-label">{m.waveQuickAdd}</span>
            <div className="grid grid-cols-3 gap-1">
              <Btn
                size="sm"
                variant="line"
                className="px-1 text-[var(--hl-caution)]"
                onClick={() => addWave(templateBoss())}
                icon={<SparklesIcon className="h-3 w-3" />}
              >
                {m.waveBoss}
              </Btn>
              <Btn
                size="sm"
                variant="line"
                className="px-1 text-[var(--hl-alarm)]"
                onClick={() => addWave(templateSwarm())}
                icon={<BombIcon className="h-3 w-3" />}
              >
                {m.waveSwarm}
              </Btn>
              <Btn
                size="sm"
                variant="line"
                className="px-1 text-[var(--hl-reach)]"
                onClick={() => addWave(templateMixed())}
                icon={<AlienMonsterIcon className="h-3 w-3" />}
              >
                {m.waveMixed}
              </Btn>
            </div>
          </div>
        </aside>

        {/* 右側詳細編輯 */}
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-[var(--hl-line)] px-4 py-3">
            <SegHead
              label={m.livePreview}
              right={
                <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
                  {String(waveSet.waves.length).padStart(2, '0')}
                </span>
              }
              className="mb-2"
            />
            <WaveTimelinePreview
              waveSet={waveSet}
              height={120}
              compact
              selectedWaveIndex={selectedWaveIdx}
              onWaveClick={selectWave}
            />
            <WaveTypeLegend waveSet={waveSet} className="mt-2" />
          </div>
          {selectedWave ? (
            <FullscreenWaveDetail
              wave={selectedWave}
              waveIndex={selectedWaveIdx}
              label={m.waveLabel.replace('{n}', String(selectedWaveIdx + 1))}
              onChange={(w) => updateWave(selectedWaveIdx, w)}
            />
          ) : (
            <Empty title={m.noWaves} className="m-4" />
          )}
        </section>
      </div>
    </motion.div>
  );
}

// 統計小元件：標籤 mono + 等寬數值，不加底色塊
function StatInline({
  icon, label, value, tone = 'ink',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: 'ink' | 'signal' | 'vital' | 'alarm' | 'caution' | 'reach';
}) {
  const tint =
    tone === 'signal'
      ? 'text-[var(--hl-signal)]'
      : tone === 'vital'
        ? 'text-[var(--hl-vital)]'
        : tone === 'alarm'
          ? 'text-[var(--hl-alarm)]'
          : tone === 'caution'
            ? 'text-[var(--hl-caution)]'
            : tone === 'reach'
              ? 'text-[var(--hl-reach)]'
              : 'text-[var(--hl-ink-3)]';
  return (
    <span className="flex items-baseline gap-1.5">
      <span className={tint}>{icon}</span>
      <span className="hl-label">{label}</span>
      <Num value={value} size="sm" tone={tone} />
    </span>
  );
}

// 左側列表項目
function WaveListItem({
  waveIndex, wave, selected, enemyTotal, isBatchSelected, onToggleBatch, isDragging, onSelect, onMoveUp, onMoveDown, onDuplicate, onDelete,
  onDragStart, onDragEnd, onDragOver, onDrop, isFirst, isLast, label,
}: {
  waveIndex: number;
  wave: WaveConfig;
  selected: boolean;
  enemyTotal: number;
  isBatchSelected?: boolean;
  onToggleBatch?: () => void;
  isDragging?: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isFirst: boolean;
  isLast: boolean;
  label: string;
}) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  void waveIndex;
  // 計算迷你時間軸
  const timeline = (() => {
    const points: { time: number; color: string }[] = [];
    let t = 0;
    wave.enemies.forEach((eg) => {
      if (eg.delay) t += eg.delay;
      const eData = ENEMY_DATA[eg.type as keyof typeof ENEMY_DATA];
      const color = eData?.color || '#888';
      for (let i = 0; i < eg.count; i++) {
        points.push({ time: t, color });
        t += GAME_CONSTANTS.ENEMY_SPAWN_DELAY;
      }
    });
    return { points, total: t };
  })();

  return (
    <motion.div
      layout
      draggable
      onDragStart={(e) => {
        const dt = (e as unknown as DragEvent).dataTransfer;
        if (!dt) return;
        dt.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: isDragging ? 0.45 : 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onSelect}
      className={`relative cursor-pointer border-b border-[var(--hl-line)] px-2.5 py-2 transition-colors ${
        selected ? 'bg-[var(--hl-deck-2)]' : 'bg-transparent hover:bg-[var(--hl-deck-2)]'
      }`}
    >
      {/* 選中：左緣 2px 訊號條 */}
      <span className={`absolute left-0 top-0 h-full w-[2px] ${selected ? 'bg-[var(--hl-signal)]' : 'bg-transparent'}`} />

      <div className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={!!isBatchSelected}
          onChange={(e) => { e.stopPropagation(); onToggleBatch?.(); }}
          onClick={(e) => e.stopPropagation()}
          className="h-3 w-3 shrink-0 appearance-none border border-[var(--hl-line-strong)] bg-[var(--hl-void-2)] checked:border-[var(--hl-caution)] checked:bg-[var(--hl-caution)]"
          title={m.wvBatchSelect}
        />
        <button
          type="button"
          className="cursor-grab p-0.5 text-[var(--hl-ink-4)] transition-colors hover:text-[var(--hl-ink-3)] active:cursor-grabbing"
          title={m.wvDragSort}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <SlidersIcon className="h-3 w-3" />
        </button>
        <span className={`min-w-0 flex-1 truncate font-mono text-[10px] tracking-[0.06em] ${selected ? 'text-[var(--hl-ink)]' : 'text-[var(--hl-ink-2)]'}`}>
          {label}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--hl-ink-3)]">
          <AlienMonsterIcon className="h-2.5 w-2.5" />
          {enemyTotal}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--hl-caution)]">
          <CoinIcon className="h-2.5 w-2.5" />${wave.reward ?? 0}
        </span>
        <span className="flex-1" />
        <Btn
          size="sm"
          variant="ghost"
          className="h-6 px-1"
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={isFirst}
          title={m.moveWaveUp}
          aria-label={m.moveWaveUp}
          icon={<ChevronUpIcon className="h-3 w-3" />}
        />
        <Btn
          size="sm"
          variant="ghost"
          className="h-6 px-1"
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={isLast}
          title={m.moveWaveDown}
          aria-label={m.moveWaveDown}
          icon={<ChevronDownIcon className="h-3 w-3" />}
        />
        <Btn
          size="sm"
          variant="ghost"
          className="h-6 px-1"
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          title={m.duplicateWave}
          aria-label={m.duplicateWave}
          icon={<CopyIcon className="h-3 w-3" />}
        />
        <Btn
          size="sm"
          variant="ghost"
          className="h-6 px-1 text-[var(--hl-ink-4)] hover:text-[var(--hl-alarm)]"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title={m.deleteWave}
          aria-label={m.deleteWave}
          icon={<TrashIcon className="h-3 w-3" />}
        />
      </div>

      {/* 迷你時間軸 */}
      {timeline.points.length > 0 && (
        <div className="relative mt-1.5 h-2 overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
          {timeline.points.map((p, i) => {
            const left = (p.time / Math.max(1000, timeline.total)) * 100;
            return (
              <div
                key={i}
                className="absolute bottom-0 top-0 w-[2px]"
                style={{ left: `${left}%`, backgroundColor: p.color }}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// 右側詳細編輯
function FullscreenWaveDetail({
  wave, waveIndex, label, onChange,
}: {
  wave: WaveConfig;
  waveIndex: number;
  label: string;
  onChange: (w: WaveConfig) => void;
}) {
  void waveIndex;
  const { t } = useTranslation();
  const m = t.modEditorExt;

  const updateEnemy = (idx: number, partial: Partial<{ type: EnemyType; count: number; delay: number }>) => {
    const next = wave.enemies.map((e, i) => (i === idx ? { ...e, ...partial } : e));
    onChange({ ...wave, enemies: next });
  };

  const removeEnemy = (idx: number) => {
    onChange({ ...wave, enemies: wave.enemies.filter((_, i) => i !== idx) });
  };

  const addEnemy = () => {
    onChange({
      ...wave,
      enemies: [...wave.enemies, { type: 'normal', count: 3, delay: 0 }],
    });
  };

  // 大型時間軸 (含敵人類型標籤)
  const timeline = useMemo(() => {
    const points: { time: number; type: string; color: string; isFirst: boolean }[] = [];
    let t = 0;
    wave.enemies.forEach((eg) => {
      if (eg.delay) t += eg.delay;
      const eData = ENEMY_DATA[eg.type as keyof typeof ENEMY_DATA];
      const color = eData?.color || '#888';
      for (let i = 0; i < eg.count; i++) {
        points.push({ time: t, type: eg.type, color, isFirst: i === 0 });
        t += GAME_CONSTANTS.ENEMY_SPAWN_DELAY;
      }
    });
    return { points, total: t };
  }, [wave.enemies]);

  const totalEnemies = wave.enemies.reduce((s, e) => s + e.count, 0);
  const totalHP = wave.enemies.reduce((s, e) => {
    const eData = ENEMY_DATA[e.type as keyof typeof ENEMY_DATA];
    return s + (eData?.health || 50) * e.count;
  }, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
      {/* 標題 + 統計 */}
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--hl-ink)]">{label}</h2>
        <div className="flex items-center gap-3">
          <StatInline
            icon={<AlienMonsterIcon className="h-3 w-3" />}
            label={m.waveTotalEnemies}
            value={totalEnemies}
            tone="alarm"
          />
          <StatInline
            icon={<HeartIcon className="h-3 w-3" />}
            label="HP"
            value={totalHP.toLocaleString()}
          />
          <Rule vertical className="h-5" />
          <label className="flex items-center gap-1.5">
            <CoinIcon className="h-3 w-3 text-[var(--hl-caution)]" />
            <span className="hl-label">{m.waveReward}</span>
            <input
              type="number"
              value={wave.reward ?? 0}
              onChange={(e) => onChange({ ...wave, reward: parseInt(e.target.value, 10) || 0 })}
              className="h-7 w-20 border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 text-right font-mono text-[12px] tabular-nums text-[var(--hl-caution)] outline-none transition-colors focus:border-[var(--hl-signal)]"
              min={0}
            />
          </label>
        </div>
      </div>

      {/* 大型時間軸：1px 刻度線 + 方塊 */}
      {timeline.points.length > 0 && (
        <div className="shrink-0 border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="hl-label">timeline</span>
            <span className="h-px flex-1 bg-[var(--hl-line)]" />
            <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
              {(timeline.total / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="relative h-12 overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
            {/* 刻度線 */}
            {Array.from({ length: Math.ceil(timeline.total / 1000) + 1 }).map((_, i) => (
              <div
                key={`tick-${i}`}
                className="absolute bottom-0 top-0 w-px bg-[var(--hl-line)]"
                style={{ left: `${(i * 1000 / Math.max(1000, timeline.total)) * 100}%` }}
              >
                <span className="absolute top-0 ml-1 font-mono text-[10px] text-[var(--hl-ink-4)]">{i}s</span>
              </div>
            ))}
            {timeline.points.map((p, i) => {
              const left = (p.time / Math.max(1000, timeline.total)) * 100;
              return (
                <div
                  key={i}
                  className="absolute bottom-3 top-3 w-1"
                  style={{ left: `${left}%`, backgroundColor: p.color }}
                  title={`${p.type} @ ${(p.time / 1000).toFixed(1)}s`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 敵人組詳細編輯 */}
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
        {wave.enemies.length === 0 && (
          <Empty title={m.noEnemies} />
        )}
        {wave.enemies.map((eg, idx) => {
          const eData = ENEMY_DATA[eg.type as keyof typeof ENEMY_DATA];
          const groupHP = (eData?.health || 50) * eg.count;
          return (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-[var(--hl-line)] bg-[var(--hl-deck)] px-3 py-2.5 transition-colors hover:border-[var(--hl-line-strong)]"
            >
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[220px] flex-1">
                  <span className="hl-label mb-1.5 block">{m.enemyType}</span>
                  <EnemyTypeSelector
                    value={eg.type}
                    onChange={(type) => updateEnemy(idx, { type })}
                    size="md"
                  />
                </div>
                <label className="flex flex-col gap-1">
                  <span className="hl-label">{m.count}</span>
                  <input
                    type="number"
                    value={eg.count}
                    onChange={(e) => updateEnemy(idx, { count: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    className="h-9 w-20 border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 text-right font-mono text-[13px] tabular-nums text-[var(--hl-ink)] outline-none transition-colors focus:border-[var(--hl-signal)]"
                    min={1}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="hl-label">{m.spawnDelay}</span>
                  <input
                    type="number"
                    value={eg.delay ?? 0}
                    onChange={(e) => updateEnemy(idx, { delay: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="h-9 w-24 border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 text-right font-mono text-[13px] tabular-nums text-[var(--hl-ink)] outline-none transition-colors focus:border-[var(--hl-signal)]"
                    min={0}
                    step={100}
                  />
                </label>
                <div className="flex flex-col gap-1">
                  <span className="hl-label">HP</span>
                  <span className="flex h-9 items-center border border-[var(--hl-line-strong)] bg-[var(--hl-deck-2)] px-3 font-mono text-[13px] tabular-nums text-[var(--hl-ink-2)]">
                    {groupHP.toLocaleString()}
                  </span>
                </div>
                <Btn
                  size="sm"
                  variant="ghost"
                  className="h-9 text-[var(--hl-ink-3)] hover:text-[var(--hl-alarm)]"
                  onClick={() => removeEnemy(idx)}
                  title={m.deleteEnemyGroup}
                  aria-label={m.deleteEnemyGroup}
                  icon={<CrossIcon className="h-3.5 w-3.5" />}
                />
              </div>
            </motion.div>
          );
        })}
        <button
          onClick={addEnemy}
          className="flex w-full items-center justify-center gap-2 border border-dashed border-[var(--hl-line)] py-2.5 font-mono text-[10px] text-[var(--hl-ink-4)] transition-colors hover:border-[var(--hl-line-strong)] hover:text-[var(--hl-ink-2)]"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          {m.addEnemyGroup}
        </button>
      </div>
    </div>
  );
}
