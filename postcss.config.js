// Tailwind v4 起，PostCSS 外掛換成 @tailwindcss/postcss（不再是 tailwindcss 本身）。
// 注意：這個檔案與 postcss.config.mjs 曾同時存在，PostCSS 只會讀到 .js 這一個
// （postcss-load-config 的搜尋順序 .js 在 .mjs 之前），重複的那份已刪除。
// v4 內建前綴處理（lightningcss），autoprefixer 已無實質作用；先保留以免動到既有產物。
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
