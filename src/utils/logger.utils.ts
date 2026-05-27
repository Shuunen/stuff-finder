import { Logger } from 'shuutils'

export const logger = new Logger()

/* v8 ignore start */
if (globalThis.window) {
  globalThis.window.addEventListener('unhandledrejection', event => {
    logger.error('unhandled rejection', event.reason)
  })

  globalThis.window.addEventListener('error', event => {
    logger.error('unhandled error', event.error)
  })
}
/* v8 ignore stop */
