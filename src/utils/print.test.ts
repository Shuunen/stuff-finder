import { expect, it } from 'vitest'
import { emptyItemPhoto } from '../constants'
import { mockItem } from './mock.utils'
import { itemToPrintData } from './print.utils'

const itemA = mockItem({
  barcode: '  barcode',
  box: ' box ',
  brand: 'brand',
  details: 'details',
  drawer: '2',
  id: '1234567',
  location: 'location',
  name: 'name',
  reference: 'reference  ',
})

const itemB = mockItem({
  barcode: '  barcode',
  box: ' ',
  brand: 'brand',
  details: 'details',
  drawer: '',
  id: '1234567',
  location: '',
  name: 'name',
  photo: [{ ...emptyItemPhoto, url: 'https://picsum.photos/seed/1234567/200/200' }],
  reference: '',
})

it('itemToPrintData text A', () => { expect(itemToPrintData(itemA).text).toEqual('name brand details') })
it('itemToPrintData text B', () => { expect(itemToPrintData({ ...itemA, name: '  ' }).text).toEqual('brand details') })
it('itemToPrintData text C', () => { expect(itemToPrintData({ ...itemA, brand: '  ' }).text).toEqual('name details') })

it('itemToPrintData value A', () => { expect(itemToPrintData(itemA).value).toEqual('reference') })
it('itemToPrintData value B', () => { expect(itemToPrintData({ ...itemA, reference: '  ' }).value).toEqual('barcode') })
it('itemToPrintData value C', () => { expect(itemToPrintData({ ...itemA, barcode: '  ', reference: '  ' }).value).toEqual('') })
it('itemToPrintData value D', () => { expect(itemToPrintData(itemB).value).toEqual('barcode') })

it('itemToPrintData location A', () => { expect(itemToPrintData({ ...itemA, box: 'A', drawer: '4' }).location).toEqual('A4') })
it('itemToPrintData location B', () => { expect(itemToPrintData({ ...itemA, box: 'A', drawer: '' }).location).toEqual('A') })
it('itemToPrintData location C', () => { expect(itemToPrintData({ ...itemA, box: '', drawer: '4' }).location).toEqual('location') })
it('itemToPrintData location D', () => { expect(itemToPrintData({ ...itemA, box: '', drawer: '' }).location).toEqual('location') })
it('itemToPrintData location E', () => { expect(itemToPrintData({ ...itemA, box: 'A', drawer: '4', location: 'Salon' }).location).toEqual('A4') })
it('itemToPrintData location F', () => { expect(itemToPrintData({ ...itemA, box: 'A', drawer: '', location: 'Salon' }).location).toEqual('A') })
it('itemToPrintData location G', () => { expect(itemToPrintData({ ...itemA, box: '', drawer: '4', location: 'Salon' }).location).toEqual('Salon') })
it('itemToPrintData location H', () => { expect(itemToPrintData(itemA).location).toEqual('B2') })
it('itemToPrintData location I', () => { expect(itemToPrintData({ ...itemA, box: '', drawer: '', location: '' }).location).toEqual('') })
it('itemToPrintData location J', () => { expect(itemToPrintData(itemB).location).toEqual('') })

it('itemToPrintData A', () => { expect(itemToPrintData(itemA)).toMatchSnapshot() })
it('itemToPrintData B', () => { expect(itemToPrintData(itemB)).toMatchSnapshot() })
