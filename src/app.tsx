import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import { Router } from 'preact-router'
import { useState } from 'preact/hooks'
import { AppLoader } from './components/app-loader'
import { AppSpeedDial } from './components/app-speed-dial'
import { PageError } from './pages/page-error'
import { PageHome } from './pages/page-home'
import { PageItemAdd } from './pages/page-item-add'
import { PageItemDetails } from './pages/page-item-details'
import { PageItemEdit } from './pages/page-item-edit'
import { PageScan } from './pages/page-scan'
import { PageSearch } from './pages/page-search'
import { PageSettings } from './pages/page-settings'
import { state, watchState } from './utils/state.utils'

export function App () {

  const [isLoading, setLoading] = useState(true)
  watchState('status', () => { setLoading(state.status === 'loading') })
  watchState('message', () => { if (state.message) enqueueSnackbar(state.message.content, { anchorOrigin: { horizontal: 'center', vertical: 'bottom' }, autoHideDuration: state.message.delay, preventDuplicate: true, variant: state.message.type }) }) // eslint-disable-line @typescript-eslint/naming-convention

  return (
    <>
      <Router>
        <PageHome path="/" />
        <PageItemAdd path="/item/add" />
        <PageItemDetails path="/item/details/:id/:context?" />
        <PageItemEdit path="/item/edit/:id" />
        <PageScan path="/scan" />
        <PageSearch path="/search/:input" />
        <PageSettings path="/settings" />
        <PageError code="page-not-found" default />
      </Router>
      <AppSpeedDial />
      <AppLoader isLoading={isLoading} />
      {/* @ts-expect-error typings issue */}
      <SnackbarProvider />
    </>
  )
}
