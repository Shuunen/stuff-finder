export interface ItemThumbnail {
  url: string
  width: number
  height: number
}

export interface ItemPhoto {
  filename: string
  height: number
  id: string
  size: number
  type: string
  url: string
  width: number
  thumbnails: {
    small: ItemThumbnail
    large: ItemThumbnail
    full: ItemThumbnail
  }
}

export const enum ItemStatus {
  acheté = 'acheté',
  défectueux = 'défectueux',
  donné = 'donné',
  jeté = 'jeté',
  renvoyé = 'renvoyé',
  vendu = 'vendu',
}

export const enum ItemField {
  barcode = 'barcode',
  box = 'box',
  brand = 'brand',
  category = 'category',
  details = 'details',
  drawer = 'drawer',
  id = 'id',
  location = 'location',
  name = 'name',
  photo = 'photo',
  price = 'price',
  reference = 'reference',
  referencePrinted = 'ref-printed',
  status = 'status',
  updatedOn = 'updated-on',
}

export interface Item {
  [ItemField.barcode]: string
  [ItemField.box]: string
  [ItemField.brand]: string
  [ItemField.category]: string
  [ItemField.details]: string
  [ItemField.drawer]: string
  [ItemField.id]: string
  [ItemField.location]: string
  [ItemField.name]: string
  [ItemField.photo]?: ItemPhoto[]
  [ItemField.price]?: number
  [ItemField.reference]: string
  [ItemField.referencePrinted]: boolean
  [ItemField.status]: ItemStatus
  [ItemField.updatedOn]: string
}

export type ItemSuggestions = Record<keyof Item, string[]>

export interface CommonLists {
  boxes: string[]
  locations: string[]
  statuses: string[]
  drawers: string[]
  categories: string[]
}
