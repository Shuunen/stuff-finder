/* eslint-disable import/no-anonymous-default-export */
/** @type {import('tailwindcss').Config} */
// biome-ignore lint/style/noDefaultExport: <explanation>
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '360px',
      },
    },
  },
}

