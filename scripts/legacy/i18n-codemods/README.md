# scripts/legacy/i18n-codemods

這裡放的是**歷史遺跡，不要執行**。

它們是 2025–2026 年間把 i18n key 一批一批塞進 `src/i18n/locales/*.ts` 的一次性 codemod
（`add-i18n-batch1` 一路到 `batch29` 加上各種 `fix-batchN` / `polish-*` / `seed-*`）。
共同特徵：

- 靠字串比對 + `String.replace` 直接改寫 TS 原始檔；
- 沒有冪等性，重跑會產生重複 key 或壞掉的物件字面值；
- 依賴當時的檔案內容，現在跑會把 locales 弄壞。

## 為什麼留著而不是刪掉

這些腳本記錄了「某批文案為什麼用這個 key 名」的脈絡，出問題時可以回溯。
但它們不屬於建置流程，也不該出現在 `scripts/` 根目錄冒充工具。

## 現在的替代方案

| 以前用腳本做的事 | 現在的做法 |
| --- | --- |
| 補某批 key | 直接改 `src/i18n/locales/zh-TW.ts`（型別由它推導） |
| 檢查其他語言有沒有漏 / 打錯 | `node scripts/i18n-parity.mjs`（CI 會跑 `--strict`） |
| 檢查 key 是否被程式引用 | `npx tsc --noEmit`（`Translations = typeof zhTW`，讀不存在的鍵直接編譯失敗） |
| 檢查 locale 檔語法 | 同上，TypeScript 就是解析器 |
