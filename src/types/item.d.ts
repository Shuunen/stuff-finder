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
  'boxes': string[]
  'brand': string
  'category': string
  'details': string
  'drawer': string
  'id': string
  'location': string
  'locations': string[]
  'name': string
  'price'?: number
  'photo'?: ItemPhoto[]
  'reference': string
  'ref-printed': boolean
  'status': string
  'statuses': string[]
  'updated-on': string
}

interface AirtableRecord {
  id: string
  fields: Item
  error?: string
}

interface CommonLists {
  boxes: string[]
  locations: string[]
  statuses: string[]
}
