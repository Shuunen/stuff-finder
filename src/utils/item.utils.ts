/* eslint-disable functional/immutable-data */
import { clone, objectSum } from 'shuutils'
import { defaultCommonLists, defaultImage, emptyItem, type CommonLists } from '../constants'
import { airtableMaxRequestPerSecond, deleteItemRemotely, getOneItem, pushItemRemotely } from './airtable.utils'
import { del, patch, post } from './browser.utils'
import { createCheckboxField, createSelectField, createTextField, type Form } from './forms.utils'
import { logger } from './logger.utils'
import { sortListsEntries } from './objects.utils'
import type { Item, ItemPhoto } from './parsers.utils'
import { state } from './state.utils'


function shouldAddToList (value = '', list: string[] = []) {
  return value.length > 0 && !list.includes(value)
}

function itemToImageUrl (item?: Item) {
  return item?.photo?.[0]?.url ?? defaultImage
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

function pushItemLocally (item: Item, currentState = state) {
  const items = clone(currentState.items)
  const index = items.findIndex(one => one.id === item.id)
  if (index >= 0) items[index] = item // update existing item
  else items.push(item) // new item with id
  // eslint-disable-next-line no-param-reassign
  currentState.items = items
}

function getCoreData (item: Item) {
  const { barcode, box, brand, category, details, drawer, location, name, photo, price, 'ref-printed': isPrinted, reference, status } = item
  return { barcode, box, brand, category, details, drawer, location, name, 'photo': photo?.[0]?.url ?? '', price, 'ref-printed': isPrinted, reference, status } satisfies Omit<Item, 'id' | 'photo' | 'updated-on'> & { photo: string }
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
  const list = clone(defaultCommonLists)
  items.forEach(item => {
    if (shouldAddToList(item.location, list.locations)) list.locations.push(item.location)
    if (shouldAddToList(item.box, list.boxes)) list.boxes.push(item.box)
    if (shouldAddToList(item.status, list.statuses)) list.statuses.push(item.status)
    if (shouldAddToList(item.category, list.categories)) list.categories.push(item.category)
  })
  return sortListsEntries(list)
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
  columns: 10,
  errorMessage: '',
  fields: { /* eslint-disable perfectionist/sort-objects */
    name: createTextField({ columns: 4, isRequired: true, label: 'Name' }),
    brand: createTextField({ columns: 2, label: 'Brand' }),
    details: createTextField({ columns: 4, label: 'Details', maxLength: 200 }),
    // line
    status: createSelectField({ columns: 3, label: 'Status', options: optionsFor('statuses'), value: 'acheté' }),
    reference: createTextField({ columns: 3, isRequired: true, label: 'Reference', maxLength: 30, regex: /^[\w-]{3,50}$/u }),
    barcode: createTextField({ columns: 4, label: 'Barcode', maxLength: 30 }),
    // line
    category: createSelectField({ columns: 3, label: 'Category', options: optionsFor('categories') }),
    photo: createTextField({ columns: 4, label: 'Photo', regex: /^https?:\/\/\S+$/u }),
    price: createTextField({ columns: 3, label: 'Price', regex: /^\d{1,5}$/u, unit: '€' }),
    // line
    location: createSelectField({ columns: 3, label: 'Location', options: optionsFor('locations') }),
    box: createSelectField({ columns: 4, label: 'Box', options: optionsFor('boxes'), regex: /^[\p{L}\s&()]{3,100}$/u }), // eslint-disable-line regexp/unicode-property
    drawer: createSelectField({ columns: 3, label: 'Drawer', options: optionsFor('drawers'), regex: /\d/u }),
    isPrinted: createCheckboxField({ label: 'Printed', isVisible: false }),
  }, /* eslint-enable perfectionist/sort-objects */
  isTouched: false,
  isValid: false,
} as const satisfies Form

export function formToItem (form: typeof itemForm, id = '') {
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

export function areItemsEquivalent (itemA: Item, itemB: Item) {
  return objectSum(getCoreData(itemA)) === objectSum(getCoreData(itemB))
}

export { addOrUpdateItems, getOneItem, itemToImageUrl }

