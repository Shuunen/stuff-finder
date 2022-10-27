/** @type {import('tailwindcss').Config} */
/* eslint-disable unicorn/prefer-module */
module.exports = {
  content: ['public/*.html', 'src/**/*.ts'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
