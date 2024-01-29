
interface WrapApiResponse {
  messages: string[]
  // eslint-disable-next-line @typescript-eslint/naming-convention
  success: boolean
}

export interface WrapApiDeyesResponse extends WrapApiResponse {
  data: {
    brand: { name: string }
    description: string
    gtin13: string
    image: string[]
    name: string
    offers: { price: string }
  }
}

export interface WrapApiAngboResponse extends WrapApiResponse {
  data: {
    asin: string
    photo: string
    price?: number
    title: string
    url: string
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
      photo: string
      price: number
      rating: number
      reference: string
      store: string
      title: string
    }[]
  }
}
