export interface ItemThumbnail {
  height: number
  url: string
  width: number
}

export interface ItemPhoto {
  /**
   * not used for now
   */
  filename: string
  height: number
  id: string
  size: number
  /**
   * not used for now
   */
  thumbnails: {
    full: ItemThumbnail
    large: ItemThumbnail
    small: ItemThumbnail
  }
  type: string
  url: string
  width: number
}

export const enum ItemStatus {
  Acheté = 'acheté',
  ADonner = 'à donner', // eslint-disable-line @typescript-eslint/naming-convention
  AVendre = 'à vendre', // eslint-disable-line @typescript-eslint/naming-convention
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

export const defaultItems: Item[] = []
