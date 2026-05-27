import { migrateStorageKeys } from './storage.utils'

function makeMockStorage(initial: Record<string, string>): { data: Record<string, string>; storage: Storage } {
  const data = { ...initial }
  const storage = Object.assign(Object.create(null) as Record<string, string>, data, {
    getItem(key: string) {
      return data[key] ?? undefined
    },
    removeItem(key: string) {
      Reflect.deleteProperty(data, key)
      Reflect.deleteProperty(storage, key)
    },
    setItem(key: string, value: string) {
      data[key] = value
      storage[key] = value
    },
  }) as unknown as Storage
  return { data, storage }
}

describe('storage.utils', () => {
  it('migrateStorageKeys A migrates old-prefix keys to new prefix', () => {
    const { data, storage } = makeMockStorage({
      '@shuunen/stuff-finder_credentials': '{"bucketId":"abc"}',
      '@shuunen/stuff-finder_theme': 'dark',
      unrelated_key: 'untouched',
    })
    migrateStorageKeys(storage)
    expect(data['@shuunen/stuff-finder_credentials']).toBeUndefined()
    expect(data['@shuunen/stuff-finder_theme']).toBeUndefined()
    expect(data['stuff-finder_credentials']).toBe('{"bucketId":"abc"}')
    expect(data['stuff-finder_theme']).toBe('dark')
    expect(data.unrelated_key).toBe('untouched')
  })

  it('migrateStorageKeys B does nothing when no old-prefix keys exist', () => {
    const { data, storage } = makeMockStorage({ 'stuff-finder_theme': 'light' })
    migrateStorageKeys(storage)
    expect(Object.keys(data)).toHaveLength(1)
    expect(data['stuff-finder_theme']).toBe('light')
  })
})
