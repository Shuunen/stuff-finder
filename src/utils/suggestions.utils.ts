/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable @typescript-eslint/naming-convention */
import { capitalize, clone } from 'shuutils'
import { emptyItemSuggestions } from '../constants'
import type { WrapApiAliExResponse, WrapApiAngboResponse, WrapApiCampoResponse, WrapApiDeyesResponse } from '../types/requests.types'
import { get } from './browser.utils'
import { logger } from './logger.utils'
import type { ItemSuggestions } from './parsers.utils'
import { state } from './state.utils'
import { getAsin } from './url.utils'

const keysToCapitalize = new Set(['name', 'details'])

function priceParse (price?: number | string) {
  if (price === undefined) return ''
  if (typeof price === 'string') return Math.round(Number.parseFloat(price)).toString()
  return Math.round(price).toString()
}

function isNullish (value: unknown) {
  if (value === undefined || value === null) return true
  if (typeof value === 'number') return value <= 0 || value === 0
  if (typeof value === 'string') return value === '' || value === '0'
  return true
}

export async function addSuggestionsFromWrap<ResponseType> (endpoint: string, getMethod = get) {
  const wrapApiKey = state.credentials.wrap
  if (wrapApiKey === '') return {} as ResponseType // eslint-disable-line @typescript-eslint/consistent-type-assertions
  return await getMethod(`https://wrapapi.com/use/jojo/${endpoint}&wrapAPIKey=${wrapApiKey}`) as ResponseType // eslint-disable-line @typescript-eslint/consistent-type-assertions
}

export async function addSuggestionsFromDeyes (suggestions: ItemSuggestions, code: string, getMethod = get) {
  const { data, success } = await addSuggestionsFromWrap<WrapApiDeyesResponse>(`deyes/json/0.0.2?code=${code}`, getMethod)
  if (!success) return
  logger.debug('deyes data', data)
  suggestions.name.push(data.name)
  suggestions.brand.push(data.brand.name)
  suggestions.details.push(data.description)
  const [image] = data.image
  if (image !== undefined) suggestions.photo.push(image)
  suggestions.price.push(priceParse(data.offers.price))
  suggestions.reference.push(data.gtin13)
}

export async function addSuggestionsFromAngbo (suggestions: ItemSuggestions, string_: string, getMethod = get) {
  const { data, success } = await addSuggestionsFromWrap<WrapApiAngboResponse>(`angbo/search/0.0.3?id=${string_}`, getMethod)
  if (!success) return
  logger.debug('angbo data', data)
  suggestions.name.push(data.title)
  suggestions.photo.push(data.photo)
  suggestions.price.push(priceParse(data.price))
  suggestions.reference.push(data.asin)
}

export async function addSuggestionsFromAliEx (suggestions: ItemSuggestions, string_: string, getMethod = get) {
  const { data, success } = await addSuggestionsFromWrap<WrapApiAliExResponse>(`aliex/search/0.0.1?str=${string_}`, getMethod)
  if (!success) return
  logger.debug('AliEx data', data)
  for (const item of data.items) {
    suggestions.name.push(item.title)
    suggestions.photo.push(item.photo)
    suggestions.price.push(priceParse(item.price))
    suggestions.reference.push(item.reference)
  }
}

export async function addSuggestionsFromCampo (suggestions: ItemSuggestions, string_: string, getMethod = get) {
  const { data, success } = await addSuggestionsFromWrap<WrapApiCampoResponse>(`alcampo/search/0.0.3?str=${string_}`, getMethod)
  if (!success) return
  logger.debug('campo data', data)
  for (const item of data.items) {
    suggestions.brand.push(item.brand)
    suggestions.name.push(item.title)
    suggestions.photo.push(item.photo)
    if (item.price !== undefined) suggestions.price.push(priceParse(item.price))
    suggestions.reference.push(item.uuid)
  }
}

export function cleanSuggestions (suggestionsInput: Record<string, string[] | undefined>) {
  const suggestions = clone(suggestionsInput)
  const keys = Object.keys(suggestions)
  for (const key of keys) {
    /* c8 ignore next */
    let values = suggestions[key] ?? []
    if (keysToCapitalize.has(key)) values = values.map(value => {
      if (isNullish(value)) return value
      return capitalize(value, true)
    })
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    if (values.length === 0) delete suggestions[key] // clear empty fields
    else suggestions[key] = values.filter((value, index, array) => array.indexOf(value) === index && !isNullish(value)) // remove duplicates & nullish
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return suggestions as Record<string, string[]>
}

export async function getSuggestions (string_: string) {
  const asin = getAsin(string_)
  const suggestionsBase = clone(emptyItemSuggestions)
  if (asin !== undefined) await addSuggestionsFromAngbo(suggestionsBase, asin)
  if (suggestionsBase.name.length === 0) await addSuggestionsFromDeyes(suggestionsBase, string_)
  if (suggestionsBase.name.length === 0) await addSuggestionsFromAliEx(suggestionsBase, string_)
  await addSuggestionsFromCampo(suggestionsBase, string_)
  return cleanSuggestions(suggestionsBase)
}
