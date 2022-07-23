import { storage as store } from 'shuutils'

class AppStorage {
  key = '@shuunen/stuff-finder_'
  clear (key, media = localStorage): void { return store.clear(this.key + key, media) }
  has (key, media = localStorage): Promise<boolean> { return store.has(this.key + key, media) }
  get<T> (key, media = localStorage): Promise<T> { return store.get(this.key + key, media) }
  set (key: string, data: any, media = localStorage): Promise<string | Record<string, unknown> | unknown[]> { return store.set(this.key + key, data, media) } // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const storage = new AppStorage()
