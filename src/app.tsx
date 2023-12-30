import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import { Router } from 'preact-router'
import { useState } from 'preact/hooks'
import { AppLoader } from './components/app-loader'
import { AppNavigation } from './components/app-navigation'
import { AppSpeedDial } from './components/app-speed-dial'
import { AppError } from './pages/page-error'
import { AppHome } from './pages/page-home'
import { AppItemAdd } from './pages/page-item-add'
import { AppItemDetails } from './pages/page-item-details'
import { AppSearch } from './pages/page-search'
import { AppSettings } from './pages/page-settings'
import { state, watchState } from './utils/state.utils'

export function App () {

  const [isLoading, setLoading] = useState(true)
  watchState('status', () => { setLoading(state.status === 'loading') })
  watchState('message', () => { if (state.message) enqueueSnackbar(state.message.content, { anchorOrigin: { horizontal: 'center', vertical: 'bottom' }, autoHideDuration: state.message.delay, variant: state.message.type }) })

  return (
    <>
      <Router>
        <AppHome path="/" />
        <AppItemAdd path="/item/add" />
        <AppItemDetails path="/item/:id" />
        <AppSearch path="/search/:input" />
        <AppSettings path="/settings" />
        <AppError code="http-404" default />
      </Router>
      <AppSpeedDial />
      <AppLoader isLoading={isLoading} />
      <AppNavigation />
      {/* @ts-expect-error typings issue */}
      <SnackbarProvider />
    </>
  )
}
