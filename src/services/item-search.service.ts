/* eslint-disable @typescript-eslint/naming-convention */


/* eslint-disable @typescript-eslint/no-use-before-define */
import { clone } from 'shuutils'
import { emptyItemSuggestions } from '../constants'
import type { ItemSuggestions } from '../types/item.types'
import type { WrapApiAliExResponse, WrapApiAngboResponse, WrapApiCampoResponse, WrapApiDeyesResponse } from '../types/requests.types'
import { get } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'
import { cleanSuggestions } from '../utils/suggestions.utils'
import { getAsin } from '../utils/url.utils'

function priceParse (price?: number | string) {
  if (price === undefined) return ''
  if (typeof price === 'string') return Math.round(Number.parseFloat(price)).toString()
  return Math.round(price).toString()
}

async function getSuggestions (str: string) {
  const asin = getAsin(str)
  const suggestionsBase = clone(emptyItemSuggestions)
  if (asin !== undefined) await addSuggestionsFromAngbo(suggestionsBase, asin)
  if (suggestionsBase.name.length === 0) await addSuggestionsFromDeyes(suggestionsBase, str)
  if (suggestionsBase.name.length === 0) await addSuggestionsFromAliEx(suggestionsBase, str)
  await addSuggestionsFromCampo(suggestionsBase, str)
  const suggestions = cleanSuggestions(suggestionsBase)
  logger.info('final suggestions', suggestions)
  return suggestions
}

async function addSuggestionsFromWrap<ResponseType> (endpoint: string) {
  const wrapApiKey = state.credentials.wrap
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (wrapApiKey === '') return {} as ResponseType
  // disable cache for wrap-api because it's taking too much space in the browser
  return await get<ResponseType>(`https://wrapapi.com/use/jojo/${endpoint}&wrapAPIKey=${wrapApiKey}`, false)
}

async function addSuggestionsFromDeyes (suggestions: ItemSuggestions, code: string) {
  const { data, success } = await addSuggestionsFromWrap<WrapApiDeyesResponse>(`deyes/json/0.0.2?code=${code}`)
  if (!success) return
  logger.info('deyes data', data)
  suggestions.name.push(data.name)
  suggestions.brand.push(data.brand.name)
  suggestions.details.push(data.description)
  const [image] = data.image
  if (image !== undefined) suggestions.photo.push(image)
  suggestions.price.push(priceParse(data.offers.price))
  suggestions.reference.push(data.gtin13)
}

async function addSuggestionsFromAngbo (suggestions: ItemSuggestions, str: string) {
  const { data, success } = await addSuggestionsFromWrap<WrapApiAngboResponse>(`angbo/search/0.0.3?id=${str}`)
  if (!success) return
  logger.info('angbo data', data)
  suggestions.name.push(data.title)
  suggestions.photo.push(data.photo)
  suggestions.price.push(priceParse(data.price))
  suggestions.reference.push(data.asin)
}

async function addSuggestionsFromAliEx (suggestions: ItemSuggestions, str: string) {
  const { data, success } = await addSuggestionsFromWrap<WrapApiAliExResponse>(`aliex/search/0.0.1?str=${str}`)
  if (!success) return
  logger.info('AliEx data', data)
  data.items.forEach(item => {
    suggestions.name.push(item.title)
    suggestions.photo.push(item.photo)
    suggestions.price.push(priceParse(item.price))
    suggestions.reference.push(item.reference)
  })
}

async function addSuggestionsFromCampo (suggestions: ItemSuggestions, str: string) {
  const { data, success } = await addSuggestionsFromWrap<WrapApiCampoResponse>(`alcampo/search/0.0.3?str=${str}`)
  if (!success) return
  logger.info('campo data', data)
  data.items.forEach(item => {
    suggestions.brand.push(item.brand)
    suggestions.name.push(item.title)
    suggestions.photo.push(item.photo)
    if (item.price !== undefined) suggestions.price.push(priceParse(item.price))
    suggestions.reference.push(item.uuid)
  })
}

logger.info('suggestions', await getSuggestions('https://www.amazon.fr/dp/B07XV9S8ZV'))
