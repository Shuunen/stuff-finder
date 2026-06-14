/**
 * Migration from localStorage (≤ v3.1) to IndexedDB (≥ v3.2).
 *
 * These functions can be deleted once the user base has fully migrated,
 * approximately a few months after the v3.2 release (target: late 2026).
 */

import { safeParse } from 'valibot'
import { logger } from '../utils/logger.utils'
import { itemsSchema } from '../utils/parsers.utils'
import { db } from './db'

const lsPrefix = 'stuff-finder_'
const legacyKeys = ['credentials', 'display', 'items', 'itemsTimestamp', 'theme'] as const

function readLegacyKey(lsKey: string): string | undefined {
  const raw = globalThis.localStorage.getItem(lsPrefix + lsKey)
  return raw ?? undefined
}

function parseLegacyJson(lsKey: string): unknown {
  const raw = readLegacyKey(lsKey)
  if (raw === undefined) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

function clearLegacyKeys(): void {
  for (const lsKey of legacyKeys) globalThis.localStorage.removeItem(lsPrefix + lsKey)
}

export async function migrateFromLocalStorage(): Promise<void> {
  const hasLegacyData = legacyKeys.some(lsKey => globalThis.localStorage.getItem(lsPrefix + lsKey) !== null)
  if (hasLegacyData)
    try {
      const rawItems = parseLegacyJson('items')
      const itemsResult = rawItems === undefined ? undefined : safeParse(itemsSchema, rawItems)
      const items = itemsResult?.success ? itemsResult.output : []
      const rawTimestamp = parseLegacyJson('itemsTimestamp')
      const itemsTimestamp = typeof rawTimestamp === 'number' ? rawTimestamp : 0
      const credentials = parseLegacyJson('credentials')
      const display = parseLegacyJson('display')
      const theme = parseLegacyJson('theme')
      await db.transaction('rw', db.items, db.meta, async () => {
        if (items.length > 0) {
          await db.items.clear()
          await db.items.bulkPut(items)
        }
        const metaEntries: Array<{ key: string; value: unknown }> = [{ key: 'itemsTimestamp', value: itemsTimestamp }]
        if (credentials !== undefined) metaEntries.push({ key: 'credentials', value: credentials })
        if (display !== undefined) metaEntries.push({ key: 'display', value: display })
        if (theme !== undefined) metaEntries.push({ key: 'theme', value: theme })
        await db.meta.bulkPut(metaEntries)
      })
      clearLegacyKeys()
    } catch (error) {
      /* v8 ignore next -- @preserve */
      logger.error('migrateFromLocalStorage failed', error)
    }
}
