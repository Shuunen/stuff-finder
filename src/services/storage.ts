import { storage as store } from 'shuutils'

class AppStorage {
  key = '@shuunen/stuff-finder_'
  clear (key, media = localStorage) { return store.clear(this.key + key, media) }
  has (key, media = localStorage) { return store.has(this.key + key, media) }
  get<T> (key, media = localStorage): Promise<T> { return store.get(this.key + key, media) }
  set (key: string, data: any, media = localStorage) { return store.set(this.key + key, data, media) } // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const storage = new AppStorage()
