import { defineConfig } from 'vitest/config'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/utils/browser.utils.ts', 'src/utils/speech.utils.ts', 'src/constants.ts'],
      include: ['src/utils/**'],
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        100: true,
      },
    },
  },
})
