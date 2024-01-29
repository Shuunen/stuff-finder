import { createState } from 'shuutils'
import { defaultCommonLists, defaultCredentials, defaultItems } from '../constants'
import type { AppMessage } from '../types/messages.types'
import { defaultStatus } from '../types/status.types'
import { defaultTheme } from '../types/theme.types'
import { storage } from './storage.utils'

export const { state, watchState } = createState(
  {
    credentials: defaultCredentials,
    items: defaultItems,
    lists: defaultCommonLists,
    message: undefined as AppMessage | undefined, // eslint-disable-line @typescript-eslint/consistent-type-assertions
    status: defaultStatus,
    theme: defaultTheme,
  },
  storage,
  ['credentials', 'items', 'lists', 'theme'], // avoid status persistence
)
