import { logger } from '../utils/logger.utils'

export function AppError ({ code, ...properties }: { readonly code: string; readonly [key: string]: unknown }) {
  logger.debug('AppError', { code, properties })
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1>Ow no :(</h1>
      <h2>Error {code}</h2>
    </div>
  )
}
