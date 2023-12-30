import { clone, slugify } from 'shuutils'
import { emptyCommonLists, emptyItem, emptyItemPhoto } from '../constants'
import type { Item } from '../types/item.types'
import type { AirtableRecord } from '../types/requests.types'
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

export function fakeItem (name: string) {
  return {
    ...emptyItem,
    id: slugify(name),
    name,
    photo: [{ ...emptyItemPhoto, url: `https://picsum.photos/seed/${name}/200/200` }],
  } satisfies Item
}
