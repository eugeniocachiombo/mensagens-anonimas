/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      // Estas duas utilidades só existem no Tailwind v4; no v3 precisam ser declaradas.
      boxShadow: { xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
      backdropBlur: { xs: '2px' }
    }
  },
  plugins: []
}
