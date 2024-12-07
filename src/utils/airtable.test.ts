import { sleep } from 'shuutils'
import { expect, it } from 'vitest'
import { airtableRecordToItem, getAllItems, getItemFieldsToPush, getOneItem, isLocalAndRemoteSync } from './airtable.utils'
import { logger } from './logger.utils'
import { mockItem, mockRecord, mockState } from './mock.utils'
import type { Item, ItemPhoto } from './parsers.utils'

it('isLocalAndRemoteSync A is not in sync', () => {
  const record = mockRecord()
  const state = mockState()
  expect(isLocalAndRemoteSync([record], state)).toBe(false)
})

it('isLocalAndRemoteSync B is in sync (first match)', () => {
  const record = mockRecord()
  const items = [airtableRecordToItem(record)]
  const state = mockState({ items })
  expect(isLocalAndRemoteSync([record], state)).toBe(true)
})

it('isLocalAndRemoteSync C no records', () => {
  const state = mockState()
  expect(() => isLocalAndRemoteSync([], state)).toThrowErrorMatchingInlineSnapshot('[Error: remoteFirst is undefined]')
})

it('isLocalAndRemoteSync D is in sync (last match)', () => {
  const record = mockRecord()
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  const items = [undefined as unknown as Item, mockItem({ id: 'itemB', location: 'location B' }), airtableRecordToItem(record)]
  const state = mockState({ items })
  expect(isLocalAndRemoteSync([record], state)).toBe(true)
})

it('isLocalAndRemoteSync E first & last are undefined', () => {
  const record = mockRecord()
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  const items = [undefined as unknown as Item, mockItem({ id: 'itemB', location: 'location B' }), undefined as unknown as Item]
  const state = mockState({ items })
  expect(isLocalAndRemoteSync([record], state)).toBe(false)
})

it('airtableRecordToItem A', () => {
  const record = mockRecord()
  expect(airtableRecordToItem(record)).toMatchSnapshot()
})

it('getAllItems A no offset', async () => {
  let urlCalled = ''
  let nbCalls = 0
  const items = await getAllItems(undefined, async (url) => {
    urlCalled = url
    nbCalls += 1
    await sleep(1)
    return { records: [mockRecord()] }
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
    return { records: [mockRecord()] }
  })
  expect(items).toMatchSnapshot()
  expect(urlCalled).toMatchInlineSnapshot('"https://api.airtable.com/v0//?view=&offset=offset123&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc"') // base and table are still empty
  expect(nbCalls).toBe(1)
})

it('getAllItems C error result', async () => {
  logger.disable()
  await expect(async () => getAllItems(undefined, async () => {
    await sleep(1)
    return { records: [{}] }
  })).rejects.toThrowErrorMatchingInlineSnapshot('[Error: failed to fetch item, issue(s) : Invalid type: Expected string but received undefined, Invalid type: Expected Object but received undefined, Invalid type: Expected string but received undefined]')
  logger.enable()
})


it('getItemFieldsToPush A item ISO with state, no fields to push', () => {
  const item = mockItem()
  const state = mockState({ items: [item] })
  const fields = getItemFieldsToPush(item, state)
  expect(fields).toMatchInlineSnapshot('{}')
})

it('getItemFieldsToPush B item updated, some fields to push', () => {
  const item = mockItem({ status: 'acheté' })
  const state = mockState({ items: [item] })
  const updatedItem = mockItem({ status: 'donné' })
  const fields = getItemFieldsToPush(updatedItem, state)
  expect(fields).toMatchInlineSnapshot(`
    {
      "status": "donné",
    }
  `)
})

it('getItemFieldsToPush C item updated with also photo & price', () => {
  const url = 'https://picsum.photos/seed/123/200/200'
  const item = mockItem()
  const state = mockState({ items: [item] })
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  const updatedItem = mockItem({ photo: [{ url } as ItemPhoto], price: 42, status: 'donné' })
  const fields = getItemFieldsToPush(updatedItem, state)
  expect(fields.photo?.[0]?.url).toBe(url)
  expect(fields.price).toBe(42)
  expect(fields.status).toBe('donné')
})

it('getItemFieldsToPush D item not found locally', () => {
  const item = mockItem({ id: 'not found' })
  const state = mockState({ items: [mockItem({ id: '1' })] })
  expect(() => getItemFieldsToPush(item, state)).toThrowErrorMatchingInlineSnapshot('[Error: existing item not found locally]')
})


it('getOneItem A success result', async () => {
  let urlCalled = ''
  let nbCalls = 0
  const recordA = mockRecord(undefined, { 'reference': '', 'updated-on': '' })
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

it('getOneItem B error result', async () => {
  logger.disable()
  await expect(async () => getOneItem('rec123', async () => {
    await sleep(1)
    return { id: 'malformed-item' }
  })).rejects.toThrowErrorMatchingInlineSnapshot('[Error: failed to fetch item, issue(s) : Invalid type: Expected string but received undefined, Invalid type: Expected Object but received undefined]')
  logger.enable()
})
