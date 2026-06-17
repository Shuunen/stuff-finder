import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import { uniqueMark } from './src/plugins/unique-mark.ts'

const imagesCacheMaxEntries = 500
const imagesCacheMaxAgeSeconds = 2_592_000 // 30 days
const externalCacheMaxEntries = 200
const externalCacheMaxAgeSeconds = 86_400 // 1 day
const httpStatusOk = 200

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
  plugins: [
    react(),
    tailwindcss(),
    uniqueMark(),
    // oxlint-disable-next-line new-cap
    VitePWA({
      manifest: {
        background_color: '#fbf7ee',
        description: "Sorting things is pointless if you can't find them afterwards",
        display: 'standalone',
        icons: [
          { sizes: '192x192', src: '/assets/android-chrome-192x192.png', type: 'image/png' },
          { purpose: 'maskable', sizes: '192x192', src: '/assets/maskable-192x192.png', type: 'image/png' },
          { sizes: '512x512', src: '/assets/android-chrome-512x512.png', type: 'image/png' },
          { purpose: 'maskable', sizes: '512x512', src: '/assets/maskable-512x512.png', type: 'image/png' },
        ],
        id: 'stuff-finder',
        name: 'Stuff Finder',
        orientation: 'any',
        scope: '/',
        short_name: 'Stuff Finder',
        start_url: '/',
        theme_color: '#fbf7ee',
      },
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
    port: 4300,
  },
  server: {
    host: 'localhost',
    port: 4200,
  },
  test: {
    coverage: {
      exclude: ['**/*.types.ts', '**/*.tsx', '**/*.d.ts', '**/*.css', 'src/pwa.ts', 'src/db/db.ts'],
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
