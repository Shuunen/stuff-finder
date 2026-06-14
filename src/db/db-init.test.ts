import 'fake-indexeddb/auto'
import { mockItem, mockState } from '../utils/mock.utils'
import { state } from '../utils/state.utils'
import { db } from './db'
import { loadFromDexie, syncItemsToDb, syncSettingsToDb } from './db-init'

describe('db-init', () => {
  beforeEach(async () => {
    await db.items.clear()
    await db.meta.clear()
    const defaults = mockState()
    state.credentials = defaults.credentials
    state.display = defaults.display
    state.items = []
    state.itemsTimestamp = 0
    state.theme = defaults.theme
  })

  describe('loadFromDexie', () => {
    it('A returns early with defaults when database is empty', async () => {
      await loadFromDexie()
      expect(state.items).toHaveLength(0)
      expect(state.itemsTimestamp).toBe(0)
    })

    it('B loads items and timestamp', async () => {
      const item = mockItem()
      await db.items.put(item)
      await db.meta.put({ key: 'itemsTimestamp', value: 1_234_567_890 })
      await loadFromDexie()
      expect(state.items).toHaveLength(1)
      expect(state.itemsTimestamp).toBe(1_234_567_890)
    })

    it('C defaults timestamp to 0 when meta record is absent', async () => {
      await db.items.put(mockItem())
      await loadFromDexie()
      expect(state.items).toHaveLength(1)
      expect(state.itemsTimestamp).toBe(0)
    })

    it('D loads credentials, display and theme', async () => {
      const { credentials, display, theme } = mockState()
      await db.meta.bulkPut([
        { key: 'credentials', value: credentials },
        { key: 'display', value: display },
        { key: 'theme', value: theme },
      ])
      state.credentials = { bucketId: '', collectionId: '', databaseId: '', wrap: '' }
      state.display = 'card'
      state.theme = 'light'
      await loadFromDexie()
      expect(state.credentials).toStrictEqual(credentials)
      expect(state.display).toBe(display)
      expect(state.theme).toBe(theme)
    })
  })

  describe('syncItemsToDb', () => {
    it('A writes items and timestamp', async () => {
      const item = mockItem()
      state.items = [item]
      state.itemsTimestamp = 42
      await syncItemsToDb()
      const stored = await db.items.toArray()
      expect(stored).toHaveLength(1)
      expect(stored[0]?.$id).toBe(item.$id)
      const meta = await db.meta.get('itemsTimestamp')
      expect(meta?.value).toBe(42)
    })

    it('B clears previous items before writing', async () => {
      await db.items.put(mockItem({ $id: 'old-item' }))
      state.items = [mockItem({ $id: 'fresh-item' })]
      await syncItemsToDb()
      const stored = await db.items.toArray()
      expect(stored).toHaveLength(1)
      expect(stored[0]?.$id).toBe('fresh-item')
    })

    it('C stores only timestamp when items are empty', async () => {
      state.items = []
      state.itemsTimestamp = 99
      await syncItemsToDb()
      const emptyStored = await db.items.toArray()
      expect(emptyStored).toHaveLength(0)
      const timestampMeta = await db.meta.get('itemsTimestamp')
      expect(timestampMeta?.value).toBe(99)
    })
  })

  describe('syncSettingsToDb', () => {
    it('A writes credentials, display and theme to meta', async () => {
      const { credentials, display, theme } = mockState()
      state.credentials = credentials
      state.display = display
      state.theme = theme
      await syncSettingsToDb()
      const credentialsMeta = await db.meta.get('credentials')
      const displayMeta = await db.meta.get('display')
      const themeMeta = await db.meta.get('theme')
      expect(credentialsMeta?.value).toStrictEqual(credentials)
      expect(displayMeta?.value).toBe(display)
      expect(themeMeta?.value).toBe(theme)
    })
  })
})
