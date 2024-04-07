/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-this-expressions */
/* eslint-disable functional/functional-parameters */
import { Logger, debounce } from 'shuutils'
import { delays } from '../constants'
import { state } from './state.utils'

/* c8 ignore start */
// eslint-disable-next-line no-restricted-syntax, functional/no-classes
class CustomLogger extends Logger {

  // eslint-disable-next-line unicorn/consistent-function-scoping
  public debouncedDebug = debounce((...data: readonly unknown[]) => this.debug(...data), delays.large)

  public showLog (message: string, ...data: readonly unknown[]) {
    this.info(message, ...data)
    state.message = { content: message, delay: 2000, type: 'info' }
  }

  public showError (error: unknown, ...data: readonly unknown[]) {
    const message = error instanceof Error ? error.message : String(error)
    this.error(message, ...data)
    state.message = { content: message, delay: 20_000, type: 'error' }
  }

}
/* c8 ignore stop */

export const logger = new CustomLogger()
