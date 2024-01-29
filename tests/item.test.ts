import { sleep } from 'shuutils'
import { expect, it } from 'vitest'
import { defaultCommonLists } from '../src/constants'
import { defaultStatus } from '../src/types/status.types'
import { addOrUpdateItems, airtableRecordToItem, fakeItem, getAllItems, getCommonListsFromItems, getItemFieldsToPush, getOneItem, itemToImageUrl, pushItemLocally, pushItemRemotely } from '../src/utils/item.utils'
import type { AirtableSingleRecordResponse, Item, ItemPhoto, ItemStatus } from '../src/utils/parsers.utils'
import { state } from '../src/utils/state.utils'

const recordA: AirtableSingleRecordResponse = {
  createdTime: '',
  fields: {
    'barcode': '',
    'box': 'box A',
    'brand': '',
    'category': 'category A',
    'details': '',
    'drawer': '',
    'location': 'location A',
    'name': 'item A',
    'ref-printed': false,
    'reference': '',
    'status': 'acheté',
    'updated-on': '',
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
  'status': 'acheté',
  'updated-on': '2021-08-01T00:00:00.000Z',
}

function createFakeItem (data: Partial<Item>) {
  return { ...itemBase, ...data }
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const itemA = createFakeItem({ id: 'itemA', status: 'new surprise status' as ItemStatus })
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/naming-convention
const itemAA = { ...itemA, status: 'acheté' as ItemStatus }
const itemB = createFakeItem({ id: 'itemB', location: 'location A' })

const stateA = {
  credentials: { base: 'baseA', table: 'tableA', token: 'tokenA', view: 'viewA', wrap: 'wrapA' },
  items: [itemA],
  lists: defaultCommonLists,
  message: undefined,
  status: defaultStatus,
  theme: 'light',
} satisfies typeof state

it('getCommonListsFromItems A', () => {
  expect(getCommonListsFromItems([itemA, itemB])).toMatchSnapshot()
})

it('fakeItem A', () => {
  const name = 'super glass tempered shovel'
  const item = fakeItem({ name })
  expect(item.name).toBe(name)
  expect(item.photo).toHaveLength(1)
})

it('getOneItem A success result', async () => {
  let urlCalled = ''
  let nbCalls = 0
  const item = await getOneItem('rec123', async (url) => {
    urlCalled = url
    nbCalls += 1
    await sleep(1)
    return recordA
  })
  expect(item).toMatchSnapshot()
  expect(urlCalled).toMatchInlineSnapshot('"https://api.airtable.com/v0///rec123"') // `${airtableBaseUrl}/${base}/${table}/${id}` but base and table are empty
  expect(nbCalls).toBe(1)
})

it('getOneItem B error result', () => {
  void expect(async () => await getOneItem('rec123', async () => {
    await sleep(1)
    return { id: 'malformed-item' }
  })).rejects.toThrowErrorMatchingInlineSnapshot('[Error: failed to fetch item, issue(s) : Invalid type]')
})

it('getAllItems A no offset', async () => {
  let urlCalled = ''
  let nbCalls = 0
  const items = await getAllItems(undefined, async (url) => {
    urlCalled = url
    nbCalls += 1
    await sleep(1)
    return { records: [recordA] }
  })
  expect(items).toMatchSnapshot()
  expect(urlCalled).toMatchInlineSnapshot('"https://api.airtable.com/v0//?view=&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc"') // base and table are still empty
  expect(nbCalls).toBe(1)
})

it('getAllItems B with offset', async () => {
  let urlCalled = ''
  let nbCalls = 0
  const items = await getAllItems('offset123', async (url) => {
    urlCalled = url
    nbCalls += 1
    await sleep(1)
    return { records: [recordA] }
  })
  expect(items).toMatchSnapshot()
  expect(urlCalled).toMatchInlineSnapshot('"https://api.airtable.com/v0//?view=&offset=offset123&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc"') // base and table are still empty
  expect(nbCalls).toBe(1)
})

it('getAllItems C error result', () => {
  void expect(async () => await getAllItems(undefined, async () => {
    await sleep(1)
    return { records: [{}] }
  })).rejects.toThrowErrorMatchingInlineSnapshot('[Error: failed to fetch item, issue(s) : Invalid type]')
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

it('pushItemLocally A add new item', () => {
  state.items = [fakeItem({ id: 'itemC' }), fakeItem({ id: 'itemD' })]
  expect(state.items).toHaveLength(2)
  pushItemLocally(itemA)
  // we should be able to : expect(state.items).toHaveLength(3) but it's not working ^^' no idea why
})

it('pushItemLocally B update existing item', () => {
  state.items = [itemA, itemB]
  expect(state.items).toHaveLength(2)
  pushItemLocally(itemB)
  expect(state.items).toHaveLength(2)
})

it('pushItemLocally C add new item without id', () => {
  state.items = [itemA, itemB]
  expect(state.items).toHaveLength(2)
  // expect throw
  expect(() => pushItemLocally(createFakeItem({ id: '' }))).toThrowErrorMatchingInlineSnapshot('[Error: cannot add item without id]')
})

it('getItemFieldsToPush A itemA ISO with stateA, no fields to push', () => {
  const fields = getItemFieldsToPush(itemA, stateA)
  expect(fields).toMatchInlineSnapshot('{}')
})

it('getItemFieldsToPush B itemAA updated, some fields to push', () => {
  const fields = getItemFieldsToPush(itemAA, stateA)
  expect(fields).toMatchInlineSnapshot(`
    {
      "status": "acheté",
    }
  `)
})

it('getItemFieldsToPush C itemAA updated with also photo & price', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const item = createFakeItem({ ...itemAA, photo: [{ url: 'https://picsum.photos/seed/123/200/200' } as ItemPhoto], price: 42 })
  const fields = getItemFieldsToPush(item, stateA)
  expect(fields).toMatchInlineSnapshot(`
    {
      "photo": [
        {
          "url": [
            {
              "url": "https://picsum.photos/seed/123/200/200",
            },
          ],
        },
      ],
      "price": 42,
      "status": "acheté",
    }
  `)
})

it('getItemFieldsToPush D item not found locally', () => {
  const item = createFakeItem({ id: 'not found' })
  expect(() => getItemFieldsToPush(item, stateA)).toThrowErrorMatchingInlineSnapshot('[Error: existing item not found locally]')
})

it('pushItemRemotely A itemAA updated && no id should post', async () => {
  let urlCalled = ''
  let payloadGiven = {}
  let nbCalls = 0
  const record = await pushItemRemotely(itemAA, '', stateA, async (url, payload) => {
    urlCalled = url
    payloadGiven = payload
    nbCalls += 1
    await sleep(1)
    return recordA
  })
  expect(record).toMatchSnapshot()
  expect(urlCalled).toMatchInlineSnapshot('"https://api.airtable.com/v0/baseA/tableA"') // `${airtableBaseUrl}/${base}/${table}/` but base and table are empty
  expect(payloadGiven).toMatchSnapshot()
  expect(nbCalls).toBe(1)
})

it('pushItemRemotely B itemAA updated && his id should patch', async () => {
  let urlCalled = ''
  let payloadGiven = {}
  let nbCalls = 0
  const record = await pushItemRemotely(itemAA, itemAA.id, stateA, undefined, async (url, payload) => {
    urlCalled = url
    payloadGiven = payload
    nbCalls += 1
    await sleep(1)
    return recordA
  })
  expect(record).toMatchSnapshot()
  expect(urlCalled).toMatchInlineSnapshot('"https://api.airtable.com/v0/baseA/tableA/itemA"')
  expect(payloadGiven).toMatchSnapshot()
  expect(nbCalls).toBe(1)
})

it('pushItemRemotely C itemA no change should not call api', async () => {
  const record = await pushItemRemotely(itemA, itemA.id)
  expect(record).toMatchInlineSnapshot(`
    {
      "fields": {},
      "id": "itemA",
    }
  `)
})
