import { Logger, debounce } from 'shuutils'
import { state } from './state.utils'
import { delays } from '../constants'

/* c8 ignore start */
class CustomLogger extends Logger {

  // eslint-disable-next-line unicorn/consistent-function-scoping
  public debouncedDebug = debounce((...data: readonly unknown[]) => this.debug(...data), delays.large)

  public showLog (message: string, ...data: readonly unknown[]) {
    this.info(message, ...data)
    state.message = { content: message, delay: 5000, type: 'info' }
  }

  public showError (error: unknown, ...data: readonly unknown[]) {
    const message = error instanceof Error ? error.message : String(error)
    this.error(message, ...data)
    state.message = { content: message, delay: 20_000, type: 'error' }
  }

}
/* c8 ignore stop */

export const logger = new CustomLogger()
