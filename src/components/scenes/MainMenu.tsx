// 主選單 · 同心拼貼
// 品牌條 → 中央 Hero（開始遊戲）→ 左右快捷磚 → 三群入口帶 → 細基線。
// 舊版是「左欄招牌 392px + 右側 12 欄等寬牆」，主行動壓在欄底，第一眼看不到焦點。
import { useState } from 'react';
import type React from 'react';
import { SceneShell } from '@/components/ui/SceneShell';
import { MenuHomeHero } from '@/components/scenes/main-menu/MenuHomeHero';
import { MenuHomeQuickLeft, MenuHomeQuickRight } from '@/components/scenes/main-menu/MenuHomeQuick';
import { MenuHomeGroups } from '@/components/scenes/main-menu/MenuHomeGroups';
import { HOME_FOCUS_ORDER, HOME_SHELL_CLASS } from '@/data/mainMenuHome';
import type { HomeFocusTarget } from '@/data/mainMenuHome';

export default function MainMenu() {
  const [focus, setFocus] = useState<HomeFocusTarget>('start');

  /** 焦點序列是視覺閱讀序（見 HOME_FOCUS_ORDER），方向鍵前後移動、Home/End 跳兩端 */
  const focusNode = (id: HomeFocusTarget) => {
    document.querySelector<HTMLElement>('[data-focus-id="' + id + '"]')?.focus();
  };

  const moveFocus = (step: number) => {
    const total = HOME_FOCUS_ORDER.length;
    const idx = HOME_FOCUS_ORDER.indexOf(focus);
    const next = HOME_FOCUS_ORDER[(idx + step + total) % total];
    setFocus(next);
    focusNode(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      moveFocus(1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      moveFocus(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocus(HOME_FOCUS_ORDER[0]);
      focusNode(HOME_FOCUS_ORDER[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = HOME_FOCUS_ORDER[HOME_FOCUS_ORDER.length - 1];
      setFocus(last);
      focusNode(last);
    }
  };

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col gap-1.5">
        <div className={HOME_SHELL_CLASS} onKeyDown={handleKeyDown}>
          <MenuHomeQuickLeft focused={focus} onFocus={setFocus} />
          <MenuHomeHero focused={focus === 'start'} onFocus={() => setFocus('start')} />
          <MenuHomeQuickRight focused={focus} onFocus={setFocus} />
          <MenuHomeGroups focused={focus} onFocus={setFocus} />
        </div>
      </div>
    </SceneShell>
  );
}