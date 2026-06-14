import Dexie, { type Table } from 'dexie'
import type { Item } from '../types/item.types'

type MetaRecord = {
  key: string
  value: unknown
}

class StuffFinderDb extends Dexie {
  public items!: Table<Item, string>
  public meta!: Table<MetaRecord, string>

  public constructor() {
    super('stuff-finder')
    this.version(1).stores({
      items: '$id',
      meta: 'key',
    })
  }
}

export const db = new StuffFinderDb()
