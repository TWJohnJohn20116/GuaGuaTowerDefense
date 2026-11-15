/**
 * 設定 - 外觀（主題色）
 *
 * 12 套色票定義在 src/data/themeData.ts，這裡只負責選單與預覽。
 * 每張卡用自己的色票畫迷你預覽（紙底／墨字／主要按鈕三個角色各取一個樣本），
 * 所以「選之前就看得到」，不是套用後才知道長怎樣。
 */

import { useTranslation } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { THEMES, type ThemeDefinition } from '@/data/themeData';
import { SectionGroup } from '@/components/ui';
import { CheckIcon, PaletteIcon } from '@/components/ui/Icons';

function ThemeCard({
  theme,
  name,
  active,
  modeLabel,
  currentLabel,
  onSelect,
}: {
  theme: ThemeDefinition;
  name: string;
  active: boolean;
  modeLabel: string;
  currentLabel: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={
        'group flex flex-col gap-2 rounded-[var(--cn-r-md)] border-[var(--cn-bw)] bg-[var(--cn-card)] p-2 text-left transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-hidden ' +
        (active
          ? 'border-[var(--cn-line)] shadow-[0_4px_0_var(--cn-line)]'
          : 'border-[var(--cn-line-soft)] shadow-none')
      }
    >
      {/* 迷你預覽：顏色全部取自這套色票，複製的是真實角色而不是示意色塊 */}
      <span
        className="flex h-[84px] flex-col gap-1 rounded-[10px] p-2"
        style={{ background: theme.colors.paper }}
      >
        <span className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: theme.colors.primary }}
          />
          <span
            className="text-[10px] font-black leading-none"
            style={{ color: theme.colors.ink }}
          >
            {name}
          </span>
        </span>
        <span
          className="rounded-[6px] px-1.5 py-0.5 text-[9px] font-extrabold leading-tight"
          style={{ background: theme.colors.card, color: theme.colors.ink2 }}
        >
          Aa 文字樣本
        </span>
        <span
          className="mt-auto self-start rounded-full px-2 py-0.5 text-[9px] font-black leading-tight"
          style={{ background: theme.colors.cta, color: theme.colors.onCta }}
        >
          開始
        </span>
      </span>

      <span className="flex items-center justify-between gap-1">
        <span className="min-w-0 flex-1 truncate text-[12px] font-black text-[var(--cn-ink)]">
          {name}
        </span>
        {active ? (
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-black text-[var(--cn-signal-text)]">
            <CheckIcon className="h-3 w-3" />
            {currentLabel}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-[var(--cn-paper-2)] px-1.5 py-0.5 text-[9.5px] font-extrabold text-[var(--cn-ink-3)]">
            {modeLabel}
          </span>
        )}
      </span>
    </button>
  );
}

export function ThemeSection({ filter = '' }: { filter?: string }) {
  const { t } = useTranslation();
  const themeId = useSettingsStore((s) => s.themeId);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const copy = t.settings.theme;
  const match = (text: string) => !filter || text.toLowerCase().includes(filter);
  const visible = THEMES.filter(
    (theme) => match(copy.names[theme.id]) || match(copy.title) || match(copy.desc),
  );
  if (visible.length === 0) return null;

  return (
    <SectionGroup
      title={copy.title}
      description={copy.desc}
      icon={<PaletteIcon className="h-3.5 w-3.5" />}
      columns={1}
    >
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4">
        {THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            name={copy.names[theme.id]}
            active={theme.id === themeId}
            modeLabel={theme.mode === 'dark' ? copy.modeDark : copy.modeLight}
            currentLabel={copy.current}
            onSelect={() => setTheme(theme.id)}
          />
        ))}
      </div>
      <p className="border-t-[var(--cn-bw)] border-[var(--cn-line-soft)] px-3 py-2 text-[11.5px] font-semibold leading-relaxed text-[var(--cn-ink-3)]">
        {copy.contrastNote}
      </p>
    </SectionGroup>
  );
}
