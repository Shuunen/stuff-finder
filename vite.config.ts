import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { uniqueMark } from 'shuutils/plugins'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import { cspNonce } from './src/plugins/csp-nonce.ts'

const imagesCacheMaxEntries = 500
const imagesCacheMaxAgeSeconds = 2_592_000 // 30 days
const externalCacheMaxEntries = 200
const externalCacheMaxAgeSeconds = 86_400 // 1 day
const httpStatusOk = 200

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: './dist',
    reportCompressedSize: false,
  },
  plugins: [
    react(),
    tailwindcss(),
    uniqueMark(),
    cspNonce(),
    // oxlint-disable-next-line new-cap
    VitePWA({
      // the manifest is public/manifest.webmanifest, linked from index.html
      manifest: false,
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,woff2}'],
        runtimeCaching: [
          {
            handler: 'CacheFirst',
            options: {
              cacheName: 'appwrite-images',
              cacheableResponse: { statuses: [0, httpStatusOk] },
              expiration: { maxAgeSeconds: imagesCacheMaxAgeSeconds, maxEntries: imagesCacheMaxEntries },
            },
            urlPattern: /cloud\.appwrite\.io\/v1\/storage/u,
          },
          {
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-resources',
              expiration: { maxAgeSeconds: externalCacheMaxAgeSeconds, maxEntries: externalCacheMaxEntries },
            },
            urlPattern: /^https:\/\//u,
          },
        ],
      },
    }),
  ],
  preview: {
    host: 'localhost',
    port: 4110,
    strictPort: true,
  },
  server: {
    host: 'localhost',
    port: 5110,
    strictPort: true,
  },
  test: {
    coverage: {
      exclude: ['**/*.types.ts', '**/*.tsx', '**/*.d.ts', '**/*.css', '**/*.snap', 'src/pwa.ts', 'src/db/db.ts'],
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
