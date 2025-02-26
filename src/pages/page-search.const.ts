import type { IFuseOptions } from 'fuse.js/basic'
import { route } from 'preact-router'
import { sanitize } from 'shuutils'
import type { Item } from '../types/item.types'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

// https://fusejs.io/
const fuseOptions = {
  distance: 200, // see the tip at https://fusejs.io/concepts/scoring-theory.html#scoring-theory
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
    },
  ], // this is not generic ^^"
  threshold: 0.35, // 0 is perfect match
} satisfies IFuseOptions<Item>

export const maxNameLength = 20

/**
 * Search for an item
 * @param input the input search string to look for
 * @returns the header and the results
 */
export async function search (input: string) {
  logger.info('search, input', { input }) // eslint-disable-next-line @typescript-eslint/naming-convention
  const { default: Fuse } = await import('fuse.js/basic')
  const fuse = new Fuse(state.items, fuseOptions)
  const result = state.items.find(item => item.reference === input || item.barcode === input)
  if (result !== undefined) { route(`/item/details/${result.$id}/single`); return { header: '', results: [] } }
  const results = fuse.search(sanitize(input)).map((item) => item.item)
  const header = `${results.length} results found for “${sanitize(input)}”`
  return { header, results }
}
