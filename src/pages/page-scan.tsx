import { logger } from '../utils/logger.utils'

export function PageScan ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('PageScan', { properties })
  return (
    <div className="flex flex-col" data-page="scan">
      <h1>Scan</h1>
    </div>
  )
}
