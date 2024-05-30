/* eslint-disable functional/immutable-data */
import { safeParse } from 'valibot'
import { emptyItem } from '../constants'
import { del, get, patch, post } from './browser.utils'
import { logger } from './logger.utils'
import { airtableDeleteResponseSchema, airtableMultipleResponseSchema, airtableSingleResponseSchema, type AirtableSingleRecordResponse, type Item, type ItemField, type ItemPhoto } from './parsers.utils'
import { state } from './state.utils'

const airtableBaseUrl = 'https://api.airtable.com/v0'

export const airtableMaxRequestPerSecond = 5

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export function getItemFieldsToPush (data: Item, currentState = state) { // eslint-disable-line max-statements, complexity, sonarjs/cognitive-complexity
  const fields: Partial<AirtableSingleRecordResponse['fields']> = {}
  if (data.barcode.length > 0) fields.barcode = data.barcode
  if (data.box.length > 0) fields.box = data.box
  if (data.brand.length > 0) fields.brand = data.brand
  if (data.category.length > 0) fields.category = data.category
  if (data.details.length > 0) fields.details = data.details
  if (data.drawer.length > 0) fields.drawer = data.drawer
  if (data.location.length > 0) fields.location = data.location
  if (data.name.length > 0) fields.name = data.name
  /* c8 ignore next 2 */
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (data.photo !== undefined && data.photo.length > 0 && fields.photo?.[0]?.url !== data.photo[0]?.url) fields.photo = [{ url: data.photo[0]?.url } as unknown as ItemPhoto] // we don't need the whole object
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  if (data.price !== undefined && data.price > -1) fields.price = data.price
  if (data.reference.length > 0) fields.reference = data.reference
  if (data.status.length > 0) fields.status = data.status
  fields['ref-printed'] = data['ref-printed']
  if (data.id.length > 0) {
    const existing = currentState.items.find(existingItem => existingItem.id === data.id)
    if (!existing) throw new Error('existing item not found locally')
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const dataFields = Object.keys(fields) as ItemField[]
    for (const field of dataFields) {
      /* c8 ignore next 2 */
      if (field === 'id') continue // eslint-disable-line no-continue
      const hasSamePhoto = (field === 'photo' && existing.photo && existing.photo[0]?.url === fields.photo?.[0]?.url) ?? false
      const hasSameValue = existing[field] === fields[field]
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      if (hasSamePhoto || hasSameValue) delete fields[field]
    }
  }
  return fields
}

export function airtableRecordToItem (record: AirtableSingleRecordResponse) {
  return {
    ...emptyItem,
    ...record.fields,
    id: record.id,
  }
}

export function isLocalAndRemoteSync (records: AirtableSingleRecordResponse[], currentState = state) {
  const record = records.at(0)
  if (!record) throw new Error('remoteFirst is undefined')
  const remoteFirst = airtableRecordToItem(record)
  const localFirst = currentState.items.at(0)
  const isFirst = localFirst === undefined ? false : remoteFirst.id === localFirst.id && remoteFirst['updated-on'] === localFirst['updated-on']
  if (isFirst) return true
  const localLast = currentState.items.at(-1) // eslint-disable-line @typescript-eslint/no-magic-numbers
  return localLast === undefined ? false : remoteFirst.id === localLast.id && remoteFirst['updated-on'] === localLast['updated-on']
}

export async function getOneItem (id: Item['id'], getMethod = get) {
  const { base, table } = state.credentials
  const url = `${airtableBaseUrl}/${base}/${table}/${id}`
  const result = safeParse(airtableSingleResponseSchema, await getMethod(url))
  if (!result.success) {
    logger.error(result.issues)
    throw new Error(`failed to fetch item, issue(s) : ${result.issues.map(issue => issue.message).join(', ')}`)
  }
  return airtableRecordToItem(result.output)
}

export async function getAllItems (offset?: string, getMethod = get) {
  const offsetParameter = offset === undefined ? '' : `&offset=${offset}`
  const sortByUpdatedFirst = '&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc'
  const { base, table, view } = state.credentials
  const url = `${airtableBaseUrl}/${base}/${table}?view=${view}${offsetParameter}${sortByUpdatedFirst}`
  const result = safeParse(airtableMultipleResponseSchema, await getMethod(url))
  if (!result.success) {
    logger.error(result.issues)
    throw new Error(`failed to fetch item, issue(s) : ${result.issues.map(issue => issue.message).join(', ')}`)
  }
  return result.output
}

export async function deleteItemRemotely (id: Item['id'], currentState = state, delMethod = del) {
  const { base, table } = currentState.credentials
  const url = `${airtableBaseUrl}/${base}/${table}/${id}`
  return safeParse(airtableDeleteResponseSchema, await delMethod(url))
}

// eslint-disable-next-line @typescript-eslint/max-params
export async function pushItemRemotely (item: Item, currentState = state, postMethod = post, patchMethod = patch) {
  const fields = getItemFieldsToPush(item, currentState)
  if (Object.keys(fields).length === 0) {
    logger.showLog('no update to push')
    return { output: { fields, id: item.id }, success: false } // eslint-disable-line @typescript-eslint/naming-convention
  }
  const data = { fields }
  const { base, table } = currentState.credentials
  const baseUrl = `${airtableBaseUrl}/${base}/${table}`
  if (item.id === '') return safeParse(airtableSingleResponseSchema, await postMethod(baseUrl, data))
  const url = `${baseUrl}/${item.id}`
  return safeParse(airtableSingleResponseSchema, await patchMethod(url, data))
}
