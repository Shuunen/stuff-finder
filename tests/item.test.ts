import { expect, it } from 'vitest' // eslint-disable-line @typescript-eslint/no-shadow
import { ItemStatus, type Item, type ItemPhoto } from '../src/types/item.types'
import type { AirtableSingleRecordResponse } from '../src/types/requests.types'
import { addOrUpdateItems, airtableRecordToItem, fakeItem, getCommonListsFromItems, getOneItem, itemToImageUrl } from '../src/utils/item.utils'

const recordA: AirtableSingleRecordResponse = {
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

it('getOneItem A', async () => {
  const item = await getOneItem('rec123')
  expect(item).toMatchSnapshot()
})

it('addOrUpdateItems A update existing item', () => {
  const itemsInput = [itemA, itemB]
  const itemTouched = createFakeItem({ id: itemB.id, location: itemA.location })
  const itemsOutput = addOrUpdateItems(itemsInput, itemTouched)
  expect(itemsOutput).toHaveLength(2)
  expect(itemsOutput[1]?.location).toBe(itemTouched.location)
})

it('addOrUpdateItems B add new item', () => {
  const itemsInput = [itemA, itemB]
  const itemTouched = createFakeItem({ id: 'new item' })
  const itemsOutput = addOrUpdateItems(itemsInput, itemTouched)
  expect(itemsOutput).toHaveLength(3)
  expect(itemsOutput[2]?.id).toBe(itemTouched.id)
})

it('addOrUpdateItems C add new item without id', () => {
  const itemsInput = [itemA, itemB]
  const itemTouched = createFakeItem({ id: '' })
  const itemsOutput = addOrUpdateItems(itemsInput, itemTouched)
  expect(itemsOutput).toHaveLength(2)
})

it('itemToImageUrl A', () => {
  expect(itemToImageUrl()).toContain('no-visual')
})

it('itemToImageUrl B', () => {
  const url = 'https://picsum.photos/seed/123/200/200'
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const item = createFakeItem({ photo: [{ url } as ItemPhoto] })
  expect(itemToImageUrl(item)).toBe(url)
})
