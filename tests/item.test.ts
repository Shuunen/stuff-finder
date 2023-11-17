import { expect, it } from 'vitest'
import { ItemStatus, type AirtableRecord, type Item } from '../src/types'
import { airtableRecordToItem, fakeItem, getCommonListsFromItems } from '../src/utils/item.utils'

const recordA: AirtableRecord = {
  fields: {
    box: 'box A',
    category: 'category A',
    location: 'location A',
    name: 'item A',
  },
  id: 'rec123',
}

it('airtableRecordToItem A', () => {
  expect(airtableRecordToItem(recordA)).toMatchSnapshot()
})

const itemBase: Item = {
  'barcode': 'barcode B',
  'box': 'box B',
  'brand': 'brand B',
  'category': 'category B',
  'details': 'details B',
  'drawer': 'drawer B',
  'id': 'rec234',
  'location': 'location B',
  'name': 'name B',
  'ref-printed': false,
  'reference': 'reference B',
  'status': ItemStatus.Acheté,
  'updated-on': '2021-08-01T00:00:00.000Z',
}

function createFakeItem (data: Partial<Item>) {
  return { ...itemBase, ...data }
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const itemA = createFakeItem({ id: 'itemA', status: 'new surprise status' as ItemStatus })
const itemB = createFakeItem({ id: 'itemB', location: 'location A' })

it('getCommonListsFromItems A', () => {
  expect(getCommonListsFromItems([itemA, itemB])).toMatchSnapshot()
})

it('fakeItem A', () => {
  const name = 'super glass tempered shovel'
  const item = fakeItem(name)
  expect(item.name).toBe(name)
  expect(item.photo).toHaveLength(1)
})
