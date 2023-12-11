/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [
    // eslint-disable-next-line no-undef, import/no-commonjs
    require('@tailwindcss/forms'),
  ],
  theme: {
    extend: {},
  },
}

