import Fuse, { type IFuseOptions } from 'fuse.js/min-basic'
import { route } from 'preact-router'
import { sanitize } from 'shuutils'
import { logger } from '../utils/logger.utils'
import type { Item } from '../utils/parsers.utils'
import { state } from '../utils/state.utils'

// https://fusejs.io/
export const fuseOptions: IFuseOptions<Item> = {
  distance: 200, // see the tip at https://fusejs.io/concepts/scoring-theory.html#scoring-theory
  /**
   * Function to get... ?
   * @param object the item
   * @param path the path
   * @returns a value ^^'
   */
  getFn: (object: Item, path: string | string[]) => {
    const value = Fuse.config.getFn(object, path)
    if (Array.isArray(value)) return value.map((element: string) => sanitize(element))
    if (typeof value === 'string') return [sanitize(value)]
    return value
  },
  ignoreLocation: true, // eslint-disable-line @typescript-eslint/naming-convention
  keys: [
    {
      name: 'name',
      weight: 4,
    }, {
      name: 'brand',
      weight: 2,
    }, {
      name: 'details',
      weight: 4,
    }, {
      name: 'category',
      weight: 1,
    },
  ], // this is not generic ^^"
  threshold: 0.35, // 0 is perfect match
}

export const maxNameLength = 20

/**
 * Search for an item
 * @param input the input search string to look for
 * @returns the header and the results
 */
export function search (input: string) {
  logger.debug('search, input', { input })
  const fuse = new Fuse(state.items, fuseOptions)
  const result = state.items.find(item => item.reference === input || item.barcode === input)
  if (result !== undefined) { route(`/item/details/${result.id}/single`); return { header: '', results: [] } }
  const results = fuse.search(sanitize(input)).map(item => item.item)
  const header = `${results.length} results found for “${input}”`
  return { header, results }
}
