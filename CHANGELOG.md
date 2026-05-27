# Changelog

All notable changes to stuff-finder are documented here.

## [3.0.0] - 2026-05-27

### Added

- **Metrics page** — new `/metrics` route with item counts, total value, items by status (to give, not printed, without location, without photo, without price), box analysis, and top-value items list; updates reactively when items change
- **unique-mark Vite plugin** — injects build stamp (version + commit hash + date) into HTML, JS, and CSS output bundles for easier deployment tracking
- **Turbo** task orchestration for parallel builds, type-checks, and tests
- **OxLint + Oxfmt** replacing Biome and ESLint for linting and formatting
- **Navigation utility** (`navigation.utils.ts`) for programmatic routing outside React components, with a warning when called before router initialisation
- **Logger utility** (`logger.utils.ts`) wrapping shuutils logger for consistent log levels across the app

### Changed

- **Framework**: migrated from Preact to React 18 with full TypeScript strict mode
- **Appwrite SDK**: migrated from `Databases` API to new `TablesDB` API (`createRow` / `updateRow` / `deleteRow` / `deleteRow`)
- **Storage prefix**: renamed from `@shuunen/stuff-finder_` to `stuff-finder_` — a migration runs automatically on first load to preserve existing credentials and cached data
- **React Router**: added `AppRoutes` component with lazy-loaded pages and `setNavigate` wired via `useEffect` for programmatic navigation
- **Photo upload ordering**: old bucket photo is now deleted only _after_ the new upload succeeds, preventing data loss on failed uploads
- **Node.js**: upgraded to v24

### Fixed

- Items with no price (`price = -1`) were incorrectly blocked from saving after price field was mistakenly marked required
- `loadingItemIds.includes()` O(n) scan per render replaced with `Set.has()` O(1)
- Metrics page showed stale data — now subscribes to `state.items` via `watchState` so counts update immediately when items are added or removed

### Removed

- Dependency Cruiser config (`.dependency-cruiser.cjs`)
- `budget.json`, `knip.json`, `postcss.config.js`, `biome.json`, `eslint.config.js`
- `.npmrc`, `.nvmrc` (Node version now managed by project toolchain)
- `vitest.config.ts` (config moved inline into `vite.config.ts`)
- `shims.d.ts`, `objects.utils.ts` (functionality absorbed into shuutils)

---

## [2.2.0] - 2024-12-15

### Added

- Close notifications by clicking on them
- Real sound files replacing oscillator-based audio
- Quick search available from all pages (not just the home page)

### Changed

- Scan page now shows loading and error states for the video stream
- Back button includes an icon

### Fixed

- Asset links updated to use absolute paths in `index.html`

---

## [2.1.0] - 2024-09-29

### Added

- Speech feature restored
- Beethoven tune easter egg
- Kitchen sink page for component showcase
- Barcode component auto-resizes to fit available space

### Changed

- Material UI upgraded to v6
- TypeScript upgraded to 5.6

---

## [2.0.0] - 2024-06-12

### Added

- Card display mode for item list

### Changed

- Search page redesigned — simpler layout, centered results
- Brand display simplified across the app
- Clipboard handling made more robust (no more accidental loops)

### Fixed

- `checkDataInClipboard` loop resolved
- Input focus redirects properly when outside a field

---

## [1.3.0] - 2024-02-16

### Added

- Result pattern for error handling throughout the app

### Changed

- Migrated to AppWrite backend
- Parsers rewritten with Valibot for stricter runtime validation
- Logger modernised using latest shuutils features

---

## [1.2.0] — prior

See git log for earlier history.
