import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ColorPicker } from './ColorPicker';
import type { CustomTowerData } from '@/types/game';
import { useTranslation } from '@/i18n';
import { 
  TrashIcon, CopyIcon, SwordIcon, TargetIcon, WaveIcon, CoinIcon, ExplosionIcon, SnowflakeIcon, SkullIcon, LightningIcon, ChevronDownIcon, SparklesIcon, ZapIcon, BoxIcon
} from '@/components/ui/Icons';
import { CustomNumberInput } from '@/components/ui/CustomNumberInput';
import TowerPreview from '@/components/ui/TowerPreview';
import { Tower3DPreview } from '@/components/ui/Model3DPreview';
import { Model3DEditor } from './model3d/Model3DEditor';
import { TowerAbilityCanvasPreview } from './TowerAbilityCanvasPreview';
import { TowerEffectBadgeList } from './TowerEffectBadge';
import { TowerEncyclopediaLink } from './ModEncyclopediaLink';
import { getTowerModelTypes } from './modEditorTowerI18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Btn, Key, SegHead, Toggle } from '@/components/hl';

// 進階面板分區標題（mono 編號 + 一路 1px 線；不加底色塊）
const SectionHeader = ({ no, title, hint, icon }: { no: string; title: string; hint?: string; icon?: React.ReactNode }) => (
  <SegHead
    className="min-w-0"
    label={
      <span className="flex items-center gap-2">
        <Key>{no}</Key>
        {icon}
        <span className="text-[var(--hl-ink-2)]">{title}</span>
      </span>
    }
    right={hint ? <span className="shrink-0 font-mono text-[9.5px] text-[var(--hl-ink-4)]">{hint}</span> : undefined}
  />
);

// 數值滑桿：標籤 mono 在上、數值等寬、控件在下
const SliderField = ({
  label, readout, note, children,
}: {
  label: string; readout: string; note?: string; children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between gap-2">
      <span className="hl-label">{label}</span>
      <span className="hl-num text-[10.5px] text-[var(--hl-ink-2)]">{readout}</span>
    </div>
    {children}
    {note && <span className="text-[10px] leading-snug text-[var(--hl-ink-3)]">{note}</span>}
  </div>
);

// 效果列：密集列（border-b 1px），右側 Toggle。選中只換文字與圖示色，不鋪底色。
const EffectRow = ({
  icon, label, description, on, onToggle, children,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  on: boolean;
  onToggle: (v: boolean) => void;
  children?: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 border-b border-[var(--hl-line)] px-2.5 py-2 last:border-b-0">
    <span className={`flex flex-shrink-0 items-center ${on ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-4)]'}`}>
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className={`block truncate text-[12.5px] font-medium ${on ? 'text-[var(--hl-ink)]' : 'text-[var(--hl-ink-2)]'}`}>
        {label}
      </span>
      <span className="mt-0.5 block truncate text-[10px] leading-snug text-[var(--hl-ink-3)]">{description}</span>
    </span>
    {children}
    <Toggle on={on} onChange={onToggle} label={label} />
  </div>
);

// 塔編輯器
export const TowerEditor = ({ 
  tower, 
  onChange, 
  onDelete,
  onDuplicate 
}: { 
  tower: CustomTowerData; 
  onChange: (tower: CustomTowerData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const towerModels = getTowerModelTypes(m);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [show3DEditor, setShow3DEditor] = useState(false);
  const hasCustom3d = !!tower.custom3d && tower.custom3d.parts.length > 0;

  return (
    <div className="group relative flex h-[380px] flex-col overflow-hidden">

      {/* 列頭：機型代號（mono）+ 名稱輸入 + 操作 */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--hl-line)] px-3">
        <span className="hl-label shrink-0 text-[var(--hl-ink-4)]">{tower.modelType || 'basic'}</span>
        <span className="h-4 w-px shrink-0 bg-[var(--hl-line)]" />
        <input
          value={tower.name}
          onChange={(e) => onChange({ ...tower, name: e.target.value })}
          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-[15px] font-semibold tracking-[-0.01em] text-[var(--hl-ink)] outline-none placeholder:text-[var(--hl-ink-4)] focus:outline-none"
          placeholder={m.towerNamePh}
        />
        <div className="flex shrink-0 items-center gap-1.5">
          <Btn
            size="sm"
            variant={hasCustom3d ? 'quiet' : 'line'}
            title={m.twCustom3dOpen}
            aria-label={m.twCustom3dOpen}
            onClick={(e) => { e.stopPropagation(); setShow3DEditor(true); }}
            icon={<BoxIcon className="h-3.5 w-3.5" />}
          />
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
            <TowerPreview towerId={tower.modelType || 'basic'} size={80} color={tower.color} />
          </div>
          <TowerEffectBadgeList tower={tower} size="sm" />
        </div>

        {/* 欄位區 */}
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3">
          <textarea
            value={tower.description}
            onChange={(e) => onChange({ ...tower, description: e.target.value })}
            className="hl-input h-auto min-h-[46px] resize-none py-1.5 text-[11.5px] leading-snug"
            placeholder={m.towerDescPh}
            rows={2}
          />

          {/* 主色 */}
          <div className="flex items-center justify-between gap-2 border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 py-1.5">
            <span className="hl-num text-[10.5px] text-[var(--hl-ink-2)]">{(tower.color || '').toUpperCase()}</span>
            <ColorPicker
              color={tower.color}
              onChange={(color) => onChange({ ...tower, color, projectileColor: color, highlightColor: color + '80' })}
            />
          </div>

          {/* 圖鑑連結 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <TowerEncyclopediaLink modelType={tower.modelType} />
          </div>

          {/* 核心數值儀表板：共用 1px 格線 */}
          <div className="grid grid-cols-4 gap-px border border-[var(--hl-line)] bg-[var(--hl-line)]">
            {/* 傷害 */}
            <div className="flex flex-col items-center gap-1.5 bg-[var(--hl-void-2)] px-1 py-2 transition-colors hover:bg-[var(--hl-deck-2)]">
              <span className="hl-label flex items-center gap-1">
                <SwordIcon className="h-3 w-3 text-[var(--hl-alarm)]" /> {m.damage}
              </span>
              <CustomNumberInput
                value={tower.damage}
                onChange={(val) => onChange({ ...tower, damage: val })}
                label="DMG"
              />
            </div>

            {/* 射程 */}
            <div className="flex flex-col items-center gap-1.5 bg-[var(--hl-void-2)] px-1 py-2 transition-colors hover:bg-[var(--hl-deck-2)]">
              <span className="hl-label flex items-center gap-1">
                <TargetIcon className="h-3 w-3 text-[var(--hl-reach)]" /> {m.range}
              </span>
              <CustomNumberInput
                value={tower.range}
                onChange={(val) => onChange({ ...tower, range: val })}
                label="RNG"
              />
            </div>

            {/* 攻速 */}
            <div className="flex flex-col items-center gap-1.5 bg-[var(--hl-void-2)] px-1 py-2 transition-colors hover:bg-[var(--hl-deck-2)]">
              <span className="hl-label flex items-center gap-1">
                <WaveIcon className="h-3 w-3 text-[var(--hl-ink-3)]" /> {m.fireRate}
              </span>
              <CustomNumberInput
                value={tower.fireRate || 1}
                onChange={(val) => onChange({ ...tower, fireRate: val })}
                step={0.1}
                label="SPD"
              />
            </div>

            {/* 價格 */}
            <div className="flex flex-col items-center gap-1.5 bg-[var(--hl-void-2)] px-1 py-2 transition-colors hover:bg-[var(--hl-deck-2)]">
              <span className="hl-label flex items-center gap-1">
                <CoinIcon className="h-3 w-3 text-[var(--hl-signal)]" /> {m.cost}
              </span>
              <CustomNumberInput
                value={tower.cost}
                onChange={(val) => onChange({ ...tower, cost: val })}
                label="GOLD"
              />
            </div>
          </div>

          {/* 展開進階設定 */}
          <div className="mt-auto flex items-center gap-2">
            <Btn
              size="sm"
              variant={showEffects ? 'quiet' : 'line'}
              className="flex-1"
              onClick={() => setShowEffects(!showEffects)}
              icon={<SparklesIcon className="h-3.5 w-3.5" />}
            >
              {m.specialEffects}
            </Btn>
            <Btn
              size="sm"
              variant={showAdvanced ? 'quiet' : 'line'}
              className="flex-1"
              onClick={() => setShowAdvanced(!showAdvanced)}
              icon={<TargetIcon className="h-3.5 w-3.5" />}
            >
              {m.modelAdvanced}
            </Btn>
          </div>
        </div>
      </div>

      {/* 覆蓋層：進階設定面板 */}
      <AnimatePresence>
        {(showEffects || showAdvanced) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-30 flex flex-col overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-deck)]"
          >
            {/* 標題與關閉鍵 */}
            <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-3">
              <span className="flex min-w-0 items-center gap-2">
                {showEffects
                  ? <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-ink-3)]" />
                  : <TargetIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-ink-3)]" />}
                <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[var(--hl-ink)]">
                  {showEffects ? m.towerEffectsTitle : m.modelAdvancedTitle}
                </span>
              </span>
              <Btn
                size="sm"
                variant="line"
                aria-label={t.common.close}
                title={t.common.close}
                onClick={() => { setShowEffects(false); setShowAdvanced(false); }}
                icon={<ChevronDownIcon className="h-3.5 w-3.5" />}
              />
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
              {showEffects && (
                <div className="space-y-2">
                  <div className="border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
                    <EffectRow
                      icon={<ExplosionIcon className="h-4 w-4" />}
                      label={m.splashLabel}
                      description={m.splashDesc}
                      on={tower.splash || false}
                      onToggle={(checked) => onChange({
                        ...tower,
                        splash: checked,
                        splashRadius: checked ? 50 : undefined
                      })}
                    >
                      {tower.splash && (
                        <>
                          <span className="hl-label shrink-0">{m.radius}</span>
                          <input
                            type="number"
                            value={tower.splashRadius || 50}
                            onChange={(e) => onChange({ ...tower, splashRadius: Number(e.target.value) })}
                            onClick={(e) => e.stopPropagation()}
                            className="hl-input h-7 w-16 shrink-0 px-1.5 text-center font-mono text-[11px]"
                          />
                        </>
                      )}
                    </EffectRow>

                    <EffectRow
                      icon={<SnowflakeIcon className="h-4 w-4" />}
                      label={m.slowLabel}
                      description={m.slowDesc}
                      on={tower.slowEffect || false}
                      onToggle={(checked) => onChange({
                        ...tower,
                        slowEffect: checked,
                        slowAmount: checked ? 0.5 : undefined,
                        slowDuration: checked ? 2000 : undefined
                      })}
                    />

                    <EffectRow
                      icon={<SkullIcon className="h-4 w-4" />}
                      label={m.poisonLabel}
                      description={m.poisonDesc}
                      on={tower.poisonEffect || false}
                      onToggle={(checked) => onChange({
                        ...tower,
                        poisonEffect: checked,
                        poisonDamage: checked ? 5 : undefined,
                        poisonDuration: checked ? 3000 : undefined
                      })}
                    />

                    <EffectRow
                      icon={<LightningIcon className="h-4 w-4" />}
                      label={m.chainLabel}
                      description={m.chainDesc}
                      on={tower.lightningEffect || false}
                      onToggle={(checked) => onChange({
                        ...tower,
                        lightningEffect: checked,
                        chainCount: checked ? 3 : undefined
                      })}
                    />
                  </div>

                  <TowerAbilityCanvasPreview tower={tower} />
                </div>
              )}

              {showAdvanced && (
                <div className="space-y-3">
                  {/* 01 · 3D 模型實時預覽（拖曳旋轉；同遊戲 3D 視圖建模） */}
                  <div className="border border-[var(--hl-line)]">
                    <div className="border-b border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2.5 py-2">
                      <SectionHeader
                        no="01"
                        title={m.twPreview3dTitle}
                        hint={m.twPreview3dHint}
                        icon={<BoxIcon className="h-3 w-3 text-[var(--hl-ink-3)]" />}
                      />
                    </div>
                    <div className="bg-[var(--hl-void-2)]">
                      <Tower3DPreview
                        towerId={tower.modelType || 'basic'}
                        color={tower.color}
                        modelScale={tower.modelScale}
                        barrelLength={tower.barrelLength}
                        glowColor={tower.glowColor || undefined}
                        glowIntensity={tower.glowIntensity}
                        custom3d={hasCustom3d ? tower.custom3d : undefined}
                        height={190}
                      />
                    </div>
                  </div>

                  {/* 02 · 自訂 3D 模型（部件級編輯器，優先層級最高） */}
                  <div className={`border p-2.5 ${hasCustom3d ? 'border-[var(--hl-line-strong)] bg-[var(--hl-deck-2)]' : 'border-[var(--hl-line)] bg-[var(--hl-deck)]'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <SectionHeader
                        no="02"
                        title={m.twCustom3dTitle}
                        icon={<BoxIcon className="h-3 w-3 text-[var(--hl-ink-3)]" />}
                      />
                      {hasCustom3d && (
                        <span className="shrink-0 border border-[var(--hl-line-strong)] px-1.5 py-[2px] font-mono text-[9.5px] leading-none text-[var(--hl-ink-2)]">
                          {fillTemplate(m.twCustom3dActive, { count: tower.custom3d!.parts.length })}
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5 flex gap-2">
                      <Btn
                        size="sm"
                        variant="line"
                        className="flex-1"
                        onClick={() => setShow3DEditor(true)}
                      >
                        {hasCustom3d ? m.twCustom3dContinue : m.twCustom3dOpen}
                      </Btn>
                      {hasCustom3d && (
                        <Btn
                          size="sm"
                          variant="danger"
                          onClick={() => onChange({ ...tower, custom3d: undefined })}
                        >
                          {m.twCustom3dClear}
                        </Btn>
                      )}
                    </div>
                    <p className="mt-2 text-[10px] leading-snug text-[var(--hl-ink-3)]">
                      {m.twCustom3dDesc}
                    </p>
                  </div>

                  {/* 03 · 基礎模型選擇（自訂模型生效時停用） */}
                  <div className={`space-y-2 ${hasCustom3d ? 'opacity-35 pointer-events-none' : ''}`}>
                    <SectionHeader
                      no="03"
                      title={m.twBaseModelTitle}
                      hint={hasCustom3d ? m.twBaseModelHintOff : m.twBaseModelHint}
                    />
                    <div className="grid grid-cols-4 gap-px border border-[var(--hl-line)] bg-[var(--hl-line)]">
                      {towerModels.map((model) => {
                        const active = (tower.modelType || 'basic') === model.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => onChange({ ...tower, modelType: model.id })}
                            className="relative flex flex-col items-center justify-center gap-1.5 bg-[var(--hl-void-2)] px-2 py-3 transition-colors duration-150 hover:bg-[var(--hl-deck-2)]"
                          >
                            <span
                              className={`absolute left-0 top-0 h-full w-[2px] ${active ? 'bg-[var(--hl-signal)]' : 'bg-transparent'}`}
                            />
                            <TowerPreview towerId={model.id} size={32} color={tower.color} />
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

                  {/* 04 · 視覺微調（自訂模型生效時停用） */}
                  <div className={`border border-[var(--hl-line)] p-2.5 ${hasCustom3d ? 'opacity-35 pointer-events-none' : ''}`}>
                    <SectionHeader
                      no="04"
                      title={m.twVisualTitle}
                      hint={hasCustom3d ? m.twVisualHintOff : m.twVisualHint}
                      icon={<TargetIcon className="h-3 w-3 text-[var(--hl-ink-3)]" />}
                    />
                    <div className="mt-2.5 grid grid-cols-2 gap-4">
                      <SliderField
                        label={m.twModelScale}
                        readout={`${(tower.modelScale || 1).toFixed(1)}x`}
                        note={m.twModelScaleNote}
                      >
                        <input
                          type="range" min="0.5" max="2" step="0.1"
                          value={tower.modelScale || 1}
                          onChange={(e) => onChange({ ...tower, modelScale: Number(e.target.value) })}
                          className="h-1 w-full appearance-none bg-[var(--hl-void-2)] accent-[var(--hl-signal)]"
                        />
                      </SliderField>
                      <SliderField
                        label={m.twBarrelLength}
                        readout={`${Math.min(tower.barrelLength || 1, 1).toFixed(1)}x`}
                        note={m.twBarrelNote}
                      >
                        <input
                          type="range" min="0.5" max="1" step="0.05"
                          value={Math.min(tower.barrelLength || 1, 1)}
                          onChange={(e) => onChange({ ...tower, barrelLength: Number(e.target.value) })}
                          className="h-1 w-full appearance-none bg-[var(--hl-void-2)] accent-[var(--hl-signal)]"
                        />
                      </SliderField>
                    </div>
                  </div>

                  {/* 05 · 光暈設定（發光件覆蓋色與強度；基礎與自訂模型皆生效） */}
                  <div className="border border-[var(--hl-line)] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <SectionHeader
                        no="05"
                        title={m.twGlowTitle}
                        hint={m.twGlowHint}
                        icon={<SparklesIcon className="h-3 w-3 text-[var(--hl-ink-3)]" />}
                      />
                      <Toggle
                        on={!!tower.glowColor}
                        onChange={() => onChange({
                          ...tower,
                          glowColor: tower.glowColor ? '' : tower.color,
                          glowIntensity: tower.glowIntensity ?? 0.5,
                        })}
                        label={m.twGlowColor}
                      />
                    </div>
                    {tower.glowColor && (
                      <div className="mt-2.5 grid grid-cols-2 items-center gap-4">
                        <div className="flex items-center gap-3">
                          <span className="hl-label">{m.twGlowColor}</span>
                          <ColorPicker
                            color={tower.glowColor}
                            onChange={(c) => onChange({ ...tower, glowColor: c })}
                          />
                        </div>
                        <SliderField
                          label={m.twGlowIntensity}
                          readout={`${Math.round((tower.glowIntensity ?? 0.5) * 100)}%`}
                        >
                          <input
                            type="range" min="0" max="1" step="0.05"
                            value={tower.glowIntensity ?? 0.5}
                            onChange={(e) => onChange({ ...tower, glowIntensity: Number(e.target.value) })}
                            className="h-1 w-full appearance-none bg-[var(--hl-void-2)] accent-[var(--hl-signal)]"
                          />
                        </SliderField>
                      </div>
                    )}
                  </div>

                  {/* 06 · 投射物設定 */}
                  <div className="border border-[var(--hl-line)] p-2.5">
                    <SectionHeader
                      no="06"
                      title={m.twProjectileTitle}
                      hint={m.twProjectileHint}
                      icon={<ZapIcon className="h-3 w-3 text-[var(--hl-ink-3)]" />}
                    />
                    <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="hl-label">{m.twProjectileSpeed}</label>
                        <input
                          type="number"
                          value={tower.projectileSpeed || 400}
                          onChange={(e) => onChange({ ...tower, projectileSpeed: Number(e.target.value) })}
                          className="hl-input font-mono text-[11.5px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="hl-label">{m.twProjectileSize}</label>
                        <input
                          type="number"
                          value={tower.projectileSize || 5}
                          onChange={(e) => onChange({ ...tower, projectileSize: Number(e.target.value) })}
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

      {/* 3D 模型編輯器（全螢幕覆蓋） */}
      <AnimatePresence>
        {show3DEditor && (
          <Model3DEditor
            tower={tower}
            onSave={(model) => {
              onChange({ ...tower, custom3d: model });
              setShow3DEditor(false);
            }}
            onClose={() => setShow3DEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
