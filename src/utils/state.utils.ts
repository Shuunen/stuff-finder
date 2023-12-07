import { createState } from 'shuutils'
import { emptyCredentials } from '../constants'
import type { Item } from '../types'
import { storage } from './storage.utils'

export const { state, watchState } = createState({
  credentials: emptyCredentials,
  items: [] as Item[], // eslint-disable-line @typescript-eslint/consistent-type-assertions
  theme: typeof window !== 'undefined' && /* c8 ignore next */ window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
}, storage)
