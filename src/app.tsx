import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import { Router } from 'preact-router'
import { Suspense } from 'preact/compat'
import { useState } from 'preact/hooks'
import { AppLoader } from './components/app-loader'
import { AppSpeedDial } from './components/app-speed-dial'
import { PageError } from './pages/page-error'
import { PageHome } from './pages/page-home'
import { RouteItemAdd, RouteItemDetails, RouteItemEdit, RouteItemPrint, RouteScan, RouteSearch, RouteSettings } from './routes'
import { state, watchState } from './utils/state.utils'

export function App () {

  const [isLoading, setLoading] = useState(true)
  watchState('status', () => { setLoading(state.status === 'loading') })
  watchState('message', () => { if (state.message) enqueueSnackbar(state.message.content, { anchorOrigin: { horizontal: 'center', vertical: 'bottom' }, autoHideDuration: state.message.delay, preventDuplicate: true, variant: state.message.type }) }) // eslint-disable-line @typescript-eslint/naming-convention

  return (
    <>
      <Suspense fallback={<AppLoader isLoading />}>
        <Router>
          <PageHome path="/" />
          <RouteItemAdd path="/item/add" />
          <RouteItemDetails path="/item/details/:id/:context?" />
          <RouteItemEdit path="/item/edit/:id" />
          <RouteItemPrint path="/item/print/:id" />
          <RouteScan path="/scan" />
          <RouteSearch path="/search/:input" />
          <RouteSettings path="/settings" />
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
