import type { NavigateFunction } from 'react-router-dom'
import { logger } from './logger.utils'

let navigateFunction: NavigateFunction | undefined = undefined

/**
 * Sets the global navigation function to be used for programmatic navigation
 * @param aFunction - The navigation function to set, typically provided by a routing library but can be useful for testing or custom navigation logic.
 */
export function setNavigate(aFunction: NavigateFunction) {
  navigateFunction = aFunction
}

/**
 * Navigates to the specified path
 * @param path - The target path to navigate to.
 * @param replace - Optional. If true, replaces the current entry in the history stack instead of adding a new one. Defaults to false.
 * @param state - Optional. State to pass to the target route.
 */
export function navigate(path: string, replace = false, state?: unknown) {
  if (!navigateFunction) {
    logger.warn('navigate called before router initialization — call setNavigate() first', { path })
    return
  }
  navigateFunction(path, { replace, state })
}
