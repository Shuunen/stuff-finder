import { logger } from '../utils/logger.utils'

export function AppSettings ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('AppSettings', { properties })
  return (
    <h1>Settings</h1>
  )
}
