import Fuse, { type IFuseOptions } from 'fuse.js'
import { sanitize } from 'shuutils'
import { ItemField, ItemStatus, type Item, type ItemPhoto } from './types/item.types'
import type { AppCredentials } from './types/settings.types'

interface CommonLists {
  boxes: string[]
  categories: string[]
  drawers: string[]
  locations: string[]
  statuses: string[]
}

export const defaultImage = '/assets/no-visual.svg'

export const defaultCommonLists: CommonLists = {
  boxes: [],
  categories: [],
  drawers: ['', '1', '2', '3', '4', '5', '6', '7'],
  locations: [],
  statuses: [
    ItemStatus.Acheté,
    ItemStatus.ADonner,
    ItemStatus.AVendre,
    ItemStatus.Donné,
    ItemStatus.Jeté,
    ItemStatus.Renvoyé,
    ItemStatus.Vendu,
  ],
}

export const defaultCredentials: AppCredentials = {
  base: '',
  table: '',
  token: '',
  view: '',
  wrap: '',
} satisfies AppCredentials

export const emptyItem: Item = {
  [ItemField.Barcode]: '',
  [ItemField.Box]: '',
  [ItemField.Brand]: '',
  [ItemField.Category]: '',
  [ItemField.Details]: '',
  [ItemField.Drawer]: '',
  [ItemField.Id]: '',
  [ItemField.Location]: '',
  [ItemField.Name]: '',
  [ItemField.Photo]: [],
  [ItemField.Price]: 0,
  [ItemField.Reference]: '',
  [ItemField.ReferencePrinted]: false,
  [ItemField.Status]: ItemStatus.Acheté,
  [ItemField.UpdatedOn]: '',
}

export const emptyItemPhoto: ItemPhoto = {
  filename: '',
  height: 0,
  id: '',
  size: 0,
  thumbnails: { full: { height: 0, url: '', width: 0 }, large: { height: 0, url: '', width: 0 }, small: { height: 0, url: '', width: 0 } },
  type: '',
  url: '',
  width: 0,
}

export const emptyItemSuggestions = {
  [ItemField.Barcode]: [],
  [ItemField.Box]: [],
  [ItemField.Brand]: [],
  [ItemField.Category]: [],
  [ItemField.Details]: [],
  [ItemField.Drawer]: [],
  [ItemField.Id]: [],
  [ItemField.Location]: [],
  [ItemField.Name]: [],
  [ItemField.Photo]: [],
  [ItemField.Price]: [],
  [ItemField.Reference]: [],
  [ItemField.ReferencePrinted]: [],
  [ItemField.Status]: [ItemStatus.Acheté],
  [ItemField.UpdatedOn]: [],
}

export const delays = {
  large: 300,
  medium: 200,
  second: 1000,
  seconds: 2000,
  small: 100,
} as const

// https://fusejs.io/
export const fuseOptions: IFuseOptions<Item> = {
  distance: 200, // see the tip at https://fusejs.io/concepts/scoring-theory.html#scoring-theory
  getFn: (object: Item, path: string[] | string) => {
    const value = Fuse.config.getFn(object, path)
    if (Array.isArray(value)) return value.map((element: string) => sanitize(element))
    if (typeof value === 'string') return [sanitize(value)]
    return value
  },
  ignoreLocation: true, // eslint-disable-line @typescript-eslint/naming-convention
  keys: [{
    name: ItemField.Name,
    weight: 4,
  }, {
    name: ItemField.Brand,
    weight: 2,
  }, {
    name: ItemField.Details,
    weight: 4,
  }, {
    name: ItemField.Category,
    weight: 1,
  }], // this is not generic ^^"
  threshold: 0.35, // 0 is perfect match
}

export function voidFunction () { /* empty */ }
