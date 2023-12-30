import { createState } from 'shuutils'
import { emptyCredentials } from '../constants'
import type { AppStatus, Item } from '../types'
import { storage } from './storage.utils'

export const { state, watchState } = createState(
  {
    credentials: emptyCredentials,
    items: [] as Item[], // eslint-disable-line @typescript-eslint/consistent-type-assertions
    status: storage.get<AppStatus>('status', 'loading'),
    theme: typeof window !== 'undefined' && /* c8 ignore next */ window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  },
  storage,
  ['credentials', 'items', 'theme'], // avoid status persistence
)
