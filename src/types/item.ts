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
  Acheté = 'acheté',
  Défectueux = 'défectueux',
  Donné = 'donné',
  Jeté = 'jeté',
  Renvoyé = 'renvoyé',
  Vendu = 'vendu',
}

export const enum ItemField {
  Barcode = 'barcode',
  Box = 'box',
  Brand = 'brand',
  Category = 'category',
  Details = 'details',
  Drawer = 'drawer',
  Id = 'id',
  Location = 'location', // eslint-disable-line @typescript-eslint/no-shadow
  Name = 'name',
  Photo = 'photo',
  Price = 'price',
  Reference = 'reference',
  ReferencePrinted = 'ref-printed',
  Status = 'status',
  UpdatedOn = 'updated-on',
}

export interface Item {
  [ItemField.Barcode]: string
  [ItemField.Box]: string
  [ItemField.Brand]: string
  [ItemField.Category]: string
  [ItemField.Details]: string
  [ItemField.Drawer]: string
  [ItemField.Id]: string
  [ItemField.Location]: string
  [ItemField.Name]: string
  [ItemField.Photo]?: ItemPhoto[]
  [ItemField.Price]?: number
  [ItemField.Reference]: string
  [ItemField.ReferencePrinted]: boolean
  [ItemField.Status]: ItemStatus
  [ItemField.UpdatedOn]: string
}

export type ItemSuggestions = Record<keyof Item, string[]>
