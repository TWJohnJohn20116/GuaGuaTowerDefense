/**
 * 紀念堂 · HARDLINE Page
 *
 * TopBar 52px → 內容單欄 max-w-[1080px]（左右 24px）。
 * 條目是密集列表，展開在該列下方，沒有卡片、沒有徑向漸層。
 */
import { useMemo, useState, useEffect } from 'react';
import { SceneShell } from '@/components/ui/SceneShell';
import { Empty, SegHead, TopBar } from '@/components/hl';
import { MEMORIAL_ENTRIES } from '@/data/memorialData';
import { MemorialCard } from './memorial/MemorialCard';
import { MemorialSidebar, type MemorialFilterMode } from './memorial/MemorialSidebar';
import { MemorialDetailPanel } from './memorial/MemorialDetailPanel';
import { useTranslation } from '@/i18n';

export default function Memorial() {
  const { t } = useTranslation();
  const m = t.memorial;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MemorialFilterMode>('all');
  const [search, setSearch] = useState('');

  const filteredEntries = useMemo(() => {    const q = search.trim().toLowerCase();
    return MEMORIAL_ENTRIES.filter((entry) => {
      if (filter !== 'all' && entry.origin !== filter) return false;
      if (q) {
        const haystack = `${entry.name} ${entry.rank} ${entry.shortBio}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [filter, search]);

  useEffect(() => {
    if (filteredEntries.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredEntries.some((e) => e.id === selectedId)) {
      setSelectedId(filteredEntries[0].id);
    }
  }, [filteredEntries, selectedId]);

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={m.pageTitle}
          meta={m.pageSubtitle}
          back={{ to: 'mainMenu' }}
          right={
            <span className="font-mono text-[10px] tabular-nums tracking-[0.08em] text-[var(--hl-ink-4)]">
              {`${filteredEntries.length}/${MEMORIAL_ENTRIES.length}`}
            </span>
          }
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1080px] px-6 py-4">
            <div className="sticky top-0 z-10">
              <MemorialSidebar
                filter={filter}
                search={search}
                count={filteredEntries.length}
                onFilterChange={setFilter}
                onSearchChange={setSearch}
              />
            </div>

            <div className="mt-3">
              <SegHead label={m.pageTitle} />
            </div>

            <div className="mt-2 border-t border-[var(--hl-line)]">
              {filteredEntries.length === 0 ? (
                <Empty title={m.noResults} className="mt-4" />
              ) : (
                filteredEntries.map((entry, index) => (
                  <div key={entry.id}>
                    <MemorialCard
                      entry={entry}
                      onClick={() => setSelectedId(selectedId === entry.id ? null : entry.id)}
                      index={index + 1}
                      selected={selectedId === entry.id}
                    />
                    {selectedId === entry.id && <MemorialDetailPanel entry={entry} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}
