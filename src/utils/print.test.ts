import { mockItem } from './mock.utils'
import { itemToPrintData } from './print.utils'

const itemA = mockItem({
  $id: '1234567',
  barcode: '  barcode',
  brand: 'brand',
  details: 'details',
  name: 'name',
  reference: 'reference  ',
})

const itemB = mockItem({
  $id: '1234567',
  barcode: '  barcode',
  box: '',
  brand: 'brand',
  details: 'details',
  drawer: -1,
  name: 'name',
  photos: ['1234567'],
  reference: '',
})

describe('itemToPrintData text', () => {
  it('A full item', () => {
    expect(itemToPrintData(itemA).text).toBe('name brand details')
  })
  it('B no name', () => {
    expect(itemToPrintData({ ...itemA, name: '  ' }).text).toBe('brand details')
  })
  it('C no brand', () => {
    expect(itemToPrintData({ ...itemA, brand: '  ' }).text).toBe('name details')
  })
})

describe('itemToPrintData value', () => {
  it('A uses reference', () => {
    expect(itemToPrintData(itemA).value).toBe('reference')
  })
  it('B no reference falls back to barcode', () => {
    expect(itemToPrintData({ ...itemA, reference: '  ' }).value).toBe('barcode')
  })
  it('C no reference and no barcode', () => {
    expect(itemToPrintData({ ...itemA, barcode: '  ', reference: '  ' }).value).toBe('')
  })
  it('D itemB uses barcode', () => {
    expect(itemToPrintData(itemB).value).toBe('barcode')
  })
  it('E itemB no barcode', () => {
    expect(itemToPrintData({ ...itemB, barcode: '' }).value).toBe('')
  })
})

describe('itemToPrintData location', () => {
  it('A with box and drawer', () => {
    expect(itemToPrintData({ ...itemA, box: 'A (apple)', drawer: 4 }).location).toMatchInlineSnapshot(`"A‧4"`)
  })
  it('B with box no drawer', () => {
    expect(itemToPrintData({ ...itemA, box: 'A (apple)', drawer: -1 }).location).toBe('A')
  })
  it('C no box with drawer', () => {
    expect(itemToPrintData({ ...itemA, box: '', drawer: 4 }).location).toBe('')
  })
  it('D no box no drawer', () => {
    expect(itemToPrintData({ ...itemA, box: '', drawer: -1 }).location).toBe('')
  })
  it('E with box and drawer again', () => {
    expect(itemToPrintData({ ...itemA, box: 'A (apple)', drawer: 4 }).location).toMatchInlineSnapshot(`"A‧4"`)
  })
  it('F with box no valid drawer', () => {
    expect(itemToPrintData({ ...itemA, box: 'A (apple)', drawer: -1 }).location).toBe('A')
  })
  it('G empty box with drawer', () => {
    expect(itemToPrintData({ ...itemA, box: '', drawer: 4 }).location).toBe('')
  })
  it('H no box implies no location', () => {
    expect(itemToPrintData(itemA).location).toMatchInlineSnapshot(`"B‧2"`)
  })
  it('I empty box no drawer', () => {
    expect(itemToPrintData({ ...itemA, box: '', drawer: -1 }).location).toBe('')
  })
  it('J itemB has empty location', () => {
    expect(itemToPrintData(itemB).location).toBe('')
  })
  it('K box room with drawer', () => {
    expect(itemToPrintData(mockItem({ box: 'Salon', drawer: 3 })).location).toMatchInlineSnapshot(`"Salon‧3"`)
  })
  it('L box room no drawer', () => {
    expect(itemToPrintData(mockItem({ box: 'Salon', drawer: undefined })).location).toMatchInlineSnapshot(`"Salon"`)
  })
})

describe('itemToPrintData snapshot', () => {
  it('A full item', () => {
    expect(itemToPrintData(itemA)).toMatchSnapshot()
  })
  it('B minimal item', () => {
    expect(itemToPrintData(itemB)).toMatchSnapshot()
  })
})
