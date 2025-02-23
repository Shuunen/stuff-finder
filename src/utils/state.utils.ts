import { route } from 'preact-router'
import { createState, debounce, isBrowserEnvironment, isTestEnvironment } from 'shuutils'
import { defaultCommonLists, defaultCredentials } from '../constants'
import type { Item } from '../types/item.types'
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    items: [] as Item[],
    /** timestamp of the last time items were fetched, in milliseconds */
    itemsTimestamp: 0,
    lists: defaultCommonLists,
    sound: defaultSound,
    status: defaultStatus,
    /** the display theme of the item list : card or list */
    theme: defaultTheme,
  },
  storage,
  ['credentials', 'display', 'items', 'itemsTimestamp', 'lists', 'theme'], // avoid status persistence
)

const statusDelay = 300

const onStatusChange = debounce(onStatusChangeSync, statusDelay)

watchState('status', () => { void onStatusChange(state.status) })

export type State = typeof state
