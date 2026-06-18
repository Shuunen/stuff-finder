# Changelog

All notable changes to stuff-finder are documented here.

## [3.2.1] - 2026-06-18

### Added in 3.2.1

- **Page animations** — items, pages, and UI elements now fade and slide in on load with staggered entry for list items (up to 500ms stagger across 10 items)
- **Background patterns** — app background randomly picks from four SVG patterns (geometric, doodle, triangles) on each session for visual variety
- **Tape animation** — decorative tape elements scale in from left on page load
- **Reduced-motion support** — all animations are collapsed to 0.01ms for users who prefer reduced motion

## [3.2.0] - 2026-06-15

### Added in 3.2.0

- **Offline PWA** — app works without a network connection, browsing cached items when offline
- **IndexedDB storage via Dexie** — items, credentials, display, and theme now persist in IndexedDB instead of localStorage
- **Automatic migration** — existing localStorage data is migrated to IndexedDB on first launch of v3.2; localStorage access failures in privacy-mode browsers are handled gracefully
- **Service worker** — workbox precaches all assets; Appwrite images use CacheFirst (30 days); external resources use NetworkFirst with a 200-entry / 1-day cap
- **Offline banner** — displayed when the device has no network connection
- **Schema validation on IndexedDB reads** — credentials, display, and theme are validated with valibot on load, falling back to safe defaults if the stored value is malformed

### Changed

- Dependencies bumped: appwrite 26, MUI 9.1, react-router 7.17, es-toolkit 1.47.1, vitest 4.1.8 and others

## [3.1.0] - 2026-06-14

### Added in 3.1.0

- **AppPill component** — reusable pill-shaped card container with optional hover lift, shadow depth, and background color; replaces ad-hoc card styling across all pages
- **AppWave component** — decorative SVG wave divider for page headers
- **AppButton component** — unified MUI Button wrapper with consistent semantic color palette, aria-label support, and ThemeProvider hoisted to app root for performance
- **AppLocSticker component** — box/drawer location badge with A–Z box color palette, positioned absolutely on item cards
- **box.utils.ts** — `boxToLetter` and `boxToColor` utilities for the A–Z box color system; 100% test coverage

### Changed in 3.1.0

- **Full UI redesign** — all pages and components rebuilt with the new design system (pill cards, tape accents, wave headers, location stickers)
- **AppItemListEntry** — redesigned card and list views using AppPill, AppLocSticker; removed unused `onSelect`/`showPrice` dead props
- **AppItemList** — removed dead selection machinery (`onSelect`, selection state, `showPrice`); simplified to display-only
- **AppItemDetails** — redesigned detail view with improved layout, tape accent, and AppPill containers
- **AppQuickSearch** — redesigned floating search dock with AppPill; added focus-visible ring on input; added aria-label on voice search button
- **PageHome** — redesigned hero with wave, tape, pill-based search; fixed stale `itemCount` read (now reactive via watchState)
- **AppForm** — Save button always rendered with `outlined` variant (visible when disabled)
- **AppTape** — migrated from template literal to `cn()` for proper Tailwind class merging
- **page-metrics.tsx** — migrated `gray-*` Tailwind palette classes to semantic tokens (`text-black`, `text-grey`, `border-black/20`); removed dead `onSelection`/`showPrice` props
- **MUI ThemeProvider** — hoisted from every AppButton instance to app root (`app.tsx`), eliminating 50+ redundant context trees per page

### Fixed in 3.1.0

- **Accessibility** — removed `outline: none` on search inputs without replacement; added `focus-visible:ring` indicators
- **HTML validity** — AppPill changed from `<span>` to `<div>` to allow block-level children without browser auto-correction

## [3.0.0] - 2026-05-27

### Added in 3.0.0

- **Metrics page** — new `/metrics` route with item counts, total value, items by status (to give, not printed, without location, without photo, without price), box analysis, and top-value items list; updates reactively when items change
- **unique-mark Vite plugin** — injects build stamp (version + commit hash + date) into HTML, JS, and CSS output bundles for easier deployment tracking
- **Turbo** task orchestration for parallel builds, type-checks, and tests
- **OxLint + Oxfmt** replacing Biome and ESLint for linting and formatting
- **Navigation utility** (`navigation.utils.ts`) for programmatic routing outside React components, with a warning when called before router initialisation
- **Logger utility** (`logger.utils.ts`) wrapping shuutils logger for consistent log levels across the app

### Changed in 3.0.0

- **Framework**: migrated from Preact to React 18 with full TypeScript strict mode
- **Appwrite SDK**: migrated from `Databases` API to new `TablesDB` API (`createRow` / `updateRow` / `deleteRow` / `deleteRow`)
- **Storage prefix**: renamed from `@shuunen/stuff-finder_` to `stuff-finder_` — a migration runs automatically on first load to preserve existing credentials and cached data
- **React Router**: added `AppRoutes` component with lazy-loaded pages and `setNavigate` wired via `useEffect` for programmatic navigation
- **Photo upload ordering**: old bucket photo is now deleted only _after_ the new upload succeeds, preventing data loss on failed uploads
- **Node.js**: upgraded to v24

### Fixed in 3.0.0

- Items with no price (`price = -1`) were incorrectly blocked from saving after price field was mistakenly marked required
- `loadingItemIds.includes()` O(n) scan per render replaced with `Set.has()` O(1)
- Metrics page showed stale data — now subscribes to `state.items` via `watchState` so counts update immediately when items are added or removed

### Removed in 3.0.0

- Dependency Cruiser config (`.dependency-cruiser.cjs`)
- `budget.json`, `knip.json`, `postcss.config.js`, `biome.json`, `eslint.config.js`
- `.npmrc`, `.nvmrc` (Node version now managed by project toolchain)
- `vitest.config.ts` (config moved inline into `vite.config.ts`)
- `shims.d.ts`, `objects.utils.ts` (functionality absorbed into shuutils)

---

## [2.2.0] - 2024-12-15

### Added in 2.2.0

- Close notifications by clicking on them
- Real sound files replacing oscillator-based audio
- Quick search available from all pages (not just the home page)

### Changed in 2.2.0

- Scan page now shows loading and error states for the video stream
- Back button includes an icon

### Fixed in 2.2.0

- Asset links updated to use absolute paths in `index.html`

---

## [2.1.0] - 2024-09-29

### Added in 2.1.0

- Speech feature restored
- Beethoven tune easter egg
- Kitchen sink page for component showcase
- Barcode component auto-resizes to fit available space

### Changed in 2.1.0

- Material UI upgraded to v6
- TypeScript upgraded to 5.6

---

## [2.0.0] - 2024-06-12

### Added in 2.0.0

- Card display mode for item list

### Changed in 2.0.0

- Search page redesigned — simpler layout, centered results
- Brand display simplified across the app
- Clipboard handling made more robust (no more accidental loops)

### Fixed in 2.0.0

- `checkDataInClipboard` loop resolved
- Input focus redirects properly when outside a field

---

## [1.3.0] - 2024-02-16

### Added in 1.3.0

- Result pattern for error handling throughout the app

### Changed in 1.3.0

- Migrated to AppWrite backend
- Parsers rewritten with Valibot for stricter runtime validation
- Logger modernised using latest shuutils features

---

## [1.2.0] — prior

See git log for earlier history.
