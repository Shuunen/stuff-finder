import { Router } from 'preact-router'
import { useState } from 'preact/hooks'
import { AppLoader } from './components/app-loader'
import { AppNavigation } from './components/app-navigation'
import { AppSpeedDial } from './components/app-speed-dial'
import { AppError } from './pages/app-error'
import { AppHome } from './pages/app-home'
import { AppItemAdd } from './pages/app-item-add'
import { AppItemDetails } from './pages/app-item-details'
import { AppSearch } from './pages/app-search'
import { AppSettings } from './pages/app-settings'
import { state, watchState } from './utils/state.utils'

export function App () {

  const [isLoading, setLoading] = useState(true)
  watchState('status', () => { setLoading(state.status === 'loading') })

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
    </>
  )
}
