/**
 * 設定主場景 · HARDLINE Console 版面
 *
 *   TopBar（52px，含返回）→ Rail 212px（mono 編號＋分類）＋ 主區 Deck 區塊串
 *
 *  - 分類走 Rail，選中＝左緣 2px 訊號條
 *  - 主區是 Deck 串：每個區段一張，設定列統一行高、左右對齊
 *  - 全域搜尋時跨分類顯示所有匹配項
 */

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { DEFAULT_KEY_BINDINGS } from '@/store/gameStoreUtils';
import type { KeyAction } from '@/types/game';
import { useTranslation } from '@/i18n';
import { SceneShell } from '@/components/ui/SceneShell';
import { Btn, Deck, Empty, IconBtn, Input, Rail, RailItem, TopBar } from '@/components/hl';
import {
  GearIcon, SpeakerIcon, GamepadIcon, SparklesIcon, SearchIcon,
  MonitorIcon, PauseIcon, PointerIcon, LightningIcon, WaveIcon, CoinIcon,
  UpArrowIcon, RefreshIcon, CheckIcon, CrossIcon,
} from '@/components/ui/Icons';
import { isSettingsTypingTarget, resolveSettingsEscape } from '@/data/settingsBack';
import { shouldApplyQuickPlaceDefaultSync } from '@/data/quickPlaceSync';
import { GeneralSection } from './settings/sections/GeneralSection';
import { SettingsBackupPanel } from './settings/SettingsBackupPanel';
import { AudioSection } from './settings/sections/AudioSection';
import { ControlsSection } from './settings/sections/ControlsSection';
import { HudLayoutSection } from './settings/sections/HudLayoutSection';
import { KeyBindingOverlay } from './settings/KeyBindingOverlay';
import AboutTab from './settings/AboutTab';

type SettingsNavId = 'general' | 'hud' | 'audio' | 'controls' | 'about';

interface NavItem {
  id: SettingsNavId;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export default function Settings() {
  const { t } = useTranslation();
  const goBackScene = useGameStore((s) => s.goBackScene);
  const setQuickPlaceMode = useGameStore((s) => s.setQuickPlaceMode);
  const setKeyBinding = useGameStore((s) => s.setKeyBinding);
  const gameplay = useSettingsStore((s) => s.gameplay);

  const [activeNav, setActiveNav] = useState<SettingsNavId>('general');
  const [editingKey, setEditingKey] = useState<KeyAction | null>(null);
  const [search, setSearch] = useState('');

  const lastQuickPlaceDefault = useRef<boolean | null>(null);
  useEffect(() => {
    if (!shouldApplyQuickPlaceDefaultSync({
      previousDefault: lastQuickPlaceDefault.current,
      nextDefault: gameplay.quickPlaceDefault,
    })) {
      lastQuickPlaceDefault.current = gameplay.quickPlaceDefault;
      return;
    }
    lastQuickPlaceDefault.current = gameplay.quickPlaceDefault;
    setQuickPlaceMode(gameplay.quickPlaceDefault);
  }, [gameplay.quickPlaceDefault, setQuickPlaceMode]);

  const leaveSettings = useCallback(() => {
    goBackScene();
  }, [goBackScene]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = resolveSettingsEscape({
        key: e.key,
        inTextField: isSettingsTypingTarget(e.target),
        capturingBind: editingKey !== null,
      });
      if (action === 'ignore') return;
      e.preventDefault();
      leaveSettings();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingKey, leaveSettings]);

  const navs: NavItem[] = useMemo(
    () => [
      { id: 'general', label: t.settings.general, desc: t.settings.navDesc.general, icon: <GearIcon className="h-3.5 w-3.5" /> },
      { id: 'hud', label: t.settings.hud.navLabel, desc: t.settings.navDesc.hud, icon: <MonitorIcon className="h-3.5 w-3.5" /> },
      { id: 'audio', label: t.settings.audio, desc: t.settings.navDesc.audio, icon: <SpeakerIcon className="h-3.5 w-3.5" /> },
      { id: 'controls', label: t.settings.controls, desc: t.settings.navDesc.controls, icon: <GamepadIcon className="h-3.5 w-3.5" /> },
      { id: 'about', label: t.settings.about, desc: t.settings.navDesc.about, icon: <SparklesIcon className="h-3.5 w-3.5" /> },
    ],
    [t]
  );

  const filter = search.trim().toLowerCase();
  const searching = filter.length > 0;
  const activeMeta = navs.find((n) => n.id === activeNav) ?? navs[0];

  // 搜尋時跨分類顯示；平時只顯示當前分類
  const show = (id: SettingsNavId) => searching || activeNav === id;

  const editingKeyMeta = useKeyBindingMeta(editingKey);

  const handleKeyCapture = (action: KeyAction, key: string) => {
    setKeyBinding(action, key);
    setEditingKey(null);
  };

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={t.settings.title}
          meta={searching ? `${activeMeta.label} / search` : `${t.settings.title} / ${activeMeta.label}`}
          glyph={<GearIcon className="h-4 w-4" />}
          back={{ onClick: leaveSettings }}
          right={<SearchBox value={search} onChange={setSearch} />}
        />

        <div className="flex min-h-0 flex-1">
          {/* ===== 左軌：分類 ===== */}
          <Rail
            label={t.settings.title}
            foot={
              <div className="flex flex-col gap-2">
                <span className="arc-label">reset</span>
                <ResetAllButton />
              </div>
            }
          >
            {navs.map((nav, i) => (
              <RailItem
                key={nav.id}
                index={i + 1}
                label={nav.label}
                active={!searching && activeNav === nav.id}
                onClick={() => {
                  setSearch('');
                  setActiveNav(nav.id);
                }}
              />
            ))}
          </Rail>

          {/* ===== 主區 ===== */}
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--arc-void)]">
            <div className="flex items-center gap-3 border-b border-[var(--cn-line-soft)] px-5 py-2.5">
              <span className="arc-label whitespace-nowrap text-[var(--arc-ink-2)]">
                {searching ? t.settings.searchPlaceholder : activeMeta.label}
              </span>
              <span className="h-px flex-1 bg-[var(--arc-line)]" />
              {searching ? (
                <span className="border border-[var(--arc-gold-edge)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--arc-gold)]">
                  {filter}
                </span>
              ) : (
                <span className="max-w-[42ch] truncate font-mono text-[10px] text-[var(--arc-ink-4)]">
                  {activeMeta.desc}
                </span>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto flex w-full max-w-[880px] flex-col gap-7 px-5 py-5">
                {show('general') && (
                  <>
                    <GeneralSection filter={filter} />
                    {!filter && <SettingsBackupPanel />}
                  </>
                )}
                {show('hud') && <HudLayoutSection filter={filter} />}
                {show('audio') && <AudioSection filter={filter} />}
                {show('controls') && (
                  <ControlsSection
                    filter={filter}
                    editingKey={editingKey}
                    onStartEditKey={setEditingKey}
                  />
                )}
                {show('about') && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <AboutTab />
                  </div>
                )}

                {searching && <EmptySearchHint search={search} onClear={() => setSearch('')} />}
              </div>
            </div>
          </main>
        </div>

        <KeyBindingOverlay
          open={!!editingKey}
          action={editingKey}
          label={editingKeyMeta?.label}
          icon={editingKeyMeta?.icon}
          pressKeyText={t.settings.pressKey}
          waitingText={t.settings.waitingForKey}
          cancelText={t.settings.clickToCancel}
          onCapture={handleKeyCapture}
          onClose={() => setEditingKey(null)}
        />
      </div>
    </SceneShell>
  );
}

// ============================================================
// 重置全部設定（兩段式確認，3 秒未確認自動還原）
// ============================================================

function ResetAllButton() {
  const resetAll = useSettingsStore((s) => s.resetAll);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!confirming) {
      setConfirming(true);
      timerRef.current = setTimeout(() => setConfirming(false), 3000);
      return;
    }
    resetAll();
    useGameStore.setState({
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.7,
      musicVolume: 0.5,
      keyBindings: { ...DEFAULT_KEY_BINDINGS },
    });
    setConfirming(false);
    setDone(true);
    timerRef.current = setTimeout(() => setDone(false), 2000);
  };

  return (
    <Btn
      variant={done ? 'line' : confirming ? 'danger' : 'line'}
      size="sm"
      block
      onClick={handleClick}
      icon={
        done ? (
          <CheckIcon className="h-3.5 w-3.5" />
        ) : (
          <RefreshIcon className="h-3.5 w-3.5" />
        )
      }
    >
      {done ? '已重置' : confirming ? '再點一次確認重置' : '重置全部設定'}
    </Btn>
  );
}

// ============================================================
// 搜尋框（頂列右側）
// ============================================================

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-48 items-center gap-2 border border-[var(--arc-line-strong)] bg-[var(--arc-void-2)] pl-2.5 sm:w-64">
      <SearchIcon className="h-3.5 w-3.5 shrink-0 text-[var(--arc-ink-3)]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.settings.searchPlaceholder}
        className="h-9 min-w-0 flex-1 border-0 bg-transparent px-0 font-mono text-[11.5px] placeholder:text-[var(--arc-ink-4)] focus:border-0"
      />
      {value.length > 0 && (
        <IconBtn
          label={t.settings.clearSearch}
          onClick={() => onChange('')}
          className="pr-2 text-[var(--arc-ink-4)] transition-colors hover:text-[var(--arc-ink-2)]"
        >
          <CrossIcon className="h-3.5 w-3.5" />
        </IconBtn>
      )}
    </div>
  );
}

// ============================================================
// 搜尋無結果提示
// ============================================================

function EmptySearchHint({ search, onClear }: { search: string; onClear: () => void }) {
  const { t } = useTranslation();
  const hint = t.settings.emptySearchHint;
  const [before, after] = hint.split('{search}');
  return (
    <Deck className="p-0">
      <Empty
        title={
          <span className="font-mono text-[12px]">
            {before}
            <span className="text-[var(--arc-gold)]">{search}</span>
            {after}
          </span>
        }
        hint={t.settings.searchPlaceholder}
        action={
          <Btn variant="line" size="sm" kbd="esc" onClick={onClear}>
            {t.settings.clearSearch}
          </Btn>
        }
      />
    </Deck>
  );
}

// ============================================================
// 鍵盤綁定 meta 查詢（給彈出視窗使用）
// ============================================================

function useKeyBindingMeta(action: KeyAction | null) {
  const { t } = useTranslation();
  if (!action) return null;

  const map: Record<KeyAction, { label: string; icon: React.ReactNode }> = {
    pause: { label: t.settings.actions.pause, icon: <PauseIcon className="h-4 w-4" /> },
    back: { label: t.settings.actions.back, icon: <PointerIcon className="h-4 w-4" /> },
    speed1: { label: t.settings.actions.speed1, icon: <span className="font-mono text-[11px] font-semibold">1x</span> },
    speed2: { label: t.settings.actions.speed2, icon: <span className="font-mono text-[11px] font-semibold">2x</span> },
    speed3: { label: t.settings.actions.speed3, icon: <span className="font-mono text-[11px] font-semibold">3x</span> },
    cycleSpeed: { label: t.settings.actions.cycleSpeed, icon: <LightningIcon className="h-4 w-4" /> },
    startWave: { label: t.settings.actions.startWave, icon: <WaveIcon className="h-4 w-4" /> },
    sellTower: { label: t.settings.actions.sellTower, icon: <CoinIcon className="h-4 w-4" /> },
    upgradeTower: { label: t.settings.actions.upgradeTower, icon: <UpArrowIcon className="h-4 w-4" /> },
  };

  return map[action] ?? null;
}
