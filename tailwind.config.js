module.exports = {
  mode: 'jit',
  purge: ['public/*.html', 'src/**/*.ts', 'src/**/*.js'],
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
