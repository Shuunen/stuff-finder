import { createState } from 'shuutils'
import { defaultCommonLists, defaultCredentials } from '../constants'
import { defaultItems } from '../types/item.types'
import { defaultStatus } from '../types/status.types'
import { defaultTheme } from '../types/theme.types'
import { storage } from './storage.utils'

export const { state, watchState } = createState(
  {
    credentials: defaultCredentials,
    items: defaultItems,
    lists: defaultCommonLists,
    status: defaultStatus,
    theme: defaultTheme,
  },
  storage,
  ['credentials', 'items', 'lists', 'theme'], // avoid status persistence
)
