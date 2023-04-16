import { expect, it } from 'vitest'
import { ItemStatus, type AirtableRecord, type Item } from '../src/types'
import { airtableRecordToItem, getCommonListsFromItems } from '../src/utils/item.utils'

const recordA: AirtableRecord = {
  id: 'rec123',
  fields: {
    name: 'item A',
    location: 'location A',
    box: 'box A',
    category: 'category A',
  },
}

it('airtableRecordToItem A', () => {
  expect(airtableRecordToItem(recordA)).toMatchSnapshot()
})

const itemBase: Item = {
  'id': 'rec234',
  'box': 'box B',
  'category': 'category B',
  'barcode': 'barcode B',
  'brand': 'brand B',
  'details': 'details B',
  'location': 'location B',
  'drawer': 'drawer B',
  'name': 'name B',
  'reference': 'reference B',
  'ref-printed': false,
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

