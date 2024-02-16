/* eslint-disable max-lines */
import { clone, sleep } from 'shuutils'
import { expect, it } from 'vitest'
import { addOrUpdateItems, airtableRecordToItem, areItemsEquivalent, deleteItem, formToItem, getAllItems, getCommonListsFromItems, getItemFieldsToPush, getOneItem, isLocalAndRemoteSync, itemForm, itemToForm, itemToImageUrl, pushItem } from '../src/utils/item.utils'
import { mockItem, mockRecord, mockState } from '../src/utils/mock.utils'
import type { Item, ItemPhoto, ItemStatus } from '../src/utils/parsers.utils'

const recordA = mockRecord(undefined, { 'reference': '', 'updated-on': '' })

it('airtableRecordToItem A', () => {
  expect(airtableRecordToItem(recordA)).toMatchSnapshot()
})

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const itemA = mockItem({ id: 'itemA', status: 'new surprise status' as ItemStatus })
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/naming-convention
const itemAA = { ...itemA, status: 'acheté' as ItemStatus }
const itemB = mockItem({ id: 'itemB', location: 'location A' })

const stateA = mockState({ items: [itemA] })

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
  })).rejects.toThrowErrorMatchingInlineSnapshot('[Error: failed to fetch item, issue(s) : Invalid type: Expected string but received undefined, Invalid type: Expected Object but received undefined]')
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
  })).rejects.toThrowErrorMatchingInlineSnapshot('[Error: failed to fetch item, issue(s) : Invalid type: Expected string but received undefined, Invalid type: Expected Object but received undefined, Invalid type: Expected string but received undefined]')
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
  const state = mockState({ items: [mockItem({ id: '1' })] })
  expect(() => getItemFieldsToPush(item, state)).toThrowErrorMatchingInlineSnapshot('[Error: existing item not found locally]')
})

it('pushItem A item with no id should post remotely & push locally', async () => {
  let urlCalled = ''
  let payloadGiven = {}
  let nbCalls = 0
  const item = mockItem({ id: '' })
  const state = mockState({ items: [mockItem({ id: '1' }), mockItem({ id: '2' })] })
  expect(state.items).toHaveLength(2)
  const result = await pushItem(item, state, async (url, payload) => {
    urlCalled = url
    payloadGiven = payload
    nbCalls += 1
    await sleep(1)
    return mockRecord('freshly-created')
  })
  expect(result.success).toBe(true) // should be a success to have added the item remotely & locally
  expect(result).toMatchSnapshot()
  expect(state.items).toHaveLength(3) // because we just added a new item, the number of items should increase
  expect(urlCalled).toMatchInlineSnapshot('"https://api.airtable.com/v0/baseA/tableA"') // `${airtableBaseUrl}/${base}/${table}/` but base and table are empty
  expect(payloadGiven).toMatchSnapshot()
  expect(nbCalls).toBe(1)
})

it('pushItem B item with id should patch remotely & update locally', async () => {
  let urlCalled = ''
  let payloadGiven = {}
  let nbCalls = 0
  const id = 'existing'
  const item = mockItem({ details: 'new details', id })
  const state = mockState({ items: [mockItem({ id: 'another' }), mockItem({ id })] })
  expect(state.items).toHaveLength(2)
  const result = await pushItem(item, state, undefined, async (url, payload) => {
    urlCalled = url
    payloadGiven = payload
    nbCalls += 1
    await sleep(1)
    return mockRecord(id) // because record has been updated, we return a record with the same id
  })
  expect(result.success).toBe(true) // should be a success to have updated the item remotely & locally
  expect(result).toMatchSnapshot()
  expect(state.items).toHaveLength(2) // because we just updated an existing item, the number of items should not change
  expect(urlCalled).toMatchInlineSnapshot('"https://api.airtable.com/v0/baseA/tableA/existing"')
  expect(payloadGiven).toMatchSnapshot()
  expect(nbCalls).toBe(1)
})

it('pushItem C itemA with no change should not call api', async () => {
  const item = mockItem({ id: '1' })
  const state = mockState({ items: [item, mockItem({ id: '2' })] }) // here item in state is the same as item
  const result = await pushItem(item, state)
  expect(result.success).toBe(false) // no change, so no call to the api
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

it('deleteItem A delete an item in state', async () => {
  let urlCalled = ''
  let nbCalls = 0
  const result = await deleteItem(itemAA.id, stateA, async (url) => {
    urlCalled = url
    nbCalls += 1
    await sleep(1)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { deleted: true, id: itemAA.id }
  })
  expect(result).toMatchSnapshot()
  expect(urlCalled).toMatchInlineSnapshot('"https://api.airtable.com/v0/baseA/tableA/itemA"') // `${airtableBaseUrl}/${base}/${table}/` but base and table are empty
  expect(nbCalls).toBe(1)
})

it('deleteItem B delete an item not in state', () => {
  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention, unused-imports/no-unused-vars, unicorn/consistent-function-scoping
  async function deleteMethodMock (_url: string) {
    await sleep(1) // eslint-disable-next-line @typescript-eslint/naming-convention
    return { deleted: true, id: itemB.id }
  }
  void expect(async () => await deleteItem(itemB.id, stateA, deleteMethodMock))
    .rejects.toThrowErrorMatchingInlineSnapshot('[Error: item not found in state]')
})

it('areItemsEquivalent A should be equivalent', () => {
  const itemLeft = mockItem({ id: 'same' })
  const itemRight = mockItem({ id: 'same' })
  expect(areItemsEquivalent(itemLeft, itemRight)).toBe(true)
})

it('areItemsEquivalent B should be equivalent because we dont check id', () => {
  const itemLeft = mockItem({ id: 'same' })
  const itemRight = mockItem({ id: 'different' })
  expect(areItemsEquivalent(itemLeft, itemRight)).toBe(true)
})

it('areItemsEquivalent C should not be equivalent', () => {
  const itemLeft = mockItem({ id: 'same' })
  const itemRight = mockItem({ id: 'different', name: 'something else' })
  expect(areItemsEquivalent(itemLeft, itemRight)).toBe(false)
})

it('areItemsEquivalent D should not be equivalent because of photo', () => {
  const itemLeft = mockItem({ id: 'same' })
  const itemRight = mockItem({ id: 'same', photo: [] })
  expect(areItemsEquivalent(itemLeft, itemRight)).toBe(false)
})

it('itemToForm A mocked item', () => {
  const item = mockItem({ id: 'itemToForm-A' })
  const form = itemToForm(item)
  expect(form).toMatchSnapshot()
})

it('itemToForm B mocked item without photo', () => {
  const item = mockItem({ id: 'itemToForm-B', photo: undefined })
  const form = itemToForm(item)
  expect(form.fields.photo.value).toBe('')
})

it('itemToForm C no item', () => {
  const form = itemToForm()
  expect(form).toMatchSnapshot()
})
