import { ThemeProvider } from '@mui/material/styles'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppLoader } from './components/app-loader'
import { AppOfflineWarning } from './components/app-offline-warning'
import { AppRoutes } from './components/app-routes'
import { setupPwa } from './pwa'
import { theme } from './utils/theme.utils'

const AsyncAppSpeedDial = lazy(async () => {
  const { AppSpeedDial } = await import('./components/app-speed-dial')
  return { default: AppSpeedDial }
})

const AsyncPageSounds = lazy(async () => {
  const { AppSounds } = await import('./components/app-sounds')
  return { default: AppSounds }
})

function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(() => !globalThis.navigator.onLine)
  useEffect(() => {
    const markOffline = () => setIsOffline(true)
    const markOnline = () => setIsOffline(false)
    globalThis.addEventListener('offline', markOffline)
    globalThis.addEventListener('online', markOnline)
    return () => {
      globalThis.removeEventListener('offline', markOffline)
      globalThis.removeEventListener('online', markOnline)
    }
  }, [])
  return isOffline
}

export function App() {
  const isOffline = useOfflineStatus()
  const fallback = useMemo(() => <AppLoader isLoading />, [])
  useEffect(setupPwa, [])
  return (
    <ThemeProvider theme={theme}>
      <AppOfflineWarning isOffline={isOffline} />
      <Suspense fallback={fallback}>
        <BrowserRouter>
          <AppRoutes />
          <AsyncPageSounds />
          <AsyncAppSpeedDial />
        </BrowserRouter>
      </Suspense>
    </ThemeProvider>
  )
}
