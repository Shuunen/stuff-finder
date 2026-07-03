import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { alignForSnap, clone, nbMsInMinute, Result, sleep } from 'shuutils'
import { databaseMock } from './database.mock'
import { removeAppWriteFields } from './database.utils'
import { mockFetch } from './fetch.mock'
import { addItem, areItemsEquivalent, boxStringToBox, deleteItem, drawerStringToDrawer, formToItem, getItems, isDataOlderThan, itemBoxToRoom, itemForm, itemToForm, itemToLocation, statusStringToStatus, updateItem } from './item.utils'
import { logger } from './logger.utils'
import { mockItem, mockState } from './mock.utils'

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register()

// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock('appwrite', () => databaseMock.appwrite)

globalThis.fetch = mockFetch

describe('item.utils', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    databaseMock.reset()
  })

  it('mockItem A', () => {
    const name = 'super glass tempered shovel'
    const item = mockItem({ name })
    expect(item.name).toBe(name)
    expect(item.photos).toHaveLength(2)
  })

  it('addItem A should create remotely & push locally', async () => {
    const item = mockItem({ $id: '' })
    const state = mockState({ items: [mockItem({ $id: '1' }), mockItem({ $id: '2' })] })
    expect(state.items).toHaveLength(2)
    const result = await addItem(item, state)
    expect(result.ok).toBe(true) // should be a success to have added the item remotely & locally
    expect(result).toMatchSnapshot()
    expect(databaseMock.createRow).toHaveBeenNthCalledWith(1, {
      data: removeAppWriteFields(item),
      databaseId: 'databaseA',
      rowId: 'reference-b',
      tableId: 'collectionA',
    })
    expect(state.items).toHaveLength(3) // because we just added a new item, the number of items should increase
  })

  it('updateItem A should update remotely & update locally', async () => {
    const item1 = mockItem({ $id: '1' })
    const item2 = mockItem({ $id: '2' })
    const state = mockState({ items: [item1, item2] })
    expect(state.items).toHaveLength(2)
    const result = await updateItem(item1, state)
    expect(result.ok).toBe(true) // should be a success to have updated the item remotely & locally
    expect(result).toMatchSnapshot()
    expect(databaseMock.updateRow).toHaveBeenNthCalledWith(1, {
      data: removeAppWriteFields(item1),
      databaseId: 'databaseA',
      rowId: '1',
      tableId: 'collectionA',
    })
    expect(state.items).toHaveLength(2) // because we just updated an existing item, the number of items should not change
  })

  it('formToItem A default itemForm', () => {
    const item = formToItem(itemForm)
    expect(alignForSnap(item)).toMatchSnapshot()
    expect(item.photos).toHaveLength(0)
  })

  it('formToItem B itemForm with some values', () => {
    const form = clone(itemForm)
    const url = 'https://photos.org/200/200'
    form.fields.price.value = '42'
    form.fields.photo.value = url
    const item = formToItem(form)
    expect(alignForSnap(item)).toMatchSnapshot()
    expect(item.price).toBe(42)
    expect(item.photos).toHaveLength(1)
    expect(item.photos[0]).toMatchInlineSnapshot(`"https://photos.org/200/200"`)
  })

  it('deleteItem A delete an item in state', async () => {
    logger.disable()
    const itemA = mockItem({ $id: 'itemA' })
    const stateA = mockState({ items: [itemA, mockItem({ $id: 'itemB' })] })
    const result = await deleteItem(itemA, stateA)
    expect(result.ok).toBe(true)
    expect(databaseMock.deleteRow).toHaveBeenNthCalledWith(1, {
      databaseId: 'databaseA',
      rowId: 'itemA',
      tableId: 'collectionA',
    })
    expect(JSON.stringify(Result.unwrap(result).value)).toMatchInlineSnapshot(`"{"$databaseId":"databaseA","$id":"itemA","$tableId":"collectionA","isThisMockedDataFromMock":true}"`)
    logger.enable()
  })

  it('deleteItem B delete an item not in state', async () => {
    logger.disable()
    const itemA = mockItem({ $id: 'itemA' })
    const itemB = mockItem({ $id: 'non-existing-id' })
    const stateA = mockState({ items: [itemA] })
    expect(stateA.items).toHaveLength(1)
    const result = await deleteItem(itemB, stateA)
    const { error } = Result.unwrap(result)
    expect(result.ok).toBe(false)
    expect(error).toMatchInlineSnapshot(`"item not found in state"`)
    expect(stateA.items).toHaveLength(1)
    expect(databaseMock.deleteRow).toHaveBeenNthCalledWith(1, {
      databaseId: 'databaseA',
      rowId: 'non-existing-id',
      tableId: 'collectionA',
    })
    logger.enable()
  })

  it('areItemsEquivalent A should be equivalent', () => {
    const itemLeft = mockItem({ $id: 'same' })
    const itemRight = mockItem({ $id: 'same' })
    expect(areItemsEquivalent(itemLeft, itemRight)).toBe(true)
  })

  it('areItemsEquivalent B should be equivalent because we dont check id', () => {
    const itemLeft = mockItem({ $id: 'same' })
    const itemRight = mockItem({ $id: 'different' })
    expect(areItemsEquivalent(itemLeft, itemRight)).toBe(true)
  })

  it('areItemsEquivalent C should not be equivalent', () => {
    const itemLeft = mockItem({ $id: 'same' })
    const itemRight = mockItem({ $id: 'different', name: 'something else' })
    expect(areItemsEquivalent(itemLeft, itemRight)).toBe(false)
  })

  it('areItemsEquivalent D should not be equivalent because of photo', () => {
    const itemLeft = mockItem({ $id: 'same' })
    const itemRight = mockItem({ $id: 'same', photos: [] })
    expect(areItemsEquivalent(itemLeft, itemRight)).toBe(false)
  })

  it('itemToForm A mocked item', () => {
    const item = mockItem({ $id: 'itemToForm-A' })
    const form = itemToForm(item)
    expect(form).toMatchSnapshot()
  })

  it('itemToForm B mocked item without photo', () => {
    const item = mockItem({ $id: 'itemToForm-B', photos: [] })
    const form = itemToForm(item)
    expect(form.fields.photo.value).toBe('')
  })

  it('itemToForm C no item', () => {
    const form = itemToForm()
    expect(form).toMatchSnapshot()
  })

  it('itemToForm D no price', () => {
    const item = mockItem({ price: -1 })
    const form = itemToForm(item)
    expect(form.fields.price.value).toBe('')
  })

  it('itemToForm E with price', () => {
    const item = mockItem({ price: 42 })
    const form = itemToForm(item)
    expect(form.fields.price.value).toBe('42')
  })

  it('itemToLocation A complete data', () => {
    expect(itemToLocation(mockItem())).toMatchInlineSnapshot(`"Entrée B‧2 (usb & audio)"`)
  })

  it('itemToLocation B no box', () => {
    const item = mockItem({ box: '' })
    expect(itemToLocation(item)).toMatchInlineSnapshot(`""`)
  })

  it('itemToLocation C partial box without details', () => {
    // @ts-expect-error for testing purposes
    const item = mockItem({ box: 'G' })
    expect(itemToLocation(item)).toMatchInlineSnapshot(`"G‧2"`)
  })

  it('itemToLocation D no drawer', () => {
    const item = mockItem({ box: 'S (sdb)', drawer: -1 })
    expect(itemToLocation(item)).toMatchInlineSnapshot(`"Salle de bain S (sdb)"`)
  })

  it('itemToLocation E room box', () => {
    const item = mockItem({ box: 'Salon', drawer: 2 })
    expect(itemToLocation(item)).toMatchInlineSnapshot(`"Salon‧2"`)
  })

  it('itemToLocation F room box no drawer', () => {
    const item = mockItem({ box: 'Salon', drawer: -1 })
    expect(itemToLocation(item)).toMatchInlineSnapshot(`"Salon"`)
  })

  it('itemBoxToRoom A', () => {
    expect(itemBoxToRoom('A (apple)')).toMatchInlineSnapshot(`"entrée"`)
  })
  it('itemBoxToRoom B', () => {
    // @ts-expect-error for testing purposes
    expect(itemBoxToRoom('zz')).toMatchInlineSnapshot(`undefined`)
  })
  it('itemBoxToRoom C', () => {
    expect(itemBoxToRoom('C (couteau)')).toMatchInlineSnapshot(`"salon"`)
  })
  it('itemBoxToRoom D empty box', () => {
    expect(itemBoxToRoom('')).toMatchInlineSnapshot(`undefined`)
  })
  it('itemBoxToRoom E room box', () => {
    expect(itemBoxToRoom('Salon')).toMatchInlineSnapshot(`"salon"`)
  })

  it('statusStringToStatus A lost', () => {
    expect(statusStringToStatus('lost')).toMatchInlineSnapshot(`"lost"`)
  })
  it('statusStringToStatus B bought', () => {
    expect(statusStringToStatus('bought')).toMatchInlineSnapshot(`"bought"`)
  })
  it('statusStringToStatus C to-give', () => {
    expect(statusStringToStatus('to-give')).toMatchInlineSnapshot(`"to-give"`)
  })
  it('statusStringToStatus D for-sell', () => {
    expect(statusStringToStatus('for-sell')).toMatchInlineSnapshot(`"for-sell"`)
  })
  it('statusStringToStatus E unhandled status', () => {
    expect(statusStringToStatus('hehe')).toMatchInlineSnapshot(`"bought"`)
  })

  it('drawerStringToDrawer A valid', () => {
    expect(drawerStringToDrawer('2')).toBe(2)
  })
  it('drawerStringToDrawer B empty', () => {
    expect(drawerStringToDrawer('')).toBe(-1)
  })
  it('drawerStringToDrawer C NaN', () => {
    expect(drawerStringToDrawer('hehe')).toBe(-1)
  })

  it('boxStringToBox A valid', () => {
    expect(boxStringToBox('A (apple)')).toMatchInlineSnapshot(`"A (apple)"`)
  })
  it('boxStringToBox B invalid', () => {
    expect(boxStringToBox('hehe')).toBe('')
  })

  it('isDataOlderThan A', () => {
    expect(isDataOlderThan(0, 0), 'data is considered older if time 0').toBe(true)
  })

  it('isDataOlderThan B', async () => {
    const timestamp = Date.now()
    await sleep(100)
    expect(isDataOlderThan(50, timestamp), 'data is older than 50ms after waiting 100ms').toBe(true)
  })

  it('isDataOlderThan C', async () => {
    const timestamp = Date.now()
    await sleep(50)
    expect(isDataOlderThan(100, timestamp), 'data is not older than 100ms after waiting 50ms').toBe(false)
  })

  it('isDataOlderThan D 2 minutes older than 1 minute', () => {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000
    expect(isDataOlderThan(nbMsInMinute, twoMinutesAgo)).toBe(true)
  })

  it('getItems A items empty, items not fresh => fetch successful', async () => {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000
    const result = await getItems([], twoMinutesAgo)
    const { error, value } = Result.unwrap(result)
    expect(error).toBeUndefined()
    expect(value?.includes('0 items loaded')).toBe(true)
    expect(databaseMock.listRows).toHaveBeenNthCalledWith(1, {
      databaseId: '',
      queries: [
        { isThisMockedDataFromMock: true, limit: 100 },
        { isThisMockedDataFromMock: true, offset: 0 },
      ],
      tableId: '',
    })
  })

  it('getItems B items empty, items fresh => fetch successful', async () => {
    const twoMsAgo = Date.now() - 2
    const result = await getItems([], twoMsAgo)
    const { error, value } = Result.unwrap(result)
    expect(error).toBeUndefined()
    expect(value?.includes('0 items loaded')).toBe(true)
    expect(databaseMock.listRows).toHaveBeenNthCalledWith(1, {
      databaseId: '',
      queries: [
        { isThisMockedDataFromMock: true, limit: 100 },
        { isThisMockedDataFromMock: true, offset: 0 },
      ],
      tableId: '',
    })
  })

  it('getItems C items not empty, items not fresh => fetch successful', async () => {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000
    const result = await getItems([mockItem()], twoMinutesAgo)
    const { error, value } = Result.unwrap(result)
    expect(error).toBeUndefined()
    expect(value?.includes('0 items loaded')).toBe(true)
    expect(databaseMock.listRows).toHaveBeenNthCalledWith(1, {
      databaseId: '',
      queries: [
        { isThisMockedDataFromMock: true, limit: 100 },
        { isThisMockedDataFromMock: true, offset: 0 },
      ],
      tableId: '',
    })
  })

  it('getItems D items not empty, items not fresh => fetch failed', async () => {
    databaseMock.listRows.mockRejectedValueOnce(new Error('some error'))
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000
    const result = await getItems([mockItem()], twoMinutesAgo)
    const { error } = Result.unwrap(result)
    expect(error).toMatchInlineSnapshot(`[Error: some error]`)
    expect(databaseMock.listRows).toHaveBeenNthCalledWith(1, {
      databaseId: '',
      queries: [
        { isThisMockedDataFromMock: true, limit: 100 },
        { isThisMockedDataFromMock: true, offset: 0 },
      ],
      tableId: '',
    })
  })

  it('getItems E items not empty, items fresh => no fetch', async () => {
    const twoMsAgo = Date.now() - 2
    const result = await getItems([mockItem()], twoMsAgo)
    const { error, value } = Result.unwrap(result)
    expect(error).toBeUndefined()
    expect(value).toMatchInlineSnapshot(`"tasks are fresh (now)"`)
    expect(databaseMock.listRows).not.toHaveBeenCalled()
  })

  it('getItems F offline with cached items => return cache, no fetch', async () => {
    vi.stubGlobal('navigator', { onLine: false })
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000
    const result = await getItems([mockItem()], twoMinutesAgo)
    const { error, value } = Result.unwrap(result)
    expect(error).toBeUndefined()
    expect(value).toBe('offline — 1 cached items available')
    expect(databaseMock.listRows).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('getItems G offline with no cached items => error, no fetch', async () => {
    vi.stubGlobal('navigator', { onLine: false })
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000
    const result = await getItems([], twoMinutesAgo)
    const { error } = Result.unwrap(result)
    expect(error).toMatchInlineSnapshot(`"offline and no cached items available"`)
    expect(databaseMock.listRows).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
