/**
 * 無畫面平衡模擬
 *
 * 用官方自動戰鬥（gameStoreAutoBattle）在完全不渲染的情況下跑 N 局：
 * 每局都是「startGame → 灌入自動戰鬥 → 自己推幀 → 收結果 → 丟棄本局」。
 *
 * 三個關鍵設計：
 *   1. 不靠 requestAnimationFrame：rAF 在背景分頁會停擺，而且模擬不能占用畫面。
 *      這裡用 setTimeout(0) 分片，每個分片有牆上時鐘預算（sliceBudgetMs），跑完就讓出主執行緒。
 *   2. 虛擬時鐘：引擎有一批計時讀 Date.now()（狀態效果、塔冷卻、技能），
 *      快速模擬時牆上時間幾乎不動，不接管時鐘會讓「3 秒減速」變成永久減速。見 virtualClock.ts。
 *   3. 時間量測：單局用模擬時間（rt.simNow）、整輪用 performance.now() 的差，
 *      兩者都回報出去，才知道「20 局要跑多久、單局等於幾秒戰局」。
 */
import { useGameStore } from '@/store/gameStore';
import { advanceMatch, createMatchRuntime, isMatchFinished } from './matchRuntime';
import { withVirtualClock } from './virtualClock';
import { summarizeRuns } from './stats';
import { startPlaytestSession, stopPlaytestSession } from './session';
import type {
  CancelToken,
  SimRunResult,
  SimulationOptions,
  SimulationOutcome,
} from './types';

/** 讓出主執行緒：setTimeout(0) 比 requestIdleCallback 可預期（後者在忙碌時可能永不觸發） */
function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/** 是否已被取消 */
function isCancelled(token: CancelToken | undefined): boolean {
  return Boolean(token?.cancelled);
}

/**
 * 跑一局，回傳結果
 *
 * 這裡刻意把「一局」寫成獨立函式：分片只負責呼叫它、更新進度、讓出執行緒。
 */
async function runSingleMatch(options: SimulationOptions): Promise<SimRunResult> {
  const { setup, stepMs, maxMatchMs, sliceBudgetMs } = options;
  await startPlaytestSession(setup);

  // 模擬一律用自動戰鬥，並且把會「改變玩家存檔」的選項關掉（自動出售／融合不在平衡範圍）
  const game = useGameStore.getState();
  if (!game.autoBattleEnabled) game.toggleAutoBattle();
  // 模擬一律跑全自動並固定預設檔，確保各局結果可比
  game.setAutoBattleMode('full');
  game.setAutoBattlePreset('balanced');
  game.setAutoSkipWaveEnabled(true);

  const maxHealth = useGameStore.getState().health;
  const runtime = createMatchRuntime();
  // 開第一波：模擬不播 3 秒倒數（倒數只是 UX，不影響戰鬥數值）
  useGameStore.getState().startWave();

  let timedOut = false;
  let finished = false;

  while (!finished) {
    if (isCancelled(options.token)) break;
    if (runtime.simNow >= maxMatchMs) {
      timedOut = true;
      break;
    }
    // 防凍結：若局內狀態被外部收掉（isPlaying 變 false）但還沒判定勝敗，
    // advanceMatch 會整幀 early-return，simNow 不再前進，這裡必須先跳脫否則會無限迴圈
    if (!useGameStore.getState().isPlaying && !isMatchFinished()) {
      timedOut = true;
      break;
    }

    const sliceStart = performance.now();
    const clockBase = Date.now() - runtime.simNow;
    withVirtualClock(
      () => clockBase + runtime.simNow,
      () => {
        while (performance.now() - sliceStart < sliceBudgetMs) {
          advanceMatch(runtime, stepMs);
          if (isMatchFinished()) {
            finished = true;
            return;
          }
          if (runtime.simNow >= maxMatchMs) return;
        }
      },
    );
    if (!finished) await yieldToUi();
  }

  const final = useGameStore.getState();
  const result: SimRunResult = {
    victory: final.isVictory,
    // 用「真的清完的波數」而不是 currentWave：漏掉的那一波不算存活（打贏最後一波時兩者相同）
    survivedWaves: runtime.waveHealth.length,
    remainingHealth: Math.max(0, final.health),
    maxHealth: maxHealth > 0 ? maxHealth : 1,
    waveHealth: runtime.waveHealth,
    elapsedMs: Math.round(runtime.simNow),
    timedOut,
  };

  stopPlaytestSession();
  return result;
}

/**
 * 跑一整輪模擬
 *
 * 一局失敗（例如關卡資料壞掉）不能讓整輪死掉：記一筆 timedOut 的結果代表「這局不算」，
 * 勝率的分母會自動排除它（見 stats.ts）。
 */
export async function runBalanceSimulation(options: SimulationOptions): Promise<SimulationOutcome> {
  const wallStart = performance.now();
  const results: SimRunResult[] = [];
  let cancelled = false;

  for (let i = 0; i < options.runs; i++) {
    if (isCancelled(options.token)) {
      cancelled = true;
      break;
    }
    options.onProgress?.({
      done: i,
      total: options.runs,
      currentWave: useGameStore.getState().currentWave,
      maxWaves: options.setup.maxWaves,
    });

    try {
      const result = await runSingleMatch(options);
      results.push(result);
    } catch (error) {
      stopPlaytestSession();
      results.push({
        victory: false,
        survivedWaves: 0,
        remainingHealth: 0,
        maxHealth: 1,
        waveHealth: [],
        elapsedMs: 0,
        timedOut: true,
      });
      // 錯誤路徑沿用專案慣例：走錯誤通道回報，不要印一般訊息
      console.error('[平衡模擬] 單局模擬失敗', error);
    }
  }

  if (!cancelled && isCancelled(options.token)) cancelled = true;
  options.onProgress?.({
    done: results.length,
    total: options.runs,
    currentWave: 0,
    maxWaves: options.setup.maxWaves,
  });

  return {
    summary: summarizeRuns(results),
    results,
    wallClockMs: Math.round(performance.now() - wallStart),
    cancelled,
  };
}
