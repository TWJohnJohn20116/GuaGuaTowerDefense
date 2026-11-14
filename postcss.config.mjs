// Tailwind v4 起，PostCSS 外掛換成 @tailwindcss/postcss（不再是 tailwindcss 本身）。
// v4 內建前綴處理（lightningcss），autoprefixer 已無實質作用；先保留以免動到既有產物。
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
