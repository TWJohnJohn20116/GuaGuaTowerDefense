/**
 * 內嵌試玩舞台
 *
 * 做法：直接把真正的 <GameScene /> 掛進工坊裡的一個固定比例框，而不是另做一套「簡化版畫面」。
 * 這樣地圖、塔、彈道、HUD 全部跟正式局一模一樣，試玩才有意義。
 *
 * 幾個必須守住的地方：
 *   1. 旗標要先立再開局：startGame 會讀 isPlaytest 決定要不要寫統計、要不要把 scene 切走。
 *   2. 全螢幕用 portal 掛到 document.body：工坊外殼有 transform／overflow-hidden，
 *      在裡面寫 position:fixed 會被困在祖先座標系，看起來就不像全螢幕。
 *   3. 離開一定要收乾淨：卸載、按離開、按 Esc 三條路都會走 stopPlaytestSession()，
 *      它會丟棄本局內容並還原回放／統計快照，不留下任何存檔級資料。
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Btn, Chip, Deck, Empty, Num, SegHead } from '@/components/hl';
import Loading from '@/components/ui/Loading';
import { useTranslation } from '@/i18n';
import { useGameStore } from '@/store/gameStore';
import { resolvePlaytestSetup } from '@/workshop/playtest/projectSource';
import { isPlaytestActive, startPlaytestSession, stopPlaytestSession } from '@/workshop/playtest/session';

// 遊戲場景本身很重（canvas／three／一整組面板），只有真的要試玩時才載入
const GameScene = lazy(() => import('@/components/scenes/GameScene'));

type Phase = 'idle' | 'preparing' | 'running' | 'ended';

export default function PlaytestStage({ projectId, levelId }: { projectId: string; levelId?: string }) {
  const { t } = useTranslation();
  const setup = useMemo(() => resolvePlaytestSetup(projectId, levelId), [projectId, levelId]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [fullscreen, setFullscreen] = useState(false);
  const [runId, setRunId] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);

  const isVictory = useGameStore((s) => s.isVictory);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const currentWave = useGameStore((s) => s.currentWave);

  // 卸載（切到別的工坊分頁／離開工坊）時一定要收掉，否則整局會留在 store 裡繼續跑
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;
  useEffect(() => () => {
    if (phaseRef.current !== 'idle' && isPlaytestActive()) stopPlaytestSession();
  }, []);

  // 勝／敗：留在工坊顯示結果，不讓 scene 被切到結算頁（store 端已擋，這裡只同步 UI 狀態）
  useEffect(() => {
    if (phase === 'running' && (isVictory || isGameOver)) {
      setPhase('ended');
    }
  }, [phase, isVictory, isGameOver]);

  const handleStart = useCallback(async () => {
    if (!setup) return;
    setErrorText(null);
    setPhase('preparing');
    try {
      await startPlaytestSession(setup);
      setRunId((id) => id + 1);
      setPhase('running');
    } catch (error) {
      stopPlaytestSession();
      setPhase('idle');
      setErrorText(error instanceof Error ? error.message : String(error));
    }
  }, [setup]);

  const handleStop = useCallback(() => {
    stopPlaytestSession();
    setPhase('idle');
    setRunId(0);
  }, []);

  const handleLeave = useCallback(() => {
    stopPlaytestSession();
    setPhase('idle');
    setRunId(0);
    setFullscreen(false);
  }, []);

  // Esc：先離開全螢幕（不要順手把遊戲暫停掉）；用 capture 攔，避免被遊戲快捷鍵處理器吃掉
  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [fullscreen]);

  if (!setup) {
    return (
      <Empty
        title={t.studio.playtest.noProject}
        hint={t.studio.playtest.tempNotice}
      />
    );
  }

  const running = phase === 'running' || phase === 'ended';
  const frameClass = fullscreen
    ? 'relative min-h-0 flex-1 overflow-hidden rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card-2)]'
    : 'relative aspect-video w-full overflow-hidden rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card-2)]';

  const stage = (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[80] flex flex-col gap-2 bg-[var(--cn-paper)] p-3'
          : 'flex w-full flex-col gap-2'
      }
    >
      <SegHead
        label={t.studio.playtest.title}
        right={
          <div className="flex items-center gap-2">
            {phase === 'idle' ? (
              <Btn variant="signal" size="sm" onClick={() => { void handleStart(); }}>
                {t.studio.playtest.run}
              </Btn>
            ) : (
              <Btn variant="danger" size="sm" onClick={handleStop}>
                {t.studio.playtest.stop}
              </Btn>
            )}
            <Btn variant="line" size="sm" onClick={() => setFullscreen((v) => !v)}>
              {fullscreen ? t.studio.playtest.embedded : t.studio.playtest.fullscreen}
            </Btn>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 px-1">
        <Chip active>{setup.mapLabel}</Chip>
        {setup.levelLabel && <Chip>{setup.levelLabel}</Chip>}
        <span className="arc-micro">{t.studio.playtest.tempNotice}</span>
      </div>

      <div className={frameClass}>
        {running ? (
          <Suspense fallback={<Loading />}>
            <GameScene key={runId} />
          </Suspense>
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6">
            <Empty
              title={t.studio.playtest.run}
              hint={phase === 'preparing' ? t.studio.playtest.preparing : setup.mapLabel}
              action={
                phase === 'preparing' ? undefined : (
                  <Btn variant="signal" onClick={() => { void handleStart(); }}>
                    {t.studio.playtest.run}
                  </Btn>
                )
              }
            />
          </div>
        )}

        {phase === 'ended' && (
          <div
            className="absolute inset-0 z-40 flex items-center justify-center p-4"
            style={{ background: 'color-mix(in srgb, var(--cn-paper) 84%, transparent)' }}
          >
            <Deck tone="raised" className="w-full max-w-md p-5">
              <div className="flex flex-col gap-3">
                <span className="arc-title text-[19px]">
                  {isVictory ? t.studio.playtest.resultWin : t.studio.playtest.resultLoss}
                </span>
                <Num value={currentWave} unit={t.studio.playtest.avgWave} size="lg" />
                <div className="flex flex-wrap items-center gap-2">
                  <Btn variant="signal" onClick={() => { void handleStart(); }}>
                    {t.studio.playtest.restart}
                  </Btn>
                  <Btn variant="line" onClick={handleLeave}>
                    {t.studio.playtest.leave}
                  </Btn>
                </div>
              </div>
            </Deck>
          </div>
        )}
      </div>

      {errorText && (
        <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-alert-soft)] px-3 py-2 text-[12px] font-bold text-[var(--cn-alert-deep)]">
          {errorText}
        </div>
      )}
    </div>
  );

  return fullscreen ? createPortal(stage, document.body) : stage;
}
