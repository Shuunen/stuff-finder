import { logger } from '../utils/logger.utils'

export function AppLoader({ isLoading = true, path }: Readonly<{ isLoading?: boolean; path?: string }>) {
  logger.debug('AppLoader', { isLoading, path })
  return (
    isLoading && (
      <div className="fixed top-0 left-0 z-50 flex size-full animate-fade-in flex-col items-center justify-center gap-3 bg-white/50" data-component="loader">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  )
}
