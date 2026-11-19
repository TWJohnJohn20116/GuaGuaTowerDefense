import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * 自動戰鬥 A/B 基準專用設定。
 *
 * 這份基準跑 63,000 tick × 2 套策略，單檔約 305s（實測 CI run 44530538806：
 * 整條 CI wall 5m27s，光這一檔就佔 5m06s）。它是策略研究，不是回歸測試，
 * 所以被 vitest.config.ts 的 exclude 擋在預設 `npm run test` 之外，
 * 只由 `npm run test:bench`（本設定）或 CI 的手動觸發 job 跑。
 *
 * 為什麼要另開一份 config 而不是 `vitest run <檔案路徑>`：
 * vitest 的 exclude 優先於 CLI 的位置參數，被排除的檔案餵進去只會得到
 * 「找不到測試」而靜默通過——那比不跑更危險。
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/autobattleBench.test.ts'],
  },
});
