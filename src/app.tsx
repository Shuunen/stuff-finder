import { ThemeProvider } from '@mui/material/styles'
import { lazy, Suspense, useMemo } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppLoader } from './components/app-loader'
import { AppRoutes } from './components/app-routes'
import { theme } from './utils/theme.utils'

const AsyncAppSpeedDial = lazy(async () => {
  const { AppSpeedDial } = await import('./components/app-speed-dial')
  return { default: AppSpeedDial }
})

const AsyncPageSounds = lazy(async () => {
  const { AppSounds } = await import('./components/app-sounds')
  return { default: AppSounds }
})

export function App() {
  const fallback = useMemo(() => <AppLoader isLoading />, [])
  return (
    <ThemeProvider theme={theme}>
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
