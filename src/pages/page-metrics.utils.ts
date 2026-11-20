import { nbPercentMax } from 'shuutils'
import type { Item } from '../types/item.types'

export const topValueItems = 10

export const unknownBoxName = 'Unknown'

export type BoxAnalysis = Record<string, { count: number; totalValue: number }>

export type StatusCounts = Record<string, number>

export type MetricsData = ReturnType<typeof calculateMetrics>

export function calculateBasicMetrics(items: Item[]) {
  const totalItems = items.length
  const itemsWithPrice = items.filter(item => item.price > 0)
  const totalValue = itemsWithPrice.reduce((sum, item) => sum + item.price, 0)

  return {
    totalItems,
    totalValue,
  }
}

export function calculateStatusCounts(items: Item[]): StatusCounts {
  const statusCounts: StatusCounts = {}
  for (const item of items) statusCounts[item.status] = (statusCounts[item.status] || 0) + 1
  return statusCounts
}

export function calculateBoxAnalysis(items: Item[]): BoxAnalysis {
  const boxAnalysis: BoxAnalysis = {}
  for (const item of items) {
    const boxName = item.box || unknownBoxName
    if (!boxAnalysis[boxName]) boxAnalysis[boxName] = { count: 0, totalValue: 0 }
    boxAnalysis[boxName].count += 1
    if (item.price > 0) boxAnalysis[boxName].totalValue += item.price
  }
  return boxAnalysis
}

export function getTopValueItems(items: Item[]): Item[] {
  return items
    .filter(item => item.price > 0)
    .toSorted((itemA, itemB) => itemB.price - itemA.price)
    .slice(0, topValueItems)
}

export function getToGiveItems(items: Item[]) {
  return items.filter(item => item.status === 'to-give')
}

export function getItemsNotPrinted(items: Item[]): Item[] {
  return items.filter(item => !item.isPrinted)
}

export function getItemsWithoutLocation(items: Item[]): Item[] {
  return items.filter(item => !item.box)
}

export function getItemsWithoutPrice(items: Item[]): Item[] {
  return items.filter(item => item.price <= 0)
}

export function getItemsWithoutPhoto(items: Item[]): Item[] {
  return items.filter(item => !item.photos || item.photos.length === 0)
}

const photoUrlRegex = /^(?:https?:\/\/|data:)/u

// photos should be upload ids, a url means the photo was never uploaded to the bucket
export function getItemsWithPhotoUrl(items: Item[]): Item[] {
  return items.filter(item => Boolean(item.photos) && item.photos.some(photo => photoUrlRegex.test(photo)))
}

export type BoxSortCriteria = 'items' | 'name' | 'value'

export type BoxRow = {
  /** width of the bar in percent, never fully empty so every location stays visible */
  barPercent: number
  box: string
  count: number
  totalValue: number
}

const minBarPercent = 2

function compareBoxRows(rowA: Omit<BoxRow, 'barPercent'>, rowB: Omit<BoxRow, 'barPercent'>, criteria: BoxSortCriteria) {
  if (criteria === 'value' && rowA.totalValue !== rowB.totalValue) return rowB.totalValue - rowA.totalValue
  if (criteria === 'items' && rowA.count !== rowB.count) return rowB.count - rowA.count
  return rowA.box.localeCompare(rowB.box)
}

/**
 * Sort the storage locations and size their bars, by name the bar shows the number of items
 * @param boxAnalysis the items count and value of each location
 * @param criteria how to sort the locations, "name" is alphabetical, "value" and "items" are highest first
 * @returns the locations with the width of their bar
 */
export function sortBoxAnalysis(boxAnalysis: BoxAnalysis, criteria: BoxSortCriteria): BoxRow[] {
  const rows = Object.entries(boxAnalysis)
    .map(([box, data]) => ({ box, count: data.count, totalValue: data.totalValue }))
    .toSorted((rowA, rowB) => compareBoxRows(rowA, rowB, criteria))
  const measure = (row: Omit<BoxRow, 'barPercent'>) => (criteria === 'value' ? row.totalValue : row.count)
  const maxMeasure = Math.max(0, ...rows.map(row => measure(row)))
  return rows.map(row => ({ ...row, barPercent: maxMeasure === 0 ? minBarPercent : Math.max(minBarPercent, (measure(row) / maxMeasure) * nbPercentMax) }))
}

export function calculateAverageValue(totalValue: number, totalItems: number): number {
  if (totalItems === 0) return 0
  return totalValue / totalItems
}

export function calculateMetrics(items: Item[]) {
  const basicMetrics = calculateBasicMetrics(items)
  return {
    ...basicMetrics,
    averageValue: calculateAverageValue(basicMetrics.totalValue, basicMetrics.totalItems),
    boxAnalysis: calculateBoxAnalysis(items),
    itemsNotPrinted: getItemsNotPrinted(items),
    itemsToGive: getToGiveItems(items),
    itemsWithPhotoUrl: getItemsWithPhotoUrl(items),
    itemsWithoutLocation: getItemsWithoutLocation(items),
    itemsWithoutPhoto: getItemsWithoutPhoto(items),
    itemsWithoutPrice: getItemsWithoutPrice(items),
    topValueItems: getTopValueItems(items),
  }
}

export function formatCurrency(value: number): string {
  return `${Math.round(value)} €`
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0.0 %'
  return `${((value / total) * nbPercentMax).toFixed(1)} %`
}
