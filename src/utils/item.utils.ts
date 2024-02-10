import { clone } from 'shuutils'
import { defaultCommonLists, defaultImage, emptyItem } from '../constants'
import { get, patch, post } from './browser.utils'
import { createField, type Form } from './forms.utils'
import { logger } from './logger.utils'
import { sortListsEntries } from './objects.utils'
import { airtableMultipleRecordResponseParser, airtableSingleRecordResponseParser, type AirtableSingleRecordResponse, type Item, type ItemField, type ItemPhoto } from './parsers.utils'
import { state } from './state.utils'

const airtableBaseUrl = 'https://api.airtable.com/v0'

function shouldAddToList (value = '', list: string[] = []) {
  return value.length > 0 && !list.includes(value)
}

const airtableMaxRequestPerSecond = 5

function itemToImageUrl (item?: Item) {
  return item?.photo?.[0]?.url ?? defaultImage
}

function airtableRecordToItem (record: AirtableSingleRecordResponse) {
  return {
    ...emptyItem,
    ...record.fields,
    id: record.id,
  }
}

async function getOneItem (id: Item['id'], getMethod = get) {
  const { base, table } = state.credentials
  const url = `${airtableBaseUrl}/${base}/${table}/${id}`
  const result = airtableSingleRecordResponseParser(await getMethod(url))
  if (!result.success) throw new Error(`failed to fetch item, issue(s) : ${result.error.message}`)
  return airtableRecordToItem(result.output)
}

async function getAllItems (offset?: string, getMethod = get) {
  const offsetParameter = offset === undefined ? '' : `&offset=${offset}`
  const sortByUpdatedFirst = '&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc'
  const { base, table, view } = state.credentials
  const url = `${airtableBaseUrl}/${base}/${table}?view=${view}${offsetParameter}${sortByUpdatedFirst}`
  const result = airtableMultipleRecordResponseParser(await getMethod(url))
  if (!result.success) throw new Error(`failed to fetch item, issue(s) : ${result.error.message}`)
  return result.output
}

function addOrUpdateItems (input: Item[], itemTouched: Item) {
  const items = clone(input)
  const index = items.findIndex(item => item.id === itemTouched.id)
  if (index >= 0) {
    logger.info('updating item locally', itemTouched)
    items[index] = itemTouched
  } else if (itemTouched.id) {
    logger.info('adding item locally', itemTouched)
    items.push(itemTouched)
  } else logger.showError('cannot add item without id')
  return items
}

/* c8 ignore next 7 */
async function updateItemImage (id: string, image: HTMLImageElement) {
  logger.debug('image url for item', id, 'has been deprecated, fetching fresh data from server...')
  const item = await getOneItem(id)
  // eslint-disable-next-line no-param-reassign
  image.src = itemToImageUrl(item)
  state.items = addOrUpdateItems(state.items, item)
}

// eslint-disable-next-line max-statements, complexity, sonarjs/cognitive-complexity
export function getItemFieldsToPush (data: Item, currentState = state) {
  const fields: Partial<AirtableSingleRecordResponse['fields']> = {}
  if (data.barcode.length > 0) fields.barcode = data.barcode
  if (data.box.length > 0) fields.box = data.box
  if (data.brand.length > 0) fields.brand = data.brand
  if (data.category.length > 0) fields.category = data.category
  if (data.details.length > 0) fields.details = data.details
  if (data.drawer.length > 0) fields.drawer = data.drawer
  if (data.location.length > 0) fields.location = data.location
  if (data.name.length > 0) fields.name = data.name
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (data.photo !== undefined) fields.photo = [{ url: data.photo } as unknown as ItemPhoto] // we don't need the whole object
  if (data.price !== undefined) fields.price = data.price
  if (data.reference.length > 0) fields.reference = data.reference
  if (data.status.length > 0) fields.status = data.status
  fields['ref-printed'] = data['ref-printed']
  if (data.id.length > 0) {
    const existing = currentState.items.find(existingItem => existingItem.id === data.id)
    if (!existing) throw new Error('existing item not found locally')
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const dataFields = Object.keys(fields) as ItemField[]
    dataFields.forEach((field) => {
      /* c8 ignore next 2 */
      if (field === 'id') return
      const hasSamePhoto = (field === 'photo' && existing.photo && existing.photo[0]?.url === fields.photo?.[0]?.url) ?? false
      const hasSameValue = existing[field] === fields[field]
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      if (hasSamePhoto || hasSameValue) delete fields[field]
    })
  }
  return fields
}

export function pushItemLocally (itemTouched: Item) {
  logger.info('pushing item locally', itemTouched)
  const index = state.items.findIndex(item => item.id === itemTouched.id)
  if (index >= 0) state.items[index] = itemTouched // update existing item
  else if (itemTouched.id) state.items.push(itemTouched) // new item with id
  else throw new Error('cannot add item without id')
}

// eslint-disable-next-line @typescript-eslint/max-params
export async function pushItemRemotely (item: Item, id: Item['id'], currentState = state, postMethod = post, patchMethod = patch) {
  const fields = getItemFieldsToPush(item, currentState)
  if (Object.keys(fields).length === 0) {
    logger.showLog('no update to push')
    return { fields, id }
  }
  const data = { fields }
  const { base, table } = currentState.credentials
  const baseUrl = `${airtableBaseUrl}/${base}/${table}`
  if (id === '') return airtableSingleRecordResponseParser(await postMethod(baseUrl, data))
  const url = `${baseUrl}/${id}`
  return airtableSingleRecordResponseParser(await patchMethod(url, data))
}

export function getCommonListsFromItems (items: Item[]) {
  let list = clone(defaultCommonLists)
  items.forEach(item => {
    if (shouldAddToList(item.location, list.locations)) list.locations.push(item.location)
    if (shouldAddToList(item.box, list.boxes)) list.boxes.push(item.box)
    if (shouldAddToList(item.status, list.statuses)) list.statuses.push(item.status)
    if (shouldAddToList(item.category, list.categories)) list.categories.push(item.category)
  })
  list = sortListsEntries(list)
  return list
}

/* c8 ignore next 10 */
export async function onItemImageError (event: Event) {
  const image = event.target as HTMLImageElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
  image.src = itemToImageUrl()
  image.classList.add('animate-pulse')
  if (document.querySelectorAll('img[data-id]').length > airtableMaxRequestPerSecond) { void logger.debouncedDebug('prevent too many requests to airtable'); return }
  const { id } = image.dataset
  if (id === undefined) throw new Error('no id found on image')
  await updateItemImage(id, image)
  image.classList.remove('animate-pulse')
}

export const itemForm = {
  columns: 3,
  errorMessage: '',
  fields: {
    barcode: createField({ label: 'Barcode', maxLength: 30, order: 50, type: 'text', value: '' }),
    box: createField({ label: 'Box', order: 80, type: 'text', value: '' }),
    brand: createField({ label: 'Brand', order: 20, type: 'text', value: '' }),
    category: createField({ label: 'Category', order: 100, type: 'text', value: '' }),
    details: createField({ label: 'Details', maxLength: 200, order: 30, type: 'text', value: '' }),
    drawer: createField({ label: 'Drawer', order: 90, type: 'text', value: '' }),
    isPrinted: createField({ label: 'Printed', order: 130, type: 'checkbox', value: false }), // eslint-disable-line @typescript-eslint/naming-convention
    location: createField({ label: 'Location', order: 70, type: 'text', value: '' }),
    name: createField({ isRequired: true, label: 'Name', order: 10, type: 'text', value: '' }),
    photo: createField({ label: 'Photo', order: 120, regex: /^https?:\/\/\S+$/u, type: 'text', value: '' }),
    price: createField({ label: 'Price', order: 110, regex: /^\d{1,4}$/u, type: 'text', value: '' }),
    reference: createField({ isRequired: true, label: 'Reference', maxLength: 30, order: 40, regex: /^[\w-]{3,50}$/u, type: 'text', value: '' }),
    status: createField({ label: 'Status', order: 60, type: 'text', value: '' }),
  },
  isTouched: false,
  isValid: false,
} as const satisfies Form

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

export { addOrUpdateItems, airtableRecordToItem, getAllItems, getOneItem, itemToImageUrl }

