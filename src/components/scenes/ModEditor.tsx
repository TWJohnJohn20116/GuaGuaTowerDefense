import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useModStore } from '@/store/modStore';
import { useTranslation } from '@/i18n';
import type { Mod, ModType, ModItem, CustomTowerData, CustomEnemyData, CustomMapData, CustomWaveData, CustomScriptData } from '@/types/game';
import { SceneShell } from '@/components/ui/SceneShell';
import { 
  defaultColors, 
  towerTemplates, 
  enemyTemplates, 
  ModIconEditor
} from '@/components/mod-editor';
import { ModPreviewSidebar } from '@/components/mod-editor/ModPreviewSidebar';
import { validateModContent, formatValidationMessage } from '@/components/mod-editor/modValidation';
import { ModEditorContentPanel, type ContentTab } from '@/components/scenes/mod-editor-scene/ModEditorContentPanel';
import { ModEditorSidebarNav } from '@/components/scenes/mod-editor-scene/ModEditorSidebarNav';
import { ModEditorHeader } from '@/components/scenes/mod-editor-scene/ModEditorHeader';
import { ModEditorEmbeddedBar } from '@/components/scenes/mod-editor-scene/ModEditorEmbeddedBar';
import { ModEditorSaveToast } from '@/components/scenes/mod-editor-scene/ModEditorSaveToast';
import { ModImportExportDialogs } from '@/components/scenes/mod-editor-scene/ModImportExportDialogs';
import {
  mergeModImportContent,
  detectImportConflict,
  type ImportMergeMode,
} from '@/components/scenes/mod-editor-scene/modEditorImportMerge';
import { 
  TowerIcon, AlienIcon, MapIcon,
  WaveIcon,
  PlayIcon,
  SettingsIcon,
} from '@/components/ui/Icons';
import {
  createScriptSkeleton,
  SCRIPT_DEFAULT_HOOKS,
  SCRIPT_DEFAULT_PERMISSIONS,
} from '@/components/mod-editor/scriptTemplate';

// 主 Mod 編輯器組件
export default function ModEditor({ embedded = false }: { embedded?: boolean } = {}) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const tabsConfig: { id: ContentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'settings', label: t.modEditorExt.tabSettings, icon: <SettingsIcon className="h-3.5 w-3.5" /> },
    { id: 'towers', label: t.modEditorExt.tabTowers, icon: <TowerIcon className="h-3.5 w-3.5" /> },
    { id: 'enemies', label: t.modEditorExt.tabEnemies, icon: <AlienIcon className="h-3.5 w-3.5" /> },
    { id: 'maps', label: t.modEditorExt.tabMaps, icon: <MapIcon className="h-3.5 w-3.5" /> },
    { id: 'waves', label: t.modEditorExt.tabWaves, icon: <WaveIcon className="h-3.5 w-3.5" /> },
    { id: 'scripts', label: t.modEditorExt.tabScripts, icon: <PlayIcon className="h-3.5 w-3.5" /> },
  ];
  const installMod = useModStore((s) => s.installMod);
  const updateMod = useModStore((s) => s.updateMod);
  const installedMods = useModStore((s) => s.mods);
  const editingMod = useModStore((s) => s.editingMod);
  const setEditingMod = useModStore((s) => s.setEditingMod);
  const modEditorFocus = useModStore((s) => s.modEditorFocus);
  const clearModEditorFocus = useModStore((s) => s.clearModEditorFocus);

  // 狀態
  const [activeTab, setActiveTab] = useState<ContentTab>('settings');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [editingModId, setEditingModId] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSelection, setExportSelection] = useState({ towers: true, enemies: true, maps: true, waves: true, scripts: true });
  const [importJson, setImportJson] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importMergeMode, setImportMergeMode] = useState<ImportMergeMode>('replace');
  const [importError, setImportError] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  // Mod 元數據
  const [modName, setModName] = useState(m.defaultModName);
  const [modDescription, setModDescription] = useState(m.defaultModDesc);
  const [modAuthor, setModAuthor] = useState(m.defaultAuthor);
  const [modVersion, setModVersion] = useState('1.0.0');
  const [modType, setModType] = useState<ModType>('full');
  const [modIcon, setModIcon] = useState('');
  const [showIconEditor, setShowIconEditor] = useState(false);

  // Mod 內容
  const [towers, setTowers] = useState<CustomTowerData[]>([]);
  const [enemies, setEnemies] = useState<CustomEnemyData[]>([]);
  const [maps, setMaps] = useState<CustomMapData[]>([]);
  const [waves, setWaves] = useState<CustomWaveData[]>([]);
  const [scripts, setScripts] = useState<CustomScriptData[]>([]);

  // 當前選中的項目
  const currentItems = activeTab === 'settings' ? []
    : activeTab === 'towers' ? towers 
    : activeTab === 'enemies' ? enemies 
    : activeTab === 'maps' ? maps
    : activeTab === 'scripts' ? scripts
    : waves;

  // 載入編輯中的 Mod
  useEffect(() => {
    if (editingMod) {
      setEditingModId(editingMod.metadata.id);
      setModName(editingMod.metadata.name);
      setModDescription(editingMod.metadata.description);
      setModAuthor(editingMod.metadata.author);
      setModVersion(editingMod.metadata.version);
      setModType(editingMod.metadata.type);
      setModIcon(editingMod.metadata.icon || '');
      setTowers(editingMod.content.towers || []);
      setEnemies(editingMod.content.enemies || []);
      setMaps(editingMod.content.maps || []);
      setWaves(editingMod.content.waves || []);
      setScripts(editingMod.content.scripts || []);
      if (modEditorFocus) {
        setActiveTab(modEditorFocus.tab);
        const list = modEditorFocus.tab === 'towers'
          ? editingMod.content.towers
          : modEditorFocus.tab === 'enemies'
            ? editingMod.content.enemies
            : modEditorFocus.tab === 'maps'
              ? editingMod.content.maps
              : modEditorFocus.tab === 'scripts'
                ? editingMod.content.scripts
                : editingMod.content.waves;
        const idx = modEditorFocus.itemId
          ? (list ?? []).findIndex((item) => item.id === modEditorFocus.itemId)
          : -1;
        setSelectedItemIndex(idx >= 0 ? idx : null);
        clearModEditorFocus();
      }
      setEditingMod(null);
    }
  }, [editingMod, modEditorFocus, setEditingMod, clearModEditorFocus]);

  // 生成唯一 ID
  const generateId = () => `custom_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  // 添加/更新/刪除/複製函數
  const addItem = () => {
    const id = generateId();
    const randomColor = () => defaultColors[Math.floor(Math.random() * defaultColors.length)];

    if (activeTab === 'towers') {
      setTowers([...towers, {
        id, modId: '', name: m.newTower, damage: 20, range: 100, fireRate: 1, cost: 100,
        color: randomColor(),
        projectileColor: '#ffffff', highlightColor: '#ffffff80', description: m.customTower,
      }]);
    } else if (activeTab === 'enemies') {
      setEnemies([...enemies, {
        id, modId: '', name: m.newEnemy, health: 100, speed: 1, reward: 10, size: 12,
        color: randomColor(), description: m.customEnemy,
      }]);
    } else if (activeTab === 'maps') {
      setMaps([...maps, {
        id, modId: '', name: m.newMap, description: m.customMap, difficulty: 'medium', waypoints: [],
      }]);
    } else if (activeTab === 'waves') {
      setWaves([...waves, {
        id, modId: '', name: m.newWaveSet, description: m.customWave,
        waves: [{ enemies: [{ type: 'normal', count: 5, delay: 0 }], reward: 50 }],
      }]);
    } else if (activeTab === 'scripts') {
      setScripts([...scripts, {
        id, modId: '', name: m.newScript, description: m.customScript,
        hooks: [...SCRIPT_DEFAULT_HOOKS],
        permissions: [...SCRIPT_DEFAULT_PERMISSIONS],
        code: createScriptSkeleton(),
      }]);
    }

    setSelectedItemIndex(currentItems.length);
  };

  const addFromTemplate = (templateIndex: number) => {
    if (activeTab === 'towers') {
      const template = towerTemplates[templateIndex];
      const newTower: CustomTowerData = {
        id: generateId(), modId: '', name: template.name + m.customSuffix,
        damage: template.damage, range: template.range, fireRate: template.fireRate, cost: template.cost,
        color: template.color, projectileColor: template.color, highlightColor: template.color + '80',
        description: m.fromTemplateTower,
        splash: template.splash, splashRadius: template.splashRadius,
        slowEffect: template.slowEffect, slowAmount: template.slowAmount, slowDuration: template.slowDuration,
        poisonEffect: template.poisonEffect, poisonDamage: template.poisonDamage, poisonDuration: template.poisonDuration,
      };
      setTowers([...towers, newTower]);
      setSelectedItemIndex(towers.length);
    } else if (activeTab === 'enemies') {
      const template = enemyTemplates[templateIndex];
      const newEnemy: CustomEnemyData = {
        id: generateId(), modId: '', name: template.name + m.customSuffix,
        health: template.health, speed: template.speed, reward: template.reward, size: template.size,
        color: template.color, description: m.fromTemplateEnemy, ability: template.ability,
      };
      setEnemies([...enemies, newEnemy]);
      setSelectedItemIndex(enemies.length);
    }
  };

  const updateItem = (index: number, item: ModItem) => {
    // 呼叫端本來就依 activeTab 傳對應型別；union 陣列無法自動窄化，所以在分支處收斂一次
    if (activeTab === 'towers') { const newTowers = [...towers]; newTowers[index] = item as CustomTowerData; setTowers(newTowers); }
    else if (activeTab === 'enemies') { const newEnemies = [...enemies]; newEnemies[index] = item as CustomEnemyData; setEnemies(newEnemies); }
    else if (activeTab === 'maps') { const newMaps = [...maps]; newMaps[index] = item as CustomMapData; setMaps(newMaps); }
    else if (activeTab === 'waves') { const newWaves = [...waves]; newWaves[index] = item as CustomWaveData; setWaves(newWaves); }
    else if (activeTab === 'scripts') { const newScripts = [...scripts]; newScripts[index] = item as CustomScriptData; setScripts(newScripts); }
  };

  const deleteItem = (index: number) => {
    if (activeTab === 'towers') setTowers(towers.filter((_, i) => i !== index));
    else if (activeTab === 'enemies') setEnemies(enemies.filter((_, i) => i !== index));
    else if (activeTab === 'maps') setMaps(maps.filter((_, i) => i !== index));
    else if (activeTab === 'waves') setWaves(waves.filter((_, i) => i !== index));
    else if (activeTab === 'scripts') setScripts(scripts.filter((_, i) => i !== index));
    if (selectedItemIndex === index) setSelectedItemIndex(null);
    else if (selectedItemIndex !== null && selectedItemIndex > index) setSelectedItemIndex(selectedItemIndex - 1);
  };

  const duplicateItem = (index: number) => {
    // 深拷貝（JSON 來回）是刻意的：避免複本與原件共用同一份巢狀陣列（波次、路徑點）
    const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
    if (activeTab === 'towers') {
      const src = towers[index];
      setTowers([...towers, { ...clone(src), id: generateId(), name: src.name + m.duplicateSuffix }]);
    } else if (activeTab === 'enemies') {
      const src = enemies[index];
      setEnemies([...enemies, { ...clone(src), id: generateId(), name: src.name + m.duplicateSuffix }]);
    } else if (activeTab === 'maps') {
      const src = maps[index];
      setMaps([...maps, { ...clone(src), id: generateId(), name: src.name + m.duplicateSuffix }]);
    } else if (activeTab === 'waves') {
      const src = waves[index];
      setWaves([...waves, { ...clone(src), id: generateId(), name: src.name + m.duplicateSuffix }]);
    } else if (activeTab === 'scripts') {
      const src = scripts[index];
      setScripts([...scripts, { ...clone(src), id: generateId(), name: src.name + m.duplicateSuffix }]);
    }
    setSelectedItemIndex(currentItems.length);
  };

  const buildMod = (): Mod => {
    const modId = editingModId ?? `mod_${Date.now()}`;
    return {
      metadata: { id: modId, name: modName, version: modVersion, author: modAuthor, description: modDescription, type: modType, icon: modIcon, gameVersion: '2.3.0', tags: [m.customTag], createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] },
      content: {
        towers: towers.length > 0 ? towers.map(t => ({ ...t, modId })) : undefined,
        enemies: enemies.length > 0 ? enemies.map(e => ({ ...e, modId })) : undefined,
        maps: maps.length > 0 ? maps.map(m => ({ ...m, modId })) : undefined,
        waves: waves.length > 0 ? waves.map(w => ({ ...w, modId })) : undefined,
        scripts: scripts.length > 0 ? scripts.map(s => ({ ...s, modId })) : undefined,
      },
      enabled: false, loadOrder: 999,
    };
  };

  const draftValidation = useMemo(
    () => validateModContent(buildMod(), {
      installedModIds: installedMods.map((mod) => mod.metadata.id),
      editingModId,
    }, m),
    [modName, modVersion, modAuthor, modDescription, modType, modIcon, towers, enemies, maps, waves, scripts, editingModId, installedMods, m],
  );

  const importPreview = useMemo(() => {
    if (!importJson.trim()) return null;
    try {
      const parsed = JSON.parse(importJson) as Mod;
      if (!parsed.metadata || !parsed.content) return null;
      return validateModContent(parsed, {
        installedModIds: installedMods.map((mod) => mod.metadata.id),
        editingModId,
      }, m);
    } catch {
      return null;
    }
  }, [importJson, installedMods, editingModId, m]);

  const saveMod = () => {
    const mod = buildMod();
    const validation = draftValidation;
    if (!validation.valid) {
      setSaveMessage({ type: 'error', text: formatValidationMessage(validation, m) });
      setTimeout(() => setSaveMessage(null), 5000);
      return;
    }
    if (editingModId) {
      updateMod(mod);
      setSaveMessage({ type: 'success', text: m.modUpdated });
    } else {
      installMod(mod);
      setSaveMessage({ type: 'success', text: m.modSaved });
    }
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const exportJson = () => {
    // 開啟匯出對話框
    setShowExportDialog(true);
  };

  const handleExportConfirm = (returnJson = false) => {
    const modId = `mod_${Date.now()}`;
    const exportMod: Mod = {
      metadata: { 
        id: modId, name: modName, version: modVersion, author: modAuthor, description: modDescription, type: modType, icon: modIcon,
        gameVersion: '2.3.0', tags: [m.customTag], createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] 
      },
      content: {
        towers: (exportSelection.towers && towers.length > 0) ? towers.map(t => ({ ...t, modId })) : undefined,
        enemies: (exportSelection.enemies && enemies.length > 0) ? enemies.map(e => ({ ...e, modId })) : undefined,
        maps: (exportSelection.maps && maps.length > 0) ? maps.map(m => ({ ...m, modId })) : undefined,
        waves: (exportSelection.waves && waves.length > 0) ? waves.map(w => ({ ...w, modId })) : undefined,
        scripts: (exportSelection.scripts && scripts.length > 0) ? scripts.map(s => ({ ...s, modId })) : undefined,
      },
      enabled: false, loadOrder: 999,
    };
    
    const jsonStr = JSON.stringify(exportMod, null, 2);
    setShowExportDialog(false);

    if (returnJson) {
      return jsonStr;
    }

    navigator.clipboard.writeText(jsonStr);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const draftMod = useMemo(() => buildMod(), [modName, modVersion, modAuthor, modDescription, modType, modIcon, towers, enemies, maps, waves, scripts, editingModId, m.customTag]);

  const baselineMod = useMemo(
    () => (editingModId ? installedMods.find((mod) => mod.metadata.id === editingModId) ?? null : null),
    [editingModId, installedMods],
  );

  const importIdConflict = useMemo(() => {
    if (!importJson.trim()) return false;
    try {
      const parsed = JSON.parse(importJson) as Mod;
      return detectImportConflict(
        parsed,
        installedMods.map((mod) => mod.metadata.id),
        editingModId,
      );
    } catch {
      return false;
    }
  }, [importJson, installedMods, editingModId]);

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson) as Mod;
      if (!parsed.metadata || !parsed.content) throw new Error(m.formatError);
      const validation = validateModContent(parsed, {
        installedModIds: installedMods.map((mod) => mod.metadata.id),
        editingModId,
      }, m);
      if (!validation.valid && importMergeMode === 'replace') {
        setImportError(formatValidationMessage(validation, m));
        return;
      }
      if (parsed.metadata.name && importMergeMode === 'replace') setModName(parsed.metadata.name);
      if (parsed.metadata.description && importMergeMode === 'replace') setModDescription(parsed.metadata.description);
      if (parsed.metadata.author && importMergeMode === 'replace') setModAuthor(parsed.metadata.author);
      if (parsed.metadata.version && importMergeMode === 'replace') setModVersion(parsed.metadata.version);
      if (parsed.metadata.type && importMergeMode === 'replace') setModType(parsed.metadata.type);
      if (parsed.metadata.icon !== undefined && importMergeMode === 'replace') setModIcon(parsed.metadata.icon);

      const merged = mergeModImportContent(
        { towers, enemies, maps, waves, scripts },
        parsed.content,
        importMergeMode,
        generateId,
      );
      setTowers(merged.towers);
      setEnemies(merged.enemies);
      setMaps(merged.maps);
      setWaves(merged.waves);
      setScripts(merged.scripts);

      setShowImportDialog(false);
      setImportJson('');
      setImportFileName('');
      setSaveMessage({
        type: 'success',
        text: importMergeMode === 'merge' ? m.modImportMerged : m.importSuccess,
      });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setImportError(m.importJsonError);
    }
  };

  const getItemCount = (tab: ContentTab) => {
    switch (tab) {
      case 'settings': return undefined;
      case 'towers': return towers.length;
      case 'enemies': return enemies.length;
      case 'maps': return maps.length;
      case 'waves': return waves.length;
      case 'scripts': return scripts.length;
    }
  };


  const editorContent = (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--arc-void)]">
      {/* 頂列（HARDLINE TopBar；嵌入時由外層 CreativeWorkshop 提供統一 Tab） */}
      {!embedded && (
        <ModEditorHeader
          title={t.workshop.title}
          subtitle={`${modName || m.unnamedMod} · v${modVersion}`}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview((v) => !v)}
          onSave={saveMod}
          onExport={exportJson}
          onImport={() => setShowImportDialog(true)}
        />
      )}

      {/* 嵌入模式：一條帶狀列，保留 Mod 名稱與儲存入口 */}
      {embedded && (
        <ModEditorEmbeddedBar
          modName={modName}
          modVersion={modVersion}
          modIcon={modIcon}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview((v) => !v)}
          onSave={saveMod}
          onExport={exportJson}
          onImport={() => setShowImportDialog(true)}
        />
      )}

      <ModEditorSaveToast
        message={saveMessage}
        onDismiss={() => setSaveMessage(null)}
      />

      {/* Console 三欄：左軌 212 / 主區 / 右預覽 */}
      <div className="flex min-h-0 flex-1">
        <ModEditorSidebarNav
          tabsConfig={tabsConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getItemCount={getItemCount}
          validationFlags={draftValidation.flags}
        />

        <ModEditorContentPanel
          activeTab={activeTab}
          tabsConfig={tabsConfig}
          modName={modName}
          modDescription={modDescription}
          modAuthor={modAuthor}
          modVersion={modVersion}
          modType={modType}
          modIcon={modIcon}
          currentItems={currentItems}
          onModNameChange={setModName}
          onModDescriptionChange={setModDescription}
          onModAuthorChange={setModAuthor}
          onModVersionChange={setModVersion}
          onModTypeChange={setModType}
          onOpenIconEditor={() => setShowIconEditor(true)}
          onAddItem={addItem}
          onAddFromTemplate={addFromTemplate}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
          onDuplicateItem={duplicateItem}
          validationFlags={draftValidation.flags}
        />

        <ModPreviewSidebar
          open={showPreview}
          onToggle={() => setShowPreview((v) => !v)}
          modName={modName}
          modDescription={modDescription}
          modVersion={modVersion}
          modAuthor={modAuthor}
          towers={towers}
          enemies={enemies}
          maps={maps}
          waves={waves}
          validation={draftValidation}
          draftMod={draftMod}
          baselineMod={baselineMod}
        />
      </div>

      <ModImportExportDialogs
        showExport={showExportDialog}
        showImport={showImportDialog}
        exportSelection={exportSelection}
        towersCount={towers.length}
        enemiesCount={enemies.length}
        mapsCount={maps.length}
        wavesCount={waves.length}
        scriptsCount={scripts.length}
        modName={modName}
        importJson={importJson}
        importFileName={importFileName}
        importError={importError}
        importPreview={importPreview}
        importMergeMode={importMergeMode}
        hasIdConflict={importIdConflict}
        draftMod={draftMod}
        onCloseExport={() => setShowExportDialog(false)}
        onCloseImport={() => setShowImportDialog(false)}
        onExportSelectionChange={setExportSelection}
        onCopyExport={() => {
          handleExportConfirm();
          setSaveMessage({ type: 'success', text: m.copiedClipboard });
        }}
        onDownloadExport={() => {
          const json = handleExportConfirm(true);
          if (json) {
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${modName || 'my_mod'}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setSaveMessage({ type: 'success', text: m.downloadStarted });
          }
        }}
        onImportJsonChange={(v) => { setImportJson(v); setImportError(''); }}
        onImportFileLoad={(name, content) => {
          setImportFileName(name);
          setImportJson(content);
          setImportError('');
        }}
        onImportMergeModeChange={setImportMergeMode}
        onImportConfirm={handleImport}
      />

      {/* 圖標編輯器 */}
      <AnimatePresence>
        {showIconEditor && (
          <ModIconEditor
            initialData={modIcon}
            onSave={(data) => {
              setModIcon(data);
              setShowIconEditor(false);
            }}
            onClose={() => setShowIconEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );

  if (embedded) {
    return editorContent;
  }

  return (
    <SceneShell scrollable={false} showGrid={false}>
      {editorContent}
    </SceneShell>
  );
}
