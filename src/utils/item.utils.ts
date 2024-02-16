import { clone, objectSum } from 'shuutils'
import { defaultCommonLists, defaultImage, emptyItem, type CommonLists } from '../constants'
import { del, get, patch, post } from './browser.utils'
import { createCheckboxField, createSelectField, createTextField, type Form } from './forms.utils'
import { logger } from './logger.utils'
import { sortListsEntries } from './objects.utils'
import { airtableDeleteRecordResponseParser, airtableMultipleRecordResponseParser, airtableSingleRecordResponseParser, type AirtableSingleRecordResponse, type Item, type ItemField, type ItemPhoto } from './parsers.utils'
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
  if (!result.success) {
    logger.error(result.issues)
    throw new Error(`failed to fetch item, issue(s) : ${result.issues.map(issue => issue.message).join(', ')}`)
  }
  return airtableRecordToItem(result.output)
}

async function getAllItems (offset?: string, getMethod = get) {
  const offsetParameter = offset === undefined ? '' : `&offset=${offset}`
  const sortByUpdatedFirst = '&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc'
  const { base, table, view } = state.credentials
  const url = `${airtableBaseUrl}/${base}/${table}?view=${view}${offsetParameter}${sortByUpdatedFirst}`
  const result = airtableMultipleRecordResponseParser(await getMethod(url))
  if (!result.success) {
    logger.error(result.issues)
    throw new Error(`failed to fetch item, issue(s) : ${result.issues.map(issue => issue.message).join(', ')}`)
  }
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

function statusStringToStatus (status: string) {
  if (status === 'acheté') return 'acheté'
  if (status === 'à donner') return 'à donner'
  if (status === 'à vendre') return 'à vendre'
  if (status === 'donné') return 'donné'
  if (status === 'jeté') return 'jeté'
  if (status === 'renvoyé') return 'renvoyé'
  if (status === 'vendu') return 'vendu'
  return 'acheté'
}

function optionsFor (type: keyof CommonLists) {
  return state.lists[type].map((value) => ({ label: value, value }))
}

function deleteItemLocally (id: Item['id'], currentState = state) {
  const items = clone(currentState.items)
  const index = items.findIndex(item => item.id === id)
  if (index === -1) throw new Error('item not found in state') // eslint-disable-line @typescript-eslint/no-magic-numbers
  items.splice(index, 1)
  currentState.items = items // eslint-disable-line no-param-reassign
}

async function deleteItemRemotely (id: Item['id'], currentState = state, delMethod = del) {
  const { base, table } = currentState.credentials
  const url = `${airtableBaseUrl}/${base}/${table}/${id}`
  return airtableDeleteRecordResponseParser(await delMethod(url))
}

// eslint-disable-next-line max-statements, complexity, sonarjs/cognitive-complexity
function getItemFieldsToPush (data: Item, currentState = state) {
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

function pushItemLocally (item: Item, currentState = state) {
  const items = clone(currentState.items)
  const index = items.findIndex(one => one.id === item.id)
  if (index >= 0) items[index] = item // update existing item
  else items.push(item) // new item with id
  // eslint-disable-next-line no-param-reassign
  currentState.items = items
}

// eslint-disable-next-line @typescript-eslint/max-params
async function pushItemRemotely (item: Item, currentState = state, postMethod = post, patchMethod = patch) {
  const fields = getItemFieldsToPush(item, currentState)
  if (Object.keys(fields).length === 0) {
    logger.showLog('no update to push')
    return { output: { fields, id: item.id }, success: false } // eslint-disable-line @typescript-eslint/naming-convention
  }
  const data = { fields }
  const { base, table } = currentState.credentials
  const baseUrl = `${airtableBaseUrl}/${base}/${table}`
  if (item.id === '') return airtableSingleRecordResponseParser(await postMethod(baseUrl, data))
  const url = `${baseUrl}/${item.id}`
  return airtableSingleRecordResponseParser(await patchMethod(url, data))
}

function getCoreData (item: Item) {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { barcode, box, brand, category, details, drawer, location, name, photo, price, 'ref-printed': isPrinted, reference, status } = item
  return { barcode, box, brand, category, details, drawer, location, name, 'photo': photo?.[0]?.url ?? '', price, 'ref-printed': isPrinted, reference, status } satisfies Omit<Item, 'id' | 'photo' | 'updated-on'> & { 'photo': string }
}

// eslint-disable-next-line @typescript-eslint/max-params
export async function pushItem (item: Item, currentState = state, postMethod = post, patchMethod = patch) {
  const result = await pushItemRemotely(item, currentState, postMethod, patchMethod)
  if (result.success) pushItemLocally({ ...item, id: result.output.id }, currentState)
  return result
}

export async function deleteItem (id: Item['id'], currentState = state, delMethod = del) {
  const result = await deleteItemRemotely(id, currentState, delMethod)
  if (result.success) deleteItemLocally(id, currentState)
  return result
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
  columns: 5,
  errorMessage: '',
  fields: { /* eslint-disable perfectionist/sort-objects */
    name: createTextField({ columns: 2, isRequired: true, label: 'Name' }),
    brand: createTextField({ label: 'Brand' }),
    details: createTextField({ columns: 2, label: 'Details', maxLength: 200 }),
    status: createSelectField({ label: 'Status', options: optionsFor('statuses'), value: 'acheté' }),
    reference: createTextField({ isRequired: true, label: 'Reference', maxLength: 30, regex: /^[\w-]{3,50}$/u }),
    barcode: createTextField({ label: 'Barcode', maxLength: 30 }),
    photo: createTextField({ label: 'Photo', regex: /^https?:\/\/\S+$/u }),
    category: createSelectField({ label: 'Category', options: optionsFor('categories') }),
    location: createSelectField({ label: 'Location', options: optionsFor('locations') }),
    box: createSelectField({ label: 'Box', options: optionsFor('boxes'), regex: /^[\p{L}\s&()]{3,100}$/u }),
    drawer: createSelectField({ label: 'Drawer', options: optionsFor('drawers'), regex: /\d/u }),
    price: createTextField({ label: 'Price', regex: /^\d{1,5}$/u, unit: '€' }),
    isPrinted: createCheckboxField({ label: 'Printed' }),
  }, /* eslint-enable perfectionist/sort-objects */
  isTouched: false,
  isValid: false,
} as const satisfies Form

export function formToItem (form: typeof itemForm, id = '') {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { barcode, box, brand, category, details, drawer, isPrinted, location, name, photo, price, reference, status } = form.fields
  return {
    ...emptyItem,
    'barcode': barcode.value,
    'box': box.value,
    'brand': brand.value,
    'category': category.value,
    'details': details.value,
    'drawer': drawer.value,
    id,
    'location': location.value,
    'name': name.value,
    'photo': photo.value === '' ? emptyItem.photo : [{ url: photo.value } as unknown as ItemPhoto], // eslint-disable-line @typescript-eslint/consistent-type-assertions
    'price': price.value === '' ? undefined : Number.parseFloat(price.value),
    'ref-printed': isPrinted.value,
    'reference': reference.value,
    'status': statusStringToStatus(status.value),
  } satisfies Item
}

// eslint-disable-next-line max-statements
export function itemToForm (item?: Item) {
  if (item === undefined) return itemForm
  const form = clone(itemForm)
  form.fields.name.value = item.name
  form.fields.brand.value = item.brand
  form.fields.details.value = item.details
  form.fields.reference.value = item.reference
  form.fields.barcode.value = item.barcode
  form.fields.status.value = item.status
  form.fields.location.value = item.location
  form.fields.box.value = item.box
  form.fields.drawer.value = item.drawer
  form.fields.photo.value = item.photo?.[0]?.url ?? ''
  form.fields.category.value = item.category
  form.fields.price.value = String(item.price)
  form.fields.isPrinted.value = item['ref-printed']
  return form
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

export function areItemsEquivalent (itemA: Item, itemB: Item) {
  return objectSum(getCoreData(itemA)) === objectSum(getCoreData(itemB))
}

export { addOrUpdateItems, airtableRecordToItem, getAllItems, getItemFieldsToPush, getOneItem, itemToImageUrl }

