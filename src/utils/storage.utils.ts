import { storage } from 'shuutils'

const oldPrefix = '@shuunen/stuff-finder_'
const newPrefix = 'stuff-finder_'

export function migrateStorageKeys(store: Storage = localStorage) {
  for (const key of Object.keys(store)) {
    if (!key.startsWith(oldPrefix)) continue
    const newKey = newPrefix + key.slice(oldPrefix.length)
    // v8 ignore next -- getItem returns null only if key absent, but we just found this key in Object.keys
    const value = store.getItem(key) ?? ''
    store.setItem(newKey, value)
    store.removeItem(key)
  }
}

migrateStorageKeys()
storage.prefix = newPrefix

export { storage }
