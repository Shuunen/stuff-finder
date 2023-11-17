import Router from 'preact-router'
import { AppSpeedDial } from './components/app-speed-dial'
import { AppError } from './pages/app-error'
import { AppHome } from './pages/app-home'
import { AppSearch } from './pages/app-search'
import { AppSettings } from './pages/app-settings'

export function App () {

  return (
    <>
      <Router>
        <AppHome path="/" />
        <AppSearch path="/search/:input" />
        <AppSettings path="/settings" />
        <AppError code="http-404" default />
      </Router>
      <AppSpeedDial />
    </>
  )
}
