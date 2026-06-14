# TODOS

- nicer colorful identity ([something like this ?](https://www.iconfinder.com/icons/44859/cube_icon))
- detect user in/activity to refresh data
- show given/thrown items with a different color/display, also they're no more in box/room
- re-implement item selection in metrics page: selection UI (checkboxes on list entries) was removed in the new design refactor; `PriceButtons` and `MetricCardMissingPriceList` remain dormant until selection is re-wired
- `AppItemList` card view uses CSS `columns` layout which presents items in column-first order; consider CSS Grid if accessibility testing reveals keyboard navigation confusion
- `AppRoutes` stashes React Router's `navigate` in a module-level variable (`navigation.utils.ts`); it is `undefined` until mount — any navigation triggered before that silently no-ops
- `state` object watches `status` and calls `navigate(...)` directly (`state.utils.ts`), coupling business logic to routing — changing `state.status` anywhere can trigger a page redirect as a side effect
- dual UI framework: MUI + Tailwind coexist with significant bundle weight and two different styling mental models
- `logger` bridges Item UI, Item Management, Forms, Search, Metrics, and Routing (betweenness 0.033) — suggests insufficient error boundaries or logging used as poor-man's observability
- `state` is the real architectural spine (betweenness 0.029), bridging every major module — single point of coupling, hard to test in isolation and fragile under concurrent updates
- `Item Management & CRUD` community has very low cohesion (0.05): Appwrite CRUD, item form lifecycle, location constants, and add/edit page logic are all mixed; split into focused modules

## Completed

- `state.items` persisted to localStorage (5MB limit) → migrated to IndexedDB via Dexie in v3.2.0 (2026-06-15)
