import { emptyItemPhoto } from '../constants'
import type { AirtableSingleRecordResponse, Item } from './parsers.utils'

export function mockRecord (id = 'rec123', fields: Partial<AirtableSingleRecordResponse['fields']> = {}) {
  return {
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
      'reference': 'reference-a',
      'status': 'acheté',
      'updated-on': '2022-12-26T15:42:00.000Z',
      ...fields,
    },
    id,
  } satisfies AirtableSingleRecordResponse
}

export function mockItem (data: Partial<Item> = {}) {
  const item: Item = {
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
    ...data,
  } satisfies Item
  item.photo = (item.photo !== undefined && (item.photo.length > 0)) ? item.photo : [{ ...emptyItemPhoto, url: `https://picsum.photos/seed/${item.name}/200/200` }]
  return item
}
