# TODOs

## 1. Imperative navigation stored in a global variable

`AppRoutes` calls `setNavigate(navigate)` on mount to stash React Router's `navigate` function in a module-level variable (`navigation.utils.ts`). The navigate function is `undefined` until the component mounts — any navigation triggered before that silently no-ops.

## 2. State mutation triggering navigation side effects

The global `state` object watches `status` and calls `navigate('/settings')` or `navigate('/')` directly (`state.utils.ts`). This couples business logic to routing in a non-obvious way — changing `state.status` anywhere in the app can trigger a page redirect as a side effect.

## 3. Storage migration runs at module import time

`migrateStorageKeys()` is called at the top level of `storage.utils.ts`, meaning it runs unconditionally on every page load the moment anything imports storage. Side-effect-on-import makes the module hard to test and the migration timing implicit.

## 4. Dual UI framework: MUI + Tailwind

The project uses both `@mui/material` (with Emotion) and Tailwind CSS — significant bundle weight and two different styling mental models coexisting.

## 5. Full item list persisted to localStorage

`state.items` (potentially a large array) is persisted to localStorage with a timestamp. The full item list is serialized/deserialized on every load, which will hit localStorage's ~5MB limit for large catalogs.

## 6. `logger` is a cross-community bridge across 6 modules

`logger` has the second-highest betweenness centrality in the graph (0.033), bridging Item UI, Item Management, Forms, Search, Metrics, and Routing. A utility that cuts across every domain suggests either insufficient error boundaries or that logging is being used as a poor-man's observability layer.

## 7. `State` is the real architectural spine — is it doing too much?

The global `state` object bridges the same 6 communities as `logger` (betweenness 0.029). Every major module reads or watches it. Combined with TODO #2 (state mutation triggering navigation), this is a single point of coupling for the entire app — hard to test in isolation and fragile under concurrent updates.

## 8. `Item Management & CRUD` community has very low cohesion (0.05)

The graph clusters 86 nodes into one community with a cohesion score of 0.05, indicating a grab-bag of loosely related responsibilities: Appwrite CRUD, item form lifecycle, box/room/drawer constants, and add/edit page logic. Splitting into focused modules (remote API layer, local form state, location constants) would reduce cross-cutting dependencies.
