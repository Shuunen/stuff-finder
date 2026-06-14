import 'fake-indexeddb/auto'
import { mockItem, mockState } from '../utils/mock.utils'
import { db } from './db'
import { migrateFromLocalStorage } from './db-migrate'

const lsPrefix = 'stuff-finder_'

function setLegacy(key: string, value: unknown): void {
  globalThis.localStorage.setItem(lsPrefix + key, JSON.stringify(value))
}

describe('db-migrate', () => {
  beforeEach(async () => {
    await db.items.clear()
    await db.meta.clear()
    globalThis.localStorage.clear()
  })

  it('A skips migration when no legacy data exists', async () => {
    await migrateFromLocalStorage()
    await expect(db.items.count()).resolves.toBe(0)
    await expect(db.meta.count()).resolves.toBe(0)
  })

  it('B migrates items and itemsTimestamp from localStorage', async () => {
    const item = mockItem()
    setLegacy('items', [item])
    setLegacy('itemsTimestamp', 99_999)
    await migrateFromLocalStorage()
    const stored = await db.items.toArray()
    expect(stored).toHaveLength(1)
    expect(stored[0]?.$id).toBe(item.$id)
    const tsMeta = await db.meta.get('itemsTimestamp')
    expect(tsMeta?.value).toBe(99_999)
  })

  it('C migrates credentials, display and theme from localStorage', async () => {
    const { credentials, display, theme } = mockState()
    setLegacy('credentials', credentials)
    setLegacy('display', display)
    setLegacy('theme', theme)
    await migrateFromLocalStorage()
    const credMeta = await db.meta.get('credentials')
    const displayMeta = await db.meta.get('display')
    const themeMeta = await db.meta.get('theme')
    expect(credMeta?.value).toStrictEqual(credentials)
    expect(displayMeta?.value).toBe(display)
    expect(themeMeta?.value).toBe(theme)
  })

  it('D clears legacy localStorage keys after migration', async () => {
    setLegacy('items', [])
    setLegacy('credentials', {})
    await migrateFromLocalStorage()
    expect(globalThis.localStorage.getItem(`${lsPrefix}items`)).toBeNull()
    expect(globalThis.localStorage.getItem(`${lsPrefix}credentials`)).toBeNull()
  })

  it('E handles invalid items JSON gracefully and still migrates settings', async () => {
    globalThis.localStorage.setItem(`${lsPrefix}items`, 'not-valid-json{')
    setLegacy('theme', 'dark')
    await migrateFromLocalStorage()
    await expect(db.items.count()).resolves.toBe(0)
    const themeMeta = await db.meta.get('theme')
    expect(themeMeta?.value).toBe('dark')
  })

  it('F defaults itemsTimestamp to 0 when missing from localStorage', async () => {
    setLegacy('items', [mockItem()])
    await migrateFromLocalStorage()
    const tsMeta = await db.meta.get('itemsTimestamp')
    expect(tsMeta?.value).toBe(0)
  })

  it('G skips migration on second run after keys are cleared', async () => {
    setLegacy('items', [mockItem()])
    await migrateFromLocalStorage()
    await db.items.clear()
    await migrateFromLocalStorage()
    await expect(db.items.count()).resolves.toBe(0)
  })

  it('H gracefully skips migration when localStorage is inaccessible', async () => {
    vi.spyOn(globalThis.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: The operation is insecure.')
    })
    await expect(migrateFromLocalStorage()).resolves.toBeUndefined()
    await expect(db.items.count()).resolves.toBe(0)
    vi.restoreAllMocks()
  })
})
