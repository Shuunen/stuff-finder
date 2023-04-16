import { clone } from 'shuutils'
import { emptyCommonLists, emptyItem } from '../constants'
import type { AirtableRecord, Item } from '../types'
import { sortListsEntries } from './objects.utils'

function shouldAddToList (value = '', list: string[] = []) {
  return value.length > 0 && !list.includes(value)
}

export function airtableRecordToItem (record: AirtableRecord) {
  return {
    ...emptyItem,
    ...record.fields,
    id: record.id,
  }
}

export function getCommonListsFromItems (items: Item[]) {
  let list = clone(emptyCommonLists)
  items.forEach(item => {
    if (shouldAddToList(item.location, list.locations)) list.locations.push(item.location)
    if (shouldAddToList(item.box, list.boxes)) list.boxes.push(item.box)
    if (shouldAddToList(item.status, list.statuses)) list.statuses.push(item.status)
    if (shouldAddToList(item.category, list.categories)) list.categories.push(item.category)
  })
  list = sortListsEntries(list)
  return list
}

