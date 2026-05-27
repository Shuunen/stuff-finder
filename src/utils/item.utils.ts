import { capitalize, clone, isTestEnvironment, nbMsInMinute, objectSum, Result, readableTimeAgo } from 'shuutils'
import { boxRooms, itemBoxes, itemDrawers, itemStatus } from '../constants'
import type { Item } from '../types/item.types'
import { addItemRemotely, deleteItemRemotely, getItemsRemotely, removeAppWriteFields, updateItemRemotely } from './database.utils'
import { createCheckboxField, createSelectField, createTextField, type Form } from './forms.utils'
import { logger } from './logger.utils'
import { state } from './state.utils'
import { coolAscii } from './strings.utils'

export const emptyItem = {
  $createdAt: '',
  $id: '',
  barcode: '',
  box: '',
  brand: '',
  details: '',
  drawer: -1,
  isPrinted: false,
  name: '',
  photos: [],
  price: -1,
  reference: '',
  status: 'bought',
} satisfies Item

export const letterBoxFormat = /^[A-Z] \(/u

export function itemBoxToRoom(box: Item['box']) {
  const isLetterBox = letterBoxFormat.test(box)
  const letter = box.at(0)
  if (letter === undefined) return undefined
  for (const [location, boxes] of Object.entries(boxRooms)) if (boxes.includes(isLetterBox ? letter : box)) return location as keyof typeof boxRooms
  return undefined
}

export function statusStringToStatus(status: string) {
  if (status === 'lost') return 'lost' satisfies Item['status']
  if (status === 'to-give') return 'to-give' satisfies Item['status']
  if (status === 'for-sell') return 'for-sell' satisfies Item['status']
  return 'bought' satisfies Item['status']
}

function valuesToOptions(values: ReadonlyArray<string>, addEmpty = false) {
  const options = values.map(value => ({ label: value, value }))
  if (addEmpty) options.unshift({ label: '', value: '' })
  return options
}

function deleteItemLocally(item: Item, currentState = state) {
  const items = clone(currentState.items)
  const index = items.findIndex(current => current.$id === item.$id)
  if (index === -1) return Result.error('item not found in state')
  items.splice(index, 1)
  currentState.items = items
  return Result.ok('item deleted locally')
}

function updateItemLocally(item: Item, currentState = state) {
  const items = clone(currentState.items)
  const index = items.findIndex(one => one.$id === item.$id)
  if (index === -1)
    items.push(item) // new item with id
  else items[index] = item // update existing item
  currentState.items = items
}

export async function addItem(item: Item, currentState = state) {
  const result = await addItemRemotely(item, currentState)
  /* v8 ignore if -- @preserve */
  if (result.ok) updateItemLocally({ ...result.value }, currentState)
  return result
}

/**
 * Updates an item both remotely (api) and locally (state)
 * @param item the item to update
 * @param currentState the current state, defaults to global state, useful for testing
 * @returns the result of the update operation
 */
export async function updateItem(item: Item, currentState = state) {
  const result = await updateItemRemotely(item, currentState)
  /* v8 ignore if -- @preserve */
  if (result.ok) updateItemLocally({ ...result.value }, currentState)
  return result
}

export async function deleteItem(item: Item, currentState = state) {
  const remote = await deleteItemRemotely(item, currentState)
  /* v8 ignore if -- @preserve */
  if (remote.ok) {
    const local = deleteItemLocally(item, currentState)
    if (!local.ok) return local
  }
  return remote
}

export const itemForm = {
  columns: 10,
  errorMessage: '',
  // oxlint-disable sort-keys
  fields: {
    name: createTextField({ columns: 5, isRequired: true, label: 'Name' }),
    brand: createTextField({ columns: 3, label: 'Brand' }),
    price: createTextField({ columns: 2, isRequired: true, label: 'Price', regex: /^\d{1,5}$/u, unit: '€' }),
    // line
    details: createTextField({ columns: 5, label: 'Details', maxLength: 200 }),
    reference: createTextField({
      columns: 3,
      isRequired: true,
      label: 'Reference',
      maxLength: 30,
      regex: /^[\w/-]{3,50}$/u,
    }),
    status: createSelectField({ columns: 2, label: 'Status', options: valuesToOptions(itemStatus), value: 'bought' }),
    // line
    photo: createTextField({ columns: 5, label: 'Photo', regex: /^.+$/u }),
    box: createSelectField({
      columns: 3,
      label: 'Box',
      options: valuesToOptions(itemBoxes, true),
      regex: /^[\p{L}\s&()]{3,100}$/u,
    }),
    drawer: createSelectField({
      columns: 2,
      label: 'Drawer',
      options: valuesToOptions(itemDrawers, true),
      regex: /\d/u,
    }),
    // hidden
    barcode: createTextField({ isVisible: false, label: 'Barcode', maxLength: 30 }),
    isPrinted: createCheckboxField({ isVisible: false, label: 'Printed' }),
    id: createTextField({ isVisible: false, label: 'Id' }),
  },
  // oxlint-enable sort-keys
  isTouched: false,
  isValid: false,
} as const satisfies Form

export function drawerStringToDrawer(drawer: string) {
  if (drawer === '') return -1
  const number = Number.parseInt(drawer, 10)
  if (Number.isNaN(number)) return -1
  return number
}

export function boxStringToBox(box: string) {
  // @ts-expect-error it's ok
  if (!itemBoxes.includes(box)) return ''
  return box as Item['box']
}

export function formToItem(form: typeof itemForm) {
  const { barcode, box, brand, details, drawer, id, isPrinted, name, photo, price, reference, status } = form.fields
  return {
    ...emptyItem,
    $createdAt: new Date().toISOString(),
    $id: id.value,
    barcode: barcode.value,
    box: boxStringToBox(box.value),
    brand: brand.value,
    details: details.value,
    drawer: drawerStringToDrawer(drawer.value),
    isPrinted: isPrinted.value,
    name: name.value,
    photos: photo.value === '' ? [] : [photo.value],
    price: price.value === '' ? -1 : Number.parseFloat(price.value),
    reference: reference.value,
    status: statusStringToStatus(status.value),
  } satisfies Item
}

export function itemToForm(item?: Item) {
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
  /* v8 ignore if -- @preserve */
  if (item.drawer > -1) form.fields.drawer.value = String(item.drawer)
  form.fields.photo.value = item.photos[0] ?? ''
  if (item.price > -1) form.fields.price.value = String(item.price)
  form.fields.isPrinted.value = item.isPrinted
  return form
}

/**
 * Formats a room-based box location (like "Salon", "Bureau")
 * @param boxTrimmed The trimmed box name
 * @param drawer The drawer number
 * @returns The formatted location string
 */
export function formatRoomBoxLocation(boxTrimmed: string, drawer: number) {
  const drawerSuffix = drawer && drawer > 0 ? `‧${drawer}` : ''
  return `${boxTrimmed}${drawerSuffix}`
}

/**
 * Formats a letter-based box location (like "A (apple)", "B (usb & audio)")
 * @param input The item to format
 * @param short Whether to return a short version of the location (without details)
 * @returns The formatted location string like "Salon G‧2 (bricolage & sport)" or "Salon G‧2"
 */
function formatLetterBoxLocation(input: Item, short = false) {
  const box = input.box.trim()[0]?.toUpperCase()
  /* v8 ignore next 5 -- @preserve */
  const room = short ? '' : capitalize(itemBoxToRoom(input.box) ?? '')
  const drawer = input.drawer && input.drawer > 0 ? `‧${input.drawer}` : '' // '‧2' or ''
  const details = input.box.split(' (').at(1) // 'bricolage & sport)'
  const infos = short || details === undefined ? '' : ` (${details}` // ' (bricolage & sport)'
  return `${room}${room.length > 0 ? ' ' : ''}${box}${drawer} ${infos}`.trim().replaceAll(/ {2,}/gu, ' ') // 'Salon G‧2 (bricolage & sport)' or 'Salon G‧2'
}

/**
 * Converts an item to its corresponding location string.
 * @param input The item to get the location for
 * @param short Whether to return a short version of the location (without details)
 * @returns The location string like 'Salon B 2'.
 */
export function itemToLocation(input: Item, short = false) {
  const boxTrimmed = input.box.trim()
  if (boxTrimmed.length === 0) return ''
  const isLetterBox = letterBoxFormat.test(boxTrimmed)
  if (isLetterBox) return formatLetterBoxLocation(input, short)
  return formatRoomBoxLocation(boxTrimmed, input.drawer)
}

export function areItemsEquivalent(itemA: Item, itemB: Item) {
  return objectSum(removeAppWriteFields(itemA)) === objectSum(removeAppWriteFields(itemB))
}

export function isDataOlderThan(milliseconds: number, itemsTimestamp = state.itemsTimestamp) {
  if (!itemsTimestamp) return true
  const age = Date.now() - itemsTimestamp
  const minutes = Math.round(age / nbMsInMinute)
  /* v8 ignore next -- @preserve */
  if (minutes > 0 && !isTestEnvironment()) logger.info('last activity', minutes, 'minute(s) ago')
  return age >= milliseconds
}

export async function getItems(items = state.items, itemsTimestamp = state.itemsTimestamp) {
  if (items.length > 0 && !isDataOlderThan(nbMsInMinute, itemsTimestamp)) return Result.ok(`tasks are fresh (${readableTimeAgo(Date.now() - itemsTimestamp)})`)
  state.status = 'loading'
  const result = await getItemsRemotely()
  if (!result.ok) return result
  state.items = result.value
  return Result.ok(`${result.value.length} items loaded ${coolAscii()}`)
}
