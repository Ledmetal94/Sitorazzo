/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  presets: [require('./tailwind.preset.cjs')],
  theme: {
    extend: {},
  },
  plugins: [],
}
