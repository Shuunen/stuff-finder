import { logger } from '../utils/logger.utils'

export function AppLoader({ isLoading = true, path }: Readonly<{ isLoading?: boolean; path?: string }>) {
  logger.debug('AppLoader', { isLoading, path })
  return (
    isLoading && (
      <div className="fixed top-0 left-0 z-50 flex size-full flex-col items-center justify-center bg-white/50" data-component="loader">
        Loading...
      </div>
    )
  )
}
