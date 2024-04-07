/* eslint-disable functional/no-let */
import { sleep } from 'shuutils'
import { expect, it } from 'vitest'
import { airtableRecordToItem, getAllItems, getItemFieldsToPush, isLocalAndRemoteSync } from '../src/utils/airtable.utils'
import { mockItem, mockRecord, mockState } from '../src/utils/mock.utils'
import type { Item, ItemPhoto } from '../src/utils/parsers.utils'

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
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const items = [undefined as unknown as Item, mockItem({ id: 'itemB', location: 'location B' }), airtableRecordToItem(record)]
  const state = mockState({ items })
  expect(isLocalAndRemoteSync([record], state)).toBe(true)
})

it('isLocalAndRemoteSync E first & last are undefined', () => {
  const record = mockRecord()
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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

it('getAllItems C error result', () => {
  void expect(async () => await getAllItems(undefined, async () => {
    await sleep(1)
    return { records: [{}] }
  })).rejects.toThrowErrorMatchingInlineSnapshot('[Error: failed to fetch item, issue(s) : Invalid type: Expected string but received undefined, Invalid type: Expected Object but received undefined, Invalid type: Expected string but received undefined]')
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
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
