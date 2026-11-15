import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from '@/store/tutorialStore';
import { useTranslation } from '@/i18n';
import {
  WaveIcon, InfinityIcon, StarIcon,
  SkipForwardIcon, HourglassIcon, PlayIcon, PauseIcon,
  DoorExitIcon,
} from '@/components/ui/Icons';
import { NextWavePreview } from '@/components/game/NextWavePreview';
import { PlayerSkillBar } from '@/components/game/PlayerSkillBar';
import { GAME_SPEED_BAR_CLASS } from './hudStyle';
import { GAME_SPEED_PRESETS } from '@/data/gameSpeedPresets';
import { canSkipWave, skipWaveTitleKey } from '@/data/skipWaveHud';
import { resolveLeaveMatchFromHud } from '@/data/leaveMatch';

/** 指揮帶上的動作格：棋盤格、1px 線、等寬 */
const CELL =
  'flex h-full items-center justify-center gap-1.5 border-r border-[var(--bd-line)] px-3 font-mono text-[11px] transition-colors duration-100';

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
  const showSkillBar = useSettingsStore((s) => s.hudLayout.showTowerSkillBar);
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

  const startTone = waveActive
    ? 'text-[var(--bd-ink-4)]'
    : pendingProtocol
      ? 'text-[var(--bd-caution)]'
      : !endlessMode && maxWaves > 0 && currentWave >= maxWaves
        ? 'text-[var(--bd-vital)]'
        : 'text-[#140f18]';

  return (
    <div className="flex h-full min-w-0 items-stretch">
      {/* 開始下一波：本帶唯一實心訊號格 */}
      <div
        className="relative flex h-full items-stretch border-r border-[var(--bd-line)]"
        onMouseEnter={() => setShowNextWavePreview(true)}
        onMouseLeave={() => setShowNextWavePreview(false)}
      >
        <NextWavePreview show={showNextWavePreview && canStartWave} />
        <button
          id="tutorial-target-start-wave"
          type="button"
          className={[
            'flex h-full items-center justify-center gap-2 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-[filter,background-color] duration-100',
            waveActive || pendingProtocol || (!endlessMode && maxWaves > 0 && currentWave >= maxWaves) || tutorialActive
              ? `cursor-not-allowed bg-transparent ${startTone}`
              : 'bg-[var(--bd-accent)] text-[#140f18] shadow-[inset_0_-2px_0_var(--bd-edge)] hover:brightness-110',
            !waveActive && !pendingProtocol && tutorialActive && tutorialStep?.action !== 'start_wave'
              ? 'opacity-40'
              : '',
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
              <HourglassIcon className="h-3.5 w-3.5 animate-pulse" />
              <span>{t.game.waveInProgress.replace('{count}', String(enemyCount))}</span>
            </>
          ) : pendingProtocol ? (
            <>
              <StarIcon className="h-3.5 w-3.5" />
              <span>{t.game.tacticalProtocol.title}</span>
            </>
          ) : !endlessMode && maxWaves > 0 && currentWave >= maxWaves ? (
            <>
              <StarIcon className="h-3.5 w-3.5" />
              <span>{t.game.completed}</span>
            </>
          ) : (
            <>
              {endlessMode ? <InfinityIcon className="h-3.5 w-3.5" /> : <WaveIcon className="h-3.5 w-3.5" />}
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
        className={`${CELL} ${
          skipAllowed
            ? 'text-[var(--bd-caution)] hover:bg-[var(--bd-tile-2)]'
            : 'cursor-not-allowed text-[var(--bd-ink-4)]'
        }`}
        onClick={skipWave}
        disabled={!skipAllowed}
        title={t.game[skipWaveTitleKey(skipHud)]}
      >
        <SkipForwardIcon className="h-4 w-4" />
      </button>

      {/* 速度：分段格 */}
      <div id="tutorial-target-game-speed" className={GAME_SPEED_BAR_CLASS}>
        {GAME_SPEED_PRESETS.map((speed) => (
          <button
            key={speed}
            type="button"
            className={`h-full min-w-9 px-2 font-mono text-[11px] tabular-nums transition-colors duration-[110ms] ${
              gameSpeed === speed
                ? 'border-l border-[var(--bd-accent)] bg-[color-mix(in_oklab,var(--bd-accent)_18%,var(--bd-tile))] font-semibold text-[var(--bd-ink)] first:border-l-0'
                : speedTutorialLocked
                  ? 'cursor-not-allowed text-[var(--bd-ink-4)] opacity-40'
                  : 'text-[var(--bd-ink-3)] hover:bg-[var(--bd-tile-2)] hover:text-[var(--bd-ink)]'
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

      {/* 技能：集中在指揮帶，顯示與否沿用 hudLayout.showTowerSkillBar */}
      {showSkillBar && (
        <div className="flex items-center px-2">
          <PlayerSkillBar />
        </div>
      )}

      {/* 暫停 */}
      <button
        id="tutorial-target-pause"
        type="button"
        className={`${CELL} ${
          pauseTutorialLocked
            ? 'cursor-not-allowed text-[var(--bd-ink-4)] opacity-40'
            : isPaused
              ? 'bg-[color-mix(in_oklab,var(--bd-accent)_18%,var(--bd-tile))] text-[var(--bd-ink)]'
              : 'text-[var(--bd-ink-2)] hover:bg-[var(--bd-tile-2)] hover:text-[var(--bd-ink)]'
        }`}
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
        className={`${CELL} ${
          tutorialActive
            ? 'cursor-not-allowed text-[var(--bd-ink-4)] opacity-40'
            : 'text-[var(--bd-alarm)] hover:bg-[rgba(255,143,163,0.14)] hover:brightness-110'
        }`}
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
