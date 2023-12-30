import { preact } from '@preact/preset-vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-anonymous-default-export, import/no-unused-modules
export default defineConfig({
  plugins: [
    preact(),
  ],
  server: {
    port: 8080,
  },
})
