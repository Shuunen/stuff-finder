import { Router } from 'preact-router'
import { Suspense, lazy } from 'preact/compat'
import { useMemo } from 'preact/hooks'
import { AppLoader } from './components/app-loader'
import type { PageHome } from './pages/page-home'

type Component = typeof PageHome

// oxlint-disable promise/prefer-await-to-then
const AsyncPageHome = lazy<Component>(() => import('./pages/page-home').then(({ PageHome }) => ({ default: PageHome })))
const AsyncPageError = lazy<Component>(() => import('./pages/page-error').then(({ PageError }) => ({ default: PageError })))
const AsyncPageScan = lazy<Component>(() => import('./pages/page-scan').then(({ PageScan }) => ({ default: PageScan })))
const AsyncPageItemAddEdit = lazy<Component>(() => import('./pages/page-item-add-edit').then(({ PageItemAddEdit }) => ({ default: PageItemAddEdit })))
const AsyncPageItemDetails = lazy<Component>(() => import('./pages/page-item-details').then(({ PageItemDetails }) => ({ default: PageItemDetails })))
const AsyncPageItemPrint = lazy<Component>(() => import('./pages/page-item-print').then(({ PageItemPrint }) => ({ default: PageItemPrint })))
const AsyncPageSearch = lazy<Component>(() => import('./pages/page-search').then(({ PageSearch }) => ({ default: PageSearch })))
const AsyncPageSettings = lazy<Component>(() => import('./pages/page-settings').then(({ PageSettings }) => ({ default: PageSettings })))
const AsyncPageKitchenSink = lazy<Component>(() => import('./pages/page-kitchen-sink').then(({ PageKitchenSink }) => ({ default: PageKitchenSink })))
const AsyncAppSpeedDial = lazy<Component>(() => import('./components/app-speed-dial').then(({ AppSpeedDial }) => ({ default: AppSpeedDial })))
const AsyncPageSounds = lazy<Component>(() => import('./components/app-sounds').then(({ AppSounds }) => ({ default: AppSounds })))
// oxlint-enable promise/prefer-await-to-then

export function App() {
  const fallback = useMemo(() => <AppLoader isLoading />, [])
  return (
    <Suspense fallback={fallback}>
      <Router>
        <AsyncPageHome path="/" />
        <AsyncPageItemAddEdit path="/item/add/:id?" />
        <AsyncPageItemAddEdit isEdit path="/item/edit/:id" />
        <AsyncPageItemDetails path="/item/details/:id/:context?" />
        <AsyncPageItemPrint path="/item/print/:id" />
        <AsyncPageScan path="/scan" />
        <AsyncPageSearch path="/search/:input" />
        <AsyncPageSettings path="/settings" />
        <AsyncPageKitchenSink path="/kitchen-sink" />
        <AppLoader isLoading path="/loading" />
        <AsyncPageError code="page-not-found" default />
      </Router>
      <AsyncPageSounds />
      <AsyncAppSpeedDial />
    </Suspense>
  )
}
