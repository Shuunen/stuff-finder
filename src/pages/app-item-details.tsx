import { logger } from '../utils/logger.utils'

export function AppItemDetails ({ id, ...properties }: { readonly id: string; readonly [key: string]: unknown }) {
  logger.debug('AppItemDetails', { properties })
  return (
    <div data-page="item-details">
      <h1>Details for {id}</h1>
    </div>
  )
}
