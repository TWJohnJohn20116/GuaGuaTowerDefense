import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { MapIcon } from '@/components/ui/Icons';
import type { GameScene } from '@/types/game';
import { DevSection } from './common';

/** 場景清單：與 types/game.ts 的 GameScene 同序，跳轉用 */
const SCENES: GameScene[] = [
  'mainMenu', 'pathSelection', 'talentTree', 'game', 'settings',
  'tutorial', 'changelog', 'encyclopedia', 'workshop',
  'achievements', 'skins', 'shop', 'statistics',
  'modEditor', 'modManager', 'mapEditor', 'replay',
  'gameOver', 'victory',
];

/**
 * 場景快速跳轉
 *
 * 舊版只有「場景測試」下拉，要一層層點；這裡把 19 個場景攤成 3 欄方格，
 * 一眼看到全部、一點就跳，當前場景用警示黃標出。
 */
export function SceneJumpSection() {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const current = useGameStore((s) => s.scene);

  return (
    <DevSection
      title={t.dev.secSceneJump}
      icon={<MapIcon className="h-3.5 w-3.5" />}
      accent="cyan"
      keywords={['scene', 'jump', 'goto', '場景', '跳轉', '切換']}
    >
      <div className="grid grid-cols-3 gap-1">
        {SCENES.map((scene) => {
          const isCurrent = scene === current;
          return (
            <button
              key={scene}
              type="button"
              onClick={() => setScene(scene)}
              aria-current={isCurrent ? 'true' : undefined}
              className={[
                'truncate rounded-[4px] border px-1.5 py-1 text-left font-mono text-[9.5px] font-bold transition-colors',
                isCurrent
                  ? 'border-[var(--arc-caution)]/60 bg-[var(--arc-caution)]/15 text-[var(--arc-caution)]'
                  : 'border-[var(--arc-line)] bg-[var(--arc-deck-2)] text-[var(--arc-ink-3)] hover:border-[var(--arc-line-strong)] hover:text-[var(--arc-ink)]',
              ].join(' ')}
            >
              {scene}
            </button>
          );
        })}
      </div>
    </DevSection>
  );
}