/**
 * 商店 · HARDLINE Console
 *
 * TopBar 52px → 左軌 212px（分類）＋ 主區（商品格）＋ 右側詳情 336–376px。
 * 購買流程、鍵盤導覽與商品資料全部沿用原邏輯，只換版面與外觀。
 */

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useShopStore, TOWER_SHOP_PRICES, PLAYER_SKILL_SHOP_PRICES } from '@/store/shopStore';
import type { TowerType } from '@/types/game';
import { PLAYER_SKILLS, PLAYER_SKILL_BY_ID } from '@/data/playerSkillData';
import { useTranslation } from '@/i18n';
import { getPlayerSkillName } from '@/i18n/playerSkillLabels';
import { SceneShell } from '@/components/ui/SceneShell';
import { TopBar, Rail, RailItem, SegHead, Key } from '@/components/hl';
import { ShopIcon } from '@/components/ui/Icons';
import {
  BASIC_TOWERS, SPECIAL_TOWERS, ALL_TOWER_TYPES, getTowerName,
} from './shop/shopData';
import type { ShopTab, ShopSelection } from './shop/shopData';
import { ShopGrid } from './shop/ShopGrid';
import { ShopDetailPanel } from './shop/ShopDetailPanel';
import { ShopHeaderStats } from './shop/ShopHeaderStats';
import { ShopToolbar, type TowerFilter } from './shop/ShopToolbar';
import { ShopPurchaseToast } from './shop/ShopPurchaseToast';
import { ShopSuggestionBanner } from './shop/ShopSuggestionBanner';
import { nextShopSelection, isShopTypingTarget, resolveShopHotkey } from '@/data/shopKeyboardNav';

type ShopCategory = TowerFilter | 'skills';

export default function Shop() {
  const { t } = useTranslation();
  const s = t.shop;
  const coins = useShopStore((st) => st.coins);
  const unlockedTowers = useShopStore((st) => st.unlockedTowers);
  const purchaseTower = useShopStore((st) => st.purchaseTower);
  const unlockedPlayerSkills = useShopStore((st) => st.unlockedPlayerSkills);
  const purchasePlayerSkill = useShopStore((st) => st.purchasePlayerSkill);

  const [tab, setTab] = useState<ShopTab>('towers');
  const [towerFilter, setTowerFilter] = useState<TowerFilter>('all');
  const [selection, setSelection] = useState<ShopSelection | null>({ kind: 'tower', id: 'basic' });
  const [purchaseResult, setPurchaseResult] = useState<{ name: string; success: boolean } | null>(null);

  const filteredTowers = useMemo<TowerType[]>(() => {
    if (towerFilter === 'basic') return BASIC_TOWERS;
    if (towerFilter === 'special') return SPECIAL_TOWERS;
    return ALL_TOWER_TYPES;
  }, [towerFilter]);

  const navItems = useMemo<ShopSelection[]>(() => {
    if (tab === 'skills') {
      return PLAYER_SKILLS.map((skill) => ({ kind: 'skill' as const, id: skill.id }));
    }
    return filteredTowers.map((id) => ({ kind: 'tower' as const, id }));
  }, [tab, filteredTowers]);

  const stepShopSelection = useCallback((direction: 1 | -1) => {
    const next = nextShopSelection(navItems, selection, direction);
    if (next) setSelection(next);
  }, [navItems, selection]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const action = resolveShopHotkey({
        key: e.key,
        inTextField: isShopTypingTarget(e.target),
      });
      if (action === 'prev') {
        e.preventDefault();
        stepShopSelection(-1);
      } else if (action === 'next') {
        e.preventDefault();
        stepShopSelection(1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stepShopSelection]);

  const towerProgress = { unlocked: unlockedTowers.length, total: ALL_TOWER_TYPES.length };
  const skillProgress = { unlocked: unlockedPlayerSkills.length, total: PLAYER_SKILLS.length };

  const handleTabChange = (next: ShopTab) => {
    setTab(next);
    if (next === 'towers') {
      setSelection({ kind: 'tower', id: filteredTowers[0] ?? 'basic' });
    } else {
      setSelection({ kind: 'skill', id: PLAYER_SKILLS[0].id });
    }
  };

  const handleTowerFilterChange = (next: TowerFilter) => {
    setTowerFilter(next);
    const list = next === 'basic' ? BASIC_TOWERS : next === 'special' ? SPECIAL_TOWERS : ALL_TOWER_TYPES;
    if (selection?.kind !== 'tower' || !list.includes(selection.id)) {
      setSelection({ kind: 'tower', id: list[0] });
    }
  };

  const activeCategory: ShopCategory = tab === 'skills' ? 'skills' : towerFilter;

  const selectCategory = (next: ShopCategory) => {
    if (next === 'skills') {
      if (tab !== 'skills') handleTabChange('skills');
      return;
    }
    if (tab !== 'towers') setTab('towers');
    handleTowerFilterChange(next);
  };

  const handlePurchase = (sel: ShopSelection) => {
    if (sel.kind === 'tower') {
      const success = purchaseTower(sel.id);
      setPurchaseResult({ name: getTowerName(sel.id), success });
    } else {
      const success = purchasePlayerSkill(sel.id);
      setPurchaseResult({ name: getPlayerSkillName(PLAYER_SKILL_BY_ID[sel.id], t), success });
    }
    window.setTimeout(() => setPurchaseResult(null), 2200);
  };

  const suggestion = useMemo(() => {
    if (tab === 'towers') {
      const locked = ALL_TOWER_TYPES.filter((id) => !unlockedTowers.includes(id));
      const affordable = locked.filter((id) => TOWER_SHOP_PRICES[id] <= coins);
      const pool = affordable.length > 0 ? affordable : locked;
      if (pool.length === 0) return null;
      const cheapest = pool.reduce((a, b) => (TOWER_SHOP_PRICES[a] <= TOWER_SHOP_PRICES[b] ? a : b));
      return { label: getTowerName(cheapest), affordable: affordable.length > 0 };
    }
    const locked = PLAYER_SKILLS.filter((sk) => !unlockedPlayerSkills.includes(sk.id));
    const affordable = locked.filter((sk) => PLAYER_SKILL_SHOP_PRICES[sk.id] <= coins);
    const pool = affordable.length > 0 ? affordable : locked;
    if (pool.length === 0) return null;
    const cheapest = pool.reduce((a, b) => (
      PLAYER_SKILL_SHOP_PRICES[a.id] <= PLAYER_SKILL_SHOP_PRICES[b.id] ? a : b
    ));
    return { label: getPlayerSkillName(cheapest, t), affordable: affordable.length > 0 };
  }, [tab, coins, unlockedTowers, unlockedPlayerSkills, t]);

  const countOf = (list: TowerType[]) => list.filter((id) => unlockedTowers.includes(id)).length;

  return (
    <SceneShell scrollable={false}>
      <ShopPurchaseToast result={purchaseResult} />

      <div className="flex h-full w-full flex-col">
        <TopBar
          title={s.title}
          meta={s.subtitle}
          back={{ to: 'mainMenu' }}
          glyph={<ShopIcon className="h-4 w-4" />}
          right={<ShopHeaderStats
            coins={coins}
            towerUnlocked={towerProgress.unlocked}
            towerTotal={towerProgress.total}
            skillUnlocked={skillProgress.unlocked}
            skillTotal={skillProgress.total}
          />}
        />

        <div className="flex min-h-0 flex-1">
          <Rail label={s.category}>
            <RailItem
              index={1}
              label={s.categoryAll}
              active={activeCategory === 'all'}
              onClick={() => selectCategory('all')}
              right={<span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
                {countOf(ALL_TOWER_TYPES)}/{ALL_TOWER_TYPES.length}
              </span>}
            />
            <RailItem
              index={2}
              label={s.categoryBasic}
              active={activeCategory === 'basic'}
              onClick={() => selectCategory('basic')}
              right={<span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
                {countOf(BASIC_TOWERS)}/{BASIC_TOWERS.length}
              </span>}
            />
            <RailItem
              index={3}
              label={s.categorySpecial}
              active={activeCategory === 'special'}
              onClick={() => selectCategory('special')}
              right={<span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
                {countOf(SPECIAL_TOWERS)}/{SPECIAL_TOWERS.length}
              </span>}
            />

            <div className="px-3 pb-1 pt-4">
              <SegHead label={s.toolbar.tabSkills} />
            </div>

            <RailItem
              index={4}
              label={s.toolbar.tabSkills}
              active={activeCategory === 'skills'}
              onClick={() => selectCategory('skills')}
              right={<span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
                {skillProgress.unlocked}/{skillProgress.total}
              </span>}
            />
          </Rail>

          <main className="flex min-w-0 flex-1 flex-col bg-[var(--hl-void)]">
            <ShopToolbar
              tab={tab}
              towerProgress={towerProgress}
              skillProgress={skillProgress}
            />

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <ShopGrid
                tab={tab}
                towers={filteredTowers}
                coins={coins}
                unlockedTowers={unlockedTowers}
                unlockedSkills={unlockedPlayerSkills}
                selection={selection}
                onSelect={setSelection}
              />
              {suggestion && (
                <ShopSuggestionBanner label={suggestion.label} affordable={suggestion.affordable} />
              )}

              <div className="mt-4 hidden items-center gap-3 border-t border-[var(--hl-line)] pt-3 sm:flex">
                <span className="flex items-center gap-1.5">
                  <Key>←</Key>
                  <Key>→</Key>
                  <span className="hl-label">{s.toolbar.switchProduct}</span>
                </span>
                <span className="h-3 w-px bg-[var(--hl-line)]" />
                <span className="flex items-center gap-1.5">
                  <Key>Enter</Key>
                  <span className="hl-label">{s.toolbar.buyProduct}</span>
                </span>
              </div>
            </div>
          </main>

          <aside className="flex w-[336px] shrink-0 flex-col overflow-y-auto border-l border-[var(--hl-line)] bg-[var(--hl-deck)] p-4 xl:w-[376px]">
            <ShopDetailPanel
              selection={selection}
              coins={coins}
              unlockedTowers={unlockedTowers}
              unlockedSkills={unlockedPlayerSkills}
              onPurchase={handlePurchase}
            />
          </aside>
        </div>
      </div>
    </SceneShell>
  );
}
