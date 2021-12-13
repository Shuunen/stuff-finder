import { storage as store } from 'shuutils'

class AppStorage {
  key = '@shuunen/stuff-finder_'
  clear (key) { return store.clear(this.key + key) }
  has (key) { return store.has(this.key + key) }
  get<T> (key): Promise<T> { return store.get(this.key + key) }
  set (key: string, data: any) { return store.set(this.key + key, data) } // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const storage = new AppStorage()
