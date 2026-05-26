type WrapApiResponse = {
  messages: string[]
  success: boolean
}

export type WrapApiDeyesResponse = {
  data: {
    brand: { name: string }
    description: string
    gtin13: string
    image: string[]
    name: string
    offers: { price: string }
  }
} & WrapApiResponse

export type WrapApiAngboResponse = {
  data: {
    asin: string
    photo: string
    price?: number
    title: string
    url: string
  }
} & WrapApiResponse

export type WrapApiCampoResponse = {
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
} & WrapApiResponse

export type WrapApiAliExResponse = {
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
} & WrapApiResponse
