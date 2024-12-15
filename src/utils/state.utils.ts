import { createState } from 'shuutils'
import { defaultCommonLists, defaultCredentials, defaultDisplay, defaultItems } from '../constants'
import type { AppMessage } from '../types/messages.types'
import { defaultSound } from '../types/sounds.types'
import { defaultStatus } from '../types/status.types'
import { defaultTheme } from '../types/theme.types'
import { storage } from './storage.utils'

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

export type State = typeof state
