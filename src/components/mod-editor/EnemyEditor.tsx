import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ColorPicker } from './ColorPicker';
import type { CustomEnemyData } from '@/types/game';
import { CustomNumberInput } from '@/components/ui/CustomNumberInput';
import EnemyPreview from '@/components/ui/EnemyPreview';
import { useTranslation } from '@/i18n';
import { TrashIcon, CopyIcon, ShieldIcon, LightningIcon, CoinIcon, HeartIcon, SparklesIcon, ChevronDownIcon, StarIcon } from '@/components/ui/Icons';
import { getEnemyModelTypes } from './modEditorEnemyI18n';
import { Btn, SegHead } from '@/components/hl';

import { EnemyAbilityEditor } from './EnemyAbilityEditor';
import { EnemyAbilityBadge } from './EnemyAbilityBadge';
import { EnemyAbilityCanvasPreview } from './EnemyAbilityCanvasPreview';
import { EnemyEncyclopediaLink, AbilityEncyclopediaLink } from './ModEncyclopediaLink';

// 敵人編輯器
export const EnemyEditor = ({
  enemy, 
  onChange, 
  onDelete,
  onDuplicate
}: { 
  enemy: CustomEnemyData; 
  onChange: (enemy: CustomEnemyData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const enemyModels = getEnemyModelTypes(m);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);

  return (
    <div className="group relative flex h-[380px] flex-col overflow-hidden">

      {/* 列頭：機型代號（mono）+ 名稱輸入 + 操作 */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--hl-line)] px-3">
        <span className="hl-label shrink-0 text-[var(--hl-ink-4)]">{enemy.modelType || 'normal'}</span>
        <span className="h-4 w-px shrink-0 bg-[var(--hl-line)]" />
        <input
          value={enemy.name}
          onChange={(e) => onChange({ ...enemy, name: e.target.value })}
          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-[15px] font-semibold tracking-[-0.01em] text-[var(--hl-ink)] outline-none placeholder:text-[var(--hl-ink-4)] focus:outline-none"
          placeholder={m.enemyNamePh}
        />
        <div className="flex shrink-0 items-center gap-1.5">
          <Btn
            size="sm"
            variant="line"
            title={m.duplicate}
            aria-label={m.duplicate}
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            icon={<CopyIcon className="h-3.5 w-3.5" />}
          />
          <Btn
            size="sm"
            variant="danger"
            title={m.delete}
            aria-label={m.delete}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            icon={<TrashIcon className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      {/* 主體：左側預覽框，右側欄位 */}
      <div className="flex min-h-0 flex-1">
        {/* 預覽框：外框 1px，內部下沉一階，無陰影 */}
        <div className="flex w-[168px] shrink-0 flex-col gap-2 border-r border-[var(--hl-line)] p-3">
          <div className="flex flex-1 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
            <EnemyPreview enemyId={enemy.modelType || 'normal'} size={60} color={enemy.color} />
          </div>
        </div>

        {/* 欄位區 */}
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3">
          <textarea
            value={enemy.description}
            onChange={(e) => onChange({ ...enemy, description: e.target.value })}
            className="hl-input h-auto min-h-[46px] resize-none py-1.5 text-[11.5px] leading-snug"
            placeholder={m.enemyDescPh}
            rows={2}
          />

          {/* 主色 */}
          <div className="flex items-center justify-between gap-2 border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 py-1.5">
            <span className="hl-num text-[10.5px] text-[var(--hl-ink-2)]">{(enemy.color || '').toUpperCase()}</span>
            <ColorPicker
              color={enemy.color}
              onChange={(color) => onChange({ ...enemy, color })}
            />
          </div>

          {/* 徽章與圖鑑連結 */}
          <div className="flex flex-wrap items-center gap-1.5">
            {enemy.ability && (
              <EnemyAbilityBadge abilityId={enemy.ability} size="md" />
            )}
            <EnemyEncyclopediaLink modelType={enemy.modelType} />
            <AbilityEncyclopediaLink ability={enemy.ability} />
          </div>

          {/* 核心數值儀表板：共用 1px 格線 */}
          <div className="grid grid-cols-4 gap-px border border-[var(--hl-line)] bg-[var(--hl-line)]">
            {/* 生命值 */}
            <div className="flex flex-col items-center gap-1.5 bg-[var(--hl-void-2)] px-1 py-2 transition-colors hover:bg-[var(--hl-deck-2)]">
              <span className="hl-label flex items-center gap-1">
                <HeartIcon className="h-3 w-3 text-[var(--hl-alarm)]" /> {m.health}
              </span>
              <CustomNumberInput
                value={enemy.health}
                onChange={(val) => onChange({ ...enemy, health: val })}
                label="HP"
              />
            </div>

            {/* 速度 */}
            <div className="flex flex-col items-center gap-1.5 bg-[var(--hl-void-2)] px-1 py-2 transition-colors hover:bg-[var(--hl-deck-2)]">
              <span className="hl-label flex items-center gap-1">
                <LightningIcon className="h-3 w-3 text-[var(--hl-reach)]" /> {m.speed}
              </span>
              <CustomNumberInput
                value={enemy.speed}
                onChange={(val) => onChange({ ...enemy, speed: val })}
                step={0.1}
                label="SPD"
              />
            </div>

            {/* 獎勵金幣 */}
            <div className="flex flex-col items-center gap-1.5 bg-[var(--hl-void-2)] px-1 py-2 transition-colors hover:bg-[var(--hl-deck-2)]">
              <span className="hl-label flex items-center gap-1">
                <CoinIcon className="h-3 w-3 text-[var(--hl-caution)]" /> {m.reward}
              </span>
              <CustomNumberInput
                value={enemy.reward}
                onChange={(val) => onChange({ ...enemy, reward: val })}
                label="GOLD"
              />
            </div>

            {/* 尺寸 */}
            <div className="flex flex-col items-center gap-1.5 bg-[var(--hl-void-2)] px-1 py-2 transition-colors hover:bg-[var(--hl-deck-2)]">
              <span className="hl-label flex items-center gap-1">
                <ShieldIcon className="h-3 w-3 text-[var(--hl-ink-3)]" /> {m.size}
              </span>
              <CustomNumberInput
                value={enemy.size}
                onChange={(val) => onChange({ ...enemy, size: val })}
                label="PX"
              />
            </div>
          </div>

          {/* 展開進階設定 */}
          <div className="mt-auto flex items-center gap-2">
            <Btn
              size="sm"
              variant={showAbilities ? 'quiet' : 'line'}
              className="flex-1"
              onClick={() => setShowAbilities(!showAbilities)}
              icon={<SparklesIcon className="h-3.5 w-3.5" />}
            >
              {m.specialEffects}
            </Btn>
            <Btn
              size="sm"
              variant={showAdvanced ? 'quiet' : 'line'}
              className="flex-1"
              onClick={() => setShowAdvanced(!showAdvanced)}
              icon={<ShieldIcon className="h-3.5 w-3.5" />}
            >
              {m.modelAdvanced}
            </Btn>
          </div>
        </div>
      </div>

      {/* 覆蓋層：進階設定面板 */}
      <AnimatePresence>
        {(showAbilities || showAdvanced) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-30 flex flex-col overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-deck)]"
          >
            {/* 標題與關閉鍵 */}
            <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-3">
              <span className="flex min-w-0 items-center gap-2">
                {showAbilities
                  ? <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-ink-3)]" />
                  : <ShieldIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-ink-3)]" />}
                <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[var(--hl-ink)]">
                  {showAbilities ? m.specialEffects : m.modelAdvancedTitle}
                </span>
              </span>
              <Btn
                size="sm"
                variant="line"
                aria-label={t.common.close}
                title={t.common.close}
                onClick={() => { setShowAbilities(false); setShowAdvanced(false); }}
                icon={<ChevronDownIcon className="h-3.5 w-3.5" />}
              />
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
              {showAbilities && (
                <>
                  <EnemyAbilityEditor enemy={enemy} onChange={onChange} />
                  <EnemyAbilityCanvasPreview enemy={enemy} />
                </>
              )}

              {showAdvanced && (
                <div className="space-y-3">
                  {/* 模型選擇：共用 1px 格線，選中＝左緣 2px 訊號條 */}
                  <div className="space-y-2">
                    <SegHead label={m.eaModelPick} />
                    <div className="grid grid-cols-4 gap-px border border-[var(--hl-line)] bg-[var(--hl-line)]">
                      {enemyModels.map((model) => {
                        const active = (enemy.modelType || 'normal') === model.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => onChange({ ...enemy, modelType: model.id })}
                            className="relative flex flex-col items-center justify-center gap-1.5 bg-[var(--hl-void-2)] px-2 py-3 transition-colors duration-150 hover:bg-[var(--hl-deck-2)]"
                          >
                            <span
                              className={`absolute left-0 top-0 h-full w-[2px] ${active ? 'bg-[var(--hl-signal)]' : 'bg-transparent'}`}
                            />
                            <EnemyPreview enemyId={model.id} size={32} color={enemy.color} />
                            <span
                              className={`w-full truncate text-center font-mono text-[9.5px] leading-none ${active ? 'text-[var(--hl-ink)]' : 'text-[var(--hl-ink-3)]'}`}
                            >
                              {model.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 難度加成參數 */}
                  <div className="border border-[var(--hl-line)]">
                    <div className="flex items-center gap-2 border-b border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2.5 py-2">
                      <StarIcon className="h-3 w-3 text-[var(--hl-caution)]" />
                      <span className="hl-label text-[var(--hl-ink-2)]">{m.eaDiffBonus}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-[var(--hl-line)]">
                      <div className="flex flex-col gap-1.5 bg-[var(--hl-void-2)] px-2.5 py-2">
                        <label className="hl-label">{m.eaHpMult}</label>
                        <input
                          type="number"
                          value={(enemy as any).healthMultiplier || 1}
                          onChange={(e) => onChange({ ...enemy, healthMultiplier: Number(e.target.value) } as CustomEnemyData)}
                          step={0.1}
                          className="hl-input font-mono text-[11.5px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 bg-[var(--hl-void-2)] px-2.5 py-2">
                        <label className="hl-label">{m.eaSpdMult}</label>
                        <input
                          type="number"
                          value={(enemy as any).speedMultiplier || 1}
                          onChange={(e) => onChange({ ...enemy, speedMultiplier: Number(e.target.value) } as CustomEnemyData)}
                          step={0.1}
                          className="hl-input font-mono text-[11.5px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
