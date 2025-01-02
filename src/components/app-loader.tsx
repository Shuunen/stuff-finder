import { logger } from '../utils/logger.utils'

export function AppLoader ({ isLoading = true, path }: Readonly<{ isLoading?: boolean, path?: string }>) {
  logger.debug('AppLoader', { isLoading, path })
  return isLoading && (
    <div class="fixed left-0 top-0 z-50 flex justify-center items-center size-full flex-col bg-white/50" data-component="loader">
      Loading...
    </div>
  )
}
