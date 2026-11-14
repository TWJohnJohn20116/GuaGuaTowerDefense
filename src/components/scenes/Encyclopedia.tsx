/**
 * 圖鑑 · HARDLINE Console 版面
 *
 *   TopBar（52px，含返回）→ Rail 212px（分類）+ 主區（卡片網格）+ 右側詳情欄 336/376px
 *
 *  - 卡片＝Deck，hover 只換線色
 *  - 詳情欄：標籤 mono 10px、數值 mono tabular-nums
 *  - icons / files 兩個分頁是全幅工具面板，不帶詳情欄
 */

import { useState, useMemo, useEffect, type CSSProperties, type ReactNode } from 'react';
import { useModStore } from '@/store/modStore';
import { useGameStore } from '@/store/gameStore';
import { ENEMY_DATA, TOWER_DATA, PATHS, STATUS_EFFECTS } from '@/data/gameData';
import { PLAYER_SKILLS } from '@/data/playerSkillData';
import type { EnemyType, TowerType, StatusEffectType } from '@/types/game';
import { useTranslation } from '@/i18n';
import { getPlayerSkillName, getPlayerSkillDesc, getPlayerSkillSearchText } from '@/i18n/playerSkillLabels';
import { SceneShell } from '@/components/ui/SceneShell';
import { isEncyclopediaTypingTarget, resolveEncyclopediaEscape } from '@/data/encyclopediaEscape';
import {
  BooksIcon, StarIcon, SearchIcon, CrossIcon,
} from '@/components/ui/Icons';
import { Btn, Chip, Deck, Empty, IconBtn, Input, Rail, TopBar } from '@/components/hl';
import { playUiHover } from '@/services/audioService';

// 匯入拆分的型別與常數
import type { TabType, SortType, TowerCategory, EnemyCategory, UnifiedTower, UnifiedEnemy, MapInfo } from './encyclopedia/EncyclopediaTypes';
import { SPECIAL_TOWERS, SPECIAL_ENEMIES, ALL_DIFFICULTIES } from './encyclopedia/EncyclopediaTypes';
import { getStatusEffectIcon, getPlayerSkillIcon } from './encyclopedia/EncyclopediaIcons';

import EnemyPreview from '@/components/ui/EnemyPreview';
import TowerPreview from '@/components/ui/TowerPreview';
import EnemyDetail from './encyclopedia/EnemyDetail';
import TowerDetail from './encyclopedia/TowerDetail';
import MapDetail from './encyclopedia/MapDetail';
import { DifficultyDetail, StatusEffectDetail } from './encyclopedia/DetailPanels';
import { PlayerSkillDetail } from './encyclopedia/PlayerSkillDetail';
import { EncyclopediaSidebar } from './encyclopedia/EncyclopediaSidebar';
import { IconLibraryPanel } from './encyclopedia/IconLibraryPanel';
import { FileLibraryPanel } from './encyclopedia/FileLibraryPanel';
import { EncyclopediaMapCard } from './encyclopedia/EncyclopediaMapCard';

// 匯入拆分的列表元件
import { StatsShortcut } from './encyclopedia/StatsPanels';

// 塔排序選項 (label key 來自 i18n)
const TOWER_SORT_KEYS: { key: SortType; labelKey: 'sortName' | 'sortDamage' | 'sortCost' | 'sortDps' | 'sortRange' }[] = [
  { key: 'name', labelKey: 'sortName' },
  { key: 'damage', labelKey: 'sortDamage' },
  { key: 'cost', labelKey: 'sortCost' },
  { key: 'dps', labelKey: 'sortDps' },
  { key: 'range', labelKey: 'sortRange' },
];
// 敵人排序選項 (label key 來自 i18n)
const ENEMY_SORT_KEYS: { key: SortType; labelKey: 'sortName' | 'sortHealth' | 'sortSpeed' | 'sortReward' }[] = [
  { key: 'name', labelKey: 'sortName' },
  { key: 'health', labelKey: 'sortHealth' },
  { key: 'speed', labelKey: 'sortSpeed' },
  { key: 'reward', labelKey: 'sortReward' },
];

// 計算塔 DPS
const getTowerDps = (t: UnifiedTower) => {
  if (t.damagePerSecond) return t.damagePerSecond;
  if (t.damage && t.fireRate) return t.damage * t.fireRate;
  return t.damage || 0;
};

/** 卡片外框：Deck + hover 只換線色 */
const cardClass =
  'group relative flex cursor-pointer flex-col text-left transition-colors duration-150 hover:border-[var(--arc-line-hot)]';

export default function Encyclopedia() {
  const { t } = useTranslation();
  const mods = useModStore((state) => state.mods);
  const [activeTab, setActiveTab] = useState<TabType>('towers');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // 搜尋關鍵字
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [towerCategory, setTowerCategory] = useState<TowerCategory>('all');
  const [enemyCategory, setEnemyCategory] = useState<EnemyCategory>('all');
  const [compareTowers, setCompareTowers] = useState<string[]>([]);
  const [fileFocusPath, setFileFocusPath] = useState<string | null>(null);
  const deepLink = useGameStore((s) => s.encyclopediaDeepLink);
  const goBackScene = useGameStore((s) => s.goBackScene);

  // 從暫停／遊戲內深連結進入時，自動切換分頁並開啟詳情
  useEffect(() => {
    if (!deepLink) return;

    const tab = deepLink.tab as TabType;
    setActiveTab(tab);
    setSearchTerm('');
    setSortBy('name');

    if (tab === 'enemies') {
      const isSpecial = SPECIAL_ENEMIES.includes(deepLink.itemId as EnemyType);
      setEnemyCategory(isSpecial ? 'special' : 'all');
    } else if (tab === 'towers') {
      const isSpecial = SPECIAL_TOWERS.includes(deepLink.itemId as TowerType);
      setTowerCategory(isSpecial ? 'special' : 'all');
    }

    setSelectedItem(deepLink.itemId);
    useGameStore.setState({ encyclopediaDeepLink: null });
  }, [deepLink]);

  // Esc：先關詳情，再跟標題列返回鈕一樣離開頁面
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = resolveEncyclopediaEscape({
        key: e.key,
        inTextField: isEncyclopediaTypingTarget(e.target),
        hasDetail: Boolean(selectedItem),
      });
      if (action === 'ignore') return;
      e.preventDefault();
      if (action === 'close_detail') {
        setSelectedItem(null);
        return;
      }
      goBackScene();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, goBackScene]);

  // 合併基礎資料和 Mod 資料
  const allTowers = useMemo(() => {
    const towers: UnifiedTower[] = [];
    (Object.keys(TOWER_DATA) as TowerType[]).forEach((key) => {
      const tower = TOWER_DATA[key];
      const isSpecial = SPECIAL_TOWERS.includes(key);
      towers.push({
        id: key, name: tower.name, description: tower.description, color: tower.color,
        damage: tower.damage, damagePerSecond: tower.damagePerSecond, range: tower.range,
        fireRate: tower.fireRate, cost: tower.cost, splash: tower.splash, splashRadius: tower.splashRadius,
        slowEffect: tower.slowEffect, slowAmount: tower.slowAmount, slowDuration: tower.slowDuration,
        poisonEffect: tower.poisonEffect, poisonDamage: tower.poisonDamage, poisonDuration: tower.poisonDuration,
        lightningEffect: tower.lightningEffect, chainCount: tower.chainCount, flameEffect: tower.flameEffect,
        windEffect: tower.windEffect, windKnockbackDistance: tower.windKnockbackDistance,
        isModContent: false, category: isSpecial ? 'special' : 'basic',
      });
    });
    mods.filter(m => m.enabled).forEach((mod) => {
      mod.content.towers?.forEach((tower) => {
        towers.push({
          id: tower.id, name: tower.name, description: tower.description || '', color: tower.color,
          damage: tower.damage, damagePerSecond: tower.damagePerSecond, range: tower.range,
          fireRate: tower.fireRate, cost: tower.cost, splash: tower.splash, splashRadius: tower.splashRadius,
          slowEffect: tower.slowEffect, slowAmount: tower.slowAmount, slowDuration: tower.slowDuration,
          poisonEffect: tower.poisonEffect, poisonDamage: tower.poisonDamage, poisonDuration: tower.poisonDuration,
          lightningEffect: tower.lightningEffect, chainCount: tower.chainCount,
          isModContent: true, modName: mod.metadata.name, modId: mod.metadata.id, category: 'mod',
        });
      });
    });
    return towers;
  }, [mods]);

  const allEnemies = useMemo(() => {
    const enemies: UnifiedEnemy[] = [];
    (Object.keys(ENEMY_DATA) as EnemyType[]).forEach((key) => {
      const enemy = ENEMY_DATA[key];
      const isSpecial = SPECIAL_ENEMIES.includes(key);
      enemies.push({
        id: key, name: enemy.name, description: enemy.description, color: enemy.color,
        health: enemy.health, speed: enemy.speed, reward: enemy.reward, size: enemy.size,
        ability: enemy.ability, isModContent: false, category: isSpecial ? 'special' : 'normal',
      });
    });
    mods.filter(m => m.enabled).forEach((mod) => {
      mod.content.enemies?.forEach((enemy) => {
        enemies.push({
          id: enemy.id, name: enemy.name, description: enemy.description || '', color: enemy.color,
          health: enemy.health, speed: enemy.speed, reward: enemy.reward, size: enemy.size,
          ability: enemy.ability, isModContent: true, modName: mod.metadata.name, modId: mod.metadata.id, category: 'mod',
        });
      });
    });
    return enemies;
  }, [mods]);

  // 過濾和排序
  const filteredTowers = useMemo(() => {
    let result = allTowers;
    if (towerCategory !== 'all') result = result.filter(t => t.category === towerCategory);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(term) || t.description.toLowerCase().includes(term));
    }
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'cost': return a.cost - b.cost;
        case 'damage': return (b.damage || b.damagePerSecond || 0) - (a.damage || a.damagePerSecond || 0);
        case 'dps': return getTowerDps(b) - getTowerDps(a);
        case 'range': return b.range - a.range;
        default: return a.name.localeCompare(b.name);
      }
    });
    return result;
  }, [allTowers, towerCategory, searchTerm, sortBy]);

  const filteredEnemies = useMemo(() => {
    let result = allEnemies;
    if (enemyCategory !== 'all') result = result.filter(e => e.category === enemyCategory);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(term) || e.description.toLowerCase().includes(term));
    }
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'health': return b.health - a.health;
        case 'speed': return b.speed - a.speed;
        case 'reward': return b.reward - a.reward;
        default: return a.name.localeCompare(b.name);
      }
    });
    return result;
  }, [allEnemies, enemyCategory, searchTerm, sortBy]);

  // 合併地圖資料（含搜尋過濾）
  const allMaps = useMemo(() => {
    const maps: MapInfo[] = [];
    Object.entries(PATHS).forEach(([key, path]) => {
      maps.push({ id: key, name: path.name, description: path.description, difficulty: path.difficulty,
        waypoints: path.waypoints, segments: path.segments, isModContent: false });
    });
    mods.filter(m => m.enabled).forEach((mod) => {
      mod.content.maps?.forEach((map) => {
        maps.push({ id: map.id, name: map.name, description: map.description || '', difficulty: map.difficulty,
          waypoints: map.waypoints, isModContent: true, modName: mod.metadata.name, modId: mod.metadata.id });
      });
    });
    return maps;
  }, [mods]);

  const filteredMaps = useMemo(() => {
    if (!searchTerm) return allMaps;
    const term = searchTerm.toLowerCase();
    return allMaps.filter(m => m.name.toLowerCase().includes(term) || m.description.toLowerCase().includes(term)
      || String(m.difficulty).toLowerCase().includes(term));
  }, [allMaps, searchTerm]);

  // 狀態效果（含搜尋過濾）
  const ALL_STATUS_EFFECTS = useMemo(() => Object.keys(STATUS_EFFECTS) as StatusEffectType[], []);
  const filteredEffects = useMemo(() => {
    if (!searchTerm) return ALL_STATUS_EFFECTS;
    const term = searchTerm.toLowerCase();
    return ALL_STATUS_EFFECTS.filter(e => {
      const d = STATUS_EFFECTS[e];
      return d.name.toLowerCase().includes(term) || d.description.toLowerCase().includes(term);
    });
  }, [ALL_STATUS_EFFECTS, searchTerm]);

  // 主動技能（含搜尋過濾）
  const filteredSkills = useMemo(() => {
    if (!searchTerm) return PLAYER_SKILLS;
    const term = searchTerm.toLowerCase();
    return PLAYER_SKILLS.filter((s) =>
      getPlayerSkillSearchText(s.id, t).includes(term) ||
      s.nameEn.toLowerCase().includes(term),
    );
  }, [searchTerm, t]);

  // 統計數據
  const stats = useMemo(() => ({
    totalTowers: allTowers.length,
    modTowers: allTowers.filter(t => t.category === 'mod').length,
    totalEnemies: allEnemies.length,
    modEnemies: allEnemies.filter(e => e.category === 'mod').length,
    totalMaps: allMaps.length,
    modMaps: allMaps.filter(m => m.isModContent).length,
  }), [allTowers, allEnemies, allMaps]);

  const selectedTower = allTowers.find(t => t.id === selectedItem);
  const selectedEnemy = allEnemies.find(e => e.id === selectedItem);
  const selectedMap = allMaps.find(m => m.id === selectedItem);

  // 切換標籤時重置搜尋和排序
  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedItem(null);
    setSearchTerm('');
    setSortBy('name');
  };

  const openFileInLibrary = (path: string) => {
    setFileFocusPath(path);
    setActiveTab('files');
    setSelectedItem(null);
  };

  // 塔比較切換
  const toggleCompare = (towerId: string) => {
    setCompareTowers(prev =>
      prev.includes(towerId) ? prev.filter(id => id !== towerId) : prev.length < 3 ? [...prev, towerId] : prev
    );
  };

  // 當前排序選項 (從 i18n 翻譯)
  const sortOptions = activeTab === 'towers'
    ? TOWER_SORT_KEYS.map(({ key, labelKey }) => ({ key, label: t.encyclopedia[labelKey] }))
    : activeTab === 'enemies'
      ? ENEMY_SORT_KEYS.map(({ key, labelKey }) => ({ key, label: t.encyclopedia[labelKey] }))
      : null;

  const isPanelTab = activeTab === 'icons' || activeTab === 'files';
  const hasDetailAside = !isPanelTab && activeTab !== 'stats';

  const categoryChips: { id: string; label: string; active: boolean; onClick: () => void }[] =
    activeTab === 'towers'
      ? (['all', 'basic', 'special', 'mod'] as TowerCategory[]).map((cat) => ({
        id: cat,
        label: cat === 'all' ? t.encyclopedia.filterAll : cat === 'basic' ? t.encyclopedia.filterBasic : cat === 'special' ? t.encyclopedia.filterSpecial : t.encyclopedia.filterMod,
        active: towerCategory === cat,
        onClick: () => setTowerCategory(cat),
      }))
      : activeTab === 'enemies'
        ? (['all', 'normal', 'special', 'mod'] as EnemyCategory[]).map((cat) => ({
          id: cat,
          label: cat === 'all' ? t.encyclopedia.filterAll : cat === 'normal' ? t.encyclopedia.filterNormal : cat === 'special' ? t.encyclopedia.filterSpecial : t.encyclopedia.filterMod,
          active: enemyCategory === cat,
          onClick: () => setEnemyCategory(cat),
        }))
        : [];

  const countLabel =
    activeTab === 'maps'
      ? `${t.encyclopedia.totalMapsCount.replace('{count}', String(filteredMaps.length))}${stats.modMaps > 0 ? ` (+${stats.modMaps} MOD)` : ''}`
      : activeTab === 'difficulty'
        ? t.encyclopedia.totalDifficultiesCount.replace('{count}', String(ALL_DIFFICULTIES.length))
        : activeTab === 'effects'
          ? t.encyclopedia.totalEffectsCount.replace('{count}', String(filteredEffects.length))
          : activeTab === 'skills'
            ? t.encyclopedia.totalActiveSkillsCount.replace('{count}', String(filteredSkills.length))
            : activeTab === 'towers'
              ? `${filteredTowers.length} / ${stats.totalTowers}`
              : activeTab === 'enemies'
                ? `${filteredEnemies.length} / ${stats.totalEnemies}`
                : '';

  const emptyFiltersReset = () => {
    setSearchTerm('');
    setTowerCategory('all');
    setEnemyCategory('all');
  };

  const noResults =
    (activeTab === 'towers' && filteredTowers.length === 0) ||
    (activeTab === 'enemies' && filteredEnemies.length === 0) ||
    (activeTab === 'maps' && filteredMaps.length === 0) ||
    (activeTab === 'effects' && filteredEffects.length === 0) ||
    (activeTab === 'skills' && filteredSkills.length === 0);

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={t.encyclopedia.title}
          meta={t.encyclopedia.subtitle}
          glyph={<BooksIcon className="h-4 w-4" />}
          back={{ onClick: goBackScene }}
          right={<SearchBox value={searchTerm} onChange={setSearchTerm} />}
        />

        <div className="flex min-h-0 flex-1">
          {/* 左軌：分類 */}
          <Rail label={t.encyclopedia.title}>
            <EncyclopediaSidebar activeTab={activeTab} onChange={switchTab} />
          </Rail>

          {/* 主區 */}
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--arc-void)]">
            {/* 工具列 */}
            {!isPanelTab && (
              <div className="flex flex-wrap items-center gap-2 border-b border-[var(--cn-line-soft)] px-4 py-2.5">
                {categoryChips.map((c) => (
                  <Chip key={c.id} active={c.active} onClick={c.onClick}>
                    {c.label}
                  </Chip>
                ))}

                {sortOptions && (
                  <>
                    <span className="ml-1 h-4 w-px bg-[var(--arc-line)]" />
                    <span className="arc-label">{t.encyclopedia.sortBy}</span>
                    {sortOptions.map(({ key, label }) => (
                      <Chip key={key} active={sortBy === key} onClick={() => setSortBy(key)}>
                        {label}
                      </Chip>
                    ))}
                  </>
                )}

                <span className="ml-auto font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
                  {countLabel}
                </span>
              </div>
            )}

            <div className="flex min-h-0 flex-1">
              {/* 卡片網格 / 工具面板 */}
              <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
                {activeTab === 'icons' ? (
                  <div className="flex min-h-0 flex-col p-4">
                    <IconLibraryPanel onOpenFile={openFileInLibrary} />
                  </div>
                ) : activeTab === 'files' ? (
                  <div className="flex min-h-0 flex-col p-4">
                    <FileLibraryPanel
                      onOpenTab={(tab) => switchTab(tab)}
                      focusFilePath={fileFocusPath}
                      onFocusConsumed={() => setFileFocusPath(null)}
                    />
                  </div>
                ) : activeTab === 'stats' ? (
                  <div className="p-5">
                    <StatsShortcut />
                  </div>
                ) : (
                  <div className="p-4">
                    {noResults ? (
                      <Empty
                        title={t.encyclopedia.noResults}
                        action={
                          <Btn variant="line" size="sm" onClick={emptyFiltersReset}>
                            {t.encyclopedia.clearFilter}
                          </Btn>
                        }
                      />
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {activeTab === 'towers' && filteredTowers.map(tower => (
                          <Deck
                            key={tower.id}
                            as="article"
                            active={selectedItem === tower.id}
                            className={cardClass}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedItem(tower.id)}
                              onMouseEnter={() => playUiHover()}
                              className="flex w-full flex-col gap-2 p-3 text-left"
                            >
                              <span className="flex items-start gap-2.5">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
                                  <TowerPreview
                                    towerId={tower.id}
                                    color={tower.isModContent ? tower.color : undefined}
                                    size={26}
                                    animate
                                  />
                                </span>
                                <span className="flex min-w-0 flex-1 flex-col gap-1">
                                  <span className="truncate text-[13px] font-medium leading-tight text-[var(--arc-ink)]">
                                    {tower.name}
                                  </span>
                                  <span className="truncate font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-ink-4)]">
                                    {tower.category === 'mod' ? t.encyclopedia.filterMod : tower.category === 'special' ? t.encyclopedia.filterSpecial : t.encyclopedia.filterBasic}
                                  </span>
                                </span>
                              </span>
                              <span className="line-clamp-2 text-[10.5px] leading-snug text-[var(--arc-ink-3)]">
                                {tower.description}
                              </span>
                              <span className="mt-0.5 grid grid-cols-2 gap-0 border-t border-[var(--cn-line-soft)] pt-2">
                                <CardStat
                                  label={t.encyclopedia.sortDamage}
                                  value={tower.damage || tower.damagePerSecond || '—'}
                                  tone="alarm"
                                />
                                <CardStat
                                  label={t.encyclopedia.sortCost}
                                  value={tower.cost}
                                  tone="signal"
                                  className="border-l border-[var(--cn-line-soft)] pl-2"
                                />
                              </span>
                            </button>
                          </Deck>
                        ))}

                        {activeTab === 'enemies' && filteredEnemies.map(enemy => (
                          <Deck
                            key={enemy.id}
                            as="article"
                            active={selectedItem === enemy.id}
                            className={cardClass}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedItem(enemy.id)}
                              onMouseEnter={() => playUiHover()}
                              className="flex w-full flex-col gap-2 p-3 text-left"
                            >
                              <span className="flex items-start gap-2.5">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
                                  <EnemyPreview
                                    enemyId={enemy.id}
                                    color={enemy.isModContent ? enemy.color : undefined}
                                    size={26}
                                    animate
                                  />
                                </span>
                                <span className="flex min-w-0 flex-1 flex-col gap-1">
                                  <span className="truncate text-[13px] font-medium leading-tight text-[var(--arc-ink)]">
                                    {enemy.name}
                                  </span>
                                  <span className="truncate font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-ink-4)]">
                                    {enemy.category === 'mod' ? t.encyclopedia.filterMod : enemy.category === 'special' ? t.encyclopedia.filterSpecial : t.encyclopedia.filterNormal}
                                  </span>
                                </span>
                              </span>
                              <span className="line-clamp-2 text-[10.5px] leading-snug text-[var(--arc-ink-3)]">
                                {enemy.description}
                              </span>
                              <span className="mt-0.5 grid grid-cols-2 gap-0 border-t border-[var(--cn-line-soft)] pt-2">
                                <CardStat label={t.encyclopedia.sortHealth} value={enemy.health} tone="alarm" />
                                <CardStat
                                  label={t.encyclopedia.sortSpeed}
                                  value={`${enemy.speed}x`}
                                  tone="reach"
                                  className="border-l border-[var(--cn-line-soft)] pl-2"
                                />
                              </span>
                            </button>
                          </Deck>
                        ))}

                        {activeTab === 'maps' && filteredMaps.map((map) => (
                          <EncyclopediaMapCard
                            key={map.id}
                            map={map}
                            labels={{
                              viewDetails: t.encyclopedia.viewDetails,
                              builtInMap: t.encyclopedia.builtInMap,
                              pathPoints: t.encyclopedia.pathPointsLabel,
                              forkSegments: t.encyclopedia.forkSegmentsLabel,
                              source: t.encyclopedia.source,
                              mod: t.encyclopedia.filterMod,
                              builtIn: t.encyclopedia.builtIn,
                            }}
                            onClick={() => setSelectedItem(map.id)}
                          />
                        ))}

                        {activeTab === 'difficulty' && ALL_DIFFICULTIES.map(diff => (
                          <Deck
                            key={diff}
                            as="article"
                            active={selectedItem === diff}
                            className={cardClass}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedItem(diff)}
                              onMouseEnter={() => playUiHover()}
                              className="flex w-full flex-col gap-2 p-3 text-left"
                            >
                              <span className="flex items-center gap-2">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)]">
                                  <StarIcon className="h-3.5 w-3.5" />
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--arc-ink)]">
                                  {t.encyclopedia.difficulties[diff as keyof typeof t.encyclopedia.difficulties].name}
                                </span>
                              </span>
                              <span className="line-clamp-2 text-[10.5px] leading-snug text-[var(--arc-ink-3)]">
                                {t.encyclopedia.difficulties[diff as keyof typeof t.encyclopedia.difficulties].description}
                              </span>
                            </button>
                          </Deck>
                        ))}

                        {activeTab === 'effects' && filteredEffects.map(effectId => {
                          const effect = STATUS_EFFECTS[effectId];
                          const EffectIcon = getStatusEffectIcon(effectId);
                          return (
                            <Deck
                              key={effectId}
                              as="article"
                              active={selectedItem === effectId}
                            className={cardClass}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedItem(effectId)}
                                onMouseEnter={() => playUiHover()}
                                className="flex w-full flex-col gap-2 p-3 text-left"
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className="flex h-8 w-8 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)]"
                                    style={{ color: effect.color }}
                                  >
                                    <EffectIcon className="h-4 w-4" style={{ color: effect.color } as CSSProperties} />
                                  </span>
                                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--arc-ink)]">
                                    {effect.name}
                                  </span>
                                  <span className="shrink-0 border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-[var(--arc-ink-3)]">
                                    {effect.isDebuff ? t.game.effectDebuff : t.game.effectBuff}
                                  </span>
                                </span>
                                <span className="line-clamp-2 text-[10.5px] leading-snug text-[var(--arc-ink-3)]">
                                  {effect.description}
                                </span>
                              </button>
                            </Deck>
                          );
                        })}

                        {activeTab === 'skills' && filteredSkills.map(skill => {
                          const SkillIcon = getPlayerSkillIcon(skill.effectKey);
                          return (
                            <Deck
                              key={skill.id}
                              as="article"
                              active={selectedItem === skill.id}
                            className={cardClass}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedItem(skill.id)}
                                onMouseEnter={() => playUiHover()}
                                className="flex w-full flex-col gap-2 p-3 text-left"
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className="flex h-8 w-8 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)]"
                                    style={{ color: skill.iconColor }}
                                  >
                                    <SkillIcon className="h-4 w-4" style={{ color: skill.iconColor } as CSSProperties} />
                                  </span>
                                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--arc-ink)]">
                                    {getPlayerSkillName(skill, t)}
                                  </span>
                                </span>
                                <span className="line-clamp-2 text-[10.5px] leading-snug text-[var(--arc-ink-3)]">
                                  {getPlayerSkillDesc(skill, t)}
                                </span>
                                <span className="mt-0.5 grid grid-cols-2 gap-0 border-t border-[var(--cn-line-soft)] pt-2">
                                  <CardStat label={t.game.statCooldown} value={`${skill.cooldown / 1000}s`} tone="reach" />
                                  <CardStat
                                    label={t.game.statHotkey}
                                    value={`⇧ ${skill.hotkey}`}
                                    tone="signal"
                                    className="border-l border-[var(--cn-line-soft)] pl-2"
                                  />
                                </span>
                              </button>
                            </Deck>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 右側詳情欄 */}
              {hasDetailAside && (
                <Deck as="aside" className="flex w-[336px] shrink-0 flex-col overflow-hidden arc-panel--flat xl:w-[376px]">
                  <div className="flex items-center gap-2 border-b border-[var(--cn-line-soft)] px-3 py-2.5">
                    <span className="arc-label text-[var(--arc-ink-2)]">detail</span>
                    <span className="h-px flex-1 bg-[var(--arc-line)]" />
                    {selectedItem && (
                      <IconBtn
                        label={t.encyclopedia.closeEsc}
                        onClick={() => setSelectedItem(null)}
                        className="text-[var(--arc-ink-4)] transition-colors hover:text-[var(--arc-ink-2)]"
                      >
                        <CrossIcon className="h-3.5 w-3.5" />
                      </IconBtn>
                    )}
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-3">
                    {activeTab === 'towers' && (
                      <TowerDetail
                        selectedTower={selectedTower}
                        allTowers={allTowers}
                        compareTowers={compareTowers}
                        onToggleCompare={toggleCompare}
                        onOpenFile={openFileInLibrary}
                      />
                    )}
                    {activeTab === 'enemies' && (
                      <EnemyDetail selectedEnemy={selectedEnemy} onOpenFile={openFileInLibrary} />
                    )}
                    {activeTab === 'maps' && (
                      <MapDetail selectedMap={selectedMap} onOpenFile={openFileInLibrary} />
                    )}
                    {activeTab === 'difficulty' && (
                      <DifficultyDetail selectedItem={selectedItem ?? ''} onOpenFile={openFileInLibrary} />
                    )}
                    {activeTab === 'effects' && (
                      <StatusEffectDetail
                        selectedItem={selectedItem ?? ''}
                        allStatusEffects={ALL_STATUS_EFFECTS}
                        onOpenFile={openFileInLibrary}
                      />
                    )}
                    {activeTab === 'skills' && (
                      <PlayerSkillDetail selectedItem={selectedItem ?? ''} onOpenFile={openFileInLibrary} />
                    )}
                  </div>
                </Deck>
              )}
            </div>
          </main>
        </div>
      </div>
    </SceneShell>
  );
}

/* ------------------------------------------------------------------ 小零件 */

function CardStat({
  label,
  value,
  tone = 'ink',
  className = '',
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: 'ink' | 'signal' | 'alarm' | 'reach';
  className?: string;
}) {
  const color =
    tone === 'signal'
      ? 'text-[var(--arc-gold)]'
      : tone === 'alarm'
        ? 'text-[var(--arc-alert)]'
        : tone === 'reach'
          ? 'text-[var(--arc-reach)]'
          : 'text-[var(--arc-ink)]';

  return (
    <span className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <span className="arc-label truncate">{label}</span>
      <span className={`truncate font-mono text-[11.5px] font-semibold leading-none tabular-nums ${color}`}>
        {value}
      </span>
    </span>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-44 items-center gap-2 border border-[var(--arc-line-strong)] bg-[var(--arc-void-2)] pl-2.5 sm:w-60">
      <SearchIcon className="h-3.5 w-3.5 shrink-0 text-[var(--arc-ink-3)]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.encyclopedia.searchPlaceholder}
        className="h-9 min-w-0 flex-1 border-0 bg-transparent px-0 font-mono text-[11.5px] placeholder:text-[var(--arc-ink-4)] focus:border-0"
      />
      {value.length > 0 && (
        <IconBtn
          label={t.encyclopedia.clearFilter}
          onClick={() => onChange('')}
          className="pr-2 text-[var(--arc-ink-4)] transition-colors hover:text-[var(--arc-ink-2)]"
        >
          <CrossIcon className="h-3.5 w-3.5" />
        </IconBtn>
      )}
    </div>
  );
}
