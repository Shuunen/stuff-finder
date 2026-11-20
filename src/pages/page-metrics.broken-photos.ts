import { filterAsync } from 'es-toolkit'
import type { Item } from '../types/item.types'
import { itemToImageUrl } from '../utils/database.utils'
import { logger } from '../utils/logger.utils'

const maxConcurrency = 6

async function isPhotoBroken(item: Item) {
  const image = document.createElement('img')
  image.src = itemToImageUrl(item)
  try {
    await image.decode()
    return false
  } catch {
    logger.warn('photo fails to load', { id: item.$id, name: item.name })
    return true
  }
}

export function findItemsWithBrokenPhoto(items: Item[]) {
  return filterAsync(
    items.filter(item => item.photos.length > 0),
    isPhotoBroken,
    { concurrency: maxConcurrency },
  )
}
