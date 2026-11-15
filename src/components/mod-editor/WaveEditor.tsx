// 波次組編輯器 - 自訂敵人波次與生成順序
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CustomWaveData, WaveConfig } from '@/types/game';
import { ENEMY_DATA, GAME_CONSTANTS, WAVE_CONFIGS } from '@/data/gameData';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import {
  TrashIcon, CopyIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon,
  WaveIcon, AlienMonsterIcon, CoinIcon, SparklesIcon, BombIcon,
  DownloadIcon, HeartIcon, ClockIcon, EditIcon, SlidersIcon,
} from '@/components/ui/Icons';
import { FullscreenWaveEditor } from './FullscreenWaveEditor';
import { EnemyTypeSelector } from './EnemyTypeSelector';
import { WaveTimelinePreview } from './WaveTimelinePreview';
import { WaveTypeLegend } from './WaveTypeLegend';
import { reorderWaves, duplicateAllWaves, adjustFocusedIndexAfterReorder } from './waveEditorWaveOps';
import { Btn, Deck, Empty, Input, Rule, StatCell } from '@/components/hl';

// 預設波次模板
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

interface WaveEditorProps {
  waveSet: CustomWaveData;
  onChange: (data: CustomWaveData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const WaveEditor = ({ waveSet, onChange, onDelete, onDuplicate }: WaveEditorProps) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusedWaveIdx, setFocusedWaveIdx] = useState<number | null>(null);
  const [dragWaveIdx, setDragWaveIdx] = useState<number | null>(null);
  const [batchSelected, setBatchSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (focusedWaveIdx === null) return;
    document.getElementById(`wave-card-${focusedWaveIdx}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [focusedWaveIdx]);

  const updateWave = (idx: number, wave: WaveConfig) => {
    const next = [...waveSet.waves];
    next[idx] = wave;
    onChange({ ...waveSet, waves: next });
  };

  const removeWave = (idx: number) => {
    onChange({ ...waveSet, waves: waveSet.waves.filter((_, i) => i !== idx) });
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
    if (focusedWaveIdx === idx) setFocusedWaveIdx(target);
    else if (focusedWaveIdx === target) setFocusedWaveIdx(idx);
  };

  const reorderWave = (from: number, to: number) => {
    onChange({ ...waveSet, waves: reorderWaves(waveSet.waves, from, to) });
    setFocusedWaveIdx((f) => adjustFocusedIndexAfterReorder(f, from, to));
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
    setFocusedWaveIdx(null);
  };

  const batchDuplicateWaves = () => {
    if (batchSelected.size === 0) return;
    const sorted = [...batchSelected].sort((a, b) => a - b);
    const cloned = sorted.map((i) => JSON.parse(JSON.stringify(waveSet.waves[i])) as WaveConfig);
    onChange({ ...waveSet, waves: [...waveSet.waves, ...cloned] });
  };

  const addWave = (template?: WaveConfig) => {
    const newWave: WaveConfig = template || {
      enemies: [{ type: 'normal', count: 5, delay: 0 }],
      reward: 50,
    };
    onChange({ ...waveSet, waves: [...waveSet.waves, newWave] });
  };

  const totalEnemies = waveSet.waves.reduce(
    (sum, w) => sum + w.enemies.reduce((s, e) => s + e.count, 0),
    0
  );

  // 平衡統計
  const stats = (() => {
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
  })();

  const importFromDefault = (count: number) => {
    const newWaves: WaveConfig[] = WAVE_CONFIGS.slice(0, count).map((wc) => ({
      enemies: wc.enemies.map((e) => ({ type: e.type, count: e.count, delay: 0 })),
      reward: 50,
    }));
    onChange({ ...waveSet, waves: [...waveSet.waves, ...newWaves] });
  };

  return (
    <Deck className="relative flex flex-col overflow-hidden">

      {/* 標題帶：mono 標籤 + 動作 */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--cn-line-soft)] px-3">
        <WaveIcon className="h-3.5 w-3.5 shrink-0 text-[var(--arc-ink-3)]" />
        <span className="arc-label truncate">{m.waveSetTitle}</span>
        <span className="font-mono text-[10px] tabular-nums tracking-wider text-[var(--arc-ink-4)]">
          {String(waveSet.waves.length).padStart(2, '0')}
        </span>
        <span className="h-px flex-1 bg-[var(--arc-line)]" />

        <div className="flex items-center gap-1">
          <Btn
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
            title={m.fullscreenEditor}
            aria-label={m.fullscreenEditor}
            icon={<EditIcon className="h-3.5 w-3.5" />}
          />
          <Btn
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            title={m.duplicateWaveSet}
            aria-label={m.duplicateWaveSet}
            icon={<CopyIcon className="h-3.5 w-3.5" />}
          />
          <Btn
            size="sm"
            variant="ghost"
            className="text-[var(--arc-alert)] hover:text-[var(--arc-alert)]"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title={m.deleteWaveSet}
            aria-label={m.deleteWaveSet}
            icon={<TrashIcon className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      {/* 名稱與描述：標籤 mono 10px 在上，控件在下 */}
      <div className="shrink-0 space-y-2 border-b border-[var(--cn-line-soft)] px-3 py-2.5">
        <label className="flex flex-col gap-1.5">
          <span className="arc-label">{m.waveSetTitle}</span>
          <Input
            value={waveSet.name}
            onChange={(e) => onChange({ ...waveSet, name: e.target.value })}
            placeholder={m.waveNamePh}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="arc-label">{m.waveSetSubtitle}</span>
          <textarea
            value={waveSet.description}
            onChange={(e) => onChange({ ...waveSet, description: e.target.value })}
            className="w-full resize-none border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-2.5 py-1.5 text-[12.5px] leading-snug text-[var(--arc-ink)] outline-none transition-colors placeholder:text-[var(--arc-ink-4)] focus:border-[var(--arc-gold)]"
            placeholder={m.waveDescPh}
            rows={1}
          />
        </label>
      </div>

      {/* 統計列：方塊分格，1px 線 */}
      <div className="grid shrink-0 grid-cols-5 gap-px border-b border-[var(--cn-line-soft)] bg-[var(--arc-line)]">
        <div className="bg-[var(--arc-deck)] px-3 py-2">
          <StatCell label={m.waveCount} value={waveSet.waves.length} tone="signal" />
        </div>
        <div className="bg-[var(--arc-deck)] px-3 py-2">
          <StatCell label={m.waveTotalEnemies} value={totalEnemies} tone="alarm" />
        </div>
        <div className="bg-[var(--arc-deck)] px-3 py-2">
          <StatCell
            label={<span className="flex items-center gap-1"><HeartIcon className="h-2.5 w-2.5" />{m.waveStatHpLabel}</span>}
            value={stats.totalHP.toLocaleString()}
          />
        </div>
        <div className="bg-[var(--arc-deck)] px-3 py-2">
          <StatCell label={m.waveReward} value={`$${stats.totalReward}`} tone="caution" />
        </div>
        <div className="bg-[var(--arc-deck)] px-3 py-2">
          <StatCell
            label={<span className="flex items-center gap-1"><ClockIcon className="h-2.5 w-2.5" />{m.waveStatDuration}</span>}
            value={`~${(stats.totalDuration / 1000).toFixed(0)}`}
            unit="s"
            tone="reach"
          />
        </div>
      </div>

      {/* 波次時間軸預覽 */}
      {waveSet.waves.length > 0 && (
        <div className="shrink-0 border-b border-[var(--cn-line-soft)] px-3 py-2.5">
          <WaveTimelinePreview
            waveSet={waveSet}
            height={100}
            compact
            selectedWaveIndex={focusedWaveIdx}
            onWaveClick={setFocusedWaveIdx}
          />
          <WaveTypeLegend waveSet={waveSet} className="mt-2" />
        </div>
      )}

      {/* 批次選取帶 */}
      {batchSelected.size > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-3 py-2">
          <span className="font-mono text-[10px] tracking-[0.06em] text-[var(--arc-reach)]">
            {fillTemplate(m.wvBatchSelected, { count: String(batchSelected.size) })}
          </span>
          <Rule vertical className="h-5" />
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

      {/* 波次列表 */}
      <div className="relative max-h-96 space-y-1.5 overflow-y-auto p-2">
        <AnimatePresence>
          {waveSet.waves.length === 0 && (
            <Empty title={m.noWaves} className="my-3" />
          )}
          {waveSet.waves.map((wave, idx) => (
            <WaveCard
              key={`wave-${idx}-${wave.reward}`}
              waveIndex={idx}
              total={waveSet.waves.length}
              wave={wave}
              isFocused={focusedWaveIdx === idx}
              isBatchSelected={batchSelected.has(idx)}
              onToggleBatch={() => toggleBatchWave(idx)}
              isDragging={dragWaveIdx === idx}
              onFocus={() => setFocusedWaveIdx(idx)}
              onChange={(w) => updateWave(idx, w)}
              onDelete={() => removeWave(idx)}
              onDuplicate={() => duplicateWave(idx)}
              onMoveUp={() => moveWave(idx, -1)}
              onMoveDown={() => moveWave(idx, 1)}
              onDragStart={() => setDragWaveIdx(idx)}
              onDragEnd={() => setDragWaveIdx(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragWaveIdx != null) reorderWave(dragWaveIdx, idx);
                setDragWaveIdx(null);
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 加入波次 + 範本：一整條帶狀，分組之間 1px 垂直線 */}
      <div className="flex min-h-11 shrink-0 flex-wrap items-center gap-1.5 border-t border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-3 py-2">
        <Btn
          size="sm"
          variant="line"
          onClick={() => addWave()}
          icon={<PlusIcon className="h-3.5 w-3.5" />}
        >
          {m.addWave}
        </Btn>
        <Btn
          size="sm"
          variant="line"
          onClick={duplicateAllWavesHandler}
          disabled={waveSet.waves.length === 0}
          title={m.wvBatchDupAllTitle}
          icon={<CopyIcon className="h-3.5 w-3.5" />}
        >
          {m.wvBatchDupAll}
        </Btn>

        <Rule vertical className="mx-1 h-5" />
        <span className="arc-label">{m.waveQuickAdd}</span>

        <Btn
          size="sm"
          variant="line"
          className="text-[var(--arc-caution)]"
          onClick={() => addWave(templateBoss())}
          icon={<SparklesIcon className="h-3.5 w-3.5" />}
        >
          {m.waveBoss}
        </Btn>
        <Btn
          size="sm"
          variant="line"
          className="text-[var(--arc-alert)]"
          onClick={() => addWave(templateSwarm())}
          icon={<BombIcon className="h-3.5 w-3.5" />}
        >
          {m.waveSwarm}
        </Btn>
        <Btn
          size="sm"
          variant="line"
          className="text-[var(--arc-reach)]"
          onClick={() => addWave(templateMixed())}
          icon={<AlienMonsterIcon className="h-3.5 w-3.5" />}
        >
          {m.waveMixed}
        </Btn>

        <Rule vertical className="mx-1 h-5" />

        <Btn
          size="sm"
          variant="line"
          className="text-[var(--arc-vital)]"
          onClick={() => importFromDefault(5)}
          title={m.wvImport5Title}
          icon={<DownloadIcon className="h-3.5 w-3.5" />}
        >
          {m.wvImport5Default}
        </Btn>
        <Btn
          size="sm"
          variant="line"
          className="text-[var(--arc-vital)]"
          onClick={() => importFromDefault(10)}
          title={m.wvImport10Title}
          icon={<DownloadIcon className="h-3.5 w-3.5" />}
        >
          {m.wvImport10Default}
        </Btn>
      </div>

      {/* 全螢幕編輯器 */}
      <AnimatePresence>
        {isFullscreen && (
          <FullscreenWaveEditor
            waveSet={waveSet}
            onChange={onChange}
            onClose={() => setIsFullscreen(false)}
            focusedWaveIdx={focusedWaveIdx ?? undefined}
            onFocusedWaveChange={setFocusedWaveIdx}
          />
        )}
      </AnimatePresence>
    </Deck>
  );
};

// 單一波次卡片
function WaveCard({
  waveIndex, total, wave, isFocused, isBatchSelected, onToggleBatch, isDragging, onFocus, onChange, onDelete, onDuplicate,
  onMoveUp, onMoveDown, onDragStart, onDragEnd, onDragOver, onDrop,
}: {
  waveIndex: number;
  total: number;
  wave: WaveConfig;
  isFocused?: boolean;
  isBatchSelected?: boolean;
  onToggleBatch?: () => void;
  isDragging?: boolean;
  onFocus?: () => void;
  onChange: (w: WaveConfig) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const totalEnemies = wave.enemies.reduce((s, e) => s + e.count, 0);

  // 計算時間軸資料 (敵人逐個生成的時間)
  const timeline = (() => {
    const points: { time: number; type: string; color: string }[] = [];
    let t = 0;
    wave.enemies.forEach((eg) => {
      if (eg.delay) t += eg.delay;
      const eData = ENEMY_DATA[eg.type as keyof typeof ENEMY_DATA];
      const color = eData?.color || '#888';
      for (let i = 0; i < eg.count; i++) {
        points.push({ time: t, type: eg.type, color });
        t += GAME_CONSTANTS.ENEMY_SPAWN_DELAY;
      }
    });
    return { points, total: t };
  })();

  const updateEnemy = (idx: number, partial: Partial<{ type: string; count: number; delay: number }>) => {
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

  return (
    <motion.div
      id={`wave-card-${waveIndex}`}
      layout
      draggable
      onDragStart={(e) => {
        const native = (e as unknown as { dataTransfer?: DataTransfer }).dataTransfer;
        if (native) native.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onFocus}
      className={`relative cursor-pointer overflow-hidden border bg-[var(--arc-deck-2)] transition-colors ${
        isFocused
          ? 'border-[var(--arc-gold)]'
          : isBatchSelected
            ? 'border-[var(--arc-caution)]'
            : 'border-[var(--cn-line-soft)] hover:border-[var(--arc-line-strong)]'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* 選中：左緣 2px 訊號條 */}
      <span
        className={`absolute left-0 top-0 h-full w-[2px] ${
          isFocused ? 'bg-[var(--arc-gold)]' : isBatchSelected ? 'bg-[var(--arc-caution)]' : 'bg-transparent'
        }`}
      />

      {/* Wave Header */}
      <div className="flex items-center gap-2 border-b border-[var(--cn-line-soft)] px-2.5 py-2">
        <input
          type="checkbox"
          checked={!!isBatchSelected}
          onChange={(e) => { e.stopPropagation(); onToggleBatch?.(); }}
          onClick={(e) => e.stopPropagation()}
          className="h-3.5 w-3.5 shrink-0 appearance-none border border-[var(--arc-line-strong)] bg-[var(--arc-void-2)] checked:border-[var(--arc-gold)] checked:bg-[var(--arc-gold)]"
          title={m.wvBatchSelect}
        />
        <button
          type="button"
          className="cursor-grab p-1 text-[var(--arc-ink-4)] transition-colors hover:text-[var(--arc-ink-2)] active:cursor-grabbing"
          title={m.wvDragSort}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <SlidersIcon className="h-3.5 w-3.5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="whitespace-nowrap border border-[var(--arc-line-strong)] px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-[var(--arc-ink)]">
            {m.waveLabel.replace('{n}', String(waveIndex + 1))}
          </span>
          <span className="font-mono text-[10px] text-[var(--arc-ink-3)]">
            {m.waveTotalEnemies}: {totalEnemies}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <CoinIcon className="h-3.5 w-3.5 text-[var(--arc-caution)]" />
          <Input
            type="number"
            value={wave.reward ?? 0}
            onChange={(e) => onChange({ ...wave, reward: parseInt(e.target.value, 10) || 0 })}
            className="h-6 w-16 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-1.5 text-right font-mono text-[11px] tabular-nums text-[var(--arc-caution)] outline-none transition-colors focus:border-[var(--arc-gold)]"
            min={0}
            placeholder="0"
          />
        </div>

        <div className="flex items-center gap-0.5">
          <Btn
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={waveIndex === 0}
            title={m.moveWaveUp}
            aria-label={m.moveWaveUp}
            icon={<ChevronUpIcon className="h-3.5 w-3.5" />}
          />
          <Btn
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={waveIndex === total - 1}
            title={m.moveWaveDown}
            aria-label={m.moveWaveDown}
            icon={<ChevronDownIcon className="h-3.5 w-3.5" />}
          />
          <Btn
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            title={m.duplicateWave}
            aria-label={m.duplicateWave}
            icon={<CopyIcon className="h-3.5 w-3.5" />}
          />
          <Btn
            size="sm"
            variant="ghost"
            className="text-[var(--arc-ink-3)] hover:text-[var(--arc-alert)]"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title={m.deleteWave}
            aria-label={m.deleteWave}
            icon={<TrashIcon className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      {/* 時間軸預覽：1px 線 + 方塊，不發光 */}
      {timeline.points.length > 0 && (
        <div className="border-b border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-2.5 py-1.5">
          <div className="relative h-4 overflow-hidden border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
            {timeline.points.map((p, i) => {
              const left = (p.time / Math.max(1000, timeline.total)) * 100;
              return (
                <div
                  key={i}
                  className="absolute bottom-0.5 top-0.5 w-[3px]"
                  style={{ left: `${left}%`, backgroundColor: p.color }}
                  title={p.type}
                />
              );
            })}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-mono text-[10px] text-[var(--arc-ink-4)]">0s</span>
            <span className="font-mono text-[10px] text-[var(--arc-ink-4)]">{(timeline.total / 1000).toFixed(1)}s</span>
          </div>
        </div>
      )}

      {/* Enemy Groups */}
      <div className="space-y-1.5 p-2">
        {wave.enemies.length === 0 && (
          <p className="py-3 text-center font-mono text-[10px] text-[var(--arc-ink-4)]">
            {m.noEnemies}
          </p>
        )}
        {wave.enemies.map((eg, idx) => (
          <div key={idx} className="flex items-center gap-2 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-2 py-1.5">
            <div className="min-w-0 flex-1">
              <EnemyTypeSelector
                value={eg.type}
                onChange={(type) => updateEnemy(idx, { type })}
                size="sm"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="arc-label">{m.count}</span>
              <Input
                type="number"
                value={eg.count}
                onChange={(e) => updateEnemy(idx, { count: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="h-6 w-12 px-1.5 text-right font-mono text-[11px] tabular-nums text-[var(--arc-ink)] outline-none transition-colors focus:border-[var(--arc-gold)]"
                min={1}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="arc-label">{m.spawnDelay}</span>
              <Input
                type="number"
                value={eg.delay ?? 0}
                onChange={(e) => updateEnemy(idx, { delay: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="h-6 w-16 px-1.5 text-right font-mono text-[11px] tabular-nums text-[var(--arc-ink)] outline-none transition-colors focus:border-[var(--arc-gold)]"
                min={0}
                step={100}
              />
            </div>
            <Btn
              size="sm"
              variant="ghost"
              className="text-[var(--arc-ink-4)] hover:text-[var(--arc-alert)]"
              onClick={(e) => { e.stopPropagation(); removeEnemy(idx); }}
              title={m.deleteEnemyGroup}
              aria-label={m.deleteEnemyGroup}
              icon={<TrashIcon className="h-3.5 w-3.5" />}
            />
          </div>
        ))}
        <button
          onClick={addEnemy}
          className="flex w-full items-center justify-center gap-1.5 border border-dashed border-[var(--cn-line-soft)] bg-transparent py-1.5 font-mono text-[10px] text-[var(--arc-ink-4)] transition-colors hover:border-[var(--arc-line-strong)] hover:text-[var(--arc-ink-2)]"
        >
          <PlusIcon className="h-3 w-3" />
          {m.addEnemyGroup}
        </button>
      </div>
    </motion.div>
  );
}
