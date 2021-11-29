module.exports = {
  mode: 'jit',
  purge: ['public/*.html', 'src/**/*.ts'],
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
