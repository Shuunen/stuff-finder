import { createState, debounce, isBrowserEnvironment, isTestEnvironment } from 'shuutils'
import { defaultCredentials } from '../constants'
import type { Item } from '../types/item.types'
import { defaultSound } from '../types/sounds.types'
import { type AppStatus, defaultStatus } from '../types/status.types'
import { type Display, defaultTheme } from '../types/theme.types'
import { navigate } from './navigation.utils'

/* v8 ignore start */

/**
 * Handle the status change
 * @param status the new status
 */
function onStatusChangeSync(status: AppStatus) {
  if (isTestEnvironment()) return
  if (status === 'settings-required') navigate('/settings')
  if (status === 'ready' && document.location.pathname.includes('/settings')) navigate('/')
}

const laptopWidth = 1500

const defaultDisplay: Display = isBrowserEnvironment() && globalThis.screen.width < laptopWidth ? 'list' : 'card'

/* v8 ignore stop */

export const { state, watchState } = createState({
  credentials: defaultCredentials,
  display: defaultDisplay,
  items: [] as Item[],
  /** timestamp of the last time items were fetched, in milliseconds */
  itemsTimestamp: 0,
  sound: defaultSound,
  status: defaultStatus,
  /** the display theme of the item list : card or list */
  theme: defaultTheme,
})

const statusDelay = 300

const onStatusChange = debounce(onStatusChangeSync, statusDelay)

watchState('status', () => {
  onStatusChange(state.status)
})

export type State = typeof state
