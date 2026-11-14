/**
 * Mod 管理器 — HARDLINE Console
 *
 * 版面：TopBar 52px → 左 Rail 212px（類型 / 狀態 / 標籤）＋ 主區（工具列帶 + 密集列）＋ 右詳情 376px。
 * 只有一種強調色：主行動（匯入）與選中列的左緣訊號條。
 */
import { useState, useMemo, useEffect } from 'react';
import { useModStore } from '@/store/modStore';
import { SceneShell } from '@/components/ui/SceneShell';
import { TopBar, Rail, RailItem, Btn, Chip, Meter } from '@/components/hl';
import { PackageIcon, CheckIcon, WarningIcon, PlusIcon } from '@/components/ui/Icons';
import { ModManagerToolbar, type ModTypeFilter, type ModSortBy, type ModSortDir, type ModEnabledFilter } from './mod-manager/ModManagerToolbar';
import { ModManagerGrid } from './mod-manager/ModManagerGrid';
import { ModManagerDetailPanel } from './mod-manager/ModManagerDetailPanel';
import { ModManagerBatchBar } from './mod-manager/ModManagerBatchBar';
import { ImportModDialog } from './mod-manager/ImportModDialog';
import { useTranslation } from '@/i18n';
import { analyzeModBalance } from '@/components/mod-editor/modBalanceAnalysis';

const TYPE_ORDER: ModTypeFilter[] = ['all', 'tower', 'enemy', 'map', 'wave', 'full'];
const ENABLED_ORDER: ModEnabledFilter[] = ['all', 'enabled', 'disabled'];

export default function ModManager({ embedded = false, onEdit }: { embedded?: boolean; onEdit?: () => void }) {
  const { t } = useTranslation();
  const m = t.modManager;
  const tb = m.toolbar;
  const ext = t.workshop.modManagerExt;
  const bal = t.modEditorExt;
  const mods = useModStore((s) => s.mods);
  const importMod = useModStore((s) => s.importMod);
  const enableMod = useModStore((s) => s.enableMod);
  const disableMod = useModStore((s) => s.disableMod);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [filter, setFilter] = useState<ModTypeFilter>('all');
  const [enabledFilter, setEnabledFilter] = useState<ModEnabledFilter>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [batchSelected, setBatchSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<ModSortBy>('name');
  const [sortDir, setSortDir] = useState<ModSortDir>('asc');

  const stats = useMemo(() => ({
    total: mods.length,
    enabled: mods.filter((x) => x.enabled).length,
    byType: {
      all: mods.length,
      tower: mods.filter((x) => x.metadata.type === 'tower').length,
      enemy: mods.filter((x) => x.metadata.type === 'enemy').length,
      map: mods.filter((x) => x.metadata.type === 'map').length,
      wave: mods.filter((x) => x.metadata.type === 'wave').length,
      full: mods.filter((x) => x.metadata.type === 'full').length,
    } as Record<ModTypeFilter, number>,
  }), [mods]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    mods.forEach((mod) => {
      mod.metadata.tags?.forEach((tag) => {
        const normalized = tag.trim();
        if (normalized) tagSet.add(normalized);
      });
    });
    return [...tagSet].sort((a, b) => a.localeCompare(b, 'zh-TW'));
  }, [mods]);

  const filteredMods = useMemo(() => {
    let result = mods;
    if (filter !== 'all') result = result.filter((x) => x.metadata.type === filter);
    if (enabledFilter === 'enabled') result = result.filter((x) => x.enabled);
    else if (enabledFilter === 'disabled') result = result.filter((x) => !x.enabled);
    if (tagFilter) {
      result = result.filter((x) =>
        x.metadata.tags?.some((tag) => tag.trim().toLowerCase() === tagFilter.toLowerCase()),
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((x) =>
        x.metadata.name.toLowerCase().includes(q) ||
        x.metadata.description.toLowerCase().includes(q) ||
        x.metadata.author.toLowerCase().includes(q) ||
        x.metadata.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name':
          cmp = a.metadata.name.localeCompare(b.metadata.name, 'zh-TW');
          break;
        case 'type':
          cmp = a.metadata.type.localeCompare(b.metadata.type);
          break;
        case 'enabled':
          cmp = Number(a.enabled) - Number(b.enabled);
          break;
        case 'updated':
          cmp = (a.metadata.updatedAt ?? '').localeCompare(b.metadata.updatedAt ?? '');
          break;
        case 'score': {
          const sa = analyzeModBalance(a.content.towers ?? [], a.content.enemies ?? [], a.content.waves ?? [], bal).score;
          const sb = analyzeModBalance(b.content.towers ?? [], b.content.enemies ?? [], b.content.waves ?? [], bal).score;
          cmp = sa - sb;
          break;
        }
      }
      return cmp * dir;
    });

    return result;
  }, [mods, filter, enabledFilter, tagFilter, search, sortBy, sortDir, bal]);

  const enabledInView = useMemo(
    () => filteredMods.filter((x) => x.enabled).length,
    [filteredMods],
  );

  const selectedMod = useMemo(
    () => mods.find((x) => x.metadata.id === selectedId) ?? null,
    [mods, selectedId],
  );

  useEffect(() => {
    if (filteredMods.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredMods.some((x) => x.metadata.id === selectedId)) {
      setSelectedId(filteredMods[0].metadata.id);
    }
  }, [filteredMods, selectedId]);

  const handleImport = (json: string) => {
    const result = importMod(json);
    if (result.success) {
      setImportResult({ success: true, message: m.importSuccess });
      setShowImport(false);
    } else {
      setImportResult({
        success: false,
        message: result.errorKey
          ? bal[result.errorKey]
          : (result.error || m.importFailed),
      });
    }
    window.setTimeout(() => setImportResult(null), 3000);
  };

  const emptyKind = mods.length === 0 ? 'none' : filteredMods.length === 0 ? 'filter' : 'none';

  const bulkSetEnabled = (ids: string[], enabled: boolean) => {
    ids.forEach((id) => (enabled ? enableMod(id) : disableMod(id)));
  };

  const typeLabel: Record<ModTypeFilter, string> = {
    all: tb.filterAll,
    tower: ext.modTypeTower,
    enemy: ext.modTypeEnemy,
    map: ext.modTypeMap,
    wave: ext.modTypeWave,
    full: ext.modTypeFull,
  };

  const enabledLabel: Record<ModEnabledFilter, string> = {
    all: tb.filterAll,
    enabled: tb.filterEnabled,
    disabled: tb.filterDisabled,
  };

  const body = (
    <div className="flex h-full min-h-0 w-full flex-col">
      {!embedded && (
        <TopBar
          title={m.title}
          meta={m.subtitle}
          glyph={<PackageIcon className="h-3.5 w-3.5" />}
          back={{ to: 'mainMenu' }}
          right={
            <>
              <span className="flex items-center gap-1.5 border border-[var(--hl-line)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]">
                on
                <span className="hl-num text-[11px] tabular-nums text-[var(--hl-vital)]">
                  {stats.enabled}
                </span>
                <span className="text-[var(--hl-ink-4)]">/</span>
                <span className="hl-num text-[11px] tabular-nums text-[var(--hl-ink)]">{stats.total}</span>
              </span>
              <Btn size="sm" variant="signal" icon={<PlusIcon className="h-3.5 w-3.5" />} onClick={() => setShowImport(true)}>
                {tb.importMod}
              </Btn>
            </>
          }
        />
      )}

      <div className="flex min-h-0 flex-1">
        {/* 左軌：類型 / 狀態 / 標籤 */}
        <Rail
          label="filter"
          foot={
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="hl-label">enabled</span>
                <span className="hl-num text-[11px] tabular-nums">
                  {enabledInView}/{filteredMods.length}
                </span>
              </div>
              <Meter value={filteredMods.length ? enabledInView / filteredMods.length : 0} tone="vital" />
              {embedded && (
                <Btn size="sm" variant="line" block icon={<PlusIcon className="h-3.5 w-3.5" />} onClick={() => setShowImport(true)}>
                  {tb.importMod}
                </Btn>
              )}
            </div>
          }
        >
          {TYPE_ORDER.map((id, i) => (
            <RailItem
              key={id}
              index={i + 1}
              label={typeLabel[id]}
              active={filter === id}
              onClick={() => setFilter(id)}
              right={<span className="hl-num text-[10.5px] tabular-nums text-[var(--hl-ink-4)]">{stats.byType[id]}</span>}
            />
          ))}

          <div className="px-3 pb-1 pt-3">
            <span className="hl-label">state</span>
          </div>
          {ENABLED_ORDER.map((id, i) => (
            <RailItem
              key={id}
              index={TYPE_ORDER.length + i + 1}
              label={enabledLabel[id]}
              active={enabledFilter === id}
              onClick={() => setEnabledFilter(id)}
            />
          ))}

          {allTags.length > 0 && (
            <>
              <div className="px-3 pb-1 pt-3">
                <span className="hl-label">{tb.filterTags}</span>
              </div>
              <div className="flex flex-wrap gap-1 px-2.5 pb-3">
                <Chip active={tagFilter === null} onClick={() => onTagFilterChangeSafe(null)}>
                  {tb.tagAll}
                </Chip>
                {allTags.map((tag) => (
                  <Chip
                    key={tag}
                    active={tagFilter === tag}
                    onClick={() => onTagFilterChangeSafe(tagFilter === tag ? null : tag)}
                  >
                    #{tag}
                  </Chip>
                ))}
              </div>
            </>
          )}
        </Rail>

        {/* 主區 */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--hl-void)]">
          <ModManagerToolbar
            search={search}
            sortBy={sortBy}
            sortDir={sortDir}
            filterTotal={filteredMods.length}
            enabledInView={enabledInView}
            onSearchChange={setSearch}
            onSortByChange={setSortBy}
            onSortDirToggle={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            onImport={() => setShowImport(true)}
          />

          {importResult && (
            <div
              className={[
                'flex items-center gap-2 border-b px-4 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em]',
                importResult.success
                  ? 'border-[rgba(56,224,143,0.38)] bg-[rgba(56,224,143,0.12)] text-[var(--hl-vital)]'
                  : 'border-[rgba(255,75,62,0.38)] bg-[rgba(255,75,62,0.12)] text-[var(--hl-alarm)]',
              ].join(' ')}
            >
              {importResult.success
                ? <CheckIcon className="h-3.5 w-3.5" />
                : <WarningIcon className="h-3.5 w-3.5" />}
              {importResult.message}
            </div>
          )}

          {filteredMods.length > 0 && (
            <ModManagerBatchBar
              selectedCount={batchSelected.size}
              filteredTotal={filteredMods.length}
              onEnableSelected={() => bulkSetEnabled([...batchSelected], true)}
              onDisableSelected={() => bulkSetEnabled([...batchSelected], false)}
              onEnableFiltered={() => bulkSetEnabled(filteredMods.map((x) => x.metadata.id), true)}
              onDisableFiltered={() => bulkSetEnabled(filteredMods.map((x) => x.metadata.id), false)}
              onClearSelection={() => setBatchSelected(new Set())}
            />
          )}

          <ModManagerGrid
            mods={filteredMods}
            selectedId={selectedId}
            batchSelected={batchSelected}
            onSelect={(id, opts) => {
              if (opts?.toggleBatch) {
                setBatchSelected((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
                return;
              }
              setSelectedId(id);
            }}
            onImport={() => setShowImport(true)}
            onClearFilters={() => {
              setSearch('');
              setFilter('all');
              setEnabledFilter('all');
              setTagFilter(null);
              setBatchSelected(new Set());
            }}
            emptyKind={emptyKind}
          />
        </main>

        {/* 右詳情 */}
        <aside className="flex min-h-0 w-[376px] shrink-0 flex-col overflow-hidden border-l border-[var(--hl-line)] bg-[var(--hl-deck)]">
          <div className="flex items-center gap-2 border-b border-[var(--hl-line)] px-3 py-2">
            <span className="hl-label">detail</span>
            <span className="h-px flex-1 bg-[var(--hl-line)]" />
            <span className="hl-num text-[10px] tabular-nums text-[var(--hl-ink-4)]">
              {selectedMod ? selectedMod.metadata.id.slice(0, 10) : '—'}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <ModManagerDetailPanel mod={selectedMod} onEdit={onEdit} />
          </div>
        </aside>
      </div>

      {showImport && <ImportModDialog onClose={() => setShowImport(false)} onImport={handleImport} />}
    </div>
  );

  function onTagFilterChangeSafe(tag: string | null) {
    setTagFilter(tag);
  }

  if (embedded) {
    return (
      <SceneShell scrollable={false} showGrid={false}>
        {body}
      </SceneShell>
    );
  }

  return (
    <SceneShell scrollable={false} showGrid={false}>
      {body}
    </SceneShell>
  );
}
