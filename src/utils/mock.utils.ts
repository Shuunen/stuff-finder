/* eslint-disable jsdoc/require-jsdoc */
import { nbDaysInWeek, sleep } from 'shuutils'
import { vi } from 'vitest'
import { defaultCommonLists } from '../constants'
import type { Item, ItemModel } from '../types/item.types'
import { defaultSound } from '../types/sounds.types'
import { defaultStatus } from '../types/status.types'
import { defaultTheme } from '../types/theme.types'
import type { State } from './state.utils'

export function mockItem (data: Partial<Item> = {}) {
  return {
    '$id': 'rec234',
    'barcode': 'barcode B',
    'box': 'B (usb & audio)',
    'brand': 'brand B',
    'details': 'details B',
    'drawer': 2,
    'isPrinted': false,
    'name': 'name B',
    'photos': ['some-uuid', 'https://some.url/to/image.jpg'],
    'price': 42,
    'reference': 'reference B',
    'status': 'bought',
    ...data,
  } satisfies Item
}

export function mockItemModel (data: Partial<ItemModel> = {}) {
  return {
    ...mockItem(),
    '$collectionId': 'col234',
    '$createdAt': '2020-03-01T00:00:00.000Z',
    '$databaseId': 'db234',
    '$permissions': [],
    '$updatedAt': '2021-08-01T00:00:00.000Z',
    'box': 'B (usb & audio)',
    'drawer': 2,
    ...data,
  } satisfies ItemModel
}

export function mockState (data: Partial<State> = {}) {
  return {
    credentials: { bucketId: 'bucketA', collectionId: 'collectionA', databaseId: 'databaseA', wrap: 'wrapA' },
    display: 'list',
    items: [] satisfies Item[],
    itemsTimestamp: Date.now(),
    lists: defaultCommonLists,
    sound: defaultSound,
    status: defaultStatus,
    theme: defaultTheme,
    ...data,
  } satisfies State
}

export const mockFetch = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
  await sleep(nbDaysInWeek) // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  return ({
    blob: async () => {
      await sleep(nbDaysInWeek)
      return { input, options }
    },
  }) as unknown as Promise<Response>
})
