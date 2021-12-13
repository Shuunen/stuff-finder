module.exports = {
  content: ['public/*.html', 'src/**/*.ts'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
