import { logger } from '../utils/logger.utils'

export function PageError ({ code, ...properties }: { readonly code: string; readonly [key: string]: unknown }) {
  logger.debug('PageError', { code, properties })
  return (
    <div className="flex h-screen flex-col items-center justify-center" data-page="error">
      <h1>Ow no :(</h1>
      <h2>Error {code}</h2>
    </div>
  )
}
