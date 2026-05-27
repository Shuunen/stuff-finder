import { sleep } from 'shuutils'
import type { Item } from '../types/item.types'
import { clearElementsForPrint } from '../utils/browser.utils'
import { updateItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export const waitDelay = 200

export function findItemById(id: string) {
  const item = state.items.find(one => one.$id === id)
  if (item === undefined) throw new Error(`Item with id "${id}" not found ;(`)
  return item
}

export async function handlePrintAction(item: Item, setIsPrintMode: (value: boolean) => void) {
  clearElementsForPrint()
  setIsPrintMode(true)
  await sleep(waitDelay)
  globalThis.print()
  setIsPrintMode(false)
  if (item.isPrinted) return
  item.isPrinted = true
  const result = await updateItem(item)
  logger[result.ok ? 'showSuccess' : 'showError'](`${result.ok ? 'updated' : 'failed updating'} item as printed`)
  if (!result.ok) logger.error('pushItem failed', result)
}
