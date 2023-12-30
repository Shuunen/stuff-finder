import { logger } from '../utils/logger.utils'

export function AppItemDetails ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('AppItemDetails', { properties })
  return (
    <div data-page="item-details">
      <h1>Details for {properties.id}</h1>
    </div>
  )
}
