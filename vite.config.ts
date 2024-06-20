import { preact } from '@preact/preset-vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-anonymous-default-export
export default defineConfig({
  plugins: [preact()],
  server: {
    port: 8080,
  },
})
