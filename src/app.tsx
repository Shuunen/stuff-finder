import { useSignalEffect } from '@preact/signals'
import { SnackbarProvider, closeSnackbar, enqueueSnackbar } from 'notistack'
import { Router, route } from 'preact-router'
import { Suspense, lazy } from 'preact/compat'
import { useCallback, useMemo, useState } from 'preact/hooks'
import { debounce, on } from 'shuutils'
import { AppLoader } from './components/app-loader'
import { AppSounds } from './components/app-sounds'
import { AppSpeedDial } from './components/app-speed-dial'
import { delays } from './constants'
import { PageError } from './pages/page-error'
import { PageHome } from './pages/page-home'
import type { AppMessage } from './types/messages.types'
import type { AppStatus } from './types/status.types'
import { clearElementsForPrint } from './utils/browser.utils'
import { logger } from './utils/logger.utils'
import { state, watchState } from './utils/state.utils'

type Component = typeof PageHome

/* eslint-disable @typescript-eslint/promise-function-async, @typescript-eslint/naming-convention */
const AsyncPageScan = lazy<Component>(() => import('./pages/page-scan').then(({ PageScan }) => ({ default: PageScan })))
const AsyncPageItemAddEdit = lazy<Component>(() => import('./pages/page-item-add-edit').then(({ PageItemAddEdit }) => ({ default: PageItemAddEdit })))
const AsyncPageItemDetails = lazy<Component>(() => import('./pages/page-item-details').then(({ PageItemDetails }) => ({ default: PageItemDetails })))
const AsyncPageItemPrint = lazy<Component>(() => import('./pages/page-item-print').then(({ PageItemPrint }) => ({ default: PageItemPrint })))
const AsyncPageSearch = lazy<Component>(() => import('./pages/page-search').then(({ PageSearch }) => ({ default: PageSearch })))
const AsyncPageSettings = lazy<Component>(() => import('./pages/page-settings').then(({ PageSettings }) => ({ default: PageSettings })))
const AsyncPageKitchenSink = lazy<Component>(() => import('./pages/page-kitchen-sink').then(({ PageKitchenSink }) => ({ default: PageKitchenSink })))
/* eslint-enable @typescript-eslint/promise-function-async, @typescript-eslint/naming-convention */


function onMessage (message: Readonly<AppMessage>) {
  enqueueSnackbar(message.content, {
    anchorOrigin: { horizontal: 'center', vertical: 'bottom' },
    autoHideDuration: message.delay,
    preventDuplicate: true, // eslint-disable-line @typescript-eslint/naming-convention
    variant: message.type,
  })
}

function onClick (element: HTMLElement | null) {
  const div = element?.closest('div')
  if (!div) return
  const identifier = `${div.id}-${div.className}`
  if (!identifier.includes('notistack')) return
  logger.info('click on notistack element, close every notification', { identifier })
  closeSnackbar()
}

export function App () {

  const [isLoading, setLoading] = useState(true)
  const [isSettingsRequired, setSettingsRequired] = useState(state.status === 'settings-required')

  clearElementsForPrint()

  function onStatusChangeSync (status: AppStatus) {
    logger.info(`status is now : ${status}`)
    setLoading(status === 'loading')
    setSettingsRequired(status === 'settings-required')
    if (status === 'settings-required') route('/settings')
    if (status === 'ready' && document.location.pathname.includes('/settings')) route('/')
  }

  const onStatusChange = debounce(onStatusChangeSync, delays.large)

  useSignalEffect(useCallback(() => {
    watchState('status', () => { void onStatusChange(state.status) })
    watchState('message', () => { if (state.message) onMessage(state.message) })
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
    on<MouseEvent>('click', (event) => { onClick(event.target as HTMLElement | null) })
  }, [onStatusChange]))

  void onStatusChange(state.status)

  const fallback = useMemo(() => <AppLoader isLoading />, [])
  return (
    <>
      <Suspense fallback={fallback}>
        <Router>
          <PageHome path="/" />
          <AsyncPageItemAddEdit path="/item/add/:id?" />
          <AsyncPageItemAddEdit isEdit path="/item/edit/:id" />
          <AsyncPageItemDetails path="/item/details/:id/:context?" />
          <AsyncPageItemPrint path="/item/print/:id" />
          <AsyncPageScan path="/scan" />
          <AsyncPageSearch path="/search/:input" />
          <AsyncPageSettings path="/settings" />
          <AsyncPageKitchenSink path="/kitchen-sink" />
          <AppLoader isLoading={true} path="/loading" />
          <PageError code="page-not-found" default />
        </Router>
      </Suspense>
      <AppSounds />
      <AppSpeedDial isLoading={isLoading} isSettingsRequired={isSettingsRequired} />
      <SnackbarProvider maxSnack={2} />
    </>
  )
}
