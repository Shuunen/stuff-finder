import Fuse, { type IFuseOptions } from 'fuse.js'
import { sanitize } from 'shuutils'
import type { Display } from './types/theme.types'
import type { Item, ItemField, ItemPhoto, ItemStatus } from './utils/parsers.utils'

export interface CommonLists {
  boxes: string[]
  categories: string[]
  drawers: string[]
  locations: string[]
  statuses: ItemStatus[]
}

export const defaultImage = '/assets/no-visual.svg'

export const defaultCommonLists: CommonLists = {
  boxes: [],
  categories: [],
  drawers: ['', '1', '2', '3', '4', '5', '6', '7'],
  locations: [],
  statuses: [
    'acheté',
    'à donner',
    'à vendre',
    'donné',
    'jeté',
    'renvoyé',
    'vendu',
  ],
} satisfies CommonLists

export const defaultCredentials = {
  base: '',
  table: '',
  token: '',
  view: '',
  wrap: '',
} satisfies Record<string, string>

export type AppCredentials = typeof defaultCredentials

export const emptyItem: Item = {
  'barcode': '',
  'box': '',
  'brand': '',
  'category': '',
  'details': '',
  'drawer': '',
  'id': '',
  'location': '',
  'name': '',
  'photo': [],
  'price': 0,
  'ref-printed': false,
  'reference': '',
  'status': 'acheté',
  'updated-on': '',
} satisfies Item

export const emptyItemPhoto: ItemPhoto = {
  filename: '',
  height: 0,
  id: '',
  thumbnails: { full: { height: 0, url: '', width: 0 }, large: { height: 0, url: '', width: 0 }, small: { height: 0, url: '', width: 0 } },
  type: '',
  url: '',
  width: 0,
} satisfies ItemPhoto

export const emptyItemSuggestions = {
  'barcode': [],
  'box': [],
  'brand': [],
  'category': [],
  'details': [],
  'drawer': [],
  'id': [],
  'location': [],
  'name': [],
  'photo': [],
  'price': [],
  'ref-printed': [],
  'reference': [],
  'status': ['acheté'],
  'updated-on': [],
} satisfies Record<ItemField, string[]>

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
    if (Array.isArray(value)) return value.map(sanitize)
    if (typeof value === 'string') return [sanitize(value)]
    return value
  },
  ignoreLocation: true, // eslint-disable-line @typescript-eslint/naming-convention
  keys: [
    {
      name: 'name',
      weight: 4,
    }, {
      name: 'brand',
      weight: 2,
    }, {
      name: 'details',
      weight: 4,
    }, {
      name: 'category',
      weight: 1,
    },
  ], // this is not generic ^^"
  threshold: 0.35, // 0 is perfect match
}

export function voidFunction () { /* empty */ }

export const defaultItems: Item[] = []

export const defaultDisplay: Display = 'list'
