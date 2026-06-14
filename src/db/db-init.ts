import { debounce } from 'shuutils'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'
import { db } from './db'

export async function syncItemsToDb(): Promise<void> {
  try {
    await db.transaction('rw', db.items, db.meta, async () => {
      await db.items.clear()
      if (state.items.length > 0) await db.items.bulkPut(state.items)
      await db.meta.put({ key: 'itemsTimestamp', value: state.itemsTimestamp })
    })
  } catch (error) {
    /* v8 ignore next */
    logger.error('syncItemsToDb failed', error)
  }
}

export async function syncSettingsToDb(): Promise<void> {
  try {
    await db.meta.bulkPut([
      { key: 'credentials', value: state.credentials },
      { key: 'display', value: state.display },
      { key: 'theme', value: state.theme },
    ])
  } catch (error) {
    /* v8 ignore next */
    logger.error('syncSettingsToDb failed', error)
  }
}

export async function loadFromDexie(): Promise<void> {
  try {
    const [items, credentialsMeta, displayMeta, itemsTimestampMeta, themeMeta] = await Promise.all([db.items.toArray(), db.meta.get('credentials'), db.meta.get('display'), db.meta.get('itemsTimestamp'), db.meta.get('theme')])
    if (items.length > 0) state.items = items
    if (credentialsMeta !== undefined) state.credentials = credentialsMeta.value as typeof state.credentials
    if (displayMeta !== undefined) state.display = displayMeta.value as typeof state.display
    if (typeof itemsTimestampMeta?.value === 'number') state.itemsTimestamp = itemsTimestampMeta.value
    if (themeMeta !== undefined) state.theme = themeMeta.value as typeof state.theme
  } catch (error) {
    /* v8 ignore next */
    logger.error('loadFromDexie failed', error)
  }
}

const debounceSyncMs = 300

/* v8 ignore start */
const debouncedItemsSync = debounce(() => {
  void syncItemsToDb()
}, debounceSyncMs)

const debouncedSettingsSync = debounce(() => {
  void syncSettingsToDb()
}, debounceSyncMs)

watchState('items', () => {
  void debouncedItemsSync()
})

watchState(['credentials', 'display', 'theme'], () => {
  void debouncedSettingsSync()
})
/* v8 ignore stop */
