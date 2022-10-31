export const JSON_HEADERS = {
  'Accept': 'application/json',
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
  'id': '',
  'name': '',
  'brand': '',
  'details': '',
  'reference': '',
  'barcode': '',
  'photo': [],
  'status': '',
  'ref-printed': false,
  'category': '',
  'box': '',
  'drawer': '',
  'location': '',
  'price': 0,
  'updated-on': '',
}
