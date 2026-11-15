/**
 * 臨時局的生命週期
 *
 * 一局的「開始／結束」只有這兩個入口，其他模組（內嵌試玩、平衡模擬）都走這裡，
 * 才不會出現「某條路徑忘了還原」的漏。這裡做三件事：
 *   1. 開局前把遊戲 store 切進 isPlaytest（統計／成就／場景跳轉由 store 端隔離）
 *   2. 開局前後把「會留下痕跡」的外部 store 快照起來（回放、統計進行中的局）
 *   3. 結束時丟棄本局內容，並把快照還原 —— 臨時局不得留下任何存檔級資料
 *
 * 註：回放錄製 useReplayRecorder 在 src/hooks/**，不在本線可改路徑（已回報 lead）。
 * 在那支補上 isPlaytest 早退之前，這裡用「開局快照 → 結束還原」把污染抹掉：
 * 錄製中途取消，replays 還原成開局前的陣列，等同沒發生過。
 */
import { useGameStore } from '@/store/gameStore';
import { useReplayStore } from '@/store/replayStore';
import { useStatsStore } from '@/store/statsStore';
import { clearPlaytestWaveSets } from './waveRegistry';
import type { PlaytestSetup } from './types';

type StatsGameSnapshot = ReturnType<typeof useStatsStore.getState>['currentGame'];
type ReplayListSnapshot = ReturnType<typeof useReplayStore.getState>['replays'];

interface IsolationSnapshot {
  replays: ReplayListSnapshot;
  statsGame: StatsGameSnapshot;
}

/** 模組級可變變數：只存「這次臨時局的快照」，符合 store 規則對計時器／快取的例外 */
let snapshot: IsolationSnapshot | null = null;

function beginIsolation(): void {
  if (snapshot) return;
  snapshot = {
    replays: useReplayStore.getState().replays,
    statsGame: useStatsStore.getState().currentGame,
  };
  // 統計 store 的追蹤函式全是「沒有 currentGame 就直接 return」，
  // 先歸零就把「試玩不寫統計」從「靠旗標繞過」升級成「根本沒有目標可寫」。
  if (snapshot.statsGame) {
    useStatsStore.setState({ currentGame: null });
  }
}

function endIsolation(): void {
  if (!snapshot) return;
  const replay = useReplayStore.getState();
  if (replay.isRecording) replay.cancelRecording();
  useReplayStore.setState({ replays: snapshot.replays });
  if (snapshot.statsGame) {
    useStatsStore.setState({ currentGame: snapshot.statsGame });
  }
  snapshot = null;
}

/** 給其他檔案（例如 lead 要補 guard 的 hooks）判斷「現在是不是臨時局」 */
export function isPlaytestActive(): boolean {
  return useGameStore.getState().isPlaytest;
}

/**
 * 開一局臨時局
 *
 * 注意：旗標必須在 startGame 之前設好——startGame 會讀它來決定
 * 「要不要寫統計」與「要不要把 scene 切到 game」。
 */
export async function startPlaytestSession(setup: PlaytestSetup): Promise<void> {
  const before = useGameStore.getState();
  if (before.isPlaying) {
    // 上一局沒收乾淨（例如使用者直接關掉分頁再回來）先丟棄，避免兩局疊在一起
    before.exitPlaytest();
  }
  beginIsolation();
  useGameStore.getState().setPlaytestMode(true);
  await useGameStore.getState().startGame(
    setup.pathName,
    setup.difficulty,
    false,
    setup.maxWaves,
    undefined,
    setup.customWaveSetId,
  );
}

/**
 * 結束臨時局並丟棄本局內容
 *
 * grid 不在 createEmptyMatchState 的歸零清單內（它只記 towerId），
 * 塔清空後如果不重鋪，工坊只要讀一次 grid 就會看到指向已刪塔的幽靈 id。
 */
export function stopPlaytestSession(): void {
  const game = useGameStore.getState();
  if (!game.isPlaytest && !game.isPlaying) {
    endIsolation();
    return;
  }
  if (game.isPlaytest) {
    game.exitPlaytest();
  }
  useGameStore.setState({ grid: [] });
  clearPlaytestWaveSets();
  endIsolation();
}
