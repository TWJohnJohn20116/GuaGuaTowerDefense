/**
 * 場景錯誤邊界
 *
 * 為什麼需要：所有場景都是 `lazy()` 載入、包在 `<Suspense fallback={<Loading />}>` 裡。
 * chunk 載入失敗（大量改檔後 HMR 的 module graph 失效、或部署後舊 hash 404）時，
 * Suspense 會永遠停在「載入中…」，畫面看起來就是「這個介面打不開」，而且沒有任何訊息。
 *
 * 這一層把「載入失敗」與「render 拋錯」都接住，換成可讀訊息與重新載入按鈕；
 * 換場景時自動清掉錯誤，避免一個場景壞掉就整個 App 卡死。
 *
 * 用 class component 是必要的：`getDerivedStateFromError` 沒有 hook 等價物。
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface SceneErrorLabels {
  title: string;
  hint: string;
  reload: string;
}

interface SceneErrorBoundaryProps {
  /** 目前場景 id，換場景時用來清錯誤 */
  sceneKey: string;
  labels: SceneErrorLabels;
  children: ReactNode;
}

interface SceneErrorBoundaryState {
  error: Error | null;
}

export class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): SceneErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // 錯誤路徑沿用專案的 console.error 慣例（§8：不新增一般 debug 輸出）
    console.error('[scene-error]', this.props.sceneKey, error, info.componentStack);
  }

  componentDidUpdate(prevProps: SceneErrorBoundaryProps): void {
    if (prevProps.sceneKey !== this.props.sceneKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    const { labels, sceneKey } = this.props;
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="w-full max-w-xl rounded-[12px] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] p-6">
          <div className="font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--cn-ink-3)]">
            SCENE ERROR · {sceneKey}
          </div>
          <div className="mt-2 text-[15px] font-bold text-[var(--cn-ink)]">{labels.title}</div>
          <div className="mt-1 text-[12px] text-[var(--cn-ink-2)]">{labels.hint}</div>
          <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-[8px] border border-[var(--cn-line-soft)] bg-[var(--cn-paper)] p-3 font-mono text-[11px] text-[var(--cn-ink-2)]">
            {error.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-[10px] border-[2px] border-[var(--cn-line)] bg-[var(--cn-gold)] px-4 py-2 font-mono text-[11px] font-extrabold uppercase tracking-[0.06em] text-[var(--cn-ink)]"
          >
            {labels.reload}
          </button>
        </div>
      </div>
    );
  }
}
