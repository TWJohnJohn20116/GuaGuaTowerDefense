/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        hl: {
          void: 'var(--hl-void)',
          'void-2': 'var(--hl-void-2)',
          deck: 'var(--hl-deck)',
          'deck-2': 'var(--hl-deck-2)',
          'deck-3': 'var(--hl-deck-3)',
          'deck-4': 'var(--hl-deck-4)',
          line: 'var(--hl-line)',
          'line-strong': 'var(--hl-line-strong)',
          'line-hot': 'var(--hl-line-hot)',
          ink: 'var(--hl-ink)',
          'ink-2': 'var(--hl-ink-2)',
          'ink-3': 'var(--hl-ink-3)',
          'ink-4': 'var(--hl-ink-4)',
          signal: 'var(--hl-signal)',
          'signal-ink': 'var(--hl-signal-ink)',
          vital: 'var(--hl-vital)',
          alarm: 'var(--hl-alarm)',
          caution: 'var(--hl-caution)',
          reach: 'var(--hl-reach)',
        },
        // 相容：舊程式用 nordic-* 的地方接同一組
        nordic: {
          bg: 'var(--hl-void)',
          surface: 'var(--hl-deck)',
          border: 'var(--hl-line)',
          primary: 'var(--hl-signal)',
          secondary: 'var(--hl-vital)',
          accent: 'var(--hl-signal)',
          danger: 'var(--hl-alarm)',
          text: 'var(--hl-ink)',
          muted: 'var(--hl-ink-2)',
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
      borderRadius: {
        // HARDLINE：圓角只有 0 這一種
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '0',
      },
      boxShadow: {
        // 沒有陰影，只有線
        none: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
      },
      transitionTimingFunction: {
        hl: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
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
          'clip-path':
            'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)',
        },
        '.hl-cut-br': {
          'clip-path':
            'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
        },
      });
    },
  ],
}
