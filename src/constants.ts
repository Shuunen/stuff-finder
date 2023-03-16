import { ItemField, ItemStatus } from './types'

export const jsonHeaders = {
  'Accept': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
  'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
}

export const defaultImage = 'assets/no-visual.svg'

export const emptyCommonLists = {
  boxes: [],
  drawers: [],
  locations: [],
  statuses: [],
  categories: [],
} as const

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
