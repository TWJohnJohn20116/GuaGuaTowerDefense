/**
 * 內容頁 · 公式產生器
 *
 * 兩種模式：
 *   基本 —— 手動設定「波數／每波成長／每幾波出王」，沿用原本的 generateWaves。
 *   曲線 —— 給總 HP 與形狀，反推每波數量與血量倍率（WaveConfig 沒有全域 HP，
 *           只能用 hpScale × 數量去逼近）。
 *
 * 面板只負責收參數與預覽，產生結果一律往上丟（onGenerate），不自己寫 store。
 */
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Btn, Chip, Input } from '@/components/hl';
import type { WaveConfig } from '@/types/game';
import {
  describeCurve,
  describeFormula,
  fitCurveWaves,
  generateWaves,
  type CurveFormula,
  type CurveShape,
  type WaveFormula,
} from '@/workshop/content/waveFormula';

interface EnemyOption {
  id: string;
  name: string;
  health: number;
}

interface WaveFormulaPanelProps {
  formula: WaveFormula;
  curve: CurveFormula;
  enemyOptions: readonly EnemyOption[];
  onFormula: (patch: Partial<WaveFormula>) => void;
  onCurve: (patch: Partial<CurveFormula>) => void;
  onGenerate: (configs: WaveConfig[], mode: 'replace' | 'append') => void;
  className?: string;
}

export function WaveFormulaPanel({
  formula,
  curve,
  enemyOptions,
  onFormula,
  onCurve,
  onGenerate,
  className = '',
}: WaveFormulaPanelProps) {
  const { t } = useTranslation();
  const c = t.studio.content.formula;

  const [mode, setMode] = useState<'basic' | 'curve'>('basic');
  const fitted = describeCurve(curve);
  const summary =
    mode === 'basic'
      ? describeFormula(formula)
      : fillTemplate(c.fitResult, { n: String(fitted.waves), hp: String(fitted.totalHp) });

  const shapes: { id: CurveShape; label: string }[] = [
    { id: 'linear', label: c.curveShapeLinear },
    { id: 'ease', label: c.curveShapeEase },
    { id: 'spike', label: fillTemplate(c.curveShapeSpike, { n: String(curve.spikeEvery) }) },
  ];

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-1">
        <Chip active={mode === 'basic'} onClick={() => setMode('basic')} className="shrink-0 whitespace-nowrap px-1.5 py-0.5 text-[9px]">
          {c.modeBasic}
        </Chip>
        <Chip active={mode === 'curve'} onClick={() => setMode('curve')} className="shrink-0 whitespace-nowrap px-1.5 py-0.5 text-[9px]">
          {c.modeCurve}
        </Chip>
        <span className="ml-auto min-w-0 truncate font-mono text-[10px] text-[var(--cn-ink-3)]">{summary}</span>
      </div>

      {mode === 'basic' ? (
        <>
          <div className="flex flex-wrap items-end gap-1.5">
            <label className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.waves}</span>
              <Input
                type="number"
                min={1}
                max={200}
                value={formula.waves}
                onChange={(event) => onFormula({ waves: Number.parseInt(event.target.value, 10) || 1 })}
                className="h-7 w-16 px-1 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.growth}</span>
              <Input
                type="number"
                min={0}
                max={50}
                value={formula.countGrowth}
                onChange={(event) => onFormula({ countGrowth: Number.parseInt(event.target.value, 10) || 0 })}
                className="h-7 w-16 px-1 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.bossEvery}</span>
              <Input
                type="number"
                min={0}
                max={50}
                value={formula.bossEvery}
                onChange={(event) => onFormula({ bossEvery: Number.parseInt(event.target.value, 10) || 0 })}
                className="h-7 w-16 px-1 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.bossCount}</span>
              <Input
                type="number"
                min={1}
                max={20}
                value={formula.bossCount}
                onChange={(event) => onFormula({ bossCount: Number.parseInt(event.target.value, 10) || 1 })}
                className="h-7 w-16 px-1 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>
            <Btn size="sm" variant="signal" onClick={() => onGenerate(generateWaves(formula), 'replace')}>
              {c.applyReplace}
            </Btn>
          </div>
          <p className="arc-micro">{describeFormula(formula)}</p>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-1">
            {enemyOptions.map((option) => (
              <Chip
                key={option.id}
                active={curve.type === option.id}
                onClick={() => onCurve({ type: option.id, baseHealth: Math.max(1, option.health) })}
                className="px-1.5 py-0.5 text-[9px]"
              >
                {option.name}
              </Chip>
            ))}
            {enemyOptions.length === 0 && <span className="arc-micro">{c.needEnemy}</span>}
          </div>

          <div className="flex flex-wrap items-end gap-1.5">
            <label className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.curveTarget}</span>
              <Input
                type="number"
                min={100}
                step={500}
                value={curve.targetHp}
                onChange={(event) => onCurve({ targetHp: Number.parseInt(event.target.value, 10) || 100 })}
                className="h-7 w-24 px-1 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.curveWaves}</span>
              <Input
                type="number"
                min={1}
                max={200}
                value={curve.waves}
                onChange={(event) => onCurve({ waves: Number.parseInt(event.target.value, 10) || 1 })}
                className="h-7 w-16 px-1 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.curveInterval}</span>
              <Input
                type="number"
                min={50}
                step={50}
                value={curve.intervalMs}
                onChange={(event) => onCurve({ intervalMs: Number.parseInt(event.target.value, 10) || 50 })}
                className="h-7 w-20 px-1 text-right font-mono text-[10.5px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className="arc-label text-[var(--cn-ink-3)]">{c.curveShape}</span>
            {shapes.map((shape) => (
              <Chip
                key={shape.id}
                active={curve.shape === shape.id}
                onClick={() => onCurve({ shape: shape.id })}
                className="px-1.5 py-0.5 text-[9px]"
              >
                {shape.label}
              </Chip>
            ))}
          </div>

          <p className="arc-micro">{fillTemplate(c.fitResult, { n: String(fitted.waves), hp: String(fitted.totalHp) })}</p>

          <div className="flex flex-wrap items-center gap-1">
            <Btn
              size="sm"
              variant="signal"
              disabled={enemyOptions.length === 0}
              onClick={() => onGenerate(fitCurveWaves(curve), 'replace')}
            >
              {c.applyReplace}
            </Btn>
            <Btn
              size="sm"
              variant="line"
              disabled={enemyOptions.length === 0}
              onClick={() => onGenerate(fitCurveWaves(curve), 'append')}
            >
              {c.applyAppend}
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}
