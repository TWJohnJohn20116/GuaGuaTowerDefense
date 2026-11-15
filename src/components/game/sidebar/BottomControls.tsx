import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from '@/store/tutorialStore';
import { useTranslation } from '@/i18n';
import {
  WaveIcon, InfinityIcon, StarIcon,
  SkipForwardIcon, HourglassIcon, PlayIcon, PauseIcon,
  DoorExitIcon,
} from '@/components/ui/Icons';
import { NextWavePreview } from '@/components/game/NextWavePreview';
import { GAME_SPEED_PRESETS } from '@/data/gameSpeedPresets';
import { canSkipWave, skipWaveTitleKey } from '@/data/skipWaveHud';
import { resolveLeaveMatchFromHud } from '@/data/leaveMatch';

/**
 * 底部指揮膠囊
 *
 * 只有一顆主鍵（開始波次，橘色實心、帶貼紙投影），其餘都是同樣高度的圓形小鍵：
 * 跳波、速度分段、暫停、離開。整個膠囊居中，不再橫貫全寬。
 */

const PILL =
  'flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] text-[var(--cn-ink-2)] shadow-[0_4px_0_var(--cn-line)] transition-[transform,box-shadow,background-color] duration-75 hover:-translate-y-0.5 hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)] active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40';

export const BottomControls = () => {
  const { t } = useTranslation();
  const startWave = useGameStore((s) => s.startWave);
  const waveActive = useGameStore((s) => s.waveActive);
  const currentWave = useGameStore((s) => s.currentWave);
  const endlessMode = useGameStore((s) => s.endlessMode);
  const maxWaves = useGameStore((s) => s.maxWaves);
  const allEnemiesSpawned = useGameStore((s) => s.allEnemiesSpawned);
  const enemyCount = useGameStore((s) => s.enemies.length);
  const skipWave = useGameStore((s) => s.skipWave);
  const gameSpeed = useGameStore((s) => s.gameSpeed);
  const setGameSpeed = useGameStore((s) => s.setGameSpeed);
  const isPaused = useGameStore((s) => s.isPaused);
  const pauseGame = useGameStore((s) => s.pauseGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const resetGame = useGameStore((s) => s.resetGame);
  const checkAction = useTutorialStore((s) => s.checkAction);
  const tutorialActive = useTutorialStore((s) => s.isActive);
  const tutorialStep = useTutorialStore((s) => INTERACTIVE_TUTORIAL_STEPS[s.currentStepIndex]);
  const pendingProtocol = useGameStore((s) => s.pendingProtocolChoices);
  const [showNextWavePreview, setShowNextWavePreview] = useState(false);

  const canStartWave = !waveActive && !pendingProtocol && (endlessMode || maxWaves === 0 || currentWave < maxWaves) && !(tutorialActive && tutorialStep?.action !== 'start_wave');
  const skipHud = {
    tutorialActive,
    waveActive,
    allEnemiesSpawned,
    enemyCount,
    endlessMode,
    currentWave,
    maxWaves,
  };
  const skipAllowed = canSkipWave(skipHud);
  const speedTutorialLocked = tutorialActive && tutorialStep?.action !== 'change_speed';
  const pauseTutorialLocked = tutorialActive && tutorialStep?.action !== 'pause_game';

  const startDisabled =
    waveActive ||
    !!pendingProtocol ||
    (!endlessMode && maxWaves > 0 && currentWave >= maxWaves) ||
    (tutorialActive && tutorialStep?.action !== 'start_wave');

  return (
    <div className="flex items-center gap-2">
      {/* 開始波次：整條膠囊唯一的主鍵 */}
      <div
        className="relative flex items-center"
        onMouseEnter={() => setShowNextWavePreview(true)}
        onMouseLeave={() => setShowNextWavePreview(false)}
      >
        <NextWavePreview show={showNextWavePreview && canStartWave} />
        <button
          id="tutorial-target-start-wave"
          type="button"
          className={[
            'flex h-11 items-center justify-center gap-2 rounded-full border-[3px] border-[var(--cn-line)] px-5 font-mono text-[12px] font-extrabold uppercase tracking-[0.06em] shadow-[0_5px_0_var(--cn-line)] transition-[transform,box-shadow,filter] duration-75',
            canStartWave
              ? 'bg-[var(--cn-cta)] text-[var(--cn-on-cta)] hover:-translate-y-0.5 hover:brightness-110 active:translate-y-1 active:shadow-none'
              : 'cursor-not-allowed bg-[var(--cn-card)] text-[var(--cn-ink-3)] shadow-none',
          ].join(' ')}
          onClick={() => {
            if (!tutorialActive || tutorialStep?.action === 'start_wave') {
              startWave();
              checkAction('start_wave', 'tutorial-target-start-wave');
            }
          }}
          disabled={startDisabled}
        >
          {waveActive ? (
            <>
              <HourglassIcon className="h-4 w-4 animate-pulse" />
              <span>{t.game.waveInProgress.replace('{count}', String(enemyCount))}</span>
            </>
          ) : pendingProtocol ? (
            <>
              <StarIcon className="h-4 w-4" />
              <span>{t.game.tacticalProtocol.title}</span>
            </>
          ) : !endlessMode && maxWaves > 0 && currentWave >= maxWaves ? (
            <>
              <StarIcon className="h-4 w-4" />
              <span>{t.game.completed}</span>
            </>
          ) : (
            <>
              {endlessMode ? <InfinityIcon className="h-4 w-4" /> : <WaveIcon className="h-4 w-4" />}
              <span>
                {t.game.startWave} {currentWave + 1}
                {maxWaves > 0 && !endlessMode ? `/${maxWaves}` : ''}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 跳波 */}
      <button
        type="button"
        className={`${PILL} ${skipAllowed ? 'text-[var(--cn-caution-text)]' : ''}`}
        onClick={skipWave}
        disabled={!skipAllowed}
        title={t.game[skipWaveTitleKey(skipHud)]}
      >
        <SkipForwardIcon className="h-4 w-4" />
      </button>

      {/* 速度：分段膠囊 */}
      <div
        id="tutorial-target-game-speed"
        className="flex items-center gap-0.5 rounded-full border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] p-0.5 shadow-[0_4px_0_var(--cn-line)]"
      >
        {GAME_SPEED_PRESETS.map((speed) => (
          <button
            key={speed}
            type="button"
            className={`h-8 min-w-8 rounded-full px-1 font-mono text-[11px] tabular-nums transition-colors duration-75 ${
              speed === 0.5 || speed === 5 ? 'hidden sm:block' : ''
            } ${
              gameSpeed === speed
                ? 'bg-[var(--cn-sun-soft)] font-extrabold text-[var(--cn-ink)]'
                : speedTutorialLocked
                  ? 'cursor-not-allowed text-[var(--cn-ink-4)] opacity-40'
                  : 'text-[var(--cn-ink-3)] hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]'
            }`}
            disabled={speedTutorialLocked}
            onClick={() => {
              if (!tutorialActive || tutorialStep?.action === 'change_speed') {
                setGameSpeed(speed);
                checkAction('change_speed', 'tutorial-target-game-speed');
              }
            }}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* 暫停 */}
      <button
        id="tutorial-target-pause"
        type="button"
        className={`${PILL} ${isPaused ? 'bg-[var(--cn-sun-soft)] text-[var(--cn-ink)]' : ''}`}
        onClick={() => {
          if (!tutorialActive || tutorialStep?.action === 'pause_game') {
            isPaused ? resumeGame() : pauseGame();
            if (tutorialActive) checkAction('pause_game', 'tutorial-target-pause');
          }
        }}
        disabled={pauseTutorialLocked}
        title={t.game.pauseResumeTooltip}
      >
        {isPaused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
      </button>

      {/* 離開對局 */}
      <button
        type="button"
        className={`${PILL} ${tutorialActive ? '' : 'text-[var(--cn-alarm-text)]'}`}
        onClick={() => {
          if (resolveLeaveMatchFromHud({ tutorialActive }) !== 'reset_match') return;
          resetGame();
        }}
        disabled={tutorialActive}
        title={t.game.returnToMenu}
      >
        <DoorExitIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
