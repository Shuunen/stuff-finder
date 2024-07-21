import { preact } from '@preact/preset-vite'
import { defineConfig } from 'vite'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  plugins: [preact()],
  server: {
    port: 8080,
  },
})
