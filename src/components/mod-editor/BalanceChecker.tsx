import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CustomTowerData, CustomEnemyData } from '@/types/game';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import type { Translations } from '@/i18n';
import { ChartIcon, WarningIcon, TowerIcon, LightbulbIcon, AlienIcon, MoneyBagIcon } from '@/components/ui/Icons';
import { SegHead, Num } from '@/components/hl';

// 計算 DPS
export const calculateDPS = (tower: CustomTowerData): number => {
  let baseDPS = tower.damage * (tower.fireRate || 1);
  
  // 加入 DOT 傷害
  if (tower.poisonEffect && tower.poisonDamage && tower.poisonDuration) {
    baseDPS += (tower.poisonDamage * (tower.poisonDuration / 1000)) / 2;
  }
  
  return baseDPS;
};

// 計算性價比 (DPS per cost)
export const calculateEfficiency = (tower: CustomTowerData): number => {
  return calculateDPS(tower) / tower.cost;
};

// 檢查結果類型
interface BalanceIssue {
  type: 'warning' | 'danger' | 'info' | 'success';
  message: string;
  suggestion?: string;
}

type BalMsg = Translations['modEditorExt'];

// 檢查塔平衡性
export const checkTowerBalance = (tower: CustomTowerData, m: BalMsg): BalanceIssue[] => {
  const issues: BalanceIssue[] = [];
  const dps = calculateDPS(tower);
  const efficiency = calculateEfficiency(tower);
  
  // 性價比檢查
  const avgEfficiency = 0.25; // 基準塔的平均性價比
  if (efficiency > avgEfficiency * 1.5) {
    issues.push({
      type: 'warning',
      message: fillTemplate(m.balTowerEffHigh, { eff: efficiency.toFixed(3), avg: avgEfficiency.toFixed(3) }),
      suggestion: m.balTowerEffHighTip,
    });
  } else if (efficiency < avgEfficiency * 0.5) {
    issues.push({
      type: 'warning',
      message: fillTemplate(m.balTowerEffLow, { eff: efficiency.toFixed(3), avg: avgEfficiency.toFixed(3) }),
      suggestion: m.balTowerEffLowTip,
    });
  }
  
  // DPS 檢查
  if (dps > 100) {
    issues.push({
      type: 'warning',
      message: fillTemplate(m.balTowerDpsHigh, { dps: dps.toFixed(1) }),
      suggestion: m.balTowerDpsHighTip,
    });
  }
  
  // 特殊效果組合檢查
  const effectCount = [tower.splash, tower.slowEffect, tower.poisonEffect, tower.lightningEffect]
    .filter(Boolean).length;
  if (effectCount >= 3) {
    issues.push({
      type: 'warning',
      message: fillTemplate(m.balTowerEffectsMany, { count: String(effectCount) }),
      suggestion: m.balTowerEffectsManyTip,
    });
  }
  
  // 射程檢查
  if (tower.range > 300) {
    issues.push({
      type: 'info',
      message: m.balTowerRangeFar,
      suggestion: m.balTowerRangeFarTip,
    });
  }
  
  // 攻速檢查
  if ((tower.fireRate || 1) > 10) {
    issues.push({
      type: 'warning',
      message: m.balTowerFireRateHigh,
      suggestion: m.balTowerFireRateHighTip,
    });
  }
  
  // 無問題
  if (issues.length === 0) {
    issues.push({
      type: 'success',
      message: m.balTowerGood,
    });
  }
  
  return issues;
};

// 檢查敵人平衡性
export const checkEnemyBalance = (enemy: CustomEnemyData, m: BalMsg): BalanceIssue[] => {
  const issues: BalanceIssue[] = [];
  
  // 生命/獎勵比檢查
  const hpRewardRatio = enemy.health / enemy.reward;
  const avgRatio = 10; // 基準比率
  
  if (hpRewardRatio > avgRatio * 1.5) {
    issues.push({
      type: 'warning',
      message: fillTemplate(m.balEnemyHpRewardHigh, { ratio: hpRewardRatio.toFixed(1) }),
      suggestion: m.balEnemyHpRewardHighTip,
    });
  } else if (hpRewardRatio < avgRatio * 0.5) {
    issues.push({
      type: 'warning',
      message: fillTemplate(m.balEnemyHpRewardLow, { ratio: hpRewardRatio.toFixed(1) }),
      suggestion: m.balEnemyHpRewardLowTip,
    });
  }
  
  // 速度檢查
  if (enemy.speed > 3) {
    issues.push({
      type: 'warning',
      message: m.balEnemySpeedHigh,
      suggestion: m.balEnemySpeedHighTip,
    });
  }
  
  // Boss 生命檢查
  if (enemy.health > 3000) {
    issues.push({
      type: 'info',
      message: m.balEnemyHpVeryHigh,
      suggestion: m.balEnemyHpVeryHighTip,
    });
  }
  
  // 無問題
  if (issues.length === 0) {
    issues.push({
      type: 'success',
      message: m.balEnemyGood,
    });
  }
  
  return issues;
};

/* ------------------------------------------------------------------ 樣式 */

/** 狀態方塊：只有一種顏色標記，不發光、不變圓。 */
const INDICATOR_FILL = {
  success: 'bg-[var(--hl-vital)]',
  info: 'bg-[var(--hl-reach)]',
  warning: 'bg-[var(--hl-caution)]',
  danger: 'bg-[var(--hl-alarm)]',
} as const;

const ISSUE_STYLE = {
  warning: { bar: 'border-l-[var(--hl-caution)]', text: 'text-[var(--hl-caution)]' },
  danger: { bar: 'border-l-[var(--hl-alarm)]', text: 'text-[var(--hl-alarm)]' },
  info: { bar: 'border-l-[var(--hl-reach)]', text: 'text-[var(--hl-reach)]' },
  success: { bar: 'border-l-[var(--hl-vital)]', text: 'text-[var(--hl-vital)]' },
} as const;

// 平衡性指標組件
export const BalanceIndicator = ({ issues }: { issues: BalanceIssue[] }) => {
  const worstType = issues.reduce((worst, issue) => {
    if (issue.type === 'danger') return 'danger';
    if (issue.type === 'warning' && worst !== 'danger') return 'warning';
    if (issue.type === 'info' && worst === 'success') return 'info';
    return worst;
  }, 'success' as BalanceIssue['type']);
  
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 ${INDICATOR_FILL[worstType]}`}
      title={issues.map(i => i.message).join(', ')}
      aria-hidden="true"
    />
  );
};

/** 單條問題：左緣 2px 資料色條 + 文字，不用底色塊。 */
function IssueLine({ issue }: { issue: BalanceIssue }) {
  const style = ISSUE_STYLE[issue.type];
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`border-l-2 px-2 py-1 text-[11px] leading-relaxed ${style.bar}`}
    >
      <div className={style.text}>{issue.message}</div>
      {issue.suggestion && (
        <div className="mt-1 flex items-start gap-1.5 text-[var(--hl-ink-3)]">
          <LightbulbIcon className="mt-0.5 h-3 w-3 shrink-0 text-[var(--hl-caution)]" />
          <span className="min-w-0">{issue.suggestion}</span>
        </div>
      )}
    </motion.div>
  );
}

// 完整平衡報告面板
export const BalanceReport = ({ 
  towers, 
  enemies 
}: { 
  towers: CustomTowerData[];
  enemies: CustomEnemyData[];
}) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const towerIssues = useMemo(() => 
    towers.map(tower => ({
      name: tower.name,
      issues: checkTowerBalance(tower, m),
      dps: calculateDPS(tower),
      efficiency: calculateEfficiency(tower),
    })), [towers, m]);
  
  const enemyIssues = useMemo(() => 
    enemies.map(enemy => ({
      name: enemy.name,
      issues: checkEnemyBalance(enemy, m),
    })), [enemies, m]);
  
  const totalIssues = [
    ...towerIssues.flatMap(t => t.issues),
    ...enemyIssues.flatMap(e => e.issues),
  ].filter(i => i.type !== 'success');
  
  return (
    <div className="space-y-3">
      <SegHead
        label={
          <span className="flex items-center gap-1.5">
            <ChartIcon className="h-3 w-3" />
            {m.balanceReport}
          </span>
        }
        right={
          totalIssues.length === 0 ? (
            <span className="hl-label text-[var(--hl-vital)]">{m.allNormal}</span>
          ) : (
            <span className="flex items-center gap-1.5 border border-[rgba(255,182,39,0.4)] px-1.5 py-0.5">
              <WarningIcon className="h-3 w-3 text-[var(--hl-caution)]" />
              <span className="font-mono text-[10px] tabular-nums leading-none text-[var(--hl-caution)]">
                {totalIssues.length}
              </span>
              <span className="hl-label">{m.suggestions}</span>
            </span>
          )
        }
      />
      
      {/* 塔報告 */}
      {towerIssues.length > 0 && (
        <div className="space-y-1.5">
          <SegHead
            label={
              <span className="flex items-center gap-1.5">
                <TowerIcon className="h-3 w-3" />
                {m.towerData}
              </span>
            }
          />
          <div className="space-y-1">
            {towerIssues.map((tower, index) => (
              <div key={index} className="border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
                <div className="flex items-center justify-between gap-3 px-2 py-1.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <BalanceIndicator issues={tower.issues} />
                    <span className="truncate text-[11.5px] font-medium text-[var(--hl-ink)]">{tower.name}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-3">
                    <span className="flex items-baseline gap-1.5">
                      <span className="hl-label">{m.balDpsLabel}</span>
                      <Num value={tower.dps.toFixed(1)} tone="alarm" size="sm" />
                    </span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="hl-label">{m.efficiency}</span>
                      <Num value={`${(tower.efficiency * 100).toFixed(1)}%`} tone="vital" size="sm" />
                    </span>
                  </span>
                </div>
                <AnimatePresence>
                  {tower.issues.filter(i => i.type !== 'success').map((issue, i) => (
                    <IssueLine key={i} issue={issue} />
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 敵人報告 */}
      {enemyIssues.length > 0 && (
        <div className="space-y-1.5">
          <SegHead
            label={
              <span className="flex items-center gap-1.5">
                <AlienIcon className="h-3 w-3" />
                {m.enemyData}
              </span>
            }
          />
          <div className="space-y-1">
            {enemyIssues.map((enemy, index) => (
              <div key={index} className="border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <BalanceIndicator issues={enemy.issues} />
                  <span className="truncate text-[11.5px] font-medium text-[var(--hl-ink)]">{enemy.name}</span>
                </div>
                <AnimatePresence>
                  {enemy.issues.filter(i => i.type !== 'success').map((issue, i) => (
                    <IssueLine key={i} issue={issue} />
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {towers.length === 0 && enemies.length === 0 && (
        <div className="border border-dashed border-[var(--hl-line)] px-3 py-4 text-center text-[11px] text-[var(--hl-ink-3)]">
          {m.balAddContentHint}
        </div>
      )}
    </div>
  );
};

/** 圖表列：名稱 + 1px 外框底軌 + 實色塊 + 等寬數值。 */
function ChartRow({
  label,
  width,
  value,
  fill,
  tone,
  delay,
}: {
  label: string;
  width: number;
  value: string;
  fill: string;
  tone: 'reach' | 'vital';
  delay: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 truncate text-[10px] leading-none text-[var(--hl-ink-3)]" title={label}>{label}</div>
      <div className="h-2 flex-1 border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
        <motion.div
          className={`h-full ${fill}`}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.5, delay }}
        />
      </div>
      <div className="w-11 text-right">
        <Num value={value} tone={tone} size="sm" />
      </div>
    </div>
  );
}

// DPS 比較圖表
export const DPSChart = ({ towers }: { towers: CustomTowerData[] }) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const maxDPS = Math.max(...towers.map(t => calculateDPS(t)), 50);
  
  if (towers.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <SegHead
        label={
          <span className="flex items-center gap-1.5">
            <ChartIcon className="h-3 w-3" />
            {m.balDpsCompare}
          </span>
        }
      />
      <div className="space-y-1">
        {towers.map((tower, index) => {
          const dps = calculateDPS(tower);
          return (
            <ChartRow
              key={index}
              label={tower.name}
              width={(dps / maxDPS) * 100}
              value={dps.toFixed(1)}
              fill="bg-[var(--hl-reach)]"
              tone="reach"
              delay={index * 0.1}
            />
          );
        })}
      </div>
    </div>
  );
};

// 成本效益圖表
export const EfficiencyChart = ({ towers }: { towers: CustomTowerData[] }) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const maxEfficiency = Math.max(...towers.map(t => calculateEfficiency(t)), 0.5);
  
  if (towers.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <SegHead
        label={
          <span className="flex items-center gap-1.5">
            <MoneyBagIcon className="h-3 w-3" />
            {m.balEffCompare}
          </span>
        }
      />
      <div className="space-y-1">
        {towers.map((tower, index) => {
          const efficiency = calculateEfficiency(tower);
          return (
            <ChartRow
              key={index}
              label={tower.name}
              width={(efficiency / maxEfficiency) * 100}
              value={`${(efficiency * 100).toFixed(1)}%`}
              fill="bg-[var(--hl-vital)]"
              tone="vital"
              delay={index * 0.1}
            />
          );
        })}
      </div>
    </div>
  );
};
