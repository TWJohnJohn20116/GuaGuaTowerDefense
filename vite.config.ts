import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import net from 'node:net';

// 1421 在部分 Windows 機器上會被系統保留：Hyper-V／WinNAT 從動態埠範圍
// （預設 1024–15000）的低端切出以 100 埠為單位的保留塊，本機的 1385–1484
// 就蓋住 1421，監聽時直接丟 EACCES（不是被佔用，是系統不給綁）。
// 所以不再硬編埠：向作業系統要一個空閒埠——listen(0) 只會拿到未被保留的埠。
// 需要固定時用 VITE_DEV_PORT（例如某次除錯要對外公布一個固定位址）。
// Tauri 的 devUrl 是靜態字串（不能動態求值），所以桌面開發固定用這個埠；
// 改這裡就必須同步 src-tauri/tauri.conf.json 的 build.devUrl。
const TAURI_DEV_PORT = 15173;

const pickFreePort = (preferred?: string): Promise<number> => {
  const wanted = Number(preferred);
  if (Number.isInteger(wanted) && wanted > 0) return Promise.resolve(wanted);
  return new Promise<number>((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.once('error', reject);
    probe.listen(0, () => {
      const address = probe.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      probe.close(() => resolve(port));
    });
  });
};

export default defineConfig(async () => ({
  plugins: [react()],
  clearScreen: false,
  server: {
    // 桌面（tauri dev）走固定埠，瀏覽器走系統分配的空閒埠；VITE_DEV_PORT 可強制指定。
    port: process.env.TAURI_PLATFORM
      ? TAURI_DEV_PORT
      : await pickFreePort(process.env.VITE_DEV_PORT),
    strictPort: true,
    // 這個工作區有很多工具會產生暫存檔（.tmpdir、.tsc-*.txt、截圖…）。
    // Vite 的 watcher 碰到被鎖住的檔案會丟 EBUSY 並讓整個 dev server 直接結束，
    // 所以這裡只監看真正會被前端引用的原始碼。
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/src-tauri/**',
        '**/.shots/**',
        '**/dist/**',
        '**/*.tmp',
        '**/*.tmpdir/**',
        '**/.*.tmpdir/**',
        (filePath: string) => {
          const p = filePath.replace(/\\/g, '/');
          if (p.includes('.tmpdir') || p.endsWith('.tmp')) return true;
          const rel = path.relative(__dirname, filePath).replace(/\\/g, '/');
          // 專案根目錄的暫存輸出（tsc 重導、log、截圖清單…）
          if (rel && !rel.includes('/') && /\.(txt|log)$/i.test(rel)) return true;
          return false;
        },
      ],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    rollupOptions: {
      output: {
        // 手動分塊策略
        manualChunks: {
          // 核心框架
          'vendor-react': ['react', 'react-dom'],
          // 動畫庫
          'vendor-framer': ['framer-motion'],
          // 狀態管理
          'vendor-zustand': ['zustand'],
        },
        // 自動分塊：按模組路徑分割
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId || '';

          // 場景組件分塊
          if (facadeModuleId.includes('scenes/GameScene')) {
            return 'chunks/game-[hash].js';
          }
          if (facadeModuleId.includes('scenes/')) {
            return 'chunks/scenes-[hash].js';
          }
          // 數據文件分塊
          if (facadeModuleId.includes('/data/')) {
            return 'chunks/data-[hash].js';
          }
          // 國際化分塊
          if (facadeModuleId.includes('/i18n/')) {
            return 'chunks/i18n-[hash].js';
          }
          // 預設
          return 'chunks/[name]-[hash].js';
        },
      },
    },
    // 增加分塊大小警告閾值
    chunkSizeWarningLimit: 500,
    // 不要為了印出 gzip 欄位而對每個 chunk 再壓一次：主 chunk 已 1.15 MB，
    // 這一步在 CI 要多花 1–2 秒，而真正的大小由 scripts/ci/guards.mjs --bundle
    // 直接量檔案 bytes，不看這張表。
    reportCompressedSize: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
