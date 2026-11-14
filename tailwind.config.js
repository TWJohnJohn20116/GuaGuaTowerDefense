/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          void: 'var(--arc-void)',
          'void-2': 'var(--arc-void-2)',
          deck: 'var(--arc-deck)',
          'deck-2': 'var(--arc-deck-2)',
          'deck-3': 'var(--arc-deck-3)',
          line: 'var(--arc-line)',
          'line-strong': 'var(--arc-line-strong)',
          'line-hot': 'var(--arc-line-hot)',
          ink: 'var(--arc-ink)',
          'ink-2': 'var(--arc-ink-2)',
          'ink-3': 'var(--arc-ink-3)',
          'ink-4': 'var(--arc-ink-4)',
          gold: 'var(--arc-gold)',
          'gold-2': 'var(--arc-gold-2)',
          'gold-ink': 'var(--arc-gold-ink)',
          cyan: 'var(--arc-cyan)',
          'cyan-dim': 'var(--arc-cyan-dim)',
          alert: 'var(--arc-alert)',
          vital: 'var(--arc-vital)',
          caution: 'var(--arc-caution)',
          reach: 'var(--arc-reach)',
        },
        // 舊名保留，值全部指向 ARCADE（逐檔改完後刪）
        hl: {
          void: 'var(--arc-void)',
          'void-2': 'var(--arc-void-2)',
          deck: 'var(--arc-deck)',
          'deck-2': 'var(--arc-deck-2)',
          'deck-3': 'var(--arc-deck-3)',
          'deck-4': 'var(--arc-deck-3)',
          line: 'var(--arc-line)',
          'line-strong': 'var(--arc-line-strong)',
          'line-hot': 'var(--arc-line-hot)',
          ink: 'var(--arc-ink)',
          'ink-2': 'var(--arc-ink-2)',
          'ink-3': 'var(--arc-ink-3)',
          'ink-4': 'var(--arc-ink-4)',
          signal: 'var(--arc-gold)',
          'signal-ink': 'var(--arc-gold-ink)',
          vital: 'var(--arc-vital)',
          alarm: 'var(--arc-alert)',
          caution: 'var(--arc-caution)',
          reach: 'var(--arc-reach)',
        },
        nordic: {
          bg: 'var(--arc-void)',
          surface: 'var(--arc-deck)',
          border: 'var(--arc-line)',
          primary: 'var(--arc-gold)',
          secondary: 'var(--arc-cyan)',
          accent: 'var(--arc-gold)',
          danger: 'var(--arc-alert)',
          text: 'var(--arc-ink)',
          muted: 'var(--arc-ink-2)',
        },
      },
      fontFamily: {
        game: ['Noto Sans TC', 'sans-serif'],
        mono: [
          'JetBrains Mono',
          'Cascadia Mono',
          'Consolas',
          'SFMono-Regular',
          'ui-monospace',
          'monospace',
        ],
      },
      // ARCADE：只有小圓角，沒有膠囊以外的大圓角
      // CANDY：整體圓潤，最小也是 12px
      borderRadius: {
        none: '0',
        sm: '12px',
        DEFAULT: '14px',
        md: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '22px',
        '3xl': '26px',
        full: '9999px',
      },
      // ARCADE：硬陰影，不是柔和雲霧
      boxShadow: {
        none: 'none',
        sm: '0 1px 0 rgba(0,0,0,0.55)',
        DEFAULT: '0 2px 0 rgba(0,0,0,0.55)',
        md: '0 6px 16px -6px rgba(0,0,0,0.9)',
        lg: '0 10px 24px -8px rgba(0,0,0,0.9)',
        xl: '0 28px 60px -20px rgba(0,0,0,0.95)',
        bevel: '0 4px 0 #0a1020',
        'bevel-gold': '0 4px 0 #a87400',
        gold: '0 0 0 1px rgba(255,212,71,0.55), 0 0 24px -6px rgba(255,212,71,0.8)',
        cyan: '0 0 0 1px rgba(56,245,255,0.5), 0 0 24px -6px rgba(56,245,255,0.8)',
      },
      transitionTimingFunction: {
        hl: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        arc: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'arc-out': 'cubic-bezier(0.2, 0.9, 0.25, 1)',
      },
      animation: {
        'pulse-slow': 'arc-pulse 2.4s cubic-bezier(0.2, 0.9, 0.25, 1) infinite',
        'theme-fade': 'themeFade 0.5s ease-out',
      },
      keyframes: {
        themeFade: {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.mask-edges-x': {
          'mask-image':
            'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
          '-webkit-mask-image':
            'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
        },
        '.hl-cut-tl': {
          'clip-path': 'polygon(14px 0, 100% 0, 100% 100%, 0 100%, 0 14px)',
        },
        '.hl-cut-br': {
          'clip-path':
            'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
        },
        '.arc-cut-tl': {
          'clip-path': 'polygon(14px 0, 100% 0, 100% 100%, 0 100%, 0 14px)',
        },
        '.arc-cut-br': {
          'clip-path':
            'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
        },
        '.arc-cut-sm': {
          'clip-path':
            'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)',
        },
      });
    },
  ],
};
