import { ItemField, ItemStatus } from './types'

export const jsonHeaders = {
  'Accept': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
  'Content-Type': 'application/json',
}

export const defaultImage = 'assets/no-visual.svg'

export interface CommonLists {
  boxes: string[]
  drawers: string[]
  locations: string[]
  statuses: string[]
  categories: string[]
}

export const emptyCommonLists: CommonLists = {
  boxes: [],
  drawers: ['', '1', '2', '3', '4', '5', '6', '7'],
  locations: [],
  statuses: [ItemStatus.Acheté, ItemStatus.Vendu, ItemStatus.Donné, ItemStatus.Renvoyé, ItemStatus.Défectueux, ItemStatus.Jeté],
  categories: [],
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
  [ItemField.Name]: [],
  [ItemField.Brand]: [],
  [ItemField.Details]: [],
  [ItemField.Reference]: [],
  [ItemField.Barcode]: [],
  [ItemField.Category]: [],
  [ItemField.Location]: [],
  [ItemField.Box]: [],
  [ItemField.Drawer]: [],
  [ItemField.Status]: [ItemStatus.Acheté],
  [ItemField.Price]: [],
  [ItemField.Photo]: [],
  [ItemField.ReferencePrinted]: [],
  [ItemField.UpdatedOn]: [],
  [ItemField.Id]: [],
}

export const delays = {
  small: 100,
  medium: 200,
  large: 300,
} as const
