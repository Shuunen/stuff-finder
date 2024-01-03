import { lazy } from 'preact/compat'
import type { PageHome } from './pages/page-home'

type Component = typeof PageHome

/* eslint-disable @typescript-eslint/promise-function-async, @typescript-eslint/naming-convention, promise/prefer-await-to-then */
export const RouteScan = lazy<Component>(() => import('./pages/page-scan').then(({ PageScan }) => ({ default: PageScan })))
export const RouteItemAdd = lazy<Component>(() => import('./pages/page-item-add').then(({ PageItemAdd }) => ({ default: PageItemAdd })))
export const RouteItemDetails = lazy<Component>(() => import('./pages/page-item-details').then(({ PageItemDetails }) => ({ default: PageItemDetails })))
export const RouteItemEdit = lazy<Component>(() => import('./pages/page-item-edit').then(({ PageItemEdit }) => ({ default: PageItemEdit })))
export const RouteItemPrint = lazy<Component>(() => import('./pages/page-item-print').then(({ PageItemPrint }) => ({ default: PageItemPrint })))
export const RouteSearch = lazy<Component>(() => import('./pages/page-search').then(({ PageSearch }) => ({ default: PageSearch })))
export const RouteSettings = lazy<Component>(() => import('./pages/page-settings').then(({ PageSettings }) => ({ default: PageSettings })))
/* eslint-enable @typescript-eslint/promise-function-async, @typescript-eslint/naming-convention, promise/prefer-await-to-then */
