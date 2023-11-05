import { ItemField, ItemStatus } from './types'

export const jsonHeaders = {
  'Accept': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
  'Content-Type': 'application/json',
}

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

export const emptyAppSettings = {
  base: '',
  key: '',
  table: '',
  view: '',
  wrap: '',
}

export const emptyItem = {
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
