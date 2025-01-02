/* eslint-disable jsdoc/require-jsdoc */
import { Logger, debounce } from 'shuutils'
import { state } from './state.utils'

/* c8 ignore start */
// eslint-disable-next-line no-restricted-syntax
class CustomLogger extends Logger {

  // eslint-disable-next-line unicorn/consistent-function-scoping, @typescript-eslint/no-magic-numbers
  public debouncedDebug = debounce((...data: readonly unknown[]) => { this.debug(...data) }, 300)

  public showError (error: unknown, ...data: readonly unknown[]) {
    const message = error instanceof Error ? error.message : String(error)
    this.error(message, ...data)
    state.message = { content: message, delay: 20_000, type: 'error' }
  }

  public showLog (message: string, ...data: readonly unknown[]) {
    this.info(message, ...data)
    state.message = { content: message, delay: 2000, type: 'info' }
  }
}
/* c8 ignore stop */

export const logger = new CustomLogger()
