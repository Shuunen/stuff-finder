import { defineConfig } from 'vitest/config'

// eslint-disable-next-line import/no-anonymous-default-export, import/no-unused-modules
export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/utils/browser.utils.ts', 'src/utils/sound.utils.ts', 'src/constants.ts'],
      include: ['src/utils/**'],
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        100: true,
      },
    },
  },
})
