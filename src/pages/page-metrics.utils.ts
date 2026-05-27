import { nbPercentMax } from 'shuutils'
import type { Item } from '../types/item.types'

export const topValueItems = 10

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
    const boxName = item.box || 'Unknown'
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

export function calculateMetrics(items: Item[]) {
  return {
    ...calculateBasicMetrics(items),
    boxAnalysis: calculateBoxAnalysis(items),
    itemsNotPrinted: getItemsNotPrinted(items),
    itemsToGive: getToGiveItems(items),
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
