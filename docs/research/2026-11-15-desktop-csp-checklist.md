# 桌面版 CSP 實機驗證清單

- 日期：2026-11-15
- 為什麼只能人工：`AGENTS.md §13.9` 禁止在本機啟動桌面版（`npm run tauri dev` 也在禁止清單），
  而 CSP 只在 webview 內生效，瀏覽器 dev server 驗不到。
- 靜態檢核：`node scripts/csp-check.mjs`（檢查 8 項必要指令，CI 可跑）

## 執行步驟

```bash
npm run tauri dev        # 或安裝打包後的 exe
```

逐項操作，全部要成功：

| # | 操作路徑 | 驗證什麼 | 通過標準 |
|---|---|---|---|
| 1 | 設定 → 音樂 → 播放 | `media-src https:` | 有聲音、無 console 錯誤 |
| 2 | 設定 → 音樂 → 下載專輯 | `connect-src https://api.jamendo.com` | 下載完成或明確的 API 錯誤（不是 CSP 阻擋） |
| 3 | 設定 → 關於 → 檢查更新 | `connect-src https://api.github.com` | 顯示版本或「已是最新」 |
| 4 | 百科 → 任一 mod 圖示 | `img-src data:` | 圖示正常顯示 |
| 5 | 創意工坊 → 規則 → 新增 JS 節點 → 完整編輯器 | `script-src 'unsafe-eval' blob:`、`worker-src blob:` | 編輯器可開、存檔後節點有程式碼 |
| 6 | 創意工坊 → 試玩 → 開始試玩 | 同上（腳本 Worker）＋`connect-src ipc:` | 能開局、無「拒絕載入」訊息 |
| 7 | 創意工坊 → 發佈 → 匯出 .ggmod | `Blob` 下載 | 檔案下載成功 |

## 失敗時

1. 開 DevTools（右鍵 → 檢查）看 Console 的 `Refused to …` 訊息，記下被擋的 directive 與 URL。
2. 把該來源加進 `src-tauri/tauri.conf.json` 的 `app.security.csp` 對應指令。
3. **回滾**：把 `security.csp` 改回 `null` 即可（會失去收窄，但保證可用）。
4. 改完重跑 `node scripts/csp-check.mjs` 與一次桌面版。
