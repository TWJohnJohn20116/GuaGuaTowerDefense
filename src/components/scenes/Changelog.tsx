/**
 * 更新日誌場景 — HARDLINE Page 版面
 * TopBar 52px + 單欄 max-w-[1080px]；版本卡＝左 mono 版本號 + 右變更條目。
 */

import { useMemo, useState } from 'react';
import { SceneShell } from '@/components/ui/SceneShell';
import { ClipboardIcon, CrossIcon, SearchIcon } from '@/components/ui/Icons';
import { Btn, Input, TopBar } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { parseChangelog, calculateStats } from '@/components/changelog';
import { ChangelogStats } from '@/components/scenes/changelog-scene/ChangelogStats';
import { ChangelogHero } from '@/components/scenes/changelog-scene/ChangelogHero';
import { ChangelogVersionCard } from '@/components/scenes/changelog-scene/ChangelogVersionCard';
import changelogContent from '../../../CHANGELOG.md?raw';

export default function Changelog() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set(['latest']));

  const sections = useMemo(() => parseChangelog(changelogContent), []);

  const stats = useMemo(() => calculateStats(sections), [sections]);

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const term = searchTerm.toLowerCase();
    return sections.filter((section) =>
      section.version.includes(term)
      || section.changes.some((change) =>
        change.title.toLowerCase().includes(term)
        || change.items.some((item) => {
          if (item.type === 'text') return (item.content as string).toLowerCase().includes(term);
          return false;
        })
      )
    );
  }, [sections, searchTerm]);

  const isSearching = searchTerm.trim().length > 0;
  const latestSection = sections[0] ?? null;
  const listSections = isSearching ? filteredSections : filteredSections.slice(1);

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      const key = version === sections[0]?.version ? 'latest' : version;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isExpanded = (version: string, index: number) =>
    expandedVersions.has(version) || (index === 0 && expandedVersions.has('latest'));

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={t.changelog.title}
          meta={t.changelog.subtitle}
          glyph={<ClipboardIcon className="h-4 w-4" />}
          back={{ to: 'mainMenu' }}
          right={(
            <ChangelogStats
              totalVersions={stats.totalVersions}
              totalChanges={stats.totalChanges}
              majorUpdates={stats.majorUpdates}
              featureUpdates={stats.featureUpdates}
            />
          )}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1080px] px-6 py-5">
            {/* 搜尋：1px 輸入框 + 清除 */}
            <div className="flex items-center gap-1.5">
              <div className="relative min-w-0 flex-1">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--arc-ink-4)]" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.changelog.searchPlaceholder}
                  className="pl-8"
                />
              </div>
              {searchTerm.length > 0 && (
                <Btn variant="line" size="md" onClick={() => setSearchTerm('')} className="w-9 px-0">
                  <CrossIcon className="h-3.5 w-3.5" />
                </Btn>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              {!isSearching && latestSection && <ChangelogHero section={latestSection} />}

              {isSearching && (
                <div className="flex items-center gap-2">
                  <span className="arc-label">{t.changelog.searchResults}</span>
                  <span className="arc-divider flex-1" />
                  <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                    {filteredSections.length} {t.changelog.versions}
                  </span>
                </div>
              )}

              {filteredSections.length === 0 ? (
                <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 border border-dashed border-[var(--cn-line-soft)] px-6 py-12 text-center">
                  <SearchIcon className="h-5 w-5 text-[var(--arc-ink-4)]" />
                  <span className="arc-label">{t.changelog.noResults}</span>
                </div>
              ) : listSections.length === 0 && !isSearching ? (
                <p className="py-4 text-center arc-label">僅有目前版本</p>
              ) : (
                listSections.map((section, index) => (
                  <ChangelogVersionCard
                    key={section.version}
                    section={section}
                    isExpanded={isSearching ? true : isExpanded(section.version, index + 1)}
                    isLatest={false}
                    onToggle={() => toggleVersion(section.version)}
                    index={index}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </SceneShell>
  );
}
