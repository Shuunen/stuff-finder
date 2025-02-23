import { route } from 'preact-router'
import { createState, debounce, isBrowserEnvironment, isTestEnvironment, toastError, toastInfo, toastSuccess } from 'shuutils'
import { defaultCommonLists, defaultCredentials, defaultItems } from '../constants'
import type { AppMessage } from '../types/messages.types'
import { defaultSound } from '../types/sounds.types'
import { type AppStatus, defaultStatus } from '../types/status.types'
import { type Display, defaultTheme } from '../types/theme.types'
import { storage } from './storage.utils'

/* c8 ignore start */

/**
 * Handle the status change
 * @param status the new status
 */
function onStatusChangeSync (status: AppStatus) {
  if (isTestEnvironment()) return
  if (status === 'settings-required') route('/settings')
  if (status === 'ready' && document.location.pathname.includes('/settings')) route('/')
}

const laptopWidth = 1500

const defaultDisplay: Display = (isBrowserEnvironment() && globalThis.screen.width < laptopWidth) ? 'list' : 'card'

/* c8 ignore stop */

export const { state, watchState } = createState(
  {
    credentials: defaultCredentials,
    display: defaultDisplay,
    items: defaultItems,
    lists: defaultCommonLists,
    sound: defaultSound,
    status: defaultStatus,
    theme: defaultTheme,
  },
  storage,
  ['credentials', 'display', 'items', 'lists', 'theme'], // avoid status persistence
)

const statusDelay = 300

const onStatusChange = debounce(onStatusChangeSync, statusDelay)

watchState('status', () => { void onStatusChange(state.status) })

export type State = typeof state
