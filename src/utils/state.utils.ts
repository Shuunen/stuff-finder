import { route } from 'preact-router'
import { createState, debounce, isBrowserEnvironment, toastError, toastSuccess } from 'shuutils'
import { defaultCommonLists, defaultCredentials, defaultItems } from '../constants'
import type { AppMessage } from '../types/messages.types'
import { defaultSound } from '../types/sounds.types'
import { type AppStatus, defaultStatus } from '../types/status.types'
import { type Display, defaultTheme } from '../types/theme.types'
import { storage } from './storage.utils'

/**
 * Handle the status change
 * @param status the new status
 */
function onStatusChangeSync (status: AppStatus) {
  if (status === 'settings-required') route('/settings')
  if (status === 'ready' && document.location.pathname.includes('/settings')) route('/')
}

/**
 * Handle a message
 * @param message the message
 */
function onMessage (message: AppMessage) {
  if (['error', 'warning'].includes(message.type)) toastError(message.content, message.delay)
  else toastSuccess(message.content, message.delay)
}

const laptopWidth = 1500

const defaultDisplay: Display = (isBrowserEnvironment() && globalThis.screen.width < laptopWidth) ? 'list' : 'card'

export const { state, watchState } = createState(
  {
    credentials: defaultCredentials,
    display: defaultDisplay,
    items: defaultItems,
    lists: defaultCommonLists,
    message: undefined as AppMessage | undefined, // eslint-disable-line @typescript-eslint/consistent-type-assertions
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

watchState('message', () => { if (state.message) onMessage(state.message) })

export type State = typeof state
