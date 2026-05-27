import type { Item } from '../types/item.types'
import { mockItem } from '../utils/mock.utils'
import {
  calculateBasicMetrics,
  calculateBoxAnalysis,
  calculateMetrics,
  calculateStatusCounts,
  formatCurrency,
  formatPercentage,
  getItemsNotPrinted,
  getItemsWithoutLocation,
  getItemsWithoutPhoto,
  getItemsWithoutPrice,
  getToGiveItems,
  getTopValueItems,
} from './page-metrics.utils'

const mockItems: Item[] = [
  mockItem({
    $id: '1',
    box: 'A (apple)',
    brand: 'Apple',
    details: 'iPhone 12',
    isPrinted: true,
    name: 'iPhone 12',
    price: 500,
    reference: 'IP12',
    status: 'bought',
  }),
  mockItem({
    $id: '2',
    box: 'B (usb & audio)',
    brand: 'Sony',
    details: 'Wireless headphones',
    isPrinted: false,
    name: 'WH-1000XM4',
    price: 300,
    reference: 'WH1000XM4',
    status: 'for-sell',
  }),
  mockItem({
    $id: '3',
    box: 'A (apple)',
    brand: 'Apple',
    details: 'iPad Pro',
    isPrinted: true,
    name: 'iPad Pro',
    price: 0, // No price
    reference: 'IPADPRO',
    status: 'bought',
  }),
  mockItem({
    $id: '4',
    box: '',
    brand: '',
    details: 'Old cable',
    isPrinted: false,
    name: 'USB Cable',
    photos: [], // No photos
    price: -1, // Invalid price
    reference: 'USBCABLE',
    status: 'lost',
  }),
  mockItem({
    $id: '5',
    box: 'C (couteau)',
    brand: 'Generic',
    details: 'Power cable',
    isPrinted: true,
    name: 'Power Cable',
    photos: undefined, // No photos
    price: 10,
    reference: 'POWERCABLE',
    status: 'bought',
  }),
]

describe('page-metrics.utils', () => {
  it('calculateBasicMetrics A should calculate correct basic metrics', () => {
    const result = calculateBasicMetrics(mockItems)

    expect(result).toMatchInlineSnapshot(`
      {
        "totalItems": 5,
        "totalValue": 810,
      }
    `)
  })

  it('calculateStatusCounts A should count items by status correctly', () => {
    const result = calculateStatusCounts(mockItems)

    expect(result).toMatchInlineSnapshot(`
      {
        "bought": 3,
        "for-sell": 1,
        "lost": 1,
      }
    `)
  })

  it('calculateBoxAnalysis A should analyze box distribution correctly', () => {
    const result = calculateBoxAnalysis(mockItems)
    expect(result).toMatchSnapshot()
  })

  it('getTopValueItems A should return top valued items', () => {
    const result = getTopValueItems(mockItems)
    expect(result).toMatchSnapshot()
  })

  it('calculateMetrics A should return complete metrics object', () => {
    const result = calculateMetrics(mockItems)
    expect(result.totalItems).toMatchInlineSnapshot(`5`)
    expect(result.totalValue).toMatchInlineSnapshot(`810`)
    expect(result.topValueItems, 'topValueItems length').toHaveLength(3)
    expect(Object.keys(result.boxAnalysis), 'boxAnalysis length').toHaveLength(4)
    expect(Object.keys(result.statusCounts), 'statusCounts length').toHaveLength(3)
  })

  it('formatCurrency A should format currency correctly', () => {
    expect(formatCurrency(100)).toMatchInlineSnapshot(`"100 €"`)
    expect(formatCurrency(99.99)).toMatchInlineSnapshot(`"100 €"`)
    expect(formatCurrency(0)).toMatchInlineSnapshot(`"0 €"`)
  })

  it('formatPercentage A should format percentage correctly', () => {
    expect(formatPercentage(50, 100)).toMatchInlineSnapshot(`"50.0 %"`)
    expect(formatPercentage(1, 3)).toMatchInlineSnapshot(`"33.3 %"`)
    expect(formatPercentage(0, 0)).toMatchInlineSnapshot(`"0.0 %"`)
    expect(formatPercentage(0, 100)).toMatchInlineSnapshot(`"0.0 %"`)
  })

  it('calculateBasicMetrics B should handle empty array', () => {
    const result = calculateBasicMetrics([])
    expect(result).toMatchInlineSnapshot(`
      {
        "totalItems": 0,
        "totalValue": 0,
      }
    `)
  })

  it('calculateStatusCounts B should handle empty array', () => {
    const result = calculateStatusCounts([])

    expect(result).toMatchInlineSnapshot(`{}`)
  })

  it('getTopValueItems B should handle items without prices', () => {
    const itemsWithoutPrices: Item[] = [
      mockItem({
        $id: '1',
        name: 'Item 1',
        price: 0,
        reference: 'REF1',
        status: 'bought',
      }),
    ]
    const result = getTopValueItems(itemsWithoutPrices)
    expect(result).toMatchInlineSnapshot(`[]`)
  })

  it('getToGiveItemsCount A should return 0 when no items have to-give status', () => {
    const result = getToGiveItems(mockItems)
    expect(result).toMatchInlineSnapshot(`[]`)
  })

  it('getToGiveItemsCount B should count items with to-give status', () => {
    const itemsWithToGive = [
      mockItem({
        $id: '1',
        name: 'Item to give 1',
        reference: 'GIVE1',
        status: 'to-give',
      }),
      mockItem({
        $id: '2',
        name: 'Item to give 2',
        reference: 'GIVE2',
        status: 'to-give',
      }),
      mockItem({
        $id: '3',
        name: 'Item not to give',
        reference: 'NOGIVE',
        status: 'bought',
      }),
    ]
    const result = getToGiveItems(itemsWithToGive)
    expect(result).toMatchSnapshot()
  })

  it('getItemsNotPrinted A should return items that are not printed', () => {
    const result = getItemsNotPrinted(mockItems)

    expect(result.map(item => item.$id)).toMatchInlineSnapshot(`
      [
        "2",
        "4",
      ]
    `)
  })

  it('getItemsWithoutLocation A should return items without box location', () => {
    const result = getItemsWithoutLocation(mockItems)

    expect(result.map(item => item.$id)).toMatchInlineSnapshot(`
      [
        "4",
      ]
    `)
  })

  it('getItemsWithoutPrice A should return items without valid price', () => {
    const result = getItemsWithoutPrice(mockItems)

    expect(result.map(item => item.$id)).toMatchInlineSnapshot(`
      [
        "3",
        "4",
      ]
    `)
  })

  it('getItemsWithoutPhoto A should return items without photos', () => {
    const result = getItemsWithoutPhoto(mockItems)

    expect(result.map(item => item.$id)).toMatchInlineSnapshot(`
      [
        "4",
        "5",
      ]
    `)
  })

  it('calculateMetrics B should include new list properties', () => {
    const result = calculateMetrics(mockItems)

    expect(result.itemsNotPrinted).toHaveLength(2)
    expect(result.itemsWithoutLocation).toHaveLength(1)
    expect(result.itemsWithoutPhoto).toHaveLength(2)
    expect(result.itemsWithoutPrice).toHaveLength(2)
    expect(result.itemsNotPrinted[0]?.$id).toMatchInlineSnapshot(`"2"`)
    expect(result.itemsWithoutLocation[0]?.$id).toMatchInlineSnapshot(`"4"`)
    expect(result.itemsWithoutPhoto[0]?.$id).toMatchInlineSnapshot(`"4"`)
    expect(result.itemsWithoutPrice[0]?.$id).toMatchInlineSnapshot(`"3"`)
  })
})
