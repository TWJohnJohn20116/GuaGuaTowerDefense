/**
 * 設定主場景 · CANDY POP
 *
 * 版面三層，順序就是使用順序：
 *   TopBar（返回 / 標題 / 搜尋）
 *   ├ 左軌 240px：五個分類（圖示章 + 名稱 + 一句說明；選中＝珊瑚膜 + 左緣投影）
 *   └ 主區：釘住的分類標題 + 卡片串 + 最底「危險操作」
 *
 * 重置全部刻意放在內容最底部而不是左軌：它是不可逆操作，應該是最後才遇到的東西，
 * 而且放在左軌底部會被左下角的 DEV 浮標蓋住。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { DEFAULT_KEY_BINDINGS } from '@/store/gameStoreUtils';
import type { KeyAction } from '@/types/game';
import { useTranslation } from '@/i18n';
import { SceneShell } from '@/components/ui/SceneShell';
import { Btn, Empty, IconBtn, Input, Rail, TopBar } from '@/components/hl';
import {
  GearIcon, SpeakerIcon, GamepadIcon, SparklesIcon, SearchIcon, MonitorIcon,
  PauseIcon, PointerIcon, LightningIcon, WaveIcon, CoinIcon,
  UpArrowIcon, RefreshIcon, CheckIcon, CrossIcon, WarningIcon, PaletteIcon,
} from '@/components/ui/Icons';
import { isSettingsTypingTarget, resolveSettingsEscape } from '@/data/settingsBack';
import { shouldApplyQuickPlaceDefaultSync } from '@/data/quickPlaceSync';
import { GeneralSection } from './settings/sections/GeneralSection';
import { ThemeSection } from './settings/sections/ThemeSection';
import { SettingsBackupPanel } from './settings/SettingsBackupPanel';
import { AudioSection } from './settings/sections/AudioSection';
import { ControlsSection } from './settings/sections/ControlsSection';
import { HudLayoutSection } from './settings/sections/HudLayoutSection';
import { KeyBindingOverlay } from './settings/KeyBindingOverlay';
import AboutTab from './settings/AboutTab';

type SettingsNavId = 'general' | 'theme' | 'hud' | 'audio' | 'controls' | 'about';

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
      { id: 'general', label: t.settings.general, desc: t.settings.navDesc.general, icon: <GearIcon className="h-4 w-4" /> },
      { id: 'theme', label: t.settings.theme.title, desc: t.settings.navDesc.theme, icon: <PaletteIcon className="h-4 w-4" /> },
      { id: 'hud', label: t.settings.hud.navLabel, desc: t.settings.navDesc.hud, icon: <MonitorIcon className="h-4 w-4" /> },
      { id: 'audio', label: t.settings.audio, desc: t.settings.navDesc.audio, icon: <SpeakerIcon className="h-4 w-4" /> },
      { id: 'controls', label: t.settings.controls, desc: t.settings.navDesc.controls, icon: <GamepadIcon className="h-4 w-4" /> },
      { id: 'about', label: t.settings.about, desc: t.settings.navDesc.about, icon: <SparklesIcon className="h-4 w-4" /> },
    ],
    [t],
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
      <div className="flex h-full w-full flex-col gap-3">
        <TopBar
          title={t.settings.title}
          meta={t.settings.subtitle}
          glyph={<GearIcon className="h-4 w-4" />}
          back={{ onClick: leaveSettings }}
          right={<SearchBox value={search} onChange={setSearch} />}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row">
          {/* ===== 左軌：分類 ===== */}
          <Rail label={t.settings.categories} className="max-h-[46vh] md:max-h-none">
            {navs.map((nav) => (
              <NavRow
                key={nav.id}
                icon={nav.icon}
                label={nav.label}
                desc={nav.desc}
                active={!searching && activeNav === nav.id}
                onClick={() => {
                  setSearch('');
                  setActiveNav(nav.id);
                }}
              />
            ))}
          </Rail>

          {/* ===== 主區 ===== */}
          <main className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 items-baseline gap-3 pb-2">
              <h2 className="arc-title text-[18px]">
                {searching ? t.settings.searchResults : activeMeta.label}
              </h2>
              <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[var(--cn-ink-3)]">
                {searching ? t.settings.searchHint.replace('{query}', search) : activeMeta.desc}
              </span>
              {searching && (
                <Btn variant="ghost" size="sm" onClick={() => setSearch('')}>
                  {t.settings.clearSearch}
                </Btn>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-4 pb-6">
                {show('general') && (
                  <>
                    <GeneralSection filter={filter} />
                    {!searching && <SettingsBackupPanel />}
                  </>
                )}
                {show('theme') && <ThemeSection filter={filter} />}
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
                  <div className="grid gap-4 md:grid-cols-2">
                    <AboutTab />
                  </div>
                )}

                {searching ? (
                  <EmptySearchHint search={search} onClear={() => setSearch('')} />
                ) : (
                  activeNav === 'general' && <ResetAllPanel />
                )}
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
// 左軌分類列
// ============================================================

function NavRow({
  icon,
  label,
  desc,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'true' : undefined}
      onClick={onClick}
      className={[
        'flex w-full items-center gap-2.5 rounded-[var(--cn-r-md)] border-[3px] px-2.5 py-2 text-left',
        'transition-[background-color,border-color,box-shadow] duration-150',
        active
          ? 'border-[var(--cn-line)] bg-[var(--cn-coral-soft)] shadow-[0_3px_0_var(--cn-coral-deep)]'
          : 'border-transparent hover:border-[var(--cn-line-soft)] hover:bg-[var(--cn-card-2)]',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-2',
          active
            ? 'border-[var(--cn-line)] bg-[var(--cn-cta)] text-[var(--cn-on-cta)]'
            : 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink-3)]',
        ].join(' ')}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={[
            'block truncate text-[13px] leading-tight',
            active ? 'font-black text-[var(--cn-ink)]' : 'font-bold text-[var(--cn-ink-2)]',
          ].join(' ')}
        >
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[10.5px] font-semibold leading-tight text-[var(--cn-ink-3)]">
          {desc}
        </span>
      </span>
    </button>
  );
}

// ============================================================
// 危險操作：重置全部設定（兩段式確認，3 秒未確認自動還原）
// ============================================================

function ResetAllPanel() {
  const { t } = useTranslation();
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
    <section className="rounded-[var(--cn-r-lg)] border-[3px] border-dashed border-[var(--cn-alert)]/45 bg-[var(--cn-alert-soft)]/35 p-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-2 border-[var(--cn-alert)] bg-[var(--cn-card)] text-[var(--cn-alert-deep)]">
          <WarningIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-extrabold text-[var(--cn-alert-deep)]">
            {t.settings.dangerZone}
          </div>
          <p className="mt-0.5 text-[11px] font-semibold text-[var(--cn-ink-2)]">
            {t.settings.dangerZoneDesc}
          </p>
        </div>
        <Btn
          variant={done ? 'line' : confirming ? 'danger' : 'line'}
          size="sm"
          onClick={handleClick}
          icon={done ? <CheckIcon className="h-3.5 w-3.5" /> : <RefreshIcon className="h-3.5 w-3.5" />}
        >
          {done ? t.settings.resetAllDone : confirming ? t.settings.resetAllConfirm : t.settings.resetAll}
        </Btn>
      </div>
    </section>
  );
}

// ============================================================
// 搜尋框（頂列右側）
// ============================================================

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-24 items-center gap-2 rounded-full border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] pl-3 sm:w-44 lg:w-64">
      <SearchIcon className="h-3.5 w-3.5 shrink-0 text-[var(--cn-ink-3)]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.settings.searchPlaceholder}
        aria-label={t.settings.searchPlaceholder}
        className="h-9 min-w-0 flex-1 border-0 bg-transparent px-0 text-[12px] font-semibold placeholder:text-[var(--cn-ink-4)] focus:border-0"
      />
      {value.length > 0 && (
        <IconBtn
          label={t.settings.clearSearch}
          onClick={() => onChange('')}
          className="pr-2.5 text-[var(--cn-ink-4)] transition-colors hover:text-[var(--cn-ink-2)]"
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
    <Empty
      title={
        <span className="text-[14px]">
          {before}
          <span className="text-[var(--cn-signal-text)]">{search}</span>
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
    speed1: { label: t.settings.actions.speed1, icon: <span className="font-mono text-[11px] font-extrabold">1x</span> },
    speed2: { label: t.settings.actions.speed2, icon: <span className="font-mono text-[11px] font-extrabold">2x</span> },
    speed3: { label: t.settings.actions.speed3, icon: <span className="font-mono text-[11px] font-extrabold">3x</span> },
    cycleSpeed: { label: t.settings.actions.cycleSpeed, icon: <LightningIcon className="h-4 w-4" /> },
    startWave: { label: t.settings.actions.startWave, icon: <WaveIcon className="h-4 w-4" /> },
    sellTower: { label: t.settings.actions.sellTower, icon: <CoinIcon className="h-4 w-4" /> },
    upgradeTower: { label: t.settings.actions.upgradeTower, icon: <UpArrowIcon className="h-4 w-4" /> },
  };

  return map[action] ?? null;
}
