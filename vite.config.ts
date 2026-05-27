import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { uniqueMark } from './src/plugins/unique-mark.ts'

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
    outDir: './dist',
    reportCompressedSize: true,
  },
  plugins: [react(), tailwindcss(), uniqueMark()],
  preview: {
    host: 'localhost',
    port: 4300,
  },
  server: {
    host: 'localhost',
    port: 4200,
  },
  test: {
    coverage: {
      exclude: ['**/*.types.ts', '**/*.tsx', '**/*.d.ts', '**/*.css'],
      include: ['src'],
      provider: 'v8' as const,
      reporter: [['text', { maxCols: 120 }], 'lcov'],
      thresholds: {
        100: true,
      },
    },
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    reporters: ['dot'],
    silent: true,
  },
})
