export interface ItemThumbnail {
  url: string
  width: number
  height: number
}

export interface ItemPhoto {
  id: string
  url: string
  filename: string
  size: number
  type: string
  thumbnails: {
    small: ItemThumbnail,
    large: ItemThumbnail,
    full: ItemThumbnail
  }
}

export interface Item {
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
  'price': number
  'photo': ItemPhoto[]
  'reference': string
  'ref-printed': boolean
  'status': string
  'statuses': string[]
  'updated-on': string
}
