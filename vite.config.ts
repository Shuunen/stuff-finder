import { preact } from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import { uniqueMark } from './src/plugins/unique-mark.ts'

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    reportCompressedSize: false,
  },
  plugins: [preact(), tailwindcss(), uniqueMark()],
  server: {
    port: 8080,
  },
  test: {
    coverage: {
      exclude: ['src/utils/browser.utils.ts', 'src/utils/speech.utils.ts', 'src/constants.ts'],
      provider: 'v8' as const,
    },
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    reporters: ['dot'],
    silent: true,
  },
})
