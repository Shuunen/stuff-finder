/* c8 ignore next */
import type { Item } from './parsers.utils'

/**
 * Generate a name from an item
 * @param item
 * @returns the generated name
 */
function itemToPrintText (item: Item) {
  return [item.name, item.brand, item.details]
    .join(' ')
    .replace(/\s{2,}/gu, ' ')
    .trim()
}

function itemToPrintCode (item: Item) {
  const reference = item.reference.trim()
  if (reference.length > 0) return reference
  const barcode = item.barcode.trim()
  if (barcode.length > 0) return barcode
  return ''
}

function itemToPrintLocation (input: Item) {
  const box = (input.box.trim()[0] ?? '').toUpperCase()
  if (box.length === 0) return input.location
  const drawer = (input.drawer[0] ?? '').toUpperCase()
  return `${box}${drawer}`.trim()
}

export function itemToPrintData (item: Item) {
  return {
    location: itemToPrintLocation(item),
    text: itemToPrintText(item),
    value: itemToPrintCode(item),
  }
}

