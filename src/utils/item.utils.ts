import { clone, slugify } from 'shuutils'
import { defaultCommonLists, defaultImage, emptyItem, emptyItemPhoto } from '../constants'
import type { Item } from '../types/item.types'
import type { AirtableSingleRecordResponse } from '../types/requests.types'
import { get } from './browser.utils'
import { createField, type Form } from './forms.utils'
import { logger } from './logger.utils'
import { sortListsEntries } from './objects.utils'
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

async function getOneItem (id: Item['id']) {
  const { base, table } = state.credentials
  const url = `${airtableBaseUrl}/${base}/${table}/${id}`
  const response = await get<AirtableSingleRecordResponse>(url, false)
  return airtableRecordToItem(response)
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

export function fakeItem (data: Partial<Item> = {}) {
  const item: Item = {
    ...emptyItem,
    ...data,
  }
  item.id = item.id || slugify(item.name)
  item.photo = (item.photo !== undefined && (item.photo.length > 0)) ? item.photo : [{ ...emptyItemPhoto, url: `https://picsum.photos/seed/${item.name}/200/200` }]
  return item satisfies Item
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
    barcode: createField({ label: 'Barcode', maxLength: 30, order: 50 }),
    box: createField({ label: 'Box', order: 80 }),
    brand: createField({ label: 'Brand', order: 20 }),
    category: createField({ label: 'Category', order: 100 }),
    details: createField({ label: 'Details', maxLength: 200, order: 30 }),
    drawer: createField({ label: 'Drawer', order: 90 }),
    location: createField({ label: 'Location', order: 70 }),
    name: createField({ isRequired: true, label: 'Name', order: 10 }),
    photo: createField({ label: 'Photo', order: 120, regex: /^https?:\/\/\S+$/u }),
    price: createField({ label: 'Price', order: 110, regex: /^\d{1,4}$/u }),
    printed: createField({ label: 'Printed', order: 130 }),
    reference: createField({ isRequired: true, label: 'Reference', maxLength: 30, order: 40 }),
    status: createField({ label: 'Status', order: 60 }),
  },
  isTouched: false,
  isValid: false,
} satisfies Form

export { addOrUpdateItems, airtableRecordToItem, getOneItem, itemToImageUrl }

