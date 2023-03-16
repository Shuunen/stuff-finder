import type { Item, ItemField } from './item'

export interface WrapApiResponse {
  messages: string[]
  // eslint-disable-next-line @typescript-eslint/naming-convention
  success: boolean
}

export interface WrapApiDeyesResponse extends WrapApiResponse {
  data: {
    brand: { name: string }
    name: string
    description: string
    image: string[]
    gtin13: string
    offers: { price: string }
  }
}

export interface WrapApiAngboResponse extends WrapApiResponse {
  data: {
    asin: string
    title: string
    price?: number
    url: string
    photo: string
  }
}

export interface WrapApiCampoResponse extends WrapApiResponse {
  data: {
    items: {
      brand: string
      photo: string
      price?: number
      rating?: number
      title: string
      url: string
      uuid: string
    }[]
  }
}

export interface WrapApiAliExResponse extends WrapApiResponse {
  data: {
    items: {
      title: string
      photo: string
      reference: string
      rating: number
      price: number
      store: string
    }[]
  }
}

export interface AirtableError {
  message: string
  type: string
}

export interface AirtableRecord {
  id: string
  fields: Partial<Omit<Item, ItemField.Id>>
  error?: AirtableError
}

export interface AirtableResponse {
  records: AirtableRecord[]
  error?: AirtableError
  offset?: string
}
