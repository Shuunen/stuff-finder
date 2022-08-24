
interface WrapApiResponse {
  messages: string[]
  success: boolean
}

interface WrapApiDeyesResponse extends WrapApiResponse {
  data: {
    brand: { name: string }
    name: string
    description: string
    image: string[]
    gtin13: string
    offers: { price: string }
  }
}

interface WrapApiAmznResponse extends WrapApiResponse {
  data: {
    items: {
      title: string
      price?: number
      url: string
      photo: string
    }[]
  }
}

interface WrapApiCampoResponse extends WrapApiResponse {
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

interface WrapApiAliExResponse extends WrapApiResponse {
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

interface AirtableError {
  message: string
  type: string
}

interface AirtableRecord {
  id: string
  fields: Item
  error?: AirtableError
}

interface AirtableResponse {
  records: AirtableRecord[]
  error?: AirtableError
  offset?: string
}
