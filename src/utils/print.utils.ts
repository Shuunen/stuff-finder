/* c8 ignore next */
import type { Item } from './parsers.utils'

/**
 * Generate a name from an item
 * @param item - the item to generate the name from
 * @returns the generated name
 */
function itemToPrintText (item: Item) {
  return [item.name, item.brand, item.details]
    .join(' ')
    .replace(/\s{2,}/gu, ' ')
    .trim()
}

/**
 * Get a reference or barcode from an item
 * @param item - the item to generate the code from
 * @returns the generated code like '123456'
 */
function itemToPrintCode (item: Item) {
  const reference = item.reference.trim()
  if (reference.length > 0) return reference
  const barcode = item.barcode.trim()
  if (barcode.length > 0) return barcode
  return ''
}

/**
 * Get a print location from an item
 * @param input the item
 * @returns the location
 */
function itemToPrintLocation (input: Item) {
  const box = (input.box.trim()[0] ?? '').toUpperCase()
  if (box.length === 0) return input.location
  const drawer = (input.drawer[0] ?? '').toUpperCase()
  return `${box}${drawer}`.trim()
}

/**
 * Get print data from item
 * @param item the item
 * @returns the data
 */
export function itemToPrintData (item: Item) {
  return {
    location: itemToPrintLocation(item),
    text: itemToPrintText(item),
    value: itemToPrintCode(item),
  }
}

