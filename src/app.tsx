import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import { Router } from 'preact-router'
import { Suspense, lazy } from 'preact/compat'
import { useState } from 'preact/hooks'
import { AppLoader } from './components/app-loader'
import { AppSpeedDial } from './components/app-speed-dial'
import { PageError } from './pages/page-error'
import { PageHome } from './pages/page-home'
import { state, watchState } from './utils/state.utils'

type Component = typeof PageHome

/* eslint-disable @typescript-eslint/promise-function-async, @typescript-eslint/naming-convention, promise/prefer-await-to-then */
const AsyncPageScan = lazy<Component>(() => import('./pages/page-scan').then(({ PageScan }) => ({ default: PageScan })))
const AsyncPageItemAdd = lazy<Component>(() => import('./pages/page-item-add').then(({ PageItemAdd }) => ({ default: PageItemAdd })))
const AsyncPageItemDetails = lazy<Component>(() => import('./pages/page-item-details').then(({ PageItemDetails }) => ({ default: PageItemDetails })))
const AsyncPageItemEdit = lazy<Component>(() => import('./pages/page-item-edit').then(({ PageItemEdit }) => ({ default: PageItemEdit })))
const AsyncPageItemPrint = lazy<Component>(() => import('./pages/page-item-print').then(({ PageItemPrint }) => ({ default: PageItemPrint })))
const AsyncPageSearch = lazy<Component>(() => import('./pages/page-search').then(({ PageSearch }) => ({ default: PageSearch })))
const AsyncPageSettings = lazy<Component>(() => import('./pages/page-settings').then(({ PageSettings }) => ({ default: PageSettings })))
const AsyncPageSequencer = lazy<Component>(() => import('./pages/page-sequencer').then(({ PageSequencer }) => ({ default: PageSequencer })))
/* eslint-enable @typescript-eslint/promise-function-async, @typescript-eslint/naming-convention, promise/prefer-await-to-then */

export function App () {

  const [isLoading, setLoading] = useState(true)
  watchState('status', () => { setLoading(state.status === 'loading') })
  watchState('message', () => { if (state.message) enqueueSnackbar(state.message.content, { anchorOrigin: { horizontal: 'center', vertical: 'bottom' }, autoHideDuration: state.message.delay, preventDuplicate: true, variant: state.message.type }) }) // eslint-disable-line @typescript-eslint/naming-convention

  return (
    <>
      <Suspense fallback={<AppLoader isLoading />}>
        <Router>
          <PageHome path="/" />
          <AsyncPageItemAdd path="/item/add" />
          <AsyncPageItemDetails path="/item/details/:id/:context?" />
          <AsyncPageItemEdit path="/item/edit/:id" />
          <AsyncPageItemPrint path="/item/print/:id" />
          <AsyncPageScan path="/scan" />
          <AsyncPageSearch path="/search/:input" />
          <AsyncPageSettings path="/settings" />
          <AsyncPageSequencer path="/sequencer" />
          <PageError code="page-not-found" default />
        </Router>
      </Suspense>
      <AppSpeedDial />
      <AppLoader isLoading={isLoading} />
      {/* @ts-expect-error typings issue */}
      <SnackbarProvider />
    </>
  )
}
