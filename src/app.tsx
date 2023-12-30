import Router from 'preact-router'
import { useState } from 'preact/hooks'
import { AppLoader } from './components/app-loader'
import { AppNavigation } from './components/app-navigation'
import { AppSpeedDial } from './components/app-speed-dial'
import { AppError } from './pages/app-error'
import { AppHome } from './pages/app-home'
import { AppSearch } from './pages/app-search'
import { AppSettings } from './pages/app-settings'
import { logger } from './utils/logger.utils'
import { state, watchState } from './utils/state.utils'

export function App () {

  const [isLoading, setLoading] = useState(state.status === 'loading')
  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-react-fc
  setLoading(document.readyState === 'loading')
  watchState('status', () => {
    logger.debug('status changed', state.status)
    setLoading(state.status === 'loading')
  })

  return (
    <>
      <Router>
        <AppHome path="/" />
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
