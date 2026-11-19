import { defineConfig } from 'vitest/config';
import path from 'path';

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
    include: ['src/**/*.test.{ts,tsx}'],
    // 自動戰鬥 A/B 基準是策略研究，不是回歸測試：它跑 63,000 tick × 2 套策略，
    // 單檔 305s，曾佔掉整條 CI 的 93% wall clock。改由 npm run test:bench
    // 或 CI 的「自動戰鬥基準（僅手動觸發）」job 跑，斷言一條都沒刪。
    exclude: ['node_modules', 'src-tauri', 'dist', 'src/test/autobattleBench.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts',
      ],
    },
  },
});