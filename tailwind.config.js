/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['public/*.html', 'src/**/*.ts'],
  plugins: [
    require('@tailwindcss/forms'),
  ],
  theme: {
    extend: {},
  },
}
