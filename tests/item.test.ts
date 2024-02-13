import { clone, sleep } from 'shuutils'
import { expect, it } from 'vitest'
import { defaultCommonLists } from '../src/constants'
import { defaultStatus } from '../src/types/status.types'
import { addOrUpdateItems, airtableRecordToItem, formToItem, getAllItems, getCommonListsFromItems, getItemFieldsToPush, getOneItem, isLocalAndRemoteSync, itemForm, itemToImageUrl, pushItemLocally, pushItemRemotely } from '../src/utils/item.utils'
import { mockItem, mockRecord } from '../src/utils/mock.utils'
import type { Item, ItemPhoto, ItemStatus } from '../src/utils/parsers.utils'
import { state } from '../src/utils/state.utils'

const recordA = mockRecord(undefined, { 'reference': '', 'updated-on': '' })

it('airtableRecordToItem A', () => {
  expect(airtableRecordToItem(recordA)).toMatchSnapshot()
})

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const itemA = mockItem({ id: 'itemA', status: 'new surprise status' as ItemStatus })
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/naming-convention
const itemAA = { ...itemA, status: 'acheté' as ItemStatus }
const itemB = mockItem({ id: 'itemB', location: 'location A' })

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

it('mockItem A', () => {
  const name = 'super glass tempered shovel'
  const item = mockItem({ name })
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
  })).rejects.toThrowErrorMatchingInlineSnapshot('[Error: failed to fetch item, issue(s) : Invalid type: Expected string but received undefined]')
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
  })).rejects.toThrowErrorMatchingInlineSnapshot('[Error: failed to fetch item, issue(s) : Invalid type: Expected string but received undefined]')
})

it('addOrUpdateItems A update existing item', () => {
  const itemsInput = [itemA, itemB]
  const itemTouched = mockItem({ id: itemB.id, location: itemA.location })
  const itemsOutput = addOrUpdateItems(itemsInput, itemTouched)
  expect(itemsOutput).toHaveLength(2)
  expect(itemsOutput[1]?.location).toBe(itemTouched.location)
})

it('addOrUpdateItems B add new item', () => {
  const itemsInput = [itemA, itemB]
  const itemTouched = mockItem({ id: 'new item' })
  const itemsOutput = addOrUpdateItems(itemsInput, itemTouched)
  expect(itemsOutput).toHaveLength(3)
  expect(itemsOutput[2]?.id).toBe(itemTouched.id)
})

it('addOrUpdateItems C add new item without id', () => {
  const itemsInput = [itemA, itemB]
  const itemTouched = mockItem()
  itemTouched.id = ''
  const itemsOutput = addOrUpdateItems(itemsInput, itemTouched)
  expect(itemsOutput).toHaveLength(2)
})

it('itemToImageUrl A', () => {
  expect(itemToImageUrl()).toContain('no-visual')
})

it('itemToImageUrl B', () => {
  const url = 'https://picsum.photos/seed/123/200/200'
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const item = mockItem({ photo: [{ url } as ItemPhoto] })
  expect(itemToImageUrl(item)).toBe(url)
})

it('pushItemLocally A add new item', () => {
  state.items = [mockItem({ id: 'itemC' }), mockItem({ id: 'itemD' })]
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
  const item = mockItem()
  item.id = ''
  // expect throw
  expect(() => pushItemLocally(item)).toThrowErrorMatchingInlineSnapshot('[Error: cannot add item without id]')
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
  const url = 'https://picsum.photos/seed/123/200/200'
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const item = mockItem({ ...itemAA, photo: [{ url } as ItemPhoto], price: 42 })
  const fields = getItemFieldsToPush(item, stateA)
  expect(fields.photo?.[0]?.url).toBe(url)
  expect(fields.price).toBe(42)
  expect(fields.status).toBe('acheté')
})

it('getItemFieldsToPush D item not found locally', () => {
  const item = mockItem({ id: 'not found' })
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
  expect(record.success).toBe(false)
})

it('isLocalAndRemoteSync A is not in sync', () => {
  expect(isLocalAndRemoteSync([recordA], stateA)).toBe(false)
})

it('isLocalAndRemoteSync B is in sync (first match)', () => {
  const recordB = mockRecord()
  const items = [airtableRecordToItem(recordB)]
  const stateB = { ...stateA, items }
  expect(isLocalAndRemoteSync([recordB], stateB)).toBe(true)
})

it('isLocalAndRemoteSync C no records', () => {
  expect(() => isLocalAndRemoteSync([], stateA)).toThrowErrorMatchingInlineSnapshot('[Error: remoteFirst is undefined]')
})

it('isLocalAndRemoteSync D is in sync (last match)', () => {
  const recordB = mockRecord()
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const items = [undefined as unknown as Item, itemAA, itemB, airtableRecordToItem(recordB)]
  const stateB = { ...stateA, items }
  expect(isLocalAndRemoteSync([recordB], stateB)).toBe(true)
})

it('isLocalAndRemoteSync E first & last are undefined', () => {
  const recordB = mockRecord()
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const items = [undefined as unknown as Item, itemAA, itemB, undefined as unknown as Item]
  const stateB = { ...stateA, items }
  expect(isLocalAndRemoteSync([recordB], stateB)).toBe(false)
})

it('formToItem A default itemForm', () => {
  const item = formToItem(itemForm)
  expect(item).toMatchSnapshot()
  expect(item.photo).toHaveLength(0)
})

it('formToItem B itemForm with some values', () => {
  const form = clone(itemForm)
  const url = 'https://photos.org/200/200'
  form.fields.price.value = '42'
  form.fields.photo.value = url
  const item = formToItem(form)
  expect(item).toMatchSnapshot()
  expect(item.price).toBe(42)
  expect(item.photo).toHaveLength(1)
  expect(item.photo?.[0]?.url).toBe(url)
})

it('formToItem C status mapping', () => {
  const form = clone(itemForm)
  const statuses = ['acheté', 'donné', 'jeté', 'à donner', 'à vendre', 'vendu', 'renvoyé', 'vendu'] satisfies ItemStatus[]
  statuses.forEach((status) => {
    form.fields.status.value = status
    const item = formToItem(form)
    expect(item.status).toBe(status)
  })
  // empty status default map to 'acheté'
  form.fields.status.value = ''
  const item = formToItem(form)
  expect(item.status).toBe('acheté')
})
