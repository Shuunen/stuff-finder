import type { AppSettings, CommonLists, Item, ItemSuggestions } from './types'
import { ItemField, ItemStatus } from './types'

export const JSON_HEADERS = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Accept': 'application/json',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Content-Type': 'application/json',
}

export const DEFAULT_IMAGE = 'assets/no-visual.svg'

export const EMPTY_COMMON_LISTS: CommonLists = {
  boxes: [],
  drawers: [],
  locations: [],
  statuses: [],
  categories: [],
}

export const EMPTY_APP_SETTINGS: AppSettings = {
  base: '',
  key: '',
  table: '',
  view: '',
  wrap: '',
}

export const EMPTY_ITEM: Item = {
  [ItemField.barcode]: '',
  [ItemField.box]: '',
  [ItemField.brand]: '',
  [ItemField.category]: '',
  [ItemField.details]: '',
  [ItemField.drawer]: '',
  [ItemField.id]: '',
  [ItemField.location]: '',
  [ItemField.name]: '',
  [ItemField.photo]: [],
  [ItemField.price]: 0,
  [ItemField.reference]: '',
  [ItemField.referencePrinted]: false,
  [ItemField.status]: ItemStatus.acheté,
  [ItemField.updatedOn]: '',
}

export const EMPTY_ITEM_SUGGESTIONS: ItemSuggestions = {
  [ItemField.name]: [],
  [ItemField.brand]: [],
  [ItemField.details]: [],
  [ItemField.reference]: [],
  [ItemField.barcode]: [],
  [ItemField.category]: [],
  [ItemField.location]: [],
  [ItemField.box]: [],
  [ItemField.drawer]: [],
  [ItemField.status]: [ItemStatus.acheté],
  [ItemField.price]: [],
  [ItemField.photo]: [],
  [ItemField.referencePrinted]: ['true'],
  [ItemField.updatedOn]: [],
  [ItemField.id]: [],
}
