/**
 * Mod 編輯器 · 中央主區 — HARDLINE
 *
 * 帶狀標題（h-11）＋密集清單：每個項目是一段 1px 分隔的區塊，不做卡片堆疊。
 */
import { motion, AnimatePresence } from 'framer-motion';
import type { CustomTowerData, CustomEnemyData, CustomMapData, CustomWaveData, ModItem, ModType } from '@/types/game';
import type { CustomScriptData } from '@/types/modScript';
import { useTranslation } from '@/i18n';
import {
  TowerEditor, EnemyEditor, MapEditorPanel,
  towerTemplates, enemyTemplates,
} from '@/components/mod-editor';
import { WaveEditor } from '@/components/mod-editor/WaveEditor';
import { ScriptEditor } from '@/components/mod-editor/ScriptEditor';
import { ModEditorSettingsTab } from '@/components/scenes/mod-editor-scene/ModEditorSettingsTab';
import { PlusIcon, TemplateIcon } from '@/components/ui/Icons';
import type { ModValidationFlag } from '@/types/game';
import { getItemValidationLevel, validationRingClass } from '@/components/mod-editor/modValidationFlags';
import { Btn, Empty, Num } from '@/components/hl';

export type ContentTab = 'settings' | 'towers' | 'enemies' | 'maps' | 'waves' | 'scripts';

interface TabConfig {
  id: ContentTab;
  label: string;
  icon: React.ReactNode;
}

interface ModEditorContentPanelProps {
  activeTab: ContentTab;
  tabsConfig: TabConfig[];
  modName: string;
  modDescription: string;
  modAuthor: string;
  modVersion: string;
  modType: ModType;
  modIcon: string;
  currentItems: Array<{ id: string }>;
  onModNameChange: (v: string) => void;
  onModDescriptionChange: (v: string) => void;
  onModAuthorChange: (v: string) => void;
  onModVersionChange: (v: string) => void;
  onModTypeChange: (v: ModType) => void;
  onOpenIconEditor: () => void;
  onAddItem: () => void;
  onAddFromTemplate: (index: number) => void;
  onUpdateItem: (index: number, item: ModItem) => void;
  onDeleteItem: (index: number) => void;
  onDuplicateItem: (index: number) => void;
  validationFlags?: ModValidationFlag[];
}

/** 樣板下拉：1px 外框、深底、無圓角、無陰影 */
function TemplateMenu({
  label,
  items,
  onPick,
}: {
  label: string;
  items: { name: string; color: string; hint: string }[];
  onPick: (index: number) => void;
}) {
  return (
    <div className="group relative">
      <Btn size="sm" variant="line" icon={<TemplateIcon className="h-3.5 w-3.5" />}>
        {label}
      </Btn>
      <div className="invisible absolute right-0 top-full z-50 mt-1 max-h-64 w-64 overflow-y-auto border border-[var(--arc-line-strong)] bg-[var(--arc-void-2)] opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
        {items.map((item, i) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onPick(i)}
            className="flex w-full items-center gap-2 border-b border-[var(--cn-line-soft)] px-2.5 py-1.5 text-left transition-colors last:border-b-0 hover:bg-[var(--arc-deck-2)]"
          >
            <span className="h-3 w-3 shrink-0 border border-[var(--arc-line-strong)]" style={{ backgroundColor: item.color }} />
            <span className="min-w-0">
              <span className="block truncate text-[11.5px] text-[var(--arc-ink)]">{item.name}</span>
              <span className="block truncate font-mono text-[9.5px] text-[var(--arc-ink-4)]">{item.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ModEditorContentPanel({
  activeTab,
  tabsConfig,
  modName,
  modDescription,
  modAuthor,
  modVersion,
  modType,
  modIcon,
  currentItems,
  onModNameChange,
  onModDescriptionChange,
  onModAuthorChange,
  onModVersionChange,
  onModTypeChange,
  onOpenIconEditor,
  onAddItem,
  onAddFromTemplate,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  validationFlags,
}: ModEditorContentPanelProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const activeLabel = tabsConfig.find((tab) => tab.id === activeTab)?.label ?? '';
  const activeIcon = tabsConfig.find((tab) => tab.id === activeTab)?.icon;
  const itemCount = activeTab === 'settings' ? null : currentItems.length;

  const towerHints = towerTemplates.map((tpl) => ({
    name: tpl.name,
    color: tpl.color,
    hint: m.templateStatTower
      .replace('{damage}', String(tpl.damage))
      .replace('{range}', String(tpl.range))
      .replace('{cost}', String(tpl.cost)),
  }));

  const enemyHints = enemyTemplates.map((tpl) => ({
    name: tpl.name,
    color: tpl.color,
    hint: m.templateStatEnemy
      .replace('{health}', String(tpl.health))
      .replace('{speed}', String(tpl.speed))
      .replace('{reward}', String(tpl.reward)),
  }));

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--arc-void)]">
      {/* 帶狀標題 */}
      <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-[var(--cn-line-soft)] bg-[var(--arc-void)] px-3">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)]">
          {activeIcon}
        </span>
        <span className="arc-label whitespace-nowrap">
          {activeLabel} {m.listSuffix}
        </span>
        <Num
          value={itemCount === null ? '--' : String(itemCount).padStart(2, '0')}
          tone="signal"
          size="sm"
          className="font-mono tabular-nums"
        />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {activeTab === 'towers' && (
            <TemplateMenu
              label={m.template}
              items={towerHints}
              onPick={onAddFromTemplate}
            />
          )}
          {activeTab === 'enemies' && (
            <TemplateMenu
              label={m.template}
              items={enemyHints}
              onPick={onAddFromTemplate}
            />
          )}
          {activeTab !== 'settings' && (
            <>
              <span className="h-5 w-px bg-[var(--arc-line)]" aria-hidden="true" />
              <Btn
                size="sm"
                variant="signal"
                onClick={onAddItem}
                icon={<PlusIcon className="h-3.5 w-3.5" />}
              >
                {m.addLabel.replace('{label}', activeLabel)}
              </Btn>
            </>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === 'settings' ? (
          <ModEditorSettingsTab
            modName={modName}
            modDescription={modDescription}
            modAuthor={modAuthor}
            modVersion={modVersion}
            modType={modType}
            modIcon={modIcon}
            onModNameChange={onModNameChange}
            onModDescriptionChange={onModDescriptionChange}
            onModAuthorChange={onModAuthorChange}
            onModVersionChange={onModVersionChange}
            onModTypeChange={onModTypeChange}
            onOpenIconEditor={onOpenIconEditor}
          />
        ) : currentItems.length === 0 ? (
          <div className="p-4">
            <Empty
              title={m.emptyNone.replace('{label}', activeLabel)}
              hint={m.emptyHint}
              action={
                <Btn size="sm" variant="line" onClick={onAddItem} icon={<PlusIcon className="h-3.5 w-3.5" />}>
                  {m.addLabel.replace('{label}', activeLabel)}
                </Btn>
              }
            />
          </div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence>
              {currentItems.map((item, index) => {
                const valLevel = getItemValidationLevel(validationFlags, activeTab, index);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`border-b border-[var(--cn-line-soft)] ${validationRingClass(valLevel)}`}
                  >
                    {activeTab === 'towers' && (
                      <TowerEditor
                        tower={item as CustomTowerData}
                        onChange={(x) => onUpdateItem(index, x)}
                        onDelete={() => onDeleteItem(index)}
                        onDuplicate={() => onDuplicateItem(index)}
                      />
                    )}
                    {activeTab === 'enemies' && (
                      <EnemyEditor
                        enemy={item as CustomEnemyData}
                        onChange={(x) => onUpdateItem(index, x)}
                        onDelete={() => onDeleteItem(index)}
                        onDuplicate={() => onDuplicateItem(index)}
                      />
                    )}
                    {activeTab === 'maps' && (
                      <MapEditorPanel
                        map={item as CustomMapData}
                        onChange={(map) => onUpdateItem(index, map)}
                        onDelete={() => onDeleteItem(index)}
                        onDuplicate={() => onDuplicateItem(index)}
                      />
                    )}
                    {activeTab === 'waves' && (
                      <WaveEditor
                        waveSet={item as CustomWaveData}
                        onChange={(w) => onUpdateItem(index, w)}
                        onDelete={() => onDeleteItem(index)}
                        onDuplicate={() => onDuplicateItem(index)}
                      />
                    )}
                    {activeTab === 'scripts' && (
                      <ScriptEditor
                        script={item as CustomScriptData}
                        onChange={(x) => onUpdateItem(index, x)}
                        onDelete={() => onDeleteItem(index)}
                        onDuplicate={() => onDuplicateItem(index)}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
