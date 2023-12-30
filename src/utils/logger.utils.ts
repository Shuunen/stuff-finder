import { Logger } from 'shuutils'
import { state } from './state.utils'

/* c8 ignore start */
class CustomLogger extends Logger {

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
