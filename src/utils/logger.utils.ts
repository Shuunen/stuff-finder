import { emit, Logger } from 'shuutils'
import type { AppToasterShowEvent } from '../types'

/* c8 ignore start */
class CustomLogger extends Logger {

  public showLog (message: string, ...data: readonly unknown[]) {
    this.info(message, ...data)
    emit<AppToasterShowEvent>('app-toaster--show', { type: 'info', message })
  }

  public showError (error: unknown, ...data: readonly unknown[]) {
    const message = error instanceof Error ? error.message : String(error)
    this.error(message, ...data)
    emit<AppToasterShowEvent>('app-toaster--show', { type: 'error', message })
  }

}
/* c8 ignore stop */

export const logger = new CustomLogger()