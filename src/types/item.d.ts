interface ItemThumbnail {
  url: string
  width: number
  height: number
}

interface ItemPhoto {
  filename: string
  height: number
  id: string
  size: number
  type: string
  url: string
  width: number
  thumbnails: {
    small: ItemThumbnail,
    large: ItemThumbnail,
    full: ItemThumbnail
  }
}

interface Item {
  'barcode': string
  'box': string
  'brand': string
  'category': string
  'details': string
  'drawer': string
  'id': string
  'location': string
  'name': string
  'price'?: number
  'photo'?: ItemPhoto[]
  'reference': string
  'ref-printed': boolean
  'status': string
  'updated-on': string
}

type ItemSuggestions = Record<keyof Item, string[]>

interface CommonLists {
  boxes: string[]
  locations: string[]
  statuses: string[]
  drawers: string[]
  categories: string[]
}
