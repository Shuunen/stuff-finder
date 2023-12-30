import { ItemField, ItemStatus, type AppCredentials, type Item, type ItemPhoto } from './types'

export const defaultImage = 'assets/no-visual.svg'

export interface CommonLists {
  boxes: string[]
  categories: string[]
  drawers: string[]
  locations: string[]
  statuses: string[]
}

export const emptyCommonLists: CommonLists = {
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

export const emptyCredentials: AppCredentials = {
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
  small: 100,
} as const
