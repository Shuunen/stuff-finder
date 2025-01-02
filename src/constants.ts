import type { Item, ItemField, ItemPhoto, ItemStatus } from './utils/parsers.utils'

export interface CommonLists {
  boxes: string[]
  categories: string[]
  drawers: string[]
  locations: string[]
  statuses: ItemStatus[]
}

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

export const defaultItems: Item[] = []

