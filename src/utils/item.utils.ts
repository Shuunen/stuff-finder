/* eslint-disable jsdoc/require-jsdoc */
import { Result, capitalize, clone, isTestEnvironment, nbMsInMinute, objectSum, readableTimeAgo } from 'shuutils'
import { type CommonLists, itemBoxes } from '../constants'
import type { Item } from '../types/item.types'
import { addItemRemotely, deleteItemRemotely, getItemsRemotely, removeAppWriteFields, updateItemRemotely } from './database.utils'
import { type Form, createCheckboxField, createSelectField, createTextField } from './forms.utils'
import { logger } from './logger.utils'
import { state } from './state.utils'
import { coolAscii } from './strings.utils'

export const emptyItem = {
  '$id': '',
  'barcode': '',
  'box': '',
  'brand': '',
  'details': '',
  'drawer': -1,
  'isPrinted': false,
  'name': '',
  'photos': [],
  'price': -1,
  'reference': '',
  'status': 'bought',
} satisfies Item

const boxRooms = {
  'bureau': ['E', 'P', 'Q', 'T', 'Z'] satisfies string[],
  'entrée': ['A', 'B', 'D', 'H', 'M', 'O', 'W', 'R', 'V'] satisfies string[],
  'salle de bain': ['S'] satisfies string[],
  'salon': ['G', 'C', 'X', 'N'] satisfies string[],
} as const

export function itemBoxToRoom (box: Item['box']) {
  const letter = box[0]
  if (letter === undefined) return undefined
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  for (const [location, boxes] of Object.entries(boxRooms)) if (boxes.includes(letter)) return location as keyof typeof boxRooms
  return undefined
}

export function statusStringToStatus (status: string) {
  if (status === 'lost') return 'lost' satisfies Item['status']
  if (status === 'to-give') return 'to-give' satisfies Item['status']
  if (status === 'for-sell') return 'for-sell' satisfies Item['status']
  return 'bought' satisfies Item['status']
}

function optionsFor (type: keyof CommonLists) {
  return state.lists[type].map((value) => ({ label: String(value), value: String(value) }))
}

function deleteItemLocally (item: Item, currentState = state) {
  const items = clone(currentState.items)
  const index = items.findIndex(current => current.$id === item.$id)
  if (index === -1) return Result.error('item not found in state')
  items.splice(index, 1)
  currentState.items = items
  return Result.ok('item deleted locally')
}

function updateItemLocally (item: Item, currentState = state) {
  const items = clone(currentState.items)
  const index = items.findIndex(one => one.$id === item.$id)
  if (index === -1) items.push(item) // new item with id
  else items[index] = item // update existing item
  currentState.items = items
}

export async function addItem (item: Item, currentState = state) {
  const result = await addItemRemotely(item, currentState)
  if (result.ok) updateItemLocally({ ...result.value }, currentState)
  return result
}

export async function updateItem (item: Item, currentState = state) {
  const result = await updateItemRemotely(item, currentState)
  if (result.ok) updateItemLocally({ ...result.value }, currentState)
  return result
}

export async function deleteItem (item: Item, currentState = state) {
  const remote = await deleteItemRemotely(item, currentState)
  if (remote.ok) {
    const local = deleteItemLocally(item, currentState)
    if (!local.ok) return local
  }
  return remote
}

export const itemForm = {
  columns: 10,
  errorMessage: '',
  fields: { /* eslint-disable perfectionist/sort-objects */
    name: createTextField({ columns: 5, isRequired: true, label: 'Name' }),
    brand: createTextField({ columns: 3, label: 'Brand' }),
    price: createTextField({ columns: 2, label: 'Price', regex: /^\d{1,5}$/u, unit: '€' }),
    // line
    details: createTextField({ columns: 5, label: 'Details', maxLength: 200 }),
    reference: createTextField({ columns: 3, isRequired: true, label: 'Reference', maxLength: 30, regex: /^[\w-]{3,50}$/u }),
    status: createSelectField({ columns: 2, label: 'Status', options: optionsFor('statuses'), value: 'bought' }),
    // line
    photo: createTextField({ columns: 5, label: 'Photo', regex: /^.+$/u }),
    box: createSelectField({ columns: 3, label: 'Box', options: optionsFor('boxes'), regex: /^[\p{L}\s&()]{3,100}$/u }),
    drawer: createSelectField({ columns: 2, label: 'Drawer', options: optionsFor('drawers'), regex: /\d/u }),
    // hidden
    barcode: createTextField({ isVisible: false, label: 'Barcode', maxLength: 30 }),
    isPrinted: createCheckboxField({ label: 'Printed', isVisible: false }),
    id: createTextField({ isVisible: false, label: 'Id' }),
  }, /* eslint-enable perfectionist/sort-objects */
  isTouched: false,
  isValid: false,
} as const satisfies Form

export function drawerStringToDrawer (drawer: string) {
  if (drawer === '') return -1
  const number = Number.parseInt(drawer, 10)
  if (Number.isNaN(number)) return -1
  return number
}

export function boxStringToBox (box: string) {
  // @ts-expect-error it's ok
  if (!itemBoxes.includes(box)) return ''
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  return box as Item['box']
}

export function formToItem (form: typeof itemForm) {
  const { barcode, box, brand, details, drawer, id, isPrinted, name, photo, price, reference, status } = form.fields
  return {
    ...emptyItem,
    '$id': id.value,
    'barcode': barcode.value,
    'box': boxStringToBox(box.value),
    'brand': brand.value,
    'details': details.value,
    'drawer': drawerStringToDrawer(drawer.value),
    'isPrinted': isPrinted.value,
    'name': name.value,
    'photos': photo.value === '' ? [] : [photo.value],
    'price': price.value === '' ? -1 : Number.parseFloat(price.value),
    'reference': reference.value,
    'status': statusStringToStatus(status.value),
  } satisfies Item
}

// eslint-disable-next-line max-statements
export function itemToForm (item?: Item) {
  if (item === undefined) return itemForm
  const form = clone(itemForm)
  form.fields.id.value = item.$id
  form.fields.name.value = item.name
  form.fields.brand.value = item.brand
  form.fields.details.value = item.details
  form.fields.reference.value = item.reference
  form.fields.barcode.value = item.barcode
  form.fields.status.value = item.status
  form.fields.box.value = item.box
  if (item.drawer > -1) form.fields.drawer.value = String(item.drawer)
  form.fields.photo.value = item.photos[0] ?? ''
  if (item.price > -1) form.fields.price.value = String(item.price)
  form.fields.isPrinted.value = item.isPrinted
  return form
}

/**
 * Converts an item to its corresponding location string.
 * @param input The item to get the location for
 * @returns The location string like 'Salon B 2'.
 */

export function itemToLocation (input: Item) {
  const box = (input.box.trim()[0] ?? '').toUpperCase()
  const room = capitalize(itemBoxToRoom(input.box) ?? '')
  if (box.length === 0) return room
  const drawer = (input.drawer < 0) ? '' : `‧${input.drawer}` // '‧2' or ''
  const details = input.box.split(' (')[1] // 'brico & sport)'
  const infos = details === undefined ? '' : ` (${details}` // ' (brico & sport)'
  return `${room}${room.length > 0 ? ' ' : ''}${box}${drawer} ${infos}`.trim().replace(/ {2,}/gu, ' ') // 'Salon G‧2 (brico & sport)' or 'Salon G‧2'
}

export function areItemsEquivalent (itemA: Item, itemB: Item) {
  return objectSum(removeAppWriteFields(itemA)) === objectSum(removeAppWriteFields(itemB))
}

export function isDataOlderThan (milliseconds: number, itemsTimestamp = state.itemsTimestamp) {
  if (!itemsTimestamp) return true
  const age = Date.now() - itemsTimestamp
  const minutes = Math.round(age / nbMsInMinute)
  /* c8 ignore next */
  if (minutes > 0 && !isTestEnvironment()) logger.info('last activity', minutes, 'minute(s) ago')
  return age >= milliseconds
}

export async function getItems (items = state.items, itemsTimestamp = state.itemsTimestamp) {
  if (items.length > 0 && !isDataOlderThan(nbMsInMinute, itemsTimestamp)) return Result.ok(`tasks are fresh (${readableTimeAgo(Date.now() - itemsTimestamp)})`)
  state.status = 'loading'
  const result = await getItemsRemotely()
  if (!result.ok) return result
  state.items = result.value // eslint-disable-line require-atomic-updates
  return Result.ok(`${result.value.length} items loaded ${coolAscii()}`)
}
